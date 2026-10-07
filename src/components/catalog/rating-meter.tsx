/** Medidor relativo 1-5 (no es una medida fisica). */
export function RatingMeter({ label, value }: { label: string; value: number | null }) {
  if (value === null) return null;
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-steel-300">{label}</span>
        <span className="font-mono text-xs text-steel-500">{value}/5</span>
      </div>
      <div className="mt-2 flex gap-1.5" role="img" aria-label={`${label}: ${value} de 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={
              i <= value
                ? "h-1.5 flex-1 rounded-full bg-gradient-to-r from-steel-300/80 to-signal/70 shadow-[0_0_10px_-2px_rgba(111,183,201,0.45)]"
                : "h-1.5 flex-1 rounded-full bg-ink-700"
            }
          />
        ))}
      </div>
    </div>
  );
}
