import { theoreticalWeightKg, type Dimensions, type ShapeType } from "@/domain/catalog/shapes";

/**
 * SIMULACION para la demo comercial. El cotizador real (Atomo 4) aun no existe.
 * El peso usa el dominio real del catalogo (densidad x volumen); los PRECIOS son ilustrativos y NO son de Pibasa.
 * Todo el dinero se maneja en centavos enteros para no arrastrar errores de punto flotante.
 */
export type IllustrativePrices = {
  pricePerKgCents: number;
  cutFeeCents: number;
  freightCents: number;
  ivaRate: number;
};

export const ILLUSTRATIVE_PRICES: IllustrativePrices = {
  pricePerKgCents: 16_000,
  cutFeeCents: 4_500,
  freightCents: 38_000,
  ivaRate: 0.16
};

export type SimQuoteInput = {
  shape: ShapeType;
  dims: Dimensions;
  densityGcm3: number;
  pieces: number;
  pieceLengthMm: number;
  cut: boolean;
};

export type SimQuote = {
  totalLengthM: number;
  weightPerMeterKg: number;
  totalWeightKg: number;
  materialCents: number;
  cutsCents: number;
  freightCents: number;
  subtotalCents: number;
  ivaCents: number;
  totalCents: number;
};

export function simulateQuote(input: SimQuoteInput, prices: IllustrativePrices = ILLUSTRATIVE_PRICES): SimQuote {
  if (!Number.isInteger(input.pieces) || input.pieces <= 0) throw new Error("pieces debe ser un entero > 0");
  const totalLengthMm = input.pieces * input.pieceLengthMm;
  const totalWeightKg = theoreticalWeightKg(input.shape, input.dims, totalLengthMm, input.densityGcm3);
  const weightPerMeterKg = theoreticalWeightKg(input.shape, input.dims, 1000, input.densityGcm3);
  const materialCents = Math.round(totalWeightKg * prices.pricePerKgCents);
  const cutsCents = input.cut ? input.pieces * prices.cutFeeCents : 0;
  const subtotalCents = materialCents + cutsCents + prices.freightCents;
  const ivaCents = Math.round(subtotalCents * prices.ivaRate);
  return {
    totalLengthM: totalLengthMm / 1000,
    weightPerMeterKg,
    totalWeightKg,
    materialCents,
    cutsCents,
    freightCents: prices.freightCents,
    subtotalCents,
    ivaCents,
    totalCents: subtotalCents + ivaCents
  };
}

const mxn = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
export const formatCents = (cents: number) => mxn.format(cents / 100);

/** Folio de demostracion: el formato real del folio se define en el Atomo 4. */
export const DEMO_FOLIO = "PIB-DEMO-0001";
