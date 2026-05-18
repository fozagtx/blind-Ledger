import { ReactNode } from "react";
import { motion } from "framer-motion";
import { PublicView } from "./PublicView";
import { DepositCard } from "./DepositCard";
import { PeriodCard } from "./PeriodCard";
import { PayeeListAdmin } from "./PayeeListAdmin";
import { AddPayeeCard } from "./AddPayeeCard";
import { KeeperCard } from "./KeeperCard";
import { ClaimCard } from "./ClaimCard";

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

function PanelHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-semibold display-tight text-navy">{title}</h1>
      <p className="text-sm text-neutral-800 mt-1 max-w-2xl">{sub}</p>
    </div>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <motion.div {...fadeUp} className="space-y-6">
      {children}
    </motion.div>
  );
}

function SubHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="pt-2">
      <h2 className="text-lg font-semibold display-tight text-navy">{title}</h2>
      {sub ? <p className="text-xs text-neutral-700 mt-0.5">{sub}</p> : null}
    </div>
  );
}

/** Overview now includes Funds — public-facing state + the deposit action. */
export function OverviewPanel() {
  return (
    <Panel>
      <PanelHeader
        title="Overview"
        sub="What the public sees, and the funds you've loaded for payroll."
      />
      <PublicView />
      <SubHead title="Funds" sub="Top up the pool. The balance is public, individual pay isn't." />
      <DepositCard />
    </Panel>
  );
}

/** Schedule now owns the whole "when does payroll run + who can trigger it" story. */
export function SchedulePanel() {
  return (
    <Panel>
      <PanelHeader
        title="Schedule"
        sub="When the next payday runs, and who's trusted to run it on schedule."
      />
      <PeriodCard />
      <SubHead title="Auto-runner" sub="A keeper wallet you trust to roll over the cycle on schedule. It can only do that, nothing else." />
      <KeeperCard />
    </Panel>
  );
}

/** Add member now also lists the current team beneath the form. */
export function AddMemberPanel() {
  return (
    <Panel>
      <PanelHeader
        title="Team"
        sub="Add a recipient (their salary stays sealed) and see who's currently on payroll."
      />
      <AddPayeeCard />
      <SubHead title="Current team" sub="Wallets are visible, sealed pay isn't." />
      <PayeeListAdmin />
    </Panel>
  );
}

// Old hash anchor — falls back to Schedule which now includes the keeper card.
export const AutomationPanel = SchedulePanel;

export function ClaimPanel() {
  return (
    <Panel>
      <PanelHeader
        title="Get paid"
        sub="Open your sealed pay packet for this cycle. One click triggers the unseal + transfer."
      />
      <ClaimCard />
    </Panel>
  );
}

// Old hash links still resolve — fall back to the merged panels.
export const FundsPanel = OverviewPanel;
export const TeamPanel = AddMemberPanel;
