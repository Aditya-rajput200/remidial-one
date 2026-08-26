type Step = {
  title: string;
  description: string;
};

export function StepsList({ steps }: { steps: Step[] }) {
  return (
    <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
      {steps.map((step, index) => (
        <li key={step.title} className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-6">
          <span className="text-sm font-bold text-lime-ink">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="text-base font-semibold text-ink">{step.title}</h3>
          <p className="text-sm leading-relaxed text-muted">{step.description}</p>
        </li>
      ))}
    </ol>
  );
}
