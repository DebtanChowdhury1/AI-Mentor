import { ExpertsPanel } from "@/components/ai/experts-panel";
import { cookies } from "next/headers";

async function getExperts() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/experts`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    cache: "no-store"
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function ExpertsPage() {
  const experts = await getExperts();
  return <ExpertsPanel experts={experts} />;
}
