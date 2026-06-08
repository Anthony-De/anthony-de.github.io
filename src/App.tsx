import { useEffect } from 'react';
import styles from './App.module.css';
import ProjectCard, { type ProjectVariant } from './components/ProjectCard';

type Project = {
    title: string;
    description: string;
    link: string;
    variant: ProjectVariant;
    inProgress?: boolean;
};

const projects: Project[] = [
    {
        title: 'Tower Defense',
        description: 'Single player tower defense game',
        link: '/Tower-Defense',
        variant: 'tower-defense',
        inProgress: true
    },
    {
        title: 'Chess',
        description: 'Single player chess game',
        link: '/Chess-Game',
        variant: 'chess'
    },
    {
        title: 'Tic Tac Toe',
        description: 'Single player tic tac toe game',
        link: '/Tic-Tac-Toe',
        variant: 'tic-tac-toe'
    },
    {
        title: 'Snake',
        description: 'Single player snake game',
        link: '/Snake-Game',
        variant: 'snake'
    },
    {
        title: '2048',
        description: 'Single player 2048 game',
        link: '/2048',
        variant: '2048',
        inProgress: true
    },
    {
        title: 'Minesweeper',
        description: 'Single player minesweeper game',
        link: '/Minesweeper-Game',
        variant: 'minesweeper'
    },
    {
        title: 'Sudoku',
        description: 'Single player sudoku game',
        link: '/Sudoku-Game',
        variant: 'sudoku'
    }
];

function App() {
    useEffect(() => {
        document.title = 'Anthony-De Website';
    }, []);

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <div>
                    <p className={styles.kicker}>Game Projects</p>
                    <h1>Projects</h1>
                </div>
                <p className={styles.summary}>1 playable, 6 planned</p>
            </header>

            <section className={styles.projectGrid} aria-label="Project list">
                {projects.map((project) => (
                    <ProjectCard key={project.title} {...project} />
                ))}
            </section>
        </main>
    );
}

export default App;
