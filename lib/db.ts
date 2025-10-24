import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is not defined in environment variables");
}

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: GlobalMongoose | undefined;
}

// ✅ Initialize global cache safely
const cached: GlobalMongoose = global._mongoose ?? { conn: null, promise: null };
global._mongoose = cached;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    // ✅ Cast MONGODB_URI to string after the existence check
    cached.promise = mongoose.connect(MONGODB_URI as string, { bufferCommands: false });
  }

  try {
    cached.conn = await cached.promise;
    console.log("🟢 MongoDB connected successfully");
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
