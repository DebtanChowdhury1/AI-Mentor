"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgePlus, MessageCircle, RefreshCw, Trash } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";

interface Expert {
  _id: string;
  name: string;
  description?: string;
  tone?: string;
  prompt: string;
  isPreset: boolean;
  createdAt: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  experts: Expert[];
}

export function ExpertsPanel({ experts: initialExperts }: Props) {
  const [experts, setExperts] = useState<Expert[]>(initialExperts);
  const [activeExpert, setActiveExpert] = useState<Expert | null>(initialExperts[0] || null);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", prompt: "", description: "", tone: "" });

  const fetchExperts = async () => {
    const res = await fetch("/api/experts");
    if (res.ok) {
      const data = await res.json();
      setExperts(data);
      setActiveExpert(data[0] || null);
    }
  };

  useEffect(() => {
    fetchExperts();
  }, []);

  const handleAsk = async () => {
    if (!question || !activeExpert) return;
    setConversation((prev) => [...prev, { role: "user", content: question }]);
    try {
      setLoading(true);
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${activeExpert.name} Session`,
          context: `${activeExpert.prompt}. Tone: ${activeExpert.tone}`,
          message: question
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      const last = data.messages[data.messages.length - 1];
      setConversation((prev) => [...prev, last]);
      toast.success("Expert replied");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setQuestion("");
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name || !form.prompt) {
      toast.error("Provide a name and prompt");
      return;
    }
    const res = await fetch("/api/experts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      toast.success("Expert saved");
      setForm({ name: "", prompt: "", description: "", tone: "" });
      fetchExperts();
    }
  };

  const handleDelete = async (expert: Expert) => {
    if (expert.isPreset) return;
    await fetch(`/api/experts/${expert._id}`, { method: "DELETE" });
    toast.success("Expert deleted");
    fetchExperts();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Experts</h3>
          <Button variant="ghost" size="icon" onClick={fetchExperts}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3">
          {experts.map((expert) => (
            <div
              key={expert._id}
              className={`glass-panel cursor-pointer rounded-2xl border border-white/10 p-4 transition hover:border-primary/60 ${
                activeExpert?._id === expert._id ? "ring-2 ring-primary/60" : ""
              }`}
              onClick={() => {
                setActiveExpert(expert);
                setConversation([]);
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{expert.name}</p>
                  <p className="text-xs text-muted-foreground">{expert.description}</p>
                  <p className="text-xs text-primary">{expert.tone}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(expert.createdAt)}</p>
                </div>
                {!expert.isPreset && (
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(expert); }}>
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Create Expert</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input placeholder="Tone" value={form.tone} onChange={(e) => setForm((f) => ({ ...f, tone: e.target.value }))} />
            <Textarea
              placeholder="Prompt"
              value={form.prompt}
              onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))}
            />
            <Textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <Button onClick={handleCreate}>
              <BadgePlus className="mr-2 h-4 w-4" />Save Expert
            </Button>
          </CardContent>
        </Card>
      </aside>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-foreground">
            {activeExpert ? `${activeExpert.name} Mentor` : "Select Expert"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-6">
          <div className="rounded-2xl border border-white/10 bg-background/90 p-4 shadow-lg">
            <Textarea
              placeholder="Ask your expert anything..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="mt-3 flex justify-end">
              <Button onClick={handleAsk} disabled={loading || !activeExpert}>
                <MessageCircle className="mr-2 h-4 w-4" />Ask Expert
              </Button>
            </div>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-white/10 bg-background/80 p-6">
            {conversation.length ? (
              conversation.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-3xl rounded-3xl px-6 py-4 text-sm leading-relaxed shadow-lg ${
                    message.role === "assistant"
                      ? "ml-auto bg-gradient-to-r from-emerald-500/80 to-cyan-500/80 text-white"
                      : "mr-auto bg-background text-foreground"
                  }`}
                >
                  {message.content}
                </motion.div>
              ))
            ) : (
              <p className="text-muted-foreground">Select an expert and start a conversation.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
