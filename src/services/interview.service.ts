// Frontend interview service — wraps repository with caching + AsyncState shaping.
import { interviewRepository } from "@/repositories/interview.repository";
import type { Category, Question, AsyncState } from "@/types";

const cache = new Map<string, unknown>();
const KEY_CATS = "categories";
const keyForCat = (slug: string) => `cat:${slug}`;
const keyForSearch = (q: string) => `search:${q.toLowerCase()}`;

async function shape<T>(p: Promise<T>): Promise<AsyncState<T>> {
  try {
    const data = await p;
    return { status: "success", data };
  } catch (e) {
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

export const interviewService = {
  async loadCategories(): Promise<AsyncState<Category[]>> {
    const hit = cache.get(KEY_CATS) as Category[] | undefined;
    if (hit) return { status: "success", data: hit };
    const state = await shape(interviewRepository.getCategories());
    if (state.status === "success") cache.set(KEY_CATS, state.data);
    return state;
  },

  async loadByCategory(slug: string): Promise<AsyncState<Question[]>> {
    const hit = cache.get(keyForCat(slug)) as Question[] | undefined;
    if (hit) return { status: "success", data: hit };
    const state = await shape(interviewRepository.getByCategory(slug));
    if (state.status === "success") cache.set(keyForCat(slug), state.data);
    return state;
  },

  async search(query: string) {
    const k = keyForSearch(query);
    const hit = cache.get(k) as
      | Array<{ category: Category; question: Question }>
      | undefined;
    if (hit) return { status: "success" as const, data: hit };
    const state = await shape(interviewRepository.search(query));
    if (state.status === "success") cache.set(k, state.data);
    return state;
  },

  invalidate() {
    cache.clear();
  },
};
