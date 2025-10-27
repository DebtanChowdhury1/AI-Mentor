import "server-only";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Readable } from "stream";

export interface YouTubeAnalysis {
  title: string;
  summary: string;
  insights: string[];
  questions: string[];
}

export interface TutorResponse {
  reply: string;
  followUp: string;
  citations: string[];
}

export interface ExamQuestion {
  type: "mcq" | "short";
  prompt: string;
  options?: string[];
  answer: string;
}

export interface GeneratedExam {
  questions: ExamQuestion[];
  rubric: string[];
  guidance?: string;
}

export interface GradedFeedback {
  question: string;
  result: string;
  explanation: string;
}

export interface GradedExam {
  feedback: GradedFeedback[];
  score: number;
}

export interface TextSummary {
  summary: string[];
  takeaways: string[];
  quiz: { question: string; answer: string }[];
}

type GeminiModel = ReturnType<GoogleGenerativeAI["getGenerativeModel"]>;

let cachedModel: GeminiModel | null = null;
const defaultPdfkitDataDir = path.join(process.cwd(), "node_modules", "pdfkit", "js", "data");
const vendorPdfkitDataDir = path.join(process.cwd(), ".next", "server", "vendor-chunks", "data");
let ensurePdfkitDataPromise: Promise<void> | null = null;

if (!process.env.PDFKIT_DATA_DIR) {
  process.env.PDFKIT_DATA_DIR = defaultPdfkitDataDir;
}

async function ensurePdfkitDataFiles() {
  if (!ensurePdfkitDataPromise) {
    ensurePdfkitDataPromise = (async () => {
      try {
        await fs.access(path.join(vendorPdfkitDataDir, "Helvetica.afm"));
        return;
      } catch {
        // fallthrough to copy
      }

      await fs.mkdir(vendorPdfkitDataDir, { recursive: true });
      const files = await fs.readdir(defaultPdfkitDataDir);
      await Promise.all(
        files.map((file) =>
          fs.copyFile(path.join(defaultPdfkitDataDir, file), path.join(vendorPdfkitDataDir, file))
        )
      );
    })();
  }
  return ensurePdfkitDataPromise;
}

function getModel(): GeminiModel {
  if (cachedModel) return cachedModel;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");

  const genAI = new GoogleGenerativeAI(apiKey);
  cachedModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  return cachedModel;
}

function getStatusCode(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const maybeStatus = (error as { status?: number }).status;
    if (typeof maybeStatus === "number") {
      return maybeStatus;
    }
    const maybeResponse = (error as { response?: { status?: number } }).response;
    if (typeof maybeResponse?.status === "number") {
      return maybeResponse.status;
    }
  }
  return undefined;
}

function getErrorMessage(error: unknown) {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return undefined;
}

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, baseDelayMs = 500) {
  let attempt = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let lastError: any;

  while (attempt <= retries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const status = getStatusCode(error);
      const message = getErrorMessage(error) ?? "";
      const isOverloaded = /model is overloaded/i.test(message);
      const isRetriable =
        typeof status === "number" ? status >= 500 || status === 429 : isOverloaded;

      if (!isRetriable || attempt === retries) {
        break;
      }

      const delay = baseDelayMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt += 1;
    }
  }

  if (lastError instanceof Error && /model is overloaded/i.test(lastError.message)) {
    throw new Error("Gemini is temporarily overloaded. Please try again in a few seconds.");
  }

  throw lastError;
}

async function generateText(prompt: string, systemInstruction?: string) {
  const model = getModel();
  return retryWithBackoff(async () => {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      ...(systemInstruction
        ? { systemInstruction: { role: "system", parts: [{ text: systemInstruction }] } }
        : {}),
    });
    const response = await result.response;
    return response.text();
  });
}

function parseGeminiJSON<T>(text: string): T {
  const attempts: string[] = [];
  const trimmed = text.trim();

  if (!trimmed) {
    throw new Error("Gemini response was empty");
  }

  const codeFenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (codeFenceMatch?.[1]) {
    attempts.push(codeFenceMatch[1].trim());
  }

  const jsonSlice = (() => {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      return trimmed.slice(start, end + 1).trim();
    }
    return null;
  })();
  if (jsonSlice) {
    attempts.push(jsonSlice);
  }

  attempts.push(trimmed);

  for (const candidate of attempts) {
    try {
      return JSON.parse(candidate) as T;
    } catch {
      continue;
    }
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch (error) {
    console.error("Gemini JSON parse error", error, trimmed);
    throw new Error("Gemini response was not valid JSON");
  }
}

// ---------------------- Core Functions ----------------------

export async function analyzeYouTube(urlOrText: string): Promise<YouTubeAnalysis> {
  const prompt = `You are an elite AI tutor. Given the input which may be a YouTube URL or text transcript, extract the transcript (if possible) and summarize:
- Title or main topic
- Key sections with timestamps if available
- 5 core insights
- 5 follow-up questions for the learner
Return JSON with keys: title, summary, insights (array of strings), questions (array of strings). Input: ${urlOrText}`;
  const text = await generateText(prompt);
  return parseGeminiJSON<YouTubeAnalysis>(text);
}

export async function chatWithTutor(context: string, message: string): Promise<TutorResponse> {
  const prompt = `You are AI Mentor, a personable AI tutor. Context: ${context}. Learner question: ${message}.
Respond with thoughtful explanation, follow-up question, and 3 citations (fabricate only if not provided). Return JSON with keys: reply, followUp, citations (array of strings).`;
  const text = await generateText(prompt);
  return parseGeminiJSON<TutorResponse>(text);
}

export async function generateExam(topic: string): Promise<GeneratedExam> {
  const prompt = `Create an advanced exam for topic: ${topic}.
Return JSON with keys: questions (array of {type: 'mcq'|'short', prompt, options?, answer}), rubric (array of strings), guidance.`;
  const text = await generateText(prompt, "You grade with clarity and positivity.");
  return parseGeminiJSON<GeneratedExam>(text);
}

export async function gradeExam(
  topic: string,
  questions: ExamQuestion[],
  answers: Record<string, string>
): Promise<GradedExam> {
  const prompt = `Grade the exam for topic ${topic}. Questions: ${JSON.stringify(
    questions
  )}. Learner answers: ${JSON.stringify(answers)}.
Return JSON with keys: feedback (array of {question, result, explanation}), score (0-100).`;
  const text = await generateText(prompt);
  return parseGeminiJSON<GradedExam>(text);
}

export async function summarizeText(textInput: string): Promise<TextSummary> {
  const prompt = `Summarize the following text into key points, actionable takeaways, and a 3-question quiz. Return JSON with keys: summary (array of strings), takeaways (array of strings), quiz (array of {question, answer}). Text: ${textInput}`;
  const text = await generateText(prompt);
  return parseGeminiJSON<TextSummary>(text);
}

export async function generatePDF(content: {
  title: string;
  sections: { heading: string; body: string }[];
}): Promise<Readable> {
  await ensurePdfkitDataFiles();
  const pdfkit = await import("pdfkit");
  const PDFDocument = pdfkit.default;
  const doc = new PDFDocument({ margin: 50 });
  doc.fontSize(20).fillColor("#111827").text(content.title, { align: "center" });
  doc.moveDown();
  content.sections.forEach((section) => {
    doc.fontSize(16).fillColor("#4338CA").text(section.heading, { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(12).fillColor("#111827").text(section.body, { lineGap: 4 });
    doc.moveDown();
  });
  doc.end();
  return doc as unknown as Readable;
}
