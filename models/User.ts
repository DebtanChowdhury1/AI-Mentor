import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    name: { type: String },
    avatar: { type: String },
    xp: { type: Number, default: 0 },
    badges: [{ type: String }],
    preferences: {
      theme: { type: String, default: "system" },
      notifications: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

export default models.User || model("User", UserSchema);
