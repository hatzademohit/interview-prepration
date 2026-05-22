import { languageRepository, type LanguageInput } from "@/repositories/language.repository";
import type { AsyncState, Language } from "@/types";

async function shape<T>(p: Promise<T>): Promise<AsyncState<T>> {
  try {
    return { status: "success", data: await p };
  } catch (e) {
    return { status: "error", message: e instanceof Error ? e.message : "Unknown" };
  }
}

export const languageService = {
  list: () => shape(languageRepository.getAll()),
  create: (input: LanguageInput) => shape(languageRepository.create(input)),
  update: (id: string, patch: Partial<LanguageInput>) =>
    shape(languageRepository.update(id, patch)),
  remove: (id: string) => shape(languageRepository.delete(id)),
  getById: (id: string) => shape(languageRepository.getById(id)),
};

export type { Language };
