import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguages } from "@/hooks/useLanguages";
import { AddLanguageDialog } from "./AddLanguageDialog";
import type { LanguageSelectProps } from "@/types";

export function LanguageSelect({ value, onChange }: LanguageSelectProps) {
  const { languages, status } = useLanguages();
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const selected = languages.find((l) => l._id === value);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {selected ? (
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: selected.color }}
                />
                {selected.name}
              </span>
            ) : status.status === "loading" ? (
              "Loading…"
            ) : (
              "Select language…"
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput placeholder="Search language…" />
            <CommandList>
              <CommandEmpty>No language found.</CommandEmpty>
              <CommandGroup>
                {languages.map((l) => (
                  <CommandItem
                    key={l._id}
                    value={l.name}
                    onSelect={() => {
                      onChange(l._id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === l._id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span
                      className="mr-2 h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: l.color }}
                    />
                    {l.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setAddOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add new language
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <AddLanguageDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}
