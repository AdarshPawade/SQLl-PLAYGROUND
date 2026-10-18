import React, { useEffect, useRef } from 'react';

/**
 * Global Ambient Fluid Canvas
 * Renders chromatic fluid metaballs and light refractions in the background
 */
export default function LiquidCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Chromatic Fluid Blobs calibrated for white canvas
    const blobs = [
      { x: width * 0.25, y: height * 0.3, r: 280, vx: 0.3, vy: 0.2, color: 'rgba(16, 185, 129, 0.18)' },  // Emerald
      { x: width * 0.78, y: height * 0.4, r: 320, vx: -0.24, vy: 0.28, color: 'rgba(6, 182, 212, 0.18)' },   // Cyan
      { x: width * 0.52, y: height * 0.7, r: 290, vx: 0.26, vy: -0.26, color: 'rgba(99, 102, 241, 0.15)' }, // Indigo
      { x: width * 0.3, y: height * 0.85, r: 240, vx: -0.2, vy: -0.18, color: 'rgba(236, 72, 153, 0.14)' },  // Pink
      { x: width * 0.85, y: height * 0.8, r: 250, vx: 0.18, vy: -0.22, color: 'rgba(245, 158, 11, 0.14)' }   // Amber
    ];

    let time = 0;
    const render = () => {
      time += 0.012;
      ctx.clearRect(0, 0, width, height);

      blobs.forEach((b, i) => {
        b.x += b.vx + Math.sin(time + i * 1.4) * 0.55;
        b.y += b.vy + Math.cos(time + i * 1.8) * 0.55;

        if (b.x < -80) b.vx = Math.abs(b.vx);
        if (b.x > width + 80) b.vx = -Math.abs(b.vx);
        if (b.y < -80) b.vy = Math.abs(b.vy);
        if (b.y > height + 80) b.vy = -Math.abs(b.vy);

        const gradient = ctx.createRadialGradient(b.x, b.y, b.r * 0.1, b.x, b.y, b.r);
        gradient.addColorStop(0, b.color);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="liquid-ambient-canvas" />;
}
