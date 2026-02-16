"use client";

import { useEffect, useRef } from "react";

export default function BackgroundGradientAnimation() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        let time = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight * 5; // cover full scroll area
        };

        const draw = () => {
            time += 0.002;
            const w = canvas.width;
            const h = canvas.height;

            ctx.clearRect(0, 0, w, h);

            // Orb 1 — red, slow drift
            const x1 = w * 0.3 + Math.sin(time * 0.7) * w * 0.15;
            const y1 = h * 0.15 + Math.cos(time * 0.5) * h * 0.05;
            const g1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, w * 0.35);
            g1.addColorStop(0, "rgba(239, 68, 68, 0.04)");
            g1.addColorStop(0.5, "rgba(239, 68, 68, 0.015)");
            g1.addColorStop(1, "transparent");
            ctx.fillStyle = g1;
            ctx.fillRect(0, 0, w, h);

            // Orb 2 — indigo, opposite phase
            const x2 = w * 0.7 + Math.cos(time * 0.6) * w * 0.12;
            const y2 = h * 0.35 + Math.sin(time * 0.4) * h * 0.06;
            const g2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, w * 0.3);
            g2.addColorStop(0, "rgba(99, 102, 241, 0.04)");
            g2.addColorStop(0.5, "rgba(99, 102, 241, 0.015)");
            g2.addColorStop(1, "transparent");
            ctx.fillStyle = g2;
            ctx.fillRect(0, 0, w, h);

            // Orb 3 — red-purple blend, deep
            const x3 = w * 0.5 + Math.sin(time * 0.3) * w * 0.2;
            const y3 = h * 0.55 + Math.cos(time * 0.35) * h * 0.04;
            const g3 = ctx.createRadialGradient(x3, y3, 0, x3, y3, w * 0.25);
            g3.addColorStop(0, "rgba(239, 68, 68, 0.03)");
            g3.addColorStop(0.4, "rgba(99, 102, 241, 0.02)");
            g3.addColorStop(1, "transparent");
            ctx.fillStyle = g3;
            ctx.fillRect(0, 0, w, h);

            // Orb 4 — subtle indigo, lower area
            const x4 = w * 0.4 + Math.cos(time * 0.5) * w * 0.1;
            const y4 = h * 0.75 + Math.sin(time * 0.45) * h * 0.03;
            const g4 = ctx.createRadialGradient(x4, y4, 0, x4, y4, w * 0.2);
            g4.addColorStop(0, "rgba(99, 102, 241, 0.03)");
            g4.addColorStop(1, "transparent");
            ctx.fillStyle = g4;
            ctx.fillRect(0, 0, w, h);

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

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
        />
    );
}
