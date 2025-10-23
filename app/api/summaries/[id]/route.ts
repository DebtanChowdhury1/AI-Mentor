import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import Summary from "@/models/Summary";
import { getRouteParam, type RouteParamsContext } from "@/lib/route-params";

export async function PATCH(request: NextRequest, context: RouteParamsContext) {
  const summaryId = await getRouteParam(context, "id");
  if (!summaryId) {
    return NextResponse.json({ error: "Summary id is required" }, { status: 400 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  const body = await request.json();
  const summary = await Summary.findOneAndUpdate({ _id: summaryId, clerkId: userId }, body, { new: true });
  return NextResponse.json(summary);
}

export async function DELETE(_: NextRequest, context: RouteParamsContext) {
  const summaryId = await getRouteParam(context, "id");
  if (!summaryId) {
    return NextResponse.json({ error: "Summary id is required" }, { status: 400 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  await Summary.deleteOne({ _id: summaryId, clerkId: userId });
  return NextResponse.json({ success: true });
}
