import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants';
import { STARTMENU_MAP } from './constants';
import type { CanvasFrame, Sprite } from './types';
import { ImageProcessing } from '../../utils/image-processing';

import towersRedSheetImage from './assets/Spritesheet/towers_red_sheet.png';
import towersRedSheetXml from './assets/Spritesheet/towers_red_sheet.xml?raw';
import towersBrownSheetImage from './assets/Spritesheet/towers_brown_sheet.png';
import towersBrownSheetXml from './assets/Spritesheet/towers_brown_sheet.xml?raw';
import towersGreySheetImage from './assets/Spritesheet/towers_grey_sheet.png';
import towersGreySheet from './assets/Spritesheet/towers_grey_sheet.xml?raw';
import landscapeSheetImage from './assets/Spritesheet/landscape_sheet.png';
import landscapeSheetXml from './assets/Spritesheet/landscape_sheet.xml?raw';
import { MapDrawer } from './drawMap';

export class TowerDefenseManager {
    static screen: 'title' | 'game' = 'title';

    private static readonly assets: {
        [key: string]: {
            image: HTMLImageElement;
            sprites: Sprite[];
        };
    } = {
        towersRed: { image: new Image(), sprites: [] },
        towersBrown: { image: new Image(), sprites: [] },
        towersGrey: { image: new Image(), sprites: [] },
        landscape: { image: new Image(), sprites: [] }
    };

    constructor() {
        TowerDefenseManager.loadImages().catch((error) => {
            console.error('Error loading images:', error);
        });
    }

    private static loadImage(key: string, imageSrc: string, xmlData: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.assets[key].image.onload = () => {
                this.assets[key].sprites = ImageProcessing.extractSpritesFromSheet(
                    this.assets[key].image,
                    xmlData
                );
                resolve();
            };
            this.assets[key].image.onerror = () =>
                reject(new Error(`Failed to load ${key} sprite sheet`));
            this.assets[key].image.src = imageSrc;
        });
    }

    static async loadImages(): Promise<void> {
        console.time('Load Sprite Sheets');
        await Promise.all([
            this.loadImage('towersRed', towersRedSheetImage, towersRedSheetXml),
            this.loadImage('towersBrown', towersBrownSheetImage, towersBrownSheetXml),
            this.loadImage('towersGrey', towersGreySheetImage, towersGreySheet),
            this.loadImage('landscape', landscapeSheetImage, landscapeSheetXml)
        ]);
        console.timeEnd('Load Sprite Sheets');
    }

    public startGame = (): void => {
        TowerDefenseManager.screen = 'game';
    };

    public TitleScreen = (ctx: CanvasRenderingContext2D): void => {
        ctx.fillStyle = '#597f9c';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        new MapDrawer(ctx).drawMap(
            STARTMENU_MAP.tiles,
            Object.values(TowerDefenseManager.assets).flatMap((asset) => asset.sprites)
        );
    };

    public gameScreen = (_ctx: CanvasRenderingContext2D, _frame: CanvasFrame): void => {
        // Drive motion from elapsed time so animation speed stays consistent.
        // const enemyX = ((frame.elapsedTime * 0.12) % (CANVAS_WIDTH + 80)) - 40;
        // const towerPulse = 1 + Math.sin(frame.elapsedTime / 250) * 0.08;
        // const projectileProgress = (frame.elapsedTime % 900) / 900;
        // const projectileStartX = 160;
        // const projectileStartY = 175;
        // const projectileX =
        //   projectileStartX + (enemyX - projectileStartX) * projectileProgress;
        // const projectileY =
        //   projectileStartY + (285 - projectileStartY) * projectileProgress;
        // // Background and map lane.
        // ctx.fillStyle = '#102022';
        // ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        // ctx.fillStyle = '#334b32';
        // ctx.fillRect(0, 250, CANVAS_WIDTH, 120);
        // ctx.fillStyle = '#202a2d';
        // ctx.fillRect(0, 282, CANVAS_WIDTH, 56);
        // ctx.strokeStyle = '#c5a15c';
        // ctx.lineWidth = 3;
        // ctx.setLineDash([14, 18]);
        // ctx.beginPath();
        // ctx.moveTo(0, 310);
        // ctx.lineTo(CANVAS_WIDTH, 310);
        // ctx.stroke();
        // ctx.setLineDash([]);
        // // Tower body pulses slightly to show it is active.
        // const towerWidth = (CANVAS_WIDTH / 8) * towerPulse;
        // const towerHeight = (CANVAS_HEIGHT / 6) * towerPulse;
        // const towerX = 110 - (towerWidth - CANVAS_WIDTH / 8) / 2;
        // const towerY = 125 - (towerHeight - CANVAS_HEIGHT / 6) / 2;
        // ctx.fillStyle = '#808a8f';
        // ctx.fillRect(towerX, towerY, towerWidth, towerHeight);
        // ctx.fillStyle = '#b8c4c9';
        // ctx.fillRect(towerX + towerWidth * 0.35, towerY - 24, towerWidth * 0.3, 28);
        // // Enemy follows the road, while the projectile interpolates toward it.
        // ctx.fillStyle = '#df6a4d';
        // ctx.beginPath();
        // ctx.arc(enemyX, 310, 22, 0, Math.PI * 2);
        // ctx.fill();
        // ctx.fillStyle = '#ffda6b';
        // ctx.beginPath();
        // ctx.arc(projectileX, projectileY, 7, 0, Math.PI * 2);
        // ctx.fill();
    };

    public draw = (ctx: CanvasRenderingContext2D, frame: CanvasFrame): void => {
        if (TowerDefenseManager.screen === 'title') {
            this.TitleScreen(ctx);
        } else {
            this.gameScreen(ctx, frame);
        }
    };
}
