import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Providers } from "./providers";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export const metadata: Metadata = {
  title: "AI-Mentor | Learn Anything, From Anyone, Anytime",
  description:
    "AI-Mentor transforms any topic or video into an immersive learning experience with AI tutors, exams, and summaries."
};

function LayoutShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  if (!publishableKey) {
    return <LayoutShell>{children}</LayoutShell>;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <LayoutShell>{children}</LayoutShell>
    </ClerkProvider>
  );
}
