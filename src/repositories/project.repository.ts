// Project repository — in-memory mock, API-shaped.
import { env } from "@/lib/env";
import { mockDelay, apiClient } from "@/lib/api-client";
import { toSlug } from "@/utils/slugify";
import type { Project } from "@/types";

let store: Project[] = [];

export type ProjectInput = Omit<Project, "_id" | "createdAt" | "updatedAt">;

export const projectRepository = {
  async getAll(): Promise<Project[]> {
    if (env.USE_MOCK_DATA) {
      await mockDelay();
      return [...store].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    }
    return apiClient.get<Project[]>("/projects");
  },

  async getById(id: string): Promise<Project | null> {
    if (env.USE_MOCK_DATA) {
      await mockDelay();
      return store.find((p) => p._id === id) ?? null;
    }
    return apiClient.get<Project>(`/projects/${id}`);
  },

  async create(input: ProjectInput): Promise<Project> {
    if (env.USE_MOCK_DATA) {
      await mockDelay();
      const slug = input.slug || toSlug(input.title);
      if (store.some((p) => p.slug === slug)) {
        throw new Error(`Project slug "${slug}" already exists`);
      }
      const now = new Date().toISOString();
      const project: Project = {
        ...input,
        slug,
        _id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      store = [project, ...store];
      return project;
    }
    return apiClient.post<Project>("/projects", input);
  },

  async update(id: string, patch: Partial<ProjectInput>): Promise<Project> {
    if (env.USE_MOCK_DATA) {
      await mockDelay();
      const idx = store.findIndex((p) => p._id === id);
      if (idx === -1) throw new Error("Project not found");
      const merged: Project = {
        ...store[idx],
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      store = store.map((p) => (p._id === id ? merged : p));
      return merged;
    }
    return apiClient.put<Project>(`/projects/${id}`, patch);
  },

  async delete(id: string): Promise<void> {
    if (env.USE_MOCK_DATA) {
      await mockDelay();
      store = store.filter((p) => p._id !== id);
      return;
    }
    await apiClient.delete<void>(`/projects/${id}`);
  },
};
