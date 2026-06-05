import { Sprite, SpriteKey } from '../canvasGames/TowerDefense/types';

export class ResourceManager {
    private static imageCache = new Map<string, Promise<Sprite>>();
    private static fontCache = new Map<string, Promise<void>>();

    public static async loadImages(imageUrls: Record<string, string>): Promise<Sprite[]> {
        const sprites = await Promise.all(
            Object.entries(imageUrls).map(([path, imageSrc]) => {
                const cached = this.imageCache.get(path);
                if (cached) return cached;

                const promise = this.loadSpriteImage(path, imageSrc);
                this.imageCache.set(path, promise);
                return promise;
            })
        );

        return sprites;
    }

    public static async loadFonts(fontUrls: Record<string, string>): Promise<void> {
        await Promise.all(
            Object.entries(fontUrls).map(([path, fontUrl]) => {
                const cached = this.fontCache.get(path);
                if (cached) return cached;

                const promise = this.loadFontFace(path, fontUrl);
                this.fontCache.set(path, promise);
                return promise;
            })
        );
    }

    private static async loadSpriteImage(path: string, imageSrc: string): Promise<Sprite> {
        const image = new Image();
        image.decoding = 'async';
        image.src = imageSrc;

        await image.decode();

        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error(`Failed to create canvas for ${path}`);

        ctx.drawImage(image, 0, 0);

        const key = path
            .split('map_tiles')[1]
            .slice(1)
            .replace(/\//g, '_')
            .replace(/\.png$/, '') as SpriteKey;

        return new Sprite(key, canvas, path);
    }

    private static async loadFontFace(path: string, fontUrl: string): Promise<void> {
        const fontName = this.getFontNameFromPath(path);
        const font = new FontFace(fontName, `url(${fontUrl})`);
        const loadedFont = await font.load();
        document.fonts.add(loadedFont);
    }

    private static getFontNameFromPath(path: string): string {
        const filename = path.split('/').pop() ?? path;

        return filename.replace(/\.ttf$/, '');
    }
}
