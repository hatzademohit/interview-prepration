import type { Question, RawCategoryFile } from "@/types";

export function normalizeQuestion(raw: unknown): Question {
  const r = raw as Question;
  return {
    id: String(r.id),
    title: r.title ?? "",
    difficulty: (r.difficulty ?? "beginner") as Question["difficulty"],
    tags: Array.isArray(r.tags) ? r.tags : [],
    shortAnswer: r.shortAnswer ?? "",
    detailedExplanation: r.detailedExplanation ?? "",
    realWorldExample: r.realWorldExample ?? "",
    bestPractices: r.bestPractices ?? [],
    commonMistakes: r.commonMistakes ?? [],
    codeSnippet: r.codeSnippet ?? { language: "text", code: "" },
    interviewTip: r.interviewTip ?? "",
  };
}

export function normalizeCategory(raw: RawCategoryFile) {
  return {
    id: raw.category,
    slug: raw.category,
    label: raw.label,
    icon: raw.icon,
    questions: raw.questions.map(normalizeQuestion),
  };
}
