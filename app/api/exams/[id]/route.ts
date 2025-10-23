import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import Exam from "@/models/Exam";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  const body = await request.json();
  const exam = await Exam.findOneAndUpdate({ _id: params.id, clerkId: userId }, body, { new: true });
  return NextResponse.json(exam);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  await Exam.deleteOne({ _id: params.id, clerkId: userId });
  return NextResponse.json({ success: true });
}
