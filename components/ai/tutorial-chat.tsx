"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Edit, Loader2, Plus, Send, Trash } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Chat {
  _id: string;
  title: string;
  source?: string;
  messages: Message[];
  updatedAt: string;
}

interface Props {
  initialChats: Chat[];
}

export function TutorialChat({ initialChats }: Props) {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeChat, setActiveChat] = useState<Chat | null>(initialChats[0] || null);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [source, setSource] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    setActiveChat(initialChats[0] || null);
  }, [initialChats]);

  const handleAnalyze = async () => {
    if (!source) {
      toast.error("Paste a YouTube link or text to analyze.");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch("/api/chats", {
        method: "POST",
        body: JSON.stringify({ source, title: title || "AI Tutorial" }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to analyze");
      toast.success("Context analyzed. Start chatting!");
      setChats((prev) => [data, ...prev]);
      setActiveChat(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      setLoading(true);
      const response = await fetch("/api/chats", {
        method: "POST",
        body: JSON.stringify({ chatId: activeChat?._id, message: input }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send message");
      setChats((prev) => prev.map((chat) => (chat._id === data._id ? data : chat)));
      setActiveChat(data);
      setInput("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/chats/${id}`, { method: "DELETE" });
    setChats((prev) => prev.filter((chat) => chat._id !== id));
    if (activeChat?._id === id) {
      setActiveChat(null);
    }
  };

  const handleDownload = async (id: string) => {
    const res = await fetch(`/api/chats/${id}/pdf`);
    if (!res.ok) {
      toast.error("Failed to download");
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${id}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="flex flex-col">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="flex items-center justify-between text-2xl">
            AI Tutorial Chat
            <span className="text-sm font-normal text-muted-foreground">Powered by Gemini 2.0 Flash</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-6">
          <div className="grid gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-6">
            <Input placeholder="YouTube link or topic" value={source} onChange={(e) => setSource(e.target.value)} />
            <Input placeholder="Session title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Button onClick={handleAnalyze} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}Analyze 🎥
            </Button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-white/10 bg-background/80 p-6 shadow-inner">
            {activeChat?.messages?.length ? (
              activeChat.messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-3xl rounded-3xl px-6 py-4 text-sm leading-relaxed shadow-lg ${
                    message.role === "assistant"
                      ? "ml-auto bg-gradient-to-r from-indigo-500/80 to-purple-500/80 text-white"
                      : "mr-auto bg-background text-foreground"
                  }`}
                >
                  {message.content}
                </motion.div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">Analyze a source to begin your AI mentor session.</p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-background/90 p-4 shadow-lg">
            <Textarea
              placeholder="Ask your mentor anything about the content..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="mt-3 flex justify-end">
              <Button onClick={handleSend} disabled={!activeChat || loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Ask Tutor
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <aside className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Session History</h3>
          <Button variant="ghost" size="sm" onClick={async () => {
            const res = await fetch("/api/chats");
            if (res.ok) {
              const data = await res.json();
              setChats(data);
            }
          }}>
            Refresh
          </Button>
        </div>
        <div className="space-y-3">
          {chats.map((chat) => (
            <div
              key={chat._id}
              className={`glass-panel cursor-pointer rounded-2xl border border-white/10 p-4 transition hover:border-primary/60 ${
                activeChat?._id === chat._id ? "ring-2 ring-primary/60" : ""
              }`}
              onClick={() => setActiveChat(chat)}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{chat.title || "Untitled"}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(chat.updatedAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={(e) => {
                    e.stopPropagation();
                    const newTitle = prompt("Rename chat", chat.title || "");
                    if (newTitle) {
                      fetch(`/api/chats/${chat._id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ title: newTitle }),
                        headers: { "Content-Type": "application/json" }
                      }).then(async (res) => {
                        const updated = await res.json();
                        setChats((prev) => prev.map((item) => (item._id === chat._id ? updated : item)));
                        setActiveChat((current) => (current?._id === chat._id ? updated : current));
                      });
                    }
                  }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(chat._id);
                  }}>
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(chat._id);
                  }}>
                    <Download className="h-4 w-4 text-primary" />
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
