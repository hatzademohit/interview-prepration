import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Question } from "@/types";

const MAX_RECENT = 10;

interface ProgressState {
  viewedIds: string[];
  recentlyViewed: string[];
  markViewed: (id: string) => void;
  getProgress: (
    categorySlug: string,
    questions: Question[],
  ) => { viewed: number; total: number; pct: number };
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      viewedIds: [],
      recentlyViewed: [],
      markViewed: (id) =>
        set((s) => {
          const viewedIds = s.viewedIds.includes(id)
            ? s.viewedIds
            : [...s.viewedIds, id];
          const recentlyViewed = [id, ...s.recentlyViewed.filter((x) => x !== id)].slice(
            0,
            MAX_RECENT,
          );
          return { viewedIds, recentlyViewed };
        }),
      getProgress: (_slug, questions) => {
        const ids = new Set(questions.map((q) => q.id));
        const viewed = get().viewedIds.filter((id) => ids.has(id)).length;
        const total = questions.length;
        return { viewed, total, pct: total ? Math.round((viewed / total) * 100) : 0 };
      },
    }),
    { name: "interview-prep:progress" },
  ),
);
