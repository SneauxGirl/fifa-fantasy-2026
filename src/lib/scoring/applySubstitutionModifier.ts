// ==============================
// Substitution Modifier
// Rules ref: docs/rules/rules.md §2
// ==============================
// SUBSTITUTE = added at Round of 16 (final permitted addition round).
// SUBSTITUTE players and Champion Teams score at 50% for the remainder of the tournament.
// Group Stage / Round of 32 additions score at 100% (no modifier).
// ==============================

/**
 * Applies the SUBSTITUTE scoring modifier to a raw point total.
 * Uses Math.round to avoid fractional points (0.5 rounds up).
 *
 * Called by calculatePlayerScore and calculateChampionTeamScore —
 * not called directly from Redux slices.
 */
export function applySubstitutionModifier(
  rawPoints:    number,
  isSubstitute: boolean
): number {
  return isSubstitute ? Math.round(rawPoints * 0.5) : rawPoints;
}
