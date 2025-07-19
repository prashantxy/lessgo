"use client";

import { useEffect, useRef } from "react";
import { motion, useTransform, MotionValue } from "framer-motion";

const ParticleBackground = ({ scrollYProgress }: { scrollYProgress: MotionValue<number> | null }) => {
  const y = scrollYProgress && typeof scrollYProgress.get === "function"
    ? useTransform(scrollYProgress, [0, 1], [0, -100])
    : 0;
  const opacity = scrollYProgress && typeof scrollYProgress.get === "function"
    ? useTransform(scrollYProgress, [0, 0.5, 1], [0.2, 0.1, 0.05])
    : 0.2;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Particle logic (simplified example)
    const particles: { x: number; y: number; size: number; speed: number }[] = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 5 + 1,
        speed: Math.random() * 0.5 + 0.1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;

      particles.forEach((particle) => {
        particle.y += particle.speed;
        if (particle.y > canvas.height) particle.y = 0;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [opacity]);

  return (
    <motion.canvas
      ref={canvasRef}
      className="absolute inset-0 z-0"
      style={{ y }}
    />
  );
};

export default ParticleBackground;