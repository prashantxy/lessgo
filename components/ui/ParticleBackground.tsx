"use client";

import { useEffect, useRef } from "react";
import { motion, useTransform, MotionValue } from "framer-motion";
import { useTheme } from "../ThemeContext";

const ParticleBackground = ({ scrollYProgress }: { scrollYProgress: MotionValue<number> | null }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  // Scroll-based animations
  const y = scrollYProgress && typeof scrollYProgress.get === "function"
    ? useTransform(scrollYProgress, [0, 1], [0, -30])
    : 0;
  const opacity = scrollYProgress && typeof scrollYProgress.get === "function"
    ? useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 0.4, 0.3])
    : 0.6;

  useEffect(() => {
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

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Particle setup
    const particleCount = 120;
    const particles: { x: number; y: number; z: number; radius: number; speed: number }[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000,
        radius: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 1 + 0.3,
      });
    }

    // Nebula gradient
    const drawNebula = () => {
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) / 1.5
      );
      if (theme === "dark") {
        gradient.addColorStop(0, "rgba(50, 100, 200, 0.25)");
        gradient.addColorStop(0.5, "rgba(100, 50, 200, 0.15)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      } else {
        gradient.addColorStop(0, "rgba(100, 150, 255, 0.3)");
        gradient.addColorStop(0.5, "rgba(150, 100, 255, 0.2)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    // Animation loop
    const animate = () => {
      ctx.fillStyle = theme === "dark" ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawNebula();

      const scrollSpeed = scrollYProgress && typeof scrollYProgress.get === "function"
        ? scrollYProgress.get() * 1.5 + 0.3
        : 0.3;

      particles.forEach((particle) => {
        const perspective = 1000 / (1000 - particle.z);
        const px = (particle.x - canvas.width / 2) * perspective + canvas.width / 2;
        const py = (particle.y - canvas.height / 2) * perspective + canvas.height / 2;
        const pr = particle.radius * perspective;

        particle.z -= particle.speed * scrollSpeed;
        if (particle.z <= 0 || particle.z > 1000 || px < 0 || px > canvas.width || py < 0 || py > canvas.height) {
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
          particle.z = 1000;
          particle.speed = Math.random() * 1 + 0.3;
        }

        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fillStyle = theme === "dark"
          ? `rgba(255, 255, 255, ${0.6 * (1 - particle.z / 1000)})`
          : `rgba(0, 0, 0, ${0.6 * (1 - particle.z / 1000)})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles.forEach((particle) => {
        particle.x = Math.random() * canvas.width;
        particle.y = Math.random() * canvas.height;
      });
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [scrollYProgress, theme]);

  return (
    <motion.canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-1] pointer-events-none"
      style={{ y, opacity }}
    />
  );
};

export default ParticleBackground;