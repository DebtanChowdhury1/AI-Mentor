"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, GraduationCap, MessageSquare, Sparkles, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

interface StatsResponse {
  chats: number;
  exams: number;
  summaries: number;
  timeline: { _id: string; count: number }[];
}

export function DashboardOverview() {
  const [stats, setStats] = useState<StatsResponse>({ chats: 0, exams: 0, summaries: 0, timeline: [] });

  const fetchStats = async () => {
    const res = await fetch("/api/stats", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setStats(data);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const cards = [
    { title: "AI Chats", value: stats.chats, icon: MessageSquare },
    { title: "Videos Analyzed", value: stats.chats, icon: Sparkles },
    { title: "Exams Taken", value: stats.exams, icon: GraduationCap },
    { title: "Summaries Created", value: stats.summaries, icon: Brain }
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                  <Icon className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{card.value}</div>
                  <p className="mt-2 text-xs text-muted-foreground">Growing every day with AI Mentor.</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </section>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-foreground">
            <TrendingUp className="h-5 w-5 text-primary" /> Usage Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.timeline.map((item) => ({ date: item._id, sessions: item.count }))}>
              <defs>
                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
              <Tooltip contentStyle={{ background: "rgba(15,23,42,0.9)", borderRadius: 16, border: "1px solid rgba(99,102,241,0.4)" }} />
              <Area type="monotone" dataKey="sessions" stroke="#6366F1" fillOpacity={1} fill="url(#colorSessions)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
