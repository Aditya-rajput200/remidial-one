import Image from "next/image";

type Step = {
  title: string;
  description: string;
  /** Resolve with publicAsset() — the numbered badge renders without it, icon is simply omitted. */
  icon?: string;
};

export function StepsList({ steps }: { steps: Step[] }) {
  return (
    <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-white p-6"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-soft text-sm font-bold text-lime-ink">
            {String(index + 1).padStart(2, "0")}
          </span>
          {step.icon ? (
            <div className="relative h-28 w-28 shrink-0 sm:h-32 sm:w-32">
              <Image src={step.icon} alt="" fill className="object-contain" aria-hidden />
            </div>
          ) : null}
          <h3 className="text-base font-semibold text-ink">{step.title}</h3>
          <p className="text-sm leading-relaxed text-muted">{step.description}</p>
        </li>
      ))}
    </ol>
  );
}
