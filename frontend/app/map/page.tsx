'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Layers, Locate, Maximize2, Search, MapPin, AlertTriangle, Info } from "lucide-react";
import { useState } from "react";

const mockLocations = [
  { id: 1, name: "Guwahati, Assam", lat: "26.1445° N", lng: "91.7362° E", risk: "high", waterLevel: "+2.4m", rainfall: "124mm" },
  { id: 2, name: "Silchar, Assam", lat: "24.8333° N", lng: "92.7789° E", risk: "moderate", waterLevel: "+1.2m", rainfall: "86mm" },
  { id: 3, name: "Kaziranga, Assam", lat: "26.5775° N", lng: "93.1711° E", risk: "low", waterLevel: "+0.5m", rainfall: "45mm" },
  { id: 4, name: "Dibrugarh, Assam", lat: "27.4728° N", lng: "94.9120° E", risk: "moderate", waterLevel: "+1.5m", rainfall: "92mm" },
  { id: 5, name: "Jorhat, Assam", lat: "26.7509° N", lng: "94.2037° E", risk: "low", waterLevel: "+0.7m", rainfall: "52mm" },
];

export default function MapPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(mockLocations[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const filteredLocations = mockLocations.filter(loc => 
    loc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col pt-24 h-[calc(100vh-64px)]">
        {/* Map Toolbar */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 backdrop-blur z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Live Flood Map</h1>
            <p className="text-sm text-zinc-600 dark:text-muted-foreground">Real-time satellite imagery & river sensors</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input 
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>

          <div className="flex gap-2">
            <button className="p-2 border border-border rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="My Location">
              <Locate className="w-5 h-5" />
            </button>
            <button className="p-2 border border-border rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Layers">
              <Layers className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 border border-border rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" 
              title="Fullscreen"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Map Container with Sidebar */}
        <div className="relative flex-1 flex overflow-hidden">
          {/* Sidebar with locations */}
          <div className="w-80 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-bold text-lg mb-4 text-zinc-900 dark:text-white">Monitored Areas</h3>
              <div className="space-y-2">
                {filteredLocations.map((location) => (
                  <motion.button
                    key={location.id}
                    onClick={() => setSelectedLocation(location)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedLocation.id === location.id 
                        ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500' 
                        : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span className="font-bold text-sm text-zinc-900 dark:text-white">{location.name}</span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        location.risk === 'high' ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' :
                        location.risk === 'moderate' ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                        'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400'
                      }`}>
                        {location.risk.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                      <div>Water Level: <span className="font-semibold">{location.waterLevel}</span></div>
                      <div>Rainfall: <span className="font-semibold">{location.rainfall}</span></div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Map Display */}
          <div className="relative flex-1 bg-zinc-100 dark:bg-zinc-900 overflow-hidden group">
            {/* Placeholder Grid */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
            
            {/* Selected Location Info Card */}
            <motion.div
              key={selectedLocation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-6 left-6 right-6 md:right-auto md:w-96 glass p-6 rounded-2xl z-10"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">{selectedLocation.name}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedLocation.lat}, {selectedLocation.lng}</p>
                </div>
                <div className={`p-2 rounded-full ${
                  selectedLocation.risk === 'high' ? 'bg-red-500' :
                  selectedLocation.risk === 'moderate' ? 'bg-orange-500' : 'bg-green-500'
                }`}>
                  {selectedLocation.risk === 'high' ? <AlertTriangle className="w-5 h-5 text-white" /> : <Info className="w-5 h-5 text-white" />}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/50 dark:bg-black/30 rounded-lg">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Water Level</p>
                  <p className="text-lg font-bold text-zinc-900 dark:text-white">{selectedLocation.waterLevel}</p>
                </div>
                <div className="p-3 bg-white/50 dark:bg-black/30 rounded-lg">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Rainfall (24h)</p>
                  <p className="text-lg font-bold text-zinc-900 dark:text-white">{selectedLocation.rainfall}</p>
                </div>
              </div>

              <div className={`mt-4 p-3 rounded-lg ${
                selectedLocation.risk === 'high' ? 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30' :
                selectedLocation.risk === 'moderate' ? 'bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30' :
                'bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30'
              }`}>
                <p className={`text-sm font-semibold ${
                  selectedLocation.risk === 'high' ? 'text-red-700 dark:text-red-300' :
                  selectedLocation.risk === 'moderate' ? 'text-orange-700 dark:text-orange-300' :
                  'text-green-700 dark:text-green-300'
                }`}>
                  {selectedLocation.risk === 'high' ? '⚠️ High Risk: Immediate evacuation recommended' :
                   selectedLocation.risk === 'moderate' ? '⚡ Moderate Risk: Stay alert and monitor updates' :
                   '✅ Low Risk: Area is safe, continue monitoring'}
                </p>
              </div>
            </motion.div>

            {/* Interactive Map Pins */}
            <div className="absolute inset-0 flex items-center justify-center">
              {mockLocations.map((loc, index) => (
                <motion.div
                  key={loc.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="absolute cursor-pointer"
                  style={{
                    left: `${20 + index * 15}%`,
                    top: `${30 + (index % 2) * 20}%`
                  }}
                  onClick={() => setSelectedLocation(loc)}
                >
                  <div className="relative group/pin">
                    <div className={`w-6 h-6 rounded-full ring-4 animate-pulse cursor-pointer transition-transform hover:scale-125 ${
                      loc.risk === 'high' ? 'bg-red-500 ring-red-500/30' :
                      loc.risk === 'moderate' ? 'bg-orange-500 ring-orange-500/30' :
                      'bg-green-500 ring-green-500/30'
                    } ${selectedLocation.id === loc.id ? 'scale-150 ring-8' : ''}`} />
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/90 dark:bg-black/95 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                      <div className="font-bold mb-1">{loc.name}</div>
                      <div className="text-zinc-300">Click for details</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
