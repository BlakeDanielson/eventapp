import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedBackground({ children, className }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particles
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      hue: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        hue: Math.random() * 360,
      });
    }

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.01;
      
      // Clear canvas with gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, `hsla(${220 + Math.sin(time) * 20}, 20%, 8%, 1)`);
      gradient.addColorStop(0.5, `hsla(${240 + Math.cos(time * 0.7) * 30}, 25%, 12%, 1)`);
      gradient.addColorStop(1, `hsla(${180 + Math.sin(time * 0.5) * 40}, 15%, 6%, 1)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle with glow
        const glowSize = particle.size * 3;
        
        // Outer glow
        ctx.beginPath();
        const glowGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, glowSize
        );
        glowGradient.addColorStop(0, `hsla(${particle.hue}, 70%, 60%, ${particle.opacity * 0.3})`);
        glowGradient.addColorStop(1, `hsla(${particle.hue}, 70%, 60%, 0)`);
        ctx.fillStyle = glowGradient;
        ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Inner particle
        ctx.beginPath();
        ctx.fillStyle = `hsla(${particle.hue}, 80%, 70%, ${particle.opacity})`;
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby particles
        particles.forEach((otherParticle, otherIndex) => {
          if (index !== otherIndex) {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              ctx.beginPath();
              ctx.strokeStyle = `hsla(${(particle.hue + otherParticle.hue) / 2}, 60%, 50%, ${0.1 * (1 - distance / 100)})`;
              ctx.lineWidth = 0.5;
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.stroke();
            }
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <div className={cn("relative min-h-screen overflow-hidden", className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: 'transparent' }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
} 