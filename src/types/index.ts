// Shared domain + UI types

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error: string | null;
}

export interface CodeSnippet {
  language: string;
  code: string;
}

export interface Question {
  id: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  shortAnswer: string;
  detailedExplanation: string;
  realWorldExample: string;
  bestPractices: string[];
  commonMistakes: string[];
  codeSnippet: CodeSnippet;
  interviewTip: string;
}

export interface Category {
  id: string;
  label: string;
  slug: string;
  icon: string;
  questions: Question[];
}

export interface Language {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  title: string;
  slug: string;
  description: string;
  languageId: string;
  tags: string[];
  difficulty: Difficulty;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
}

// Component props
export interface QuestionCardProps {
  question: Question;
  categorySlug: string;
  onOpen: (question: Question) => void;
}

export interface QuestionModalProps {
  question: Question | null;
  questions: Question[];
  onClose: () => void;
  onNavigate: (q: Question) => void;
}

export interface AddProjectDialogProps {
  open: boolean;
  onClose: () => void;
}

export interface AddLanguageDialogProps {
  open: boolean;
  onClose: () => void;
}

export interface LanguageSelectProps {
  value: string;
  onChange: (id: string) => void;
}

// Raw JSON shape (mock)
export interface RawCategoryFile {
  category: string;
  label: string;
  icon: string;
  questions: Question[];
}
