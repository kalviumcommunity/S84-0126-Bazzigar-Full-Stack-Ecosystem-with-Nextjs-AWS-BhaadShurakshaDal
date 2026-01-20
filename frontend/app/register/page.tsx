'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Lock, Mail, Github, Chrome, User, Phone,  } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 glass rounded-3xl relative z-10 mx-4 my-10 bg-white/80 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 mb-2">
            Join the Safety Network
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Create an account to receive personalized disaster alerts
          </p>
        </div>

        <form className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium ml-1 text-zinc-700 dark:text-zinc-300">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input 
                type="text" 
                placeholder="John Doe"
                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-zinc-800 rounded-xl px-10 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-zinc-900 dark:text-white"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium ml-1 text-zinc-700 dark:text-zinc-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input 
                type="email" 
                placeholder="citizen@example.com"
                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-zinc-800 rounded-xl px-10 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ml-1 text-zinc-700 dark:text-zinc-300">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input 
                type="tel" 
                placeholder="+91 98765 43210"
                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-zinc-800 rounded-xl px-10 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ml-1 text-zinc-700 dark:text-zinc-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input 
                type="password" 
                placeholder="Create a strong password"
                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-zinc-800 rounded-xl px-10 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <button className="w-full bg-primary hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 mt-2">
            Create Account <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="my-8 flex items-center gap-4 text-xs text-zinc-400 uppercase font-bold tracking-wider">
          <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1" />
          OR
          <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors text-zinc-900 dark:text-white">
            <Chrome className="w-5 h-5" />
            <span>Google</span>
          </button>
          <button className="flex items-center justify-center gap-2 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors text-zinc-900 dark:text-white">
            <Github className="w-5 h-5" />
            <span>GitHub</span>
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-500 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
