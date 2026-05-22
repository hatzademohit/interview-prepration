import { useProgressStore } from "@/store/progressStore";

export function useRecentlyViewed() {
  const recent = useProgressStore((s) => s.recentlyViewed);
  const markViewed = useProgressStore((s) => s.markViewed);
  return { recent, markViewed };
}
