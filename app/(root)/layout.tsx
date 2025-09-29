import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { isAuthenticated } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  // Redirect unauthenticated users to sign-in
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated) {
    redirect("/sign-in");
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation header */}
      <header
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container mx-auto px-4 h-16 flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo.svg"
              alt="PrepWise logo"
              width={38}
              height={32}
              priority
            />
            <h1 className="text-xl font-semibold text-primary-100">PrepWise</h1>
          </Link>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>
            &copy; {new Date().getFullYear()} PrepWise. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}