import { Sprite, TileKey } from './types';
import { TILE_SIZE } from './constants';

export class MapDrawer {
    private ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    drawMap(
        tiles: TileKey[][],
        sprites: Sprite[],
        offsetX: number = 200,
        offsetY: number = 100,
        debug: boolean = false
    ): void {
        for (let row = 0; row < tiles.length; row++) {
            for (let col = 0; col < tiles[row].length; col++) {
                const sprite: Sprite | undefined = sprites.find((s) => s.name === tiles[row][col]);

                const x = (col - row) * (TILE_SIZE / 2) + offsetX;
                const y = (col + row) * (TILE_SIZE / 4) + offsetY;

                if (sprite) {
                    this.ctx.drawImage(
                        sprite.image,
                        x - TILE_SIZE / 2,
                        y - TILE_SIZE * (sprite.image.height / sprite.image.width) + TILE_SIZE / 2,
                        TILE_SIZE,
                        TILE_SIZE * (sprite.image.height / sprite.image.width)
                    );
                    if (debug) {
                        this.ctx.fillStyle = 'rgb(0, 0, 255)';
                        this.ctx.beginPath();
                        this.ctx.ellipse(x, y, 3, 3, 0, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                }
            }
        }

        // Draw 2.5D grid for debugging.
        if (debug) {
            for (let row = 0; row < tiles.length; row++) {
                for (let col = 0; col < tiles[row].length; col++) {
                    const x = (col - row) * (TILE_SIZE / 2) + offsetX;
                    const y = (col + row) * (TILE_SIZE / 4) + offsetY;
                    this.ctx.strokeStyle = 'rgb(255, 255, 255)';
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, y);
                    this.ctx.lineTo(x + TILE_SIZE / 2, y + TILE_SIZE / 4);
                    this.ctx.lineTo(x, y + TILE_SIZE / 2);
                    this.ctx.lineTo(x - TILE_SIZE / 2, y + TILE_SIZE / 4);
                    this.ctx.closePath();
                    this.ctx.stroke();
                    this.ctx.font = '10px MONOSPACE';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    this.ctx.fillText(`${col},${row}`, x, y + TILE_SIZE / 4);
                    this.ctx.beginPath();
                    this.ctx.ellipse(x, y, 3, 3, 0, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }
    }

    // private getTileImage(tileKey: string): HTMLImageElement | null {
    //     // This function should return the corresponding image for the given tileKey.
    //     // You can implement this based on how you manage your sprite sheets and images.
    //     // For example, you might have a mapping of tile keys to image objects.
    //     // Here, we will just return null as a placeholder.
    //     return null;
    // }

    // drawDecorations(decorations: { sprite: string; x: number; y: number }[]) {
    //     for (const decor of decorations) {
    //         const decorImage = this.getTileImage(decor.sprite);
    //         if (decorImage) {
    //             this.ctx.drawImage(
    //                 decorImage,
    //                 decor.x * TILE_SIZE,
    //                 decor.y * TILE_SIZE,
    //                 TILE_SIZE,
    //                 TILE_SIZE
    //             );
    //         }
    //     }
    // }

    // You can add more methods for drawing paths, towers, enemies, etc. as needed.
}
