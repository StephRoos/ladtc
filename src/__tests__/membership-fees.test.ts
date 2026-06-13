import { describe, it, expect } from "vitest";
import {
  MEMBERSHIP_DUES_NET,
  onlineAmount,
  onlineFee,
} from "@/lib/membership-fees";

describe("membership fees", () => {
  it("sets the net season dues to 55 €", () => {
    expect(MEMBERSHIP_DUES_NET).toBe(55);
  });

  it("grosses up 55 € net to 56.10 € online (committee decision 2026-06-12)", () => {
    expect(onlineAmount(55)).toBe(56.1);
  });

  it("adds a 1.10 € online processing fee on 55 € dues", () => {
    expect(onlineFee(55)).toBe(1.1);
  });

  it("always nets at least the dues after the standard card fee (1.5% + 0.25 €)", () => {
    for (const net of [40, 50, 55, 60, 100]) {
      const charged = onlineAmount(net);
      const clubReceives = charged - (charged * 0.015 + 0.25);
      expect(clubReceives).toBeGreaterThanOrEqual(net);
    }
  });

  it("rounds the online amount up to the nearest 0.10 €", () => {
    const amount = onlineAmount(55);
    expect(Math.round(amount * 10)).toBe(amount * 10);
  });
});
