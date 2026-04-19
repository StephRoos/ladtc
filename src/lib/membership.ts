/**
 * Season-based membership helpers.
 * A season runs from September 1 to August 31 of the following year.
 * Format: "YYYY-YYYY" (e.g. "2025-2026")
 */

/**
 * Returns the current season label based on today's date.
 * September onwards = new season.
 */
export function getCurrentSeason(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed: August = 7, September = 8
  if (month >= 8) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
}

/**
 * Checks whether a given season string matches the current season.
 */
export function isSeasonCurrent(season: string | null): boolean {
  if (!season) return false;
  return season === getCurrentSeason();
}

/**
 * Returns a human-readable label for a season.
 * e.g. "2025-2026" → "Saison 2025-2026"
 */
export function formatSeason(season: string | null): string {
  if (!season) return "Aucune saison";
  return `Saison ${season}`;
}
