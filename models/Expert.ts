import { Schema, model, models } from "mongoose";

const ExpertSchema = new Schema(
  {
    clerkId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    tone: { type: String },
    prompt: { type: String, required: true },
    isPreset: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default models.Expert || model("Expert", ExpertSchema);
