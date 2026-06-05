import { Sprite, SpriteKey } from '../canvasGames/TowerDefense/types';

export class ResourceManager {
    public static async loadImages(imageUrls: Record<string, string>): Promise<Sprite[]> {
        const sprites = await Promise.all(
            Object.entries(imageUrls).map(([path, imageSrc]) =>
                this.loadSpriteImage(path, imageSrc)
            )
        );

        return sprites;
    }

    public static async loadFonts(fontUrls: Record<string, string>): Promise<void> {
        await Promise.all(
            Object.entries(fontUrls).map(([path, fontUrl]) => this.loadFontFace(path, fontUrl))
        );
    }

    private static loadSpriteImage(path: string, imageSrc: string): Promise<Sprite> {
        return new Promise((resolve, reject) => {
            const image = new Image();

            image.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;

                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error(`Failed to create canvas for ${path}`));

                ctx.drawImage(image, 0, 0);

                const key = path
                    .split('map_tiles')[1]
                    .slice(1)
                    .replace(/\//g, '_')
                    .replace(/\.png$/, '') as SpriteKey;

                resolve(new Sprite(key, canvas, path));
            };

            image.onerror = () => reject(new Error(`Failed to load image: ${path}`));
            image.src = imageSrc;
        });
    }

    private static loadFontFace(path: string, fontUrl: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const fontName = this.getFontNameFromPath(path);
            const font = new FontFace(fontName, `url(${fontUrl})`);

            font.load()
                .then((loadedFont) => {
                    document.fonts.add(loadedFont);
                    resolve();
                })
                .catch(() => {
                    reject(new Error(`Failed to load font: ${path}`));
                });
        });
    }

    private static getFontNameFromPath(path: string): string {
        const filename = path.split('/').pop() ?? path;

        return filename.replace(/\.ttf$/, '');
    }
}
