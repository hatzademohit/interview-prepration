// Language repository — in-memory mock with API-compatible signatures.
import { env } from "@/lib/env";
import { mockDelay, apiClient } from "@/lib/api-client";
import { normalizeLanguage } from "@/adapters/languageAdapter";
import { toSlug } from "@/utils/slugify";
import type { Language } from "@/types";

const seed: Language[] = [
  {
    _id: "lang-1",
    name: "JavaScript",
    slug: "javascript",
    description: "The language of the web.",
    icon: "Braces",
    color: "#f7df1e",
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "lang-2",
    name: "TypeScript",
    slug: "typescript",
    description: "Typed superset of JavaScript.",
    icon: "FileCode",
    color: "#3178c6",
    displayOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "lang-3",
    name: "Python",
    slug: "python",
    description: "Readable, batteries-included.",
    icon: "Code",
    color: "#3776ab",
    displayOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let store: Language[] = [...seed];

export type LanguageInput = Omit<Language, "_id" | "createdAt" | "updatedAt">;

export const languageRepository = {
  async getAll(): Promise<Language[]> {
    if (env.USE_MOCK_DATA) {
      await mockDelay();
      return [...store].sort((a, b) => a.displayOrder - b.displayOrder);
    }
    const raw = await apiClient.get<Language[]>("/languages");
    return raw.map(normalizeLanguage);
  },

  async getById(id: string): Promise<Language | null> {
    if (env.USE_MOCK_DATA) {
      await mockDelay();
      return store.find((l) => l._id === id) ?? null;
    }
    return apiClient.get<Language>(`/languages/${id}`);
  },

  async create(input: LanguageInput): Promise<Language> {
    if (env.USE_MOCK_DATA) {
      await mockDelay();
      const slug = input.slug || toSlug(input.name);
      if (store.some((l) => l.slug === slug)) {
        throw new Error(`Language slug "${slug}" already exists`);
      }
      const lang: Language = normalizeLanguage({ ...input, slug });
      store = [...store, lang];
      return lang;
    }
    return apiClient.post<Language>("/languages", input);
  },

  async update(id: string, patch: Partial<LanguageInput>): Promise<Language> {
    if (env.USE_MOCK_DATA) {
      await mockDelay();
      const idx = store.findIndex((l) => l._id === id);
      if (idx === -1) throw new Error("Language not found");
      const merged: Language = {
        ...store[idx],
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      store = store.map((l) => (l._id === id ? merged : l));
      return merged;
    }
    return apiClient.put<Language>(`/languages/${id}`, patch);
  },

  async delete(id: string): Promise<void> {
    if (env.USE_MOCK_DATA) {
      await mockDelay();
      store = store.filter((l) => l._id !== id);
      return;
    }
    await apiClient.delete<void>(`/languages/${id}`);
  },
};
