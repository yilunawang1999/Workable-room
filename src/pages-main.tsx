import { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import '../app/globals.css';

// Use the same experience as the Vinext route, without importing its server shell.
const Experience = lazy(() => import('../components/experience/Experience'));
const root = document.getElementById('root');
if (!root) throw new Error('The experience root element is missing.');

createRoot(root).render(
  <Suspense fallback={<main className="loading-room"><span>A workable world</span><p>Opening the room…</p></main>}>
    <Experience />
  </Suspense>,
);
