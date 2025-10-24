import { Header } from "@/components/layout/header";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const hasClerkKeys = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  if (!hasClerkKeys) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <Header />
        <div className="mx-auto w-full max-w-xl rounded-3xl border border-dashed border-primary/30 bg-primary/5 p-10">
          <h2 className="text-2xl font-semibold text-foreground">Clerk configuration required</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Set <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and
            <code className="ml-1 rounded bg-muted px-1 py-0.5">CLERK_SECRET_KEY</code> in your environment to access the AI
            workspace.
          </p>
        </div>
      </div>
    );
  }

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
