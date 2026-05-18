import { useEffect, useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "./components/Header";
import { Landing } from "./components/Landing";
import { Sidebar, ADMIN_NAV, PAYEE_NAV, type NavItem } from "./components/Sidebar";
import {
  OverviewPanel,
  FundsPanel,
  SchedulePanel,
  TeamPanel,
  AddMemberPanel,
  AutomationPanel,
  ClaimPanel,
} from "./components/DashboardPanels";
import { useIsRole } from "./hooks/usePayrollPool";
import { useFHE } from "./hooks/useFHE";
import { config, isConfigured } from "./lib/config";
import { AlertTriangle } from "lucide-react";

function ConfigBanner() {
  if (isConfigured) return null;
  return (
    <div className="mx-6 mt-4 rounded-2xl border border-amber-300 bg-amber-50 text-amber-900 px-4 py-3 text-sm">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
        <div>
          <div className="font-semibold">No contract configured.</div>
          <div className="text-amber-700 text-xs mt-1">
            Deploy the contract first, it writes the address into the frontend env.
          </div>
        </div>
      </div>
    </div>
  );
}

function NetworkGate({ children }: { children: React.ReactNode }) {
  const { chain, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  if (!isConnected) return <>{children}</>;
  if (chain?.id === config.chainId) return <>{children}</>;
  return (
    <div className="mx-auto max-w-md mt-12 rounded-2xl neumo-card p-6 text-center">
      <div className="text-red-500 font-semibold mb-2">Wrong network</div>
      <div className="text-sm text-neutral-800 mb-4">
        Blind Ledger runs on Arbitrum (testnet). Switch your wallet to continue.
      </div>
      <button
        onClick={() => switchChain({ chainId: config.chainId })}
        className="btn-cta text-sm font-semibold px-5 h-11 rounded-xl t-vault"
      >
        Switch network
      </button>
    </div>
  );
}

// Pick the right panel for an id.
function renderPanel(id: string) {
  switch (id) {
    case "overview":   return <OverviewPanel />;
    case "funds":      return <FundsPanel />;
    case "schedule":   return <SchedulePanel />;
    case "team":       return <TeamPanel />;
    case "add-member": return <AddMemberPanel />;
    case "automation": return <AutomationPanel />;
    case "claim":      return <ClaimPanel />;
    default:           return <OverviewPanel />;
  }
}

function Dashboard({ items, role }: { items: NavItem[]; role: "Admin" | "Recipient" }) {
  // Hash routing, survives reload, deep-linkable.
  const initial = items.find((i) => i.id === window.location.hash.slice(1))?.id ?? items[0].id;
  const [active, setActive] = useState<string>(initial);

  useEffect(() => {
    const onHash = () => {
      const fromHash = items.find((i) => i.id === window.location.hash.slice(1))?.id;
      if (fromHash && fromHash !== active) setActive(fromHash);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [items, active]);

  function navigate(id: string) {
    setActive(id);
    window.history.replaceState(null, "", `#${id}`);
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar items={items} role={role} active={active} onNavigate={navigate} />
      <main className="flex-1 min-w-0 px-6 md:px-10 py-8">
        <div className="max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              {renderPanel(active)}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function AppBody() {
  const { address, isOwner, isPayee } = useIsRole();
  useFHE();

  if (isOwner) {
    // If owner is also a payee, append "Get paid" to admin nav
    const nav = isPayee
      ? [...ADMIN_NAV, { id: "claim", label: "Get paid", icon: PAYEE_NAV[1].icon }]
      : ADMIN_NAV;
    return <Dashboard items={nav} role="Admin" />;
  }
  if (isPayee) return <Dashboard items={PAYEE_NAV} role="Recipient" />;

  return (
    <div className="px-6 py-12 max-w-canvas mx-auto">
      <div className="mx-auto max-w-xl rounded-2xl neumo-card p-6 text-center">
        <div className="text-lg font-semibold display-tight text-navy mb-1">
          You're not on this team yet
        </div>
        <div className="text-sm text-neutral-800">
          {address
            ? "This wallet isn't the admin or on the recipient list. Ask the admin to add you, or switch wallets."
            : "Connect a wallet to continue."}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen flex flex-col">
      {!isConnected ? <Header /> : null}
      <ConfigBanner />
      <AnimatePresence mode="wait">
        {!isConnected ? (
          <motion.main
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="flex-1"
          >
            <Landing />
          </motion.main>
        ) : (
          <motion.main
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="flex-1"
          >
            <NetworkGate>
              <AppBody />
            </NetworkGate>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
