"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Check, ChevronRight, Shield, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icons } from "@/components/icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { footerColumns, navLinks, siteConfig } from "@/lib/promptrak-content";
import type { PlaceholderAsset } from "@/lib/promptrak-placeholders";
import { cn } from "@/lib/utils";

const rise = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
};

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground">
      <div className="fixed inset-x-0 top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-1">
            <Icons.logo className="h-9 w-9" />
            <span className="font-heading text-[1.05rem] font-black uppercase tracking-[0.28em] text-teal-400">
              AGENVIA
            </span>
          </Link>
          <nav className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm text-zinc-400 transition-colors hover:text-zinc-100",
                    active && "text-zinc-100 font-medium"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/signup"
              className="hidden rounded-full border border-teal-700 bg-transparent px-3 py-1 text-xs font-medium text-teal-400 hover:bg-teal-950 hover:text-teal-300 transition-colors lg:inline-flex"
            >
              Sign Up
            </Link>
            <Link
              href="/pricing"
              className="rounded-full bg-teal-600 px-3 py-1 text-xs font-medium text-white hover:bg-teal-500 transition-colors"
            >
              Book Demo
            </Link>
          </div>
        </div>
      </div>
      <div className="pt-16">{children}</div>
      <footer className="border-t border-zinc-800 bg-zinc-900">
        <div className="container grid gap-12 py-16 lg:grid-cols-[1.2fr_repeat(3,1fr)]">
          <div className="space-y-4">
            <div className="font-heading text-2xl font-semibold tracking-tight text-zinc-50">
              The control plane for trusted enterprise AI.
            </div>
            <p className="max-w-md text-sm leading-6 text-zinc-400">
              Agenvia detects, sanitizes, blocks, audits, and federates
              privacy intelligence before sensitive data reaches an LLM.
            </p>
            <div className="flex max-w-md gap-3">
              <Input
                aria-label="Email"
                placeholder="Work email"
                className="h-11 rounded-full border-zinc-700 bg-zinc-800 text-zinc-100 placeholder-zinc-500"
              />
              <Button className="h-11 rounded-full bg-teal-600 px-5 text-white hover:bg-teal-500">
                Book Demo
              </Button>
            </div>
          </div>
          {footerColumns.map((column) => (
            <div key={column.title} className="space-y-4">
              <div className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                {column.title}
              </div>
              <div className="space-y-3">
                {column.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-sm text-zinc-400 transition-colors hover:text-zinc-100"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}

export function PageSection({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("container py-20", className)}>
      <motion.div {...rise} className="mb-10 max-w-3xl space-y-4">
        {eyebrow ? (
          <div className="inline-flex rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-teal-400">
            {eyebrow}
          </div>
        ) : null}
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-zinc-50 md:text-5xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-base leading-7 text-zinc-400 md:text-lg">
            {description}
          </p>
        ) : null}
      </motion.div>
      {children}
    </section>
  );
}

export function GlassCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      {...rise}
      className={cn(
        "rounded-[28px] border border-zinc-800 bg-zinc-900/80 p-6 shadow-[0_30px_80px_-38px_rgba(0,0,0,0.6)] backdrop-blur-sm",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <GlassCard className="space-y-3">
      <div className="text-sm text-zinc-500">{label}</div>
      <div className="font-heading text-4xl font-semibold tracking-tight text-zinc-50 tabular-nums">
        {value}
      </div>
      {detail ? <p className="text-sm leading-6 text-zinc-400">{detail}</p> : null}
    </GlassCard>
  );
}

export function FeatureCard({
  title,
  body,
  icon: Icon,
}: {
  title: string;
  body: string;
  icon: LucideIcon;
}) {
  return (
    <GlassCard className="h-full">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-teal-400">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-heading text-xl font-semibold tracking-tight text-zinc-50">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-zinc-400">{body}</p>
    </GlassCard>
  );
}

export function ComparisonTable({
  rows,
}: {
  rows: { label: string; left: boolean; right: boolean }[];
}) {
  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="grid grid-cols-[1.4fr_1fr_1fr] border-b border-zinc-800 px-6 py-4 text-sm font-medium text-zinc-500">
        <div>Capability</div>
        <div>Generic redaction tools</div>
        <div>Agenvia</div>
      </div>
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[1.4fr_1fr_1fr] items-center border-b border-zinc-800 px-6 py-4 text-sm last:border-b-0"
        >
          <div className="font-medium text-zinc-200">{row.label}</div>
          <div>{row.left ? <CheckMark ok /> : <CheckMark ok={false} />}</div>
          <div>{row.right ? <CheckMark ok /> : <CheckMark ok={false} />}</div>
        </div>
      ))}
    </GlassCard>
  );
}

function CheckMark({ ok }: { ok: boolean }) {
  return ok ? (
    <div className="inline-flex rounded-full bg-teal-500/10 p-2 text-teal-400">
      <Check className="h-4 w-4" />
    </div>
  ) : (
    <div className="inline-flex rounded-full bg-red-500/10 p-2 text-red-400">
      <X className="h-4 w-4" />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  primaryCta = { href: "/pricing", label: "Book Demo" },
  secondaryCta,
  aside,
}: {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta?: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
  aside?: React.ReactNode;
}) {
  return (
    <section className="container py-16 md:py-24">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <motion.div {...rise} className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-teal-400">
            <Shield className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
          <h1 className="font-heading text-4xl font-semibold leading-tight tracking-tight text-zinc-50 md:text-6xl">
            {title}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-zinc-400">{description}</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={primaryCta.href}
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-full bg-teal-600 px-6 text-white hover:bg-teal-500"
              )}
            >
              {primaryCta.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            {secondaryCta ? (
              <Link
                href={secondaryCta.href}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-full border-zinc-700 bg-zinc-800 px-6 text-zinc-300 hover:bg-zinc-700"
                )}
              >
                {secondaryCta.label}
              </Link>
            ) : null}
          </div>
        </motion.div>
        {aside}
      </div>
    </section>
  );
}

export function PlaceholderPanel({
  asset,
  className,
}: {
  asset: PlaceholderAsset;
  className?: string;
}) {
  return (
    <GlassCard
      className={cn(
        "relative overflow-hidden border-zinc-700 bg-zinc-900",
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.08),transparent_35%)]" />
      <div className="relative space-y-5">
        <div className="inline-flex rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
          {asset.type}
        </div>
        <div>
          <h3 className="font-heading text-2xl font-semibold tracking-tight text-zinc-50">
            {asset.title}
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
            {asset.description}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {["Replace later", "Use approved capture", "Keep calm visual tone"].map(
            (item) => (
              <div
                key={item}
                className="rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-300"
              >
                {item}
              </div>
            )
          )}
        </div>
      </div>
    </GlassCard>
  );
}

export function MiniBars({
  values,
  tone = "teal",
}: {
  values: { label: string; value: string }[];
  tone?: "teal" | "amber" | "red";
}) {
  const colors = {
    teal: "from-teal-400 to-teal-200",
    amber: "from-amber-400 to-amber-200",
    red: "from-rose-400 to-rose-200",
  };

  return (
    <div className="space-y-4">
      {values.map((item, index) => (
        <div key={item.label} className="space-y-2">
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>{item.label}</span>
            <span className="font-medium text-zinc-100">{item.value}</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-800">
            <div
              className={cn(
                "h-2 rounded-full bg-gradient-to-r",
                colors[tone]
              )}
              style={{ width: `${70 + index * 8}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Timeline({
  steps,
}: {
  steps: { title: string; body: string }[];
}) {
  return (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <GlassCard key={step.title} className="relative pl-16">
          <div className="absolute left-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-sm font-medium text-white">
            {index + 1}
          </div>
          <h3 className="font-heading text-xl font-semibold tracking-tight text-zinc-50">
            {step.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{step.body}</p>
        </GlassCard>
      ))}
    </div>
  );
}

export function UseCaseGrid({
  items,
}: {
  items: { label: string; icon: LucideIcon; href?: string }[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-5">
      {items.map((item) => {
        const content = (
          <GlassCard className="h-full space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-800 text-teal-400">
              <item.icon className="h-5 w-5" />
            </div>
            <div className="font-heading text-xl font-semibold text-zinc-50">
              {item.label}
            </div>
          </GlassCard>
        );

        return item.href ? (
          <Link key={item.label} href={item.href} className="group block">
            {content}
            <div className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors group-hover:text-zinc-100">
              Explore
              <ChevronRight className="h-4 w-4" />
            </div>
          </Link>
        ) : (
          <div key={item.label}>{content}</div>
        );
      })}
    </div>
  );
}

export function AdminStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Card className="rounded-[24px] border-zinc-800 bg-zinc-900">
      <CardHeader className="pb-2">
        <div className="text-sm text-zinc-500">{label}</div>
        <CardTitle className="font-heading text-3xl font-semibold tracking-tight text-zinc-50 tabular-nums">
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

export function DrawerPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <GlassCard className="space-y-4">
      <div className="font-heading text-xl font-semibold tracking-tight text-zinc-50">
        {title}
      </div>
      <div className="space-y-3 text-sm leading-6 text-zinc-400">{children}</div>
    </GlassCard>
  );
}
