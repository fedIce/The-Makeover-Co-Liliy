export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("user:pass@host"));
}
