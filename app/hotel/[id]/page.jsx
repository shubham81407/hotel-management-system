"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";



export default function HotelDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    setUserRole(localStorage.getItem("role") || "");
    if (!id) return;
    setLoading(true);

    Promise.all([
      fetch(`http://localhost:5000/api/hotels/${id}`).then(res => res.json()),
      fetch(`http://localhost:5000/api/rooms?hotelId=${id}`).then(res => res.json())
    ])
    .then(([hotelData, roomsData]) => {
      setHotel(hotelData);
      setRooms(Array.isArray(roomsData) ? roomsData : []);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  const fetchAvailableRooms = () => {
    if (!checkIn || !checkOut) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/rooms?hotelId=${id}&checkIn=${checkIn}&checkOut=${checkOut}`)
      .then(res => res.json())
      .then(data => {
        setRooms(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  if (loading && !hotel) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex flex-col items-center justify-center">
        <Navbar />
        <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
        <p className="mt-4 font-medium text-zinc-500">Loading hotel details...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-[#fafaf9] text-center pt-32">
        <Navbar />
        <h1 className="text-2xl font-bold text-zinc-900 mb-4">Hotel not found</h1>
        <Link href="/" className="text-zinc-500 underline">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] text-zinc-900">
      <Navbar />

      {/* Hotel Hero */}
      <section className="relative h-[60vh] min-h-[500px] w-full flex items-end pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0">
          <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        
        <div className="relative max-w-7xl mx-auto w-full z-10 text-white">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-white/80 hover:text-white mb-6 transition-colors">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Hotels
          </Link>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-2 flex items-center gap-4">
            {hotel.name}
            {hotel.isVerifiedPartner && (
              <span className="inline-flex items-center justify-center bg-amber-400 text-amber-950 rounded-full px-3 py-1 text-sm font-bold shadow-lg uppercase tracking-wide border border-amber-300">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                Verified
              </span>
            )}
          </h1>
          {hotel.rating ? (
             <div className="flex items-center gap-2 mb-6">
               <div className="flex text-amber-400 text-lg drop-shadow-md">
                 {'★'.repeat(Math.floor(hotel.rating))}{'☆'.repeat(5 - Math.floor(hotel.rating))}
               </div>
               <span className="text-base font-bold text-white drop-shadow-md">{hotel.rating}</span>
               <span className="text-sm font-medium text-white/80 drop-shadow-md hover:text-white transition-colors cursor-pointer underline decoration-white/30 underline-offset-4">({hotel.reviewCount?.toLocaleString()} verified reviews)</span>
             </div>
          ) : null}
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mb-4 leading-relaxed">
            {hotel.description}
          </p>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm font-medium border border-white/20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {hotel.address || hotel.location}
              </div>
        </div>
      </section>

      {/* Rooms Search & Listing */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Availability Checker */}
        <div className="bg-white rounded-2xl shadow-xl shadow-zinc-200/40 p-6 md:p-8 -mt-28 relative z-20 mb-16 border border-zinc-100">
          <h2 className="text-2xl font-bold text-zinc-900 mb-6">Check Availability</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-zinc-100 pb-8 mb-8">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Check-in</label>
              <input type="date" min={new Date().toISOString().split('T')[0]} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Check-out</label>
              <input type="date" min={new Date() && checkIn ? new Date(Math.max(new Date().getTime(), new Date(checkIn).getTime() + 86400000)).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 transition-all" />
            </div>
            <div className="flex items-end">
              <button onClick={fetchAvailableRooms} className="w-full py-3.5 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                Check Dates
              </button>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-zinc-900 mb-8">Available Rooms at {hotel.name}</h2>
          
          {loading && rooms.length === 0 ? (
            <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" /></div>
          ) : rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map(room => (
                <article key={room._id} className="group bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden hover:shadow-xl hover:border-zinc-300 transition-all duration-300">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img src={room.imageUrl} alt={room.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {!room.isAvailable && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                        <span className="px-4 py-2 bg-red-600 text-white text-sm font-bold uppercase tracking-wider rounded-lg shadow-lg">Already Booked</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-zinc-900 mb-2">{room.title}</h3>
                    <p className="text-sm text-zinc-500 mb-4 line-clamp-2">{room.description}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold text-zinc-600 bg-zinc-100/80 rounded-md">
                        {room.capacity} Guests
                      </span>
                      {room.amenities && room.amenities.split(',').slice(0, 3).map((amenity, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 rounded-md">
                          {amenity.trim()}
                        </span>
                      ))}
                      {room.isAvailable ? (
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-md">
                          Available for these dates
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 rounded-md">
                          Already Booked
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-200/60">
                      <div>
                        <span className="text-2xl font-black text-zinc-900">₹{room.pricePerNight}</span>
                        <span className="text-sm font-medium text-zinc-500 ml-1">/ night</span>
                      </div>
                      {userRole === 'hoteladmin' || userRole === 'superadmin' ? (
                        <p className="px-5 py-2.5 text-xs font-bold text-zinc-500 bg-zinc-100 rounded-xl">Admins Can't Book</p>
                      ) : room.isAvailable ? (
                        <Link 
                          href={`/booking?roomId=${room._id}&hotelId=${hotel._id}&checkIn=${checkIn}&checkOut=${checkOut}`}
                          className="px-5 py-2.5 text-sm font-bold rounded-xl transition-all bg-zinc-900 text-white hover:bg-zinc-800 shadow-md hover:-translate-y-0.5"
                        >
                          Book Now
                        </Link>
                      ) : (
                        <button className="px-5 py-2.5 text-sm font-bold rounded-xl bg-zinc-200 text-zinc-400 pointer-events-none" disabled>
                          Already Booked
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
             <div className="py-16 text-center bg-zinc-50 rounded-2xl border border-zinc-200 border-dashed">
               <p className="text-lg text-zinc-600 font-medium">No rooms found for these dates or this hotel.</p>
             </div>
          )}
        </div>
      </section>
    </div>
  );
}
