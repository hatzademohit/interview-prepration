import type { Language } from "@/types";

export function normalizeLanguage(raw: unknown): Language {
  const r = raw as Partial<Language>;
  const now = new Date().toISOString();
  return {
    _id: String(r._id ?? crypto.randomUUID()),
    name: r.name ?? "",
    slug: r.slug ?? "",
    description: r.description ?? "",
    icon: r.icon ?? "Code",
    color: r.color ?? "#6366f1",
    displayOrder: r.displayOrder ?? 0,
    createdAt: r.createdAt ?? now,
    updatedAt: r.updatedAt ?? now,
  };
}
