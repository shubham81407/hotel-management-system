"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<'guest' | 'admin'>('guest');
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const url = loginType === 'admin' || isLogin
      ? "http://localhost:5000/api/login"
      : "http://localhost:5000/api/register";
    const body = loginType === 'admin' || isLogin
      ? { email, password }
      : { fullName, email, password };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        if (loginType === 'admin' || isLogin) {
          if (data.token) {
            localStorage.setItem("token", data.token);
          }
          if (data.user) {
            localStorage.setItem("email", data.user.email || email || "");
            localStorage.setItem("name", data.user.name || "");
            localStorage.setItem("role", data.user.role || "");
          }
          if (loginType === 'admin') {
            if (data.user?.role === 'admin') {
              localStorage.setItem("role", 'admin');
              alert("Admin Login Successful");
              router.push("/admin");
            } else {
              alert("Access Denied: You are not an Admin");
            }
          } else {
            localStorage.setItem("role", 'guest');
            alert("Login Successful");
            router.push("/");
          }
        } else {
          alert("Account created successfully! Please log in.");
          setIsLogin(true);
          setFullName("");
          setPassword("");
        }
      } else {
        alert(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses =
    "w-full px-4 py-3 text-sm text-zinc-900 bg-white rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent";
  const labelClasses = "block text-sm font-medium text-zinc-700 mb-1.5";

  return (
    <div className="min-h-screen bg-[#fafaf9] text-zinc-900 flex flex-col">
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
            </div>
            <Link
              href="/login"
              className="px-5 py-2.5 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Centered Auth Card */}
      <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg shadow-zinc-200/50 border border-zinc-100 p-8 md:p-10">
            <h1 className="text-2xl font-semibold text-zinc-900 mb-2">
              {loginType === 'admin' ? 'Admin Login' : (isLogin ? "Welcome back" : "Create an account")}
            </h1>
            <p className="text-sm text-zinc-500 mb-6">
              {loginType === 'admin' ? 'Log in as an administrator.' : (isLogin
                ? "Log in to manage your bookings."
                : "Sign up to get started with LuxeStays.")}
            </p>

            {/* Login Type Selection */}
            <div className="mb-6 flex gap-4">
              <button
                type="button"
                onClick={() => setLoginType('guest')}
                className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
                  loginType === 'guest'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                Login as Guest
              </button>
              <button
                type="button"
                onClick={() => setLoginType('admin')}
                className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
                  loginType === 'admin'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                Login as Admin
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {loginType === 'guest' && !isLogin && (
                <div>
                  <label htmlFor="fullName" className={labelClasses}>
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required={!isLogin}
                    className={inputClasses}
                  />
                </div>
              )}
              <div>
                <label htmlFor="email" className={labelClasses}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="password" className={labelClasses}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className={inputClasses}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting
                  ? "Please wait..."
                  : loginType === 'admin' || isLogin
                    ? "Log in"
                    : "Sign up"}
              </button>
            </form>

            {loginType === 'guest' && (
              <div className="mt-6 pt-6 border-t border-zinc-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setFullName("");
                    setPassword("");
                  }}
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  {isLogin
                    ? "Don't have an account? Sign Up"
                    : "Already have an account? Login"}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
