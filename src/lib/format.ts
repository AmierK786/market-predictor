export const FEATURE_LABELS: Record<string, string> = {
  ret_1: "1-day return",
  ret_5: "5-day return",
  ret_21: "21-day return",
  vol_21: "21-day volatility",
  volume_z: "Volume z-score",
};

export function formatDate(iso: string) {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatMove(logReturn: number) {
  const percent = (Math.exp(logReturn) - 1) * 100;
  const sign = percent > 0 ? "+" : "";
  return `${sign}${percent.toFixed(2)}%`;
}

export function formatCorrelation(value: number | null) {
  if (value == null) return "—";
  return value.toFixed(2);
}

export function formatHit(rate: number | null) {
  if (rate == null) return "—";
  return `${(rate * 100).toFixed(1)}%`;
}

export function formatHitGap(honest: number | null, leaked: number | null) {
  if (honest == null || leaked == null) return "—";
  const points = (leaked - honest) * 100;
  const sign = points > 0 ? "+" : "";
  return `${sign}${points.toFixed(1)} pt`;
}

export function formatMae(mae: number | null) {
  if (mae == null) return "—";
  return `${(mae * 100).toFixed(2)} pt`;
}

export function formatMultiple(multiple: number) {
  const percent = (multiple - 1) * 100;
  const sign = percent > 0 ? "+" : "";
  return `${sign}${percent.toFixed(1)}%`;
}

export function formatPrice(price: number) {
  return price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export function formatWeight(weight: number) {
  const sign = weight > 0 ? "+" : "";
  return `${sign}${weight.toFixed(3)}`;
}
