export default function Footer() {
  return (
    <footer className="py-12 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/50 backdrop-blur-lg">
      <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-slate-600 dark:text-zinc-500 text-sm">
          © 2026 BhaadShurakshaDal. All rights reserved. <br />
          Built by Team Baazigaar.
        </div>
        
        <div className="flex gap-6">
          <a href="#" className="text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white transition-colors font-medium">Privacy</a>
          <a href="#" className="text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white transition-colors font-medium">Terms</a>
          <a href="#" className="text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white transition-colors font-medium">Contact</a>
        </div>
      </div>
    </footer>
  );
}
