import { CanvasFrame } from '../TowerDefense/types';

type TileStyle = {
    background: string;
    text: string;
};

type TileMoveAnimation = {
    value: number;
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
};

type LineResult = {
    value: number;
    sourceIndices: number[];
};

export class Game2048Manager {
    private static readonly gridSize = 4;
    private static readonly boardTheme = {
        pageGradientStart: '#f8f5ee',
        pageGradientMid: '#edf4ef',
        pageGradientEnd: '#f1ece4',
        boardOuter: '#c9bba8',
        boardInner: '#b9aa95',
        boardStroke: '#8a4b2e',
        emptyCell: 'rgba(255, 253, 248, 0.2)',
        emptyCellStroke: 'rgba(255, 247, 237, 0.4)'
    };
    private static readonly defaultTileStyle: TileStyle = {
        background: '#8a4b2e',
        text: '#f9f6f2'
    };
    private static readonly tileStyles: { readonly [value: number]: TileStyle } = {
        2: { background: '#eee4da', text: '#776e65' },
        4: { background: '#ede0c8', text: '#776e65' },
        8: { background: '#f2b179', text: '#f9f6f2' },
        16: { background: '#f59563', text: '#f9f6f2' },
        32: { background: '#f67c5f', text: '#f9f6f2' },
        64: { background: '#f65e3b', text: '#f9f6f2' },
        128: { background: '#edcf72', text: '#f9f6f2' },
        256: { background: '#edcc61', text: '#f9f6f2' },
        512: { background: '#edc850', text: '#f9f6f2' },
        1024: { background: '#edc53f', text: '#f9f6f2' },
        2048: { background: '#edc22e', text: '#f9f6f2' }
    };

    private grid: number[][];
    public assetsLoaded = false;

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private activeMoveAnimations: TileMoveAnimation[] = [];
    private pendingGrid: number[][] | null = null;
    private moveAnimationElapsedMs = 0;
    private readonly moveAnimationDurationMs = 130;

    constructor(canvas?: HTMLCanvasElement) {
        this.canvas = canvas || document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

        this.grid = this.createEmptyGrid();
        this.addRandomTile();
        this.addRandomTile();

        this.addEventListeners();
    }

    private static getTileStyle(value: number): TileStyle {
        return Game2048Manager.tileStyles[value] ?? Game2048Manager.defaultTileStyle;
    }

    private createEmptyGrid(): number[][] {
        return Array.from({ length: Game2048Manager.gridSize }, () =>
            Array(Game2048Manager.gridSize).fill(0)
        );
    }

    private addRandomTile(number?: number): void {
        const emptyTiles: { x: number; y: number }[] = [];
        for (let row = 0; row < Game2048Manager.gridSize; row++) {
            for (let col = 0; col < Game2048Manager.gridSize; col++) {
                if (this.grid[row][col] === 0) {
                    emptyTiles.push({ x: col, y: row });
                }
            }
        }

        if (emptyTiles.length === 0) return;

        const { x, y } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        if (number) {
            this.grid[y][x] = number;
        } else {
            this.grid[y][x] =
                Math.random() < 0.9
                    ? 2
                    : Math.random() < 0.9
                      ? 4
                      : Math.random() < 0.9
                        ? 8
                        : Math.random() < 0.9
                          ? 16
                          : Math.random() < 0.9
                            ? 32
                            : Math.random() < 0.9
                              ? 64
                              : Math.random() < 0.9
                                ? 128
                                : Math.random() < 0.9
                                  ? 256
                                  : Math.random() < 0.9
                                    ? 512
                                    : Math.random() < 0.9
                                      ? 1024
                                      : 2048;
        }
    }

    public async loadAssets(): Promise<void> {
        return Promise.resolve();
    }

    public draw(_frame: CanvasFrame): void {
        if (this.pendingGrid) {
            this.moveAnimationElapsedMs += _frame.deltaTime;
            if (this.moveAnimationElapsedMs >= this.moveAnimationDurationMs) {
                this.grid = this.pendingGrid;
                this.pendingGrid = null;
                this.activeMoveAnimations = [];
                this.moveAnimationElapsedMs = 0;
                this.addRandomTile();
            }
        }

        // Background
        const pageGradient = this.ctx.createLinearGradient(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
        pageGradient.addColorStop(0, Game2048Manager.boardTheme.pageGradientStart);
        pageGradient.addColorStop(0.48, Game2048Manager.boardTheme.pageGradientMid);
        pageGradient.addColorStop(1, Game2048Manager.boardTheme.pageGradientEnd);
        this.ctx.fillStyle = pageGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = 'rgba(46, 125, 91, 0.14)';
        this.ctx.beginPath();
        this.ctx.arc(
            this.canvas.width * 0.08,
            this.canvas.height * 0.06,
            this.canvas.width * 0.18,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        this.ctx.fillStyle = 'rgba(197, 118, 58, 0.14)';
        this.ctx.beginPath();
        this.ctx.arc(
            this.canvas.width * 0.9,
            this.canvas.height * 0.12,
            this.canvas.width * 0.17,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        // Border for game area
        this.ctx.strokeStyle = Game2048Manager.boardTheme.boardStroke;
        const borderSize = 8;
        this.ctx.lineWidth = borderSize;

        const available = Math.min(this.canvas.width, this.canvas.height);
        const tileGap = Math.max(6, Math.floor(available * 0.012));
        const tileSize = Math.floor(
            (available * 0.65 - tileGap * (Game2048Manager.gridSize + 1)) / Game2048Manager.gridSize
        );

        const gameAreaSize =
            tileSize * Game2048Manager.gridSize + tileGap * (Game2048Manager.gridSize + 1);
        const offset = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        const boardX = offset.x - gameAreaSize / 2;
        const boardY = offset.y - gameAreaSize / 2;

        this.ctx.fillStyle = Game2048Manager.boardTheme.boardOuter;
        this.drawRoundedRect(
            boardX - borderSize,
            boardY - borderSize,
            gameAreaSize + borderSize * 2,
            gameAreaSize + borderSize * 2,
            16
        );
        this.ctx.fill();

        this.ctx.fillStyle = Game2048Manager.boardTheme.boardInner;
        this.drawRoundedRect(boardX, boardY, gameAreaSize, gameAreaSize, 12);
        this.ctx.fill();

        this.drawRoundedRect(
            boardX - borderSize / 2,
            boardY - borderSize / 2,
            gameAreaSize + borderSize,
            gameAreaSize + borderSize,
            14
        );
        this.ctx.stroke();

        this.ctx.font = `700 ${tileSize / 3.2}px 'Segoe UI', Arial, sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        const movingSourceCells = new Set<string>();
        for (const animation of this.activeMoveAnimations) {
            movingSourceCells.add(`${animation.startRow},${animation.startCol}`);
        }

        for (let row = 0; row < Game2048Manager.gridSize; row++) {
            for (let col = 0; col < Game2048Manager.gridSize; col++) {
                if (this.pendingGrid && movingSourceCells.has(`${row},${col}`)) {
                    continue;
                }

                const value = this.grid[row][col];
                const pos = {
                    x: boardX + tileGap + col * (tileSize + tileGap),
                    y: boardY + tileGap + row * (tileSize + tileGap)
                };

                this.ctx.fillStyle = Game2048Manager.boardTheme.emptyCell;
                this.drawRoundedRect(
                    pos.x,
                    pos.y,
                    tileSize,
                    tileSize,
                    Math.max(8, tileSize * 0.08)
                );
                this.ctx.fill();
                this.ctx.strokeStyle = Game2048Manager.boardTheme.emptyCellStroke;
                this.ctx.lineWidth = 1;
                this.ctx.stroke();

                if (value !== 0) {
                    this.drawTile(value, pos.x, pos.y, tileSize);
                }
            }
        }

        if (this.pendingGrid && this.activeMoveAnimations.length > 0) {
            const progress = Math.min(
                this.moveAnimationElapsedMs / this.moveAnimationDurationMs,
                1
            );
            const easedProgress = 1 - Math.pow(1 - progress, 3);

            for (const animation of this.activeMoveAnimations) {
                const startPos = {
                    x: boardX + tileGap + animation.startCol * (tileSize + tileGap),
                    y: boardY + tileGap + animation.startRow * (tileSize + tileGap)
                };
                const endPos = {
                    x: boardX + tileGap + animation.endCol * (tileSize + tileGap),
                    y: boardY + tileGap + animation.endRow * (tileSize + tileGap)
                };

                const x = startPos.x + (endPos.x - startPos.x) * easedProgress;
                const y = startPos.y + (endPos.y - startPos.y) * easedProgress;
                this.drawTile(animation.value, x, y, tileSize);
            }
        }
    }

    private drawTile(value: number, x: number, y: number, tileSize: number): void {
        const tileStyle = Game2048Manager.getTileStyle(value);
        this.ctx.shadowColor = 'rgba(31, 41, 51, 0.12)';
        this.ctx.shadowBlur = Math.max(4, tileSize * 0.06);
        this.ctx.shadowOffsetY = Math.max(1, tileSize * 0.03);
        this.ctx.fillStyle = tileStyle.background;
        this.drawRoundedRect(x, y, tileSize, tileSize, Math.max(8, tileSize * 0.08));
        this.ctx.fill();
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.fillStyle = tileStyle.text;
        this.ctx.fillText(value.toString(), x + tileSize / 2, y + tileSize / 2);
    }

    private drawRoundedRect(
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number
    ): void {
        const r = Math.max(0, Math.min(radius, width / 2, height / 2));
        this.ctx.beginPath();
        this.ctx.moveTo(x + r, y);
        this.ctx.arcTo(x + width, y, x + width, y + height, r);
        this.ctx.arcTo(x + width, y + height, x, y + height, r);
        this.ctx.arcTo(x, y + height, x, y, r);
        this.ctx.arcTo(x, y, x + width, y, r);
        this.ctx.closePath();
    }

    private getOrientedPosition(
        direction: 'up' | 'down' | 'left' | 'right',
        lineIndex: number,
        orientedIndex: number
    ): { row: number; col: number } {
        const maxIndex = Game2048Manager.gridSize - 1;

        if (direction === 'left') {
            return { row: lineIndex, col: orientedIndex };
        }
        if (direction === 'right') {
            return { row: lineIndex, col: maxIndex - orientedIndex };
        }
        if (direction === 'up') {
            return { row: orientedIndex, col: lineIndex };
        }

        return { row: maxIndex - orientedIndex, col: lineIndex };
    }

    private processOrientedLine(line: number[]): LineResult[] {
        const nonZeroTiles = line
            .map((value, index) => ({ value, index }))
            .filter((item) => item.value !== 0);
        const result: LineResult[] = [];

        for (let i = 0; i < nonZeroTiles.length; i++) {
            const current = nonZeroTiles[i];
            const next = nonZeroTiles[i + 1];

            if (next && current.value === next.value) {
                result.push({
                    value: current.value * 2,
                    sourceIndices: [current.index, next.index]
                });
                i++;
            } else {
                result.push({ value: current.value, sourceIndices: [current.index] });
            }
        }

        while (result.length < Game2048Manager.gridSize) {
            result.push({ value: 0, sourceIndices: [] });
        }

        return result;
    }

    public moveTiles(direction: 'up' | 'down' | 'left' | 'right'): void {
        if (this.pendingGrid) {
            return;
        }

        const nextGrid = this.createEmptyGrid();
        const animations: TileMoveAnimation[] = [];

        for (let lineIndex = 0; lineIndex < Game2048Manager.gridSize; lineIndex++) {
            const orientedLine: number[] = [];
            for (let orientedIndex = 0; orientedIndex < Game2048Manager.gridSize; orientedIndex++) {
                const pos = this.getOrientedPosition(direction, lineIndex, orientedIndex);
                orientedLine.push(this.grid[pos.row][pos.col]);
            }

            const lineResult = this.processOrientedLine(orientedLine);

            for (let targetIndex = 0; targetIndex < Game2048Manager.gridSize; targetIndex++) {
                const entry = lineResult[targetIndex];
                const targetPos = this.getOrientedPosition(direction, lineIndex, targetIndex);
                nextGrid[targetPos.row][targetPos.col] = entry.value;

                if (entry.sourceIndices.length === 0) {
                    continue;
                }

                for (const sourceIndex of entry.sourceIndices) {
                    const sourcePos = this.getOrientedPosition(direction, lineIndex, sourceIndex);
                    const sourceValue = this.grid[sourcePos.row][sourcePos.col];
                    const isMergeTile = entry.sourceIndices.length > 1;
                    const hasMoved =
                        sourcePos.row !== targetPos.row || sourcePos.col !== targetPos.col;

                    if (sourceValue !== 0 && (isMergeTile || hasMoved)) {
                        animations.push({
                            value: sourceValue,
                            startRow: sourcePos.row,
                            startCol: sourcePos.col,
                            endRow: targetPos.row,
                            endCol: targetPos.col
                        });
                    }
                }
            }
        }

        const moved = nextGrid.some((row, rowIndex) =>
            row.some((value, colIndex) => value !== this.grid[rowIndex][colIndex])
        );

        if (!moved) {
            return;
        }

        this.pendingGrid = nextGrid;
        this.activeMoveAnimations = animations;
        this.moveAnimationElapsedMs = 0;
    }

    private handleKeyDown = (event: KeyboardEvent) => {
        if (!event.key.startsWith('Arrow')) {
            return;
        }

        event.preventDefault();

        if (this.pendingGrid) {
            return;
        }

        if (event.key === 'ArrowUp') {
            this.moveTiles('up');
        } else if (event.key === 'ArrowDown') {
            this.moveTiles('down');
        } else if (event.key === 'ArrowLeft') {
            this.moveTiles('left');
        } else if (event.key === 'ArrowRight') {
            this.moveTiles('right');
        }
    };

    private handleResize = (): void => {
        // Handle canvas resizing if needed
    };

    public destroy(): void {
        this.removeEventListeners();
    }

    public addEventListeners(): void {
        // Handle key presses for moving tiles

        window.addEventListener('resize', this.handleResize);
        window.addEventListener('keydown', this.handleKeyDown);
    }

    public removeEventListeners(): void {
        // Remove event listeners when the game is destroyed
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('keydown', this.handleKeyDown);
    }
}

export default Game2048Manager;
