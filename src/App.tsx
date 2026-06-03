import { Link } from 'react-router-dom';
import styles from './App.module.css';
import { useEffect, useState } from 'react';

function App() {
    const [currentProject, setCurrentProject] = useState<string | null>(null);

    useEffect(() => {
        document.title = 'Anthony-De Website';
        setCurrentProject(null);
    }, []);

    if (!currentProject) {
        return (
            <main className={styles.container}>
                <h1>Projects</h1>
                <div className={styles.projectsGrid}>
                    <article className={styles.projectCard}>
                        <h2>Tower defense</h2>
                        <p>Single Player Tower Defense Game</p>
                        <Link to="/Tower-Defense">View Project</Link>
                    </article>
                </div>
            </main>
        );
    } else {
        return (
            <div className={styles.container}>
                <h1>{currentProject}</h1>
                <p>This is a placeholder for the {currentProject} project.</p>
                <p>
                    <Link to="/">Back to Projects</Link>
                </p>
            </div>
        );
    }
}

export default App;
