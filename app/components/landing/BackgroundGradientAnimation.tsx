"use client";

import { useEffect, useRef, useState } from "react";

export default function BackgroundGradientAnimation() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        let time = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight * 5; // Cover scroll area
        };

        const draw = () => {
            time += 0.0015;
            const w = canvas.width;
            const h = canvas.height;

            ctx.clearRect(0, 0, w, h);

            // Subtle base dark mesh (monochrome)
            const cx = w * 0.5;
            const cy = h * 0.15; // Focus glow on top

            const g1 = ctx.createRadialGradient(
                cx + Math.sin(time) * 100, cy + Math.cos(time * 0.8) * 100, 0,
                cx, cy, w * 0.8
            );

            // Deep dark greys for a premium enterprise feel
            g1.addColorStop(0, "rgba(255, 255, 255, 0.02)");
            g1.addColorStop(0.3, "rgba(255, 255, 255, 0.005)");
            g1.addColorStop(1, "transparent");

            ctx.fillStyle = g1;
            ctx.fillRect(0, 0, w, h);

            // Optional: Draw a very faint vertical grid line
            ctx.beginPath();
            ctx.moveTo(w * 0.2, 0);
            ctx.lineTo(w * 0.2, h);
            ctx.moveTo(w * 0.8, 0);
            ctx.lineTo(w * 0.8, h);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
            ctx.lineWidth = 1;
            ctx.stroke();

            animationId = requestAnimationFrame(draw);
        };

        resize();
        window.addEventListener("resize", resize);
        draw();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    if (!isMounted) return null;

    return (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
            />
            {/* CSS Noise Overlay */}
            <div
                className="absolute inset-0 opacity-[0.25]"
                style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")"
                }}
            />
        </div>
    );
}
