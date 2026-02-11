'use client';

import { motion } from 'framer-motion';
import { CloudLightning, ArrowRight, ShieldCheck, Waves } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-400/30 dark:bg-blue-500/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-[128px]" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30 dark:opacity-100 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 dark:bg-blue-500/10 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 mb-8 backdrop-blur-sm shadow-sm"
        >
          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
          Live Flood Monitoring System
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:to-white/50"
        >
          Predict. Prepare. <br />
          <span className="text-gradient">Protect.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="max-w-2xl text-lg md:text-xl text-slate-700 dark:text-zinc-400 mb-10 leading-relaxed font-medium"
        >
          Advanced AI-powered flood prediction and early warning system tailored for Indian communities. Real-time data, instant alerts, and lifeline support.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center"
        >
          <button className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-700 dark:bg-primary text-white rounded-xl font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative flex items-center gap-2">
              Check Your Area <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          
          <button className="px-8 py-4 glass text-slate-700 dark:text-white rounded-xl font-bold text-lg hover:bg-white/80 dark:hover:bg-white/10 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border border-slate-200 dark:border-transparent">
            <CloudLightning className="w-5 h-5 text-blue-600 dark:text-white" />
            View Live Map
          </button>
        </motion.div>

        {/* Stats / Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-20 flex flex-wrap justify-center gap-8 md:gap-16"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-500" />
            <span className="font-semibold text-slate-600 dark:text-zinc-300">Govt. Data Integration</span>
          </div>
          <div className="flex items-center gap-3">
            <Waves className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            <span className="font-semibold text-slate-600 dark:text-zinc-300">AI Risk Analysis</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
