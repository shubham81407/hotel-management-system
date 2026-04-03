"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";



export default function AdminPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [role, setRole] = useState("");
  const [myHotelId, setMyHotelId] = useState("");
  const [userId, setUserId] = useState("");
  const [hotelDetails, setHotelDetails] = useState(null);

  const [hotelName, setHotelName] = useState("");
  const [hotelLocation, setHotelLocation] = useState("");
  const [hotelAddress, setHotelAddress] = useState("");
  const [hotelDesc, setHotelDesc] = useState("");
  const [hotelImage, setHotelImage] = useState("");
  const [creatingHotel, setCreatingHotel] = useState(false);

  const [rooms, setRooms] = useState([]);
  const [roomTitle, setRoomTitle] = useState("");
  const [roomDesc, setRoomDesc] = useState("");
  const [roomPrice, setRoomPrice] = useState("");
  const [roomCapacity, setRoomCapacity] = useState("");
  const [roomTotal, setRoomTotal] = useState("1");
  const [roomAmenities, setRoomAmenities] = useState("");
  const [roomImage, setRoomImage] = useState("");
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);

  const [allHotels, setAllHotels] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setIsLoggedIn(true);

    const storedRole = localStorage.getItem("role") || "";
    const storedHotelId = localStorage.getItem("hotelId") || "";
    const storedUserId = localStorage.getItem("id") || "";
    
    setRole(storedRole);
    setMyHotelId(storedHotelId);
    setUserId(storedUserId);

    if (storedRole === "hoteladmin" && !storedHotelId) {
      setLoading(false);
      return;
    }

    if (storedHotelId) {
      fetch(`http://localhost:5000/api/hotels/${storedHotelId}`)
        .then(res => res.json())
        .then(data => setHotelDetails(data))
        .catch(console.error);

      fetch(`http://localhost:5000/api/rooms?hotelId=${storedHotelId}`)
        .then(res => res.json())
        .then(data => setRooms(Array.isArray(data) ? data : data.rooms || []))
        .catch(console.error);
    }

    let url = "http://localhost:5000/api/bookings";
    if (storedRole === "hoteladmin" && storedHotelId) {
      url += `?hotelId=${storedHotelId}`;
    } else if (storedRole === "superadmin") {
      fetch("http://localhost:5000/api/hotels")
        .then(res => res.json())
        .then(data => setAllHotels(Array.isArray(data) ? data : []))
        .catch(console.error);
    }
    
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.bookings ?? [];
        setBookings(list);
        setLoading(false);
      })
      .catch(() => {
        setBookings([]);
        setLoading(false);
      });
  }, [router]);

  const handleCreateHotel = async (e) => {
    e.preventDefault();
    setCreatingHotel(true);
    try {
      const res = await fetch("http://localhost:5000/api/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: hotelName,
          location: hotelLocation,
          address: hotelAddress,
          description: hotelDesc,
          imageUrl: hotelImage,
          adminId: userId
        })
      });
      const data = await res.json();
      if (res.ok && data.hotel) {
        localStorage.setItem("hotelId", data.hotel._id);
        alert("Hotel Registered Successfully!");
        window.location.reload();
      } else {
        alert("Error mapping hotel profile.");
      }
    } catch {
      alert("Error mapping hotel profile.");
    } finally {
      setCreatingHotel(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setCreatingRoom(true);
    const method = editingRoomId ? "PUT" : "POST";
    const url = editingRoomId 
      ? `http://localhost:5000/api/rooms/${editingRoomId}`
      : "http://localhost:5000/api/rooms";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: roomTitle,
          description: roomDesc,
          pricePerNight: Number(roomPrice),
          capacity: Number(roomCapacity),
          totalRooms: Number(roomTotal),
          amenities: roomAmenities,
          imageUrl: roomImage,
          hotelId: myHotelId
        })
      });
      if (res.ok) {
        alert(editingRoomId ? "Room Edited" : "Room Listed");
        setRoomTitle(""); setRoomDesc(""); setRoomPrice(""); setRoomCapacity(""); setRoomTotal("1"); setRoomImage(""); setRoomAmenities("");
        setEditingRoomId(null);
        window.location.reload();
      } else {
        alert("Error saving room listing.");
      }
    } catch {
      alert("Error saving room listing.");
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleEditClick = (room) => {
    setEditingRoomId(room._id);
    setRoomTitle(room.title);
    setRoomDesc(room.description);
    setRoomPrice(String(room.pricePerNight));
    setRoomCapacity(String(room.capacity));
    setRoomTotal(String(room.totalRooms || 1));
    setRoomAmenities(room.amenities || "");
    setRoomImage(room.imageUrl);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };
  
  const handleCancelEdit = () => {
    setEditingRoomId(null);
    setRoomTitle(""); setRoomDesc(""); setRoomPrice(""); setRoomCapacity(""); setRoomTotal("1"); setRoomImage(""); setRoomAmenities("");
  };

  const handleDeleteRoom = async (roomId) => {
    if (!confirm("Are you certain you wish to remove this room?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/${roomId}`, { method: 'DELETE' });
      if (res.ok) {
        setRooms(prev => prev.filter(r => r._id !== roomId));
      } else alert("Failed to delete room.");
    } catch {
       alert("Error deleting room.");
    }
  };

  const toggleVerifyHotel = async (hotelId) => {
    try {
       const res = await fetch(`http://localhost:5000/api/hotels/${hotelId}/verify`, { method: 'PUT' });
       if (res.ok) {
         setAllHotels(prev => prev.map(h => h._id === hotelId ? { ...h, isVerifiedPartner: !h.isVerifiedPartner } : h));
       }
    } catch (e) {
       console.error(e);
    }
  };

  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear(); 
    return `${dd}/${mm}/${yyyy}`;
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col relative overflow-hidden">
      {/* Dark Luxury Gradient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <main className="flex-1 relative z-10 pt-24 md:pt-32 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-white/10 border-t-amber-500 rounded-full animate-spin mb-4" />
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Synchronizing Dashboard...</p>
            </div>
          ) : role === "hoteladmin" && !myHotelId ? (
            // ==========================================
            // ONBOARDING FORM
            // ==========================================
            <div className="max-w-3xl mx-auto">
              <div className="mb-8 text-center">
                <span className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full text-[10px] uppercase font-bold tracking-widest mb-3">Onboarding</span>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">Partner With <span className="luxury-gradient">LuxeStays</span></h1>
                <p className="text-zinc-400 text-sm font-light">Set up your property's exclusive profile globally.</p>
              </div>
              <div className="glass-panel p-6 md:p-8 rounded-2xl relative overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] pointer-events-none" />
                <form onSubmit={handleCreateHotel} className="space-y-4 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5 pl-1">Property Name</label>
                      <input required type="text" value={hotelName} onChange={(e)=>setHotelName(e.target.value)} placeholder="e.g. The Grand Paris Residency" className="w-full px-4 py-3 bg-zinc-950/50 border border-white/10 rounded-xl focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all text-white placeholder:text-zinc-600 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5 pl-1">City/Location</label>
                      <input required value={hotelLocation} onChange={e=>setHotelLocation(e.target.value)} type="text" className="w-full px-4 py-3 bg-zinc-950/50 border border-white/10 rounded-xl focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all text-white placeholder:text-zinc-600 text-sm" placeholder="e.g. Paris, France" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5 pl-1">Exact Address</label>
                      <input value={hotelAddress} onChange={e=>setHotelAddress(e.target.value)} type="text" className="w-full px-4 py-3 bg-zinc-950/50 border border-white/10 rounded-xl focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all text-white placeholder:text-zinc-600 text-sm" placeholder="e.g. 228 Rue de Rivoli" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5 pl-1">Experience Description</label>
                      <textarea required rows={3} value={hotelDesc} onChange={(e)=>setHotelDesc(e.target.value)} placeholder="Describe the ambiance, amenities, and unique experience..." className="w-full px-4 py-3 bg-zinc-950/50 border border-white/10 rounded-xl focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all text-white placeholder:text-zinc-600 text-sm resize-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5 pl-1">Cover Image URL</label>
                      <input required type="url" value={hotelImage} onChange={(e)=>setHotelImage(e.target.value)} placeholder="https://..." className="w-full px-4 py-3 bg-zinc-950/50 border border-white/10 rounded-xl focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all text-white placeholder:text-zinc-600 text-sm" />
                    </div>
                  </div>
                  <div className="pt-5 border-t border-white/5 flex justify-end">
                    <button type="submit" disabled={creatingHotel} className="px-6 py-3 luxury-gradient-bg text-zinc-950 font-bold uppercase tracking-widest text-[10px] rounded-xl hover:shadow-[0_0_15px_rgba(217,119,6,0.3)] transition-all disabled:opacity-70 transform hover:scale-105">
                      {creatingHotel ? "Provisioning..." : "Launch Profile"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            // ==========================================
            // CORE DASHBOARD
            // ==========================================
            <div className="animate-fade-in fade-in">
              <div className="mb-8 lg:mb-10">
                <span className="inline-block px-3 py-1 bg-white/5 border border-white/10 text-zinc-400 rounded-full text-[9px] uppercase font-bold tracking-widest mb-2">Workspace</span>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-1">
                  {role === 'superadmin' ? 'Master Registry' : 'Owner Control Room'}
                </h1>
                <p className="text-zinc-500 text-xs font-light">Welcome back, {localStorage.getItem("name") || "Admin"}</p>
              </div>

              {/* My Hotel Display Card */}
              {hotelDetails && (
                <div className="mb-10 glass-panel rounded-2xl overflow-hidden flex flex-col md:flex-row items-center gap-0 group border border-white/5">
                  <div className="w-full md:w-5/12 h-48 md:h-full md:min-h-[220px] relative overflow-hidden">
                    <img src={hotelDetails.imageUrl} alt={hotelDetails.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent md:hidden" />
                  </div>
                  <div className="flex-1 w-full p-6 md:p-8 space-y-3">
                    <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      {hotelDetails.location}
                    </div>
                    <h2 className="text-2xl font-bold text-white">{hotelDetails.name}</h2>
                    <p className="text-zinc-400 text-sm font-light leading-relaxed mb-4">{hotelDetails.description}</p>
                    <div className="pt-4 mt-2 border-t border-white/5 flex flex-wrap gap-4 items-center">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-600">Your Property</span>
                      {hotelDetails.isVerifiedPartner && (
                        <span className="flex items-center gap-1.5 text-amber-950 bg-amber-400 px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(251,191,36,0.2)]">
                           ★ Validated
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group border border-white/5">
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Total Reservations</p>
                    <p className="text-4xl font-bold text-white group-hover:text-amber-400 transition-colors">{totalBookings}</p>
                  </div>
                </div>
                <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group border border-white/5">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Gross Revenue</p>
                    <p className="text-4xl font-bold luxury-gradient bg-clip-text text-transparent">₹{totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Bookings Ledger */}
              <div className="glass-panel rounded-2xl overflow-hidden mb-10 border border-white/5">
                <div className="px-6 py-5 border-b border-white/5 bg-zinc-950/80">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-300">Transaction Ledger</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-zinc-900/60 border-b border-white/5">
                        {role === 'superadmin' && <th className="px-6 py-4 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Property</th>}
                        <th className="px-6 py-4 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Client</th>
                        <th className="px-6 py-4 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Identifier</th>
                        <th className="px-6 py-4 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Dates</th>
                        <th className="px-6 py-4 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Net Value</th>
                        <th className="px-6 py-4 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {bookings.length === 0 ? (
                        <tr><td colSpan={7} className="px-6 py-12 text-center text-zinc-600 font-light text-xs">No transactions available.</td></tr>
                      ) : (
                        bookings.map((booking, index) => (
                          <tr key={booking._id || index} className="hover:bg-zinc-900/50 transition-colors">
                            {role === 'superadmin' && (
                              <td className="px-6 py-4 text-xs font-bold text-white">{booking.hotelId?.name || "—"}</td>
                            )}
                            <td className="px-6 py-4 text-xs font-bold text-zinc-200">{booking.guestName || "—"}</td>
                            <td className="px-6 py-4 text-[10px] text-zinc-500 font-mono">{booking.email || "—"}</td>
                            <td className="px-6 py-4 text-[10px] font-medium text-zinc-400">
                               {formatDateToDDMMYYYY(booking.checkInDate || booking.checkIn)} → {formatDateToDDMMYYYY(booking.checkOutDate || booking.checkOut)}
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-white">₹{(booking.totalAmount || 0).toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded ${
                                  (booking.status || "Confirmed") === "Confirmed" ? "text-amber-500 bg-amber-500/10 border border-amber-500/20" : "text-zinc-500 bg-white/5 border border-white/10"
                              }`}>
                                {booking.status || "Confirmed"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SUPERADMIN: ALL HOTELS */}
              {role === 'superadmin' && (
                <div className="glass-panel rounded-2xl overflow-hidden mt-10 mb-10 border border-white/5">
                  <div className="px-6 py-5 border-b border-white/5 bg-zinc-950/80">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-300">Partner Intelligence</h2>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allHotels.map((h, i) => (
                      <div key={i} className={`rounded-xl border overflow-hidden flex flex-col ${h.isVerifiedPartner ? 'border-amber-500/30 bg-zinc-900/60 shadow-[0_0_15px_rgba(217,119,6,0.1)]' : 'border-white/5 bg-zinc-900/40'} relative group`}>
                        {h.isVerifiedPartner && (
                           <div className="absolute top-3 right-3 bg-amber-500/20 backdrop-blur-md border border-amber-500/50 text-amber-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded z-10 flex items-center gap-1">
                              Verified
                           </div>
                        )}
                        <img src={h.imageUrl} alt={h.name} className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="p-5 flex-1 flex flex-col">
                           <h3 className="font-bold text-white text-lg mb-1 truncate">{h.name}</h3>
                           <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-5 truncate">{h.location}</p>
                           <button 
                              onClick={() => toggleVerifyHotel(h._id)}
                             className={`w-full py-2.5 mt-auto rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all shadow-sm ${h.isVerifiedPartner ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-white text-zinc-950 hover:bg-amber-400 hover:shadow-[0_0_15px_rgba(217,119,6,0.3)]'}`}
                           >
                             {h.isVerifiedPartner ? 'Revoke Shield' : 'Grant Shield'}
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HOTELADMIN: ROOMS MANAGEMENT */}
              {role === 'hoteladmin' && myHotelId && (
                <div className="glass-panel rounded-2xl overflow-hidden mt-10 border border-amber-500/30">
                  <div className="px-6 py-5 border-b border-white/5 bg-zinc-950/90">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-amber-500">Suite Operations Center</h2>
                  </div>
                  <div className="p-6 md:p-8">
                    
                    {/* List Existing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                      {rooms.map((room, idx) => (
                        <div key={idx} className="bg-zinc-950/50 rounded-2xl border border-white/5 overflow-hidden flex flex-col relative group">
                          <img src={room.imageUrl || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800"} alt={room.title} className="w-full h-36 object-cover opacity-80 group-hover:opacity-100 transition-all duration-500" />
                          <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-white text-lg mb-1.5">{room.title}</h3>
                            <p className="text-[11px] text-zinc-400 font-light mb-4 line-clamp-2 leading-relaxed">{room.description}</p>
                            <div className="mt-auto">
                              <div className="flex justify-between items-end border-b border-white/10 pb-3 mb-3">
                                <div>
                                   <span className="block text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">Nightly Rate</span>
                                   <span className="font-bold text-amber-400 text-xl">₹{room.pricePerNight}</span>
                                </div>
                                <div className="text-right">
                                   <span className="block text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">Inventory</span>
                                   <span className="text-xs text-zinc-300 font-medium">{room.totalRooms} Unit(s)</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => handleEditClick(room)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 text-[10px] font-bold uppercase tracking-widest py-2.5 rounded-lg transition-colors text-center">
                                  Modify
                                </button>
                                <button onClick={() => handleDeleteRoom(room._id)} className="w-10 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/10">
                                  ✕
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {rooms.length === 0 && (
                        <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-2xl bg-zinc-950/30">
                          <p className="text-zinc-500 text-xs font-light">Inventory is empty. Provision your first suite below.</p>
                        </div>
                      )}
                    </div>

                    {/* Editor Form */}
                    <div className="bg-zinc-950 rounded-2xl border border-white/5 p-6 md:p-8 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] pointer-events-none" />
                       <h3 className="text-base font-bold text-white mb-6">
                         {editingRoomId ? "Modify Suite Parameters" : "Provision New Suite"}
                       </h3>
                       <form onSubmit={handleCreateRoom} className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5 pl-1">Classification/Title</label>
                            <input required value={roomTitle} onChange={e=>setRoomTitle(e.target.value)} type="text" className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all text-white placeholder:text-zinc-600 text-sm" placeholder="e.g. Royal Penthouse" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5 pl-1">Per Night Valuation (₹)</label>
                            <input required value={roomPrice} onChange={e=>setRoomPrice(e.target.value)} type="number" min="0" className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all text-white placeholder:text-zinc-600 text-sm" placeholder="e.g. 15000" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5 pl-1">Detailed Synopsis</label>
                            <textarea required value={roomDesc} onChange={e=>setRoomDesc(e.target.value)} rows={2} className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl resize-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all text-white placeholder:text-zinc-600 text-sm" placeholder="Describe the atmosphere, views..." />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5 pl-1">Maximum Occupancy</label>
                            <input required value={roomCapacity} onChange={e=>setRoomCapacity(e.target.value)} type="number" min="1" className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all text-white placeholder:text-zinc-600 text-sm" placeholder="e.g. 2" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5 pl-1">Inventory Quantity</label>
                            <input required value={roomTotal} onChange={e=>setRoomTotal(e.target.value)} type="number" min="1" className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all text-white placeholder:text-zinc-600 text-sm" placeholder="e.g. 10" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5 pl-1">Features (Comma Separated)</label>
                            <input value={roomAmenities} onChange={e=>setRoomAmenities(e.target.value)} type="text" className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all text-white placeholder:text-zinc-600 text-sm" placeholder="e.g. Helipad, Spa Access" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5 pl-1">Media Access URL</label>
                            <input required value={roomImage} onChange={e=>setRoomImage(e.target.value)} type="url" className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all text-white placeholder:text-zinc-600 text-sm" placeholder="https://" />
                          </div>
                          <div className="md:col-span-2 flex justify-end items-center gap-4 mt-4">
                            {editingRoomId && (
                              <button type="button" onClick={handleCancelEdit} className="px-5 py-3 text-zinc-400 font-bold uppercase tracking-widest text-[9px] hover:text-white transition-colors">
                                Dismiss
                              </button>
                            )}
                            <button type="submit" disabled={creatingRoom} className="px-6 py-3 luxury-gradient-bg text-zinc-950 font-bold uppercase tracking-widest text-[10px] rounded-xl hover:shadow-[0_0_15px_rgba(217,119,6,0.3)] transition-all disabled:opacity-70 transform hover:scale-105 shadow-md">
                               {creatingRoom ? "Transmitting..." : editingRoomId ? "Deploy Edits" : "Provision Suite"}
                            </button>
                          </div>
                       </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
