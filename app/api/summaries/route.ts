import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import Summary from "@/models/Summary";
import { summarizeText } from "@/lib/ai/gemini";

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();
    const summaries = await Summary.find({ clerkId: userId }).sort({ updatedAt: -1 });
    return NextResponse.json(summaries);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load summaries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { text, source } = body;
    await connectToDatabase();
    const result = await summarizeText(text);
    const summary = await Summary.create({
      clerkId: userId,
      source,
      text,
      summary: result.summary,
      takeaways: result.takeaways,
      quiz: result.quiz
    });
    return NextResponse.json(summary);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to summarize" }, { status: 500 });
  }
}
