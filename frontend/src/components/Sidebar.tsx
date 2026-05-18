import { useAccount, useDisconnect } from "wagmi";
import {
  Banknote,
  Bot,
  Clock,
  LayoutDashboard,
  LogOut,
  Lock,
  Unlock,
  UserPlus,
  Users,
} from "lucide-react";
import { shortAddr } from "../lib/format";
import { BlindLedgerMark } from "./BrandMark";

export type NavItem = {
  id: string;
  label: string;
  icon: typeof Lock;
};

export function Sidebar({
  items,
  role,
  active,
  onNavigate,
}: {
  items: NavItem[];
  role: "Admin" | "Recipient" | "Visitor";
  active: string;
  onNavigate: (id: string) => void;
}) {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <aside className="hidden md:flex flex-col w-[220px] shrink-0 sticky top-0 h-screen pt-6 pl-4 pr-2 pb-6 border-r border-blue-300/30">
      <div className="px-3 mb-7 flex items-center gap-2.5">
        <BlindLedgerMark size="md" />
        <div className="font-semibold text-navy display-tight leading-tight text-base">
          Blind<br />Ledger
        </div>
      </div>

      <div className="px-1 mb-3 label-eyebrow">{role}</div>

      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`group flex items-center gap-2.5 rounded-full px-3 py-2.5 text-left t-vault ${
                isActive
                  ? "bg-blue-700/10 text-navy"
                  : "text-neutral-700 hover:text-navy hover:bg-blue-700/5"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${isActive ? "text-blue-700" : "text-neutral-500"}`}
                strokeWidth={2.2}
              />
              <span className="text-sm font-semibold display-refined">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="rounded-2xl bg-white border border-blue-300/40 p-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="label-eyebrow">Connected</div>
              <div className="text-xs font-mono text-navy font-semibold truncate" title={address}>
                {address ? shortAddr(address) : "—"}
              </div>
            </div>
            <button
              onClick={() => disconnect()}
              className="p-1.5 rounded-md text-neutral-700 hover:text-red-500 hover:bg-red-50 t-vault"
              title="Disconnect"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export const ADMIN_NAV: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "schedule", label: "Schedule", icon: Clock },
  { id: "add-member", label: "Add member", icon: UserPlus },
];

export const PAYEE_NAV: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "claim", label: "Get paid", icon: Unlock },
];
