import { Button } from "@/components/ui/Button";

type Props = {
  displayName: string;
  isInstructor: boolean;
};

export function GreetingWidget({ displayName, isInstructor }: Props) {
  return (
    <div className="flex flex-col justify-between rounded-3xl border-2 border-ink bg-card p-6 shadow-cartoon md:p-8">
      <div>
        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-ink-muted">
          {isInstructor ? "Instructor dashboard" : "Student dashboard"}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-ink md:text-4xl">
          Hey, {displayName}! 👋
        </h1>
      </div>
      <div className="mt-5">
        <Button href="/learn" variant="ghost" className="text-sm">
          Browse topics →
        </Button>
      </div>
    </div>
  );
}
