import { TutorialChat } from "@/components/ai/tutorial-chat";
import { cookies } from "next/headers";
import { getBaseUrl } from "@/lib/server/base-url";

async function getChats() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/chats`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    cache: "no-store"
  });
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export default async function AiTutorialPage() {
  const initialChats = await getChats();
  return <TutorialChat initialChats={initialChats} />;
}
