/** Aviso visible mientras el dato sea de ejemplo (dataSource = EXAMPLE). */
export function ExampleNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-xl border border-amber/30 bg-amber/[0.06] px-4 py-3 text-sm text-steel-300"
    >
      <span className="chip chip-warn shrink-0">Datos de ejemplo</span>
      <p>
        {compact
          ? "Informacion de referencia, pendiente de validar por Pibasa."
          : "Las propiedades, equivalencias y medidas mostradas son valores tipicos de referencia y estan pendientes de validacion por Pibasa. No constituyen una oferta ni una ficha del fabricante; confirma disponibilidad y especificaciones al cotizar."}
      </p>
    </div>
  );
}
