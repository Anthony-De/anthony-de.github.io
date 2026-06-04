import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants';
import type { CanvasFrame, Neighbors, Sprite, Tile } from './types';
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
type Point = {
    x: number;
    y: number;
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
                    name: `landscape`
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
    };

    public draw = (ctx: CanvasRenderingContext2D, frame: CanvasFrame): void => {
        if (TowerDefenseManager.screen === 'title') {
            this.TitleScreen(ctx);
        } else {
            this.gameScreen(ctx, frame);
        }
    };

    private static getNeighboringTiles(point: Point): Neighbors {
        const neighbors: Neighbors = {};
        const directions: Point[] = [
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: -1, y: 0 },
            { x: 1, y: 0 }
        ];

        for (const direction of directions) {
            const neighborX = point.x + direction.x;
            const neighborY = point.y + direction.y;

            if (
                neighborX >= 0 &&
                neighborX < TowerDefenseManager.map[0].length &&
                neighborY >= 0 &&
                neighborY < TowerDefenseManager.map.length
            ) {
                if (direction.x === 0 && direction.y === -1) {
                    neighbors.up = TowerDefenseManager.map[neighborY][neighborX];
                } else if (direction.x === 0 && direction.y === 1) {
                    neighbors.down = TowerDefenseManager.map[neighborY][neighborX];
                } else if (direction.x === -1 && direction.y === 0) {
                    neighbors.left = TowerDefenseManager.map[neighborY][neighborX];
                } else if (direction.x === 1 && direction.y === 0) {
                    neighbors.right = TowerDefenseManager.map[neighborY][neighborX];
                }
            }
        }

        for (const neighbor in neighbors) {
            if (
                !TowerDefenseManager.isWalkableTile(neighbors[neighbor as keyof Neighbors] as Tile)
            ) {
                delete neighbors[neighbor as keyof Neighbors];
            }
        }

        return neighbors;
    }

    private static calculatePath(): boolean {
        TowerDefenseManager.clearCalculatedPath();

        const start = TowerDefenseManager.findTilePositionByName('spawn');
        const goal = TowerDefenseManager.findTilePositionByName('goal');

        if (!start || !goal) {
            console.error('Spawn or goal tile not found!');
            return false;
        }

        // Pre-calculate distance to goal for all tiles
        for (let y = 0; y < TowerDefenseManager.map.length; y++) {
            for (let x = 0; x < TowerDefenseManager.map[y].length; x++) {
                const tile = TowerDefenseManager.map[y][x];
                tile.distanceToGoal = Math.abs(goal.x - x) + Math.abs(goal.y - y);
            }
        }

        const path = TowerDefenseManager.findPathAStar(start, goal);
        if (!path) {
            console.error('No path found from spawn to goal!');
            return false;
        }

        // Set the tiles along the path to have a "path" name, which will be used for rendering the correct sprite
        for (const point of path) {
            const tile = TowerDefenseManager.map[point.y][point.x];
            if (tile.name !== 'spawn' && tile.name !== 'goal') tile.name = 'path';
        }

        TowerDefenseManager.applyCalculatedPath(path);
        return true;
    }

    private static findPathAStar(start: Point, goal: Point): Point[] | null {
        const openSet: Point[] = [start];
        const cameFrom = new Map<string, Point>();
        const gScore = new Map<string, number>([[TowerDefenseManager.getPointKey(start), 0]]);
        const fScore = new Map<string, number>([
            [TowerDefenseManager.getPointKey(start), TowerDefenseManager.getDistance(start, goal)]
        ]);

        while (openSet.length > 0) {
            const current = TowerDefenseManager.getLowestScorePoint(openSet, fScore);

            if (current.x === goal.x && current.y === goal.y) {
                return TowerDefenseManager.reconstructPath(cameFrom, current);
            }

            openSet.splice(openSet.indexOf(current), 1);

            for (const neighbor of TowerDefenseManager.getNeighboringPoints(current)) {
                const currentScore =
                    gScore.get(TowerDefenseManager.getPointKey(current)) ?? Infinity;
                const tentativeScore = currentScore + 1;
                const neighborKey = TowerDefenseManager.getPointKey(neighbor);

                if (tentativeScore < (gScore.get(neighborKey) ?? Infinity)) {
                    cameFrom.set(neighborKey, current);
                    gScore.set(neighborKey, tentativeScore);
                    fScore.set(
                        neighborKey,
                        tentativeScore + TowerDefenseManager.getDistance(neighbor, goal)
                    );

                    if (
                        !openSet.some(
                            (openPoint) => openPoint.x === neighbor.x && openPoint.y === neighbor.y
                        )
                    ) {
                        openSet.push(neighbor);
                    }
                }
            }
        }

        return null;
    }

    private static getNeighboringPoints(point: Point): Point[] {
        const neighbors: Point[] = [];
        const directions: Point[] = [
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: -1, y: 0 },
            { x: 1, y: 0 }
        ];

        for (const direction of directions) {
            const neighbor: Point = {
                x: point.x + direction.x,
                y: point.y + direction.y
            };

            if (
                neighbor.x >= 0 &&
                neighbor.x < TowerDefenseManager.map[0].length &&
                neighbor.y >= 0 &&
                neighbor.y < TowerDefenseManager.map.length &&
                TowerDefenseManager.isWalkableTile(TowerDefenseManager.map[neighbor.y][neighbor.x])
            ) {
                neighbors.push(neighbor);
            }
        }

        return neighbors;
    }

    private static getLowestScorePoint(points: Point[], scores: Map<string, number>): Point {
        return points.reduce((bestPoint, point) => {
            const bestScore = scores.get(TowerDefenseManager.getPointKey(bestPoint)) ?? Infinity;
            const pointScore = scores.get(TowerDefenseManager.getPointKey(point)) ?? Infinity;

            return pointScore < bestScore ? point : bestPoint;
        });
    }

    private static reconstructPath(cameFrom: Map<string, Point>, current: Point): Point[] {
        const path = [current];
        let currentKey = TowerDefenseManager.getPointKey(current);

        while (cameFrom.has(currentKey)) {
            current = cameFrom.get(currentKey) as Point;
            currentKey = TowerDefenseManager.getPointKey(current);
            path.unshift(current);
        }

        return path;
    }

    private static getDistance(a: Point, b: Point): number {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    private static getPointKey(point: Point): string {
        return `${point.x},${point.y}`;
    }

    private static isWalkableTile(tile: Tile): boolean {
        return (
            !tile.key.startsWith('tree_') &&
            !tile.key.startsWith('rock_') &&
            !tile.key.startsWith('crystal_') &&
            !tile.key.startsWith('tower_')
        );
    }

    private static findTilePositionByName(name: string): Point | null {
        for (let y = 0; y < TowerDefenseManager.map.length; y++) {
            for (let x = 0; x < TowerDefenseManager.map[y].length; x++) {
                if (TowerDefenseManager.map[y][x].name === name) {
                    return { x, y };
                }
            }
        }

        return null;
    }

    private static applyCalculatedPath(path: Point[]): void {
        for (const point of path) {
            const tile = TowerDefenseManager.map[point.y][point.x];
            if (tile.name !== 'spawn' && tile.name !== 'goal') {
                const n: Neighbors = this.getNeighboringTiles(point);

                const up = TowerDefenseManager.isPathConnector(n.up);
                const down = TowerDefenseManager.isPathConnector(n.down);
                const left = TowerDefenseManager.isPathConnector(n.left);
                const right = TowerDefenseManager.isPathConnector(n.right);

                //  if (up && left && down) {
                //     // T shapes
                //     // Up, left, down : path_7
                //     // Up, right, down: path_5
                //     // Up, left, right: path_4
                //     // Down, left, right: path_6
                //     tile.key = 'path_7';
                // }

                // All Way
                // Up, down, left, right: path_10
                if (up && down && left && right) {
                    tile.key = 'path_10';
                }

                // Corners
                if (up && right) {
                    tile.key = 'path_11';
                } else if (down && right) {
                    tile.key = 'path_12';
                } else if (left && down) {
                    tile.key = 'path_13';
                } else if (up && left) {
                    tile.key = 'path_14';
                }

                // Straights
                else if (up && down) {
                    tile.key = 'path_15';
                } else if (left && right) {
                    tile.key = 'path_16';
                }
            }
        }
    }

    private static isPathConnector(tile: Tile | undefined): boolean {
        return tile?.name === 'path' || tile?.name === 'spawn' || tile?.name === 'goal';
    }

    private static clearCalculatedPath(): void {
        for (let y = 0; y < TowerDefenseManager.map.length; y++) {
            for (let x = 0; x < TowerDefenseManager.map[y].length; x++) {
                const tile = TowerDefenseManager.map[y][x];
                if (tile.name === 'path') {
                    tile.name = 'landscape';
                    tile.key = 'landscape_1';
                }
            }
        }
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

        if (!hit || !this.areTilePositionsEqual(pressedPosition, hit.position)) {
            return;
        }

        const tile = hit.tile;
        if (tile.name === 'spawn' || tile.name === 'goal') {
            return;
        }

        const previousTile = {
            key: tile.key,
            name: tile.name
        };

        tile.key = 'rock_0';
        tile.name = 'rock';

        if (!TowerDefenseManager.calculatePath()) {
            tile.key = previousTile.key;
            tile.name = previousTile.name;
            TowerDefenseManager.calculatePath();
        }
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
