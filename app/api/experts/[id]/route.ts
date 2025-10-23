import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import Expert from "@/models/Expert";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  const body = await request.json();
  const expert = await Expert.findOneAndUpdate({ _id: params.id, clerkId: userId, isPreset: false }, body, { new: true });
  return NextResponse.json(expert);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  await Expert.deleteOne({ _id: params.id, clerkId: userId, isPreset: false });
  return NextResponse.json({ success: true });
}
