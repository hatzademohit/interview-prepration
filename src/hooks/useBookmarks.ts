import { useBookmarkStore } from "@/store/bookmarkStore";

export function useBookmarks() {
  const ids = useBookmarkStore((s) => s.bookmarkedIds);
  const toggle = useBookmarkStore((s) => s.toggleBookmark);
  const isBookmarked = useBookmarkStore((s) => s.isBookmarked);
  return { ids, toggle, isBookmarked };
}
