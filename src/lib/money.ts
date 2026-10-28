export function formatEur(cents: number): string {
  return new Intl.NumberFormat("en-CY", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function depositForService(priceCents: number, depositCents?: number | null): number {
  if (depositCents != null && depositCents > 0) return Math.min(depositCents, priceCents);
  return Math.round(priceCents * 0.3);
}

export function balanceDue(priceCents: number, depositPaidCents: number): number {
  return Math.max(0, priceCents - depositPaidCents);
}
