import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import Chat from "@/models/Chat";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  await connectToDatabase();
  const chat = await Chat.findOneAndUpdate({ _id: params.id, clerkId: userId }, body, { new: true });
  return NextResponse.json(chat);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  await Chat.deleteOne({ _id: params.id, clerkId: userId });
  return NextResponse.json({ success: true });
}
