import { Schema, model, models } from "mongoose";

const QuestionSchema = new Schema(
  {
    type: { type: String, enum: ["mcq", "short"], required: true },
    prompt: { type: String, required: true },
    options: [{ type: String }],
    answer: { type: String, required: true }
  },
  { _id: false }
);

const FeedbackSchema = new Schema(
  {
    question: String,
    result: String,
    explanation: String
  },
  { _id: false }
);

const ExamSchema = new Schema(
  {
    clerkId: { type: String, required: true },
    topic: { type: String, required: true },
    questions: [QuestionSchema],
    answers: { type: Map, of: String },
    feedback: [FeedbackSchema],
    score: { type: Number },
    summary: { type: String }
  },
  { timestamps: true }
);

export default models.Exam || model("Exam", ExamSchema);
