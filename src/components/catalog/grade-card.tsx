import Link from "next/link";
import type { PublicGradeCard } from "@/application/catalog/public-catalog";

export function GradeCard({ grade, index }: { grade: PublicGradeCard; index: number }) {
  return (
    <li className="rise-in" style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}>
      <Link href={`/catalogo/${grade.slug}`} className="panel panel-hover block h-full p-6">
        <div className="flex items-start justify-between gap-4">
          <span className="font-mono text-4xl font-medium tracking-tight text-steel-100">{grade.code}</span>
          {grade.isExample && <span className="chip chip-warn">Ejemplo</span>}
        </div>
        <p className="mt-4 text-sm text-steel-100">{grade.name}</p>
        <p className="eyebrow mt-2 !text-steel-500">{grade.family}</p>
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-steel-300">{grade.summary}</p>
        <div className="hairline mt-5 flex flex-wrap gap-1.5 pt-4">
          {grade.shapes.map((s) => (
            <span key={s} className="chip">
              {s}
            </span>
          ))}
        </div>
      </Link>
    </li>
  );
}
