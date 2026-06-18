import { useEffect } from "react";
import { useProjectStore } from "@/store/projectStore";

export function useProjects() {
  const projects = useProjectStore((s) => s.projects);
  const status = useProjectStore((s) => s.status);
  const fetchProjects = useProjectStore((s) => s.fetchProjects);
  const addProject = useProjectStore((s) => s.addProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);

  useEffect(() => {
    if (status.status === "idle") fetchProjects();
  }, [status.status, fetchProjects]);

  return { projects, status, addProject, deleteProject, refetch: fetchProjects };
}
