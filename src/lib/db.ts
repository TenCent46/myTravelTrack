import { neon } from "@neondatabase/serverless";

// Lazy init to avoid build-time errors when DATABASE_URL isn't set
let _sql: ReturnType<typeof neon> | null = null;

export function sql(strings: TemplateStringsArray, ...values: any[]) {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!);
  return _sql(strings, ...values);
}
