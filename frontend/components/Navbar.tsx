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
      <div className="glass rounded-full px-6 py-3 flex items-center justify-between gap-8 max-w-5xl w-full shadow-lg bg-white/90 dark:bg-black/50 backdrop-blur-md border border-slate-200 dark:border-transparent">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          <div className="bg-blue-600 dark:bg-primary p-1.5 rounded-lg shadow-md">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-500">
            BhaadShurakshaDal
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700 dark:text-zinc-400">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-white transition-colors">Home</Link>
          <Link href="/alerts" className="hover:text-blue-600 dark:hover:text-white transition-colors">Alerts</Link>
          <Link href="/map" className="hover:text-blue-600 dark:hover:text-white transition-colors">Map</Link>
          <Link href="/resources" className="hover:text-blue-600 dark:hover:text-white transition-colors">Resources</Link>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          <button className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
            <Bell className="w-5 h-5 text-slate-700 dark:text-zinc-200" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>
          <Link href="/login">
            <button className="bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg hover:shadow-blue-500/30">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
