import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import App from './App.tsx';
import TowerDefense from './canvasGames/TowerDefense.tsx';

const rootElement = document.querySelector<HTMLElement>('#root');

if (!rootElement) {
  throw new Error('Root element #root was not found in index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/Tower-Defense" element={<TowerDefense />} />
      </Routes>
    </HashRouter>
  </StrictMode>,
);
