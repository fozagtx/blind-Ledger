import { motion, useScroll, useTransform } from "framer-motion";
import { BlindLedgerWordmark } from "./BrandMark";

export function Header() {
  const { scrollY } = useScroll();

  // At top: transparent, generous padding. After scrolling ~80px: frosted, tighter.
  const bg = useTransform(scrollY, [0, 80], ["rgba(255,255,255,0)", "rgba(255,255,255,0.72)"]);
  const borderColor = useTransform(scrollY, [0, 80], ["rgba(189,215,255,0)", "rgba(189,215,255,0.5)"]);
  const blur = useTransform(scrollY, [0, 80], [0, 14]);
  const filter = useTransform(blur, (b) => `blur(0px) saturate(1)`); // no-op, replaced by backdropFilter
  const backdropFilter = useTransform(blur, (b) => `blur(${b}px) saturate(1.1)`);
  const padY = useTransform(scrollY, [0, 80], [20, 12]);
  // void the unused-var warning while keeping `filter` available if we later need it
  void filter;

  return (
    <motion.header
      className="sticky top-0 z-50 px-6 border-b"
      style={{
        backgroundColor: bg,
        borderColor,
        backdropFilter,
        WebkitBackdropFilter: backdropFilter,
        paddingTop: padY,
        paddingBottom: padY,
      }}
    >
      <div className="mx-auto max-w-canvas grid grid-cols-3 items-center">
        <div className="justify-self-start">
          <BlindLedgerWordmark size="md" />
        </div>

        <nav className="justify-self-center hidden md:flex items-center gap-0.5 frost rounded-full px-1.5 py-1.5">
          <a
            href="#how"
            className="px-4 py-1.5 text-sm font-semibold text-navy hover:bg-blue-700/10 rounded-full t-vault display-refined"
          >
            How it works
          </a>
          <a
            href="#faq"
            className="px-4 py-1.5 text-sm font-semibold text-navy hover:bg-blue-700/10 rounded-full t-vault display-refined"
          >
            FAQ
          </a>
          <a
            href="#about"
            className="px-4 py-1.5 text-sm font-semibold text-navy hover:bg-blue-700/10 rounded-full t-vault display-refined"
          >
            About
          </a>
        </nav>

        <div />
      </div>
    </motion.header>
  );
}
