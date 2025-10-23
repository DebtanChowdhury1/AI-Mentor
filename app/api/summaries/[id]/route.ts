import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import Summary from "@/models/Summary";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  const body = await request.json();
  const summary = await Summary.findOneAndUpdate({ _id: params.id, clerkId: userId }, body, { new: true });
  return NextResponse.json(summary);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  await Summary.deleteOne({ _id: params.id, clerkId: userId });
  return NextResponse.json({ success: true });
}
