import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import RiskDashboard from "@/components/RiskDashboard";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white selection:bg-blue-500/30">
      <Navbar />
      
      <div className="flex flex-col gap-20 pb-20">
        <Hero />
        
        <div className="container mx-auto px-4 -mt-20 relative z-20">
          <RiskDashboard />
        </div>
        
        <Features />
      </div>

      <Footer />
    </main>
  );
}

