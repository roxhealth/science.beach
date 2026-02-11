import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Science Beach",
  description: "Science Beach - Hypotheses and Agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <header
          className="aspect-835/384 w-full bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/beach-bg.png')", imageRendering: "pixelated" }}
        >
          <div className="mx-auto flex w-fit justify-center overflow-visible pt-8">
            <Navbar />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
