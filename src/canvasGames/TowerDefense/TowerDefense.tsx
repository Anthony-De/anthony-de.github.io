import { Link } from 'react-router-dom';
import { useRef } from 'react';
import Canvas from '../../components/Canvas';
import styles from './TowerDefense.module.css';
import { TowerDefenseManager } from './TowerDefense.ts';

export default function TowerDefense() {
    const TDManager = useRef(new TowerDefenseManager()).current;

    return (
        <div className={styles.container}>
            <Canvas
                width={800}
                height={600}
                className={styles.canvas}
                draw={(ctx, frame) => TDManager.draw(ctx, frame)}
                onMouseDown={(event) => TDManager.onMouseDown(event)}
                onMouseMove={(event) => TDManager.onMouseMove(event)}
                onMouseUp={(event) => TDManager.onMouseUp(event)}
                onMouseLeave={() => TDManager.onMouseLeave()}
            />
            <p>
                <Link to="/">Back to Projects</Link>
            </p>
        </div>
    );
}
