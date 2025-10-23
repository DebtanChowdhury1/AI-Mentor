import "server-only";

import { GoogleGenerativeAI } from "@google/generative-ai";
import PDFDocument from "pdfkit";
import type { Readable } from "stream";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function generateText(prompt: string, systemInstruction?: string) {
  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ],
    systemInstruction
  });
  const response = await result.response;
  return response.text();
}

function parseGeminiJSON<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    console.error("Gemini JSON parse error", error, text);
    throw new Error("Gemini response was not valid JSON");
  }
}

export async function analyzeYouTube(urlOrText: string) {
  const prompt = `You are an elite AI tutor. Given the input which may be a YouTube URL or text transcript, extract the transcript (if possible) and summarize:
- Title or main topic
- Key sections with timestamps if available
- 5 core insights
- 5 follow-up questions for the learner
Return JSON with keys: title, summary, insights (array of strings), questions (array of strings). Input: ${urlOrText}`;
  const text = await generateText(prompt);
  return parseGeminiJSON(text);
}

export async function chatWithTutor(context: string, message: string) {
  const prompt = `You are AI Mentor, a personable AI tutor. Context: ${context}. Learner question: ${message}.
Respond with thoughtful explanation, follow-up question, and 3 citations (fabricate only if not provided). Return JSON with keys: reply, followUp, citations (array of strings).`;
  const text = await generateText(prompt);
  return parseGeminiJSON(text);
}

export async function generateExam(topic: string) {
  const prompt = `Create an advanced exam for topic: ${topic}.
Return JSON with keys: questions (array of {type: 'mcq'|'short', prompt, options?, answer}), rubric (array of strings), guidance.`;
  const text = await generateText(prompt, "You grade with clarity and positivity.");
  return parseGeminiJSON(text);
}

export async function gradeExam(topic: string, questions: any[], answers: Record<string, string>) {
  const prompt = `Grade the exam for topic ${topic}. Questions: ${JSON.stringify(questions)}. Learner answers: ${JSON.stringify(answers)}.
Return JSON with keys: feedback (array of {question, result, explanation}), score (0-100).`;
  const text = await generateText(prompt);
  return parseGeminiJSON(text);
}

export async function summarizeText(textInput: string) {
  const prompt = `Summarize the following text into key points, actionable takeaways, and a 3-question quiz. Return JSON with keys: summary (array of strings), takeaways (array of strings), quiz (array of {question, answer}). Text: ${textInput}`;
  const text = await generateText(prompt);
  return parseGeminiJSON(text);
}

export async function generatePDF(content: {
  title: string;
  sections: { heading: string; body: string }[];
}): Promise<Readable> {
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
