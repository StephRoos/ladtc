/**
 * Membership dues and online payment fee helpers.
 *
 * Members pay the net dues (e.g. 55 €) either in cash to the treasurer, or
 * online via Stripe. Online payments incur Stripe processing fees, which are
 * added on top so the club still nets the full dues. This is presented to the
 * member transparently as a "processing fee" line — not as a card surcharge
 * (which is prohibited in the EU under PSD2).
 *
 * Gross-up uses the standard Stripe Belgium consumer EEA card rate
 * (1.5% + 0.25 €). Bancontact (0.35 € flat) is cheaper, and the committee
 * confirmed premium cards (1.9%) won't occur, so the standard card rate is
 * the worst case that drives the amount.
 */

/** Net membership dues for the current season, in euros (cash price). */
export const MEMBERSHIP_DUES_NET = 55;

// Standard Stripe Belgium rate for EEA consumer cards.
const STRIPE_PERCENT = 0.015;
const STRIPE_FIXED = 0.25;

/**
 * Returns the amount to charge online so the club nets `net` euros after
 * Stripe fees, rounded up to the nearest 0.10 € (e.g. 55 → 56.10).
 */
export function onlineAmount(net: number): number {
  const gross = (net + STRIPE_FIXED) / (1 - STRIPE_PERCENT);
  return Math.ceil(gross * 10) / 10;
}

/**
 * Returns the online processing fee added on top of the net dues, in euros
 * (e.g. 55 → 1.10).
 */
export function onlineFee(net: number): number {
  return Math.round((onlineAmount(net) - net) * 100) / 100;
}
