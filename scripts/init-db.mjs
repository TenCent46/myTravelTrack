import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = neon(process.env.DATABASE_URL);
const schema = readFileSync(resolve(__dirname, "../schema.sql"), "utf-8");

// Split on semicolons (naive but works for this schema)
const statements = schema
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.startsWith("--"));

console.log(`Running ${statements.length} statements...`);
for (const stmt of statements) {
  try {
    await sql(stmt);
    console.log("  OK:", stmt.slice(0, 60) + "...");
  } catch (e) {
    console.error("  ERR:", e.message, "\n    →", stmt.slice(0, 80));
  }
}
console.log("Done! DB initialized.");
