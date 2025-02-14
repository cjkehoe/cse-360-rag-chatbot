import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { cn } from "@/lib/utils";
import { BuyMeACoffee } from "@/components/BuyMeACoffee"
import { Analytics } from '@vercel/analytics/react';

// Remove the Inter configuration
// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CSE 360 RAG Chatbot",
  description: "An AI teaching assistant that helps CSE 360 students by providing accurate answers from past Ed Discussion posts.",
  openGraph: {
    title: "CSE 360 RAG Chatbot",
    description: "An AI teaching assistant that helps CSE 360 students by providing accurate answers from past Ed Discussion posts.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CSE 360 RAG Chatbot",
    description: "An AI teaching assistant that helps CSE 360 students by providing accurate answers from past Ed Discussion posts.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        {/* ... existing head content ... */}
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          GeistSans.className
        )}
      >
        <BuyMeACoffee />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
