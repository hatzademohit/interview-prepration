import { useEffect, useState, useCallback } from "react";
import { Copy, ChevronLeft, ChevronRight, Check, Lightbulb } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DIFFICULTY_COLOR } from "@/constants/categories";
import { formatDifficulty } from "@/utils/formatDifficulty";
import { copyToClipboard } from "@/utils/copyToClipboard";
import { useProgressStore } from "@/store/progressStore";
import { codeToHtml } from "shiki";
import type { QuestionModalProps } from "@/types";

function flattenAnswer(q: NonNullable<QuestionModalProps["question"]>) {
  return [
    `# ${q.title}`,
    ``,
    `## Short answer`,
    q.shortAnswer,
    ``,
    `## Detailed explanation`,
    q.detailedExplanation,
    ``,
    `## Real-world example`,
    q.realWorldExample,
    ``,
    `## Best practices`,
    ...q.bestPractices.map((b) => `- ${b}`),
    ``,
    `## Common mistakes`,
    ...q.commonMistakes.map((b) => `- ${b}`),
    ``,
    `## Code`,
    "```" + q.codeSnippet.language,
    q.codeSnippet.code,
    "```",
    ``,
    `## Interview tip`,
    q.interviewTip,
  ].join("\n");
}

export function QuestionModal({
  question,
  questions,
  onClose,
  onNavigate,
}: QuestionModalProps) {
  const markViewed = useProgressStore((s) => s.markViewed);
  const [highlighted, setHighlighted] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!question) return;
    markViewed(question.id);
    setCopied(false);
    let cancelled = false;
    codeToHtml(question.codeSnippet.code, {
      lang: question.codeSnippet.language || "text",
      theme: "github-dark",
    })
      .then((html) => {
        if (!cancelled) setHighlighted(html);
      })
      .catch(() => {
        if (!cancelled)
          setHighlighted(
            `<pre><code>${question.codeSnippet.code.replace(/</g, "&lt;")}</code></pre>`,
          );
      });
    return () => {
      cancelled = true;
    };
  }, [question, markViewed]);

  const navigate = useCallback(
    (dir: 1 | -1) => {
      if (!question) return;
      const idx = questions.findIndex((q) => q.id === question.id);
      const next = questions[(idx + dir + questions.length) % questions.length];
      if (next) onNavigate(next);
    },
    [question, questions, onNavigate],
  );

  useEffect(() => {
    if (!question) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft") navigate(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [question, navigate]);

  const handleCopy = async () => {
    if (!question) return;
    const ok = await copyToClipboard(flattenAnswer(question));
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <Dialog open={!!question} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        {question && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    DIFFICULTY_COLOR[question.difficulty],
                  )}
                >
                  {formatDifficulty(question.difficulty)}
                </span>
                <div className="ml-auto flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    aria-label="Previous question"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(1)}
                    aria-label="Next question"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <DialogTitle className="text-left text-xl leading-snug">
                {question.title}
              </DialogTitle>
              <DialogDescription className="text-left text-base leading-relaxed text-foreground">
                {question.shortAnswer}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {question.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                >
                  #{t}
                </span>
              ))}
            </div>

            <Accordion type="multiple" className="mt-2">
              <AccordionItem value="detail">
                <AccordionTrigger>See more</AccordionTrigger>
                <AccordionContent className="space-y-6 pt-2">
                  <section>
                    <h4 className="mb-1 text-sm font-semibold">
                      Detailed explanation
                    </h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {question.detailedExplanation}
                    </p>
                  </section>
                  <section>
                    <h4 className="mb-1 text-sm font-semibold">Real-world example</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {question.realWorldExample}
                    </p>
                  </section>
                  <section>
                    <h4 className="mb-2 text-sm font-semibold">Best practices</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {question.bestPractices.map((b) => (
                        <li key={b} className="flex gap-2">
                          <span className="text-emerald-500">✓</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h4 className="mb-2 text-sm font-semibold">Common mistakes</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {question.commonMistakes.map((b) => (
                        <li key={b} className="flex gap-2">
                          <span className="text-rose-500">✕</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h4 className="mb-2 text-sm font-semibold">Code</h4>
                    <div
                      className="overflow-hidden rounded-lg border border-border text-[13px] [&_pre]:overflow-x-auto [&_pre]:p-3"
                      dangerouslySetInnerHTML={{ __html: highlighted }}
                    />
                  </section>
                  <section className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="text-sm leading-relaxed">
                      <span className="font-semibold">Interview tip: </span>
                      {question.interviewTip}
                    </p>
                  </section>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="sticky bottom-0 -mx-6 -mb-6 flex items-center justify-end gap-2 border-t border-border bg-background/95 px-6 py-3 backdrop-blur">
              <Button variant="outline" onClick={handleCopy} className="gap-2">
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy answer"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
