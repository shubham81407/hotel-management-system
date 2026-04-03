import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });

export const metadata = {
  title: "LuxeStays | Premium Hotel Booking",
  description: "Experience the pinnacle of luxury and comfort.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${outfit.className} antialiased bg-[#09090b] text-zinc-100 selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}