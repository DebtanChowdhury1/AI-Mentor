import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import Chat from "@/models/Chat";
import { analyzeYouTube, chatWithTutor } from "@/lib/ai/gemini";

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const chats = await Chat.find({ clerkId: userId }).sort({ updatedAt: -1 });
    return NextResponse.json(chats);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load chats" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, sessionId } = auth();
    if (!userId || !sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { chatId, source, context, message, title } = body;

    await connectToDatabase();

    let chat = chatId ? await Chat.findOne({ _id: chatId, clerkId: userId }) : null;

    let chatContext = context;
    if (!chat && source) {
      try {
        const analysis = await analyzeYouTube(source);
        chatContext = JSON.stringify(analysis);
      } catch (error) {
        console.error("Gemini analysis failed", error);
      }
    }

    if (!chat) {
      chat = await Chat.create({
        clerkId: userId,
        sessionId,
        source,
        context: chatContext || source,
        title: title || "New AI Tutorial",
        messages: []
      });
    }

    if (!chatContext) {
      chatContext = chat.context;
    }

    if (message) {
      chat.messages.push({ role: "user", content: message });
      const aiResponse = await chatWithTutor(chatContext || "", message);
      chat.messages.push({ role: "assistant", content: aiResponse.reply });
      chat.summary = JSON.stringify(aiResponse);
    }

    await chat.save();

    return NextResponse.json(chat);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
