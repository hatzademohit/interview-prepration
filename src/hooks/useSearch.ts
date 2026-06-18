import { useEffect, useState } from "react";
import { interviewService } from "@/services/interview.service";
import type { AsyncState, Category, Question } from "@/types";

export function useSearch(query: string, debounceMs = 300) {
  const [state, setState] = useState<
    AsyncState<Array<{ category: Category; question: Question }>>
  >({ status: "idle" });

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setState({ status: "idle" });
      return;
    }
    setState({ status: "loading" });
    let cancelled = false;
    const t = setTimeout(async () => {
      const res = await interviewService.search(q);
      if (!cancelled) setState(res);
    }, debounceMs);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, debounceMs]);

  return state;
}
