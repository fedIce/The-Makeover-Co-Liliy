type DevMagicLink = {
  email: string;
  url: string;
  at: number;
};

const globalStore = globalThis as typeof globalThis & {
  __makeoverDevMagicLink?: DevMagicLink;
};

export function isAuthDevMode() {
  if (process.env.AUTH_DEV_MODE === "true") return true;
  if (process.env.AUTH_DEV_MODE === "false") return false;
  return process.env.NODE_ENV !== "production";
}

export function storeDevMagicLink(email: string, url: string) {
  globalStore.__makeoverDevMagicLink = {
    email: email.toLowerCase(),
    url,
    at: Date.now(),
  };
  console.info(`[auth-dev] Magic link for ${email}:\n${url}`);
}

export function getDevMagicLink(email?: string) {
  const entry = globalStore.__makeoverDevMagicLink;
  if (!entry) return null;
  if (Date.now() - entry.at > 15 * 60_000) return null;
  if (email && entry.email !== email.toLowerCase()) return null;
  return entry;
}
