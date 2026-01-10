"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Toolbar } from "@/components/Toolbar";
import { BuildingDetailsPanel } from "@/components/BuildingDetailsPanel";

interface SelectedBuilding {
  id: string | number;
  name: string;
  address: string;
  coordinates: [number, number];
  polygon: GeoJSON.Polygon | null;
}

async function reverseGeocode(
  lng: number,
  lat: number,
  accessToken: string
): Promise<{ name: string; address: string }> {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}&types=address,poi`
    );
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const name = feature.text || "Building";
      const address = feature.place_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      return { name, address };
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }

  return {
    name: "Building",
    address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
  };
}

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [activeTool, setActiveTool] = useState<"select" | "teleport" | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<SelectedBuilding | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const activeToolRef = useRef(activeTool);
  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  const clearSelection = useCallback(() => {
    setSelectedBuilding(null);
    if (map.current) {
      const source = map.current.getSource("selected-building") as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({
          type: "FeatureCollection",
          features: [],
        });
      }
    }
  }, []);

  const handleBuildingClick = useCallback(
    async (e: mapboxgl.MapMouseEvent) => {
      if (activeToolRef.current !== "select" || !map.current) return;

      const lng = e.lngLat.lng;
      const lat = e.lngLat.lat;

      // Query all features at click point
      const features = map.current.queryRenderedFeatures(e.point);

      // Debug: log what features are found
      console.log("Clicked features:", features.map(f => ({
        layer: f.layer?.id,
        sourceLayer: f.sourceLayer,
        type: f.layer?.type,
        geometry: f.geometry?.type
      })));

      // Find building features - try multiple detection methods
      const buildingFeature = features.find(
        (f) =>
          f.layer?.id?.includes("building") ||
          f.sourceLayer?.includes("building") ||
          f.layer?.type === "fill-extrusion" ||
          f.layer?.type === "model" ||
          f.layer?.id?.includes("3d")
      );

      // Set initial selection with loading state
      setIsLoadingAddress(true);
      const featureId = buildingFeature?.id || `${lng}-${lat}-${Date.now()}`;

      setSelectedBuilding({
        id: featureId,
        name: "Loading...",
        address: "Loading...",
        coordinates: [lng, lat],
        polygon: null,
      });

      // Get address via reverse geocoding
      const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
      const { name, address } = await reverseGeocode(lng, lat, accessToken);

      // Extract polygon from feature geometry if available
      let polygon: GeoJSON.Polygon | null = null;
      if (buildingFeature) {
        if (
          buildingFeature.geometry.type === "Polygon" ||
          buildingFeature.geometry.type === "MultiPolygon"
        ) {
          if (buildingFeature.geometry.type === "Polygon") {
            polygon = buildingFeature.geometry as GeoJSON.Polygon;
          } else {
            // For MultiPolygon, use the first polygon
            const multiPoly = buildingFeature.geometry as GeoJSON.MultiPolygon;
            polygon = {
              type: "Polygon",
              coordinates: multiPoly.coordinates[0],
            };
          }
        }
      }

      // Update the highlight layer if we have a polygon
      if (map.current && polygon) {
        const source = map.current.getSource("selected-building") as mapboxgl.GeoJSONSource;
        if (source) {
          source.setData({
            type: "Feature",
            geometry: polygon,
            properties: {},
          });
        }
      }

      setSelectedBuilding({
        id: featureId,
        name,
        address,
        coordinates: [lng, lat],
        polygon,
      });
      setIsLoadingAddress(false);
    },
    []
  );

  useEffect(() => {
    if (map.current) return; // initialize map only once

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        // Use Mapbox Standard style for clip layer support
        style: "mapbox://styles/mapbox/standard",
        projection: { name: "globe" },
        center: [-74.006, 40.7128], // New York City starting point
        zoom: 15.5,
        pitch: 60,
        bearing: -17.6, // Rotate the map
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Configure 3D buildings when style loads
      map.current.on("style.load", () => {
        if (map.current) {
          // Enable 3D buildings in the Standard style
          map.current.setConfigProperty("basemap", "showPlaceLabels", true);
          map.current.setConfigProperty("basemap", "showRoadLabels", true);
          map.current.setConfigProperty("basemap", "showPointOfInterestLabels", true);
          map.current.setConfigProperty("basemap", "lightPreset", "dusk");

          // Add source for selected building highlight
          map.current.addSource("selected-building", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [],
            },
          });

          // Add glow effect layer (wider, more transparent)
          map.current.addLayer({
            id: "building-outline-glow",
            type: "line",
            source: "selected-building",
            paint: {
              "line-color": "#00ffff",
              "line-width": 8,
              "line-opacity": 0.3,
              "line-blur": 4,
            },
          });

          // Add main outline layer
          map.current.addLayer({
            id: "building-outline",
            type: "line",
            source: "selected-building",
            paint: {
              "line-color": "#00ffff",
              "line-width": 3,
              "line-opacity": 0.9,
            },
          });

          // Add fill layer with low opacity
          map.current.addLayer({
            id: "building-fill",
            type: "fill",
            source: "selected-building",
            paint: {
              "fill-color": "#00ffff",
              "fill-opacity": 0.1,
            },
          });
        }
      });

      // Add click handler for building selection
      map.current.on("click", handleBuildingClick);
    }
  }, [handleBuildingClick]);

  // Update cursor based on active tool
  useEffect(() => {
    if (map.current) {
      map.current.getCanvas().style.cursor = activeTool === "select" ? "pointer" : "";
    }
  }, [activeTool]);

  return (
    <div className="relative h-screen w-full">
      <Toolbar activeTool={activeTool} setActiveTool={setActiveTool} />
      {selectedBuilding && (
        <BuildingDetailsPanel
          selectedBuilding={selectedBuilding}
          onClose={clearSelection}
          isLoading={isLoadingAddress}
          accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""}
        />
      )}
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
}
