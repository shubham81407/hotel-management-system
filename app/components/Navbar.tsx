"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Booking = {
  _id: string;
  guestName: string;
  email: string;
  phone: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  status: string;
};

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    const storedName = localStorage.getItem("name");
    const storedEmail = localStorage.getItem("email");
    setIsLoggedIn(!!token);
    setRole(storedRole);
    setUserName(storedName || "");
    setUserEmail(storedEmail || "");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    setIsLoggedIn(false);
    setRole(null);
    setUserName("");
    setUserEmail("");
    setIsProfileOpen(false);
    alert("Logged out successfully");
    router.push("/login");
  };

  const openProfile = async () => {
    setIsProfileOpen(true);
    if (userEmail && bookings.length === 0) {
      setLoadingBookings(true);
      try {
        const res = await fetch(`http://localhost:5000/api/my-bookings/${userEmail}`);
        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoadingBookings(false);
      }
    }
  };

  const closeProfile = () => {
    setIsProfileOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link
              href="/"
              className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-900"
            >
              LuxeStays
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#home"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                Home
              </a>
              <a
                href="#rooms"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                Rooms
              </a>
              <a
                href="#about"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                About
              </a>
              {role === 'admin' && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  Admin Panel
                </Link>
              )}
            </div>
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={openProfile}
                    className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 transition-colors"
                  >
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Profile Slide-over Panel */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeProfile}
          />
          <div className="relative ml-auto w-full max-w-md bg-white shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-zinc-900">Profile</h2>
                <button
                  onClick={closeProfile}
                  className="p-2 text-zinc-400 hover:text-zinc-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700">Name</label>
                  <p className="text-sm text-zinc-900">{userName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">Email</label>
                  <p className="text-sm text-zinc-900">{userEmail || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">Role</label>
                  <p className="text-sm text-zinc-900 capitalize">{role || 'N/A'}</p>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-medium text-zinc-900 mb-4">My Bookings</h3>
                {loadingBookings ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <div key={booking._id} className="p-3 bg-zinc-50 rounded-lg">
                        <p className="text-sm font-medium text-zinc-900">Room ID: {booking.roomId}</p>
                        <p className="text-sm text-zinc-600">Check-in: {booking.checkInDate}</p>
                        <p className="text-sm text-zinc-600">Check-out: {booking.checkOutDate}</p>
                        <p className="text-sm text-zinc-600">Total: ${booking.totalAmount}</p>
                        <p className="text-sm text-zinc-600">Status: {booking.status}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">No bookings found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}