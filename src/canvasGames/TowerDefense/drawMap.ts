import { type Sprite, MapDrawConfig, Tile, Vec2 } from './types';
import { TILE_SIZE } from './constants';

export class MapDrawer {
    public static drawMap(
        ctx: CanvasRenderingContext2D,
        tiles: Tile[][],
        sprites: Sprite[],
        config?: MapDrawConfig
    ): void {
        const {
            offsetX = 0,
            offsetY = 0,
            showTileCoords = false,
            showTileOrigins = false,
            showGrid = false,
            showDistanceToGoal = false,
            showKeys = false,
            showTileNames = false
        } = config ?? {};

        let overlayTile: Tile | null = null;
        let overlayCoords: Vec2 | null = null;

        for (let row = 0; row < tiles.length; row++) {
            for (let col = 0; col < tiles[row].length; col++) {
                const tile: Tile = tiles[row][col];
                const tileSprites: Sprite[] = sprites.filter((s) => tile.key.includes(s.spriteKey));

                const x = (col - row) * (TILE_SIZE / 2) + offsetX;
                const y = (col + row) * (TILE_SIZE / 4) + offsetY;

                if (tileSprites.length > 0) {
                    this.drawTile(ctx, tileSprites, x, y);
                    if (this.isOverlayNeeded(tile)) {
                        overlayTile = tile;
                        overlayCoords = new Vec2(x, y);
                    }
                }
                if (showTileOrigins) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.beginPath();
                    ctx.ellipse(x, y, 3, 3, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        if (overlayTile && overlayCoords)
            this.drawTileOverlay(ctx, overlayTile, overlayCoords.x, overlayCoords.y);

        // Draw 2.5D grid for debugging.
        if (showGrid || showTileCoords || showDistanceToGoal || showKeys || showTileNames) {
            for (let row = 0; row < tiles.length; row++) {
                for (let col = 0; col < tiles[row].length; col++) {
                    const x = (col - row) * (TILE_SIZE / 2) + offsetX;
                    const y = (col + row) * (TILE_SIZE / 4) + offsetY;

                    if (showGrid) {
                        ctx.strokeStyle = 'rgb(255, 255, 255)';
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        ctx.lineTo(x + TILE_SIZE / 2, y + TILE_SIZE / 4);
                        ctx.lineTo(x, y + TILE_SIZE / 2);
                        ctx.lineTo(x - TILE_SIZE / 2, y + TILE_SIZE / 4);
                        ctx.closePath();
                        ctx.stroke();
                    }

                    if (showTileCoords) {
                        ctx.font = '10px MONOSPACE';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                        ctx.fillText(`${col},${row}`, x, y + TILE_SIZE / 4);
                    }

                    if (showDistanceToGoal) {
                        const tile = tiles[row][col];

                        ctx.font = '10px MONOSPACE';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                        ctx.fillText(`${tile.distanceToGoal}`, x, y + TILE_SIZE / 4);
                    }

                    if (showKeys) {
                        const tile = tiles[row][col];

                        ctx.font = '10px MONOSPACE';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                        ctx.fillText(`${tile.key ?? ''}`, x, y + TILE_SIZE / 4);
                    }

                    if (showTileNames) {
                        const tile = tiles[row][col];

                        ctx.font = '10px MONOSPACE';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                        ctx.fillText(`${tile.name ?? ''}`, x, y + TILE_SIZE / 4);
                    }
                }
            }
        }
    }

    private static isOverlayNeeded = (tile: Tile): boolean => !!tile.isHovered || !!tile.isPressed;

    public static drawTileOverlay(
        ctx: CanvasRenderingContext2D,
        tile: Tile,
        x: number,
        y: number
    ): void {
        const fillColor = tile.isPressed ? 'rgba(250, 204, 21, 0.8)' : 'rgba(255, 255, 255, 0.35)';

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = tile.isHovered ? 'rgba(255, 255, 255, 0.9)' : fillColor;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + TILE_SIZE / 2, y + TILE_SIZE / 4);
        ctx.lineTo(x, y + TILE_SIZE / 2);
        ctx.lineTo(x - TILE_SIZE / 2, y + TILE_SIZE / 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    public static drawTile(
        ctx: CanvasRenderingContext2D,
        tileParts: Sprite[],
        x: number,
        y: number
    ): void {
        for (let i = 0; i < tileParts.length; i++) {
            const part = tileParts[i];
            const spriteHeight = TILE_SIZE * (part.image.height / part.image.width);
            const bleed = 2; // To prevent gaps between tiles

            ctx.drawImage(
                part.image,
                x - TILE_SIZE / 2 - bleed,
                y - spriteHeight + TILE_SIZE * 0.75 - (TILE_SIZE / 4) * i - bleed,
                TILE_SIZE + bleed * 2,
                spriteHeight + bleed * 2
            );
        }
    }
}
