"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "./components/Navbar";

type Room = {
  _id: string;
  title: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  imageUrl: string;
  isAvailable: boolean;
};

export default function Home() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/rooms")
      .then((res) => res.json())
      .then((data) => {
        setRooms(Array.isArray(data) ? data : data.rooms ?? []);
        setLoading(false);
      })
      .catch(() => {
        setRooms([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#fafaf9] text-zinc-900">
      <Navbar />

      {/* Hero Section */}
      <section id="home" className="relative pt-24 md:pt-32 pb-20 md:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 via-white to-amber-50/30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-100/40 blur-3xl" />
        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-zinc-900 mb-4">
              Find Your Perfect Stay
            </h1>
            <p className="text-lg md:text-xl text-zinc-500">
              Discover luxury accommodations tailored to your taste. Book
              effortlessly and create lasting memories.
            </p>
          </div>

          {/* Booking Search Box */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg shadow-zinc-200/50 border border-zinc-100 p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-zinc-900 bg-zinc-50 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                  Check-out Date
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-zinc-900 bg-zinc-50 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                  Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full px-4 py-3 text-sm text-zinc-900 bg-zinc-50 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      {n} Guest{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  className="w-full px-6 py-3 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors"
                  onClick={() =>
                    router.push(
                      `/rooms?checkIn=${encodeURIComponent(
                        checkIn
                      )}&checkOut=${encodeURIComponent(checkOut)}`
                    )
                  }
                >
                  Search Rooms
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 mb-4">
              Our Premium Rooms
            </h2>
            <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
              Choose from our curated selection of elegantly designed accommodations.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-12 h-12 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
              <p className="mt-4 text-sm font-medium text-zinc-500">
                Loading rooms...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {rooms.slice(0, 6).map((room) => (
                <article
                  key={room._id}
                  className="group bg-white rounded-2xl shadow-sm shadow-zinc-200/50 border border-zinc-100 overflow-hidden hover:shadow-xl hover:shadow-zinc-200/50 hover:border-zinc-200 transition-all duration-300"
                >
                  {/* Room Image */}
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={room.imageUrl}
                      alt={room.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-5 md:p-6">
                    <h3 className="text-xl font-semibold text-zinc-900 mb-2">
                      {room.title}
                    </h3>
                    <p className="text-sm text-zinc-500 mb-4 line-clamp-2">
                      {room.description}
                    </p>

                    {/* Feature Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-zinc-600 bg-zinc-100 rounded-md">
                        {room.capacity} Guest{room.capacity > 1 ? "s" : ""}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md ${
                          room.isAvailable
                            ? "text-emerald-700 bg-emerald-50"
                            : "text-zinc-500 bg-zinc-100"
                        }`}
                      >
                        {room.isAvailable ? "Available" : "Unavailable"}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-zinc-600 bg-zinc-100 rounded-md">
                        Free Wi-Fi
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-zinc-600 bg-zinc-100 rounded-md">
                        AC
                      </span>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                      <div>
                        <span className="text-2xl font-semibold text-zinc-900">
                          ${room.pricePerNight}
                        </span>
                        <span className="text-sm text-zinc-500 ml-1">
                          / night
                        </span>
                      </div>
                      {room.isAvailable ? (
                        <Link
                          href={`/booking?roomId=${room._id}`}
                          className="px-4 py-2.5 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors"
                        >
                          Book Now
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="px-4 py-2.5 text-sm font-medium text-zinc-400 bg-zinc-100 rounded-lg cursor-not-allowed"
                        >
                          Unavailable
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-12 md:mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-zinc-900 mb-4">
              Our Story: Redefining Luxury Stays
            </h2>
            <p className="text-lg md:text-xl text-zinc-500">
              LuxeStays is built for travelers who value calm design, reliable
              service, and effortless booking. From our verified rooms to
              thoughtfully curated experiences, we focus on what makes a stay
              feel premium from the first click to the final checkout.
            </p>
          </div>

          {/* Mission / Vision / Commitment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm shadow-zinc-200/40 p-6 md:p-7">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center mb-5">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                Lightning Fast
              </h3>
              <p className="text-sm text-zinc-500">
                Instant booking confirmation and real-time availability updates
                ensure you never miss out on your dream stay.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm shadow-zinc-200/40 p-6 md:p-7">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center mb-5">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                Verified Quality
              </h3>
              <p className="text-sm text-zinc-500">
                Every room is personally inspected and verified for quality,
                comfort, and cleanliness before being listed on our platform.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm shadow-zinc-200/40 p-6 md:p-7">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center mb-5">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                Personalized Care
              </h3>
              <p className="text-sm text-zinc-500">
                Our dedicated support team is available 24/7 to ensure your stay
                is perfect, from booking to checkout and beyond.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
