"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useTransform, MotionValue } from "framer-motion";
import * as THREE from "three";
import { useTheme } from "../ThemeContext";

const ParticleBackground = ({ scrollYProgress }: { scrollYProgress: MotionValue<number> | null }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);
  const { theme } = useTheme();

  const y = scrollYProgress && typeof scrollYProgress.get === "function"
    ? useTransform(scrollYProgress, [0, 1], [0, -50])
    : 0;
  const opacity = scrollYProgress && typeof scrollYProgress.get === "function"
    ? useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 0.3, 0.2])
    : 0.5;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas element not found");
      return;
    }

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.warn("WebGL not supported, falling back to 2D canvas");
      setIsWebGLSupported(false);
      return;
    }

    let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer;
    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const starCount = 600;
      const starsGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);
      const velocities = new Float32Array(starCount * 3);

      for (let i = 0; i < starCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 2000;
        positions[i + 1] = (Math.random() - 0.5) * 2000;
        positions[i + 2] = (Math.random() - 0.5) * 2000;
        colors[i] = theme === "light" ? 0.2 : Math.random() * 0.5 + 0.5;
        colors[i + 1] = theme === "light" ? 0.2 : Math.random() * 0.5 + 0.5;
        colors[i + 2] = theme === "light" ? 0.3 : 1.0;
        velocities[i + 2] = Math.random() * 2 + 1;
      }

      starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      starsGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      const starsMaterial = new THREE.PointsMaterial({
        size: 3,
        vertexColors: true,
        transparent: true,
        opacity: typeof opacity === "number" ? opacity : opacity.get(),
      });

      const starField = new THREE.Points(starsGeometry, starsMaterial);
      scene.add(starField);

      const nebulaGeometry = new THREE.PlaneGeometry(2000, 2000);
      const nebulaTexture = new THREE.CanvasTexture(generateNebulaTexture(theme));
      const nebulaMaterial = new THREE.MeshBasicMaterial({
        map: nebulaTexture,
        transparent: true,
        opacity: 0.15,
      });
      const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
      nebula.position.z = -1000;
      scene.add(nebula);

      camera.position.z = 1000;

      const animate = () => {
        const positions = starField.geometry.attributes.position.array as Float32Array;
        const scrollSpeed = scrollYProgress && typeof scrollYProgress.get === "function" ? scrollYProgress.get() * 5 + 2 : 2;

        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 2] -= velocities[i + 2] * scrollSpeed;
          if (positions[i + 2] < -1000) {
            positions[i] = (Math.random() - 0.5) * 2000;
            positions[i + 1] = (Math.random() - 0.5) * 2000;
            positions[i + 2] = 1000;
            velocities[i + 2] = Math.random() * 2 + 1;
          }
        }

        starField.geometry.attributes.position.needsUpdate = true;
        starsMaterial.opacity = typeof opacity === "number" ? opacity : opacity.get();
        nebula.rotation.z += 0.0005;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      };

      animate();

      const handleResize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        nebulaTexture.needsUpdate = true;
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        renderer.dispose();
      };
    } catch (error) {
      console.error("Three.js initialization failed:", error);
      setIsWebGLSupported(false);
    }
  }, [scrollYProgress, opacity, theme]);

  useEffect(() => {
    if (isWebGLSupported) return;

    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas element not found");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("2D context not available");
      return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; z: number; radius: number; speed: number }[] = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        z: Math.random() * 1000,
        radius: Math.random() * 2 + 0.5,
        speed: Math.random() * 2 + 1,
      });
    }

    const animate = () => {
      ctx.fillStyle = theme === "light" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width);
      gradient.addColorStop(0, theme === "light" ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.1)");
      gradient.addColorStop(0.5, theme === "light" ? "rgba(139, 92, 246, 0.2)" : "rgba(139, 92, 246, 0.1)");
      gradient.addColorStop(1, theme === "light" ? "rgba(255, 255, 255, 0)" : "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        const perspective = 1000 / (1000 - particle.z);
        const px = (particle.x - canvas.width / 2) * perspective + canvas.width / 2;
        const py = (particle.y - canvas.height / 2) * perspective + canvas.height / 2;
        const pr = particle.radius * perspective;

        particle.z -= particle.speed * (scrollYProgress && typeof scrollYProgress.get === "function" ? scrollYProgress.get() * 2 + 0.5 : 0.5);

        if (particle.z <= 0 || particle.z > 1000 || px < 0 || px > canvas.width || py < 0 || py > canvas.height) {
          particle.x = canvas.width / 2;
          particle.y = canvas.height / 2;
          particle.z = 1000;
          particle.speed = Math.random() * 2 + 1;
        }

        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fillStyle = theme === "light" ? `rgba(0, 0, 0, ${0.5 * (1 - particle.z / 1000)})` : `rgba(255, 255, 255, ${0.5 * (1 - particle.z / 1000)})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles.forEach((particle) => {
        particle.x = canvas.width / 2;
        particle.y = canvas.height / 2;
      });
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [isWebGLSupported, scrollYProgress, theme]);

  function generateNebulaTexture(theme: "light" | "dark") {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, theme === "light" ? "rgba(59, 130, 246, 0.4)" : "rgba(59, 130, 246, 0.3)");
    gradient.addColorStop(0.5, theme === "light" ? "rgba(139, 92, 246, 0.3)" : "rgba(139, 92, 246, 0.2)");
    gradient.addColorStop(1, theme === "light" ? "rgba(255, 255, 255, 0)" : "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    return canvas;
  }

  return (
    <motion.canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ y, opacity }}
    />
  );
};

export default ParticleBackground;