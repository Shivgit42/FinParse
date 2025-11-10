import "dotenv/config";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema.js";

let dbUrl = process.env.DATABASE_URL ?? "";

if (!dbUrl) {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const candidates = [
      path.resolve(process.cwd(), ".env"),
      path.resolve(__dirname, "../../.env"),
      path.resolve(__dirname, "../../../apps/server/.env"),
      path.resolve(__dirname, "../.env"),
    ];
    for (const p of candidates) {
      dotenv.config({ path: p, override: false });
      if (process.env.DATABASE_URL) {
        dbUrl = process.env.DATABASE_URL;
        break;
      }
    }
  } catch {}
}

if (!dbUrl) {
  throw new Error("DATABASE_URL is not set. Please add it to your .env.");
}

const sql = neon(dbUrl);
export const db = drizzle(sql, { schema });
