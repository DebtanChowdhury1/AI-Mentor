import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  let userDoc = await User.findOne({ clerkId: userId });
  if (!userDoc) {
    const clerkUser = await currentUser();
    userDoc = await User.create({
      clerkId: userId,
      email: clerkUser?.emailAddresses?.[0]?.emailAddress || `${userId}@example.com`,
      name: clerkUser?.fullName,
      avatar: clerkUser?.imageUrl
    });
  }
  return NextResponse.json(userDoc);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  await connectToDatabase();
  const userDoc = await User.findOneAndUpdate(
    { clerkId: userId },
    { $set: body },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return NextResponse.json(userDoc);
}
