import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// Font configuration
const monaSans = Mona_Sans({
  subsets: ["latin"],
  variable: "--font-mona-sans",
  display: "swap", // Better performance
});

// SEO metadata
export const metadata: Metadata = {
  title: "PrepWise - AI Interview Practice",
  description:
    "Master your interviews with AI-powered mock interview preparation. Practice, improve, and land your dream job.",
  keywords:
    "interview preparation, AI mock interviews, job interview practice, career development",
  authors: [{ name: "PrepWise Team" }],
  viewport: "width=device-width, initial-scale=1",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="dark">
      <body className={`${monaSans.className} antialiased pattern`}>
        <main>{children}</main>

        {/* Toast notifications */}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
