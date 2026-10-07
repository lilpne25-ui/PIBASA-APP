/**
 * Calculadora de escenario para la demo. NO es una promesa de ahorro: todos los supuestos son editables
 * y los valores iniciales son ilustrativos (no provienen de Pibasa). Funcion pura.
 */
export type RoiInputs = {
  quotesPerMonth: number;
  minutesToday: number;
  minutesWithSystem: number;
  hourlyCostMxn: number;
  lostQuotesPerMonth: number;
  recoveryRatePct: number;
  marginPerWonQuoteMxn: number;
  /** Opcional: si es > 0 se calcula el plazo de recuperacion en meses. */
  investmentMxn: number;
};

export type RoiResult = {
  hoursSavedPerMonth: number;
  timeValueMxn: number;
  recoveredQuotesPerMonth: number;
  recoveredMarginMxn: number;
  monthlyTotalMxn: number;
  paybackMonths: number | null;
};

export const ROI_ILLUSTRATIVE_DEFAULTS: RoiInputs = {
  quotesPerMonth: 120,
  minutesToday: 20,
  minutesWithSystem: 8,
  hourlyCostMxn: 120,
  lostQuotesPerMonth: 12,
  recoveryRatePct: 25,
  marginPerWonQuoteMxn: 1500,
  investmentMxn: 0
};

export const ROI_EMPTY: RoiInputs = {
  quotesPerMonth: 0,
  minutesToday: 0,
  minutesWithSystem: 0,
  hourlyCostMxn: 0,
  lostQuotesPerMonth: 0,
  recoveryRatePct: 0,
  marginPerWonQuoteMxn: 0,
  investmentMxn: 0
};

const MAX = 1_000_000_000;
const clean = (n: number) => (Number.isFinite(n) ? Math.min(Math.max(n, 0), MAX) : 0);

export function calculateRoi(raw: RoiInputs): RoiResult {
  const i: RoiInputs = {
    quotesPerMonth: clean(raw.quotesPerMonth),
    minutesToday: clean(raw.minutesToday),
    minutesWithSystem: clean(raw.minutesWithSystem),
    hourlyCostMxn: clean(raw.hourlyCostMxn),
    lostQuotesPerMonth: clean(raw.lostQuotesPerMonth),
    recoveryRatePct: Math.min(clean(raw.recoveryRatePct), 100),
    marginPerWonQuoteMxn: clean(raw.marginPerWonQuoteMxn),
    investmentMxn: clean(raw.investmentMxn)
  };
  const minutesSavedPerQuote = Math.max(0, i.minutesToday - i.minutesWithSystem);
  const hoursSavedPerMonth = (i.quotesPerMonth * minutesSavedPerQuote) / 60;
  const timeValueMxn = hoursSavedPerMonth * i.hourlyCostMxn;
  const recoveredQuotesPerMonth = (i.lostQuotesPerMonth * i.recoveryRatePct) / 100;
  const recoveredMarginMxn = recoveredQuotesPerMonth * i.marginPerWonQuoteMxn;
  const monthlyTotalMxn = timeValueMxn + recoveredMarginMxn;
  const paybackMonths = i.investmentMxn > 0 && monthlyTotalMxn > 0 ? i.investmentMxn / monthlyTotalMxn : null;
  return { hoursSavedPerMonth, timeValueMxn, recoveredQuotesPerMonth, recoveredMarginMxn, monthlyTotalMxn, paybackMonths };
}
