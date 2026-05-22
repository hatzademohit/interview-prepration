import { projectRepository, type ProjectInput } from "@/repositories/project.repository";
import type { AsyncState, Project } from "@/types";

async function shape<T>(p: Promise<T>): Promise<AsyncState<T>> {
  try {
    return { status: "success", data: await p };
  } catch (e) {
    return { status: "error", message: e instanceof Error ? e.message : "Unknown" };
  }
}

export const projectService = {
  list: () => shape(projectRepository.getAll()),
  create: (input: ProjectInput) => shape(projectRepository.create(input)),
  update: (id: string, patch: Partial<ProjectInput>) =>
    shape(projectRepository.update(id, patch)),
  remove: (id: string) => shape(projectRepository.delete(id)),
};

export type { Project };
