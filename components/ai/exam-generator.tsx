"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ListChecks, RefreshCw, Send, Trash } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface Question {
  type: "mcq" | "short";
  prompt: string;
  options?: string[];
  answer: string;
}

interface Exam {
  _id: string;
  topic: string;
  questions: Question[];
  answers?: Record<string, string>;
  feedback?: { question: string; result: string; explanation: string }[];
  score?: number;
  updatedAt: string;
}

interface Props {
  initialExams: Exam[];
}

export function ExamGenerator({ initialExams }: Props) {
  const [topic, setTopic] = useState("");
  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [activeExam, setActiveExam] = useState<Exam | null>(initialExams[0] || null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const refreshExams = async () => {
    const res = await fetch("/api/exams");
    if (res.ok) {
      const data = await res.json();
      setExams(data);
      setActiveExam(data[0] || null);
    }
  };

  const generateExam = async () => {
    if (!topic) {
      toast.error("Enter a topic");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      setExams((prev) => [data, ...prev]);
      setActiveExam(data);
      setTopic("");
      toast.success("Exam ready!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const submitExam = async () => {
    if (!activeExam) return;
    try {
      setLoading(true);
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId: activeExam._id, answers, questions: activeExam.questions })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to grade");
      setExams((prev) => prev.map((exam) => (exam._id === data._id ? data : exam)));
      setActiveExam(data);
      toast.success("Graded! 🎉");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadExam = async (id: string) => {
    const res = await fetch(`/api/exams/${id}/pdf`);
    if (!res.ok) {
      toast.error("Failed to download");
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exam-${id}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const deleteExam = async (id: string) => {
    await fetch(`/api/exams/${id}`, { method: "DELETE" });
    setExams((prev) => prev.filter((exam) => exam._id !== id));
    if (activeExam?._id === id) {
      setActiveExam(null);
    }
  };

  useEffect(() => {
    refreshExams();
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-2xl">
            AI Exam Studio
            {activeExam?.score !== undefined && (
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm text-emerald-500">Score: {activeExam.score}</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-6">
          <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input placeholder="Exam topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
              <Button onClick={generateExam} disabled={loading}>
                {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <ListChecks className="mr-2 h-4 w-4" />}Generate Exam
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            {activeExam ? (
              activeExam.questions.map((question, index) => (
                <div key={index} className="rounded-2xl border border-white/10 bg-background/90 p-5 shadow-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-primary">Question {index + 1}</p>
                      <p className="text-lg font-semibold text-foreground">{question.prompt}</p>
                    </div>
                    {question.type === "mcq" && (
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">MCQ</span>
                    )}
                  </div>
                  {question.options && (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {question.options.map((option, i) => (
                        <Button
                          key={i}
                          variant={answers[`${index}`] === option ? "default" : "outline"}
                          className="justify-start"
                          onClick={() => setAnswers((prev) => ({ ...prev, [`${index}`]: option }))}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}
                  {question.type === "short" && (
                    <Textarea
                      className="mt-3"
                      placeholder="Your answer"
                      value={answers[`${index}`] || ""}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [`${index}`]: e.target.value }))}
                    />
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Generate an exam to begin.</p>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={submitExam} disabled={!activeExam || loading}>
              <Send className="mr-2 h-4 w-4" />Submit Answers
            </Button>
          </div>
          {activeExam?.feedback && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
              <h3 className="text-lg font-semibold text-emerald-400">Feedback</h3>
              <ul className="mt-3 space-y-2 text-sm text-emerald-100">
                {activeExam.feedback.map((item, index) => (
                  <li key={index}>
                    <strong>{item.question}</strong>: {item.result} — {item.explanation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      <aside className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Exam History</h3>
          <Button variant="ghost" size="icon" onClick={refreshExams}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3">
          {exams.map((exam) => (
            <div
              key={exam._id}
              className={`glass-panel cursor-pointer rounded-2xl border border-white/10 p-4 transition hover:border-primary/60 ${
                activeExam?._id === exam._id ? "ring-2 ring-primary/60" : ""
              }`}
              onClick={() => {
                setActiveExam(exam);
                setAnswers(exam.answers || {});
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{exam.topic}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(exam.updatedAt)}</p>
                  {exam.score !== undefined && (
                    <p className="text-xs text-primary">Score: {exam.score}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); downloadExam(exam._id); }}>
                    <Download className="h-4 w-4 text-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteExam(exam._id); }}>
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
