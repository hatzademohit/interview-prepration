import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LanguageSelect } from "./LanguageSelect";
import { useProjectStore } from "@/store/projectStore";
import { toSlug } from "@/utils/slugify";
import type { AddProjectDialogProps, Difficulty } from "@/types";

const schema = z.object({
  title: z.string().min(2).max(80),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/, "lowercase, dashes only"),
  description: z.string().min(4).max(300),
  languageId: z.string().min(1, "Pick a language"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  tags: z.string(),
  thumbnail: z.string().url().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export function AddProjectDialog({ open, onClose }: AddProjectDialogProps) {
  const addProject = useProjectStore((s) => s.addProject);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      languageId: "",
      difficulty: "beginner",
      tags: "",
      thumbnail: "",
    },
  });

  const title = form.watch("title");
  useEffect(() => {
    if (!form.formState.dirtyFields.slug && title) {
      form.setValue("slug", toSlug(title));
    }
  }, [title, form]);

  useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  const onSubmit = async (v: FormValues) => {
    try {
      await addProject({
        title: v.title,
        slug: v.slug,
        description: v.description,
        languageId: v.languageId,
        difficulty: v.difficulty as Difficulty,
        tags: v.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        thumbnail: v.thumbnail,
      });
      toast.success(`Project "${v.title}" created`);
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create project");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>
            Track a project you&apos;re building or studying.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label htmlFor="p-title">Project name</Label>
            <Input id="p-title" {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="p-slug">Slug</Label>
            <Input id="p-slug" {...form.register("slug")} />
            {form.formState.errors.slug && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.slug.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="p-desc">Description</Label>
            <Textarea id="p-desc" rows={3} {...form.register("description")} />
            {form.formState.errors.description && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>
          <div>
            <Label>Language</Label>
            <LanguageSelect
              value={form.watch("languageId")}
              onChange={(id) =>
                form.setValue("languageId", id, { shouldValidate: true })
              }
            />
            {form.formState.errors.languageId && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.languageId.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Difficulty</Label>
              <Select
                value={form.watch("difficulty")}
                onValueChange={(v) =>
                  form.setValue("difficulty", v as Difficulty, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="p-tags">Tags (comma)</Label>
              <Input id="p-tags" {...form.register("tags")} />
            </div>
          </div>
          <div>
            <Label htmlFor="p-thumb">Thumbnail URL</Label>
            <Input
              id="p-thumb"
              placeholder="https://…"
              {...form.register("thumbnail")}
            />
            {form.formState.errors.thumbnail && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.thumbnail.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving…" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
