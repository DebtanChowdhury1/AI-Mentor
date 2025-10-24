"use client";

import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";

const features = [
  {
    title: "AI Tutorial Chat",
    description: "Turn any video or topic into an interactive tutor that answers every question.",
    icon: <Sparkles className="h-6 w-6 text-primary" />
  },
  {
    title: "AI Exam",
    description: "Generate adaptive exams with instant grading and mastery feedback.",
    icon: <Play className="h-6 w-6 text-primary" />
  },
  {
    title: "AI Summaries",
    description: "Distill hours of content into insights, notes, and quizzes with one click.",
    icon: <ArrowRight className="h-6 w-6 text-primary" />
  }
];

export default function MarketingPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-glow opacity-70" />
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-16 px-6 pb-24 pt-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="glass-panel gradient-border relative flex flex-col items-center gap-6 px-10 py-14"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            ✨ Your Personal AI Learning Universe
          </span>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Learn Smarter with <span className="bg-gradient-to-r from-indigo-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent">AI Mentor</span>
          </h1>
          <p className="max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
            Upload any YouTube video or topic and let Gemini 2.0 Flash transform it into an immersive tutor experience. Ask questions, generate exams, and collect personalized study notes in seconds.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button size="lg" variant="secondary" className="h-12 px-8 text-base" asChild>
              <Link href="/ai-tutorial">Explore Platform</Link>
            </Button>
          </div>
        </motion.div>

        <section className="grid w-full gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="glass-panel gradient-border flex h-full flex-col gap-4 p-6 text-left"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
              <Link href="/sign-in" className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Start now <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </section>
      </main>
    </div>
  );
}
