import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants';
import type { CanvasFrame, Sprite, Tile } from './types';
import type { MouseEvent as ReactMouseEvent } from 'react';
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
import { TILE_SIZE } from './constants';

type CanvasMouseEvent = ReactMouseEvent<HTMLCanvasElement>;
type TilePosition = {
    row: number;
    col: number;
};

export class TowerDefenseManager {
    static screen: 'title' | 'game' = 'title';

    static map: Tile[][] = [];

    private static readonly mapOffset = {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 4
    };

    private hoveredTilePosition: TilePosition | null = null;
    private pressedTilePosition: TilePosition | null = null;

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

        for (let row = 0; row < 10; row++) {
            TowerDefenseManager.map[row] = [];
            for (let col = 0; col < 10; col++) {
                TowerDefenseManager.map[row][col] = {
                    key: 'landscape_1',
                    name: `${row}_${col}`
                };
            }
        }

        TowerDefenseManager.map[0][0] = { key: 'landscape_0', name: 'spawn' };
        TowerDefenseManager.map[9][9] = { key: 'landscape_0', name: 'goal' };

        TowerDefenseManager.calculatePath();
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

        // MapDrawer.drawMap(
        //     ctx,
        //     STARTMENU_MAP.tiles,
        //     Object.values(TowerDefenseManager.assets).flatMap((asset) => asset.sprites),
        //     {
        //         offsetX: CANVAS_WIDTH / 3,
        //         offsetY: CANVAS_HEIGHT / 3
        //     }
        // );

        MapDrawer.drawMap(
            ctx,
            TowerDefenseManager.map,
            Object.values(TowerDefenseManager.assets).flatMap((asset) => asset.sprites),
            {
                offsetX: TowerDefenseManager.mapOffset.x,
                offsetY: TowerDefenseManager.mapOffset.y
            }
        );
    };

    public gameScreen = (ctx: CanvasRenderingContext2D, _frame: CanvasFrame): void => {
        ctx.fillStyle = '#597f9c';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // MapDrawer.drawMap(
        //     ctx,
        //     LEVEL_ONE_MAP.tiles,
        //     Object.values(TowerDefenseManager.assets).flatMap((asset) => asset.sprites),
        //     {
        //         offsetX: CANVAS_WIDTH / 2 - 60,
        //         offsetY: CANVAS_HEIGHT / 5
        //     }
        // );

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

    private static getNeighbors(tile: Tile): Tile[] {
        const neighbors: Tile[] = [];
        for (let row = 0; row < TowerDefenseManager.map.length; row++) {
            for (let col = 0; col < TowerDefenseManager.map[row].length; col++) {
                if (TowerDefenseManager.map[row][col] === tile) {
                    if (row > 0) neighbors.push(TowerDefenseManager.map[row - 1][col]); // Up
                    if (row < TowerDefenseManager.map.length - 1)
                        neighbors.push(TowerDefenseManager.map[row + 1][col]); // Down
                    if (col > 0) neighbors.push(TowerDefenseManager.map[row][col - 1]); // Left
                    if (col < TowerDefenseManager.map[row].length - 1)
                        neighbors.push(TowerDefenseManager.map[row][col + 1]); // Right
                }
            }
        }
        return neighbors;
    }

    // private static updatePath(): void {
    //     // Update the keys of the paths so they face the correct direction based on their neighbors.
    //     for (let row = 0; row < TowerDefenseManager.map.length; row++) {
    //         for (let col = 0; col < TowerDefenseManager.map[row].length; col++) {
    //             const tile = TowerDefenseManager.map[row][col];
    //             if (tile.name === 'path') {
    //                 const neighbors = TowerDefenseManager.getNeighbors(tile);
    //                 const hasUp = neighbors.some((n) => n.name === 'path' && n.key === 'path_0');
    //                 const hasDown = neighbors.some((n) => n.name === 'path' && n.key === 'path_0');
    //                 const hasLeft = neighbors.some((n) => n.name === 'path' && n.key === 'path_1');
    //                 const hasRight = neighbors.some((n) => n.name === 'path' && n.key === 'path_1');

    //                 if (hasUp && hasDown && !hasLeft && !hasRight) {
    //                     TowerDefenseManager.map[row][col].key = 'path_0'; // Vertical
    //                 } else if (!hasUp && !hasDown && hasLeft && hasRight) {
    //                     TowerDefenseManager.map[row][col].key = 'path_1'; // Horizontal
    //                 } else if (hasUp && hasRight && !hasDown && !hasLeft) {
    //                     TowerDefenseManager.map[row][col].key = 'path_2'; // Curve up-right
    //                 } else if (hasDown && hasRight && !hasUp && !hasLeft) {
    //                     TowerDefenseManager.map[row][col].key = 'path_3'; // Curve down-right
    //                 } else if (hasDown && hasLeft && !hasUp && !hasRight) {
    //                     TowerDefenseManager.map[row][col].key = 'path_4'; // Curve down-left
    //                 } else if (hasUp && hasLeft && !hasDown && !hasRight) {
    //                     TowerDefenseManager.map[row][col].key = 'path_5'; // Curve up-left
    //                 } else {
    //                     TowerDefenseManager.map[row][col].key = 'path_0'; // Default to vertical if something goes wrong
    //                 }
    //             }
    //         }
    //     }
    // }

    private static calculatePath(): void {
        const spawn = TowerDefenseManager.map.flat().find((tile) => tile.name === 'spawn');
        const goal = TowerDefenseManager.map.flat().find((tile) => tile.name === 'goal');

        if (!spawn || !goal) {
            console.error('Spawn or goal tile not found!');
            return;
        }

        // Use a simple breadth-first search to find the path from spawn to goal.
        const queue: { tile: Tile; path: Tile[] }[] = [{ tile: spawn, path: [spawn] }];
        const visited = new Set<Tile>();
        visited.add(spawn);

        while (queue.length > 0) {
            const { tile, path } = queue.shift()!;
            if (tile === goal) {
                // Mark the path tiles for visualization.
                for (const pathTile of path) {
                    if (pathTile.name !== 'spawn' && pathTile.name !== 'goal') {
                        pathTile.name = 'path';
                    }
                }
                // TowerDefenseManager.updatePath();
                return;
            }

            // Get neighboring tiles (up, down, left, right).
            const neighbors = TowerDefenseManager.getNeighbors(tile);
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push({ tile: neighbor, path: [...path, neighbor] });
                }
            }
        }

        console.error('No path found from spawn to goal!');
    }

    public onMouseDown(event: CanvasMouseEvent): void {
        const hit = this.getTileFromMouseEvent(event);
        this.setPressedTilePosition(hit?.position ?? null);

        if (hit) {
            console.log(
                `Mouse down on tile: ${hit.tile.name} at (${hit.position.col}, ${hit.position.row})`
            );
        }
    }

    public onMouseMove(event: CanvasMouseEvent): void {
        const hit = this.getTileFromMouseEvent(event);
        this.setHoveredTilePosition(hit?.position ?? null);
    }

    public onMouseUp(event: CanvasMouseEvent): void {
        const hit = this.getTileFromMouseEvent(event);
        const pressedPosition = this.pressedTilePosition;

        if (hit && this.areTilePositionsEqual(pressedPosition, hit.position)) {
            console.log(
                `Mouse up on tile: ${hit.tile.name} at (${hit.position.col}, ${hit.position.row})`
            );
        }

        this.setPressedTilePosition(null);
    }

    public onMouseLeave(): void {
        this.setHoveredTilePosition(null);
        this.setPressedTilePosition(null);
    }

    public screenToWorldCoordinates(
        mouseX: number,
        mouseY: number
    ): { worldX: number; worldY: number } {
        const worldX =
            ((mouseX - TowerDefenseManager.mapOffset.x) / (TILE_SIZE / 2) +
                (mouseY - TowerDefenseManager.mapOffset.y) / (TILE_SIZE / 4)) /
            2;
        const worldY =
            ((mouseY - TowerDefenseManager.mapOffset.y) / (TILE_SIZE / 4) -
                (mouseX - TowerDefenseManager.mapOffset.x) / (TILE_SIZE / 2)) /
            2;

        return { worldX, worldY };
    }

    private getTileFromMouseEvent(
        event: CanvasMouseEvent
    ): { position: TilePosition; tile: Tile } | null {
        const { x, y } = this.getCanvasMousePosition(event);
        const { worldX, worldY } = this.screenToWorldCoordinates(x, y);
        const position = {
            row: Math.floor(worldY),
            col: Math.floor(worldX)
        };
        const tile = this.getTileAtPosition(position);

        return tile ? { position, tile } : null;
    }

    private getCanvasMousePosition(event: CanvasMouseEvent): { x: number; y: number } {
        const canvas = event.currentTarget;
        const rect = canvas.getBoundingClientRect();

        return {
            x: ((event.clientX - rect.left) * canvas.width) / rect.width,
            y: ((event.clientY - rect.top) * canvas.height) / rect.height
        };
    }

    private setHoveredTilePosition(position: TilePosition | null): void {
        if (this.areTilePositionsEqual(this.hoveredTilePosition, position)) {
            return;
        }

        const previousTile = this.getTileAtPosition(this.hoveredTilePosition);
        if (previousTile) {
            previousTile.isHovered = false;
        }

        this.hoveredTilePosition = position;

        const nextTile = this.getTileAtPosition(position);
        if (nextTile) {
            nextTile.isHovered = true;
        }
    }

    private setPressedTilePosition(position: TilePosition | null): void {
        if (this.areTilePositionsEqual(this.pressedTilePosition, position)) {
            return;
        }

        const previousTile = this.getTileAtPosition(this.pressedTilePosition);
        if (previousTile) {
            previousTile.isPressed = false;
        }

        this.pressedTilePosition = position;

        const nextTile = this.getTileAtPosition(position);
        if (nextTile) {
            nextTile.isPressed = true;
        }
    }

    private getTileAtPosition(position: TilePosition | null): Tile | null {
        if (
            !position ||
            position.row < 0 ||
            position.row >= TowerDefenseManager.map.length ||
            position.col < 0 ||
            position.col >= TowerDefenseManager.map[position.row].length
        ) {
            return null;
        }

        return TowerDefenseManager.map[position.row][position.col];
    }

    private areTilePositionsEqual(left: TilePosition | null, right: TilePosition | null): boolean {
        return left?.row === right?.row && left?.col === right?.col;
    }
}
