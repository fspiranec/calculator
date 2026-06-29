import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Clean Macro Tracker', description: 'Mobile-first calorie and macro tracking without an account.' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
