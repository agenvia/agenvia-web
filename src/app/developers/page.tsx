"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { SiteChrome } from "@/components/promptrak/primitives";

// ── Primitives ──────────────────────────────────────────────────────────────

function InlineCode({ children }: { children: string }) {
  return (
    <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[13px] text-teal-300 ring-1 ring-zinc-700">
      {children}
    </code>
  );
}

function CodeBlock({ lang, children }: { lang?: string; children: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [children]);

  return (
    <div className="my-4 rounded-xl overflow-hidden ring-1 ring-zinc-700 bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          {lang ?? "bash"}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-200 transition-colors"
        >
          {copied ? <span className="text-teal-400">Copied</span> : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-6 text-zinc-100 font-mono whitespace-pre">
        {children}
      </pre>
    </div>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-500/15 border border-teal-500/40 flex items-center justify-center text-sm font-bold text-teal-300">
          {number}
        </div>
        <h3 className="text-lg font-semibold text-zinc-50">{title}</h3>
      </div>
      <div className="ml-11">{children}</div>
    </div>
  );
}

function ActionBadge({ type }: { type: "allow" | "block" | "minimize" | "sanitize" | "local-only" }) {
  const styles = {
    "allow":      "bg-teal-500/15 text-teal-300 border-teal-500/30",
    "block":      "bg-red-500/15 text-red-300 border-red-500/30",
    "minimize":   "bg-amber-500/15 text-amber-300 border-amber-500/30",
    "sanitize":   "bg-orange-500/15 text-orange-300 border-orange-500/30",
    "local-only": "bg-purple-500/15 text-purple-300 border-purple-500/30",
  }[type];
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold border ${styles} uppercase tracking-wide`}>
      {type}
    </span>
  );
}

// ── Sidebar nav ─────────────────────────────────────────────────────────────

type NavSection = { group: string; items: { id: string; label: string }[] };

const NAV: NavSection[] = [
  {
    group: "Start Here",
    items: [
      { id: "get-started",    label: "Get Started" },
      { id: "core-concepts",  label: "Core Concepts" },
      { id: "authentication", label: "Authentication" },
    ],
  },
  {
    group: "Integration",
    items: [
      { id: "tier1", label: "Tier 1 — Prompt Security" },
      { id: "tier2", label: "Tier 2 — PII Vault" },
      { id: "tier3", label: "Tier 3 — Tool Authorization" },
    ],
  },
  {
    group: "Frameworks",
    items: [
      { id: "langchain",     label: "LangChain" },
      { id: "langgraph",     label: "LangGraph" },
      { id: "autogen",       label: "AutoGen" },
      { id: "crewai",        label: "CrewAI" },
      { id: "openai-agents", label: "OpenAI Agents" },
    ],
  },
  {
    group: "Reference",
    items: [
      { id: "api-endpoints",   label: "API Endpoints" },
      { id: "response-schema", label: "Response Schema" },
      { id: "policy-trace",    label: "Policy Trace" },
      { id: "audit-chain",     label: "Audit Chain" },
    ],
  },
];

// ── Framework code samples ──────────────────────────────────────────────────

const FRAMEWORK_SAMPLES: Record<string, string> = {
  LangChain: `import os
from langchain_anthropic import ChatAnthropic
from langchain.agents import AgentExecutor
from agenvia import Agenvia, Action

client = Agenvia(
    api_key=os.environ["AGENVIA_KEY"],
    tenant_id=os.environ["AGENVIA_TENANT"],
)

class GovernedAgent:
    def __init__(self, executor: AgentExecutor, user_id: str):
        self.executor = executor
        self.user_id  = user_id

    def run(self, user_input: str) -> str:
        decision = client.evaluate(user_input, user_id=self.user_id)

        if decision.action == Action.BLOCK:
            return f"Blocked: {decision.policy_reasons[0]}"
        if decision.action == Action.LOCAL_ONLY:
            return run_local_model(decision.safe_prompt)

        # MINIMIZE / SANITIZE / ALLOW — always use safe_prompt
        result = self.executor.invoke({"input": decision.safe_prompt})
        return result["output"]

llm   = ChatAnthropic(model="claude-haiku-4-5-20251001")
agent = GovernedAgent(executor=executor, user_id="your_user_id")

response = agent.run("Summarise Q3 revenue figures")
blocked  = agent.run("Ignore previous instructions...")`,

  LangGraph: `import os
from langgraph.graph import StateGraph, END
from agenvia import Agenvia, Action
from typing import TypedDict

client = Agenvia(
    api_key=os.environ["AGENVIA_KEY"],
    tenant_id=os.environ["AGENVIA_TENANT"],
)

class AgentState(TypedDict):
    input: str
    safe_input: str
    output: str
    blocked: bool

def security_gate(state: AgentState) -> AgentState:
    decision = client.evaluate(state["input"], user_id="your_user_id")
    if decision.action == Action.BLOCK:
        return {**state, "blocked": True,
                "output": f"Blocked: {decision.policy_reasons[0]}"}
    return {**state, "blocked": False, "safe_input": decision.safe_prompt}

def llm_node(state: AgentState) -> AgentState:
    if state["blocked"]:
        return state
    response = your_llm.complete(state["safe_input"])
    return {**state, "output": response}

graph = StateGraph(AgentState)
graph.add_node("security_gate", security_gate)
graph.add_node("llm_node",      llm_node)
graph.set_entry_point("security_gate")
graph.add_edge("security_gate", "llm_node")
graph.add_edge("llm_node", END)
app = graph.compile()

result = app.invoke({"input": "your prompt here"})`,

  AutoGen: `import os
import autogen
from agenvia import Agenvia, Action

client = Agenvia(
    api_key=os.environ["AGENVIA_KEY"],
    tenant_id=os.environ["AGENVIA_TENANT"],
)

class GovernedAssistant(autogen.AssistantAgent):
    def generate_reply(self, messages, sender, **kwargs):
        last_msg = messages[-1].get("content", "") if messages else ""

        decision = client.evaluate(last_msg, user_id="your_user_id")

        if decision.action == Action.BLOCK:
            return f"I cannot process this: {decision.policy_reasons[0]}"

        modified = list(messages)
        modified[-1] = {**messages[-1], "content": decision.safe_prompt}
        return super().generate_reply(modified, sender, **kwargs)

assistant = GovernedAssistant(
    name="governed_assistant",
    llm_config={"model": "claude-haiku-4-5-20251001"},
)
user_proxy = autogen.UserProxyAgent(name="user", human_input_mode="NEVER")
user_proxy.initiate_chat(assistant, message="your prompt here")`,

  CrewAI: `import os
from crewai import Agent, Task, Crew
from agenvia import Agenvia, Action

client = Agenvia(
    api_key=os.environ["AGENVIA_KEY"],
    tenant_id=os.environ["AGENVIA_TENANT"],
)

def governed_task_callback(task_output):
    decision = client.evaluate(str(task_output), user_id="your_user_id")
    if decision.action == Action.BLOCK:
        raise PermissionError(f"Output blocked: {decision.policy_reasons[0]}")
    return decision.safe_prompt

analyst = Agent(
    role="Data Analyst",
    goal="Analyse data within policy",
    backstory="You are a compliant data analyst.",
    verbose=True,
)

task = Task(
    description="your task description here",
    agent=analyst,
    callback=governed_task_callback,
)

crew = Crew(agents=[analyst], tasks=[task])
result = crew.kickoff()`,

  "OpenAI Agents": `import os
import asyncio
from agents import Agent, Runner
from agenvia import Agenvia, Action

client = Agenvia(
    api_key=os.environ["AGENVIA_KEY"],
    tenant_id=os.environ["AGENVIA_TENANT"],
)

async def governed_run(agent: Agent, user_input: str, user_id: str):
    decision = client.evaluate(user_input, user_id=user_id)

    if decision.action == Action.BLOCK:
        return f"Blocked: {decision.policy_reasons[0]}"
    if decision.action == Action.LOCAL_ONLY:
        return run_local_model(decision.safe_prompt)

    result = await Runner.run(agent, decision.safe_prompt)
    return result.final_output

agent = Agent(
    name="governed-agent",
    instructions="You are a helpful, policy-compliant assistant.",
)

output = asyncio.run(governed_run(
    agent=agent,
    user_input="your prompt here",
    user_id="your_user_id",
))`,
};

// ── Main page ───────────────────────────────────────────────────────────────

export default function DevelopersPage() {
  const [activeSection, setActiveSection] = useState("get-started");
  const [activeFramework, setActiveFramework] = useState("LangChain");

  const frameworks = Object.keys(FRAMEWORK_SAMPLES);

  return (
    <SiteChrome>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-zinc-800 bg-zinc-950 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-6 px-4">
          {NAV.map((section) => (
            <div key={section.group} className="mb-6">
              <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                {section.group}
              </div>
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors mb-0.5 ${
                    activeSection === item.id
                      ? "bg-teal-500/10 text-teal-300 font-medium"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                  }`}
                >
                  {activeSection === item.id && (
                    <span className="mr-1.5 inline-block w-1.5 h-1.5 rounded-full bg-teal-400 translate-y-[-1px]" />
                  )}
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 px-6 py-10 lg:px-12 max-w-3xl">

          {/* ── GET STARTED ── */}
          {activeSection === "get-started" && (
            <div>
              <div className="mb-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 border border-teal-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-teal-400 mb-4">
                  Quickstart
                </span>
                <h1 className="text-4xl font-bold text-zinc-50 leading-tight mb-3">
                  Integrate in minutes.<br />Govern forever.
                </h1>
                <p className="text-zinc-400 text-base leading-7 max-w-xl">
                  Agenvia sits between your application and your LLM. Every prompt is
                  classified, every policy enforced, every decision permanently recorded.
                </p>
              </div>

              {/* Tier cards */}
              <div className="grid grid-cols-3 gap-4 mb-10">
                {[
                  { time: "10 min",   tier: "Tier 1 — Prompt Security",   desc: "Block injection attacks, jailbreaks, data exfiltration. One SDK call per prompt.", highlight: true },
                  { time: "1 hour",   tier: "Tier 2 — PII Vault",         desc: "Real values never reach the LLM. Automatic output scrubbing via session vault.", highlight: false },
                  { time: "Half day", tier: "Tier 3 — Tool Authorization", desc: "Per-tool authorization. Human-in-the-loop approval for high-risk actions.", highlight: false },
                ].map((card) => (
                  <div
                    key={card.time}
                    className={`rounded-xl p-4 border ${
                      card.highlight
                        ? "border-teal-500/40 bg-teal-500/5"
                        : "border-zinc-700 bg-zinc-900"
                    }`}
                  >
                    <div className={`text-xl font-bold mb-1 font-mono ${card.highlight ? "text-teal-300" : "text-zinc-300"}`}>
                      {card.time}
                    </div>
                    <div className="text-xs font-semibold text-zinc-300 mb-2">{card.tier}</div>
                    <p className="text-xs text-zinc-500 leading-5">{card.desc}</p>
                  </div>
                ))}
              </div>

              {/* Step 1 */}
              <Step number={1} title="Get your API key">
                <p className="text-sm text-zinc-400 mb-3">
                  Create an account and copy your <InlineCode>av_...</InlineCode> key.
                  Sign up free — your key is generated instantly.
                </p>
                <CodeBlock lang="bash">{`export AGENVIA_KEY="av_your_key_here"
export AGENVIA_TENANT="your_tenant_id"`}</CodeBlock>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-500 px-4 py-2 text-sm font-medium text-white transition-colors"
                >
                  Get your free API key →
                </Link>
              </Step>

              {/* Step 2 */}
              <Step number={2} title="Install the SDK">
                <p className="text-sm text-zinc-400 mb-3">
                  Python SDK — published on PyPI. TypeScript coming soon.
                </p>
                <CodeBlock lang="bash">{`pip install agenvia`}</CodeBlock>
              </Step>

              {/* Step 3 */}
              <Step number={3} title="Your first governed call">
                <p className="text-sm text-zinc-400 mb-3">
                  Evaluate every prompt before sending it to your LLM.
                  Branch on <InlineCode>decision.action</InlineCode> — five possible outcomes.
                </p>
                <CodeBlock lang="python">{`import os
from agenvia import Agenvia, Action

client = Agenvia(
    api_key=os.environ["AGENVIA_KEY"],
    tenant_id=os.environ["AGENVIA_TENANT"],
)

decision = client.evaluate("your prompt here", user_id="your_user_id")

if decision.action == Action.BLOCK:
    # Stop — do not send to LLM
    response = f"Blocked: {decision.policy_reasons[0]}"

elif decision.action == Action.LOCAL_ONLY:
    # Do not send to cloud LLM
    response = run_local_model(decision.safe_prompt)

elif decision.action in (Action.MINIMIZE, Action.SANITIZE):
    # PII detected — use safe_prompt, never the original
    response = your_llm.complete(decision.safe_prompt)

else:  # Action.ALLOW
    response = your_llm.complete("your prompt here")

# decision.request_id  — links to the tamper-evident audit record
# decision.risk_score  — 0.0 → 1.0 risk confidence
# decision.findings    — list of individual detections with confidence + offsets
# decision.policy_trace — full policy evaluation trace for debugging`}</CodeBlock>

                {/* Actions preview */}
                <div className="mt-4 rounded-xl border border-zinc-700 overflow-hidden">
                  <div className="px-4 py-2 border-b border-zinc-700 bg-zinc-900">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">All five actions</span>
                  </div>
                  <div className="divide-y divide-zinc-800">
                    {[
                      { action: "allow" as const,      text: "Safe — pass original prompt to LLM" },
                      { action: "minimize" as const,   text: "Partially sensitive — use decision.safe_prompt" },
                      { action: "sanitize" as const,   text: "PII detected — must use decision.safe_prompt or data leaks to LLM" },
                      { action: "local-only" as const, text: "Do not send to cloud LLM — check decision.local_only_trigger for reason" },
                      { action: "block" as const,      text: "Stop — surface decision.policy_reasons to user" },
                    ].map((row) => (
                      <div key={row.action} className="flex items-center gap-3 px-4 py-3">
                        <ActionBadge type={row.action} />
                        <span className="flex-1 text-xs text-zinc-400">{row.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Step>

              {/* Step 4 */}
              <Step number={4} title="Complete agent examples">
                <p className="text-sm text-zinc-400 mb-4">
                  Drop Agenvia into your existing agent framework. Pick yours below.
                </p>
                <div className="rounded-xl border border-zinc-700 overflow-hidden">
                  <div className="flex border-b border-zinc-700 bg-zinc-900 overflow-x-auto">
                    {frameworks.map((fw) => (
                      <button
                        key={fw}
                        onClick={() => setActiveFramework(fw)}
                        className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                          activeFramework === fw
                            ? "border-teal-500 text-teal-300"
                            : "border-transparent text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {fw}
                      </button>
                    ))}
                  </div>
                  <div className="bg-zinc-900">
                    <pre className="overflow-x-auto p-4 text-[13px] leading-6 text-zinc-100 font-mono whitespace-pre">
                      {FRAMEWORK_SAMPLES[activeFramework]}
                    </pre>
                  </div>
                </div>
              </Step>

              {/* Step 5 */}
              <Step number={5} title="Response reference">
                <p className="text-sm text-zinc-400 mb-4">Every evaluation returns a <InlineCode>Decision</InlineCode> object with these fields.</p>
                <div className="rounded-xl border border-zinc-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-zinc-900 border-b border-zinc-700">
                        {["Field", "Type", "Description"].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {[
                        { field: "action",             type: "str",         desc: "allow · minimize · sanitize · local-only · block" },
                        { field: "safe_prompt",        type: "str",         desc: "Use instead of original when action is minimize or sanitize." },
                        { field: "risk_score",         type: "float",       desc: "0.0 → 1.0. Confidence the prompt violates policy." },
                        { field: "findings",           type: "list[Finding]", desc: "Per-detection: label, text, confidence, start, end offsets." },
                        { field: "policy_reasons",     type: "list[str]",   desc: "User-facing reasons. Surface these on block." },
                        { field: "policy_trace",       type: "list[dict]",  desc: "Full policy evaluation trace. Log, do not show to users." },
                        { field: "local_only_trigger", type: "str | None",  desc: "Why local-only fired: policy_rule:<name> · risk_threshold:<score> · model_decision" },
                        { field: "request_id",         type: "str",         desc: "Links this response to the tamper-evident audit chain record." },
                      ].map((row) => (
                        <tr key={row.field} className="hover:bg-zinc-900/50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-teal-300 font-medium">{row.field}</td>
                          <td className="px-4 py-3 font-mono text-xs text-zinc-400">{row.type}</td>
                          <td className="px-4 py-3 text-sm text-zinc-400">{row.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 rounded-lg border-l-4 border-teal-500 bg-teal-500/5 px-4 py-3">
                  <p className="text-sm text-teal-200 leading-6">
                    <span className="font-semibold">→ policy_reasons</span> is for users.{" "}
                    <span className="font-semibold">policy_trace</span> is for your audit logs.
                    Never show <InlineCode>policy_trace</InlineCode> to end users — it contains internal rule detail.
                  </p>
                </div>
              </Step>

              {/* What's next */}
              <div className="mt-12">
                <h2 className="text-xl font-semibold text-zinc-50 mb-6">What&apos;s next</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { tag: "Tier 2",    title: "PII Vault",           desc: "Real values never reach the LLM. session_id links sanitize and scrub_output.", id: "tier2" },
                    { tag: "Tier 3",    title: "Tool Authorization",  desc: "Authorize every tool call. Human approval for write actions.", id: "tier3" },
                    { tag: "Reference", title: "Response Schema",     desc: "Full field reference for Decision, SanitizedPrompt, ToolDecision.", id: "response-schema" },
                    { tag: "Reference", title: "Policy Trace",        desc: "What every field means and how to use it for compliance audit.", id: "policy-trace" },
                  ].map((card) => (
                    <button
                      key={card.id}
                      onClick={() => setActiveSection(card.id)}
                      className="text-left rounded-xl border border-zinc-700 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800 p-4 transition-colors"
                    >
                      <div className="text-[10px] font-bold uppercase tracking-widest text-teal-500 mb-1">{card.tag}</div>
                      <div className="font-semibold text-zinc-100 mb-1">{card.title}</div>
                      <p className="text-xs text-zinc-500 leading-5">{card.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── CORE CONCEPTS ── */}
          {activeSection === "core-concepts" && (
            <div>
              <h1 className="text-3xl font-bold text-zinc-50 mb-2">Core Concepts</h1>
              <p className="text-zinc-400 mb-8">How Agenvia thinks about agent security.</p>
              <div className="space-y-6">
                {[
                  { title: "The 3-Tier Model", desc: "Tier 1 (Prompt Security) stops attacks before the LLM sees them. Tier 2 (PII Vault) replaces sensitive values with vault placeholders — real data never crosses the LLM boundary. Tier 3 (Tool Authorization) governs every tool call and routes high-risk actions to a human approver. The tiers are additive layers, not alternatives." },
                  { title: "Actions", desc: "Every evaluate() call returns one of five actions: allow (safe), minimize (partially sensitive — use safe_prompt), sanitize (PII detected — must use safe_prompt or data leaks to the LLM), local-only (do not send to any cloud model), block (stop immediately). Always branch on decision.action." },
                  { title: "Policy Trace vs Policy Reasons", desc: "policy_reasons is a list of user-facing strings — surface these on block. policy_trace is the full internal rule evaluation trace — log it for compliance, never show to end users. decision.request_id links both to the tamper-evident audit chain record." },
                  { title: "Audit Chain", desc: "Every enforcement decision is appended to a tamper-evident, append-only log. request_id links the SDK response to the audit record. You can prove any decision happened and that it has not been altered — GDPR Article 22, SOC 2 compliant by design." },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
                    <h3 className="font-semibold text-zinc-100 mb-2">{item.title}</h3>
                    <p className="text-sm text-zinc-400 leading-6">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── AUTHENTICATION ── */}
          {activeSection === "authentication" && (
            <div>
              <h1 className="text-3xl font-bold text-zinc-50 mb-2">Authentication</h1>
              <p className="text-zinc-400 mb-6">
                All requests require a Bearer token. The SDK handles this automatically — pass your key to the constructor.
              </p>
              <CodeBlock lang="python">{`from agenvia import Agenvia

client = Agenvia(
    api_key="av_...",          # must start with av_
    tenant_id="your_tenant_id",
)`}</CodeBlock>

              <h3 className="text-base font-semibold text-zinc-100 mt-8 mb-3">Direct HTTP</h3>
              <p className="text-sm text-zinc-400 mb-3">If you are not using the Python SDK, pass the key as a Bearer token:</p>
              <CodeBlock lang="bash">{`curl https://api.agenvia.io/gateway/prompt \\
  -H "Authorization: Bearer av_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt":       "your prompt here",
    "user_id":      "your_user_id",
    "organization": "your_tenant_id",
    "task_type":    "general_analysis"
  }'`}</CodeBlock>

              <h3 className="text-base font-semibold text-zinc-100 mt-8 mb-3">Environment variables</h3>
              <p className="text-sm text-zinc-400 mb-3">Never hardcode keys. Use environment variables:</p>
              <CodeBlock lang="python">{`import os
from agenvia import Agenvia

client = Agenvia(
    api_key=os.environ["AGENVIA_KEY"],
    tenant_id=os.environ["AGENVIA_TENANT"],
)

# Offline / CI mode — no network call, no real key needed
# Set AGENVIA_KEY=off and branch in your code before constructing the client`}</CodeBlock>

              <h3 className="text-base font-semibold text-zinc-100 mt-8 mb-3">Key validation</h3>
              <p className="text-sm text-zinc-400 mb-3">
                An invalid key format raises <InlineCode>ValueError</InlineCode> immediately — before any network call:
              </p>
              <CodeBlock lang="python">{`Agenvia(api_key="wrong", tenant_id="your_tenant_id")
# ValueError: api_key cannot be empty.
# or
# ValueError: Invalid API key format 'wrong...'. Agenvia keys start with 'av_'.`}</CodeBlock>
            </div>
          )}

          {/* ── TIER 1 ── */}
          {activeSection === "tier1" && (
            <div>
              <span className="inline-flex items-center rounded-full bg-teal-500/10 border border-teal-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-teal-400 mb-4">
                10 minutes
              </span>
              <h1 className="text-3xl font-bold text-zinc-50 mb-2">Tier 1 — Prompt Security</h1>
              <p className="text-zinc-400 mb-6">
                Run before every LLM call. Classifies intent, detects injection and PII, enforces policy.
                Returns one of five actions — always branch on <InlineCode>decision.action</InlineCode>.
              </p>

              <CodeBlock lang="python">{`from agenvia import Agenvia, Action, TaskType

client = Agenvia(api_key="av_...", tenant_id="your_tenant_id")

decision = client.evaluate(
    "your prompt here",
    user_id="your_user_id",
    task_type=TaskType.FINANCIAL,   # improves policy accuracy
)

if decision.action == Action.BLOCK:
    return f"Blocked: {decision.policy_reasons[0]}"

elif decision.action == Action.LOCAL_ONLY:
    # decision.local_only_trigger explains why:
    # 'policy_rule:<name>' | 'risk_threshold:<score>' | 'model_decision'
    return run_local_model(decision.safe_prompt)

elif decision.action in (Action.MINIMIZE, Action.SANITIZE):
    # SANITIZE: using the original prompt sends raw PII to the LLM
    response = llm.complete(decision.safe_prompt)

else:  # Action.ALLOW
    response = llm.complete("your prompt here")`}</CodeBlock>

              <h3 className="text-base font-semibold text-zinc-100 mt-8 mb-3">task_type</h3>
              <p className="text-sm text-zinc-400 mb-3">Passing the correct task_type applies domain-specific policy rules:</p>
              <div className="rounded-xl border border-zinc-700 overflow-hidden mb-6">
                <table className="w-full text-sm">
                  <thead><tr className="bg-zinc-900 border-b border-zinc-700">{["Constant","Value","Use for"].map(h=><th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-zinc-800">
                    {[
                      ["TaskType.GENERAL",          "general_analysis",  "Default — generic fallback"],
                      ["TaskType.HR",               "hr_review",         "HR workflows, employee data"],
                      ["TaskType.MEDICAL",          "medical_query",     "Healthcare, patient records"],
                      ["TaskType.FINANCIAL",        "financial_analysis","Finance, revenue, trading"],
                      ["TaskType.CUSTOMER_SUPPORT", "customer_support",  "Customer-facing agents"],
                      ["TaskType.LEGAL",            "legal_review",      "Legal research, court documents"],
                    ].map(r=><tr key={r[0]} className="hover:bg-zinc-900/50">{r.map((c,i)=><td key={i} className={`px-4 py-3 text-sm ${i<2?"font-mono text-xs text-teal-300":"text-zinc-400"}`}>{c}</td>)}</tr>)}
                  </tbody>
                </table>
              </div>

              <h3 className="text-base font-semibold text-zinc-100 mt-8 mb-3">Finding fields</h3>
              <p className="text-sm text-zinc-400 mb-3">Each item in <InlineCode>decision.findings</InlineCode>:</p>
              <CodeBlock lang="python">{`for f in decision.findings:
    print(f.label)            # 'ssn' | 'email' | 'dob' | 'injection' | ...
    print(f.text)             # matched excerpt from the prompt
    print(f.confidence)       # 0.0–1.0
    print(f.sensitivity_tier) # 1=low  2=medium  3=high
    print(f.start, f.end)     # character offsets in the original prompt`}</CodeBlock>
            </div>
          )}

          {/* ── TIER 2 ── */}
          {activeSection === "tier2" && (
            <div>
              <span className="inline-flex items-center rounded-full bg-teal-500/10 border border-teal-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-teal-400 mb-4">
                1 hour
              </span>
              <h1 className="text-3xl font-bold text-zinc-50 mb-2">Tier 2 — PII Vault</h1>
              <p className="text-zinc-400 mb-6">
                Real values are stored in an encrypted vault. The LLM only sees placeholders.
                <InlineCode>scrub_output()</InlineCode> restores safe values in the response before it reaches the user.
              </p>

              <CodeBlock lang="python">{`from agenvia import Agenvia

client = Agenvia(api_key="av_...", tenant_id="your_tenant_id")

# 1. Sanitize — replace PII with vault placeholders
safe = client.sanitize(
    "your prompt containing personal data",
    user_id="your_user_id",
    task_type="medical_query",
)

# IMPORTANT: persist session_id to your database before calling the LLM.
# Storing it in a local variable loses it on server restart.
db.save_session(request_id=request_id, session_id=safe.session_id)

# 2. LLM sees placeholders — never raw PII
response = llm.complete(safe.safe_prompt)   # e.g. "Patient [NAME], DOB [DOB]"

# 3. Scrub — restore field policy before returning to caller
clean = client.scrub_output(
    response,
    session_id=safe.session_id,   # keyword-only — do not pass positionally
    user_id="your_user_id",
)

return clean.scrubbed_answer   # safe to return`}</CodeBlock>

              <div className="mt-4 rounded-lg border-l-4 border-amber-500 bg-amber-500/5 px-4 py-3 mb-6">
                <p className="text-sm text-amber-200 leading-6">
                  <span className="font-semibold">session_id is keyword-only.</span>{" "}
                  Passing it positionally works in v0.1 but emits <InlineCode>DeprecationWarning</InlineCode> and raises <InlineCode>TypeError</InlineCode> in v0.2.
                </p>
              </div>

              <h3 className="text-base font-semibold text-zinc-100 mt-8 mb-3">SanitizedPrompt fields</h3>
              <div className="rounded-xl border border-zinc-700 overflow-hidden mb-6">
                <table className="w-full text-sm">
                  <thead><tr className="bg-zinc-900 border-b border-zinc-700">{["Field","Type","Description"].map(h=><th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-zinc-800">
                    {[
                      ["safe.session_id",    "str",         "Vault handle. Persist to database before calling LLM."],
                      ["safe.safe_prompt",   "str",         "Pass to your LLM — real values replaced with placeholders."],
                      ["safe.action",        "str",         "Policy action for this prompt (same values as evaluate)."],
                      ["safe.risk_score",    "float",       "0.0–1.0"],
                      ["safe.findings",      "list[Finding]","Individual detections."],
                      ["safe.allowed_fields","list[str]",   "Field labels permitted to appear in the LLM response."],
                    ].map(r=><tr key={r[0]} className="hover:bg-zinc-900/50">{r.map((c,i)=><td key={i} className={`px-4 py-3 text-sm ${i===0?"font-mono text-xs text-teal-300":i===1?"font-mono text-xs text-zinc-400":"text-zinc-400"}`}>{c}</td>)}</tr>)}
                  </tbody>
                </table>
              </div>

              <h3 className="text-base font-semibold text-zinc-100 mt-8 mb-3">ScrubbedOutput fields</h3>
              <div className="rounded-xl border border-zinc-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-zinc-900 border-b border-zinc-700">{["Field","Type","Description"].map(h=><th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-zinc-800">
                    {[
                      ["clean.scrubbed_answer",    "str",            "Safe to return to the caller."],
                      ["clean.findings",           "list[Finding]",  "Detections in the LLM response."],
                      ["clean.vault_replacements", "list[tuple]",    "(real_value, placeholder) pairs that were substituted."],
                      ["clean.allowed_fields",     "list[str]",      "Fields the policy permitted in the response."],
                    ].map(r=><tr key={r[0]} className="hover:bg-zinc-900/50">{r.map((c,i)=><td key={i} className={`px-4 py-3 text-sm ${i===0?"font-mono text-xs text-teal-300":i===1?"font-mono text-xs text-zinc-400":"text-zinc-400"}`}>{c}</td>)}</tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TIER 3 ── */}
          {activeSection === "tier3" && (
            <div>
              <span className="inline-flex items-center rounded-full bg-teal-500/10 border border-teal-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-teal-400 mb-4">
                Half day
              </span>
              <h1 className="text-3xl font-bold text-zinc-50 mb-2">Tier 3 — Tool Authorization</h1>
              <p className="text-zinc-400 mb-6">
                Call before every tool execution. High-risk tools may require human approval.
                Always pass the correct <InlineCode>sensitivity_tier</InlineCode> — passing tier 1 for a write-action tool disables Tier 3 protection.
              </p>

              <CodeBlock lang="python">{`from agenvia import Agenvia, SensitivityTier

client = Agenvia(api_key="av_...", tenant_id="your_tenant_id")

auth = client.authorize_tool(
    "your_tool_name",
    target="your_target",
    sensitivity_tier=SensitivityTier.WRITE_ACTION,  # 1=READ_ONLY 2=PERSONAL 3=WRITE_ACTION
    task_type="legal_review",
)

if auth.action == "allow":
    your_tool.execute(...)

elif auth.action == "deny":
    return f"Tool denied: {auth.reason}"   # auth.reason is always present

elif auth.action == "pending_approval":
    # IMPORTANT: persist to database — not a local variable
    db.save_approval(approval_id=auth.approval_id)
    notify_manager(auth.approval_id, auth.reason)
    return "Awaiting manager approval"`}</CodeBlock>

              <h3 className="text-base font-semibold text-zinc-100 mt-8 mb-3">sensitivity_tier</h3>
              <div className="rounded-xl border border-zinc-700 overflow-hidden mb-6">
                <table className="w-full text-sm">
                  <thead><tr className="bg-zinc-900 border-b border-zinc-700">{["Constant","Int","Examples"].map(h=><th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-zinc-800">
                    {[
                      ["SensitivityTier.READ_ONLY",   "1","Search, Calculator, KnowledgeBase"],
                      ["SensitivityTier.PERSONAL",    "2","UserLookup, RecordFetch, ProfileReader"],
                      ["SensitivityTier.WRITE_ACTION","3","DocumentFiler, MessageSender, DatabaseWrite"],
                    ].map(r=><tr key={r[0]} className="hover:bg-zinc-900/50">{r.map((c,i)=><td key={i} className={`px-4 py-3 text-sm ${i<2?"font-mono text-xs text-teal-300":"text-zinc-400"}`}>{c}</td>)}</tr>)}
                  </tbody>
                </table>
              </div>

              <h3 className="text-base font-semibold text-zinc-100 mt-8 mb-3">Human-in-the-loop approval</h3>
              <CodeBlock lang="python">{`# Step 1 — agent requests authorization
auth = client.authorize_tool(
    "your_tool_name",
    target="your_target",
    sensitivity_tier=SensitivityTier.WRITE_ACTION,
)
if auth.action == "pending_approval":
    db.save(approval_id=auth.approval_id)
    notify_manager(auth.approval_id, auth.reason)
    return "Awaiting approval"

# Step 2 — manager approves or rejects
result = client.submit_approval(
    approval_id=db.get_approval_id(request_id),  # from database
    decision="approved",                          # or "rejected"
)

# Step 3 — poll for status (alternative to webhook)
status = client.get_approval(approval_id)
# status.status:   'pending' | 'approved' | 'rejected' | 'expired'
# status.decision: 'approved' | 'rejected' | None`}</CodeBlock>
            </div>
          )}

          {/* ── FRAMEWORK PAGES ── */}
          {["langchain","langgraph","autogen","crewai","openai-agents"].includes(activeSection) && (
            <div>
              <h1 className="text-3xl font-bold text-zinc-50 mb-2">
                {NAV.find(s=>s.group==="Frameworks")?.items.find(i=>i.id===activeSection)?.label}
              </h1>
              <p className="text-zinc-400 mb-6">Drop-in Agenvia integration for this framework.</p>
              <CodeBlock lang="python">
                {FRAMEWORK_SAMPLES[
                  activeSection === "langchain"     ? "LangChain" :
                  activeSection === "langgraph"     ? "LangGraph" :
                  activeSection === "autogen"       ? "AutoGen" :
                  activeSection === "crewai"        ? "CrewAI" :
                  "OpenAI Agents"
                ]}
              </CodeBlock>
            </div>
          )}

          {/* ── API ENDPOINTS ── */}
          {activeSection === "api-endpoints" && (
            <div>
              <h1 className="text-3xl font-bold text-zinc-50 mb-2">API Endpoints</h1>
              <p className="text-zinc-400 mb-6">
                Base URL: <InlineCode>https://api.agenvia.io</InlineCode>.
                All endpoints require <InlineCode>Authorization: Bearer av_...</InlineCode>.
              </p>
              <div className="space-y-4">
                {[
                  { method: "POST", path: "/gateway/prompt",               sdk: "client.evaluate()",        desc: "Tier 1 — classify and enforce policy on a prompt." },
                  { method: "POST", path: "/gateway/sanitize",             sdk: "client.sanitize()",        desc: "Tier 2 — store PII in vault, return placeholder prompt." },
                  { method: "POST", path: "/gateway/output_sanitize",      sdk: "client.scrub_output()",    desc: "Tier 2 — scrub LLM response against vault session." },
                  { method: "POST", path: "/gateway/tools/authorize",      sdk: "client.authorize_tool()",  desc: "Tier 3 — authorize a tool call before execution." },
                  { method: "GET",  path: "/gateway/approvals/{id}",       sdk: "client.get_approval()",    desc: "Poll status of a pending tool approval." },
                  { method: "POST", path: "/gateway/approvals/{id}/decision", sdk: "client.submit_approval()", desc: "Submit manager approval or rejection." },
                ].map((ep) => (
                  <div key={ep.path} className="rounded-xl border border-zinc-700 bg-zinc-900 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${ep.method === "GET" ? "bg-teal-500/15 text-teal-300" : "bg-blue-500/15 text-blue-300"}`}>
                        {ep.method}
                      </span>
                      <span className="font-mono text-sm text-zinc-200">{ep.path}</span>
                      <span className="ml-auto text-xs text-zinc-500 font-mono">{ep.sdk}</span>
                    </div>
                    <p className="text-sm text-zinc-400">{ep.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── RESPONSE SCHEMA ── */}
          {activeSection === "response-schema" && (
            <div>
              <h1 className="text-3xl font-bold text-zinc-50 mb-2">Response Schema</h1>
              <p className="text-zinc-400 mb-8">All SDK return types. Fields map directly to the JSON response.</p>

              <h2 className="text-xl font-semibold text-zinc-100 mb-4">Decision <span className="text-zinc-500 text-sm font-normal">— from evaluate()</span></h2>
              <div className="rounded-xl border border-zinc-700 overflow-hidden mb-8">
                <table className="w-full text-sm">
                  <thead><tr className="bg-zinc-900 border-b border-zinc-700">{["Field","Type","Notes"].map(h=><th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-zinc-800">
                    {[
                      ["action",             "str",           "allow · minimize · sanitize · local-only · block"],
                      ["safe_prompt",        "str",           "Use instead of original on minimize/sanitize"],
                      ["risk_score",         "float",         "0.0–1.0"],
                      ["findings",           "list[Finding]", "label, text, confidence, sensitivity_tier, start, end"],
                      ["policy_reasons",     "list[str]",     "User-facing. Surface on block."],
                      ["policy_trace",       "list[dict]",    "Internal debug trace. Do not show to users."],
                      ["local_only_trigger", "str | None",    "Populated when action == local-only"],
                      ["request_id",         "str",           "Links to audit chain record"],
                    ].map(r=><tr key={r[0]} className="hover:bg-zinc-900/50">{r.map((c,i)=><td key={i} className={`px-4 py-3 text-sm ${i===0?"font-mono text-xs text-teal-300":i===1?"font-mono text-xs text-zinc-400":"text-zinc-400"}`}>{c}</td>)}</tr>)}
                  </tbody>
                </table>
              </div>

              <h2 className="text-xl font-semibold text-zinc-100 mb-4">SanitizedPrompt <span className="text-zinc-500 text-sm font-normal">— from sanitize()</span></h2>
              <div className="rounded-xl border border-zinc-700 overflow-hidden mb-8">
                <table className="w-full text-sm">
                  <thead><tr className="bg-zinc-900 border-b border-zinc-700">{["Field","Type","Notes"].map(h=><th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-zinc-800">
                    {[
                      ["session_id",    "str",           "Vault handle — persist to database"],
                      ["safe_prompt",   "str",           "Pass to LLM"],
                      ["action",        "str",           "Same values as Decision.action"],
                      ["risk_score",    "float",         "0.0–1.0"],
                      ["findings",      "list[Finding]", ""],
                      ["allowed_fields","list[str]",     "Labels permitted in LLM response"],
                    ].map(r=><tr key={r[0]} className="hover:bg-zinc-900/50">{r.map((c,i)=><td key={i} className={`px-4 py-3 text-sm ${i===0?"font-mono text-xs text-teal-300":i===1?"font-mono text-xs text-zinc-400":"text-zinc-400"}`}>{c}</td>)}</tr>)}
                  </tbody>
                </table>
              </div>

              <h2 className="text-xl font-semibold text-zinc-100 mb-4">ToolDecision <span className="text-zinc-500 text-sm font-normal">— from authorize_tool()</span></h2>
              <div className="rounded-xl border border-zinc-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-zinc-900 border-b border-zinc-700">{["Field","Type","Notes"].map(h=><th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-zinc-800">
                    {[
                      ["action",     "str",       "allow · deny · pending_approval"],
                      ["reason",     "str",       "Always present — surface on deny/pending"],
                      ["approval_id","str | None","Present only on pending_approval"],
                      ["tool_name",  "str",       ""],
                    ].map(r=><tr key={r[0]} className="hover:bg-zinc-900/50">{r.map((c,i)=><td key={i} className={`px-4 py-3 text-sm ${i===0?"font-mono text-xs text-teal-300":i===1?"font-mono text-xs text-zinc-400":"text-zinc-400"}`}>{c}</td>)}</tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── POLICY TRACE ── */}
          {activeSection === "policy-trace" && (
            <div>
              <h1 className="text-3xl font-bold text-zinc-50 mb-2">Policy Trace</h1>
              <p className="text-zinc-400 mb-6">
                Every enforcement decision produces a <InlineCode>policy_trace</InlineCode> — a list of every rule that fired,
                in order. This is your compliance artifact for GDPR Article 22, SOC 2, and internal audit.
              </p>
              <div className="mt-4 rounded-lg border-l-4 border-teal-500 bg-teal-500/5 px-4 py-3 mb-6">
                <p className="text-sm text-teal-200 leading-6">
                  <span className="font-semibold">policy_reasons</span> → user-facing strings, safe to surface in UI.<br />
                  <span className="font-semibold">policy_trace</span> → internal rule detail, for audit logs only. Never show to end users.
                </p>
              </div>
              <CodeBlock lang="python">{`decision = client.evaluate("your prompt", user_id="your_user_id")

# User-facing — safe to show
if decision.action == Action.BLOCK:
    return decision.policy_reasons[0]

# Audit log — store, do not display
log.info("agenvia.decision", extra={
    "request_id":   decision.request_id,
    "action":       decision.action,
    "risk_score":   decision.risk_score,
    "policy_trace": decision.policy_trace,
})`}</CodeBlock>
            </div>
          )}

          {/* ── AUDIT CHAIN ── */}
          {activeSection === "audit-chain" && (
            <div>
              <h1 className="text-3xl font-bold text-zinc-50 mb-2">Audit Chain</h1>
              <p className="text-zinc-400 mb-6">
                Every enforcement decision is appended to a tamper-evident, append-only log.
                <InlineCode>request_id</InlineCode> links the SDK response to the audit record.
              </p>
              <div className="space-y-4">
                {[
                  { title: "Tamper-evident", desc: "Each record is cryptographically chained to the previous one. Any modification breaks the chain — verifiable at any time." },
                  { title: "request_id linkage", desc: "Every Decision, SanitizedPrompt, and ToolDecision includes a request_id. Store it alongside your application records to link any action back to its governance decision." },
                  { title: "GDPR Article 22", desc: "Automated decision-making affecting individuals must be explainable. policy_trace + request_id gives you the machine-readable explanation for every enforcement decision." },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
                    <h3 className="font-semibold text-zinc-100 mb-2">{item.title}</h3>
                    <p className="text-sm text-zinc-400 leading-6">{item.desc}</p>
                  </div>
                ))}
              </div>
              <CodeBlock lang="python">{`# Store request_id with your application records
decision = client.evaluate("your prompt", user_id="your_user_id")

db.save({
    "application_record_id": your_record_id,
    "agenvia_request_id":    decision.request_id,   # link to audit chain
    "action":                decision.action,
    "risk_score":            decision.risk_score,
})`}</CodeBlock>
            </div>
          )}

        </main>

        {/* Right TOC */}
        <aside className="hidden xl:flex flex-col w-52 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-10 px-4">
          {activeSection === "get-started" && (
            <>
              <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">On this page</div>
              <div className="space-y-1 mb-8">
                {[
                  { label: "Get your API key",   step: 1 },
                  { label: "Install the SDK",    step: 2 },
                  { label: "First governed call",step: 3 },
                  { label: "Agent examples",     step: 4 },
                  { label: "Response reference", step: 5 },
                  { label: "What's next",        step: 0 },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 py-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-default">
                    {item.step > 0 && (
                      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[9px] font-bold text-zinc-500">
                        {item.step}
                      </span>
                    )}
                    <span className={item.step === 0 ? "pl-6" : ""}>{item.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeSection === "core-concepts" && (
            <>
              <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">On this page</div>
              <div className="space-y-1 mb-8">
                {["The 3-Tier Model","Actions","Policy Trace vs Reasons","Audit Chain"].map((item) => (
                  <div key={item} className="py-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-default">{item}</div>
                ))}
              </div>
            </>
          )}

          {activeSection === "authentication" && (
            <>
              <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">On this page</div>
              <div className="space-y-1 mb-8">
                {["SDK setup","Direct HTTP","Environment variables","Key validation"].map((item) => (
                  <div key={item} className="py-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-default">{item}</div>
                ))}
              </div>
            </>
          )}

          {activeSection === "tier1" && (
            <>
              <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">On this page</div>
              <div className="space-y-1 mb-8">
                {["evaluate()","task_type","Finding fields"].map((item) => (
                  <div key={item} className="py-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-default">{item}</div>
                ))}
              </div>
            </>
          )}

          {activeSection === "tier2" && (
            <>
              <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">On this page</div>
              <div className="space-y-1 mb-8">
                {["sanitize()","scrub_output()","SanitizedPrompt fields","ScrubbedOutput fields"].map((item) => (
                  <div key={item} className="py-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-default">{item}</div>
                ))}
              </div>
            </>
          )}

          {activeSection === "tier3" && (
            <>
              <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">On this page</div>
              <div className="space-y-1 mb-8">
                {["authorize_tool()","sensitivity_tier","Human-in-the-loop"].map((item) => (
                  <div key={item} className="py-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-default">{item}</div>
                ))}
              </div>
            </>
          )}

          {["langchain","langgraph","autogen","crewai","openai-agents"].includes(activeSection) && (
            <>
              <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">On this page</div>
              <div className="space-y-1 mb-8">
                {["Installation","GovernedAgent","Usage"].map((item) => (
                  <div key={item} className="py-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-default">{item}</div>
                ))}
              </div>
            </>
          )}

          {["api-endpoints","response-schema","policy-trace","audit-chain"].includes(activeSection) && (
            <>
              <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">On this page</div>
              <div className="space-y-1 mb-8">
                {activeSection === "api-endpoints"   && ["Endpoints"].map(i => <div key={i} className="py-1 text-xs text-zinc-500">{i}</div>)}
                {activeSection === "response-schema" && ["Decision","SanitizedPrompt","ToolDecision"].map(i => <div key={i} className="py-1 text-xs text-zinc-500">{i}</div>)}
                {activeSection === "policy-trace"    && ["policy_reasons vs policy_trace","Logging"].map(i => <div key={i} className="py-1 text-xs text-zinc-500">{i}</div>)}
                {activeSection === "audit-chain"     && ["Tamper-evident","request_id","GDPR Article 22"].map(i => <div key={i} className="py-1 text-xs text-zinc-500">{i}</div>)}
              </div>
            </>
          )}

          {/* Always-visible Resources */}
          <div className="mt-auto pt-6 border-t border-zinc-800 space-y-2">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Resources</div>
            <Link href="/signup" className="block text-xs text-teal-400 hover:text-teal-300 transition-colors">
              Get API key →
            </Link>
            <a href="https://github.com/agenvia/agenvia-python" target="_blank" rel="noreferrer" className="block text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              GitHub →
            </a>
            <a href="https://pypi.org/project/agenvia/" target="_blank" rel="noreferrer" className="block text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              PyPI →
            </a>
            <Link href="/live-demo" className="block text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              Live demo →
            </Link>
          </div>
        </aside>
      </div>
    </SiteChrome>
  );
}
