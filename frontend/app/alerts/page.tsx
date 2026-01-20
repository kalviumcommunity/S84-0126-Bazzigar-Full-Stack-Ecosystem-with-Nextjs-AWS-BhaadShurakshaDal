'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { AlertTriangle, Info, MapPin, XCircle } from "lucide-react";

export default function AlertsPage() {
  const alerts = [
    {
      type: "critical",
      title: "Flash Flood Warning",
      location: "Guwahati, Assam",
      time: "20 mins ago",
      desc: "Water levels rising rapidly in Brahmaputra. Seek higher ground immediately.",
    },
    {
      type: "warning",
      title: "Heavy Rainfall Alert",
      location: "Silchar, Assam",
      time: "1 hour ago",
      desc: "Continuous heavy rainfall predicted for next 24 hours. Avoid travel.",
    },
    {
      type: "info",
      title: "Safe Zone Update",
      location: "Kaziranga",
      time: "2 hours ago",
      desc: "New relief camps opened at Community Centre. Food and water available.",
    },
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-500/10 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">Active Alerts</h1>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Real-time disaster warnings and safety updates for your region. Stay tuned for official government broadcasts.
          </p>
        </motion.div>

        <div className="grid gap-6">
          {alerts.map((alert, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative overflow-hidden rounded-2xl border p-6 ${
                alert.type === 'critical' 
                  ? 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/30' 
                  : alert.type === 'warning'
                  ? 'bg-orange-50 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/30'
                  : 'bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30'
              }`}
            >
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex gap-4 items-start">
                  <div className={`mt-1 p-2 rounded-full ${
                    alert.type === 'critical' ? 'bg-red-500 text-white' : 
                    alert.type === 'warning' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    {alert.type === 'critical' ? <XCircle className="w-5 h-5" /> : 
                     alert.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1 text-zinc-900 dark:text-white">{alert.title}</h3>
                    <p className="text-sm mb-2 text-zinc-700 dark:text-zinc-300">{alert.desc}</p>
                    <div className="flex items-center gap-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {alert.location}</span>
                      <span>•</span>
                      <span>{alert.time}</span>
                    </div>
                  </div>
                </div>
                
                {alert.type === 'critical' && (
                  <button className="whitespace-nowrap px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-red-500/20">
                    Emergency Action
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
