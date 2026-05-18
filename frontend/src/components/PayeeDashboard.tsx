// PayeeDashboard is no longer used directly, DashboardPanels.tsx handles per-view rendering.
// Kept as a fallback export for any stray imports.
import { ClaimPanel } from "./DashboardPanels";

export function PayeeDashboard() {
  return <ClaimPanel />;
}
