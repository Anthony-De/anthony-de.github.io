import { SpriteKey, SpriteSheetFrame, Sprite } from '../canvasGames/TowerDefense/types';

export class ImageProcessing {
    private static getNumberAttribute(element: Element, attributeName: string): number | null {
        const value = element.getAttribute(attributeName);

        if (value === null) {
            return null;
        }

        const parsed = Number.parseInt(value, 10);
        return Number.isFinite(parsed) ? parsed : null;
    }

    private static removeExtension(filename: string): string {
        const lastDotIndex = filename.lastIndexOf('.');

        if (lastDotIndex === -1) {
            return filename;
        }

        return filename.substring(0, lastDotIndex);
    }

    private static getSpriteName(filename: string): SpriteKey {
        const sourceName = this.removeExtension(filename);
        return (
            // spriteNameAliases[sourceName] ??
            sourceName as SpriteKey
        );
    }

    private static parseSpriteSheetXml(spriteSheetXml: string): SpriteSheetFrame[] {
        const xmlDocument = new DOMParser().parseFromString(spriteSheetXml, 'application/xml');

        if (xmlDocument.querySelector('parsererror')) {
            return [];
        }

        const frames: SpriteSheetFrame[] = [];

        for (const subTexture of xmlDocument.querySelectorAll('SubTexture')) {
            const name = subTexture.getAttribute('name');
            const x = this.getNumberAttribute(subTexture, 'x');
            const y = this.getNumberAttribute(subTexture, 'y');
            const width = this.getNumberAttribute(subTexture, 'width');
            const height = this.getNumberAttribute(subTexture, 'height');

            if (
                name === null ||
                x === null ||
                y === null ||
                width === null ||
                height === null ||
                width <= 0 ||
                height <= 0
            ) {
                continue;
            }

            frames.push({ name, x, y, width, height });
        }

        return frames;
    }

    public static extractSpritesFromSheet(
        sheetImage: HTMLImageElement,
        spriteSheetXml: string
    ): Sprite[] {
        const sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = sheetImage.width;
        sourceCanvas.height = sheetImage.height;

        const sourceCtx = sourceCanvas.getContext('2d');

        if (!sourceCtx) {
            return [];
        }

        sourceCtx.drawImage(sheetImage, 0, 0);

        const sprites: Sprite[] = [];

        for (const frame of this.parseSpriteSheetXml(spriteSheetXml)) {
            const cropX = Math.max(0, frame.x);
            const cropY = Math.max(0, frame.y);
            const cropW = Math.min(frame.width, sourceCanvas.width - cropX);
            const cropH = Math.min(frame.height, sourceCanvas.height - cropY);

            if (cropW <= 0 || cropH <= 0) {
                continue;
            }

            const spriteCanvas: Sprite = {
                type: 'rock',
                name: this.getSpriteName(frame.name),
                image: document.createElement('canvas') as HTMLCanvasElement
            };
            spriteCanvas.type = spriteCanvas.name.includes('rock')
                ? 'rock'
                : spriteCanvas.name.includes('tree')
                  ? 'tree'
                  : spriteCanvas.name.includes('crystal')
                    ? 'crystal'
                    : spriteCanvas.name.includes('path')
                      ? 'path'
                      : spriteCanvas.name.includes('landscape')
                        ? 'landscape'
                        : 'tower';
            spriteCanvas.image.width = cropW;
            spriteCanvas.image.height = cropH;
            const spriteCtx = spriteCanvas.image.getContext('2d');

            if (!spriteCtx) {
                continue;
            }

            spriteCtx.drawImage(sourceCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

            sprites.push(spriteCanvas);
        }

        return sprites;
    }
}
