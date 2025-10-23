import { TutorialChat } from "@/components/ai/tutorial-chat";
import { cookies } from "next/headers";

async function getChats() {
  const cookieStore = cookies();
  const cookieHeader = cookieStore.toString();
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/chats`, {
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
