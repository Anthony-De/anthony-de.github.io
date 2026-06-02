import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import Canvas from '../../components/Canvas';
import styles from './TowerDefense.module.css';
import { TowerDefenseLogic } from './TowerDefense.ts';

export default function TowerDefense() {
  useEffect(() => {
    void TowerDefenseLogic.loadImages();
  }, []);

  return (
    <div className={styles.container}>
      <Canvas
        width={800}
        height={600}
        className={styles.canvas}
        draw={TowerDefenseLogic.draw}
        onClick={TowerDefenseLogic.startGame}
      />
      <p>
        <Link to="/">Back to Projects</Link>
      </p>
    </div>
  );
}
