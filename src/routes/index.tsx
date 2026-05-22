import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowUp, BookmarkX, SearchX } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { CategoryTabs } from "@/components/features/CategoryTabs";
import { QuestionCard } from "@/components/features/QuestionCard";
import { QuestionModal } from "@/components/features/QuestionModal";
import { AddProjectDialog } from "@/components/features/AddProjectDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { interviewService } from "@/services/interview.service";
import { useSearch } from "@/hooks/useSearch";
import { useUIStore } from "@/store/uiStore";
import { useBookmarkStore } from "@/store/bookmarkStore";
import type { AsyncState, Category, Question } from "@/types";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  const [cats, setCats] = useState<AsyncState<Category[]>>({ status: "loading" });
  const [openQ, setOpenQ] = useState<Question | null>(null);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showTop, setShowTop] = useState(false);

  const activeCategory = useUIStore((s) => s.activeCategory);
  const setActiveCategory = useUIStore((s) => s.setActiveCategory);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const bookmarkedIds = useBookmarkStore((s) => s.bookmarkedIds);
  const searchState = useSearch(searchQuery);

  useEffect(() => {
    interviewService.loadCategories().then(setCats);
  }, []);

  useEffect(() => {
    if (cats.status === "success" && !cats.data.some((c) => c.slug === activeCategory)) {
      setActiveCategory(cats.data[0]?.slug ?? "react");
    }
  }, [cats, activeCategory, setActiveCategory]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const categories = cats.status === "success" ? cats.data : [];
  const activeCat = useMemo(
    () => categories.find((c) => c.slug === activeCategory),
    [categories, activeCategory],
  );

  const allQuestions = useMemo(
    () => categories.flatMap((c) => c.questions),
    [categories],
  );

  const visibleQuestions = useMemo(() => {
    if (showBookmarks) return allQuestions.filter((q) => bookmarkedIds.includes(q.id));
    return activeCat?.questions ?? [];
  }, [showBookmarks, allQuestions, bookmarkedIds, activeCat]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        bookmarkCount={bookmarkedIds.length}
        onAddProject={() => setAddProjectOpen(true)}
        onBookmarksClick={() => setShowBookmarks((v) => !v)}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {!isSearching && (
          <div className="mb-6 flex flex-col gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {showBookmarks ? "Your bookmarks" : "Master your interview"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {showBookmarks
                  ? `${bookmarkedIds.length} saved question${bookmarkedIds.length === 1 ? "" : "s"}`
                  : "Curated questions, model answers, code, and interview tips."}
              </p>
            </div>
            {!showBookmarks && cats.status === "success" && (
              <CategoryTabs categories={categories} />
            )}
          </div>
        )}

        {isSearching ? (
          <SearchResults state={searchState} onOpen={setOpenQ} query={searchQuery} />
        ) : cats.status === "loading" ? (
          <SkeletonGrid />
        ) : cats.status === "error" ? (
          <p className="text-sm text-destructive">{cats.message}</p>
        ) : visibleQuestions.length === 0 ? (
          <EmptyState
            icon={showBookmarks ? BookmarkX : SearchX}
            title={showBookmarks ? "No bookmarks yet" : "No questions yet"}
            description={
              showBookmarks
                ? "Tap the bookmark icon on any question to save it."
                : "Pick another category to keep exploring."
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleQuestions.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                categorySlug={activeCategory}
                onOpen={setOpenQ}
              />
            ))}
          </div>
        )}
      </main>

      <QuestionModal
        question={openQ}
        questions={visibleQuestions.length ? visibleQuestions : allQuestions}
        onClose={() => setOpenQ(null)}
        onNavigate={setOpenQ}
      />

      <AddProjectDialog
        open={addProjectOpen}
        onClose={() => setAddProjectOpen(false)}
      />

      {showTop && (
        <Button
          size="icon"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-30 rounded-full shadow-lg"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-40 w-full rounded-xl" />
      ))}
    </div>
  );
}

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

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
      <Icon className="mb-3 h-10 w-10 text-muted-foreground" />
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
