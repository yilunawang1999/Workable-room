import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title:'A workable world · 縫熊志', description:'A quiet interactive room inspired by Xi Xi’s The Teddy Bear Chronicles. A research prototype exploring literature, making and reorientation.', icons:{icon:'/favicon.svg'} };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>;}
