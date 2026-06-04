import { Sprite, MapDrawConfig, Tile } from './types';
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
            showGrid = false
        } = config ?? {};

        for (let row = 0; row < tiles.length; row++) {
            for (let col = 0; col < tiles[row].length; col++) {
                const tile = tiles[row][col];
                const sprite: Sprite | undefined = sprites.find((s) => s.name === tile.key);

                const x = (col - row) * (TILE_SIZE / 2) + offsetX;
                const y = (col + row) * (TILE_SIZE / 4) + offsetY;

                if (sprite) {
                    const spriteHeight = TILE_SIZE * (sprite.image.height / sprite.image.width);
                    const spriteYOffset = this.getSpriteYOffset(sprite);

                    ctx.drawImage(
                        sprite.image,
                        x - TILE_SIZE / 2,
                        y - spriteHeight + TILE_SIZE / 2 + spriteYOffset,
                        TILE_SIZE,
                        spriteHeight
                    );
                    if (this.isOverlayNeeded(tile)) {
                        this.drawPlaceholderTile(
                            ctx,
                            tile,
                            x,
                            y - spriteHeight + TILE_SIZE / 2 + spriteYOffset
                        );
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

        // Draw 2.5D grid for debugging.
        if (showGrid || showTileCoords) {
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
                }
            }
        }
    }

    private static isOverlayNeeded(tile: Tile): boolean {
        return (
            tile.name === 'spawn' || tile.name === 'goal' || !!tile.isHovered || !!tile.isPressed
        );
    }

    private static getSpriteYOffset(sprite: Sprite): number {
        return sprite.type === 'landscape' || sprite.type === 'path' ? TILE_SIZE / 4 : 0;
    }

    public static drawPlaceholderTile(
        ctx: CanvasRenderingContext2D,
        tile: Tile,
        x: number,
        y: number
    ): void {
        const fillColor = tile.isPressed
            ? 'rgba(250, 204, 21, 0.8)'
            : tile.name === 'spawn'
              ? 'rgba(34, 197, 94, 0.85)'
              : tile.name === 'goal'
                ? 'rgba(239, 68, 68, 0.85)'
                : 'rgba(255, 255, 255, 0.35)';
        const label =
            tile.name === 'spawn' || tile.name === 'goal' ? tile.name.charAt(0).toUpperCase() : '';

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

        if (label) {
            ctx.fillStyle = 'rgba(38, 38, 38, 0.9)';
            ctx.font = 'bold 14px MONOSPACE';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, x, y + TILE_SIZE / 4);
        }
    }
}
