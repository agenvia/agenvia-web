import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  Blocks,
  Bot,
  Brain,
  Briefcase,
  Building2,
  FileSearch,
  Fingerprint,
  FlaskConical,
  GitBranchPlus,
  Globe,
  Handshake,
  Key,
  Landmark,
  Layers,
  LockKeyhole,
  Microscope,
  Network,
  Radar,
  ScanSearch,
  ScrollText,
  ShieldCheck,
  ShieldEllipsis,
  Sparkles,
  Users,
  Workflow,
  Zap,
} from "lucide-react";

export const siteConfig = {
  name: "Agenvia",
  shortName: "Agenvia",
  description:
    "The Enterprise AI Security Platform. Agenvia enforces identity-aware access control, detects sensitive data, governs agent tools, and federates privacy intelligence — all before a single token reaches an LLM.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  keywords: [
    "enterprise AI security",
    "AI privacy gateway",
    "access control AI",
    "agent governance",
    "federated learning privacy",
    "prompt sanitization",
    "output leakage guard",
    "differential privacy",
    "multilingual AI security",
  ],
};

export const navLinks = [
  { href: "/product", label: "Product" },
  { href: "/developers", label: "Developers" },
  { href: "/live-demo", label: "Live Demo" },
  { href: "/console", label: "Dashboard" },
  { href: "/fl-intelligence", label: "FL Intelligence" },
  { href: "/pricing", label: "Pricing" },
];

export const trustBar = [
  "Role × Domain × Action access control",
  "Differential privacy federated learning",
  "Multilingual injection detection",
  "Agent + tool governance built in",
];

export const howItWorks = [
  {
    title: "Verify",
    body: "Decode identity, enforce role × domain × action-tier access, and block unauthorized requests before any processing begins.",
    icon: Key,
  },
  {
    title: "Detect",
    body: "Scan prompts with a fine-tuned intent classifier, FL-promoted regex patterns, and multilingual injection signatures to classify risk.",
    icon: ScanSearch,
  },
  {
    title: "Decide",
    body: "Apply per-org policy rules, action intent ceilings, and sensitivity thresholds to select the right governance action.",
    icon: Fingerprint,
  },
  {
    title: "Transform",
    body: "Sanitize named entities, minimize unnecessary context, and build a clean outbound prompt that preserves task value.",
    icon: Sparkles,
  },
  {
    title: "Guard",
    body: "Inspect every model response, tool output, and agent step for leakage before content reaches users or downstream systems.",
    icon: ShieldEllipsis,
  },
];

export const comparisonRows = [
  { label: "Identity-aware access control", left: false, right: true },
  { label: "Prompt gateway & policy engine", left: false, right: true },
  { label: "Output leakage blocking", left: false, right: true },
  { label: "Agent & tool governance", left: false, right: true },
  { label: "Federated learning", left: false, right: true },
  { label: "Audit trails", left: true, right: true },
];

export const benchmarkMetrics = [
  {
    label: "Attack block rate",
    value: "100%",
    detail: "Every jailbreak, bulk exfiltration, cross-domain, and injection attempt blocked across 100-prompt enterprise benchmark",
  },
  {
    label: "Legitimate access pass rate",
    value: "100%",
    detail: "All authorized nurse, legal, HR, and finance requests completed without false blocks",
  },
  {
    label: "FL patterns promoted live",
    value: "134+",
    detail: "Cross-tenant privacy patterns learned with differential privacy — no raw prompt data shared",
  },
];

export const featureBlocks = [
  {
    title: "Intent classification",
    body: "Every prompt is evaluated for intent before reaching your model. Malicious requests are stopped at the gate.",
    icon: Brain,
  },
  {
    title: "Formal reasoning",
    body: "Decisions are made against your defined policies, with a clear reason attached to every outcome.",
    icon: Key,
  },
  {
    title: "Consequence modeling",
    body: "High-impact actions are assessed before they run. Nothing escalates silently.",
    icon: Workflow,
  },
  {
    title: "Session escalation",
    body: "Threat patterns that develop across multiple turns are caught — not just single-prompt attacks.",
    icon: Sparkles,
  },
  {
    title: "Cryptographic audit trail",
    body: "Every enforcement decision is logged, tamper-evident, and exportable for compliance review.",
    icon: ShieldCheck,
  },
  {
    title: "Federated learning",
    body: "Your deployment gets stronger from signals across the network. No raw data ever leaves your environment.",
    icon: Network,
  },
];

export const requestStages = [
  "Input Findings",
  "Risk Route",
  "Sanitized Prompt",
  "Minimized Prompt",
  "Outbound Prompt",
  "Model Output",
  "Leakage Check",
  "FL Candidate Generated",
];

export const dashboardStats = [
  { label: "Protected Requests", value: "—" },
  { label: "Leakage Blocks", value: "—" },
  { label: "Promoted Patterns", value: "—" },
  { label: "FL Rounds Completed", value: "—" },
  { label: "Active Tenants", value: "—" },
];

export const policyActions = [
  { label: "Allow", value: "48%" },
  { label: "Sanitize", value: "27%" },
  { label: "Minimize", value: "18%" },
  { label: "Block", value: "7%" },
];

export const patternRows = [
  {
    pattern: "(PROJECT_CODE_[A-Z0-9]+)",
    label: "Internal program identifier",
    confidence: "0.96",
    votes: 14,
    tenants: 7,
    status: "Promoted",
    promotedAt: "2026-03-12",
  },
  {
    pattern: "(LEGAL_HOLD_[0-9]{4})",
    label: "Legal hold reference",
    confidence: "0.91",
    votes: 9,
    tenants: 4,
    status: "Candidate",
    promotedAt: "Pending",
  },
  {
    pattern: "(BID_ROOM_[A-Z]{3})",
    label: "Procurement room code",
    confidence: "0.83",
    votes: 6,
    tenants: 3,
    status: "Shadow Rejected",
    promotedAt: "2026-03-04",
  },
  {
    pattern: "(LEGACY_CLIENT_[0-9]+)",
    label: "Retired legacy label",
    confidence: "0.72",
    votes: 5,
    tenants: 2,
    status: "Retired",
    promotedAt: "2026-02-19",
  },
];

export const incidents = [
  {
    title: "Outbound response leaked internal pricing language",
    severity: "High",
    tenant: "Procurement Cloud",
    stage: "Output Leakage Guard",
    time: "4 minutes ago",
    action: "Review blocked spans and update procurement release policy.",
  },
  {
    title: "Connector fallback triggered for regional model endpoint",
    severity: "Medium",
    tenant: "Legal Ops EU",
    stage: "LLM Connector",
    time: "17 minutes ago",
    action: "Confirm approved backup connector stayed within data residency scope.",
  },
  {
    title: "Federated anomaly spike in new candidate patterns",
    severity: "Low",
    tenant: "Global",
    stage: "FL Aggregation",
    time: "42 minutes ago",
    action: "Inspect recent candidate surge before next promotion window.",
  },
];

export const policyCards = [
  "Block secret exfiltration",
  "Force minimize on internal strategy",
  "Local-only for highly sensitive context",
  "Restrict tool execution",
  "Approval needed for external release",
];

export type UseCase = {
  slug: string;
  title: string;
  icon: LucideIcon;
  workflowPain: string;
  fit: string;
  before: string;
  after: string;
  compliance: string;
  roi: string;
};

export const useCases: UseCase[] = [
  {
    slug: "hr-ai-safety",
    title: "HR AI Safety",
    icon: Users,
    workflowPain:
      "HR teams paste employee records, offer details, and performance context into copilots without enough guardrails.",
    fit: "Agenvia detects personal data, minimizes sensitive context, and keeps audit trails for employee-facing AI workflows.",
    before:
      "Summarize concerns from Sarah Nguyen's performance plan and include compensation context from FY26 review doc EMP-1842.",
    after:
      "Summarize concerns from PERSON_1's performance plan and include relevant review themes without compensation identifiers.",
    compliance:
      "Supports internal privacy controls and employment-data governance with explainable prompt transformations.",
    roi: "Reduce manual review overhead while keeping HR copilots usable for high-volume workflows.",
  },
  {
    slug: "legal-ai-review",
    title: "Legal AI Review",
    icon: Landmark,
    workflowPain:
      "Legal teams need drafting speed, but confidential clauses, hold references, and client names should not spill into general-purpose models.",
    fit: "Agenvia routes sensitive requests with stricter policy, stronger minimization, and outbound leakage protection.",
    before:
      "Compare this indemnity clause to the NOVA acquisition draft and flag issues tied to LEGAL_HOLD_2026.",
    after:
      "Compare this indemnity clause to the transaction draft and flag issues tied to the active legal hold reference.",
    compliance:
      "Creates audit-ready traces for request handling, policy decisions, and blocked responses.",
    roi: "Increase first-pass review throughput without lowering confidentiality standards.",
  },
  {
    slug: "procurement-ai-copilot",
    title: "Procurement AI Copilot",
    icon: Handshake,
    workflowPain:
      "Buyers want help summarizing bids and supplier negotiations, but internal margins and room codes are highly sensitive.",
    fit: "Agenvia identifies bid-room references and strategic pricing context before a model sees the prompt.",
    before:
      "Draft a supplier response using BID_ROOM_KEP and internal target margin for Project Atlas renewal.",
    after:
      "Draft a supplier response using the current bid context and approved commercial guidance for the renewal.",
    compliance:
      "Policy controls help procurement teams separate vendor communication from internal strategy.",
    roi: "Speed up supplier operations without exposing pricing playbooks.",
  },
  {
    slug: "sales-enablement-with-privacy-controls",
    title: "Sales Enablement with Privacy Controls",
    icon: Briefcase,
    workflowPain:
      "Sales teams copy account notes, renewals, and objections into assistants, often mixing customer and internal strategy data.",
    fit: "Agenvia strips unnecessary identifiers and blocks outputs that echo internal planning language back to users.",
    before:
      "Write a renewal email for Apex based on PROJECT_CODE_DELTA, discount guardrails, and renewal risk notes from Amy.",
    after:
      "Write a renewal email using the approved account context, commercial guardrails, and summarized renewal risk notes.",
    compliance:
      "Supports customer data handling and repeatable account-governance standards.",
    roi: "Improve seller productivity while reducing accidental data spill risk.",
  },
  {
    slug: "rd-confidentiality-protection",
    title: "R&D Confidentiality Protection",
    icon: Microscope,
    workflowPain:
      "Researchers want model assistance for analysis and drafting, but internal experiments, prototype names, and secret methods cannot leak.",
    fit: "Agenvia detects project identifiers, minimizes proprietary context, and keeps sensitive workflows local when required.",
    before:
      "Summarize experiment results for PROJECT_CODE_ASTER and propose next steps using the internal catalyst notes.",
    after:
      "Summarize the experiment results and propose next steps using the approved research summary and non-sensitive method details.",
    compliance:
      "Supports confidentiality controls for proprietary research and regulated product development.",
    roi: "Protect valuable R&D context while still letting teams use AI for iteration speed.",
  },
];

export const pricingTiers = [
  {
    name: "Free",
    price: "$0 / month",
    description:
      "Get integrated in minutes. Full security pipeline, no credit card required. For developers building and testing.",
    bullets: [
      "1,000 requests per month",
      "Intent classification + PII detection",
      "ABAC policy engine — block, allow, minimize, sanitize",
      "Tamper-evident audit log",
      "API keys issued instantly on signup",
    ],
  },
  {
    name: "Growth",
    price: "$99 / month",
    description:
      "For AI agent builders shipping to production. Full pipeline, federated learning, and dashboard included.",
    bullets: [
      "50,000 requests per month",
      "Everything in Free",
      "Federated learning — cross-tenant threat intelligence",
      "Security dashboard for your end clients",
      "Email support",
    ],
  },
  {
    name: "Scale",
    price: "$499 / month",
    description:
      "High-volume deployments with advanced policy control and priority support.",
    bullets: [
      "500,000 requests per month",
      "Everything in Growth",
      "Custom policy rules per agent and actor",
      "Webhook alerts + incident feed",
      "Priority support with SLA",
    ],
  },
  {
    name: "Enterprise",
    price: "Contact us",
    description:
      "Unlimited volume, dedicated infrastructure, compliance exports, and hands-on onboarding for regulated industries.",
    bullets: [
      "Unlimited requests",
      "Everything in Scale",
      "Data Processing Agreement (DPA)",
      "Custom FL model per sector",
      "Dedicated support and policy onboarding",
      "GDPR / HIPAA / SOX audit exports",
    ],
  },
];

export const trustPrinciples = [
  {
    title: "Control",
    body: "Access is enforced at three dimensions — who you are, what domain you operate in, and what action tier you are requesting. No trust is assumed.",
    icon: Key,
  },
  {
    title: "Detect",
    body: "Transformer-based NER, FL-promoted patterns, and multilingual attack signatures catch sensitive data and injection attempts that rule-based tools miss.",
    icon: FileSearch,
  },
  {
    title: "Transform",
    body: "Only minimum-viable context crosses the model boundary. Named entities are replaced, strategy is stripped, and the task value is preserved.",
    icon: Blocks,
  },
  {
    title: "Guard",
    body: "Every model response, tool output, and agent step is inspected before it reaches people or downstream systems. Leakage is blocked at the exit.",
    icon: LockKeyhole,
  },
  {
    title: "Govern",
    body: "Agent tool calls are authorized against action-tier ceilings and resource policies. Sensitive operations require human approval before execution.",
    icon: Workflow,
  },
  {
    title: "Learn",
    body: "Privacy intelligence improves across tenants through federated learning with HMAC-signed updates and differential privacy aggregation. No raw data leaves any node.",
    icon: FlaskConical,
  },
];

export const architectureLayers = [
  "User apps, copilots, and AI agents",
  "Identity + Universal Role Engine (role × domain × action tier)",
  "Detection pipeline, policy engine, sanitization, and output guard",
  "Agent runtime, tool governance, and memory protection",
  "LLM connectors, audit traces, and FL with differential privacy",
];

export const homepageUseCases = [
  { label: "Procurement", icon: Building2 },
  { label: "HR", icon: Users },
  { label: "Legal", icon: Landmark },
  { label: "Sales", icon: Briefcase },
  { label: "R&D", icon: Bot },
];

export const requestTimeline = [
  {
    title: "Identity verified",
    body: "JWT decoded. Role, domain access, and action-tier ceiling checked against the Universal Role Engine. Unauthorized requests are rejected before any processing begins.",
  },
  {
    title: "Threat and entity detection",
    body: "A fine-tuned intent classifier scans for sensitive entities. Multilingual injection and jailbreak patterns (EN/FR/ES/DE) are checked. FL-promoted patterns add tenant-learned signals.",
  },
  {
    title: "Policy decision",
    body: "Action intent is classified on a 6-tier scale (summarize → bulk). The policy engine applies per-org rules and selects: allow, sanitize, minimize, local-only, or block.",
  },
  {
    title: "Prompt transformed and model called",
    body: "Named entities are replaced, context is minimized, and only the safe outbound prompt reaches the selected LLM. Blocked requests stop here.",
  },
  {
    title: "Output guarded and intelligence recorded",
    body: "Model response is scanned for leakage before delivery. Audit events are written. Qualified patterns enter the FL candidate pool for HMAC-signed aggregation.",
  },
];

export const footerColumns = [
  {
    title: "Platform",
    links: [
      { href: "/product", label: "Product Overview" },
      { href: "/developers", label: "Developer Docs" },
      { href: "/live-demo", label: "Live Demo" },
      { href: "/client-dashboard", label: "Dashboard" },
      { href: "/request-trace", label: "Request Trace" },
    ],
  },
  {
    title: "Intelligence",
    links: [
      { href: "/fl-intelligence", label: "FL Intelligence" },
      { href: "/pattern-repository", label: "Pattern Repository" },
      { href: "/alerts", label: "Alerts & Incidents" },
      { href: "/policy-studio", label: "Policy Studio" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/pricing", label: "Pricing" },
      { href: "/trust", label: "About / Trust" },
      { href: "/use-cases", label: "Use Cases" },
    ],
  },
];
