import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VisionForge — AI Video Studio",
  description: "Turn ideas into cinematic videos, stories, ads, and social content.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
