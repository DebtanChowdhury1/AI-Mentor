import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import Chat from "@/models/Chat";
import Exam from "@/models/Exam";
import Summary from "@/models/Summary";

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const [chats, exams, summaries] = await Promise.all([
      Chat.countDocuments({ clerkId: userId }),
      Exam.countDocuments({ clerkId: userId }),
      Summary.countDocuments({ clerkId: userId })
    ]);

    const timeline = await Chat.aggregate([
      { $match: { clerkId: userId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return NextResponse.json({ chats, exams, summaries, timeline });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
