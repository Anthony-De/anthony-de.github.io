export type PathKey =
    `path_${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21}`;
export type SnowPathKey = `snow_path_${0 | 1 | 2 | 3 | 4 | 5}`;
export type LandscapeKey = `landscape_${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11}`;
export type TileKey = LandscapeKey | PathKey | SnowPathKey;

export type TreeKey = `trees_${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11}`;
export type RockKey = `rocks_${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7}`;
export type CrystalKey = `crystals_${0 | 1 | 2 | 3}`;
export type DecorationKey = TreeKey | RockKey | CrystalKey;

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
    name: TileKey | DecorationKey;
    image: HTMLCanvasElement;
};
