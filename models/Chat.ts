import { Schema, model, models, Types } from "mongoose";

const MessageSchema = new Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const ChatSchema = new Schema(
  {
    clerkId: { type: String, required: true },
    sessionId: { type: String, required: true },
    title: { type: String },
    source: { type: String },
    summary: { type: String },
    context: { type: String },
    messages: [MessageSchema]
  },
  { timestamps: true }
);

export default models.Chat || model("Chat", ChatSchema);
