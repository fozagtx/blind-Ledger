import { motion } from "framer-motion";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  Code2,
  Eye,
  EyeOff,
  Github,
  Lock,
  Sigma,
  Sparkles,
  Wallet,
} from "lucide-react";
import { usePoolOverview } from "../hooks/usePayrollPool";
import { cipherPreview } from "../lib/format";
import { config } from "../lib/config";
import { ArbitrumLogo, FhenixLogo, UsdcLogo } from "./Logos";

// ---------- Motion ----------
const ease = [0.4, 0, 0.2, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial="show"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================
// HERO, Title / Subtitle / CTA / Visual / Social Proof
// ============================================================
function Hero() {
  const o = usePoolOverview();
  return (
    <section className="relative px-6 pt-8 pb-12 md:pt-10 md:pb-14 overflow-hidden">
      <div className="absolute -top-24 left-1/4 h-[420px] w-[420px] orb -z-10" />
      <div className="absolute top-40 right-10 h-[320px] w-[320px] orb -z-10" />
      <div className="mx-auto max-w-canvas">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
        >
          <div className="lg:col-span-7">
            {/* TITLE */}
            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-[64px] font-semibold display-tight leading-[1.05] text-navy max-w-2xl"
            >
              Recurring on-chain payroll.{" "}
              <span className="serif text-blue-700">Private salaries. Verifiable totals.</span>
            </motion.h1>

            {/* SUBTITLE */}
            <motion.p
              variants={fadeUp}
              className="mt-6 text-lg text-neutral-800 max-w-xl leading-relaxed"
            >
              Set it and forget it, salaries stay encrypted end-to-end. Only the recipient sees their number. The DAO proves the math without exposing anyone.
            </motion.p>

            {/* CTA */}
            <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-3">
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button
                    onClick={openConnectModal}
                    className="group inline-flex items-center gap-2 btn-cta text-sm font-semibold px-6 h-11 rounded-2xl t-vault"
                  >
                    <Wallet className="h-4 w-4" />
                    Connect wallet
                  </button>
                )}
              </ConnectButton.Custom>
              <a
                href="#how"
                className="inline-flex items-center gap-2 btn-ghost text-sm font-semibold px-6 h-11 rounded-2xl t-vault"
              >
                See how it works
                <ChevronDown className="h-4 w-4" />
              </a>
            </motion.div>

            {/* Mini value props, replaces dense badges */}
            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-neutral-700"
            >
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-blue-700" /> Salaries stay sealed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5 text-blue-700" /> Paid in USDC
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-blue-700" /> Pays itself on schedule
              </span>
            </motion.div>
          </div>

          {/* VISUAL, live data, doubles as social proof */}
          <motion.div variants={fadeUp} className="lg:col-span-5">
            <div className="rounded-organic p-1.5 bg-white/40 backdrop-blur-md border border-blue-300/40">
              <div className="rounded-[28px] cipher-card p-8 min-h-[280px] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="label-eyebrow flex items-center gap-1.5">
                    <Lock className="h-3 w-3 text-blue-700" /> Total payroll · sealed
                  </div>
                  <span className="text-[10px] text-neutral-700 px-2 py-0.5 rounded-full bg-white/60 font-semibold">
                    live
                  </span>
                </div>
                <div>
                  <div className="font-mono text-[34px] md:text-[40px] leading-none text-navy break-all display-tight">
                    {cipherPreview(o.aggregateHandle)}
                  </div>
                  <div className="mt-4 text-[12px] text-neutral-800 leading-relaxed">
                    What you're seeing is the actual sum of all salaries on the real contract, locked. No one can read the number from this page. Only the boss can peek.
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-5 border-t border-blue-300/40">
                  <Mini label="People paid" value={o.payeeCount?.toString() ?? "—"} />
                  <Mini
                    label="Available"
                    value={
                      o.remainingBalance !== undefined
                        ? `${(Number(o.remainingBalance) / 1e6).toLocaleString()}`
                        : "—"
                    }
                    suffix="USDC"
                  />
                  <Mini label="Cycle" value={`#${o.currentPeriod?.toString() ?? "—"}`} />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Mini({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div>
      <div className="label-eyebrow">{label}</div>
      <div className="mt-1 text-sm tabular-nums text-navy display-tight font-semibold">
        {value}
        {suffix ? <span className="text-neutral-700 ml-1 text-[11px] font-normal">{suffix}</span> : null}
      </div>
    </div>
  );
}

// ============================================================
// SOCIAL PROOF, single-line trust strip
// ============================================================
function TrustBar() {
  const addr = `${config.payrollPool.slice(0, 6)}…${config.payrollPool.slice(-4)}`;
  const arbiscan = `https://sepolia.arbiscan.io/address/${config.payrollPool}`;

  // Render the chip set TWICE inline so the -50% translate loops seamlessly.
  const Item = () => (
    <div className="inline-flex items-center gap-8 px-8 py-4 shrink-0 text-base">
      <span className="inline-flex items-center gap-2 text-navy">
        <FhenixLogo className="h-5 w-5" />
        <span className="font-semibold">Fhenix</span>
      </span>
      <span className="text-neutral-400">·</span>
      <span className="inline-flex items-center gap-2 text-navy">
        <ArbitrumLogo className="h-5 w-5" />
        <span className="font-semibold">Arbitrum</span>
      </span>
      <span className="text-neutral-400">·</span>
      <span className="inline-flex items-center gap-2 text-navy">
        <UsdcLogo className="h-5 w-5" />
        <span className="font-semibold">USDC</span>
      </span>
      <span className="text-neutral-400">·</span>
      <a
        href={arbiscan}
        target="_blank"
        rel="noreferrer"
        className="font-mono text-blue-700 hover:text-blue-900 t-vault font-semibold"
      >
        {addr}
      </a>
      <span className="text-neutral-400">·</span>
      <span className="inline-flex items-center gap-2 text-navy">
        <FhenixLogo className="h-5 w-5" />
        <span className="font-semibold">Private by design</span>
      </span>
      <span className="text-neutral-400">·</span>
    </div>
  );

  return (
    <section className="border-y border-blue-300/30 bg-white/50 backdrop-blur-sm overflow-hidden">
      <div className="marquee-track">
        <Item />
        <Item />
      </div>
    </section>
  );
}

// ============================================================
// PROBLEM, mirror subtitle promise
// ============================================================
function Problem() {
  const pains = [
    {
      title: "Everyone sees what everyone earns",
      body: "When every salary is on a public ledger, every contributor anchors their next negotiation to the highest visible number. Talented people leave because they 'see' an unfair gap.",
      fix: "Each person's pay is sealed, no one sees anyone else's.",
    },
    {
      title: "Negotiation starts on the wrong foot",
      body: "Every comp conversation begins with 'I saw what you paid Alice'. You can't run a thoughtful compensation strategy when the whole table is on stage.",
      fix: "Salaries live sealed; only the total can be checked.",
    },
    {
      title: "Treasury ≠ Payroll",
      body: "Showing the treasury is a feature. Showing individual salaries is a leak. The blockchain treats them the same, by default.",
      fix: "Now they're separated. Funds public, pay private.",
    },
  ];
  return (
    <section id="how" className="px-6 py-14">
      <div className="mx-auto max-w-canvas">
        <Reveal>
          <motion.div variants={fadeUp} className="label-eyebrow">Why this matters</motion.div>
          <motion.h2
            variants={fadeUp}
            className="mt-2 text-3xl md:text-4xl font-semibold display-tight max-w-2xl text-navy"
          >
            Three reasons public payroll keeps biting teams.
          </motion.h2>
        </Reveal>
        <Reveal className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {pains.map((p) => (
            <motion.div
              key={p.title}
              variants={fadeUp}
              className="neumo-card rounded-xl p-6 t-vault hover:shadow-cta-glow"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-lg bg-white grid place-items-center border border-red-200">
                  <EyeOff className="h-3.5 w-3.5 text-red-500" />
                </div>
                <h3 className="font-semibold text-navy display-tight">{p.title}</h3>
              </div>
              <p className="text-sm text-neutral-800 leading-relaxed">{p.body}</p>
              <div className="mt-4 pt-4 border-t border-blue-300/40 text-[12px] text-blue-700 inline-flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="h-3 w-3" /> {p.fix}
              </div>
            </motion.div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// SOLUTION / Feature Benefits, three steps, plain English
// ============================================================
function Solution() {
  const features = [
    {
      icon: Lock,
      eyebrow: "Step 1",
      title: "Seal pay before it leaves your browser",
      metric: "The number never travels in plain text",
      body: "When you enter someone's salary, your browser scrambles it first. Only the scrambled version goes on the blockchain, even we can't see the original.",
    },
    {
      icon: Sigma,
      eyebrow: "Step 2",
      title: "The total still adds up, without revealing anything",
      metric: "Auditors verify, no one sees the breakdown",
      body: "The contract can add scrambled numbers together. The total tells you the payroll matches the treasury, but no one can read any individual person's salary from it.",
    },
    {
      icon: Clock,
      eyebrow: "Step 3",
      title: "Pays itself on a schedule",
      metric: "Set the frequency and walk away",
      body: "Pick how often payroll runs (weekly, monthly). A small scheduled job handles every cycle. Each person clicks once to unlock their own pay, no one else can.",
    },
  ];
  return (
    <section className="px-6 py-14 bg-white/40">
      <div className="mx-auto max-w-canvas">
        <Reveal>
          <motion.div variants={fadeUp} className="label-eyebrow">How it works</motion.div>
          <motion.h2
            variants={fadeUp}
            className="mt-2 text-3xl md:text-4xl font-semibold display-tight max-w-2xl text-navy"
          >
            Three steps. <span className="serif text-blue-700">No spreadsheets, no servers.</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-3 text-base text-neutral-800 max-w-xl"
          >
            Set up payroll once. Each person gets paid privately, on schedule, in USDC.
          </motion.p>
        </Reveal>
        <Reveal className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              className="neumo-card rounded-2xl p-6 t-vault hover:shadow-cta-glow"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="h-9 w-9 rounded-xl bg-white grid place-items-center border border-blue-300/50">
                  <f.icon className="h-4 w-4 text-blue-700" strokeWidth={2.2} />
                </div>
                <span className="label-eyebrow">{f.eyebrow}</span>
              </div>
              <h3 className="font-semibold text-navy display-tight text-lg leading-snug">{f.title}</h3>
              <div className="mt-1 text-blue-700 text-sm tabular-nums font-semibold">{f.metric}</div>
              <p className="mt-3 text-sm text-neutral-800 leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// FEATURE LIST, quick reassurance of completeness
// ============================================================
function FeatureList() {
  const items = [
    "No subscription. Pay only blockchain gas (~1¢ per click).",
    "Real USDC, not a test token. Same one used on Ethereum mainnet.",
    "Anyone can verify the math without seeing the numbers.",
    "Recipients can preview their pay before claiming, free.",
    "Schedule built in. Skip the cron job setup.",
    "Owner can be a single wallet or a multisig.",
    "Recipients can be added or removed at any time.",
    "Nothing lives on a company server. The blockchain is the database.",
  ];
  return (
    <section className="px-6 py-14">
      <div className="mx-auto max-w-canvas">
        <Reveal>
          <motion.div variants={fadeUp} className="label-eyebrow">What's in the box</motion.div>
          <motion.h2
            variants={fadeUp}
            className="mt-2 text-3xl md:text-4xl font-semibold display-tight text-navy max-w-2xl"
          >
            What you get out of the box.
          </motion.h2>
        </Reveal>
        <Reveal className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2.5 max-w-3xl">
          {items.map((t) => (
            <motion.div
              key={t}
              variants={fadeUp}
              className="flex items-start gap-2 text-sm text-neutral-800"
            >
              <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
              {t}
            </motion.div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// FAQ, anticipate objections
// ============================================================
function FaqItem({ q, a }: { q: string; a: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-blue-300/40">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-base font-semibold text-navy display-tight">{q}</span>
        <ChevronDown
          className={`h-4 w-4 text-blue-700 t-vault shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease }}
        className="overflow-hidden"
      >
        <div className="pb-5 pr-8 text-sm text-neutral-800 leading-relaxed">{a}</div>
      </motion.div>
    </div>
  );
}

function Faq() {
  return (
    <section id="faq" className="px-6 py-14 bg-white/40">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <motion.div variants={fadeUp} className="label-eyebrow">FAQ</motion.div>
          <motion.h2
            variants={fadeUp}
            className="mt-2 text-3xl md:text-4xl font-semibold display-tight text-navy"
          >
            Questions you're probably asking.
          </motion.h2>
        </Reveal>
        <Reveal className="mt-7">
          <FaqItem
            q="What does it cost?"
            a="Free to use. You only pay blockchain gas, usually less than a cent per click. No subscription, no per-seat fee, no setup charge."
          />
          <FaqItem
            q="Do I need to install anything?"
            a="No. You need a wallet (MetaMask, Rabby, anything that works with Ethereum) and some USDC. That's it. No backend, no integration, no admin panel."
          />
          <FaqItem
            q="Can the boss actually see my salary?"
            a="No. The boss can check the total of all salaries (also sealed). They can't see your individual amount. Only you can open yours."
          />
          <FaqItem
            q="Where does my salary data live?"
            a="On the blockchain, sealed. There's no company server holding the plain-text. If we disappeared tomorrow, your sealed pay would still be there and you'd still be able to claim it."
          />
          <FaqItem
            q="How long does it take to get paid?"
            a="About 30 seconds. One click triggers two short transactions, first the network unseals your pay, then it sends it to your wallet."
          />
          <FaqItem
            q="What if the unsealing service is down?"
            a="Your sealed pay stays safe on the blockchain. When the service is back, you claim normally. Your funds are never at risk, only the unsealing step pauses."
          />
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// ABOUT — context, credibility, team
// ============================================================
function About() {
  return (
    <section id="about" className="px-6 py-14">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <motion.div variants={fadeUp} className="label-eyebrow">About</motion.div>
          <motion.h2
            variants={fadeUp}
            className="mt-2 text-3xl md:text-4xl font-semibold display-tight text-navy"
          >
            Built for teams who <span className="serif text-blue-700">pay real people.</span>
          </motion.h2>
          <motion.div
            variants={fadeUp}
            className="mt-6 space-y-4 text-base text-neutral-800 leading-relaxed"
          >
            <p>
              Every DAO contributor's salary is on a public ledger. That breaks negotiations, leaks comp strategy, and forces teams in cheaper regions to anchor down. Blind Ledger fixes the leak without giving up the verifiability that makes on-chain payroll useful.
            </p>
            <p>
              The contract uses{" "}
              <a href="https://fhenix.io" target="_blank" rel="noreferrer" className="text-blue-700 font-semibold hover:underline">Fhenix</a>{" "}
              for the encrypted math,{" "}
              <a href="https://arbitrum.io" target="_blank" rel="noreferrer" className="text-blue-700 font-semibold hover:underline">Arbitrum</a>{" "}
              for the settlement layer, and Circle's official USDC for the actual money. No mocked tokens, no off-chain database. The whole stack is the smart contract plus a static frontend.
            </p>
            <p>
              Built for the <span className="text-navy font-semibold">Fhenix Private By Design</span> buildathon, Wave 4.
            </p>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// FINAL CTA, restate the value
// ============================================================
function FinalCta() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <motion.div variants={fadeUp} className="label-eyebrow">Try it</motion.div>
          <motion.h2
            variants={fadeUp}
            className="mt-2 text-3xl md:text-5xl font-semibold display-tight leading-[1.02] text-navy"
          >
            Private payroll, <span className="serif text-blue-700">ready in one click.</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 text-base text-neutral-800 max-w-xl mx-auto"
          >
            Connect a wallet, the app figures out whether you're the boss or a recipient and shows the right screen.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  className="group inline-flex items-center gap-2 btn-cta text-sm font-semibold px-7 h-12 rounded-2xl t-vault"
                >
                  Connect wallet
                  <Sparkles className="h-4 w-4" />
                </button>
              )}
            </ConnectButton.Custom>
            <a
              href={`https://sepolia.arbiscan.io/address/${config.payrollPool}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 btn-ghost text-sm font-semibold px-7 h-12 rounded-2xl t-vault"
            >
              <Code2 className="h-4 w-4" />
              View on Arbiscan
            </a>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// FOOTER
// ============================================================
function LandingFooter() {
  return (
    <footer className="px-6 py-6 border-t border-blue-300/30 bg-white/50">
      <div className="mx-auto max-w-canvas flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-700">
        <div className="inline-flex items-center gap-2">
          <Lock className="h-3 w-3 text-blue-700" /> Blind Ledger · Private payroll for crypto teams.
        </div>
        <div className="flex items-center gap-5">
          <a href="https://github.com" className="hover:text-blue-700 inline-flex items-center gap-1 t-vault font-semibold">
            <Github className="h-3.5 w-3.5" /> GitHub
          </a>
          <a
            href={`https://sepolia.arbiscan.io/address/${config.payrollPool}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-blue-700 inline-flex items-center gap-1 t-vault font-semibold"
          >
            <Code2 className="h-3.5 w-3.5" /> Contract
          </a>
          <a href="#" className="hover:text-blue-700 t-vault inline-flex items-center gap-1 font-semibold">
            <Eye className="h-3.5 w-3.5" /> Docs
          </a>
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// EXPORT
// ============================================================
export function Landing() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Problem />
      <Solution />
      <FeatureList />
      <Faq />
      <About />
      <FinalCta />
    </>
  );
}
