import { useEffect, useRef } from 'react';
import Canvas from '../../components/Canvas';
import Game2048Manager from './Game2048';
import styles from './Game2048.module.css';

export default function Game2048() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const game2048Manager = useRef<Game2048Manager | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas || game2048Manager.current) {
            return;
        }

        const manager = new Game2048Manager(canvas);
        game2048Manager.current = manager;

        if (!manager.assetsLoaded) {
            void (async () => {
                await manager.loadAssets();
            })();
        }

        return () => {
            manager.destroy();
            game2048Manager.current = null;
        };
    }, []);
    return (
        <div className={styles.container}>
            <Canvas
                ref={canvasRef}
                width="auto"
                height="auto"
                className={styles.canvas}
                draw={(frame) => game2048Manager.current?.draw(frame)}
            />
        </div>
    );
}
