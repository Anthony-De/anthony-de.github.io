import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants';
import type { CanvasFrame } from '../../components/Canvas';
import mainScreenImage from './assets/MainScreen.png';

export class TowerDefenseLogic {
  static screen: 'title' | 'game' = 'title';

  private static readonly assetsImage = new Image();

  static loadImages(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.assetsImage.onload = () => resolve();
      this.assetsImage.onerror = () =>
        reject(new Error('Failed to load title screen image'));
      this.assetsImage.src = mainScreenImage;
    });
  }

  static startGame(): void {
    TowerDefenseLogic.screen = 'game';
  }

  static TitleScreen(ctx: CanvasRenderingContext2D, _frame: CanvasFrame): void {
    ctx.drawImage(this.assetsImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    /*ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = '#102022';
    ctx.lineWidth = 4;

    ctx.fillStyle = '#102022';
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';

    const lineTop = CANVAS_HEIGHT / 3;
    const lineBottom = CANVAS_HEIGHT;

    ctx.beginPath();
    ctx.moveTo(0, lineTop);
    ctx.lineTo(CANVAS_WIDTH, lineTop);
    ctx.stroke();

    ctx.fillText('Spring', CANVAS_WIDTH / 8, (CANVAS_HEIGHT / 4) * 3);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 4, lineTop);
    ctx.lineTo(CANVAS_WIDTH / 4, lineBottom);
    ctx.stroke();

    ctx.fillText(
      'Summer',
      ((CANVAS_WIDTH / 4) * 3) / 2,
      (CANVAS_HEIGHT / 4) * 3,
    );
    ctx.beginPath();
    ctx.moveTo((CANVAS_WIDTH / 4) * 2, lineTop);
    ctx.lineTo((CANVAS_WIDTH / 4) * 2, lineBottom);
    ctx.stroke();

    ctx.fillText('Fall', ((CANVAS_WIDTH / 4) * 5) / 2, (CANVAS_HEIGHT / 4) * 3);
    ctx.beginPath();
    ctx.moveTo((CANVAS_WIDTH / 4) * 3, lineTop);
    ctx.lineTo((CANVAS_WIDTH / 4) * 3, lineBottom);
    ctx.stroke();
    ctx.fillText(
      'Winter',
      ((CANVAS_WIDTH / 4) * 7) / 2,
      (CANVAS_HEIGHT / 4) * 3,
    );

    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#b8c4c9';
    ctx.fillText('Tower Defense', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 5);

    ctx.font = '24px sans-serif';
    ctx.fillText('Click to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 4);
    */
  }

  static gameScreen(ctx: CanvasRenderingContext2D, frame: CanvasFrame): void {
    // Drive motion from elapsed time so animation speed stays consistent.
    const enemyX = ((frame.elapsedTime * 0.12) % (CANVAS_WIDTH + 80)) - 40;
    const towerPulse = 1 + Math.sin(frame.elapsedTime / 250) * 0.08;
    const projectileProgress = (frame.elapsedTime % 900) / 900;
    const projectileStartX = 160;
    const projectileStartY = 175;
    const projectileX =
      projectileStartX + (enemyX - projectileStartX) * projectileProgress;
    const projectileY =
      projectileStartY + (285 - projectileStartY) * projectileProgress;

    // Background and map lane.
    ctx.fillStyle = '#102022';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#334b32';
    ctx.fillRect(0, 250, CANVAS_WIDTH, 120);

    ctx.fillStyle = '#202a2d';
    ctx.fillRect(0, 282, CANVAS_WIDTH, 56);

    ctx.strokeStyle = '#c5a15c';
    ctx.lineWidth = 3;
    ctx.setLineDash([14, 18]);
    ctx.beginPath();
    ctx.moveTo(0, 310);
    ctx.lineTo(CANVAS_WIDTH, 310);
    ctx.stroke();
    ctx.setLineDash([]);

    // Tower body pulses slightly to show it is active.
    const towerWidth = (CANVAS_WIDTH / 8) * towerPulse;
    const towerHeight = (CANVAS_HEIGHT / 6) * towerPulse;
    const towerX = 110 - (towerWidth - CANVAS_WIDTH / 8) / 2;
    const towerY = 125 - (towerHeight - CANVAS_HEIGHT / 6) / 2;

    ctx.fillStyle = '#808a8f';
    ctx.fillRect(towerX, towerY, towerWidth, towerHeight);

    ctx.fillStyle = '#b8c4c9';
    ctx.fillRect(towerX + towerWidth * 0.35, towerY - 24, towerWidth * 0.3, 28);

    // Enemy follows the road, while the projectile interpolates toward it.
    ctx.fillStyle = '#df6a4d';
    ctx.beginPath();
    ctx.arc(enemyX, 310, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffda6b';
    ctx.beginPath();
    ctx.arc(projectileX, projectileY, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  static draw(ctx: CanvasRenderingContext2D, frame: CanvasFrame): void {
    if (TowerDefenseLogic.screen === 'title') {
      TowerDefenseLogic.TitleScreen(ctx, frame);
    } else {
      TowerDefenseLogic.gameScreen(ctx, frame);
    }
  }
}
