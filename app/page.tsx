'use client';

import dynamic from 'next/dynamic';
const Experience = dynamic(() => import('@/components/experience/Experience'), { ssr: false, loading: () => <main className="loading-room"><span>A workable world</span><p>Opening the room…</p></main> });
export default function Home() { return <Experience />; }
