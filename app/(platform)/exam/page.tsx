import { ExamGenerator } from "@/components/ai/exam-generator";
import { cookies } from "next/headers";

async function getExams() {
  const cookieStore = cookies();
  const cookieHeader = cookieStore.toString();
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/exams`, {
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
