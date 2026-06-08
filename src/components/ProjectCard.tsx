import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ProjectCard.module.css';

export type ProjectVariant =
    | 'tower-defense'
    | 'chess'
    | 'tic-tac-toe'
    | 'snake'
    | '2048'
    | 'minesweeper'
    | 'sudoku';

const ProjectCard: React.FC<{
    title: string;
    description: string;
    link: string;
    variant: ProjectVariant;
    inProgress?: boolean;
}> = ({ title, description, link, variant, inProgress = false }) => {
    const className = [
        styles.projectCard,
        inProgress ? styles.playable : styles.planned,
    ].join(' ');

    const content = (
        <>
            <div className={styles.visual} data-variant={variant} aria-hidden="true">
                <span />
                <span />
                <span />
            </div>
            <div className={styles.content}>
                <div className={styles.cardHeader}>
                    <h2>{title}</h2>
                    <span className={styles.status}>
                        {inProgress ? 'Playable' : 'Planned'}
                    </span>
                </div>
                <p>{description}</p>
                <span className={styles.action}>
                    {inProgress ? 'Play now' : 'Coming soon'}
                </span>
            </div>
        </>
    );

    if (inProgress) {
        return (
            <Link className={className} to={link} aria-label={`Play ${title}`}>
                {content}
            </Link>
        );
    }

    return <article className={className}>{content}</article>;
};

export default ProjectCard;
