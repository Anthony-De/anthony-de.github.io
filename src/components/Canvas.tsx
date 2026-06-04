import React, { useRef, useEffect } from 'react';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../constants';
import type { CanvasFrame } from '../canvasGames/TowerDefense/types';

interface CanvasProps {
    width?: number;
    height?: number;
    className?: string;
    draw?: (ctx: CanvasRenderingContext2D, frame: CanvasFrame) => void;
    onClick?: React.MouseEventHandler<HTMLCanvasElement>;
    onMouseDown?: React.MouseEventHandler<HTMLCanvasElement>;
    onMouseMove?: React.MouseEventHandler<HTMLCanvasElement>;
    onMouseUp?: React.MouseEventHandler<HTMLCanvasElement>;
    onMouseLeave?: React.MouseEventHandler<HTMLCanvasElement>;
}

const Canvas: React.FC<CanvasProps> = ({
    width = CANVAS_WIDTH,
    height = CANVAS_HEIGHT,
    className = '',
    draw = () => {},
    onClick,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return;
        }

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
            draw(ctx, { deltaTime, elapsedTime, frame });

            animationFrameId = window.requestAnimationFrame(render);
        };

        animationFrameId = window.requestAnimationFrame(render);

        return () => {
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [draw]);

    return (
        <canvas
            id=""
            ref={canvasRef}
            width={width}
            height={height}
            className={className}
            onClick={onClick}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
        />
    );
};

export default Canvas;
