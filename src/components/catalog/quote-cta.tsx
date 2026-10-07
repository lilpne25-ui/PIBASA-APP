/**
 * CTA PLACEHOLDER hasta el cotizador real (Atomo 4+). Si NEXT_PUBLIC_WHATSAPP_NUMBER esta definido
 * (solo digitos con lada pais, p. ej. 5214421234567) abre WhatsApp con un mensaje prellenado; si no,
 * muestra un aviso. No se envia nada desde el servidor ni se guarda ningun dato.
 */
export function QuoteCta({ gradeCode, className = "" }: { gradeCode?: string; className?: string }) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const valid = /^\d{10,15}$/.test(number);

  if (!valid) {
    return (
      <div className={className}>
        <span aria-disabled="true" className="btn btn-primary cursor-not-allowed opacity-70">
          Solicitar cotizacion
        </span>
        <p className="mt-2 text-xs text-steel-500">Canal de contacto por confirmar: el cotizador estara disponible pronto.</p>
      </div>
    );
  }

  const text = gradeCode
    ? `Hola, quiero cotizar acero ${gradeCode}. Medidas y cantidad: `
    : "Hola, quiero cotizar acero. Grado, medidas y cantidad: ";
  return (
    <div className={className}>
      <a
        href={`https://wa.me/${number}?text=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary"
      >
        Solicitar cotizacion
      </a>
    </div>
  );
}
