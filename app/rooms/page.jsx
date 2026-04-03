"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Navbar from "../components/Navbar";

function RoomsContent() {
  const searchParams = useSearchParams();
  const rawLocation = searchParams.get("location") || "";
  const rawCheckIn = searchParams.get("checkIn") || "";
  const rawCheckOut = searchParams.get("checkOut") || "";
  const aiContext = searchParams.get("aiContext") || "";
  const specificHotelId = searchParams.get("hotelId") || "";

  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [sortBy, setSortBy] = useState("recommended");
  
  // Refined Sidebar Filters
  const [maxPrice, setMaxPrice] = useState("50000");

  useEffect(() => {
    setLoading(true);

    if (aiContext) {
      fetch("http://localhost:5000/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiContext }),
      })
        .then((res) => res.json())
        .then((data) => {
          setRooms(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
      return;
    }

    const params = new URLSearchParams();
    if (rawLocation) params.append("location", rawLocation);
    if (rawCheckIn) params.append("checkIn", rawCheckIn);
    if (rawCheckOut) params.append("checkOut", rawCheckOut);
    if (specificHotelId) params.append("hotelId", specificHotelId);
    if (maxPrice && maxPrice !== "50000") params.append("maxPrice", maxPrice);

    fetch(`http://localhost:5000/api/rooms?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        let fetchedData = Array.isArray(data) ? data : data.rooms || [];
        if (sortBy === "price_asc") fetchedData.sort((a,b) => a.pricePerNight - b.pricePerNight);
        if (sortBy === "price_desc") fetchedData.sort((a,b) => b.pricePerNight - a.pricePerNight);
        setRooms(fetchedData);
        setLoading(false);
      })
      .catch(() => {
        setRooms([]);
        setLoading(false);
      });
  }, [rawLocation, rawCheckIn, rawCheckOut, aiContext, specificHotelId, sortBy, maxPrice]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col relative selection:bg-amber-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-16 relative z-10">
        {/* Header Layout */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-white/5 pb-8">
          <div>
            <span className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full text-[10px] uppercase font-bold tracking-widest mb-3">
              {aiContext ? 'AI Concept Search' : 'Global Registry'}
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-2 leading-tight">
              Curated <span className="luxury-gradient luxury-gradient-bg bg-clip-text text-transparent">Suites</span>
            </h1>
            <p className="text-sm font-light text-zinc-400 max-w-xl">
               {aiContext ? `Prompt: "${aiContext}"` : "Discover our meticulously vetted collection of luxury accommodations worldwide."}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold whitespace-nowrap">Order By</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs font-bold uppercase tracking-widest outline-none focus:border-amber-500/50 appearance-none shadow-inner"
            >
               <option value="recommended">Best Match</option>
               <option value="price_asc">Price Ascending</option>
               <option value="price_desc">Price Descending</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Dynamic Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0">
             <div className="glass-panel rounded-2xl p-6 sticky top-28 border border-white/5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-300 mb-6">Refine Parameters</h3>
                
                <div className="space-y-6">
                   <div>
                      <label className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-3">
                         Max Nightly Rate 
                         <span className="text-amber-500">₹{Number(maxPrice).toLocaleString()}</span>
                      </label>
                      <input 
                         type="range" 
                         min="1000" 
                         max="50000" 
                         step="500" 
                         value={maxPrice}
                         onChange={(e) => setMaxPrice(e.target.value)}
                         className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400"
                      />
                   </div>

                   <hr className="border-white/5" />
                   
                   <div>
                       <Link href="/rooms" className="w-full block text-center py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-white/5 transition-colors">
                          Reset Configuration
                       </Link>
                   </div>
                </div>
             </div>
          </div>

          {/* Suites Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 glass-panel rounded-2xl border border-white/5 h-full">
                 <div className="w-8 h-8 border-2 border-white/10 border-t-amber-500 rounded-full animate-spin mb-4" />
                 <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Retrieving Registry...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-32 glass-panel rounded-2xl border border-white/5 h-full flex flex-col items-center justify-center">
                <span className="text-4xl mb-4 opacity-50 block">✧</span>
                <p className="text-zinc-400 text-sm font-light px-6 text-center max-w-sm">No suites currently align with your selected parameters. Please adjust your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rooms.map((room) => (
                  <div key={room._id} className="group glass-panel rounded-2xl overflow-hidden flex flex-col hover:border-amber-500/30 transition-all border border-white/5">
                    {/* Image Area */}
                    <div className="relative w-full h-56 overflow-hidden bg-zinc-900">
                      <img
                        src={room.imageUrl || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"}
                        alt={room.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out opacity-80 group-hover:opacity-100"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-90" />
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2 relative z-10">
                        {room?.hotelId?.name && (
                           <span className="px-2.5 py-1 bg-zinc-950/80 backdrop-blur-md rounded text-[9px] font-bold uppercase tracking-widest text-zinc-300 border border-white/10 shadow-lg">
                              {room.hotelId.name}
                           </span>
                        )}
                        {room.relevanceScore !== undefined && (
                           <span className="px-2.5 py-1 bg-emerald-500/20 backdrop-blur-md rounded text-[9px] font-bold uppercase tracking-widest text-emerald-400 border border-emerald-500/30 shadow-lg w-max flex items-center gap-1.5">
                              ★ High Match
                           </span>
                        )}
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 relative z-10">
                        <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-lg mb-1">{room.title}</h2>
                        <div className="flex gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                           <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                              Up to {room.capacity}
                           </span>
                           {room?.hotelId?.location && (
                              <span className="flex items-center gap-1 text-amber-500">
                                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                 {room.hotelId.location}
                              </span>
                           )}
                        </div>
                      </div>
                    </div>

                    {/* Details Area */}
                    <div className="p-5 md:p-6 flex-1 flex flex-col border-t border-white/5">
                      <p className="text-zinc-400 text-xs font-light line-clamp-2 leading-relaxed mb-4">
                        {room.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {room.amenities ? room.amenities.split(',').slice(0, 3).map((am, i) => (
                           <span key={i} className="px-2 py-1 rounded bg-zinc-900 border border-white/5 text-[9px] uppercase tracking-widest font-bold text-zinc-500">
                             {am.trim()}
                           </span>
                        )) : (
                           <span className="px-2 py-1 rounded bg-zinc-900 border border-white/5 text-[9px] uppercase tracking-widest font-bold text-zinc-500">Bespoke Amenities</span>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                         <div>
                            <span className="block text-[9px] uppercase tracking-widest font-bold text-zinc-500 mb-0.5">Nightly Rate</span>
                            <span className="text-2xl font-bold text-white tracking-tight">₹{room.pricePerNight}</span>
                         </div>
                         
                         {room.isAvailable === false ? (
                            <button disabled className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-red-500/20 text-red-500/50 text-xs uppercase tracking-widest font-bold cursor-not-allowed">
                               Unavailable
                            </button>
                         ) : (
                            <button
                              onClick={() => {
                                const q = new URLSearchParams();
                                q.set("roomId", room._id);
                                if (rawCheckIn) q.set("checkIn", rawCheckIn);
                                if (rawCheckOut) q.set("checkOut", rawCheckOut);
                                if (room?.hotelId?._id) q.set("hotelId", room.hotelId._id);
                                window.location.href = `/book?${q.toString()}`;
                              }}
                              className="px-6 py-3 rounded-xl luxury-gradient-bg text-zinc-950 text-xs uppercase tracking-widest font-bold shadow-[0_0_15px_rgba(217,119,6,0.2)] hover:shadow-[0_0_25px_rgba(217,119,6,0.4)] transition-all transform hover:scale-105"
                            >
                              Reserve
                            </button>
                         )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RoomsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">Loading Registry...</div>}>
      <RoomsContent />
    </Suspense>
  );
}