import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import Chat from "@/models/Chat";
import { generatePDF } from "@/lib/ai/gemini";
import { getRouteParam, type RouteParamsContext } from "@/lib/route-params";
import { headers } from "next/headers";
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
  const headersList = await headers();
  const userAgent = headersList.get("user-agent");
  console.log(`PDF download request for chat - User-Agent: ${userAgent}`);

  const chatId = await getRouteParam(context, "id");

  if (!chatId) {
    return NextResponse.json({ error: "Chat id is required" }, { status: 400 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const chat = await Chat.findOne({ _id: chatId, clerkId: userId });
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
      "Content-Disposition": `attachment; filename="chat-${chatId}.pdf"`
    }
  });
}
