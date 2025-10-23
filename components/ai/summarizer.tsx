"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, RefreshCw, Sparkles, Trash } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface SummaryItem {
  _id: string;
  text: string;
  summary: string[];
  takeaways: string[];
  quiz: { question: string; answer: string }[];
  createdAt: string;
}

interface Props {
  initialSummaries: SummaryItem[];
}

export function Summarizer({ initialSummaries }: Props) {
  const [text, setText] = useState("");
  const [summaries, setSummaries] = useState<SummaryItem[]>(initialSummaries);
  const [activeSummary, setActiveSummary] = useState<SummaryItem | null>(initialSummaries[0] || null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    const res = await fetch("/api/summaries");
    if (res.ok) {
      const data = await res.json();
      setSummaries(data);
      setActiveSummary(data[0] || null);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleSummarize = async () => {
    if (!text.trim()) {
      toast.error("Enter text to summarize");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/summaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSummaries((prev) => [data, ...prev]);
      setActiveSummary(data);
      setText("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadSummary = async (id: string) => {
    const res = await fetch(`/api/summaries/${id}/pdf`);
    if (!res.ok) {
      toast.error("Failed to download");
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `summary-${id}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const deleteSummary = async (id: string) => {
    await fetch(`/api/summaries/${id}`, { method: "DELETE" });
    setSummaries((prev) => prev.filter((item) => item._id !== id));
    if (activeSummary?._id === id) {
      setActiveSummary(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-2xl">
            AI Summarizer
            <Button variant="ghost" size="icon" onClick={refresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-6">
          <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-6">
            <Textarea
              placeholder="Paste any text or transcript and let Gemini craft insights"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="mt-3 flex justify-end">
              <Button onClick={handleSummarize} disabled={loading}>
                {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}Summarize
              </Button>
            </div>
          </div>

          {activeSummary ? (
            <div className="space-y-5 rounded-2xl border border-white/10 bg-background/90 p-6 shadow-lg">
              <section>
                <h3 className="text-lg font-semibold text-foreground">Key Points</h3>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  {activeSummary.summary.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </section>
              <section>
                <h3 className="text-lg font-semibold text-foreground">Takeaways</h3>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  {activeSummary.takeaways.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </section>
              <section>
                <h3 className="text-lg font-semibold text-foreground">Mini Quiz</h3>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  {activeSummary.quiz.map((item, index) => (
                    <li key={index}>
                      <strong>{item.question}</strong>
                      <br />
                      <span className="text-primary">Answer: {item.answer}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          ) : (
            <p className="text-muted-foreground">Summaries will appear here.</p>
          )}
        </CardContent>
      </Card>
      <aside className="space-y-4">
        <h3 className="text-lg font-semibold">History</h3>
        <div className="space-y-3">
          {summaries.map((item) => (
            <div
              key={item._id}
              className={`glass-panel cursor-pointer rounded-2xl border border-white/10 p-4 transition hover:border-primary/60 ${
                activeSummary?._id === item._id ? "ring-2 ring-primary/60" : ""
              }`}
              onClick={() => setActiveSummary(item)}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.summary[0]?.slice(0, 60) || "Summary"}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); downloadSummary(item._id); }}>
                    <Download className="h-4 w-4 text-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteSummary(item._id); }}>
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
