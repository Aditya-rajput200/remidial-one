import { iconMap } from "@/lib/icon-map";
import type { Skill } from "@/lib/content/skills";
import { Card } from "@/components/ui/Card";

export function SkillCard({ skill }: { skill: Skill }) {
  const Icon = iconMap[skill.icon];

  return (
    <Card interactive className="flex h-full flex-col gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-lime">
        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <h3 className="text-lg font-semibold text-ink">{skill.name}</h3>
        <p className="text-sm leading-relaxed text-muted">{skill.description}</p>
      </div>
    </Card>
  );
}
