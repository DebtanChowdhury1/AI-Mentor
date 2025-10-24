import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import Expert from "@/models/Expert";
import { getRouteParam, type RouteParamsContext } from "@/lib/route-params";

export async function PATCH(request: NextRequest, context: RouteParamsContext) {
  const expertId = await getRouteParam(context, "id");
  if (!expertId) {
    return NextResponse.json({ error: "Expert id is required" }, { status: 400 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  const body = await request.json();
  const expert = await Expert.findOneAndUpdate({ _id: expertId, clerkId: userId, isPreset: false }, body, { new: true });
  return NextResponse.json(expert);
}

export async function DELETE(_: NextRequest, context: RouteParamsContext) {
  const expertId = await getRouteParam(context, "id");
  if (!expertId) {
    return NextResponse.json({ error: "Expert id is required" }, { status: 400 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  await Expert.deleteOne({ _id: expertId, clerkId: userId, isPreset: false });
  return NextResponse.json({ success: true });
}
