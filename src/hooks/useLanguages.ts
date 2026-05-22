import { useEffect } from "react";
import { useLanguageStore } from "@/store/languageStore";

export function useLanguages() {
  const languages = useLanguageStore((s) => s.languages);
  const status = useLanguageStore((s) => s.status);
  const fetchLanguages = useLanguageStore((s) => s.fetchLanguages);
  const addLanguage = useLanguageStore((s) => s.addLanguage);

  useEffect(() => {
    if (status.status === "idle") fetchLanguages();
  }, [status.status, fetchLanguages]);

  return { languages, status, refetch: fetchLanguages, addLanguage };
}
