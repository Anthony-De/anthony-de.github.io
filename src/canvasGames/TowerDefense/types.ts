type PathKey = `path_${0 | 1 | 2 | 3}`;
type PathTurnKey = `path_turn_${0 | 1 | 2 | 3}`;
type PathTKey = `path_t_${0 | 1 | 2 | 3}`;
type PathCurveKey = `path_curve_${0 | 1 | 2 | 3}`;
type PathRampKey = `path_ramp_${0 | 1 | 2 | 3}`;
type PathBridgeKey = `path_bridge_${0 | 1}`;
type PathKeys = PathKey | PathTurnKey | PathTKey | PathCurveKey | PathRampKey | PathBridgeKey;

type GrassRampKey = `grass_ramp_${0 | 1 | 2 | 3}`;
type GrassSlopeKey = `grass_slope_${0 | 1 | 2 | 3}`;
type GrassKey = `grass_${0 | 1 | 2 | 3}`;
type GrassKeys = GrassRampKey | GrassSlopeKey | GrassKey;

type WaterCurveKey = `water_curve_${0 | 1 | 2 | 3}`;
type WaterKey = `water_${0 | 1}`;
type WaterKeys = WaterCurveKey | WaterKey;

export type GroundTileKey = PathKeys | GrassKeys | WaterKeys;

export type TreeKey = `trees_${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11}`;
export type RockKey = `rocks_${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7}`;
export type CrystalKey = `crystals_${0 | 1 | 2 | 3}`;
export type DecorationKey = TreeKey | RockKey | CrystalKey;
// export type TowerBaseKey = `tower_base_${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`;
// export type TowerMidKey = `tower_mid_${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`;
// export type TowerTopKey = `tower_top_${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`;
// export type TowerPartKey = TowerBaseKey | TowerMidKey | TowerTopKey;
export type TileKey = GroundTileKey | DecorationKey; // | TowerPartKey;
export type SpriteKey = GroundTileKey | DecorationKey; // | TowerPartKey;

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

export class Sprite {
    path: string;
    spriteKey: SpriteKey;
    image: HTMLCanvasElement;

    constructor(spriteKey: SpriteKey, image: HTMLCanvasElement, path: string) {
        this.spriteKey = spriteKey;
        this.image = image;
        this.path = path;
    }
}

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

export interface Tile {
    name: string;
    key: TileKey[];
    distanceToGoal?: number;
    selectable?: boolean;
    isHovered?: boolean;
    isPressed?: boolean;
}

export interface Neighbors {
    up?: Tile;
    down?: Tile;
    left?: Tile;
    right?: Tile;
}
