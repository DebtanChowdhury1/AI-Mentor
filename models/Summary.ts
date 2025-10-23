import { Schema, model, models } from "mongoose";

const QuizItemSchema = new Schema(
  {
    question: String,
    answer: String
  },
  { _id: false }
);

const SummarySchema = new Schema(
  {
    clerkId: { type: String, required: true },
    source: { type: String },
    text: { type: String },
    summary: [{ type: String }],
    takeaways: [{ type: String }],
    quiz: [QuizItemSchema]
  },
  { timestamps: true }
);

export default models.Summary || model("Summary", SummarySchema);
