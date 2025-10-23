import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "AI-Mentor | Learn Anything, From Anyone, Anytime",
  description:
    "AI-Mentor transforms any topic or video into an immersive learning experience with AI tutors, exams, and summaries."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
        <ClerkProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
