import { TileKey } from './types';

export const TILE_SIZE = 75;

export const STARTMENU_MAP = {
    tiles: [
        [
            'path_0',
            'path_1',
            'path_2',
            'path_3',
            'path_4',
            'path_5',
            'path_6',
            'path_7',
            'path_8',
            'path_9',
            'path_10'
        ],
        [
            'path_11',
            'path_12',
            'path_13',
            'path_14',
            'path_15',
            'path_16',
            'path_17',
            'path_18',
            'path_19',
            'path_20',
            'path_21'
        ],
        [
            'landscape_0',
            'landscape_1',
            'landscape_2',
            'landscape_3',
            'landscape_4',
            'landscape_5',
            'landscape_6',
            'landscape_7',
            'landscape_8',
            'landscape_9',
            'landscape_10',
            'landscape_11'
        ],
        ['snow_path_0', 'snow_path_1', 'snow_path_2', 'snow_path_3', 'snow_path_4', 'snow_path_5'],
        [
            'tree_0',
            'tree_1',
            'tree_2',
            'tree_3',
            'tree_4',
            'tree_5',
            'tree_6',
            'tree_7',
            'tree_8',
            'tree_9',
            'tree_10',
            'tree_11'
        ],
        ['rock_0', 'rock_1', 'rock_2', 'rock_3', 'rock_4', 'rock_5', 'rock_6', 'rock_7'],
        ['crystal_0', 'crystal_1', 'crystal_2', 'crystal_3']
    ] as TileKey[][],

    // Render these with normal UI/text, not tile sprites.
    ui: {
        title: {
            text: 'Tower Defense',
            x: 8,
            y: 2
        },

        buttons: [
            // { id: 'start', text: 'Start Game', x: 8, y: 4 },
            // { id: 'levels', text: 'Select Level', x: 8, y: 5 },
            // { id: 'settings', text: 'Settings', x: 8, y: 6 },
            // { id: 'quit', text: 'Quit', x: 8, y: 7 }
        ]
    }
};

export const DIRECTIONS: { key: string; x: number; y: number }[] = [
    { key: 'up', x: 0, y: -1 },
    { key: 'down', x: 0, y: 1 },
    { key: 'left', x: -1, y: 0 },
    { key: 'right', x: 1, y: 0 }
];
