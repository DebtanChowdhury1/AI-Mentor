import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import Exam from "@/models/Exam";
import { generateExam, gradeExam } from "@/lib/ai/gemini";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();
    const exams = await Exam.find({ clerkId: userId }).sort({ updatedAt: -1 });
    return NextResponse.json(exams);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load exams" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { topic, answers, questions, examId } = body;
    await connectToDatabase();

    if (!examId) {
      const generated = await generateExam(topic);
      const exam = await Exam.create({ clerkId: userId, topic, questions: generated.questions, summary: generated.guidance });
      return NextResponse.json(exam);
    }

    const exam = await Exam.findOne({ _id: examId, clerkId: userId });
    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const grading = await gradeExam(exam.topic, questions || exam.questions, answers);
    exam.answers = answers;
    exam.feedback = grading.feedback;
    exam.score = grading.score;
    exam.summary = JSON.stringify(grading);
    await exam.save();

    return NextResponse.json(exam);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to process exam" }, { status: 500 });
  }
}
