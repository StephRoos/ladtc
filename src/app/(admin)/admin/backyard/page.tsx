import type { Metadata } from "next";
import { BackyardChrono } from "./BackyardChrono";

export const metadata: Metadata = {
  title: "Chrono Backyard — LADTC",
};

/**
 * Admin Backyard Ultra chronometer — designed for big-screen display
 * during a club event. The component is rendered full-bleed; admin nav
 * stays visible but the chrono itself can enter native fullscreen.
 */
export default function AdminBackyardPage(): React.ReactNode {
  return (
    <div className="w-full">
      <BackyardChrono />
    </div>
  );
}
