import { Button } from "@/components/ui/Button";

type GreetingWidgetProps = {
  displayName: string;
  isInstructor: boolean;
  activeMode?: string | null;
};

export function GreetingWidget({
  displayName,
  isInstructor,
  activeMode,
}: GreetingWidgetProps) {
  return (
    <div className="flex flex-col justify-between rounded-3xl border-2 border-ink bg-card p-6 shadow-cartoon md:p-8">
      <div>
        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-ink-muted">
          You&apos;re in
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-ink md:text-4xl">
          Hey, {displayName}! 👋
        </h1>
      </div>
      <div className="mt-5 space-y-3">
        <p className="font-mono text-sm text-ink-muted">
          Account:{" "}
          <span className="rounded-full border-2 border-ink bg-sand px-2.5 py-0.5 font-semibold text-ink">
            {isInstructor ? "Instructor + Student" : "Student"}
          </span>
        </p>
        {isInstructor && (
          <p className="font-mono text-xs text-ink-muted">
            Active mode: {activeMode ?? "student"} (toggle coming soon)
          </p>
        )}
        <Button href="/learn" className="mt-2 w-full sm:w-auto">
          Browse all topics
        </Button>
      </div>
    </div>
  );
}
