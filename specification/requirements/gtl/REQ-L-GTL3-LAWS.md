# REQ-L-GTL3-LAWS — Language Laws

**Status**: Active - accepted by T-283 F_H closure
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

State the governing language laws of GTL 3.

## Acceptance Criteria

**REQ-L-GTL3-LAWS-001**: Graph primacy — all workflow structure is graph.

**REQ-L-GTL3-LAWS-002**: Typed node law — local graph meaning is carried by typed nodes.

**REQ-L-GTL3-LAWS-003**: Interface law — composition and substitution are lawful only when interfaces align.

**REQ-L-GTL3-LAWS-004**: Operator/evaluator separation — work and convergence are distinct concerns.

**REQ-L-GTL3-LAWS-005**: Composition associativity — lawful composition groups without changing the outer contract.

**REQ-L-GTL3-LAWS-006**: Identity graph function — an identity graph function preserves the interface.

**REQ-L-GTL3-LAWS-007**: Substitutability — interface-equivalent graph functions are interchangeable at the contract boundary.

**REQ-L-GTL3-LAWS-008**: Contract preservation — refinement may change internals but shall preserve the declared outer contract.

**REQ-L-GTL3-LAWS-009**: Recursion with preserved lineage and explicit foldback — recursive graph application preserves explainable lineage and declared rebinding law.

**REQ-L-GTL3-LAWS-010**: Higher-order legality — fan-out, fan-in, gate, and promote preserve interface and type truth.

**REQ-L-GTL3-LAWS-011**: Separation from hidden strategic choice — GTL exposes lawful structure, candidates, and hooks, not hidden selection.

**REQ-L-GTL3-LAWS-012**: Suitability for event-sourced interpretation — GTL constructs shall be lawfully interpretable by an event-sourced runtime.

**REQ-L-GTL3-LAWS-013**: Engine independence — language semantics do not depend on any single engine implementation.

**REQ-L-GTL3-LAWS-014**: Categorical identity — first-class declarations carry opaque identity distinct from labels, and targeting occurs by identity.

**REQ-L-GTL3-LAWS-015**: Semantic work and execution separation — GTL declares jobs over published graph functions and roles; engines realize runs, workers, materialization, internal traversal, and runtime truth.

**REQ-L-GTL3-LAWS-016**: Governance by hook attachment — GTL exposes governance hook surfaces and opaque configuration rather than tactic prescription or a policy semantic language.

**REQ-L-GTL3-LAWS-017**: Explicit invariant traversal visibility — contract boundaries may visibly declare invariant traversal truth.

**REQ-L-GTL3-LAWS-018**: Replayable hook and publication truth — publication, materialization, hook attachment, and derived bundle truth shall remain inspectable and replayable.

**REQ-L-GTL3-LAWS-019**: Typed diagnostic identity — conformance failure is
typed truth: every conformance diagnostic carries a stable diagnostic identity
from the published closed `GTL_PROGRAM_DIAGNOSTIC_ID_VALUES` vocabulary and
`GtlProgramDiagnosticId` type located by contract group
`abg.contract.abg.m03`, or a declaration-carried identity whose namespace is
admitted from declared policy rows. An unknown identity fails closed at the
diagnostic constructor boundary; declaration-carried identities are validated
against the admitted declaration set as successor law. Diagnostic identities
are stable across releases and are removed only by supersession, not by renaming.

**REQ-L-GTL3-LAWS-020**: Admissible repair affordance — a ratified diagnostic may carry a typed admissible-repair set naming the lawful repair moves for that failure: the repair surface, the smallest lawful edit class, and the governing change class when the repair is constitutional. Repair affordances are typed carriers over declared truth, not prose advice, and they do not perform, select, or authorize the repair.

**REQ-L-GTL3-LAWS-021**: Canonical authored form — an authored GTL program has one canonical data serialization with stable ordering and content-addressable digest identity. Identity canonicalization for digests and the canonical authored form are the same serialization law; alternate orderings or spellings are not rival authored truth.

**REQ-L-GTL3-LAWS-022**: Declarations are data — authored GTL declaration
truth is pure data in the canonical form. A published native constructor may
use total deterministic host-language computation to assemble that data from
explicit typed inputs when the result serializes to the one canonical form,
round-trips through raw admission without loss, and derives the same content
digest. The constructor is authoring syntax, not a second declaration
authority. Declaration content derived from ambient process state, runtime
events, filesystem discovery, randomness, clock time, unstable iteration, or
hidden defaults is drift; so is a module export without an exact canonical
round-trip witness. Conformance rejects those sources at the declaration
boundary.

**REQ-L-GTL3-LAWS-023**: Golden instance binding — a contract declaration may bind ratified example and counterexample instances as admitted data with content digests, promoting the existing evidence-shape and counterexample ref families rather than minting a rival surface. Golden instances calibrate evaluators and supply non-tautology mutation material; they are data, never closure authority.

**REQ-L-GTL3-LAWS-024**: Declared underdetermination — a declaration may mark a scope as deliberately underdetermined with an owning decision route (`F_P` latitude or `F_H` decision). Invention is lawful only inside declared latitude; an undeclared hole is a defect, not permission.

**REQ-L-GTL3-LAWS-025**: Declaration authorship — authored declarations may carry author and authority identity as factory provenance, admitted with the declaration. Authority checks over authorship bind as successor law. Authorship is provenance truth joined to runtime lineage only by reference; it never drives traversal decisions.

**REQ-L-GTL3-LAWS-026**: Evolution vocabulary — requirement relation kinds include supersession; contract and declaration evolution is expressed through the existing relation-kind family rather than a second relation vocabulary. Removal of ratified identities happens only by supersession.

**REQ-L-GTL3-LAWS-027**: Language conformance corpus — the language publishes
one canonical, content-addressed corpus pairing programs with expected
diagnostic identities. The exact product public contract catalog locates its
schema, asset, digest, and diagnostic-vocabulary dependency under
`abg.asset.gtl.language-conformance-corpus`. The corpus is the
implementation-independent oracle: a conforming toolchain replays every entry
to the exact expected identities. A test-only fixture is not publication. The
corpus is distinct from the requirements corpus and qualification evidence.

**REQ-L-GTL3-LAWS-028**: Constitutional surfaces are witnessed data and
drift is a typed conformance failure. A loader witnesses constitutional
surfaces (surface ref, content digest, version disposition, declared version
line, separate version-binding ref, and cited ticket refs), separately
authorized surface-to-subject bindings, and live facts. Version subjects are a
closed tagged family: mutable source project, immutable published RC cut,
tapped release cut, released product, and stamped installed product. These
subjects never substitute for one another. For every versioned surface the
GTL validator shall resolve exactly one binding by binding ref and surface
ref, then exactly one version fact for that binding's exact tagged subject,
before comparing values. Missing, duplicate, or kind-incoherent basis is
`version-basis-unresolved`; a declared version that disagrees with its resolved
same-subject fact is `version-line-drift`. A surface, its path, its version text,
or an inferred latest cut shall not select or fabricate its own version basis.
Active ticket refs and public-seam key sets against the engine passthrough
authority remain live facts: a release-bearing surface citing an active ticket
is `release-claim-cites-active-ticket`; a witnessed surface without a content
digest is `surface-digest-missing`; and a public seam whose key set diverges
from the passthrough authority is `seam-parity-drift`. Version-basis failure
shall not suppress ticket or seam assessment. Each drift diagnostic carries a
ratified identity and an admissible repair from the existing repair vocabulary.
Drift detection shall not be a second checker outside the GTL validator,
and drift rules shall not be prose review checklists.

## Amendment (T-200 P0)

The retryable-failure allowlist (one typed home,
`RETRYABLE_RUNTIME_FAILURE_CLASS_VALUES`) judges uniform C-call spine
outcomes (`REQ-R-ABG3-CCALL-009`): no per-arm classification detours;
evaluator- and composed-arm failures route identically to transform-arm
failures.
