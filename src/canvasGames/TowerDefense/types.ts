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

type TreeKey = `trees_${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11}`;
type RockKey = `rocks_${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7}`;
type CrystalKey = `crystals_${0 | 1 | 2 | 3}`;
export type DecorationKey = TreeKey | RockKey | CrystalKey;

type TowerColors = 'red';

// Tower Variants:
type ZeroTo1 = 0 | 1;
type ZeroTo2 = ZeroTo1 | 2;
type ZeroTo3 = ZeroTo2 | 3;
type ZeroTo5 = ZeroTo3 | 4 | 5;
type ZeroTo7 = ZeroTo5 | 6 | 7;
type ZeroTo14 = ZeroTo7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

type TowerKey<
    Part extends 'base' | 'mid' | 'top',
    Variant extends string | number
> = `tower_${TowerColors}_${Part}_${Variant}`;

type WideVariant = `high_${ZeroTo5}` | `low_${ZeroTo1}` | ZeroTo1;
type BaseVariant = `inset_${ZeroTo3}` | `wall_${ZeroTo7}` | `wide_${WideVariant}` | ZeroTo2;
type TowerBaseKey = TowerKey<'base', BaseVariant>;

type TowerMidKey = TowerKey<'mid', ZeroTo14>;

type OpenVariant = `open_${`pyramid_${`grass_${ZeroTo2}` | `stone_${ZeroTo2}`}` | ZeroTo2}`;
type ClosedVariant = `closed_${`short_4${ZeroTo1}` | `tall_${ZeroTo1}` | ZeroTo1}`;
type TopVariant = OpenVariant | ClosedVariant;
type TowerTopKey = TowerKey<'top', TopVariant>;
type TowerPartKey = TowerBaseKey | TowerMidKey | TowerTopKey;
export type SpriteKey = GroundTileKey | DecorationKey | TowerPartKey;

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
    showKeys?: boolean;
};

export interface Tile {
    name: string;
    key: SpriteKey[];
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

import type { MouseEvent as ReactMouseEvent } from 'react';

export type CanvasMouseEvent = ReactMouseEvent<HTMLCanvasElement>;
export class Vec2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
