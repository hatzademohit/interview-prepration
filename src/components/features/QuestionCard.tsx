import { memo } from "react";
import { Bookmark, BookmarkCheck, Circle } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { DIFFICULTY_COLOR } from "@/constants/categories";
import { formatDifficulty } from "@/utils/formatDifficulty";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useProgressStore } from "@/store/progressStore";
import type { QuestionCardProps } from "@/types";

function QuestionCardImpl({ question, onOpen }: QuestionCardProps) {
  const { isBookmarked, toggle } = useBookmarks();
  const recentlyViewed = useProgressStore((s) => s.recentlyViewed);
  const bookmarked = isBookmarked(question.id);
  const isRecent = recentlyViewed.includes(question.id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group relative flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            DIFFICULTY_COLOR[question.difficulty],
          )}
        >
          {formatDifficulty(question.difficulty)}
        </span>
        <div className="flex items-center gap-1">
          {isRecent && (
            <Circle
              className="h-2 w-2 fill-primary text-primary"
              aria-label="Recently viewed"
            />
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggle(question.id);
            }}
            aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
            aria-pressed={bookmarked}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {bookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onOpen(question)}
        className="flex-1 text-left"
      >
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
          {question.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">
          {question.shortAnswer}
        </p>
      </button>

      <div className="mt-3 flex flex-wrap gap-1">
        {question.tags.slice(0, 3).map((t) => (
          <span
            key={t}
            className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
          >
            #{t}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export const QuestionCard = memo(QuestionCardImpl);
