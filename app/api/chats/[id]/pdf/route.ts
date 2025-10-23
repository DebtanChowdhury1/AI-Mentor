import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import Chat from "@/models/Chat";
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
  const chat = await Chat.findOne({ _id: params.id, clerkId: userId });
  if (!chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  const summary = chat.summary ? JSON.parse(chat.summary) : null;
  const pdfStream = await generatePDF({
    title: chat.title || "AI Mentor Session",
    sections: [
      { heading: "Source", body: chat.source || "Custom prompt" },
      { heading: "Conversation", body: chat.messages.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n") },
      {
        heading: "Summary",
        body: summary
          ? `Reply: ${summary.reply}\n\nFollow Up: ${summary.followUp}\n\nCitations: ${(summary.citations || []).join(", ")}`
          : ""
      }
    ]
  });

  const readable = toReadableStream(pdfStream as unknown as Readable);

  return new NextResponse(readable, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="chat-${params.id}.pdf"`
    }
  });
}
