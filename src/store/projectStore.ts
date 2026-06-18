import { create } from "zustand";
import { projectService } from "@/services/project.service";
import type { ProjectInput } from "@/repositories/project.repository";
import type { AsyncState, Project } from "@/types";

interface ProjectStoreState {
  projects: Project[];
  status: AsyncState<Project[]>;
  fetchProjects: () => Promise<void>;
  addProject: (input: ProjectInput) => Promise<Project>;
  updateProject: (id: string, patch: Partial<ProjectInput>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

const fail = (res: AsyncState<unknown>) =>
  res.status === "error" ? res.message : "Operation failed";

export const useProjectStore = create<ProjectStoreState>((set, get) => ({
  projects: [],
  status: { status: "idle" },
  async fetchProjects() {
    set({ status: { status: "loading" } });
    const res = await projectService.list();
    if (res.status === "success") set({ projects: res.data, status: res });
    else set({ status: res });
  },
  async addProject(input) {
    const prev = get().projects;
    const optimistic: Project = {
      ...input,
      _id: `tmp-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set({ projects: [optimistic, ...prev] });
    const res = await projectService.create(input);
    if (res.status === "success") {
      set({ projects: [res.data, ...prev] });
      return res.data;
    }
    set({ projects: prev });
    throw new Error(fail(res));
  },
  async updateProject(id, patch) {
    const prev = get().projects;
    set({ projects: prev.map((p) => (p._id === id ? { ...p, ...patch } : p)) });
    const res = await projectService.update(id, patch);
    if (res.status !== "success") {
      set({ projects: prev });
      throw new Error(fail(res));
    }
  },
  async deleteProject(id) {
    const prev = get().projects;
    set({ projects: prev.filter((p) => p._id !== id) });
    const res = await projectService.remove(id);
    if (res.status !== "success") {
      set({ projects: prev });
      throw new Error(fail(res));
    }
  },
}));
