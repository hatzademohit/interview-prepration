import type { Difficulty } from "@/types";
export const formatDifficulty = (d: Difficulty) =>
  d.charAt(0).toUpperCase() + d.slice(1);
