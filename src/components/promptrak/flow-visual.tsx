"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  EyeOff,
  FileSymlink,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { GlassCard } from "@/components/promptrak/primitives";

const flow = [
  { label: "Raw Prompt",               icon: FileSymlink, tone: "bg-zinc-800 text-zinc-100" },
  { label: "Sensitive Entity Detection",icon: ScanSearch,  tone: "bg-zinc-700 text-zinc-100" },
  { label: "Sanitize / Minimize",       icon: Sparkles,    tone: "bg-teal-500/20 text-teal-300" },
  { label: "Safe Model Request",        icon: Bot,         tone: "bg-zinc-700 text-zinc-100" },
  { label: "Output Leakage Guard",      icon: ShieldCheck, tone: "bg-amber-500/20 text-amber-300" },
  { label: "Federated Learning Update", icon: EyeOff,      tone: "bg-zinc-800 text-teal-300" },
];

export function FlowVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard className="relative overflow-hidden p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(109,242,214,0.18),transparent_30%),radial-gradient(circle_at_90%_20%,rgba(15,23,42,0.12),transparent_35%)]" />
        <div className="relative space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.24em] text-zinc-500">
                Signature Flow
              </div>
              <div className="font-heading text-2xl font-semibold tracking-tight text-zinc-50">
                Privacy intelligence before the model boundary
              </div>
            </div>
            <div className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm text-zinc-300">
              Live gateway path
            </div>
          </div>
          <div className="space-y-4">
            {flow.map((step, index) => (
              <div key={step.label} className="flex items-center gap-3">
                <div
                  className={`flex min-w-[240px] items-center gap-3 rounded-[22px] border border-zinc-700/60 px-4 py-4 ${step.tone}`}
                >
                  <step.icon className="h-5 w-5" />
                  <div className="font-medium">{step.label}</div>
                </div>
                {index < flow.length - 1 ? (
                  <motion.div
                    className="flex items-center text-slate-400"
                    initial={{ opacity: 0.3, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.08,
                      repeat: Infinity,
                      repeatType: "mirror",
                    }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                ) : null}
              </div>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              "PERSON_1",
              "PROJECT_CODE_1",
              "STRATEGY_NOTE_REMOVED",
            ].map((chip) => (
              <div
                key={chip}
                className="rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-300"
              >
                {chip}
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
