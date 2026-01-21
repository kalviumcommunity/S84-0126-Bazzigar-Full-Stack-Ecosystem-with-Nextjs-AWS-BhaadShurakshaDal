'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { BookOpen, Phone, Shield, FileText, Download, MapPin } from "lucide-react";

export default function ResourcesPage() {
  const guides = [
     { title: "Flood Preparation Checklist", desc: "Essential items to pack and steps to take before a flood.", icon: <Shield className="w-6 h-6 text-blue-500" /> },
     { title: "Emergency Contacts", desc: "Direct lines to NDRF, local police, and hospitals.", icon: <Phone className="w-6 h-6 text-green-500" /> },
     { title: "First Aid Basics", desc: "How to treat common injuries during water-borne disasters.", icon: <BookOpen className="w-6 h-6 text-red-500" /> },
     { title: "Evacuation Routes", desc: "Official maps of safe zones and shelter locations.", icon: <MapPin className="w-6 h-6 text-purple-500" /> },
  ];
  
  // Quick fix for MapPin being imported but not used in the initial list if I copied from elsewhere
  // But wait, I need to Import MapPin
  
  return (
    <main className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-32">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-4xl md:text-5xl font-bold mb-6 text-zinc-900 dark:text-white"
          >
            Safety Resources
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-zinc-600 dark:text-zinc-400"
          >
            Essential guides, emergency contacts, and downloadable protocols to keep your family safe.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {guides.map((guide, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.1 }}
               className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 hover:shadow-lg transition-all group cursor-pointer"
             >
               <div className="flex items-start gap-4">
                 <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl group-hover:scale-110 transition-transform border border-zinc-200 dark:border-zinc-700">
                   {guide.icon}
                 </div>
                 <div>
                   <h3 className="text-xl font-bold mb-2 text-zinc-900 dark:text-white">{guide.title}</h3>
                   <p className="text-zinc-600 dark:text-zinc-400 mb-4">{guide.desc}</p>
                   <span className="text-primary font-medium flex items-center gap-2">
                     Read Guide <span className="group-hover:translate-x-1 transition-transform">→</span>
                   </span>
                 </div>
               </div>
             </motion.div>
          ))}
        </div>

        {/* Download Section */}
        <section className="bg-blue-50 dark:bg-primary/5 rounded-3xl p-8 md:p-12 relative overflow-hidden border border-blue-100 dark:border-blue-500/20">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
             <div>
                <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Offline Survival Guide PDF</h2>
                <p className="text-zinc-600 dark:text-zinc-400">Download the complete manual to access safety info without internet.</p>
             </div>
             <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-blue-500/20">
               <Download className="w-5 h-5" />
               Download PDF (4.2 MB)
             </button>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
