import type { CanvasFrame, Neighbors, Sprite, Tile } from './types';
import { Vec2 } from './types';
import { ResourceManager } from '../../utils/ResourceManager';

import { MapDrawer } from './drawMap';
import { DEFAULT_TILE_KEY, DIRECTIONS, TILE_SIZE } from './constants';

export class TowerDefenseManager {
    private hoveredTilePosition: Vec2 | null = null;
    private pressedTilePosition: Vec2 | null = null;
    private dragStartMouse: Vec2 | null = null;
    private dragStartOffset: Vec2 | null = null;
    private pinchStartDistance: number | null = null;
    private pinchStartScaleX: number | null = null;
    private lastPointerCanvasPosition: Vec2 | null = null;
    private isDraggingWorld = false;
    private isZoomingWorld = false;
    private zoomEndTimeoutId: number | null = null;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private static readonly MAP_ROWS = 10;
    private static readonly MAP_COLS = 10;
    private static readonly MIN_TILE_SCALE_X = TILE_SIZE / 8;
    private static readonly MAX_TILE_SCALE_X = TILE_SIZE * 2;

    private mapOffset: Vec2;
    private mapScale: Vec2;

    public allSprites: Sprite[] = [];
    public map: Tile[][] = [];
    public static screen: 'title' | 'game' = 'title';

    public assetsLoaded = false;

    constructor(canvas?: HTMLCanvasElement) {
        this.canvas = canvas || document.createElement('canvas');
        this.mapOffset = new Vec2(this.canvas.width / 2, this.canvas.height / 4);
        this.mapScale = new Vec2(TILE_SIZE / 2, TILE_SIZE / 4);
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.map = TowerDefenseManager.createDefaultMap();
        this.calculatePath();

        this.addEventListeners();
    }

    public destroy(): void {
        this.removeEventListeners();

        if (this.zoomEndTimeoutId !== null) {
            window.clearTimeout(this.zoomEndTimeoutId);
            this.zoomEndTimeoutId = null;
        }
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
                        key: [DEFAULT_TILE_KEY],
                        name: 'grass'
                    }) as Tile
            )
        );

        map[0][0] = { key: ['grass_3'], name: 'spawn' };
        map[this.MAP_ROWS - 1][this.MAP_COLS - 1] = { key: ['grass_3'], name: 'goal' };
        // map[5][9] = {
        //     key: ['grass_3', 'tower_red_base_wall_2', 'tower_red_mid_3', 'tower_red_top_open_0'],
        //     name: 'tower'
        // };

        return map;
    }

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

    public drawTitleScreen = (): void => {
        this.ctx.fillStyle = '#597f9c';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        MapDrawer.drawMap(
            this.ctx,
            this.map,
            this.allSprites,
            {
                offsetX: this.mapOffset.x,
                offsetY: this.mapOffset.y,
                suppressTileOverlay: this.isZoomingWorld || this.isDraggingWorld
            },
            this.mapScale
        );
    };

    public drawGameScreen = (_frame: CanvasFrame): void => {
        this.ctx.fillStyle = '#597f9c';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    };

    public draw = (frame: CanvasFrame): void => {
        if (TowerDefenseManager.screen === 'title') {
            this.drawTitleScreen();
        } else {
            this.drawGameScreen(frame);
        }
    };

    private handleResize = (): void => {
        this.mapOffset = this.getClampedMapOffset(
            new Vec2(this.canvas.width / 2, this.canvas.height / 4)
        );
    };

    private handleWheel = (event: WheelEvent): void => {
        event.preventDefault();
        const zoomFactor = Math.exp(event.deltaY * -0.001);
        const wheelPosition = this.getCanvasMousePosition(event);
        this.lastPointerCanvasPosition = new Vec2(wheelPosition.x, wheelPosition.y);
        this.setZoomScale(this.mapScale.x * zoomFactor);
        this.beginZoomInteraction();
        this.finishZoomInteractionSoon();
    };

    private handleContextMenu = (event: MouseEvent): void => {
        event.preventDefault();

        const { x, y } = this.getCanvasMousePosition(event);
        this.lastPointerCanvasPosition = new Vec2(x, y);

        const hit = this.getTileFromCanvasPosition(x, y);
        if (!hit) {
            return;
        }

        this.toggleTileObstacle(hit.tile);
        this.refreshHoveredTileFromPointer();
    };

    private handleTouchStart = (event: TouchEvent): void => {
        if (event.touches.length === 1) {
            const touchPosition = this.getCanvasTouchPosition(event.touches[0]);

            this.lastPointerCanvasPosition = touchPosition;
            this.dragStartMouse = new Vec2(touchPosition.x, touchPosition.y);
            this.dragStartOffset = new Vec2(this.mapOffset.x, this.mapOffset.y);
            this.isDraggingWorld = false;
            this.pinchStartDistance = null;
            this.pinchStartScaleX = null;

            const hit = this.getTileFromCanvasPosition(touchPosition.x, touchPosition.y);
            this.setPressedTilePosition(hit?.position ?? null);

            return;
        }

        if (event.touches.length !== 2) {
            return;
        }

        event.preventDefault();

        const firstTouch = this.getCanvasTouchPosition(event.touches[0]);
        const secondTouch = this.getCanvasTouchPosition(event.touches[1]);
        this.lastPointerCanvasPosition = this.getTouchMidpoint(firstTouch, secondTouch);
        this.pinchStartDistance = this.getDistanceBetweenPoints(firstTouch, secondTouch);
        this.pinchStartScaleX = this.mapScale.x;
        this.beginZoomInteraction();
    };

    private handleTouchMove = (event: TouchEvent): void => {
        if (event.touches.length === 1) {
            const touchPosition = this.getCanvasTouchPosition(event.touches[0]);
            this.lastPointerCanvasPosition = touchPosition;

            if (this.dragStartMouse && this.dragStartOffset) {
                const deltaX = touchPosition.x - this.dragStartMouse.x;
                const deltaY = touchPosition.y - this.dragStartMouse.y;

                if (!this.isDraggingWorld && Math.hypot(deltaX, deltaY) >= 3) {
                    this.isDraggingWorld = true;
                    this.setPressedTilePosition(null);
                }

                if (this.isDraggingWorld) {
                    event.preventDefault();
                    this.mapOffset = this.getClampedMapOffset(
                        new Vec2(this.dragStartOffset.x + deltaX, this.dragStartOffset.y + deltaY)
                    );

                    return;
                }
            }

            const hit = this.getTileFromCanvasPosition(touchPosition.x, touchPosition.y);
            this.setHoveredTilePosition(hit?.position ?? null);
            return;
        }

        if (
            event.touches.length !== 2 ||
            this.pinchStartDistance === null ||
            this.pinchStartScaleX === null
        ) {
            return;
        }

        event.preventDefault();

        const firstTouch = this.getCanvasTouchPosition(event.touches[0]);
        const secondTouch = this.getCanvasTouchPosition(event.touches[1]);
        const currentDistance = this.getDistanceBetweenPoints(firstTouch, secondTouch);

        if (currentDistance <= 0) {
            return;
        }

        this.lastPointerCanvasPosition = this.getTouchMidpoint(firstTouch, secondTouch);
        this.setZoomScale(this.pinchStartScaleX * (currentDistance / this.pinchStartDistance));
    };

    private handleTouchEnd = (event: TouchEvent): void => {
        if (event.touches.length === 0 && this.dragStartMouse) {
            const changedTouch = event.changedTouches[0];

            if (changedTouch) {
                const touchPosition = this.getCanvasTouchPosition(changedTouch);
                this.lastPointerCanvasPosition = touchPosition;
                const wasDraggingWorld = this.isDraggingWorld;
                const pressedPosition = this.pressedTilePosition;
                const hit = this.getTileFromCanvasPosition(touchPosition.x, touchPosition.y);

                this.dragStartMouse = null;
                this.dragStartOffset = null;
                this.isDraggingWorld = false;

                if (wasDraggingWorld) {
                    this.setPressedTilePosition(null);
                    this.refreshHoveredTileFromPointer();
                    return;
                }

                this.setPressedTilePosition(null);

                if (!hit || !this.areTilePositionsEqual(pressedPosition, hit.position)) {
                    return;
                }

                this.toggleTileObstacle(hit.tile);
            }

            return;
        }

        if (this.pinchStartDistance === null && this.pinchStartScaleX === null) {
            return;
        }

        this.pinchStartDistance = null;
        this.pinchStartScaleX = null;
        this.finishZoomInteractionSoon();
    };

    private addEventListeners(): void {
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('mouseup', this.handleMouseUp);

        this.canvas.addEventListener('contextmenu', this.handleContextMenu);
        this.canvas.addEventListener('wheel', this.handleWheel, { passive: false });
        this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.canvas.addEventListener('touchend', this.handleTouchEnd);
        this.canvas.addEventListener('touchcancel', this.handleTouchEnd);
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave);
    }

    private removeEventListeners(): void {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('mouseup', this.handleMouseUp);

        this.canvas.removeEventListener('contextmenu', this.handleContextMenu);
        this.canvas.removeEventListener('wheel', this.handleWheel);
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
        this.canvas.removeEventListener('touchmove', this.handleTouchMove);
        this.canvas.removeEventListener('touchend', this.handleTouchEnd);
        this.canvas.removeEventListener('touchcancel', this.handleTouchEnd);
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
    }

    private getNeighboringTiles(point: Vec2): Neighbors {
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
            if (!this.isPathConnector(neighbors[neighbor as keyof Neighbors] as Tile)) {
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

    private findPathAStar(start: Vec2, goal: Vec2): Vec2[] | null {
        const openSet: Vec2[] = [start];
        const openSetKeys = new Set<string>([this.getPointKey(start)]);
        const cameFrom = new Map<string, Vec2>();
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

    private getNeighboringPoints(point: Vec2): Vec2[] {
        const neighbors: Vec2[] = [];

        for (const direction of DIRECTIONS) {
            const neighbor: Vec2 = {
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

    private getLowestScorePoint(points: Vec2[], scores: Map<string, number>): Vec2 {
        return points.reduce((bestPoint, point) => {
            const bestScore = scores.get(this.getPointKey(bestPoint)) ?? Infinity;
            const pointScore = scores.get(this.getPointKey(point)) ?? Infinity;

            return pointScore < bestScore ? point : bestPoint;
        });
    }

    private reconstructPath(cameFrom: Map<string, Vec2>, current: Vec2): Vec2[] {
        const path = [current];
        let currentKey = this.getPointKey(current);

        while (cameFrom.has(currentKey)) {
            current = cameFrom.get(currentKey) as Vec2;
            currentKey = this.getPointKey(current);
            path.unshift(current);
        }

        return path;
    }

    private getDistance(a: Vec2, b: Vec2): number {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    private getPointKey(point: Vec2): string {
        return `${point.x},${point.y}`;
    }

    private isWalkableTile(tile: Tile): boolean {
        return tile.key.some(
            (key) => key.startsWith('path_') || key.startsWith('grass_') || key.startsWith('water_')
        );
    }

    private findTilePositionByName(name: string): Vec2 | null {
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

    private applyCalculatedPath(path: Vec2[]): void {
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
                    tile.key = [DEFAULT_TILE_KEY];
                }
            }
        }
    }

    private handleMouseDown = (event: MouseEvent): void => {
        if (event.button !== 0) {
            return;
        }

        const { x, y } = this.getCanvasMousePosition(event);
        this.lastPointerCanvasPosition = new Vec2(x, y);
        this.dragStartMouse = new Vec2(x, y);
        this.dragStartOffset = new Vec2(this.mapOffset.x, this.mapOffset.y);
        this.isDraggingWorld = false;

        const hit = this.getTileFromMouseEvent(event);
        this.setPressedTilePosition(hit?.position ?? null);

        if (hit) {
            console.log(
                `Mouse down on tile: ${hit.tile.name} at (${hit.position.x}, ${hit.position.y})`
            );
        }
    };

    private handleMouseMove = (event: MouseEvent): void => {
        const pointer = this.getCanvasMousePosition(event);
        this.lastPointerCanvasPosition = new Vec2(pointer.x, pointer.y);

        if (this.dragStartMouse && this.dragStartOffset && (event.buttons & 1) === 1) {
            const deltaX = pointer.x - this.dragStartMouse.x;
            const deltaY = pointer.y - this.dragStartMouse.y;

            if (!this.isDraggingWorld && Math.hypot(deltaX, deltaY) >= 3) {
                this.isDraggingWorld = true;
                this.setPressedTilePosition(null);
            }

            if (this.isDraggingWorld) {
                this.mapOffset = this.getClampedMapOffset(
                    new Vec2(this.dragStartOffset.x + deltaX, this.dragStartOffset.y + deltaY)
                );

                return;
            }
        }

        const hit = this.getTileFromMouseEvent(event);
        this.setHoveredTilePosition(hit?.position ?? null);
    };

    private handleMouseUp = (event: MouseEvent): void => {
        if (event.button !== 0) {
            return;
        }

        const wasDraggingWorld = this.isDraggingWorld;
        this.dragStartMouse = null;
        this.dragStartOffset = null;
        this.isDraggingWorld = false;

        if (wasDraggingWorld) {
            this.setPressedTilePosition(null);
            this.refreshHoveredTileFromPointer();
            return;
        }

        const hit = this.getTileFromMouseEvent(event);
        const pressedPosition = this.pressedTilePosition;

        if (hit && this.areTilePositionsEqual(pressedPosition, hit.position)) {
            console.log(
                `Mouse up on tile: ${hit.tile.name} at (${hit.position.x}, ${hit.position.y})`
            );
        }

        this.setPressedTilePosition(null);

        if (!hit || !this.areTilePositionsEqual(pressedPosition, hit.position)) {
            return;
        }

        this.toggleTileObstacle(hit.tile);
    };

    private handleMouseLeave = (): void => {
        this.dragStartMouse = null;
        this.dragStartOffset = null;
        this.pinchStartDistance = null;
        this.pinchStartScaleX = null;
        this.lastPointerCanvasPosition = null;
        this.isDraggingWorld = false;
        this.isZoomingWorld = false;

        if (this.zoomEndTimeoutId !== null) {
            window.clearTimeout(this.zoomEndTimeoutId);
            this.zoomEndTimeoutId = null;
        }

        this.setHoveredTilePosition(null);
        this.setPressedTilePosition(null);
    };

    public screenToWorldCoordinates(
        mouseX: number,
        mouseY: number
    ): { worldX: number; worldY: number } {
        const worldX =
            ((mouseX - this.mapOffset.x) / this.mapScale.x +
                (mouseY - this.mapOffset.y) / this.mapScale.y) /
            2;
        const worldY =
            ((mouseY - this.mapOffset.y) / this.mapScale.y -
                (mouseX - this.mapOffset.x) / this.mapScale.x) /
            2;

        return { worldX, worldY };
    }

    private getTileFromMouseEvent(event: MouseEvent): { position: Vec2; tile: Tile } | null {
        const { x, y } = this.getCanvasMousePosition(event);
        return this.getTileFromCanvasPosition(x, y);
    }

    private getTileFromCanvasPosition(
        mouseX: number,
        mouseY: number
    ): { position: Vec2; tile: Tile } | null {
        const { worldX, worldY } = this.screenToWorldCoordinates(mouseX, mouseY);
        const position = {
            x: Math.floor(worldY),
            y: Math.floor(worldX)
        };
        const tile = this.getTileAtPosition(position);

        return tile ? { position, tile } : null;
    }

    private getCanvasMousePosition(event: MouseEvent): { x: number; y: number } {
        const rect = this.canvas.getBoundingClientRect();

        return {
            x: ((event.clientX - rect.left) * this.canvas.width) / rect.width,
            y: ((event.clientY - rect.top) * this.canvas.height) / rect.height
        };
    }

    private getCanvasTouchPosition(touch: Touch): Vec2 {
        const rect = this.canvas.getBoundingClientRect();

        return new Vec2(
            ((touch.clientX - rect.left) * this.canvas.width) / rect.width,
            ((touch.clientY - rect.top) * this.canvas.height) / rect.height
        );
    }

    private getTouchMidpoint(firstTouch: Vec2, secondTouch: Vec2): Vec2 {
        return new Vec2((firstTouch.x + secondTouch.x) / 2, (firstTouch.y + secondTouch.y) / 2);
    }

    private getDistanceBetweenPoints(firstPoint: Vec2, secondPoint: Vec2): number {
        return Math.hypot(secondPoint.x - firstPoint.x, secondPoint.y - firstPoint.y);
    }

    private setZoomScale(nextScaleX: number): void {
        const clampedScaleX = Math.min(
            TowerDefenseManager.MAX_TILE_SCALE_X,
            Math.max(TowerDefenseManager.MIN_TILE_SCALE_X, nextScaleX)
        );

        this.mapScale = new Vec2(clampedScaleX, clampedScaleX / 2);
        this.mapOffset = this.getClampedMapOffset(this.mapOffset);
    }

    private placeRandomObstacle(tile: Tile): void {
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

        if (!this.calculatePath()) {
            tile.key = previousTile.key;
            tile.name = previousTile.name;
            this.calculatePath();
        }
    }

    private clearTile(tile: Tile): void {
        if (tile.name === 'spawn' || tile.name === 'goal') {
            return;
        }

        tile.key = [DEFAULT_TILE_KEY];
        tile.name = 'grass';
        this.calculatePath();
    }

    private toggleTileObstacle(tile: Tile): void {
        if (tile.name === 'spawn' || tile.name === 'goal') {
            return;
        }

        if (!this.hasPlacedContent(tile)) {
            this.placeRandomObstacle(tile);
            return;
        }

        this.clearTile(tile);
    }

    private hasPlacedContent(tile: Tile): boolean {
        return tile.key.some(
            (key) =>
                key.startsWith('trees_') ||
                key.startsWith('rocks_') ||
                key.startsWith('crystals_') ||
                key.startsWith('tower_')
        );
    }

    private getClampedMapOffset(nextOffset: Vec2): Vec2 {
        const mapWidth = (this.map[0].length + this.map.length) * this.mapScale.x;
        const mapHeight = (this.map[0].length + this.map.length) * this.mapScale.y;

        const minOffsetX =
            mapWidth <= this.canvas.width
                ? this.map.length * this.mapScale.x
                : this.canvas.width - this.map[0].length * this.mapScale.x;
        const maxOffsetX =
            mapWidth <= this.canvas.width
                ? this.canvas.width - this.map[0].length * this.mapScale.x
                : this.map.length * this.mapScale.x;
        const minOffsetY = mapHeight <= this.canvas.height ? 0 : this.canvas.height - mapHeight;
        const maxOffsetY = mapHeight <= this.canvas.height ? this.canvas.height - mapHeight : 0;

        return new Vec2(
            Math.min(maxOffsetX, Math.max(minOffsetX, nextOffset.x)),
            Math.min(maxOffsetY, Math.max(minOffsetY, nextOffset.y))
        );
    }

    private beginZoomInteraction(): void {
        this.isZoomingWorld = true;

        if (this.zoomEndTimeoutId !== null) {
            window.clearTimeout(this.zoomEndTimeoutId);
            this.zoomEndTimeoutId = null;
        }
    }

    private finishZoomInteractionSoon(): void {
        if (this.zoomEndTimeoutId !== null) {
            window.clearTimeout(this.zoomEndTimeoutId);
        }

        this.zoomEndTimeoutId = window.setTimeout(() => {
            this.isZoomingWorld = false;
            this.zoomEndTimeoutId = null;
            this.refreshHoveredTileFromPointer();
        }, 120);
    }

    private refreshHoveredTileFromPointer(): void {
        if (!this.lastPointerCanvasPosition) {
            this.setHoveredTilePosition(null);
            return;
        }

        const hit = this.getTileFromCanvasPosition(
            this.lastPointerCanvasPosition.x,
            this.lastPointerCanvasPosition.y
        );
        this.setHoveredTilePosition(hit?.position ?? null);
    }

    private setHoveredTilePosition(position: Vec2 | null): void {
        this.hoveredTilePosition = this.setTileFlag(
            this.hoveredTilePosition,
            position,
            'isHovered'
        );
    }

    private setPressedTilePosition(position: Vec2 | null): void {
        this.pressedTilePosition = this.setTileFlag(
            this.pressedTilePosition,
            position,
            'isPressed'
        );
    }

    private getTileAtPosition(position: Vec2 | null): Tile | null {
        if (
            !position ||
            position.x < 0 ||
            position.x >= this.map.length ||
            position.y < 0 ||
            position.y >= this.map[position.x].length
        ) {
            return null;
        }

        return this.map[position.x][position.y];
    }

    private areTilePositionsEqual(left: Vec2 | null, right: Vec2 | null): boolean {
        return left?.x === right?.x && left?.y === right?.y;
    }

    private setTileFlag(
        currentPosition: Vec2 | null,
        nextPosition: Vec2 | null,
        flag: 'isHovered' | 'isPressed'
    ): Vec2 | null {
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
