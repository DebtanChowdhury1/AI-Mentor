import { ExamGenerator } from "@/components/ai/exam-generator";
import { cookies } from "next/headers";
import { getBaseUrl } from "@/lib/server/base-url";

async function getExams() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/exams`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    cache: "no-store"
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function ExamPage() {
  const exams = await getExams();
  return <ExamGenerator initialExams={exams} />;
}
