import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import Exam from "@/models/Exam";
import { generatePDF } from "@/lib/ai/gemini";
import type { Readable } from "stream";

function toReadableStream(stream: Readable) {
  return new ReadableStream({
    start(controller) {
      stream.on("data", (chunk) => controller.enqueue(chunk));
      stream.on("end", () => controller.close());
      stream.on("error", (err) => controller.error(err));
    }
  });
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const exam = await Exam.findOne({ _id: params.id, clerkId: userId });
  if (!exam) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  const pdfStream = await generatePDF({
    title: `AI Mentor Exam - ${exam.topic}`,
    sections: [
      {
        heading: "Questions",
        body: exam.questions
          .map((q: any, index: number) => {
            const options = q.options ? `\nOptions: ${q.options.join(", ")}` : "";
            return `${index + 1}. ${q.prompt}${options}`;
          })
          .join("\n\n")
      },
      {
        heading: "Feedback",
        body: (exam.feedback || [])
          .map((f: any, index: number) => `${index + 1}. ${f.question} - ${f.result}\n${f.explanation}`)
          .join("\n\n")
      },
      {
        heading: "Score",
        body: exam.score !== undefined ? `${exam.score}/100` : "Pending"
      }
    ]
  });

  const readable = toReadableStream(pdfStream as unknown as Readable);

  return new NextResponse(readable, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="exam-${params.id}.pdf"`
    }
  });
}
