# REQ-P-QUAL — Qualification Infrastructure

**Status**: Active
**Category**: Verification
**Date**: 2026-03-25
**Derives from**: INT-005 (run governance, failure classification), [/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md) (Verification Layers)
**Wave**: 2

---

## Purpose

The test and qualification infrastructure is a product surface with its own correctness requirements. Without formal requirements, failure modes are diagnosed ad-hoc, the same defects recur, and lineage cannot be established from intent through to test evidence.

This requirement establishes the constitutional rules for the qualification infrastructure itself — transport readiness, failure mode separation, artifact integrity, timeout contracts, and forensic evidence. Every test that validates product behavior must itself satisfy these requirements.

---

## Transport Readiness

**REQ-P-QUAL-001**: An agent skip gate shall verify that the agent is **ready to serve requests**, not merely present on PATH. Readiness means the agent can accept a prompt and return a coherent response within a bounded probe timeout.

**REQ-P-QUAL-002**: When a readiness probe fails, the test shall be **skipped with a diagnostic reason**, not failed. "Agent not ready" is an environment precondition, not a test failure.

**REQ-P-QUAL-003**: The readiness probe shall be the **cheapest reliable check** — a trivial prompt with a deterministic expected response. It shall not perform substantive work or consume significant resources.

---

## Failure Mode Separation

**REQ-P-QUAL-004**: Each failure class in the INT-005 taxonomy (`transport_failure`, `no_output`, `contract_failure`, `certification_failure`) shall produce a **distinct, diagnosable signal** in test output. A test observer shall be able to determine the failure class from the test output alone, without reading source code.

**REQ-P-QUAL-005**: Transport failures (nonzero exit, timeout, crash) shall remain **diagnosable transport truth**. They shall not be masked as artifact quality failures or silently converted to empty output. A preserved artifact may only rescue the turn when ABG deterministically validates it as the authoritative result for that boundary; mere artifact presence is insufficient.

**REQ-P-QUAL-006**: The `call_agent()` throwing transport layer shall treat a nonzero exit code as an error. Returning stdout from a failed process conflates success and failure.

---

## Artifact Integrity

**REQ-P-QUAL-007**: If the agent did not write the expected artifact file, the test infrastructure shall raise an **artifact-missing error** with diagnostic context (raw response preview, expected path). It shall not substitute the agent's stdout as the artifact.

**REQ-P-QUAL-008**: The deterministic judge shall only evaluate artifacts that were **written by the agent through the tool surface**, not artifacts synthesized from transport output by the test harness. Fallback masking converts transport/readiness failures into artifact-quality failures, making diagnosis impossible.

**REQ-P-QUAL-009**: When an artifact exists but is below a minimum viable size (e.g., placeholder content), it shall be treated as **no_output**, not as a valid artifact to judge.

---

## Timeout Contracts

**REQ-P-QUAL-010**: Timeout bounds shall be **explicit and layered**. Each layer declares its own timeout independently:
  - pytest-level: global default for unit/integration tests
  - pytest-level: per-test or per-class override for live qualification tests
  - transport-level: subprocess timeout for agent invocation
  - agent-level: internal timeout within the agent process (opaque to the harness)

**REQ-P-QUAL-011**: The pytest timeout for live qualification tests shall be **strictly greater** than the transport subprocess timeout. A test killed by pytest before the transport times out produces an ambiguous signal (was the agent slow, or did transport hang?).

**REQ-P-QUAL-012**: When a transport timeout fires, the resulting error shall **name the timeout value and the agent** so the operator can distinguish "agent was slow" from "transport configuration too aggressive."

---

## Qualification Lanes

**REQ-P-QUAL-013**: Smoke tests and qualification tests shall be **structurally distinct test classes** with different assertion contracts:
  - Smoke: asserts the protocol completed (response exists, judge ran). Does not assert artifact quality.
  - Qualification: asserts the judge passed. This is the release gate.

**REQ-P-QUAL-014**: Qualification tests shall be **parametrized for statistical confidence**. A single pass is anecdotal; N passes across independent sandboxes is evidence. The qualification run count shall be a named constant, not a magic number.

**REQ-P-QUAL-015**: Entropy campaign tests (sequential dispatches in a shared sandbox, delta trend over accumulated state) shall be a **separate lane** from fresh-sandbox qualification. Entropy campaigns require artifact integrity (REQ-P-QUAL-007) to be satisfied — no fallback masking.

---

## Forensic Evidence

**REQ-P-QUAL-016**: Every live qualification run shall **archive** the following artifacts for postmortem:
  - The manifest JSON (what was dispatched)
  - The prompt text (what the agent received)
  - The raw response (what the agent returned)
  - The artifact content (what was judged)
  - The judge verdict (pass/fail with per-criterion evidence)
  - The model identifier and transport method

**REQ-P-QUAL-017**: Archive artifacts shall be written **before** the test assertion fires. A failing test that destroys its own evidence is a forensic dead end.

**REQ-P-QUAL-018**: The archive path shall encode **test identity** (scenario name, run ID, timestamp) so that postmortem can correlate a specific test failure to its evidence without grepping.

**REQ-P-QUAL-018A**: Every sandbox-backed scenario or qualification run shall support a **persistent run archive** rooted under a stable, non-temporary test-run directory. Pytest temporary workspaces are execution scratch space; they are not sufficient as the postmortem record.

**REQ-P-QUAL-018B**: A persistent run archive shall preserve the **full sandbox workspace snapshot** needed for replay-free postmortem, including at minimum:
  - workspace documents and generated artifacts
  - `.ai-workspace/events/events.jsonl`
  - `.ai-workspace/fp_manifests/`
  - `.ai-workspace/fp_results/`
  - runtime/bootstrap files needed to understand the installed test surface

**REQ-P-QUAL-018C**: A persistent run archive shall also preserve **run metadata and operator-facing summaries**, including at minimum:
  - a run metadata record (`run.json` or equivalent) containing timestamp, test identity, source commit, interpreter, and invoked commands
  - a summarized postmortem view (`summary.json` or equivalent) containing convergence state, failing evaluators, and key artifact references
  - captured subprocess stdout/stderr where subprocess transport or CLI orchestration is involved

**REQ-P-QUAL-018D**: Persistent run archives shall be **immutable and non-overwriting**. Each run receives a new path keyed by scenario/use-case identity plus sortable timestamp; a later run shall not destroy or mutate a prior archive.

**REQ-P-QUAL-018E**: Archive materialization shall occur **before** sandbox cleanup or test fixture teardown. If execution uses temporary directories, the archive copy must be completed before those directories are eligible for deletion.

**REQ-P-QUAL-018F**: The archive structure shall be **scenario-oriented**, not merely test-run-oriented. A postmortem operator shall be able to navigate by use case first, then timestamped run, without requiring pytest internals or temporary-directory names.

---

## Live Test Authority

**REQ-P-QUAL-021**: Live F_P qualification tests are the **gold standard** for product correctness. Any failure must be root-caused — never dismissed as flaky, pre-existing, or environmental without diagnosis.

**REQ-P-QUAL-022**: Exactly two variables govern live test outcomes: **(a) prompt sufficiency** — the manifest prompt must constrain the agent response tightly enough that it produces the required artifact, and **(b) transport reliability** — delivery of the prompt and collection of the response must be deterministic. Both variables shall be managed within the test parameters.

**REQ-P-QUAL-023**: The transport layer shall ensure the agent has **sufficient capability** to execute all operations required by the dispatch contract (read files, write artifacts, run commands). An agent that cannot perform a required operation due to transport configuration is a transport failure, not an agent quality issue.

**REQ-P-QUAL-024**: Transient transport failures (network errors, rate limits, temporary unavailability) shall be **retryable** within the transport layer. The retry budget (count and backoff) shall be bounded. Permanent failures (missing agent, authentication) shall not be retried.

---

## Lineage

**REQ-P-QUAL-019**: Every test file shall carry `# Validates: REQ-P-QUAL-*` tags for the qualification requirements it satisfies. This establishes traceable lineage from intent (INT-005) through requirement (REQ-P-QUAL) to test evidence.

**REQ-P-QUAL-020**: The qualification infrastructure itself shall be subject to F_D tag enforcement (`check-validates-coverage`). Untraceable tests are invisible to the convergence engine.
