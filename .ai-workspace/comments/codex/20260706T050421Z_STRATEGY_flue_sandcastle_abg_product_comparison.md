# Strategy: Flue, Sandcastle, And ABG Product Comparison

Authored: 2026-07-06T05:04:21Z
Author: Codex
Status: Commentary, not ratified specification
Scope: Marketplace positioning for ABG/GTL against Flue and Sandcastle

## Assumptions

This post assumes:

- Flue = `withastro/flue`, the Astro team's open agent framework.
- Sandcastle = `mattpocock/sandcastle`, published as `@ai-hero/sandcastle`.
- ABG/GTL = the current Abiogenesis product line in this repo, active
  TypeScript release line `4.3.0-rc.1`, with T-200/HoG active but not fully
  realized.

If the intended products are different, this comparison should be repriced.

## Executive Read

Flue and Sandcastle are not the same kind of competitor.

Sandcastle is a sharp sandbox/run primitive for AI coding agents. It wins when
the buyer wants to run Claude Code, Codex, or another coding agent in an
isolated worktree, collect commits, and manage branch merge mechanics with
minimal framework overhead.

Flue is a broader agent harness and deployment framework. It wins when the
buyer wants to build durable headless agents in TypeScript with tools, skills,
sandboxes, channels, observability, and deployment targets.

ABG/GTL is a governed semantic runtime for lifecycle construction. It should
not compete by being a nicer `run()` wrapper or another TypeScript agent
harness. Its wedge is: declared programs, typed graph structure, admitted
runtime truth, requirement/proof carry-through, replay, assurance, and closure.
The buyer is not only asking "did an agent run?" but "which obligations were
carried, what proof was admitted, what closed, what remained residual, and can
the run be replayed as product truth?"

The practical market risk is not that Sandcastle or Flue have deeper
governance. They do not appear to. The risk is that their developer experience
and packaging are materially simpler today.

## Product Write-Ups

### Flue

Flue presents itself as an open TypeScript framework for autonomous agents and
AI workflows. The core authoring shape is `defineAgent(...)`: developers
declare a model, tools, skills, sandbox, instructions, and routes. Its public
surface emphasizes durable sessions, recovery, tools, skills, MCP servers,
observability, chat/channel integrations, and deployment to common runtimes
such as Node.js, Cloudflare Workers, GitHub Actions, GitLab CI/CD, Daytona, and
Render.

Flue's product bet is that real agents need a harness, not only an LLM API
call. It packages the execution environment around the agent: session
continuity, tools, skills, filesystem/sandbox access, and production
deployment. That is a strong and legible market position.

Where Flue is strong:

- Productized developer workflow.
- TypeScript-native agent composition.
- Deployment surface and SDK/CLI story.
- Observability integrations.
- Channel integrations.
- Durable/recoverable sessions.

Where Flue is weaker relative to ABG:

- The program is primarily code/harness configuration, not constitutional
  graph language.
- Agent success is not framed around requirement obligation lineage,
  proof-strength admission, residual pressure, or closure law.
- Replay/observability appears session/runtime oriented, not an admitted
  event-sourced truth ledger over product obligations.
- It does not appear to separate deterministic, probabilistic, and human
  regimes as constitutional compute fibres.

Flue is the better near-term agent app framework. ABG's advantage is deeper
semantic governance, if ABG makes the installer, sandbox, and proof UX usable.

### Sandcastle

Sandcastle is a TypeScript library and CLI for orchestrating AI coding agents
in isolated sandboxes. The main authoring surface is `run(...)`, with an agent
provider, sandbox provider, prompt or prompt file, branch strategy, lifecycle
hooks, logging, timeouts, prompt args, iteration limits, and commit collection.
It supports Docker, Podman, Vercel, custom providers, and no-sandbox mode.
The result reports iterations, commits, and branch identity.

Sandcastle's product bet is simple and correct: coding agents need isolated
places to work. It focuses on controlled worktrees, branch strategy, sandbox
provider abstraction, logs, hooks, and merge-back mechanics.

Where Sandcastle is strong:

- Small mental model.
- Strong sandbox/worktree abstraction.
- Provider-agnostic sandboxing.
- Branch and commit workflow.
- Good fit for AFK coding, review pipelines, and parallel agent runs.
- Easy to compose into local scripts and CI.

Where Sandcastle is weaker relative to ABG:

- It is a run/sandbox orchestrator, not a semantic lifecycle runtime.
- Completion is agent/protocol driven; it does not provide ABG-style closure
  law over typed obligations.
- It does not appear to own requirement proof carry-through, admitted payload
  ledgers, or replay-derived assurance.
- It has logs and iteration records, but not a constitutional event ledger.
- It is intentionally closer to infrastructure for coding-agent sessions than
  to a governed language/runtime.

Sandcastle is a serious benchmark for ABG's sandbox and live-test UX. ABG
should learn from its simplicity, not copy its scope.

### ABG/GTL

ABG/GTL is trying to be a language/runtime stack for governed AI lifecycle
construction.

GTL declares graph-native programs: modules, graphs, nodes, graph vectors,
operators, evaluators, rules, graph functions, refinement boundaries,
candidate families, jobs, roles, hooks, asset surfaces, and selected compute
composition. ABG interprets those declarations: admission, runtime events,
payload ledgers, assurance fold, traversal transition, continuation,
correction, replay, and program conformance.

The current HoG/T-200 direction sharpens the product: ABG is the engine, GTL
is the language, and HoG.GTL is the system composition. A C-call has a
locus-only spine and a selected fibre interior. The open-program law makes the
default transform/evaluate/consequence triple a bootstrap program, not the
limit of the monad.

Where ABG is strong:

- Constitutional requirement and product methodology.
- Typed graph/program model.
- Deterministic/probabilistic/human compute regimes.
- Event-sourced runtime truth.
- Replay, provenance, payload ledgers, and assurance projection.
- Requirement proof carry-through and closure fold direction.
- Ability to express software build as one instance of generic lifecycle
  construction, not a local app-specific shell.

Where ABG is weaker today:

- Product packaging and developer onboarding are heavy.
- Sandbox/live-run experience is still being hardened.
- HoG/T-200 is not fully realized in the runner yet.
- Hosted/deploy-anywhere story is behind Flue.
- Simple isolated-run story is behind Sandcastle.
- Public UI/channel/integration surface is immature.

ABG's path is not to be "Flue with more rules" or "Sandcastle with a bigger
prompt." The path is to make governed depth construction usable enough that
its semantic advantages matter in practice.

## Feature Matrix

Scores are 1-5, where 5 means strong current product implementation. ABG
scores are current-state scores, not target-state scores.

| Feature / Buying Criterion | Flue implementation | Flue | Sandcastle implementation | Sandcastle | ABG/GTL implementation | ABG |
| --- | --- | ---: | --- | ---: | --- | ---: |
| Agent execution model | TypeScript `defineAgent` harness with model, tools, skills, sandbox, instructions, routes | 4 | `run()` API around coding agent execution | 4 | GTL-declared graph/program interpreted by ABG; HoG in progress | 3 |
| Sandbox isolation | Virtual/local/remote/container sandbox in agent harness | 4 | Docker, Podman, Vercel, custom provider, no-sandbox option | 5 | Sandbox/live proof lanes exist; product UX still hardening | 3 |
| Durable execution / resume | Durable sessions and recovery are first-class product claims | 4 | Iteration/log/branch continuity; less a durable workflow runtime | 3 | Event-sourced replay/continuation is core runtime law | 4 |
| Workflow/program composition | Code-guided workflows and subagents | 4 | Scripts, hooks, max iterations, branch strategy | 2 | GTL graph algebra, graph functions, open C-call programs | 5 |
| Requirements and proof lineage | Not a visible first-class product primitive | 2 | Not first-class; prompt/run artifacts only | 1 | Requirement algebra, proof carry-through, assurance fold | 5 |
| Closure semantics | Agent/workflow completion through harness behavior | 3 | Completion signal and commits/results | 2 | Typed closure, residual pressure, replay-derived assurance | 5 |
| Replay/audit truth | Durable session record and observability | 4 | Logs, iterations, commits, branch result | 3 | Event ledger, projections, payload ledger, replay truth | 5 |
| Observability ecosystem | OpenTelemetry, Braintrust, Sentry, observer hooks | 5 | Logging and stream hooks | 3 | Internal projections strong; external observability product weaker | 3 |
| Deployment story | Node, Cloudflare, GitHub Actions, GitLab CI/CD, Daytona, Render | 5 | Local/CI scripting with sandbox providers | 4 | Package/install substrate; hosted/deploy-anywhere story immature | 2 |
| Developer simplicity | Familiar TypeScript agent framework | 4 | Very simple `run()` abstraction | 5 | High conceptual load; needs better installer and docs | 2 |
| Extensibility | Tools, skills, MCP servers, subagents | 5 | Custom sandbox providers, hooks, agent providers | 4 | GTL modules, hooks, registries, graph functions, policies | 4 |
| Human-in-loop | Channels and app routes can integrate humans | 3 | Mostly external process; issue exists around asking humans | 2 | F_H regime is constitutional, but product UX incomplete | 3 |
| Code/test verification loop | Agent can use tools/sandbox; framework not proof-law native | 3 | Hooks plus `sandbox.exec` support test/lint gates | 4 | Requirements/test/proof closure is core design | 5 |
| Governance / safety boundary | Harness/tool/sandbox boundaries | 3 | Sandbox isolation and branch mechanics | 4 | Authority boundaries, admission, event truth, no local shells | 5 |
| Ecosystem maturity | Public framework, packages, deploy targets, 1.0 beta | 4 | Active package, current v0.12.0, focused scope | 4 | RC product, deep but not market-packaged | 2 |

## Score Summary

| Scoring View | Flue | Sandcastle | ABG/GTL |
| --- | ---: | ---: | ---: |
| General developer product readiness | 57 / 75 | 50 / 75 | 41 / 75 |
| Governed lifecycle construction fit | 46 / 75 | 38 / 75 | 61 / 75 |
| Sandbox/live-run UX benchmark | 4 / 5 | 5 / 5 | 3 / 5 |
| Semantic proof and closure benchmark | 2 / 5 | 1 / 5 | 5 / 5 |

Interpretation:

- Flue is strongest as the broad agent-app framework.
- Sandcastle is strongest as the focused sandboxed coding-agent runner.
- ABG is strongest as the governed lifecycle/runtime model, but loses points
  for current packaging and runtime realization gaps.

## Strategic Takeaways For ABG

1. Do not compete with Sandcastle by making a prettier `run()` wrapper.
   Compete by making sandbox runs replay-visible truth over admitted programs,
   obligations, evidence, tests, and closure.

2. Do not compete with Flue by making another TypeScript agent harness.
   Compete by making GTL the declared program layer and ABG the interpreter
   that proves what happened.

3. Borrow the UX lessons aggressively:
   - one command to initialize a workspace
   - one command to run a sandbox
   - clear run artifacts
   - visible logs and timings
   - simple branch/worktree story
   - easy provider configuration

4. Keep ABG's hard line:
   downstream products provide declarations and policy; ABG owns runtime
   truth, event emission, replay, closure, and assurance.

5. The data-mapper campaign remains the right proof target. Flue and
   Sandcastle can run agents. ABG must show it can carry requirements through
   depth, produce code, run tests, admit evidence, evaluate adequacy, and close
   or leave residual truth without a local product shell.

## Positioning Statement

Short form:

```text
Flue builds deployable agents.
Sandcastle runs coding agents in sandboxes.
ABG/GTL governs lifecycle construction as replayable program truth.
```

ABG's product claim should be narrower and harder than generic "AI workflow":

```text
ABG/GTL is the governed runtime for graph-declared AI build programs where
requirements, work, evidence, evaluation, replay, and closure must remain one
truth surface.
```

## Product Gaps ABG Should Close Next

1. Sandbox UX parity with Sandcastle:
   a fresh workspace should install ABG context, bind a released substrate,
   run a sandboxed live traversal, and expose logs, event replay, worker
   sessions, timings, commits/artifacts, and proof summaries without manual
   archaeology.

2. Deploy/run UX parity with Flue:
   a product should be able to define a GTL program, bind tools/workers, start
   a run, observe state, and resume or inspect failure from a stable public
   API.

3. HoG/T-200 completion:
   the uniform C-call envelope must reach the real runner so every worker,
   evaluator, deterministic check, human callout, child traversal, retry, and
   evidence artifact is visible through the same spine.

4. Product docs:
   ABG should explain itself using market language first, then constitutional
   depth. A buyer should understand the first sentence before learning GTL.

5. Proof packaging:
   turn existing event/projection truth into concise product-visible run
   reports. The proof exists internally; the market needs an inspectable
   artifact.

## Sources

Public sources reviewed:

- Flue site: https://flueframework.com/
- Flue repository: https://github.com/withastro/flue
- Sandcastle repository: https://github.com/mattpocock/sandcastle
- Sandcastle releases: https://github.com/mattpocock/sandcastle/releases

Local ABG/GTL sources reviewed:

- `README.md`
- `specification/PRODUCT.md`
- `specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md`
- `specification/requirements/abg/REQ-R-ABG3-CCALL.md`
- `build_tenants/abiogenesis/design/ABG_3_UNIFORM_C_CALL_ENVELOPE_DESIGN.md`

