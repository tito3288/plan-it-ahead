type DailyPlanProps = {
  dayLabel: string;
  steps: string[];
};

export function DailyPlan({ dayLabel, steps }: DailyPlanProps) {
  return (
    <section className="rounded-[18px] bg-green p-5 text-cream shadow-soft sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-amber-soft">
        Best plan
      </p>
      <h2 className="mt-1 font-heading text-3xl font-semibold">
        Your best plan for {dayLabel}
      </h2>

      <ol className="mt-5 space-y-4">
        {steps.map((step, index) => (
          <li key={`${index}-${step}`} className="flex gap-3">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber text-sm font-bold text-white">
              {index + 1}
            </span>
            <span className="pt-1 text-base leading-7">{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
