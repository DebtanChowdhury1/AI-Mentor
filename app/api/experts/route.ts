import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import Expert from "@/models/Expert";

const presets = [
  {
    name: "AI Researcher",
    description: "Deep dives into cutting-edge AI concepts.",
    tone: "Analytical and precise",
    prompt: "You are an AI research expert who cites papers and explains clearly.",
    isPreset: true
  },
  {
    name: "Web Architect",
    description: "Guides modern web development decisions.",
    tone: "Practical and friendly",
    prompt: "You are a senior full-stack engineer focusing on DX and performance.",
    isPreset: true
  },
  {
    name: "Data Strategist",
    description: "Simplifies complex data workflows.",
    tone: "Insightful and data-driven",
    prompt: "You are a data expert who blends statistics and intuition.",
    isPreset: true
  },
  {
    name: "Mathematics Sage",
    description: "Explains math concepts with proofs and intuition.",
    tone: "Patient and rigorous",
    prompt: "You are a math tutor who mixes theory with examples.",
    isPreset: true
  }
];

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();
    const existingPresets = await Expert.find({ clerkId: userId, isPreset: true });
    if (existingPresets.length === 0) {
      await Expert.insertMany(presets.map((preset) => ({ ...preset, clerkId: userId })));
    }
    const experts = await Expert.find({ clerkId: userId }).sort({ createdAt: -1 });
    return NextResponse.json(experts);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load experts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    await connectToDatabase();
    const expert = await Expert.create({ ...body, clerkId: userId, isPreset: false });
    return NextResponse.json(expert);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save expert" }, { status: 500 });
  }
}
