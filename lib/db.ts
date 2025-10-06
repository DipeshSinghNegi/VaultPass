import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set");
}

let cached = (global as any).mongoose as { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
  const dbName = process.env.MONGODB_DB || "vaultpass";
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName,
      serverSelectionTimeoutMS: 15000,
      retryWrites: true
    }).then((m) => m).catch((e) => {
      console.error("Mongo connection error:", e?.message);
      throw e;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}


