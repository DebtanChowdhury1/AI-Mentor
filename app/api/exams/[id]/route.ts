import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import Exam from "@/models/Exam";
import { getRouteParam, type RouteParamsContext } from "@/lib/route-params";

export async function PATCH(request: NextRequest, context: RouteParamsContext) {
  const examId = await getRouteParam(context, "id");
  if (!examId) {
    return NextResponse.json({ error: "Exam id is required" }, { status: 400 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  const body = await request.json();
  const exam = await Exam.findOneAndUpdate({ _id: examId, clerkId: userId }, body, { new: true });
  return NextResponse.json(exam);
}

export async function DELETE(_: NextRequest, context: RouteParamsContext) {
  const examId = await getRouteParam(context, "id");
  if (!examId) {
    return NextResponse.json({ error: "Exam id is required" }, { status: 400 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  await Exam.deleteOne({ _id: examId, clerkId: userId });
  return NextResponse.json({ success: true });
}
