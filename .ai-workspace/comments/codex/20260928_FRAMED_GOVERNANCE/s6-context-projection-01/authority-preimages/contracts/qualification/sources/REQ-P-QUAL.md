# REQ-P-QUAL — Qualification Infrastructure

**Status**: Active - T-283 base; exact Definition-selected STDO qualification basis
**Category**: Verification
**Date**: 2026-07-25
**Derives from**: INT-001 (installed product and release qualification), INT-005 (run governance, failure classification), [PRODUCT.md](../../PRODUCT.md), [SPEC_METHOD.md](stdo://releases/v2.5.0-rc.6/standards/SPEC_METHOD.md) (Verification Layers)
**Wave**: ABG 5.0

---

## Purpose

The test and qualification infrastructure is a product surface with its own correctness requirements. Without formal requirements, failure modes are diagnosed ad-hoc, the same defects recur, and lineage cannot be established from intent through to test evidence.

This requirement establishes the constitutional rules for the qualification infrastructure itself — transport readiness, failure mode separation, artifact integrity, timeout contracts, and forensic evidence. Every test that validates product behavior must itself satisfy these requirements.

Gate applicability follows [Product Release Boundaries](../../PRODUCT.md#50-and-51-release-boundaries).
Standalone Consensus, mandatory host parity, native human response/resume and
whole-run semantic executive oversight are 5.1 qualification claims. Their
deferral does not waive retained local traversal, truthful blocking, runtime
liveness, complete selected F17/S06 outcomes or actual human RC acceptance.

---

## Transport Readiness

**REQ-P-QUAL-001**: An agent skip gate shall verify that the agent is **ready to serve requests**, not merely present on PATH. Readiness means the agent can accept a prompt and return a coherent response within a bounded probe timeout.

**REQ-P-QUAL-002**: When a readiness probe fails, the test shall be **skipped with a diagnostic reason**, not failed. "Agent not ready" is an environment precondition, not a test failure.

**REQ-P-QUAL-003**: The readiness probe shall be the **cheapest reliable check** — a trivial prompt with a deterministic expected response. It shall not perform substantive work or consume significant resources.

---

## Failure Mode Separation

**REQ-P-QUAL-004**: Each failure class in the INT-005 taxonomy (`transport_failure`, `no_output`, `contract_failure`, `certification_failure`) shall produce a **distinct, diagnosable signal** in test output. A test observer shall be able to determine the failure class from the test output alone, without reading source code.

**REQ-P-QUAL-005**: Transport failures (nonzero exit, timeout, crash) shall remain **diagnosable transport truth**. They shall not be masked as artifact quality failures or silently converted to empty output. A preserved artifact may only rescue the turn when ABG deterministically validates it as the authoritative result for that boundary; mere artifact presence is insufficient.

**REQ-P-QUAL-006**: The actual selected transport shall preserve nonzero exit,
crash and timeout as failure with attributable stdout/stderr and process truth;
failed output shall not be admitted as success merely because bytes exist.

---

## Artifact Integrity

**REQ-P-QUAL-007**: If the agent did not write the expected artifact file, the test infrastructure shall raise an **artifact-missing error** with diagnostic context (raw response preview, expected path). It shall not substitute the agent's stdout as the artifact.

**REQ-P-QUAL-008**: The deterministic judge shall only evaluate artifacts that were **written by the agent through the tool surface**, not artifacts synthesized from transport output by the test harness. Fallback masking converts transport/readiness failures into artifact-quality failures, making diagnosis impossible.

**REQ-P-QUAL-009**: When an artifact exists but is below a minimum viable size (e.g., placeholder content), it shall be treated as **no_output**, not as a valid artifact to judge.

---

## Timeout Contracts

**REQ-P-QUAL-010**: Selected test, command, native actor and caller supervision
bounds shall be explicit and proportional to the declared ask, with each
applicable layer identified. No particular test runner or historical default
is mandated.

**REQ-P-QUAL-011**: Enclosing supervision shall allow the selected lower owner
to report its terminal result and preserve failure evidence. A deadline or
process termination shall identify the layer and bound; it shall not be
reported as a completed test or successful qualification.

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

**REQ-P-QUAL-018B**: A persistent run archive shall preserve the sufficient,
exact material for postmortem of its selected installed path: source/artifact
identities, actual requests and results, relevant worksite changes, native
process/command observations, event resource identity and genuine readback or
close receipts where produced. Historical directory names and copying
irrelevant build caches are not requirements; missing terminal evidence
remains explicitly missing.

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

**REQ-P-QUAL-025**: Approval shall include attributable execution evidence for
the changed behavior and its affected owning boundaries, including meaningful
nearest-negative cases. Select the proof level from the supported claim:
component checks do not establish installed outcomes, and export enumeration
or blanket coverage of every never-committed file does not establish behavior.
Still-valid exact-subject evidence may be reused with its scope and identity;
unexercised material changes remain explicit limitations.

## Installed Proof

**REQ-P-QUAL-026**: Any qualification claim of installed Product behavior shall
execute through the packed-and-installed ordinary surface. Source component
checks retain their narrower claims. Historical test-file exemption counts,
private legacy APIs and a particular migration ticket do not define release
qualification or excuse missing current installed evidence.

---

## Release Snapshot Bundles

Release snapshot bundles are release-process output artifacts. They record one
already-qualified published RC cut; later acceptance reports that same cut.
They do not make a version identifier live constitutional project truth or
become an input to the qualification that authorized their creation.

**REQ-P-QUAL-050**: `release.snapshot` / `AF-25` shall materialize each
package-first RC as one immutable, versioned cut and snapshot bundle only after
admission of the exact same-subject and same-law-basis green, non-bypassed
`ExactCandidateQualification<verdict>` projection for its `pre_rc_candidate`.
Its `tapped_release` member shall report qualification and actual human
acceptance of that same unchanged RC, not materialize another cut or snapshot.

**REQ-P-QUAL-051**: The snapshot bundle shall include, at minimum, the package
tarball, release snapshot manifest, checksum file, release note copy when one
exists, package identity, source ref, source commit, build command, pack command,
and verification facts.

**REQ-P-QUAL-052**: The release snapshot manifest shall be the authoritative
read model for the snapshot artifact set produced by its cut. Stray tenant-root
tarballs, dry-run pack output, release-note prose, or the snapshot itself shall
not substitute for the qualification basis, authenticated assessment results, or verdict
that authorized the cut.

**REQ-P-QUAL-053**: Snapshot creation shall fail closed when the source tree is
dirty, when the package identity does not match the requested release identity,
or when the target versioned snapshot root already contains files.

**REQ-P-QUAL-054**: Snapshot creation shall compute and record deterministic
checksums for the package tarball and generated release snapshot files.

**REQ-P-QUAL-055**: Release snapshot tooling shall package an explicit source
root/ref and shall not silently reinterpret the mutable development checkout as
an already tagged release cut.

**REQ-P-QUAL-056**: The release snapshot shall be **self-certifying as a bounded
read model**, not as a second evaluator. Snapshot creation embeds the exact
qualification subject and law-basis refs, complete assessment and execution-evidence citations,
green non-bypassed verdict, build/lint/test outcomes, and parsed test summary in
the release snapshot manifest. It shall not execute or reinterpret those gates.
A red, incomplete, stale, cross-basis, or bypassed result refuses a
RELEASE-GRADE cut. Declared bypass booleans may be honored only for an explicitly
non-release snapshot; a bypassed gate records null evidence and shall never be
represented as green or promotable.

Gap: the current release-snapshot request still accepts build, lint, and test
bypass booleans for a release-grade request. T-247 shall make release-grade
admission reject every mandatory-gate or exact-cut bypass and pin the red and
bypassed differentials before the ABIogenesis 5.0 exact-candidate gate freezes
its qualification input.

## ABIogenesis 5.0 Exact-Cut Qualification

**REQ-P-QUAL-057**: ABIogenesis 5.0 qualification shall use one generic
`ExactCandidateQualification<K>` contract family whose closed subject kinds are
`pre_rc_candidate | installed_rc`. The family shall
publish one immutable, content-addressed `basis` projection and one typed
`verdict` projection for each exact subject. It shall not create separately
authored qualification models for those subjects. Acceptance of the qualified
unchanged RC shall not introduce a third subject kind or final-cut delta.

**REQ-P-QUAL-057A**: Every `ExactCandidateQualification<basis>` projection shall
bind its exact subject kind, source and artifact content, toolchain manifest,
installed-product and workspace-binding truth when applicable,
tenant-conformance manifest, source-grounded coverage catalog, and one subordinate
`QualificationLawBasis`.

**REQ-P-QUAL-057B**: `QualificationLawBasis` shall bind the exact tapped and
installed STDO release identity selected by `stdo_abiogenesis.json`, installed-manifest digest,
standards member-set digest, method version, rule-catalog version, source refs,
and content digests used by the owning gates.
Its identity and digest shall be preserved unchanged through every admitted
authenticated assessment result, the coverage catalog, the declared
`C.of(AF-22)` argument, and the resulting
`ExactCandidateQualification<verdict>` projection.

**REQ-P-QUAL-057C**: The `ExactCandidateQualification<basis>` projection for an
ABIogenesis 5.0 `pre_rc_candidate` shall bind the prospective published-RC
identity and version, the exact installed candidate identity, content and
install-artifact digests, product-manifest digest, workspace binding, and
tenant-conformance manifest identity and digest. The exact candidate artifact
bytes shall already carry that prospective published-RC identity.
Source-tree execution or evidence from different candidate content shall not
satisfy the `pre_rc_candidate` gate. Its prospective RC namespace, declared
profile, Project Subtree, version line and positive ordinal, exact Product
inventory and release-claim bytes shall be fixed before qualification. Actual
tag-object and publication-receipt identities are outputs of publication, not
fabricated prequalification inputs. Acceptance shall not assign a new version
or change those qualified bytes.
An odd_glc candidate or successor dogfood workspace shall not be part of this
5.0 candidate identity.

**REQ-P-QUAL-057D**: A missing, stale, conflicting, incomplete, cross-subject, or
cross-law-basis qualification input shall refuse before verdict admission. A
`ReleaseSnapshotManifest` is output evidence from `AF-25`; it shall never be a
qualification-basis input or supply green truth for the cut that created it.

**REQ-P-QUAL-058**: The exact installed ABIogenesis 5.0 candidate shall satisfy
`ABI5-ROOT-001` through installed `abg.cli`: all ordered obligations `R1`
through `R10` shall bind the same exact product, workspace, catalog, program,
GraphFunction, contracts, execution basis, causal ABG episode, and replay
basis. Replay shall derive the same typed terminal Hello World result and
closed state twice. A component, package, catalog, event-co-presence, or
fixture-authored substitute shall not satisfy the root.

**REQ-P-QUAL-059**: The exact installed ABIogenesis 5.0 candidate shall complete
the primary public operator loop through one admitted GTL One Surface program
traversed directly by HoG. That program shall own the order of the four
semantic authorities `synthesizeModel`, `evalGap`, `evaluateNext`, and
`evaluateAction`. Intent admission, invocation or continuation, and evidence
admission shall remain distinct ABG boundaries around those authorities;
public ingress shall admit and transport the invocation only. The loop shall
start, expose replay-derived frontier and lawful actions, exercise bounded
correction and automatic progression under established authority, refresh
model, gap and next-action truth after admitted evidence, and converge without
a second controller or private import. A no-lawful-next-step case reports a
truthful block and human-readable handoff, not false completion. Native human
response/resume is not part of this 5.0 gate.

**REQ-P-QUAL-060**: The exact installed ABIogenesis 5.0 candidate shall satisfy
`REQ-P-SELF-CONFORMANCE` over its complete frozen constitutional, design,
realization, proof, ticket/execution-contract, public-seam, manifest,
qualification, and release-claim inventory under the exact declared
method/rule/source basis. The real-tree and seeded-negative gates shall pass,
findings and dispositions shall be typed, and the product shall receive no
conformance exemption.

**REQ-P-QUAL-060A**: Reserved for ABIogenesis 5.1. The observer/tuner
qualification described by this clause is not applicable to the ABIogenesis
5.0 candidate, qualification basis, gate inventory, RC, or release. Deferral
does not affect the real-tree and seeded-negative self-conformance required by
`REQ-P-QUAL-060`.

**REQ-P-QUAL-061**: Dedicated Consensus qualification is reserved for 5.1.
It satisfies `REQ-P-CONSENSUS` by invoking the selected installed candidate's
published SYSTEM-owned
Consensus GraphFunction through `abg.cli` over one real ticket and at least two
differently attributed reviewer profiles. It proves agreement closure, dispute
recursion, and round-limit or unresolved-dispute typed block/handoff to F_H
without requiring native response/resume, exercises the
existing, alternate and temporary workspace applications, and exposes the typed
result and replay without source import, feature-specific engine code, or
shell-owned orchestration.

**REQ-P-QUAL-062**: The real specification-driven lifecycle witness defined by
Product F17/S06 and `REQ-P-SCENARIOS-013` shall be required ABIogenesis 5.0
qualification evidence on the exact installed candidate. It binds the
complete original source and prospectively selected witness contract under
Product Release Boundaries, then proves every mandatory selected application
outcome, obligation conservation, admitted semantic and executable evidence and
targeted revision. Intermediate thread/correction evidence, post-result scope
reduction, residual lists or construction/test counts do not substitute for
complete selected S06 acceptance. Full original Data Mapper is a separately
owned upper-bound evaluation under Product Release Boundaries. A truthful
bounded failed or blocked outcome may conclude that evaluation with its actual
assumptions, design choices, iterations, progress, unresolved obligations and
stop cause recorded. It does not satisfy unmet application requirements, waive
generic Product defects, qualify a missing successful S06 witness or compel
another attempt. Publication or maturation of the separate odd_glc
Product, installed 5.0 authoring the distinct 5.0.1 successor, and the planned
5.1 observer/tuner Product shall retain their own exact Product identities,
requirements, design, qualification and release gates; none is required to
make the ABIogenesis 5.0 candidate or final release green.

**REQ-P-QUAL-063**: The exact installed ABIogenesis 5.0 candidate completes its
native public path without Claude, Codex or another marketplace host. Additional
host work and mandatory native/Codex parity qualification are reserved for 5.1.
Any retained compatibility projection uses the same public contract without
direct worker invocation, ABG event authorship, continuation construction,
traversal control or closure decisions. Native LLM worker transport remains a
5.0 dependency; host-projection deferral does not remove it.

**REQ-P-QUAL-064**: Exact-candidate qualification shall conserve every retained
behavior of the fifteen-family Product: ABI5-ROOT-001; compute, structural,
consequence, runtime-disposition and public-control behavior; shape-preserving
fibre substitution; complete C algebra; malformed GTL and F_P refusal;
One Surface; whole-subject F11; native Public projection; and complete selected
S01/S02/S03/S06 outcomes. The source-linked coverage catalog declares these
obligations without an executable slot, ordinal or owning-result requirement
per behavior. Deferred portions require a scoped governing reason and evidence
of retained boundaries; deferral does not qualify the reserved capability or
shrink the selected S06 contract.

**REQ-P-QUAL-064A**: Existing F11 shall bind complete coverage to the exact
qualification subject and law. Actual native results retain their producing
input, declaration, C/J, occurrence and evidence authority. An execution may
support several claims once, but independent judgment shall establish each
claim's applicability, positive/nearest-negative scope and sufficiency against
its source. Neither a shared citation, a green computable assessment, a label,
a test count nor catalog membership supplies that judgment. Missing,
ambiguous, stale, foreign or unexercised required coverage is non-green.

**REQ-P-QUAL-064B**: The declared native `C.of(AF-22)` shall consume the
admitted complete F11 assessment and emit the sole
`ExactCandidateQualification<verdict>`. There is no separate per-behavior
owning-result vector, adapter requirement or replacement reducer/controller.
F11 retains its findings and is not itself the release verdict.

**REQ-P-QUAL-064C**: The verdict shall conserve exact subject/law/coverage and
authenticated F11 result citations, explicit green/red/blocked disposition and
all unresolved re-entry/bypass references. Only a complete same-subject green
verdict with no bypass can admit AF25 or exact installed-RC acceptance.
Development, incomplete and unknown bases remain blocked, not qualified.

**REQ-P-QUAL-065**: Qualification on the supported trusted-developer-desktop boundary shall defend malformed GTL and F_P results, unresolved or incompatible contracts and capabilities, incorrect product identity or binding, source/private-import dependence, and false convergence or release claims. It shall not require hostile-local tamper resistance, a signing service, remote attestation, a hosted marketplace, or repeated adversarial campaigns.

**REQ-P-QUAL-066**: Mandatory Codex projection qualification is reserved for 5.1.
Its parity assessment compares the native and
adapter paths over the same versioned public operation contract. A fixed-result
lane shall compare the declared result digest. A live F_P lane shall compare
the declared response/result schemas and replay-significant invariants, or both
paths may consume one identical recorded admitted result when the gate is
explicitly a transport-independent projection test. Textual output equality is
not required unless the public contract declares it.

**REQ-P-QUAL-067**: Release closure shall fresh-install the published
ABIogenesis 5.0 RC artifact by its verified immutable remote identity, bind its
exact released descriptor, manifest, RC version, digest and tenant-conformance identity,
and pass the bounded installed catalog, public invocation and replay
proof without rebuilding or importing mutable source. This post-publication
result shall be a terminal addendum to the A5-R1 release read model. It shall not
be required to make an earlier `ExactCandidateQualification<verdict>` projection
for `pre_rc_candidate` or `installed_rc` green and shall not reinterpret any
earlier verdict. This proof and acceptance addenda shall leave the RC tag,
package, Product inventory and release-claim bytes unchanged.

**REQ-P-QUAL-068**: The ABG 5.0 release process shall open a mutable RC window.
After one exact `ExactCandidateQualification<basis>` projection for
`pre_rc_candidate` receives its same-subject and same-law-basis green
non-bypassed `ExactCandidateQualification<verdict>` projection, `AF-25` may
verify equality with the basis-bound prospective published-RC identity and
materialize the exact qualified artifact bytes unchanged as one immutable
versioned RC cut and its authoritative snapshot. The RC record shall bind its
assigned Project Release Namespace and declared profile, source lineage,
annotated tag object, peeled commit, repository tree, Project Subtree and tree,
exact Product inventory and release-claim bytes, package, snapshot, checksums,
notes, predecessor disposition and exact authorizing basis and verdict.
Publication-produced tag, receipt and snapshot identities are outputs from this
transition; frozen release-claim and package bytes remain qualifying inputs.
For the assigned `abiogenesis` single-project unqualified profile and subtree
`.`, the immutable cut is `v5.0.0-rc.<n>` and the mutable `v5.0.0` selector shall
identify the greatest published RC ordinal. Exact local and remote refs and
ordinal eligibility shall be revalidated before publication. Selector advance
belongs to publication, not qualification, acceptance or consumer adoption.
Any qualifying Product or release-claim byte change requires a higher RC; no
published RC shall be retagged or renamed to a final-version cut.

**REQ-P-QUAL-068A**: Before human acceptance, the selected published RC shall
be fresh-installed and qualified as an exact `installed_rc`
subject through the same `ExactCandidateQualification<K>` family. Its
`ExactCandidateQualification<basis>` projection shall bind the exact RC cut
bytes and installed identity; its complete coverage assessment and verdict shall preserve
that basis and law basis. A `pre_rc_candidate` verdict shall not be relabeled as
an `installed_rc` verdict. Its same-basis green non-bypassed verdict is required
evidence for actual human acceptance of that same unchanged RC; it shall not
materialize another cut or snapshot. Acceptance is not a prerequisite to this
installed-RC qualification.

**REQ-P-QUAL-069**: Downstream beta evaluation, an odd_glc release, a 5.0.1
dogfood campaign or a planned 5.1 observer/tuner realization shall retain its
own Product authority and explicitly selected exact installed development
Product. Its admission and release are independent of ABIogenesis RC
acceptance; they are neither waived nor made prerequisites or terminal addenda
for the ABIogenesis 5.0 release. Its failure shall block its own claim and may
re-enter ABIogenesis when it exposes a retained 5.0 Product defect. This
independence does not defer or weaken the complete selected F17/S06 lifecycle witness
required before RC authorization by `REQ-P-QUAL-062`.

**REQ-P-QUAL-070**: Actual human Product authority shall accept or withhold one
exact published RC after its required installed-RC qualification, independent
reviews and operator assessment. The decision shall bind the complete
immutable RC identity, exact `installed_rc` basis, same-basis green
non-bypassed verdict and law basis, required evidence, and actual accepting
actor and authority. A caller assertion, generated summary or qualification
verdict alone is not human acceptance. The acceptance record is an addendum
outside the immutable Product and release-claim bytes. `tapped_release` shall
report this same-RC decision; it shall not create a cut, assign a final version,
rename a package or move the selector.

**REQ-P-QUAL-070A**: A change to qualifying Product or release-claim bytes shall
reopen the mutable RC window and require a higher immutable RC. Every affected
owning assessment shall rerun against that new exact subject. Its complete required
coverage and authenticated F11 result shall enter the sole declared `C.of(AF-22)` evaluator; only the resulting
same-subject and same-law-basis green non-bypassed verdict may authorize its
publication. Evidence or acceptance addenda shall not waive gates, alter the
published cut, substitute a changed subject or retroauthorize an earlier effect.

**REQ-P-QUAL-070B**: The release lifecycle shall be acyclic:
`ExactCandidateQualification<basis>` for `pre_rc_candidate` -> matching
`ExactCandidateQualification<verdict>` -> RC cut and snapshot ->
`ExactCandidateQualification<basis>` for `installed_rc` -> matching
`ExactCandidateQualification<verdict>` -> actual human acceptance of the same
unchanged RC -> external acceptance/evidence addenda and terminal
post-publication install proof. Publication advances the latest-RC selector;
acceptance and adoption do not. There is no second final-cut subject or
snapshot. No cut or snapshot may qualify the input that creates it, and no
post-publication proof may retroactively authorize an earlier transition.

---

## Steel-Thread Evidence Sequencing

**REQ-P-QUAL-071**: Construction uses focused build/type, changed module-law and
structural-boundary checks. Authority, identity, admission, effect integrity and
constructability failures on the selected path require resolution before its
dependent effects. Existing valid evidence remains reusable on its exact basis.

Each usable increment receives an early installed integration/end-to-end
discriminator and focused user-outcome assessment. Substantial clean-room UAT
uses the original specification, selected input contract, public documentation
and installed Product with independent expected outcomes. Source hints, private
imports or fixture-owned traversal, retry, admission or event truth cannot
substitute for the public user experience. Observable application behavior and
fresh public result/replay reads support distinct, explicitly bounded claims.

Broad applicable negative matrices, conservation population, interactions and
repeatability are scheduled at integrated qualification. Deferral changes
evidence order, not retained obligations. Material structural/authority failure
or a broken selected sunny-day path returns immediately for lawful re-entry.
One execution may support integration, end-to-end and UAT with separate oracles;
test counts, fixed repetition quotas or redundant campaigns supply no closure.

End-to-end success demonstrates an exercised route, not the absence of another
reachable route. A bounded review of public bindings, exports/loaders, owner
selection, effect paths, HoG traversal and ABG truth checks alternative-path
risk on the affected dependency closure. Pure catalog/readiness functions may
remain eventless. Required independent assessment and proportionate
module-derived unit evidence remain distinct under the selected STDO frames.

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
