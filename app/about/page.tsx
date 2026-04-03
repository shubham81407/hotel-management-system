"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

export default function AboutPage() {
  const router = useRouter();

  useEffect(() => {
    // Pre-mount operations if needed
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col relative overflow-hidden">
      {/* Dynamic Ambiance */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-yellow-500/10 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <main className="flex-1 relative z-10 pt-24 lg:pt-32 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="max-w-5xl mx-auto text-center mb-16 md:mb-24">
          <span className="inline-block py-1.5 px-4 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-500 text-[10px] font-black tracking-widest uppercase mb-6 shadow-sm">
            The LuxeStays Origin
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-6 leading-tight text-white">
            Redefining <br className="hidden md:block" />
            <span className="luxury-gradient">Luxury Stays</span>
          </h1>
          <p className="text-base md:text-lg text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
            LuxeStays was built for discerning travelers who value elegant design, impeccable 
            service, and effortless experiences. We curate the extraordinary so your stay feels 
            premium from the first click to checkout.
          </p>
        </div>

        {/* Stats Section */}
        <section className="max-w-5xl mx-auto mb-20 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-700/10 rounded-3xl blur-xl opacity-50 block mix-blend-screen pointer-events-none" />
          <div className="glass-panel rounded-3xl p-8 md:p-10 relative overflow-hidden border border-white/5">
            {/* Inner Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center relative z-10">
              {[
                { label: "Elite Guests", value: "25k+" },
                { label: "Curated Rooms", value: "800+" },
                { label: "Global Cities", value: "60" },
                { label: "Guest Rating", value: "4.9" },
              ].map((stat) => (
                <div key={stat.label} className="space-y-2">
                  <p className="text-4xl md:text-5xl font-black luxury-gradient bg-clip-text text-transparent transform hover:scale-105 transition-transform">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tighter mb-4">Our Principles</h2>
            <p className="text-zinc-500 max-w-xl mx-auto text-sm font-light">The foundational pillars that guide our commitment to unified luxury hospitality.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "The Mission",
                desc: "To craft a booking experience so effortless and beautiful, guests can trust their luxury stay begins the moment they arrive.",
                icon: (
                  <path d="M20 7L10 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                ),
              },
              {
                title: "The Vision",
                desc: "Elevating the narrative of hospitality by pairing curated design with seamless technology, setting a new benchmark for premium stays.",
                icon: (
                  <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7z" strokeLinecap="round" strokeLinejoin="round" />
                ),
              },
              {
                title: "The Standard",
                desc: "Verified aesthetics, transparency, and uncompromising quality control. We believe the smallest details leave the deepest impressions.",
                icon: (
                  <path d="M12 21s-7-4.35-7-11a4 4 0 017-2 4 4 0 017 2c0 6.65-7 11-7 11z" strokeLinecap="round" strokeLinejoin="round" />
                ),
              },
            ].map((item, idx) => (
              <div
                key={item.title}
                className="group glass-panel rounded-2xl p-6 md:p-8 hover:-translate-y-1 transition-all duration-300 overflow-hidden relative border border-white/5"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
                
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-6 shadow-md shadow-black/50 group-hover:border-amber-500/30 transition-colors">
                  <svg
                    className="w-5 h-5 text-amber-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                     {item.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed group-hover:text-zinc-300 transition-colors">
                  {item.desc}
                </p>
                <div className="font-bold text-amber-900 opacity-10 text-6xl absolute bottom-0 right-4 pointer-events-none select-none transition-opacity group-hover:opacity-20">
                  0{idx + 1}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call To Action */}
        <section className="max-w-4xl mx-auto text-center relative">
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none z-0" />
          <div className="relative z-10 glass-panel rounded-3xl p-10 md:p-12 overflow-hidden border border-white/5">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-amber-500/10 blur-[80px] pointer-events-none" />
             <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4 text-white relative z-10">
                Experience the <span className="luxury-gradient">Pinnacle</span>
             </h2>
             <p className="text-zinc-400 text-sm md:text-base font-light max-w-xl mx-auto mb-8 relative z-10">
                Join thousands of travelers who have already elevated their standard. Your exceptional stay awaits.
             </p>
             <Link href="/rooms" className="inline-block px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-950 luxury-gradient-bg rounded-xl shadow-[0_0_20px_rgba(217,119,6,0.2)] hover:shadow-[0_0_30px_rgba(217,119,6,0.4)] transition-all transform hover:scale-105 relative z-10">
               Begin Your Journey
             </Link>
          </div>
        </section>
      </main>

      {/* Footer minimal */}
      <footer className="border-t border-white/5 bg-zinc-950 px-6 py-6 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-base font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded luxury-gradient-bg flex items-center justify-center text-zinc-950 text-[10px] shadow-sm">L</span>
            LuxeStays
          </p>
          <div className="flex items-center gap-6">
             {['Privacy', 'Terms', 'Contact'].map(l => (
                 <a key={l} href="#" className="text-[10px] uppercase tracking-widest font-bold text-zinc-600 hover:text-amber-500 transition-colors">{l}</a>
             ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
