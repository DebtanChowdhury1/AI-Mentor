import { Summarizer } from "@/components/ai/summarizer";
import { cookies } from "next/headers";
import { getBaseUrl } from "@/lib/server/base-url";

async function getSummaries() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/summaries`, {
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
