import { memo } from "react";
import { useUIStore } from "@/store/uiStore";
import { useProgressStore } from "@/store/progressStore";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  categories: Category[];
}

function CategoryTabsImpl({ categories }: CategoryTabsProps) {
  const active = useUIStore((s) => s.activeCategory);
  const setActive = useUIStore((s) => s.setActiveCategory);
  const getProgress = useProgressStore((s) => s.getProgress);

  return (
    <div
      role="tablist"
      aria-label="Question categories"
      className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
      onKeyDown={(e) => {
        const idx = categories.findIndex((c) => c.slug === active);
        if (e.key === "ArrowRight" && idx < categories.length - 1)
          setActive(categories[idx + 1].slug);
        if (e.key === "ArrowLeft" && idx > 0) setActive(categories[idx - 1].slug);
      }}
    >
      {categories.map((cat) => {
        const isActive = cat.slug === active;
        const p = getProgress(cat.slug, cat.questions);
        return (
          <button
            key={cat.slug}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => setActive(cat.slug)}
            className={cn(
              "group relative shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="flex items-center gap-2">
              {cat.label}
              <span
                className={cn(
                  "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {p.viewed}/{cat.questions.length}
              </span>
            </span>
            {isActive && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export const CategoryTabs = memo(CategoryTabsImpl);
