'use client';

import { motion } from 'framer-motion';
import { CloudRain, Droplets, Thermometer, Wind, AlertTriangle } from 'lucide-react';

const mockData = {
  location: "Assam, India",
  riskLevel: "High",
  rainfall: "124mm",
  waterLevel: "Danger (+2.4m)",
  windSpeed: "45 km/h",
};

export default function RiskDashboard() {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 perspective-1000">
      <motion.div
        initial={{ rotateX: 10, opacity: 0 }}
        whileInView={{ rotateX: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="glass rounded-3xl p-8 border border-white/10 relative overflow-hidden group"
      >
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-[80px] group-hover:bg-red-500/30 transition-colors duration-500" />

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-zinc-500 dark:text-zinc-400 font-medium mb-1">Live Monitor</h3>
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                {mockData.location}
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              </h2>
            </div>
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-xl flex items-center gap-2 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-bold">FLOOD RISK: HIGH</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              icon={<CloudRain className="w-6 h-6 text-blue-400" />}
              label="Rainfall (24h)"
              value={mockData.rainfall}
              trend="+12%"
              trendUp={true}
            />
            <StatCard 
              icon={<Droplets className="w-6 h-6 text-cyan-400" />}
              label="Water Level"
              value={mockData.waterLevel}
              trend="+0.5m"
              trendUp={true}
              danger={true}
            />
            <StatCard 
              icon={<Wind className="w-6 h-6 text-emerald-400" />}
              label="Wind Speed"
              value={mockData.windSpeed}
              trend="-5%"
              trendUp={false}
            />
            <StatCard 
              icon={<Thermometer className="w-6 h-6 text-orange-400" />}
              label="Temperature"
              value="24°C"
              trend="Stable"
              trendUp={false}
            />
          </div>

          {/* Graph Placeholder */}
          <div className="mt-8 h-32 w-full bg-white/5 rounded-xl border border-white/5 flex items-end justify-between px-4 pb-2 gap-2 overflow-hidden">
            {[40, 60, 45, 70, 85, 95, 80, 60, 50, 65, 75, 90, 100, 95, 80, 70, 60, 75, 85, 90].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className={`w-full rounded-t-sm ${h > 80 ? 'bg-red-500' : 'bg-blue-500/50'}`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, trendUp, danger = false }: any) {
  return (
    <div className={`p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors ${danger ? 'ring-1 ring-red-500/50 bg-red-500/10' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-lg bg-white/5">{icon}</div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">{label}</p>
        <p className="text-xl font-bold text-zinc-900 dark:text-white mt-1">{value}</p>
      </div>
    </div>
  );
}
