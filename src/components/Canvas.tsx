import React, { useRef, useEffect } from 'react';
import type { CanvasFrame } from '../canvasGames/TowerDefense/types';

interface CanvasProps {
    width?: number | 'auto';
    height?: number | 'auto';
    className?: string;
    draw?: (frame: CanvasFrame) => void;
}

const Canvas = React.forwardRef<HTMLCanvasElement, CanvasProps>(function Canvas(
    { width, height, className = '', draw = () => {} },
    forwardedRef
) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!forwardedRef) {
            return;
        }

        if (typeof forwardedRef === 'function') {
            forwardedRef(canvasRef.current);

            return () => {
                forwardedRef(null);
            };
        }

        forwardedRef.current = canvasRef.current;

        return () => {
            forwardedRef.current = null;
        };
    }, [forwardedRef]);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return;
        }

        const resizeCanvas = () => {
            if (width === 'auto') {
                canvas.width = window.innerWidth;
            }
            if (height === 'auto') {
                canvas.height = window.innerHeight;
            }
        };

        let animationFrameId = 0;
        let startTime: number | null = null;
        let previousTime: number | null = null;
        let frame = 0;

        const render = (timestamp: number) => {
            startTime ??= timestamp;

            const elapsedTime = timestamp - startTime;
            const deltaTime = previousTime === null ? 0 : timestamp - previousTime;

            previousTime = timestamp;
            frame += 1;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            draw({ deltaTime, elapsedTime, frame });

            animationFrameId = window.requestAnimationFrame(render);
        };

        animationFrameId = window.requestAnimationFrame(render);

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [draw, width, height]);

    return <canvas ref={canvasRef} width={width} height={height} className={className} />;
});

export default Canvas;
