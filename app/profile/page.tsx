"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Booking = {
  _id?: string;
  roomId?: string;
  email?: string;
  roomName?: string;
  title?: string;
  room?: { title?: string };
  checkInDate?: string;
  checkOutDate?: string;
  checkIn?: string;
  checkOut?: string;
  totalAmount?: number;
  amount?: number;
  total?: number;
  status?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    alert("Logged out successfully");
    router.push("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email") || "";
    const name = localStorage.getItem("name") || "";

    if (!token) {
      router.push("/login");
      return;
    }

    setUserName(name);
    setUserEmail(email);
    if (!email) {
      setLoading(false);
      setBookings([]);
      return;
    }

    setLoading(true);

    const loadBookings = async () => {
      try {
        // Preferred endpoint (if it exists in your backend)
        const myRes = await fetch(
          `http://localhost:5000/api/my-bookings/${encodeURIComponent(email)}`
        );
        if (myRes.ok) {
          const data = await myRes.json();
          const list = Array.isArray(data)
            ? data
            : data.bookings ?? data.items ?? [];
          setBookings(list);
          return;
        }
        throw new Error("my-bookings endpoint not available");
      } catch {
        // Fallback: fetch all bookings and filter by email
        try {
          const resAll = await fetch("http://localhost:5000/api/bookings");
          if (!resAll.ok) throw new Error("Failed to load bookings");
          const dataAll = await resAll.json();
          const allBookings = Array.isArray(dataAll) ? dataAll : dataAll.bookings ?? [];
          const userBookings = allBookings.filter(
            (b: Booking) => (b.email || "").toLowerCase() === email.toLowerCase()
          );

          // Map roomId -> room title (best-effort)
          const roomsRes = await fetch("http://localhost:5000/api/rooms");
          const roomsData = await roomsRes.json().catch(() => []);
          const rooms = Array.isArray(roomsData) ? roomsData : roomsData.rooms ?? [];
          const roomTitleById = new Map(
            rooms
              .filter((r: any) => r?._id)
              .map((r: any) => [String(r._id), r.title as string])
          );

          const mapped = userBookings.map((b: Booking) => {
            const rid =
              // roomId might be ObjectId string depending on your backend
              (b.roomId as any) ? String(b.roomId) : "";
            return {
              ...b,
              roomName: rid ? roomTitleById.get(rid) : b.roomName,
            };
          });

          setBookings(mapped);
        } catch {
          setBookings([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [router]);

  const formatDateToDDMMYYYY = (dateString?: string) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear(); 
    return `${dd}/${mm}/${yyyy}`;
  };

  const getRoomName = (b: Booking) =>
    b.roomName || b.title || b.room?.title || "Room";
  const getCheckIn = (b: Booking) => formatDateToDDMMYYYY(b.checkInDate || b.checkIn);
  const getCheckOut = (b: Booking) => formatDateToDDMMYYYY(b.checkOutDate || b.checkOut);
  const getAmount = (b: Booking) =>
    b.totalAmount ?? b.amount ?? b.total ?? 0;
  const getStatus = (b: Booking) => b.status || "Confirmed";

  return (
    <div className="min-h-screen bg-[#fafaf9] text-zinc-900">
      {/* Navbar */}
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
              <Link
                href="/"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/rooms"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                Rooms
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                About
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 md:pt-28 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="bg-white/70 backdrop-blur-md border border-zinc-100 rounded-2xl shadow-sm p-6 md:p-7">
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-900">
                Welcome, {userName || "Guest"}
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                {userEmail || "—"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left: User Details */}
            <aside className="lg:col-span-1">
              <section className="bg-white rounded-2xl shadow-sm shadow-zinc-200/50 border border-zinc-100 p-6 md:p-8 sticky top-28">
                <h2 className="text-lg font-semibold text-zinc-900 mb-6">
                  User Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Name
                    </p>
                    <p className="text-sm font-semibold text-zinc-900 mt-1">
                      {userName || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Email
                    </p>
                    <p className="text-sm font-semibold text-zinc-900 mt-1">
                      {userEmail || "—"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full mt-8 py-3.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </section>
            </aside>

            {/* Right: Booking History */}
            <section className="lg:col-span-2">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="w-12 h-12 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
                  <p className="mt-4 text-sm font-medium text-zinc-500">
                    Loading your bookings...
                  </p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm shadow-zinc-200/50 border border-zinc-100 p-8 md:p-10">
                  <h2 className="text-lg font-semibold text-zinc-900 mb-2">
                    No bookings found, explore rooms
                  </h2>
                  <p className="text-sm text-zinc-500">
                    Explore rooms and book your next stay.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/rooms"
                      className="inline-flex items-center justify-center px-5 py-3 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      Explore Rooms
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-zinc-900">
                      Your Booking History
                    </h2>
                    <p className="text-sm text-zinc-500">
                      {bookings.length} booking
                      {bookings.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {bookings.map((b, index) => (
                      <article
                        key={b._id || index}
                        className="bg-white rounded-2xl border border-zinc-100 shadow-sm shadow-zinc-200/40 p-6"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-base font-semibold text-zinc-900 mb-2">
                              {getRoomName(b)}
                            </h3>
                            <p className="text-sm text-zinc-500">
                              {getCheckIn(b)} — {getCheckOut(b)}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md ${
                              getStatus(b) === "Confirmed"
                                ? "text-emerald-700 bg-emerald-50"
                                : getStatus(b) === "Cancelled"
                                  ? "text-red-700 bg-red-50"
                                  : "text-zinc-600 bg-zinc-100"
                            }`}
                          >
                            {getStatus(b)}
                          </span>
                        </div>

                        <div className="mt-5 pt-5 border-t border-zinc-100 flex items-center justify-between">
                          <span className="text-sm text-zinc-500">
                            Total Amount
                          </span>
                          <span className="text-base font-semibold text-zinc-900">
                            ₹{getAmount(b).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 bg-white/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-lg font-semibold tracking-tight text-zinc-900">
                LuxeStays
              </p>
              <p className="text-sm text-zinc-500 mt-2">
                Premium stays with elegant service—crafted for modern travelers.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link
                href="/rooms"
                className="text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                Rooms
              </Link>
              <Link
                href="/about"
                className="text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                About
              </Link>
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-8">
            © {new Date().getFullYear()} LuxeStays. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

