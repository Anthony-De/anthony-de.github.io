import { useEffect, useRef } from 'react';
import Canvas from '../../components/Canvas';
import styles from './TowerDefense.module.css';
import { TowerDefenseManager } from './TowerDefense.ts';

export default function TowerDefense() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const TDManager = useRef<TowerDefenseManager | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas || TDManager.current) {
            return;
        }

        const manager = new TowerDefenseManager(canvas);
        TDManager.current = manager;

        if (!manager.assetsLoaded) {
            void (async () => {
                await manager.loadAssets();
            })();
        }

        return () => {
            manager.destroy();
            TDManager.current = null;
        };
    }, []);

    return (
        <div className={styles.container}>
            <Canvas
                ref={canvasRef}
                width="auto"
                height="auto"
                className={styles.canvas}
                draw={(frame) => TDManager.current?.draw(frame)}
            />
        </div>
    );
}
