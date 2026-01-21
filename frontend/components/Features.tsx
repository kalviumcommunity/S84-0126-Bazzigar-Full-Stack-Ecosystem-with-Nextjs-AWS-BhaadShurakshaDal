'use client';

import { motion } from 'framer-motion';
import { Bell, Map, Shield, Users } from 'lucide-react';

const features = [
  {
    icon: <Map className="w-8 h-8 text-blue-400" />,
    title: "Interactive Risk Maps",
    description: "Visualize flood zones with high-precision 3D mapping and real-time data overlays."
  },
  {
    icon: <Bell className="w-8 h-8 text-red-400" />,
    title: "Instant Alerts",
    description: "Get notifies via SMS, WhatsApp, and App push notifications seconds before disaster strikes."
  },
  {
    icon: <Shield className="w-8 h-8 text-emerald-400" />,
    title: "Community Safety",
    description: "Access verified safe zones, evacuation routes, and emergency contacts instantly."
  },
  {
    icon: <Users className="w-8 h-8 text-purple-400" />,
    title: "Crowdsourced Data",
    description: "Report local incidents and help improve prediction accuracy for your community."
  }
];

export default function Features() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-zinc-900 dark:text-white">Why BhaadShurakshaDal?</h2>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">Our technology saves lives by bridging the gap between data and action.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass p-8 rounded-3xl hover:bg-white/10 transition-all hover:-translate-y-2 cursor-pointer group"
            >
              <div className="mb-6 p-4 rounded-2xl bg-white/5 w-fit group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white">{feature.title}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
