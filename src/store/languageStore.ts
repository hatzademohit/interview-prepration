import { create } from "zustand";
import { languageService } from "@/services/language.service";
import type { LanguageInput } from "@/repositories/language.repository";
import type { AsyncState, Language } from "@/types";

interface LanguageStoreState {
  languages: Language[];
  status: AsyncState<Language[]>;
  fetchLanguages: () => Promise<void>;
  addLanguage: (input: LanguageInput) => Promise<Language>;
  updateLanguage: (id: string, patch: Partial<LanguageInput>) => Promise<void>;
}

export const useLanguageStore = create<LanguageStoreState>((set, get) => ({
  languages: [],
  status: { status: "idle" },
  async fetchLanguages() {
    set({ status: { status: "loading" } });
    const res = await languageService.list();
    if (res.status === "success") {
      set({ languages: res.data, status: res });
    } else {
      set({ status: res });
    }
  },
  async addLanguage(input) {
    const prev = get().languages;
    const optimistic: Language = {
      ...input,
      _id: `tmp-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set({ languages: [...prev, optimistic] });
    const res = await languageService.create(input);
    if (res.status === "success") {
      set({
        languages: [...prev, res.data].sort((a, b) => a.displayOrder - b.displayOrder),
      });
      return res.data;
    }
    set({ languages: prev });
    throw new Error(res.status === "error" ? res.message : "Failed");
  },
  async updateLanguage(id, patch) {
    const prev = get().languages;
    set({
      languages: prev.map((l) => (l._id === id ? { ...l, ...patch } : l)),
    });
    const res = await languageService.update(id, patch);
    if (res.status !== "success") {
      set({ languages: prev });
      throw new Error(res.message);
    }
  },
}));
