import React, { useEffect, useMemo, useState } from "react";
import { Header } from "./components/layout/Header";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { useUIStore } from "./store/uiStore";
import { useSearch } from "./hooks/useSearch";
import { interviewService } from "./services/interview.service";
import { AsyncState, Category, Question } from "./types";
import { CategoryTabs } from "./components/features/CategoryTabs";
import SkeletonGrid from "./components/SkeletonGrid";
import { EmptyState } from "./components/EmptyState";
import { ArrowUp, BookmarkX, SearchX } from "lucide-react";
import { QuestionCard } from "./components/features/QuestionCard";
import SearchResults from "./components/SearchResults";
import { QuestionModal } from "./components/features/QuestionModal";
import { AddProjectDialog } from "./components/features/AddProjectDialog";
import { Button } from "./components/ui/button";

function App() {
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

export default App;