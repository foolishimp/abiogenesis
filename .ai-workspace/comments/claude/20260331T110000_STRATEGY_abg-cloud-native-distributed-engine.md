# STRATEGY: Cloud-Native Distributed ABG Engine on AWS

**Author**: Claude
**Date**: 2026-03-31
**Addresses**: ABG engine distribution strategy, Bedrock integration, GTL/ABG separation for cloud deployment
**Status**: Draft

## Summary

GTL remains a portable language SDK with no cloud dependency. ABG becomes a distributed, cloud-native engine on AWS with Bedrock as the primary F_P backend. The event-sourced architecture ABG already has is the native architecture of distributed cloud systems — the current single-process JSONL implementation is a degenerate case of the distributed design. The laws don't change. The transport does.

## Analysis

### The Separation

GTL and ABG have different deployment targets:

- **GTL** — Pure language SDK. Published as a library (Maven JAR, npm package). No AWS imports, no cloud dependency. Defines graphs, algebra, modules, jobs, roles. Runs anywhere.

- **ABG** — Distributed runtime engine. Cloud-native on AWS. Owns events, projection, convergence, traversal, binding, transport, provenance, correction, selection application. Deployed as infrastructure.

This separation already exists in the specification (REQ-L-GTL2-ENGINE-INDEPENDENCE, REQ-M-GTL2-MAPPING). The distributed engine is a new mapping target — GTL programs compiled to a distributed execution plan rather than interpreted in a single process.

### GTL SDK

Scala or Kotlin on JVM. Pure library, no cloud dependency:

```
gtl-core    — Graph, Node, GraphVector, Context, Operator, Evaluator, Rule
gtl-algebra — compose, substitute, recurse, fan_out, fan_in, gate, promote
gtl-module  — Module, Job, Role, CandidateFamily, RefinementBoundary
```

TypeScript mirror for browser-side validation (visual editor, Factorio-style pipeline builder).

Python reference implementation stays as the specification-tested canonical surface.

### ABG on AWS — Service Mapping

ABG's runtime responsibilities map onto AWS services:

#### Event Store — DynamoDB

```
Table: abg-events
  Partition key: work_key  (String)
  Sort key:      event_time (String, ISO 8601)
  Attributes:    event_type, data (Map), run_id, workflow_version, spec_hash
```

- Append-only writes (PutItem only — no UpdateItem, no DeleteItem)
- Strong consistency reads for projection
- DynamoDB Streams for reactive event processing
- Per-work_key partitioning gives natural scoping
- Scales to any number of concurrent workflows

Replaces `events.jsonl`. The projection function `project(stream, type, id, work_key)` becomes a DynamoDB Query with partition key filter and forward scan. Same deterministic replay contract.

#### Traversal Orchestration — Step Functions

GTL Graphs compile to Step Functions state machine definitions (ASL). The mapping:

| GTL / ABG Concept | Step Functions Equivalent |
|---|---|
| `Graph` | State Machine Definition |
| `GraphVector` | State Transition |
| `edge()` | Task State |
| `compose(f, g)` | Sequential States |
| `fan_out()` | Map State (parallel) |
| `fan_in()` | Map State result collection |
| `gate()` | Choice State + Wait-for-Callback |
| `substitute()` | Nested Execution (child state machine) |
| `recurse()` | Iterator with Choice termination |
| `CandidateFamily` | Choice State (selection-driven branching) |
| Convergence loop | Lambda-computed delta + Choice continuation |

Standard Workflows run up to one year — sufficient for any SDLC lifecycle.

The **GTL-to-StepFunctions compiler** is the central new artifact. It takes a `Module` and emits an ASL definition. The algebra guarantees every legal GTL composition produces a valid state machine.

#### F_D Evaluators — Lambda

Deterministic evaluators are ideal Lambda functions. Bounded, deterministic, stateless:

```
Lambda: fd-evaluator-{binding-name}
  Input:  { work_key, edge, vector_id, artifact_ref }
  Output: { passes: bool, detail: {...} }
  Timeout: 120s
  Runtime: Python 3.12 or provided.al2 (Rust)
```

One Lambda per evaluator binding. CodeBuild for heavier evaluations that need a full build environment (test suites, compilation).

#### F_P Dispatch — Bedrock

The current subprocess transport (`call_agent` via CLI) becomes Bedrock API calls. Step Functions has native Bedrock integration — an optimized `InvokeModel` task type requiring no Lambda glue:

```json
{
  "Type": "Task",
  "Resource": "arn:aws:states:::bedrock:invokeModel",
  "Parameters": {
    "ModelId": "anthropic.claude-sonnet-4-20250514",
    "Body": {
      "prompt.$": "$.manifest.prompt",
      "max_tokens": 4096
    }
  },
  "ResultPath": "$.fp_result",
  "Retry": [
    { "ErrorEquals": ["ThrottlingException"], "MaxAttempts": 3, "BackoffRate": 2 }
  ]
}
```

The manifest structure from `bind_fp()` stays the same — same prompt, same assessment JSON contract, different transport.

For complex multi-turn F_P tasks:

- **Bedrock Agents** — Multi-step agent orchestration with tool use
- **Bedrock Knowledge Bases** — Context resolution (replaces `ContextResolver.load()` for workspace://, registry:// schemes)
- **Bedrock Guardrails** — Additional F_D safety layer on agent output
- **Bedrock Action Groups** — Tool bindings the agent can invoke

#### F_H Gates — API Gateway + Wait-for-Callback

```
Flow:
  Step Functions emits task token → SQS queue
  API Gateway exposes /approve and /reject endpoints
  Human reviews via web UI or Slack integration
  POST /approve with task token resumes execution
  Event emitted to DynamoDB: approved{kind: fh_review}
```

Cognito handles identity. The Cognito user ID becomes `authority_ref` on the approval event. IAM roles map to GTL Roles — Worker/Role binding becomes native AWS identity.

#### Artifacts and Context — S3

```
s3://abg-artifacts/{work_key}/manifests/{manifest_id}.json
s3://abg-artifacts/{work_key}/results/{run_id}.json
s3://abg-artifacts/{work_key}/contexts/{context_name}
```

Context scheme resolution:

| Scheme | Cloud Target |
|---|---|
| `workspace://` | S3 path |
| `git://` | CodeCommit snapshot or S3 archive |
| `registry://` | DynamoDB registry table or S3 |
| `event://` | DynamoDB query |

#### Event Routing — EventBridge

DynamoDB Streams feed EventBridge for reactive, event-driven execution:

```
Rule: on-edge-converged
  Pattern: { "event_type": "edge_converged" }
  Target:  Lambda → update projection, check parent convergence

Rule: on-fp-assessed
  Pattern: { "event_type": "assessed", "data.kind": "fp" }
  Target:  Lambda → ingest result, recompute delta

Rule: on-work-spawned
  Pattern: { "event_type": "work_spawned" }
  Target:  Step Functions → start child traversal execution
```

This replaces the sequential `gen_iterate` loop with reactive event-driven execution. When a child edge converges, EventBridge triggers parent convergence check. When all children converge, the parent folds back automatically.

#### Observability — X-Ray + CloudWatch

X-Ray distributed tracing maps directly to ABG lineage:

| ABG Concept | X-Ray Equivalent |
|---|---|
| `work_key` | Trace ID |
| `run_id` | Segment |
| Evaluator invocation | Subsegment |
| Lineage chain | Trace graph |

Requirement-to-deployment provenance is visible in the AWS console natively. CloudWatch dashboards show delta convergence across all active work_keys.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  GTL SDK (Scala/Kotlin JAR — no cloud dependency)           │
│  Graph, Node, algebra, Module, Job, Role                    │
└────────────────────────┬────────────────────────────────────┘
                         │ compiles to
┌────────────────────────▼────────────────────────────────────┐
│  GTL → Step Functions Compiler                               │
│  Module → ASL state machine definition → CDK deployment      │
└────────────────────────┬────────────────────────────────────┘
                         │ deploys via CDK
┌────────────────────────▼────────────────────────────────────┐
│  ABG Distributed Engine (AWS)                                │
│                                                              │
│  ┌───────────────┐  ┌────────────┐  ┌─────────────────┐    │
│  │ Step          │  │ DynamoDB   │  │ Bedrock         │    │
│  │ Functions     │  │ Event      │  │ (F_P dispatch)  │    │
│  │ (traversal    │  │ Store      │  │                 │    │
│  │  orchestration│  │            │  │ InvokeModel     │    │
│  │  per Module)  │  │ append-    │  │ Agents          │    │
│  │               │  │ only       │  │ Knowledge Bases │    │
│  └───────┬───────┘  └─────┬──────┘  └────────┬────────┘    │
│          │                │                   │             │
│  ┌───────▼───────┐  ┌─────▼──────┐  ┌────────▼────────┐    │
│  │ Lambda        │  │ Event      │  │ Bedrock         │    │
│  │               │  │ Bridge     │  │ Guardrails      │    │
│  │ F_D evaluators│  │            │  │ (safety layer   │    │
│  │ projection    │  │ reactive   │  │  on F_P output) │    │
│  │ delta compute │  │ routing    │  │                 │    │
│  │ binding       │  │            │  │                 │    │
│  └───────────────┘  └────────────┘  └─────────────────┘    │
│                                                              │
│  ┌───────────────┐  ┌────────────┐  ┌─────────────────┐    │
│  │ API Gateway   │  │ S3         │  │ Cognito + IAM   │    │
│  │               │  │            │  │                 │    │
│  │ F_H approval  │  │ artifacts  │  │ identity →      │    │
│  │ endpoints     │  │ manifests  │  │ GTL Roles       │    │
│  │ status queries│  │ contexts   │  │ authority_ref   │    │
│  └───────────────┘  └────────────┘  └─────────────────┘    │
│                                                              │
│  ┌───────────────┐  ┌────────────┐                          │
│  │ X-Ray         │  │ CloudWatch │                          │
│  │               │  │            │                          │
│  │ work_key =    │  │ delta      │                          │
│  │ trace ID      │  │ dashboards │                          │
│  │ lineage       │  │ convergence│                          │
│  │ provenance    │  │ metrics    │                          │
│  └───────────────┘  └────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

### Why the Mapping Is Clean

ABG was designed event-sourced from the start. Event-sourcing is the native architecture of distributed cloud systems. Every ABG primitive has a direct AWS equivalent:

| ABG Primitive | Current (single-process) | Distributed (AWS) |
|---|---|---|
| `emit()` | File append to JSONL | DynamoDB PutItem |
| `project()` | Read + replay JSONL | DynamoDB Query |
| `delta()` | In-process computation | Lambda invocation |
| `bind_fd()` | Subprocess shell command | Lambda per evaluator |
| `bind_fp()` | Subprocess CLI dispatch | Bedrock InvokeModel |
| `bind_fh()` | Event Calculus over JSONL | API Gateway + DynamoDB |
| `gen_iterate` loop | Sequential process loop | EventBridge reactive routing |
| `work_key` scoping | Filter over event list | DynamoDB partition key |
| Convergence check | In-memory scan | Lambda + DynamoDB Query |
| Provenance | Event metadata fields | Event metadata + X-Ray trace |

The single-process Python implementation was always a degenerate case of this distributed design. The constitutional contracts (append-only events, deterministic projection, event-calculus F_H semantics, F_D-before-F_P escalation) are transport-independent.

### Bedrock-Specific Integration Points

For organizations that want deep Bedrock integration:

**Model Selection as CandidateFamily.** Different Bedrock models become candidates for F_P dispatch:

```
fp_models = candidate_family("model_selection",
    inputs     = [design],
    outputs    = [code],
    candidates = [
        GraphFunction("claude_sonnet", ...),
        GraphFunction("claude_haiku",  ...),
        GraphFunction("titan",         ...),
    ])
```

Model selection becomes an explicit SelectionDecision with provenance — not a hidden configuration parameter.

**Knowledge Bases as Context.** Bedrock Knowledge Bases replace `ContextResolver` for rich context retrieval. Context locators gain a new scheme:

```
Context(name="domain_knowledge",
        locator="bedrock-kb://KB-12345/query",
        digest="sha256:...")
```

**Guardrails as F_D Layer.** Bedrock Guardrails run as an additional deterministic check on agent output before the F_P assessment is accepted:

```
Agent produces output → Guardrails check (F_D) → Assessment ingested
```

This means harmful, off-topic, or policy-violating agent output is caught before it enters the event stream — a defense-in-depth layer that maps naturally to the F_D-before-F_P escalation order.

**Fine-tuned Models per Evaluator.** Different evaluators can target different Bedrock models. A code review evaluator might use a fine-tuned model trained on the organization's coding standards, while a design review evaluator uses a general-purpose model:

```
code_review  = Evaluator("code_review",  regime=F_P,
                          binding="bedrock://model/ft-code-review-v2")
design_check = Evaluator("design_check", regime=F_P,
                          binding="bedrock://model/anthropic.claude-sonnet")
```

### Multi-Tenancy

DynamoDB partition key design supports multi-tenant deployment natively:

```
Table: abg-events-{tenant_id}
  or
Table: abg-events
  Partition key: {tenant_id}#{work_key}
```

Each tenant gets isolated event streams, separate Step Functions executions, dedicated IAM roles mapping to GTL Roles. CDK deploys per-tenant infrastructure from the same GTL Module definition.

### Implementation Order

1. **DynamoDB event store + Lambda projection** — Replace `events.jsonl` with DynamoDB. Everything else can still run locally against the new store. Validates the event model scales.

2. **Bedrock transport adapter** — Replace `call_agent()` subprocess with Bedrock InvokeModel. Same manifest structure, same assessment JSON contract. One function swap. This is what the Bedrock stakeholders want first and it's the smallest change.

3. **GTL → ASL compiler** — The central new artifact. Compile `Module` to Step Functions state machine definitions. Start with linear graphs (compose only), add fan_out/fan_in, then substitute/selection.

4. **Lambda F_D evaluators** — Extract `run_fd_evaluator()` into Lambda functions. One per evaluator binding. CodeBuild integration for test suites.

5. **F_H approval API** — API Gateway + Cognito + Wait-for-Callback pattern. Web UI or Slack integration for human review.

6. **EventBridge reactive wiring** — Replace the `gen_iterate` sequential loop with event-driven reactive execution. This is the step that makes it truly distributed.

7. **X-Ray lineage + CloudWatch delta dashboards** — Observability. Map work_key to trace ID, convergence metrics to CloudWatch.

Step 2 can ship independently and immediately. Steps 1 and 3 are the foundation for everything else. Steps 4-7 build outward from there.

### Risk: Step Functions Limitations

Step Functions has constraints worth noting:

- **Express Workflows** cap at 5 minutes — only useful for short evaluations, not full traversals. Use Standard Workflows for the traversal loop.
- **Payload size** is 256KB per state — large manifests or context payloads need S3 indirection. This is natural: the manifest goes to S3, the state machine carries the S3 URI.
- **State transition cost** — $0.025 per 1,000 transitions. A convergence loop with many iterations across many edges will incur cost. Budget accordingly.
- **No dynamic state machine modification** — You can't `substitute()` a running state machine. Selection/refinement requires starting a new child execution for the refined subgraph. This maps to the existing work_spawned pattern.

If Step Functions proves too constraining for complex traversal patterns, **Temporal on ECS** is the fallback. Temporal has richer composition primitives (child workflows, signals, queries, continue-as-new) and no payload size limits. But it adds operational complexity and isn't AWS-native.

## Recommended Action

Begin with Step 2 (Bedrock transport adapter) — it delivers visible value to Bedrock stakeholders with minimal architectural change. Then build the DynamoDB event store (Step 1) and GTL→ASL compiler (Step 3) in parallel. The compiler is the long pole — everything else is infrastructure wiring around the same algebraic contracts that already exist.

The thesis: ABG's event-sourced design was always implicitly distributed. Making it explicitly distributed on AWS is a mapping exercise, not a redesign.
