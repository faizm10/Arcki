"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function LandingGlobe() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0.3, 3); // Zoomed out

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);

    mountRef.current.appendChild(renderer.domElement);

    // Manual rotation variables
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    const rotationSpeed = 0.005;

    const textureLoader = new THREE.TextureLoader();
    const globeTexture = textureLoader.load("/landingtexture.jpg");

    // Globe group for rotation
    const globeGroup = new THREE.Group();
    globeGroup.position.set(0, -1.2, 0); // Shift globe down
    scene.add(globeGroup);

    camera.lookAt(0, -0.5, 0);

    // Create textured Earth sphere
    const earthGeo = new THREE.SphereGeometry(1.3, 64, 64);
    const earthMat = new THREE.MeshBasicMaterial({
      map: globeTexture,
      transparent: false,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // Create stars
    const createStars = (count: number) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        const radius = 30 + Math.random() * 70;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.3,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
      });

      return new THREE.Points(geometry, material);
    };

    const stars = createStars(1500);
    scene.add(stars);

    function animate() {
      // Passive rotation of stars
      stars.rotation.y += 0.0001;

      // Passive rotation of globe when not dragging
      if (!isDragging) {
        globeGroup.rotation.y += 0.002;
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    function onMouseMove(evt: MouseEvent) {
      if (isDragging) {
        const deltaX = evt.clientX - previousMousePosition.x;
        const deltaY = evt.clientY - previousMousePosition.y;

        globeGroup.rotation.y += deltaX * rotationSpeed;
        globeGroup.rotation.x += deltaY * rotationSpeed;

        previousMousePosition = { x: evt.clientX, y: evt.clientY };
      }
    }

    function onMouseDown(evt: MouseEvent) {
      isDragging = true;
      previousMousePosition = { x: evt.clientX, y: evt.clientY };
      if (mountRef.current) {
        mountRef.current.style.cursor = 'grabbing';
      }
    }

    function onMouseUp() {
      isDragging = false;
      if (mountRef.current) {
        mountRef.current.style.cursor = 'grab';
      }
    }

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    if (mountRef.current) {
      mountRef.current.style.cursor = 'grab';
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", onResize);

      const mount = mountRef.current;
      if (mount && mount.contains(renderer.domElement)) {
        mount.style.cursor = 'default';
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100vw", height: "100vh", position: "fixed", top: 0, left: 0 }} />;
}
