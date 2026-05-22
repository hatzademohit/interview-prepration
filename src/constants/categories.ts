import type { Category } from "@/types";

export const CATEGORY_META: Array<Pick<Category, "id" | "label" | "slug" | "icon">> = [
  { id: "html", label: "HTML", slug: "html", icon: "Code2" },
  { id: "css", label: "CSS", slug: "css", icon: "Palette" },
  { id: "js", label: "JavaScript", slug: "js", icon: "Braces" },
  { id: "typescript", label: "TypeScript", slug: "typescript", icon: "FileCode" },
  { id: "react", label: "React.js", slug: "react", icon: "Atom" },
];

export const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  intermediate: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  advanced: "bg-rose-500/15 text-rose-600 border-rose-500/30",
};
