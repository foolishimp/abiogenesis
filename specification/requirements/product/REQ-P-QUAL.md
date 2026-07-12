# REQ-P-QUAL — Qualification Infrastructure

**Status**: Active
**Category**: Verification
**Date**: 2026-03-25
**Derives from**: INT-001 (installed product and release qualification), INT-005 (run governance, failure classification), [PRODUCT.md](../../PRODUCT.md), [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md) (Verification Layers)
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

**REQ-P-QUAL-014**: A qualification question that claims statistical
confidence shall declare and parameterize its independent run count. The count
shall be a named constant rather than a magic number, and the resulting claim
shall state the population it supports. A bounded deterministic, installed, or
live steel-thread gate may require one declared run when it claims only that
the exact scenario completed; ABG 5.0 does not claim generic pass@k
characterization.

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

## Installed Sandbox Population

The installed substrate contract is governed by
[REQ-P-INSTALL.md](./REQ-P-INSTALL.md). Qualification requirements here define
the proving obligations over that product contract.

**REQ-P-QUAL-018G**: Any sandbox-backed downstream qualification that claims installed ABG substrate truth shall populate the sandbox through a public ABG installer surface. Source-tree imports, private test helpers, or harness-only package bindings are not sufficient closure evidence for installed runtime behavior.

**REQ-P-QUAL-018H**: A public ABG installer shall write inspectable installed-runtime truth that includes package identity, installer manifest path, install manifest path, command binding paths, runtime identity, event/projection evidence roots, and the installed package root used by downstream execution.

**REQ-P-QUAL-018I**: Installer qualification shall preserve a persistent archive/postmortem under the stable test-run archive root. The archive shall include install manifest evidence, installer manifest evidence, package identity, command binding evidence, runtime identity, event/projection evidence, and an operator-facing postmortem summary.

---

## Diff-Execution Witness Gate

**REQ-P-QUAL-025**: The approving suite for a change shall **witness the
change's execution**. Changed executable surfaces declared by the released
tenant's change census that are not executed by the approving suite fail the
diff-execution witness gate. Never-committed executable surfaces in that census
are witnessed in full. Every public binding export shall be referenced by the
unit lane.

Gap: the gate witnesses only `.ts` files under `code/src`; the general obligation — every changed executable file of the change, whatever its language or location (gates, test harness, scripts, non-TS toolchains) — is not yet enforced. Owner: T-247.

---

## Live-Install-Only Proof

**REQ-P-QUAL-026**: Every NEW or MIGRATED live proof run shall execute on a **packed-and-installed sandbox substrate** driving the installed surface, never the repo build tree — conformant from birth.

Gap: 26 legacy in-repo live tests predating the ruling (pinned 2026-07-10) still drive the repo build tree. The enforcement mechanism is the in-suite shrink-only conformance pin over the pinned legacy exemption list: migrating a file removes its entry, a stale entry fails the pin, and the list may only shrink — it never grows. Owner: T-247. The list shall be empty before the ABIogenesis 5.0 exact-candidate gate freezes its qualification input.

---

## Release Snapshot Bundles

Release snapshot bundles are release-process artifacts. They record one
published RC cut or tapped release cut without making the version identifier
live constitutional project truth.

**REQ-P-QUAL-050**: Each package-first RC or tapped release snapshot shall be
materialized as one immutable, versioned snapshot bundle.

**REQ-P-QUAL-051**: The snapshot bundle shall include, at minimum, the package
tarball, release snapshot manifest, checksum file, release note copy when one
exists, package identity, source ref, source commit, build command, pack command,
and verification facts.

**REQ-P-QUAL-052**: The release snapshot manifest shall be the authoritative
read model for the snapshot artifact set. Stray tenant-root tarballs, dry-run
pack output, or release-note prose shall not substitute for the manifest.

**REQ-P-QUAL-053**: Snapshot creation shall fail closed when the source tree is
dirty, when the package identity does not match the requested release identity,
or when the target versioned snapshot root already contains files.

**REQ-P-QUAL-054**: Snapshot creation shall compute and record deterministic
checksums for the package tarball and generated release snapshot files.

**REQ-P-QUAL-055**: Release snapshot tooling shall package an explicit source
root/ref and shall not silently reinterpret the mutable development checkout as
an already tagged release cut.

**REQ-P-QUAL-056**: The release snapshot shall be **self-certifying**. Snapshot
creation embeds the declared gate evidence (build, lint, test outcomes and the
parsed test summary) in the release snapshot manifest, and a gate that runs red
refuses the cut. A RELEASE-GRADE cut requires build, lint, and test evidence
green. A RELEASE-GRADE request shall reject any build, lint, test, or exact-cut
qualification bypass. Declared bypass booleans may be honored only for an
explicitly non-release snapshot; a bypassed gate records null evidence and
shall never be represented as green or promotable.

Gap: the current release-snapshot request still accepts build, lint, and test
bypass booleans for a release-grade request. T-247 shall make release-grade
admission reject every mandatory-gate or exact-cut bypass and pin the red and
bypassed differentials before the ABIogenesis 5.0 exact-candidate gate freezes
its qualification input.

## ABIogenesis 5.0 Exact-Cut Qualification

**REQ-P-QUAL-057**: ABIogenesis 5.0 pre-RC qualification shall bind the exact
installed ABIogenesis candidate identity, content and install-artifact digests,
product-manifest digest, workspace binding, and tenant-conformance manifest
identity and digest. Source-tree execution or evidence from different candidate
content shall not satisfy the source-candidate gate. RC and final versions are
assigned only by the release process. An odd_glc candidate or successor dogfood
workspace shall not be part of this 5.0 candidate identity.

**REQ-P-QUAL-058**: The exact installed ABIogenesis 5.0 candidate shall run one Hello World GraphFunction through the public SDK or CLI, produce the declared typed result, and expose the corresponding admitted catalog, selection, GraphCall, closure, and replay truth.

**REQ-P-QUAL-059**: The exact installed ABIogenesis 5.0 candidate shall complete the primary public operator loop: start, report one truthful stop, hold, or gap, expose the replay-derived frontier and lawful actions, admit an agent edit or typed F_H response, resume or start again, and converge without a second controller or private import.

**REQ-P-QUAL-060**: The exact installed ABIogenesis 5.0 candidate shall satisfy
`REQ-P-SELF-CONFORMANCE` over its complete frozen constitutional, design,
realization, proof, ticket/execution-contract, public-seam, manifest,
qualification, and release-claim inventory under the exact declared
method/rule/source basis. The real-tree and seeded-negative gates shall pass,
findings and dispositions shall be typed, and the product shall receive no
conformance exemption.

**REQ-P-QUAL-060A**: The exact installed ABIogenesis 5.0 candidate shall run the
current observer and tuner over the frozen candidate and release path and prove
truthful halt classification, replay-grounded findings and drafts, actor/policy
attribution, ratification and rejection without direct authority mutation,
replay-visible acts, and one injected negative that returns the expected
non-green typed result.

**REQ-P-QUAL-061**: The exact installed ABIogenesis 5.0 candidate shall satisfy
`REQ-P-CONSENSUS`. Qualification shall invoke its published SYSTEM-owned
Consensus GraphFunction through `abg.cli` over one real ticket and at least two
differently attributed reviewer profiles; prove agreement closure, dispute
recursion, and round-limit or unresolved-dispute F_H escalation; exercise the
existing, alternate, and temporary workspace applications; and expose the typed
result and replay without source import, feature-specific engine code, or
shell-owned orchestration.

**REQ-P-QUAL-062**: An odd_glc release, downstream data-mapper campaign, or
installed 5.0 product authoring the distinct 5.0.1 successor is post-5.0
evidence. It shall have its own exact product identities, requirements, design,
qualification, and release gate and shall not be required to make the
ABIogenesis 5.0 candidate or final release green.

**REQ-P-QUAL-063**: The exact installed ABIogenesis 5.0 candidate shall complete its native public path without Claude, Codex, or another marketplace host. The Codex CLI or skill compatibility projection shall complete the same public-contract scenario without directly invoking a worker, emitting an ABG event, constructing a continuation, controlling traversal, or deciding closure.

**REQ-P-QUAL-064**: One exact-cut verdict shall cite the owning qualification
evidence for installed Hello World, the seven-term declared C program and its
malformed GTL/F_P differentials, the bounded conformance-enforcement gate, the
public operator loop, self-conformance, observer/tuner truth, the installed
Consensus GraphFunction, native operation, the Codex projection, and exact
product identity. It shall aggregate those owning proofs rather than
introduce a second semantic checker, runtime, or release-wide qualification harness.

**REQ-P-QUAL-065**: Qualification on the supported trusted-developer-desktop boundary shall defend malformed GTL and F_P results, unresolved or incompatible contracts and capabilities, incorrect product identity or binding, source/private-import dependence, and false convergence or release claims. It shall not require hostile-local tamper resistance, a signing service, remote attestation, a hosted marketplace, or repeated adversarial campaigns.

**REQ-P-QUAL-066**: Codex projection qualification shall compare the native and
adapter paths over the same versioned public operation contract. A fixed-result
lane shall compare the declared result digest. A live F_P lane shall compare
the declared response/result schemas and replay-significant invariants, or both
paths may consume one identical recorded admitted result when the gate is
explicitly a transport-independent projection test. Textual output equality is
not required unless the public contract declares it.

**REQ-P-QUAL-067**: Release closure shall fresh-install the published
ABIogenesis 5.0 release artifact by its verified remote identity, bind its exact
released descriptor, manifest, version, digest, and tenant-conformance identity,
and pass the bounded installed catalog, public invocation, Consensus, and replay
proof without rebuilding or importing mutable source. This post-publication
result shall be a terminal addendum to the same A5-R1 release manifest/read
model. It shall not be required to make the pre-release exact-candidate verdict
green and shall not reinterpret that earlier verdict.

**REQ-P-QUAL-068**: The ABG 5.0 release process shall open a mutable RC window,
publish at least one immutable versioned RC cut descended from the exact
accepted ABIogenesis candidate, and qualify the latest accepted RC before the
final tap. The RC record shall bind its source lineage, allowed
version/release-asset delta, branch, tag, package, snapshot, checksums, notes,
installed identity, operator review, and selected qualification evidence. A
bounded fix after publication requires a new RC cut.

**REQ-P-QUAL-069**: An odd_glc release or 5.0.1 dogfood campaign may begin only
after stable ABIogenesis 5.0 is available as an exact installed development
product. Its failure shall block its own claim and may re-enter ABIogenesis when
it exposes a retained 5.0 product defect, but it shall not be a deferred
prerequisite or terminal addendum required for the ABIogenesis 5.0 release.

**REQ-P-QUAL-070**: A final tap may change the accepted RC only through the
assigned final version and reconciled release-scoped assets. Product behavior,
declarations, public contracts, or dependencies changed at tap shall reopen the
RC window. The final artifact shall rerun the deterministic, install, identity,
and bounded behavior gates affected by the final delta before publication.

---

## Live Test Authority

**REQ-P-QUAL-021**: Live F_P qualification tests are the **gold standard** for product correctness. Any failure must be root-caused — never dismissed as flaky, pre-existing, or environmental without diagnosis.

**REQ-P-QUAL-022**: Live test diagnosis shall distinguish three product
boundaries: **(a) transport readiness and reliability**, **(b) declared
instruction and response-contract sufficiency**, and **(c) the returned F_P
response or artifact's conformance to that declared contract**. A malformed,
incomplete, contradictory, or missing post-dispatch result shall remain typed
response-admission truth; it shall not be rewritten as transport failure or
explained away solely as prompt insufficiency.

**REQ-P-QUAL-023**: The transport layer shall ensure the agent has **sufficient capability** to execute all operations required by the dispatch contract (read files, write artifacts, run commands). An agent that cannot perform a required operation due to transport configuration is a transport failure, not an agent quality issue.

**REQ-P-QUAL-024**: Transient transport failures (network errors, rate limits, temporary unavailability) shall be **retryable** within the transport layer. The retry budget (count and backoff) shall be bounded. Permanent failures (missing agent, authentication) shall not be retried.

---

## Lineage

**REQ-P-QUAL-019**: Every test file shall carry `# Validates: REQ-P-QUAL-*` tags for the qualification requirements it satisfies. This establishes traceable lineage from intent (INT-005) through requirement (REQ-P-QUAL) to test evidence.

**REQ-P-QUAL-020**: The qualification infrastructure itself shall be subject to F_D tag enforcement (`check-validates-coverage`). Untraceable tests are invisible to the convergence engine.
