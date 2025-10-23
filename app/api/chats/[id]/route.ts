import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import Chat from "@/models/Chat";
import { getRouteParam, type RouteParamsContext } from "@/lib/route-params";

export async function PATCH(request: NextRequest, context: RouteParamsContext) {
  const chatId = await getRouteParam(context, "id");
  if (!chatId) {
    return NextResponse.json({ error: "Chat id is required" }, { status: 400 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  await connectToDatabase();
  const chat = await Chat.findOneAndUpdate({ _id: chatId, clerkId: userId }, body, { new: true });
  return NextResponse.json(chat);
}

export async function DELETE(_: NextRequest, context: RouteParamsContext) {
  const chatId = await getRouteParam(context, "id");
  if (!chatId) {
    return NextResponse.json({ error: "Chat id is required" }, { status: 400 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  await Chat.deleteOne({ _id: chatId, clerkId: userId });
  return NextResponse.json({ success: true });
}
