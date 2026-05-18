import { ReactNode } from "react";

/// Hairline-separated section with anchor ID for sidebar nav.
/// Cards are reserved for ACTION surfaces (Deposit, Claim, Add member).
export function Section({
  id,
  title,
  headerRight,
  children,
}: {
  id?: string;
  title: string;
  headerRight?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="border-t border-blue-300/40 pt-6 scroll-mt-6">
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="label-eyebrow">{title}</h2>
        {headerRight ? <div className="text-xs text-neutral-800">{headerRight}</div> : null}
      </div>
      <div>{children}</div>
    </section>
  );
}
