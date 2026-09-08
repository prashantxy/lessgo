"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * NASA "Black Marble" night-lights sphere. City lights read as nodes.
 * Renders once, spins slowly, pauses when off-screen or on reduced-motion,
 * and disposes everything on unmount.
 */
export default function Globe() {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 3.15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    const night = loader.load("/textures/earth_lights_2048.png");
    night.colorSpace = THREE.SRGBColorSpace;
    const land = loader.load("/textures/earth_specular_2048.jpg");

    const geo = new THREE.SphereGeometry(1, 96, 96);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x0c0f14),
      roughness: 1,
      metalness: 0,
      emissive: new THREE.Color(0xf2a93b),
      emissiveMap: night,
      emissiveIntensity: 1.35,
      bumpMap: land,
      bumpScale: 0.015,
    });
    const globe = new THREE.Mesh(geo, mat);
    globe.rotation.z = 0.41;
    globe.rotation.y = -1.1;
    scene.add(globe);

    // Rim of cool light so the dark limb doesn't vanish into the page.
    const rim = new THREE.DirectionalLight(0x8ea6c8, 1.1);
    rim.position.set(-2.4, 1.2, 1.6);
    scene.add(rim);
    scene.add(new THREE.AmbientLight(0x1a2230, 0.6));

    const atmGeo = new THREE.SphereGeometry(1.055, 64, 64);
    const atmMat = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      uniforms: { uColor: { value: new THREE.Color(0x2f4258) } },
      vertexShader: `
        varying vec3 vN;
        void main(){ vN = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        varying vec3 vN; uniform vec3 uColor;
        void main(){ float i = pow(0.62 - dot(vN, vec3(0.0,0.0,1.0)), 2.2);
          gl_FragColor = vec4(uColor, clamp(i,0.0,1.0) * 0.5); }`,
    });
    scene.add(new THREE.Mesh(atmGeo, atmMat));

    const resize = () => {
      const r = el.getBoundingClientRect();
      const size = Math.max(1, Math.min(r.width, r.height));
      renderer.setSize(size, size, false);
      renderer.domElement.style.width = `${size}px`;
      renderer.domElement.style.height = `${size}px`;
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
      threshold: 0.01,
    });
    io.observe(el);

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!visible) return;
      if (!reduced) globe.rotation.y += dt * 0.045;
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);
    if (reduced) renderer.render(scene, camera);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      atmGeo.dispose();
      atmMat.dispose();
      night.dispose();
      land.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mount} className="globe-mount" aria-hidden="true" />;
}
