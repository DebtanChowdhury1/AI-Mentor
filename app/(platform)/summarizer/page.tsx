import { Summarizer } from "@/components/ai/summarizer";
import { cookies } from "next/headers";

async function getSummaries() {
  const cookieStore = cookies();
  const cookieHeader = cookieStore.toString();
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/summaries`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    cache: "no-store"
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function SummarizerPage() {
  const summaries = await getSummaries();
  return <Summarizer initialSummaries={summaries} />;
}
