export type PathKey =
    `path_${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21}`;
export type SnowPathKey = `snow_path_${0 | 1 | 2 | 3 | 4 | 5}`;
export type LandscapeKey = `landscape_${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11}`;
export type GroundTileKey = LandscapeKey | PathKey | SnowPathKey;

export type TreeKey = `tree_${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11}`;
export type RockKey = `rock_${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7}`;
export type CrystalKey = `crystal_${0 | 1 | 2 | 3}`;
export type DecorationKey = TreeKey | RockKey | CrystalKey;
export type PlaceholderTileKey = 'spawn' | 'goal';
export type TowerKey =
    `tower_${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54}`;
export type TileKey = GroundTileKey | DecorationKey | PlaceholderTileKey | TowerKey;
export type SpriteKey = GroundTileKey | DecorationKey | TowerKey;

export type Decoration = {
    sprite: DecorationKey;
    x: number;
    y: number;
    width: number;
    height: number;
};

export type SpriteSheetFrame = {
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
};

export interface CanvasFrame {
    deltaTime: number;
    elapsedTime: number;
    frame: number;
}

export type SpriteType = 'rock' | 'tree' | 'crystal' | 'landscape' | 'path' | 'tower';

export type Sprite = {
    type: SpriteType;
    name: SpriteKey;
    image: HTMLCanvasElement;
};

export type MapDrawConfig = {
    offsetX?: number;
    offsetY?: number;
    padding?: number;
    showTileCoords?: boolean;
    showTileOrigins?: boolean;
    showTileNames?: boolean;
    showGrid?: boolean;
    showDistanceToGoal?: boolean;
    showTileKeys?: boolean;
};

export type Tile = {
    name: string;
    key: TileKey;
    distanceToGoal?: number;
    selectable?: boolean;
    isHovered?: boolean;
    isPressed?: boolean;
};

export type Neighbors = {
    up?: Tile;
    down?: Tile;
    left?: Tile;
    right?: Tile;
};
