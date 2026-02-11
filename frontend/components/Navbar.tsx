'use client';

import { motion } from 'framer-motion';
import { CloudRain, ShieldAlert, bell } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Bell } from 'lucide-react';
import { ModeToggle } from './mode-toggle';

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-center"
    >
      <div className="glass rounded-full px-6 py-3 flex items-center justify-between gap-8 max-w-5xl w-full shadow-lg bg-white/80 dark:bg-black/50 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          <div className="bg-primary p-1.5 rounded-lg">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-500">
            BhaadShurakshaDal
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Home</Link>
          <Link href="/about" className="hover:text-black dark:hover:text-white transition-colors">About</Link>
          <Link href="/alerts" className="hover:text-black dark:hover:text-white transition-colors">Alerts</Link>
          <Link href="/map" className="hover:text-black dark:hover:text-white transition-colors">Map</Link>
          <Link href="/resources" className="hover:text-black dark:hover:text-white transition-colors">Resources</Link>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          <button className="relative p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors">
            <Bell className="w-5 h-5 text-zinc-700 dark:text-zinc-200" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>
          <Link href="/login">
            <button className="bg-primary hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg hover:shadow-blue-500/20">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
