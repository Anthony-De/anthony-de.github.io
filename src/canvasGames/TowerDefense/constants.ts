import { SpriteKey } from './types';

export const TILE_SIZE = 75;

export const DIRECTIONS: { key: string; x: number; y: number }[] = [
    { key: 'up', x: 0, y: -1 },
    { key: 'down', x: 0, y: 1 },
    { key: 'left', x: -1, y: 0 },
    { key: 'right', x: 1, y: 0 }
];

export const DEFAULT_TILE_KEY: SpriteKey = 'grass_2';
