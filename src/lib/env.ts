// Centralized, validated env access (Vite). All NEXT_PUBLIC_* mapped to VITE_*.

const bool = (v: string | undefined, fallback: boolean) =>
  v === undefined ? fallback : v === "true";
const num = (v: string | undefined, fallback: number) => {
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
};

export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  USE_MOCK_DATA: bool(import.meta.env.VITE_USE_MOCK_DATA as string | undefined, true),
  MOCK_DELAY: num(import.meta.env.VITE_MOCK_DELAY as string | undefined, 300),
} as const;

export type Env = typeof env;
