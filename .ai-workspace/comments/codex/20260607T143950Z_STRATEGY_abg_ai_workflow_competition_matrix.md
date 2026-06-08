# Strategy: ABG As An AI-Enabled Workflow Orchestrator

Authored: 2026-06-08 local / 2026-06-07T14:39:50Z
Author: Codex
Status: Commentary, not ratified specification
Scope: Abiogenesis product strategy and competitive positioning

## Claim

Abiogenesis should not position itself as "cron plus GTL" or as a direct
Airflow clone. The stronger product position is:

```text
ABG/GTL is a semantic workflow orchestrator for deterministic, agentic, and
human-governed work.
```

Airflow, Temporal, and Step Functions organize execution. ABG's opportunity is
to organize execution plus epistemic authority: F_D deterministic proof,
F_P agentic construction or judgment, and F_H human approval/escalation as
typed, replayable runtime truth.

The product wedge is long-running AI work where success is not only "the task
ran", but "the right artifact was produced, admitted, evaluated, corrected, and
made auditable under a declared workflow graph."

## ODD Application Runtime Implication

The deeper reason ABG needs to own orchestration and scheduling is the ODD
application model.

In an ODD application, the graph is not an implementation detail behind a
traditional app. The graph is the application authority surface. It declares
the lawful product work, the transform operations, the evaluation regimes, the
human gates, the external callout boundaries, the temporal constraints, and the
projection surfaces that make the application intelligible.

Traditional application components still exist, but they are subordinate
callouts inside the graph:

- frontends provide operator and user interaction surfaces
- long-running services perform domain work or host durable capabilities
- queues, schedulers, cron, cloud timers, and callbacks provide timing and
  delivery infrastructure
- databases and object stores persist domain artifacts and read models
- LLM workers, deterministic tools, and human reviewers execute declared
  operator/evaluator roles

Those components may do real work, but they must not become hidden application
authority. If cron selects the next step, if a frontend mutates closure truth,
if a service loop decides convergence, or if an LLM agent advances state outside
admission, the ODD application collapses back into a conventional distributed
app with graph-shaped documentation.

ABG therefore owns orchestration and scheduling at the semantic layer:

```text
external systems may wait, call, render, compute, store, and notify;
ABG admits facts, projects state, selects lawful continuation, and preserves
replayable application truth.
```

This makes ABG closer to an application runtime than a task runner. Airflow,
Temporal, and Step Functions can schedule or durably coordinate work, but the
ODD claim is stronger: the graph is the app, and ABG is the runtime that keeps
that app's deterministic, agentic, and human-governed truth coherent.

## Competitive Field

Primary workflow competitors:

- Apache Airflow: Python DAG/task scheduler with operators, sensors,
  deferrable operators, workers, UI, XComs, logs, backfills, pools, and a large
  data-engineering ecosystem.
- Temporal: durable code-first workflow platform with workflow definitions,
  activities, workers, task queues, timers, signals, schedules, event history,
  replay, and long-lived execution.
- AWS Step Functions: managed state-machine workflow service with service
  integrations, request/response, sync jobs, callback task tokens, retry/catch,
  parallel/map states, and AWS-native operations.

Adjacent competitors and comparators:

- Dagster, Prefect, Flyte: data/asset orchestration and scheduled flow runs.
- Argo Workflows, Tekton, Jenkins Pipeline, GitHub Actions: Kubernetes, CI/CD,
  and batch workflow automation.
- LangGraph, CrewAI, LlamaIndex Workflows, AutoGen-style stacks: agent and
  multi-agent workflow frameworks with varying durability, memory, and
  human-in-loop support.
- DBOS, Inngest, Trigger.dev, Durable Functions: durable/serverless workflow
  systems that may become natural substrates or competitors for AI workflows.

ABG should be compared against both families. The primary buyer category is
workflow orchestration; the strategic differentiation is agentic governance.

## ABG Current Basis

Current ABG/GTL strengths already visible in the repository:

- GTL declares graph-native workflow programs through Module, Graph,
  GraphVector, GraphFunction, Job, Role, Operator, Evaluator, Rule, Context,
  RefinementBoundary, and CandidateFamily.
- ABG owns admitted runtime events, carrier admission, projection, convergence,
  replay-derived truth, continuation, payload ledgers, provenance, assurance
  fold, and control transitions.
- F_D, F_P, and F_H are not ad hoc task labels. They are regime law:
  deterministic checks, probabilistic/agentic construction or judgment, and
  external human callout are distinct contribution modes.
- Temporal substrate exists for the first slice: `not_before` GTL temporal
  constraints, SchedulePolicy, TimerIntent, TimerOutcome, DeadlineBreach,
  ScheduledContinuation, TemporalProjection, and homeostatic drift projection.
- T-126 matters because timer intents, deadline breaches, scheduled
  continuations, admitted events, and temporal runtime fluents now share one
  consistent runtime scope. A provider callback can reopen the same
  vector/frame/run without inventing app-local scheduling identity.

Current ABG non-claims:

- ABG is not yet a packaged scheduler daemon.
- ABG is not yet a hosted workflow service.
- ABG does not yet provide a production event-store API, worker pool, web UI,
  cron/provider adapter, connector catalog, or full temporal policy system.
- Current temporal law is mainly `not_before` plus deadline-breach projection.
  Recurrence, windows, catch-up, coalescing, cooldown, retry-after, calendar
  policy, time zones, DST, and misfire semantics remain product gaps.

## Competition Matrix

| Capability | Airflow | Temporal | Step Functions | ABG Current | ABG Full Product Need |
| --- | --- | --- | --- | --- | --- |
| Workflow declaration | Python DAGs, tasks, operators, sensors | Code-first workflow definitions and activities | Amazon States Language state machines | GTL Module, GraphFunction, GraphVector, Operator, Evaluator, Role | Stable authoring SDK, visual graph authoring, examples, importer/bridge from common DAG shapes |
| Scheduling and time | Scheduler, cron-like DAG schedules, sensors, deferrable operators | Timers, cron jobs, schedules, durable sleeps | Wait states, EventBridge integration, callback patterns | `not_before` temporal constraint, TimerIntent, TimerOutcome, ScheduledContinuation | Scheduler daemon, cron adapter, EventBridge adapter, recurrence/window/deadline/catch-up/misfire semantics |
| Durable execution | Metadata DB tracks DAG/task state; task execution is not deterministic replay | Event history is source of truth; workflow replay restores state | Managed execution history/state-machine service | Event-sourced carriers and replay-derived projections | Durable event store, append/read API, replay server, snapshot/export, HA deployment mode |
| Worker execution | Executors/workers run tasks; rich operator ecosystem | Workers poll task queues and execute workflow/activity code | Managed AWS service integrations and Lambda/container tasks | ABG can bind workers/plugins at regime boundaries | Worker pools, task queues, leases, retries, backpressure, container/remote execution, agent worker SDK |
| F_D deterministic gates | Can run tests/checks as tasks, but not a regime ontology | Activities can perform checks; workflow determinism is execution law | Choice/retry/catch and service responses, but no F_D ontology | Typed admission, deterministic validators, event/projection gates | Packaged F_D validator registry, schema/test/hash/evidence adapters, policy packs, admission UI |
| F_P agentic work | Arbitrary Python tasks can call LLMs; no native agent-proof model | Activities can call LLMs; docs treat LLM calls as activity work | Lambda/Bedrock/API calls can invoke LLMs | F_P is a first-class evaluator/operator regime with provenance obligations | Agent worker runtime, prompt asset registry, tool binding, evidence adapter, model/provider abstraction, replay-safe LLM receipt handling |
| F_H human governance | Manual intervention possible via UI/sensors/custom tasks | Signals/updates can carry external human input | Callback task tokens support human approval waits | F_H is external human callout regime, not hidden runtime work | Human inbox, approval/rejection carriers, SLA/deadline policy, delegation, escalation, audit trail |
| Evidence and provenance | Logs, XComs, metadata DB, OpenLineage integrations | Event history, visibility, workflow/activity events | Execution history, CloudWatch/X-Ray integrations | Payload ledgers, event truth, provenance, assurance projection | Searchable evidence ledger, artifact viewer, trace UI, export/audit API, retention policy |
| Semantic closure | Task success/failure and trigger rules | Workflow/activity completion, retry policies, signals | State success/failure, retry/catch, choice states | Assurance fold over typed evaluation/evidence truth | Product-grade closure dashboards, explanation surfaces, negative proof display, gap/reprice UX |
| Re-entry/correction | Retry, clear task, backfill, rerun | Signals, workflow updates, retries, versioning/patching | Retry/catch/redrive and manual execution actions | Gap analysis, change-class/reprice model, continuation/replay | Operator workflow for repair, lawful re-entry wizard, retry/reprice policies, run comparison |
| Data/asset orchestration | Strong data engineering ecosystem; assets are improving | General durable execution, not data-asset-first | AWS-native data/ML service integration | Domain-neutral; downstream product owns asset meaning | Asset/materialization API, data connector catalog, lineage bridge, optional Airflow/Dagster interop |
| Observability UI | Mature DAG/run/task/log UI | Temporal Web, visibility/search | AWS Console, execution graph/history | CLI/projections/tests; no product UI | Web console: graph, run timeline, event log, timers, agent traces, evidence, F_H queue |
| Cloud/integration reach | Huge provider/operator ecosystem | Multi-language SDKs and self-host/cloud service | Deep AWS service integration | Local TypeScript package-first runtime | Connector SDK, hosted deployment story, cloud provider adapters, marketplace |
| AI governance differentiation | Weak. LLMs are just tasks unless custom-governed. | Medium. Durable activities can contain agents, but semantic admission is app-owned. | Medium. Strong service orchestration, weak semantic agent governance. | Strong conceptual basis: GTL + ABG + F_D/F_P/F_H + typed admission. | Make governance operational: product UX, adapters, policy packs, agent SDK, evidence marketplace |

## Strategic Position

ABG should not try to win first on generic ETL scheduling. Airflow, Dagster,
and Prefect are entrenched there. Step Functions is entrenched in AWS-native
automation. Temporal is entrenched in durable application workflows.

ABG should win first where those systems are structurally incomplete:

- software construction workflows
- AI code review and repair loops
- eval and benchmark campaigns
- data-contract repair and schema drift response
- release qualification
- compliance workflows with deterministic evidence and human approvals
- long-running research/analysis workflows where agent output must be admitted,
  evaluated, corrected, and replayed

The buyer pain is not "I need a DAG runner." The buyer pain is:

```text
I need agentic work to be schedulable, replayable, auditable, correctable,
and governed without pretending the LLM's hidden reasoning is runtime truth.
```

That is the ABG wedge.

## Product Vision

The full product is an AI-enabled workflow solution with three native execution
regimes:

- F_D: deterministic checks, schema admission, tests, hashes, static analysis,
  policy checks, reproducible transformations, and mechanical gates.
- F_P: agentic construction, semantic review, ambiguity classification,
  proposal synthesis, evidence judgment, and bounded probabilistic work.
- F_H: human approval, rejection, escalation, repricing, exception handling,
  and accountability callouts.

The core product promise:

```text
Declare workflow meaning in GTL. Execute through ABG. Admit every fact at the
boundary. Project state by replay. Route deterministic, agentic, and human
work through one governed graph.
```

## Required Product Layers

1. ABG Workflow Server

   - append-only runtime event store
   - canonical event admission API
   - projection/query API
   - replay and repair API
   - run/graph-call/frame/continuation index
   - durable timer-intent index

2. Temporal Provider Layer

   - cron adapter first
   - EventBridge / cloud scheduler adapter
   - webhook callback adapter
   - queue adapter
   - provider receipt model
   - idempotency, locking, duplicate callback handling
   - recurrence/window/misfire/catch-up semantics

3. Worker And Regime Runtime

   - F_D worker SDK for deterministic validators
   - F_P agent worker SDK for LLM/tool execution
   - F_H human inbox and approval API
   - role binding and worker identity
   - branch leases and concurrency limits
   - retry/reprice policy

4. GTL Authoring Product

   - TypeScript authoring SDK
   - graph-function templates
   - schedule declarations
   - regime/evaluator declarations
   - policy packs
   - examples for agentic workflows
   - bridge/importer for simple Airflow DAG or Step Functions shapes

5. Evidence And Governance UI

   - graph view
   - run timeline
   - pending timer view
   - event log
   - payload/evidence ledger
   - agent trace and prompt asset view
   - F_D/F_P/F_H status per edge
   - gap/reprice/repair workflow

6. Integration Catalog

   - GitHub, filesystem, HTTP, databases, queues, object stores
   - OpenAI/Anthropic/local model providers
   - CI and test runners
   - artifact stores
   - observability/export sinks

## Cron Pairing Position

Cron is acceptable as the first temporal provider. It supplies wall-clock
wakeup. It must not become semantic workflow authority.

Lawful cron-backed loop:

```text
GTL vector declares abg.temporal_constraint
-> ABG admits timer_intent_admitted
-> cron adapter arms/waits
-> cron callback returns provider receipt
-> ABG admits timer_outcome_admitted
-> ABG replay derives temporal_eligible
-> ABG emits/replays scheduled_continuation_reopened
-> ABG, not cron, selects the next graph vector
```

This gives temporal eligibility. It does not yet give the full product:
scheduler service, durable event store, provider adapters, recurrence policy,
UI, worker pools, and audit UX are still needed.

## Recommended Roadmap

Phase 1: Cron-backed temporal MVP

- Ship a cron provider adapter around TimerIntent and TimerOutcome.
- Add an event-store backed runtime sink.
- Add a CLI command to list pending timers and admit provider outcomes.
- Prove idempotent callbacks, duplicate callback rejection, missed callback
  behavior, and replay-derived continuation.

Phase 2: Agentic workflow MVP

- Package one end-to-end GTL graph function for agentic work:
  F_D precheck -> F_P agent construction -> F_D artifact admission ->
  F_P semantic review -> F_H approval if needed -> closure/reprice.
- Provide a minimal operator console or static run report.
- Make evidence and gap state visible enough for an operator to trust the run.

Phase 3: Compete with orchestration products

- Add worker pools, run queues, leases, retries, backpressure, and concurrency.
- Add schedule recurrence, windows, catch-up, and deadline consequence actions.
- Add UI for runs, timers, agent traces, evidence, and human approvals.
- Add connector SDK and initial connector pack.
- Add Airflow/Step Functions/Temporal bridge examples where ABG is the
  governed semantic sub-run rather than the whole infrastructure at first.

Phase 4: Full ABG workflow platform

- Hosted/self-hosted server.
- Production event store.
- Multi-tenant policy and RBAC.
- Full authoring SDK and UI.
- Marketplace of F_D validators, F_P agent packs, F_H approval patterns, and
  domain-specific GTL graph-function templates.

## Strategic Risk

The main risk is building another orchestrator without making the epistemic
split operational. If ABG only runs tasks, it competes with mature products on
their strongest terrain. If ABG makes F_D, F_P, and F_H auditable execution
regimes with typed admission and replay, it competes in a newer category:
governed AI workflow orchestration.

## Source Notes

- Airflow docs describe DAGs as task graphs with task dependencies, workers,
  XCom metadata passing, and UI/logs:
  https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/overview.html
- Airflow deferrable operators free worker slots while waiting and resume via
  triggers:
  https://airflow.apache.org/docs/apache-airflow/stable/authoring-and-scheduling/deferring.html
- Temporal docs describe workflows, workflow executions, durable replay, event
  history as source of truth, and activities for external effects including
  LLM invocations:
  https://docs.temporal.io/workflows
  https://docs.temporal.io/activities
- Temporal schedules start workflow executions at specified times and support
  interval/calendar specs:
  https://docs.temporal.io/schedule
- AWS Step Functions docs describe state-machine workflows, service
  integrations, sync jobs, callback task tokens, human-in-loop, parallel, map,
  retry, and catch patterns:
  https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html
  https://docs.aws.amazon.com/step-functions/latest/dg/integrate-services.html
- Prefect deployments run flows manually, on schedules, or in response to
  events, with work pools/workers:
  https://docs.prefect.io/v3/concepts/deployments
- CrewAI positions Flows plus Crews as a structured way to coordinate agentic
  work:
  https://docs.crewai.com/introduction
- LangGraph positions itself around durable execution, memory, streaming, and
  human-in-loop agent workflows:
  https://docs.langchain.com/oss/python/langgraph
