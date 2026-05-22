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
import { useLanguageStore } from "@/store/languageStore";
import { toSlug } from "@/utils/slugify";
import type { AddLanguageDialogProps } from "@/types";

const schema = z.object({
  name: z.string().min(2).max(40),
  slug: z.string().min(2).max(40).regex(/^[a-z0-9-]+$/, "lowercase, dashes only"),
  description: z.string().max(200).optional().default(""),
  icon: z.string().default("Code"),
  color: z.string().regex(/^#([0-9a-f]{6})$/i, "hex color, e.g. #6366f1"),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

type FormValues = z.infer<typeof schema>;

export function AddLanguageDialog({ open, onClose }: AddLanguageDialogProps) {
  const addLanguage = useLanguageStore((s) => s.addLanguage);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      icon: "Code",
      color: "#6366f1",
      displayOrder: 0,
    },
  });

  const nameVal = form.watch("name");
  useEffect(() => {
    if (!form.formState.dirtyFields.slug && nameVal) {
      form.setValue("slug", toSlug(nameVal));
    }
  }, [nameVal, form]);

  useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      await addLanguage({ ...values, description: values.description ?? "" });
      toast.success(`Added ${values.name}`);
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add language");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add language</DialogTitle>
          <DialogDescription>
            Register a new technology or language for projects.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label htmlFor="lang-name">Name</Label>
            <Input id="lang-name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="lang-slug">Slug</Label>
            <Input id="lang-slug" {...form.register("slug")} />
            {form.formState.errors.slug && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.slug.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="lang-desc">Description</Label>
            <Textarea id="lang-desc" rows={2} {...form.register("description")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="lang-color">Color</Label>
              <Input id="lang-color" type="color" {...form.register("color")} />
            </div>
            <div>
              <Label htmlFor="lang-order">Display order</Label>
              <Input
                id="lang-order"
                type="number"
                {...form.register("displayOrder")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Adding…" : "Add language"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
