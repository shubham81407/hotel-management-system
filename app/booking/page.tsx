"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Room = {
  _id: string;
  title: string;
  pricePerNight: number;
  imageUrl?: string;
};

const formatToDDMMYYYY = (dateString: string) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear(); 
  return `${dd}/${mm}/${yyyy}`;
};

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const hotelId = searchParams.get("hotelId");
  const checkInParam = searchParams.get("checkIn");
  const checkOutParam = searchParams.get("checkOut");

  const [room, setRoom] = useState<Room | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(true);

  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [checkInDate, setCheckInDate] = useState(checkInParam || "");
  const [checkOutDate, setCheckOutDate] = useState(checkOutParam || "");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Payment State
  const [step, setStep] = useState<"details" | "payment">("details");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (!token) {
      alert("Please login to book a room");
      router.push("/login");
      return;
    }

    if (roomId) {
      fetch(`http://localhost:5000/api/rooms/${roomId}`)
        .then((res) => res.json())
        .then((data) => {
          setRoom(data);
          setLoadingRoom(false);
        })
        .catch(() => {
          setLoadingRoom(false);
        });
    } else {
      setLoadingRoom(false);
    }
  }, [roomId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    alert("Logged out successfully");
    router.push("/login");
  };

  const getNights = (start: string, end: string) => {
    if (!start || !end) return 0;
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    return Math.max(0, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));
  };

  const nights = getNights(checkInDate, checkOutDate);
  const pricePerNight = room?.pricePerNight || 0;
  const subtotal = pricePerNight * nights;
  const taxes = Math.round(subtotal * 0.12);
  const totalAmount = subtotal + taxes;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInDate || !checkOutDate || !guestName || !email || !phone) {
      alert("Please fill in all required guest details.");
      return;
    }
    setStep("payment");
  };

  const onSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvv) {
      alert("Please enter payment details.");
      return;
    }
    setSubmitting(true);
    
    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 1500));

    try {
      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName,
          email,
          phone,
          checkInDate,
          checkOutDate,
          roomId: room?._id || "unknown",
          hotelId: hotelId || "unknown",
          totalAmount: totalAmount || 0,
          userId: localStorage.getItem("id") || undefined,
          status: "Paid & Confirmed"
        }),
      });
      if (res.ok) {
        alert("Payment Successful! Booking Confirmed.");
        router.push("/rooms");
      } else {
        alert("Booking failed. Please try again.");
      }
    } catch {
      alert("Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses =
    "w-full px-4 py-3 text-sm text-zinc-900 bg-zinc-50 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all";
  const labelClasses = "block text-sm font-semibold text-zinc-700 mb-1.5";

  if (loadingRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 text-center px-4">
        <h2 className="text-2xl font-bold text-zinc-900 mb-4">Room not found</h2>
        <p className="text-zinc-500 mb-8">Please select a valid room from our rooms page.</p>
        <Link href="/rooms" className="px-6 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors">
          Browse Rooms
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] text-zinc-900 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100 py-3">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tighter text-zinc-900 flex items-center gap-2"
            >
               <span className="bg-amber-600 text-white w-8 h-8 rounded-lg flex items-center justify-center">L</span>
              LuxeStays
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-amber-700 transition-colors">Home</Link>
              <Link href="/rooms" className="text-sm font-medium text-zinc-600 hover:text-amber-700 transition-colors">Rooms</Link>
            </div>
            {isLoggedIn ? (
              <button onClick={handleLogout} className="px-5 py-2.5 text-sm font-semibold text-zinc-700 bg-zinc-100 rounded-full hover:bg-zinc-200 hover:text-red-600 transition-all">
                Logout
              </button>
            ) : (
              <Link href="/login" className="px-6 py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-full hover:bg-amber-700 transition-all">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-6 lg:px-8 flex-1">
        <div className="max-w-6xl mx-auto">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-12">
             <div className="flex items-center gap-4">
               <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step === 'details' || step === 'payment' ? 'bg-amber-500 text-white' : 'bg-zinc-200 text-zinc-500'}`}>1</div>
               <span className={`font-semibold ${step === 'details' || step === 'payment' ? 'text-zinc-900' : 'text-zinc-400'}`}>Details</span>
               <div className="w-12 h-0.5 bg-zinc-200 mx-2">
                 <div className={`h-full bg-amber-500 transition-all duration-500 ${step === 'payment' ? 'w-full' : 'w-0'}`}></div>
               </div>
               <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step === 'payment' ? 'bg-amber-500 text-white' : 'bg-zinc-200 text-zinc-500'}`}>2</div>
               <span className={`font-semibold ${step === 'payment' ? 'text-zinc-900' : 'text-zinc-400'}`}>Payment</span>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left: Dynamic Form based on step */}
            <div className="lg:col-span-2">
              {step === "details" && (
                <form onSubmit={handleNextStep} className="bg-white rounded-3xl shadow-xl shadow-zinc-200/40 border border-zinc-100 p-8 md:p-10 animate-fade-in">
                  <h2 className="text-2xl font-bold text-zinc-900 mb-8 border-b border-zinc-100 pb-4">
                    Guest Details
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label htmlFor="guestName" className={labelClasses}>Full Name *</label>
                      <input id="guestName" required type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="John Doe" className={inputClasses} />
                    </div>
                    <div>
                      <label htmlFor="email" className={labelClasses}>Email *</label>
                      <input id="email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" className={inputClasses} />
                    </div>
                    <div>
                      <label htmlFor="phone" className={labelClasses}>Phone Number *</label>
                      <input id="phone" required type="tel" pattern="[0-9]{10}" maxLength={10} minLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="10-digit mobile no." className={inputClasses} />
                    </div>
                    <div>
                      <label htmlFor="checkInDate" className={labelClasses}>Check-in Date *</label>
                      <input id="checkInDate" required type="date" min={new Date().toISOString().split('T')[0]} value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} className={inputClasses} />
                    </div>
                    <div>
                      <label htmlFor="checkOutDate" className={labelClasses}>Check-out Date *</label>
                      <input id="checkOutDate" required type="date" min={new Date().toISOString().split('T')[0]} value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} className={inputClasses} />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="specialRequests" className={labelClasses}>Special Requests</label>
                      <textarea id="specialRequests" value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} placeholder="Early check-in, dietary requirements..." rows={3} className={`${inputClasses} resize-none`} />
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button type="submit" className="px-8 py-4 text-base font-bold text-white bg-zinc-900 rounded-xl hover:bg-amber-600 transition-all shadow-lg hover:shadow-amber-500/30">
                      Continue to Payment
                    </button>
                  </div>
                </form>
              )}

              {step === "payment" && (
                <form onSubmit={onSubmitPayment} className="bg-white rounded-3xl shadow-xl shadow-zinc-200/40 border border-zinc-100 p-8 md:p-10 animate-fade-in relative overflow-hidden">
                   {/* Background Glow */}
                   <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                  <h2 className="text-2xl font-bold text-zinc-900 mb-8 border-b border-zinc-100 pb-4 relative z-10">
                    Payment Information
                  </h2>
                  
                  {/* Credit Card Graphic */}
                  <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 text-white shadow-2xl relative overflow-hidden max-w-sm mx-auto transform hover:scale-105 transition-transform duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="flex justify-between items-center mb-8 relative z-10">
                       <svg className="w-10 h-10 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="1.5"/><path d="M2 10h20" strokeWidth="1.5"/></svg>
                       <span className="font-mono text-sm tracking-widest opacity-80">VISA</span>
                    </div>
                    <div className="font-mono text-xl tracking-widest mb-4 relative z-10">
                      {cardNumber || "•••• •••• •••• ••••"}
                    </div>
                    <div className="flex justify-between items-end relative z-10">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider opacity-60 mb-1">Card Holder</p>
                        <p className="font-medium truncate max-w-[150px]">{guestName || "YOUR NAME"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider opacity-60 mb-1">Expires</p>
                        <p className="font-medium">{expiry || "MM/YY"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 relative z-10">
                    <div className="col-span-2">
                      <label className={labelClasses}>Card Number *</label>
                      <input required type="text" maxLength={19} value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim())} placeholder="0000 0000 0000 0000" className={inputClasses + " font-mono text-lg tracking-wider"} />
                    </div>
                    <div>
                      <label className={labelClasses}>Expiry Date *</label>
                      <input required type="text" maxLength={5} value={expiry} onChange={(e) => setExpiry(e.target.value.replace(/^(\d\d)(\d)$/g,'$1/$2').replace(/[^\d\/]/g,''))} placeholder="MM/YY" className={inputClasses + " font-mono"} />
                    </div>
                    <div>
                      <label className={labelClasses}>CVV *</label>
                      <input required type="password" maxLength={4} value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))} placeholder="•••" className={inputClasses + " font-mono"} />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between items-center relative z-10">
                    <button type="button" onClick={() => setStep("details")} className="text-zinc-500 font-semibold hover:text-zinc-900 transition-colors">
                      ← Back to Details
                    </button>
                    <button type="submit" disabled={submitting} className="px-8 py-4 text-base font-bold text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition-all shadow-lg hover:shadow-amber-500/30 disabled:opacity-70 flex items-center gap-3">
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Pay ₹${totalAmount}`
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <section className="bg-white rounded-3xl shadow-xl shadow-zinc-200/40 border border-zinc-100 overflow-hidden">
                  <div className="h-40 bg-zinc-200 relative">
                     {room.imageUrl ? (
                       <img src={room.imageUrl} alt={room.title} className="w-full h-full object-cover" />
                     ) : (
                       <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                         <span className="text-amber-300 font-bold text-xl">LuxeStays</span>
                       </div>
                     )}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                     <h3 className="absolute bottom-4 left-6 right-6 text-xl font-bold text-white drop-shadow-md">
                       {room.title}
                     </h3>
                  </div>

                  <div className="p-6 md:p-8 space-y-6">
                    <div className="pb-6 border-b border-zinc-100">
                      <p className="text-sm font-medium text-zinc-500 mb-2 uppercase tracking-wide">Stay Dates</p>
                      <p className="font-semibold text-zinc-900">
                        {checkInDate && checkOutDate ? (
                          <>
                            {formatToDDMMYYYY(checkInDate)} 
                            &nbsp;→&nbsp; 
                            {formatToDDMMYYYY(checkOutDate)}
                          </>
                        ) : "Select dates"}
                      </p>
                      <p className="text-sm text-zinc-500 mt-1">
                         {nights} night{nights !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="space-y-4 pb-6 border-b border-zinc-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-600">₹{pricePerNight} × {nights} night{nights !== 1 ? "s" : ""}</span>
                        <span className="font-medium text-zinc-900">₹{subtotal}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-600">Taxes & fees</span>
                        <span className="font-medium text-zinc-900">₹{taxes}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between items-end">
                      <div>
                        <span className="block text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-1">Total Due</span>
                      </div>
                      <span className="text-3xl font-bold text-zinc-900">₹{totalAmount}</span>
                    </div>

                    <div className="bg-amber-50 rounded-xl p-4 mt-6 border border-amber-100/50">
                       <p className="text-xs text-amber-800 leading-relaxed font-medium">
                         <span className="font-bold">✓ Free cancellation</span> up to 24 hours before check-in. No hidden fees.
                       </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-zinc-50"><div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" /></div>}>
      <BookingContent />
    </Suspense>
  );
}
