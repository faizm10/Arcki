"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import "./glow.css";

export default function Home() {
  const [currentSection, setCurrentSection] = useState(0);
  const [photoCount, setPhotoCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const heroSectionRef = useRef<HTMLElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const sectionId = parseInt(entry.target.getAttribute('data-section-id') || '0');
        setCurrentSection(sectionId);

        // Trigger counting animation when hero section is in view
        if (sectionId === 0 && !hasAnimated) {
          setHasAnimated(true);
          animateCount();
        }
      }
    });
  };

  // Detect initial section on mount/remount
  useEffect(() => {
    const detectCurrentSection = () => {
      const sections = document.querySelectorAll('section[data-section-id]');
      const windowHeight = window.innerHeight;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const sectionMiddle = rect.top + rect.height / 2;

        // Check if section middle is in viewport center area
        if (sectionMiddle >= 0 && sectionMiddle <= windowHeight) {
          const sectionId = parseInt(section.getAttribute('data-section-id') || '0');
          setCurrentSection(sectionId);
        }
      });
    };

    // Run detection after a short delay to ensure DOM is ready
    const timer = setTimeout(detectCurrentSection, 100);

    return () => clearTimeout(timer);
  }, []); // Only run on mount

  const animateCount = () => {
    const targetNumber = 47000; // Approximate number of buildings in San Francisco
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = targetNumber / steps;
    let currentCount = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      currentCount = Math.min(Math.floor(increment * step), targetNumber);
      setPhotoCount(currentCount);

      if (step >= steps) {
        clearInterval(timer);
        setPhotoCount(targetNumber);
      }
    }, duration / steps);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.3, // Trigger when section is 30% visible
      rootMargin: '-80px 0px' // Adjust for navbar height
    });

    // Observe all sections
    document.querySelectorAll('section[data-section-id]').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, [hasAnimated]); // Include hasAnimated to prevent stale closure

  // Initialize Mapbox map (once)
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    if (!mapboxgl.accessToken) {
      console.warn("Mapbox token not found. Please set NEXT_PUBLIC_MAPBOX_TOKEN environment variable.");
      return;
    }

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/standard", // Standard style with 3D buildings
      center: [-122.4194, 37.7749], // San Francisco
      zoom: 13,
      pitch: 50,
      bearing: -17.6,
      interactive: false, // Non-interactive background
      attributionControl: false,
    });

    // Wait for map to load before applying styles
    mapRef.current.on("style.load", () => {
      if (mapRef.current) {
        mapRef.current.setConfigProperty("basemap", "showPlaceLabels", true);
        mapRef.current.setConfigProperty("basemap", "showRoadLabels", true);
        mapRef.current.setConfigProperty("basemap", "lightPreset", "dusk");
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Only run once on mount

  // Adjust map based on current section for parallax effect
  useEffect(() => {
    if (!mapRef.current) return;

    const zoom = 13 + currentSection * 0.3;
    const pitch = 50 + currentSection * 3;

    mapRef.current.easeTo({
      zoom: Math.min(zoom, 15),
      pitch: Math.min(pitch, 65),
      duration: 1000,
    });
  }, [currentSection]);

  return (
    <div className="relative h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth">
      {/* Background Map - San Francisco */}
      <div className="fixed inset-0 z-0">
        <div ref={mapContainerRef} className="w-full h-full" />
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 pointer-events-none" />
        {/* Vignette Effect */}
        <div className="vignette" />
      </div>

      {/* Navigation */}
      {/* <Navbar currentSection={currentSection} /> */}

      {/* Hero Section with Earth */}
    <section ref={heroSectionRef} data-section-id="0" className="relative h-screen snap-start">
        <div className="absolute inset-0 pointer-events-none" />
        <div className="absolute inset-0 z-50 flex items-center">
          <div className="container mx-auto">
            <div className="max-w-4xl px-4">
              <div className="mb-8 inline-flex items-center gap-2 border-l border-cyan-500/30 pl-4">
                <span className="text-sm font-medium uppercase tracking-widest text-zinc-400">San Francisco City Editor</span>
              </div>
              <h1 className="text-7xl font-bold mb-6 leading-tight text-left relative will-change-transform">
                <span className="text-white font-sans [text-shadow:0_0_10px_#fff,0_0_20px_#00ffff] animate-[textGlow_3s_ease-in-out_infinite_alternate] will-change-transform">
                  Reimagine San Francisco.
                </span>
                <br />
                <span className="text-white/70 font-sans [text-shadow:0_0_10px_#fff,0_0_20px_#00ffff] animate-[textGlow_3s_ease-in-out_infinite_alternate] will-change-transform">
                  One Building at a Time.
                </span>
              </h1>
              <p className="text-[1.4rem] text-white/80 text-left max-w-2xl mb-2">
                Redesign SF's skyline with AI-powered 3D models. Edit buildings in real-time, visualize changes, and explore new urban possibilities.
              </p>
              <p className="text-lg text-white/60 text-left max-w-xl mb-8">
                Access to <span className="font-bold text-white">{formatNumber(photoCount)}</span>+ buildings across <span className="font-bold text-white">43</span> neighborhoods. Powered by AI and real-time rendering.
              </p>
              <div className="mt-8 flex gap-4">
                <Button size="lg" className="bg-cyan-500 text-black hover:bg-cyan-400 font-semibold" asChild>
                  <a href="/map">Explore San Francisco</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" data-section-id="1" className="relative h-screen snap-start">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-white mb-16 text-center [text-shadow:0_0_5px_rgba(255,255,255,0.3)]">
              Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {/* SF Neighborhoods */}
              <div className="flex flex-col bg-white/5 rounded-lg backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all p-8">
                <h3 className="text-2xl font-bold mb-4 text-white text-center">43 Neighborhoods</h3>
                <p className="text-base text-white/80 leading-relaxed text-center mb-6">
                  Explore from the Mission to Chinatown, SoMa to Pacific Heights. Every iconic SF neighborhood is fully mapped and editable in stunning 3D detail.
                </p>
                <div className="w-full flex items-center justify-center mt-auto">
                  <div className="w-full aspect-4/3 overflow-hidden rounded-lg bg-white/5 border border-white/10">
                    <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">Neighborhood Map</div>
                  </div>
                </div>
              </div>

              {/* AI-Powered 3D Generation */}
              <div className="flex flex-col bg-white/5 rounded-lg backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all p-8">
                <h3 className="text-2xl font-bold mb-4 text-white text-center">AI Building Generator</h3>
                <p className="text-base text-white/80 leading-relaxed text-center mb-6">
                  Generate custom buildings from text prompts. Replace existing structures or add new ones anywhere in SF using GPU-accelerated TripoSR rendering.
                </p>
                <div className="w-full flex items-center justify-center mt-auto">
                  <div className="w-full aspect-4/3 overflow-hidden rounded-lg bg-white/5 border border-white/10">
                    <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">AI Generation</div>
                  </div>
                </div>
              </div>

              {/* Real-time Editing */}
              <div className="flex flex-col bg-white/5 rounded-lg backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all p-8">
                <h3 className="text-2xl font-bold mb-4 text-white text-center">Instant Visualization</h3>
                <p className="text-base text-white/80 leading-relaxed text-center mb-6">
                  See your changes instantly. Draw areas to remove buildings, insert new models, and watch SF transform in real-time. Perfect for urban planners and architects.
                </p>
                <div className="w-full flex items-center justify-center mt-auto">
                  <div className="w-full aspect-4/3 overflow-hidden rounded-lg bg-white/5 border border-white/10">
                    <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">Real-time Preview</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" data-section-id="2" className="relative h-screen snap-start">
        <div className="absolute inset-0 flex items-center justify-end pr-12">
          <div className="max-w-2xl bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20 space-y-4 overflow-y-auto max-h-[80vh]">
            <h2 className="text-2xl font-bold text-white mb-4">
              About <span className="text-cyan-400 [text-shadow:0_0_10px_#00ffff]">San Francisco Delta</span>
            </h2>

            {/* Project Overview */}
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                Redesigning SF
              </h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Built for DeltaHacks 12, this platform lets you reimagine San Francisco's skyline. Edit every building, test new urban designs, and visualize the future of the City by the Bay.
              </p>
            </div>

            {/* SF Stats */}
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                San Francisco by the Numbers
              </h3>
              <p className="text-sm text-white/80 leading-relaxed mb-3">
                <span className="font-semibold text-white">47,000+</span> buildings | <span className="font-semibold text-white">43</span> neighborhoods | <span className="font-semibold text-white">49</span> sq miles
              </p>
              <p className="text-sm text-white/80 leading-relaxed">
                Every structure from the Transamerica Pyramid to Victorian houses in the Haight is editable and ready for your redesign.
              </p>
            </div>

            {/* Technology */}
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                Powered by Modern Tech
              </h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Mapbox GL for precise SF mapping, TripoSR for AI building generation, Modal's GPU infrastructure for real-time rendering. Built with Next.js and Three.js.
              </p>
            </div>

            <div className="flex gap-4 mt-8">
              <div className="flex-1 bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-3xl font-bold text-cyan-400 mb-2">47K+</div>
                <p className="text-white/60 text-sm">Buildings</p>
              </div>
              <div className="flex-1 bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-3xl font-bold text-cyan-400 mb-2">43</div>
                <p className="text-white/60 text-sm">Neighborhoods</p>
              </div>
              <div className="flex-1 bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-3xl font-bold text-cyan-400 mb-2">100%</div>
                <p className="text-white/60 text-sm">Editable</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech" data-section-id="3" className="relative h-screen snap-start">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10">
          <h2 className="text-5xl font-bold text-white [text-shadow:0_0_5px_rgba(255,255,255,0.3)] mb-8">
            Tech Stack
          </h2>
          <div className="max-w-5xl w-full px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10 text-center">
              <div className="text-2xl font-bold text-white mb-2">Next.js</div>
              <p className="text-white/60 text-sm">React Framework</p>
            </div>
            <div className="bg-white/5 rounded-lg p-6 border border-white/10 text-center">
              <div className="text-2xl font-bold text-white mb-2">Mapbox</div>
              <p className="text-white/60 text-sm">3D Mapping</p>
            </div>
            <div className="bg-white/5 rounded-lg p-6 border border-white/10 text-center">
              <div className="text-2xl font-bold text-white mb-2">Three.js</div>
              <p className="text-white/60 text-sm">3D Rendering</p>
            </div>
            <div className="bg-white/5 rounded-lg p-6 border border-white/10 text-center">
              <div className="text-2xl font-bold text-white mb-2">Modal</div>
              <p className="text-white/60 text-sm">GPU Infrastructure</p>
            </div>
            <div className="bg-white/5 rounded-lg p-6 border border-white/10 text-center">
              <div className="text-2xl font-bold text-white mb-2">TripoSR</div>
              <p className="text-white/60 text-sm">AI 3D Generation</p>
            </div>
            <div className="bg-white/5 rounded-lg p-6 border border-white/10 text-center">
              <div className="text-2xl font-bold text-white mb-2">FastAPI</div>
              <p className="text-white/60 text-sm">Backend API</p>
            </div>
            <div className="bg-white/5 rounded-lg p-6 border border-white/10 text-center">
              <div className="text-2xl font-bold text-white mb-2">TypeScript</div>
              <p className="text-white/60 text-sm">Type Safety</p>
            </div>
            <div className="bg-white/5 rounded-lg p-6 border border-white/10 text-center">
              <div className="text-2xl font-bold text-white mb-2">Tailwind</div>
              <p className="text-white/60 text-sm">Styling</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}