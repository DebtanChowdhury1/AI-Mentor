import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import Summary from "@/models/Summary";
import { generatePDF } from "@/lib/ai/gemini";
import { getRouteParam, type RouteParamsContext } from "@/lib/route-params";
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

export async function GET(_: NextRequest, context: RouteParamsContext) {
  const summaryId = await getRouteParam(context, "id");
  if (!summaryId) {
    return NextResponse.json({ error: "Summary id is required" }, { status: 400 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const summary = await Summary.findOne({ _id: summaryId, clerkId: userId });
  if (!summary) {
    return NextResponse.json({ error: "Summary not found" }, { status: 404 });
  }

  const pdfStream = await generatePDF({
    title: summary.source ? `Summary - ${summary.source}` : "AI Mentor Summary",
    sections: [
      { heading: "Key Summary", body: (summary.summary || []).join("\n") },
      { heading: "Takeaways", body: (summary.takeaways || []).join("\n") },
      {
        heading: "Quiz",
        body: (summary.quiz || []).map((q: any, index: number) => `${index + 1}. ${q.question}\nAnswer: ${q.answer}`).join("\n\n")
      }
    ]
  });

  const readable = toReadableStream(pdfStream as unknown as Readable);

  return new NextResponse(readable, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="summary-${summaryId}.pdf"`
    }
  });
}
