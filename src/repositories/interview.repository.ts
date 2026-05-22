// Frontend interview repository — JSON-backed today, swap to apiClient later.
import { env } from "@/lib/env";
import { mockDelay, apiClient } from "@/lib/api-client";
import { normalizeCategory, normalizeQuestion } from "@/adapters/questionAdapter";
import type { Category, Question, RawCategoryFile } from "@/types";

import htmlJson from "@/data/html.json";
import cssJson from "@/data/css.json";
import jsJson from "@/data/js.json";
import tsJson from "@/data/typescript.json";
import reactJson from "@/data/react.json";

const RAW: RawCategoryFile[] = [
  htmlJson as RawCategoryFile,
  cssJson as RawCategoryFile,
  jsJson as RawCategoryFile,
  tsJson as RawCategoryFile,
  reactJson as RawCategoryFile,
];

function mockCategories(): Category[] {
  return RAW.map(normalizeCategory);
}

export const interviewRepository = {
  async getCategories(): Promise<Category[]> {
    if (env.USE_MOCK_DATA) {
      await mockDelay();
      return mockCategories();
    }
    const raw = await apiClient.get<RawCategoryFile[]>("/categories");
    return raw.map(normalizeCategory);
  },

  async getByCategory(slug: string): Promise<Question[]> {
    if (env.USE_MOCK_DATA) {
      await mockDelay();
      const cat = mockCategories().find((c) => c.slug === slug);
      return cat?.questions ?? [];
    }
    const raw = await apiClient.get<Question[]>(`/questions?category=${slug}`);
    return raw.map(normalizeQuestion);
  },

  async getById(id: string): Promise<Question | null> {
    if (env.USE_MOCK_DATA) {
      await mockDelay();
      for (const cat of mockCategories()) {
        const q = cat.questions.find((x) => x.id === id);
        if (q) return q;
      }
      return null;
    }
    const raw = await apiClient.get<Question | null>(`/questions/${id}`);
    return raw ? normalizeQuestion(raw) : null;
  },

  async search(query: string): Promise<Array<{ category: Category; question: Question }>> {
    if (env.USE_MOCK_DATA) {
      await mockDelay();
      const q = query.trim().toLowerCase();
      if (!q) return [];
      const out: Array<{ category: Category; question: Question }> = [];
      for (const cat of mockCategories()) {
        for (const question of cat.questions) {
          const haystack =
            question.title + " " + question.shortAnswer + " " + question.tags.join(" ");
          if (haystack.toLowerCase().includes(q)) out.push({ category: cat, question });
        }
      }
      return out;
    }
    const raw = await apiClient.get<Array<{ category: Category; question: Question }>>(
      `/questions/search?q=${encodeURIComponent(query)}`,
    );
    return raw;
  },
};
