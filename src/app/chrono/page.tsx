import type { Metadata } from "next";
import { BackyardChrono } from "../(admin)/admin/backyard/BackyardChrono";

export const metadata: Metadata = {
  title: "Chrono Backyard — LADTC",
  robots: { index: false, follow: false },
};

/**
 * Standalone Backyard chronometer — no header, no nav, no footer.
 * Designed for big-screen display: open in fullscreen and run.
 * Publicly accessible (no auth) so the event-day operator does not
 * need to log in on the venue computer.
 */
export default function ChronoPage(): React.ReactNode {
  return (
    <div className="min-h-screen w-full bg-black">
      <BackyardChrono />
    </div>
  );
}
