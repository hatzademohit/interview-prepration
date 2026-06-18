import { EmptyState } from "@/components/EmptyState";
import { QuestionCard } from "@/components/features/QuestionCard";
import SkeletonGrid from "@/components/SkeletonGrid";
import { useSearch } from "@/hooks/useSearch";
import { Question } from "@/types";
import { SearchX } from "lucide-react";

interface SearchResultsProps {
  state: ReturnType<typeof useSearch>;
  onOpen: (q: Question) => void;
  query: string;
}

function SearchResults({ state, onOpen, query }: SearchResultsProps) {
  if (state.status === "loading") return <SkeletonGrid />;
  if (state.status === "error")
    return <p className="text-sm text-destructive">{state.message}</p>;
  if (state.status !== "success") return null;
  if (state.data.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title={`No results for "${query}"`}
        description="Try a different keyword, tag, or category."
      />
    );
  }
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {state.data.map(({ category, question }) => (
        <div key={question.id} className="flex flex-col gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {category.label}
          </span>
          <QuestionCard
            question={question}
            categorySlug={category.slug}
            onOpen={onOpen}
          />
        </div>
      ))}
    </div>
  );
}