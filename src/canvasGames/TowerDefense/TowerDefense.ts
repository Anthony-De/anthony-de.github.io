import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants';
import type { CanvasFrame, Neighbors, Sprite, Tile } from './types';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { ResourceManager } from '../../utils/ResourceManager';

import { MapDrawer } from './drawMap';
import { DIRECTIONS, TILE_SIZE } from './constants';

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
    private hoveredTilePosition: TilePosition | null = null;
    private pressedTilePosition: TilePosition | null = null;

    private static readonly MAP_ROWS = 10;
    private static readonly MAP_COLS = 10;

    private static readonly mapOffset = {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 4
    };
    public allSprites: Sprite[] = [];
    public map: Tile[][] = [];
    public static screen: 'title' | 'game' = 'title';

    public assetsLoaded = false;

    constructor() {
        this.map = TowerDefenseManager.createDefaultMap();
        // this.calculatePath();
    }

    public async loadAssets(): Promise<void> {
        // Load All Fonts and Images before starting the game
        const fontUrls = import.meta.glob('./assets/Fonts/**/*.ttf', {
            eager: true,
            import: 'default'
        }) as Record<string, string>;

        const imagesUrls = import.meta.glob('./assets/map_tiles/**/*.png', {
            eager: true,
            import: 'default'
        }) as Record<string, string>;

        const [, sprites] = await Promise.all([
            ResourceManager.loadFonts(fontUrls),
            ResourceManager.loadImages(imagesUrls)
        ]);

        this.allSprites = sprites;
        this.assetsLoaded = true;
    }

    private static createDefaultMap(): Tile[][] {
        const map = Array.from({ length: this.MAP_ROWS }, () =>
            Array.from(
                { length: this.MAP_COLS },
                () =>
                    ({
                        key: ['grass_1'],
                        name: 'grass'
                    }) as Tile
            )
        );

        // map[0][0] = { key: ['landscape_0'], name: 'spawn' };
        // map[this.MAP_ROWS - 1][this.MAP_COLS - 1] = { key: ['landscape_0'], name: 'goal' };
        // map[5][5] = { key: ['tower_base_0', 'tower_mid_0', 'tower_top_0'], name: 'tower' };

        return map;
    }

    // private static loadImage(key: string, imageSrc: string, xmlData: string): Promise<void> {
    //     return new Promise((resolve, reject) => {
    //         this.assets[key].image.onload = () => {
    //             this.assets[key].sprites = ImageProcessing.extractSpritesFromSheet(
    //                 this.assets[key].image,
    //                 xmlData
    //             );
    //             resolve();
    //         };
    //         this.assets[key].image.onerror = () =>
    //             reject(new Error(`Failed to load ${key} sprite sheet`));
    //         this.assets[key].image.src = imageSrc;
    //     });
    // }

    private static async loadFont(fontName: string): Promise<void> {
        const font = new FontFace(fontName, `url(./assets/Fonts/${fontName}.ttf)`);
        await font.load();
        document.fonts.add(font);
    }

    static async loadFonts(): Promise<void> {
        await Promise.all([TowerDefenseManager.loadFont('Magic')]);
    }

    public startGame = (): void => {
        TowerDefenseManager.screen = 'game';
    };

    public drawTitleScreen = (ctx: CanvasRenderingContext2D): void => {
        ctx.fillStyle = '#597f9c';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        MapDrawer.drawMap(ctx, this.map, this.allSprites, {
            offsetX: TowerDefenseManager.mapOffset.x,
            offsetY: TowerDefenseManager.mapOffset.y
        });
    };

    public drawGameScreen = (ctx: CanvasRenderingContext2D, _frame: CanvasFrame): void => {
        ctx.fillStyle = '#597f9c';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    };

    public draw = (ctx: CanvasRenderingContext2D, frame: CanvasFrame): void => {
        if (TowerDefenseManager.screen === 'title') {
            this.drawTitleScreen(ctx);
        } else {
            this.drawGameScreen(ctx, frame);
        }
    };

    private getNeighboringTiles(point: Point): Neighbors {
        const neighbors: Neighbors = {};

        for (const direction of DIRECTIONS) {
            const neighborX = point.x + direction.x;
            const neighborY = point.y + direction.y;

            if (
                neighborX >= 0 &&
                neighborX < this.map[0].length &&
                neighborY >= 0 &&
                neighborY < this.map.length
            ) {
                if (direction.x === 0 && direction.y === -1) {
                    neighbors.up = this.map[neighborY][neighborX];
                } else if (direction.x === 0 && direction.y === 1) {
                    neighbors.down = this.map[neighborY][neighborX];
                } else if (direction.x === -1 && direction.y === 0) {
                    neighbors.left = this.map[neighborY][neighborX];
                } else if (direction.x === 1 && direction.y === 0) {
                    neighbors.right = this.map[neighborY][neighborX];
                }
            }
        }

        for (const neighbor in neighbors) {
            if (
                !this.isWalkableTile(neighbors[neighbor as keyof Neighbors] as Tile) ||
                !this.isPathConnector(neighbors[neighbor as keyof Neighbors] as Tile)
            ) {
                delete neighbors[neighbor as keyof Neighbors];
            }
        }

        return neighbors;
    }

    private calculatePath(): boolean {
        this.clearCalculatedPath();

        const start = this.findTilePositionByName('spawn');
        const goal = this.findTilePositionByName('goal');

        if (!start || !goal) {
            console.error('Spawn or goal tile not found!');
            return false;
        }

        const path = this.findPathAStar(start, goal);
        if (!path) {
            console.error('No path found from spawn to goal!');
            return false;
        }

        // Set the tiles along the path to have a "path" name, which will be used for rendering the correct sprite
        for (const point of path) {
            const tile = this.map[point.y][point.x];
            if (tile.name !== 'spawn' && tile.name !== 'goal') tile.name = 'path';
        }

        this.applyCalculatedPath(path);
        return true;
    }

    private findPathAStar(start: Point, goal: Point): Point[] | null {
        const openSet: Point[] = [start];
        const openSetKeys = new Set<string>([this.getPointKey(start)]);
        const cameFrom = new Map<string, Point>();
        const gScore = new Map<string, number>([[this.getPointKey(start), 0]]);
        const fScore = new Map<string, number>([
            [this.getPointKey(start), this.getDistance(start, goal)]
        ]);

        while (openSet.length > 0) {
            const current = this.getLowestScorePoint(openSet, fScore);

            if (current.x === goal.x && current.y === goal.y) {
                return this.reconstructPath(cameFrom, current);
            }

            const currentKey = this.getPointKey(current);
            openSet.splice(openSet.indexOf(current), 1);
            openSetKeys.delete(currentKey);
            for (const neighbor of this.getNeighboringPoints(current)) {
                const currentScore = gScore.get(currentKey) ?? Infinity;
                const tentativeScore = currentScore + 1;
                const neighborKey = this.getPointKey(neighbor);

                if (tentativeScore < (gScore.get(neighborKey) ?? Infinity)) {
                    cameFrom.set(neighborKey, current);
                    gScore.set(neighborKey, tentativeScore);
                    fScore.set(neighborKey, tentativeScore + this.getDistance(neighbor, goal));

                    if (!openSetKeys.has(neighborKey)) {
                        openSet.push(neighbor);
                        openSetKeys.add(neighborKey);
                    }
                }
            }
        }

        return null;
    }

    private getNeighboringPoints(point: Point): Point[] {
        const neighbors: Point[] = [];

        for (const direction of DIRECTIONS) {
            const neighbor: Point = {
                x: point.x + direction.x,
                y: point.y + direction.y
            };

            if (
                neighbor.x >= 0 &&
                neighbor.x < this.map[0].length &&
                neighbor.y >= 0 &&
                neighbor.y < this.map.length &&
                this.isWalkableTile(this.map[neighbor.y][neighbor.x])
            ) {
                neighbors.push(neighbor);
            }
        }

        return neighbors;
    }

    private getLowestScorePoint(points: Point[], scores: Map<string, number>): Point {
        return points.reduce((bestPoint, point) => {
            const bestScore = scores.get(this.getPointKey(bestPoint)) ?? Infinity;
            const pointScore = scores.get(this.getPointKey(point)) ?? Infinity;

            return pointScore < bestScore ? point : bestPoint;
        });
    }

    private reconstructPath(cameFrom: Map<string, Point>, current: Point): Point[] {
        const path = [current];
        let currentKey = this.getPointKey(current);

        while (cameFrom.has(currentKey)) {
            current = cameFrom.get(currentKey) as Point;
            currentKey = this.getPointKey(current);
            path.unshift(current);
        }

        return path;
    }

    private getDistance(a: Point, b: Point): number {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    private getPointKey(point: Point): string {
        return `${point.x},${point.y}`;
    }

    private isWalkableTile(tile: Tile): boolean {
        return (
            !tile.key[0].startsWith('tree_') &&
            !tile.key[0].startsWith('rock_') &&
            !tile.key[0].startsWith('crystal_') &&
            !tile.key[0].startsWith('tower_')
        );
    }

    private findTilePositionByName(name: string): Point | null {
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                if (this.map[y][x].name === name) {
                    return { x, y };
                }
            }
        }

        return null;
    }

    private getPathKeyFromConnections(
        up: boolean,
        down: boolean,
        left: boolean,
        right: boolean
    ): Tile['key'] {
        const mask = (up ? 1 : 0) | (right ? 2 : 0) | (down ? 4 : 0) | (left ? 8 : 0);

        const pathKeys: Partial<Record<number, Tile['key']>> = {
            // Corners
            [1 | 2]: ['path_turn_0'], // up + right
            [2 | 4]: ['path_turn_1'], // right + down
            [4 | 8]: ['path_turn_2'], // down + left
            [1 | 8]: ['path_turn_3'], // up + left

            // Straights
            [1 | 4]: ['path_0'], // up + down
            [2 | 8]: ['path_1'], // right + left

            // T shapes
            [1 | 2 | 4]: ['path_t_0'], // up + right + down
            [2 | 4 | 8]: ['path_t_1'], // right + down + left
            [1 | 4 | 8]: ['path_t_2'], // up + down + left
            [1 | 2 | 8]: ['path_t_3'], // up + right + left

            // All way
            [1 | 2 | 4 | 8]: ['path_2'] // up + right + down + left
        };

        return pathKeys[mask] || ['path_0']; // Default to straight if something goes wrong
    }

    private applyCalculatedPath(path: Point[]): void {
        for (const point of path) {
            const tile = this.map[point.y][point.x];
            if (tile.name !== 'path') continue;

            const { up, down, left, right } = this.getNeighboringTiles(point);

            tile.key = this.getPathKeyFromConnections(
                Boolean(up),
                Boolean(down),
                Boolean(left),
                Boolean(right)
            );
        }
    }

    private isPathConnector(tile: Tile | undefined): boolean {
        return tile?.name === 'path' || tile?.name === 'spawn' || tile?.name === 'goal';
    }

    private clearCalculatedPath(): void {
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                const tile = this.map[y][x];
                if (tile.name === 'path') {
                    tile.name = 'grass';
                    tile.key = ['grass_1'];
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

        if (Math.random() < 0.5) {
            tile.key = [`trees_${Math.floor(Math.random() * 12)}`] as Tile['key'];
            tile.name = 'trees';
        } else {
            tile.key = [`rocks_${Math.floor(Math.random() * 8)}`] as Tile['key'];
            tile.name = 'rocks';
        }
        // tile.key = 'tower_00';
        // tile.name = 'tower';

        if (!this.calculatePath()) {
            tile.key = previousTile.key;
            tile.name = previousTile.name;
            this.calculatePath();
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
        this.hoveredTilePosition = this.setTileFlag(
            this.hoveredTilePosition,
            position,
            'isHovered'
        );
    }

    private setPressedTilePosition(position: TilePosition | null): void {
        this.pressedTilePosition = this.setTileFlag(
            this.pressedTilePosition,
            position,
            'isPressed'
        );
    }

    private getTileAtPosition(position: TilePosition | null): Tile | null {
        if (
            !position ||
            position.row < 0 ||
            position.row >= this.map.length ||
            position.col < 0 ||
            position.col >= this.map[position.row].length
        ) {
            return null;
        }

        return this.map[position.row][position.col];
    }

    private areTilePositionsEqual(left: TilePosition | null, right: TilePosition | null): boolean {
        return left?.row === right?.row && left?.col === right?.col;
    }

    private setTileFlag(
        currentPosition: TilePosition | null,
        nextPosition: TilePosition | null,
        flag: 'isHovered' | 'isPressed'
    ): TilePosition | null {
        if (this.areTilePositionsEqual(currentPosition, nextPosition)) {
            return currentPosition;
        }

        const previousTile = this.getTileAtPosition(currentPosition);
        if (previousTile) {
            previousTile[flag] = false;
        }

        const nextTile = this.getTileAtPosition(nextPosition);
        if (nextTile) {
            nextTile[flag] = true;
        }

        return nextPosition;
    }
}
