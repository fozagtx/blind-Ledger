// AdminDashboard is no longer used directly, DashboardPanels.tsx handles per-view rendering
// driven by the Sidebar. Kept as a fallback export for any stray imports.
import { OverviewPanel, FundsPanel, SchedulePanel, TeamPanel, AddMemberPanel, AutomationPanel } from "./DashboardPanels";

export function AdminDashboard() {
  return (
    <div className="space-y-10">
      <OverviewPanel />
      <FundsPanel />
      <SchedulePanel />
      <TeamPanel />
      <AddMemberPanel />
      <AutomationPanel />
    </div>
  );
}
