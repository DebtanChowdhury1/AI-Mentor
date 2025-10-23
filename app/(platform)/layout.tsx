import { Header } from "@/components/layout/header";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  return (
    <div className="min-h-screen bg-background/80">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-12">{children}</main>
    </div>
  );
}
