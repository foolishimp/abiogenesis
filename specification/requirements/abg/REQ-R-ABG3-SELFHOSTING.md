# REQ-R-ABG3-SELFHOSTING — Successor Use And Derived-Artifact Governance

**Status**: Candidate - T-283 constitutional transaction; not operative until F_H closure
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Apply ordinary graph-function and runtime discipline to derived artifacts and
to post-release successor use. ABIogenesis 5.0 is the stable installed baseline;
using that released product to author or build 5.0.1 is a distinct successor
activity and is not a gate on the 5.0 release.

## Acceptance Criteria

**REQ-R-ABG3-SELFHOSTING-001**: Derived artifacts such as bootloader documents, constraint surfaces, and qualification summaries shall be governed by the same event, replay, provenance, and correction discipline as other runtime work.

**REQ-R-ABG3-SELFHOSTING-002**: Drift between source-of-truth runtime/design surfaces and derived artifacts shall be detectable through deterministic consistency checks.

**REQ-R-ABG3-SELFHOSTING-003**: Derived artifact governance is ordinary graph-function application and runtime truth, not special bootstrap magic.

**REQ-R-ABG3-SELFHOSTING-004**: ABIogenesis 5.0 shall be authored under manual
STDO governance through accepted design gates, GTL admission, GTL validation,
direct HoG traversal, and ordinary in-tree implementation. It shall close through
its specification-method, public-contract, qualification, RC, and release
gates. A predecessor-builds-candidate bootstrap, candidate fixed point, or
downstream catalog-product campaign shall not be required to qualify or release
5.0.

**REQ-R-ABG3-SELFHOSTING-005**: After stable 5.0 and a compatible independently
released odd_glc 1.0 are available, exact installs of those products may act
together as the development product used to author or build the distinct 5.0.1
source project. The installed builder products and the mutable successor source
project shall retain separate product, source, workspace, authority, and
provenance identities.

**REQ-R-ABG3-SELFHOSTING-006**: Successor work performed through installed 5.0
shall enter through published GTL modules and graph functions plus the ordinary
installed catalog, SDK, CLI, runtime, result, and replay contracts. It shall not
introduce a bootstrap-specific controller, private traversal loop, hidden build
service, or mutable-source import into the installed product.

**REQ-R-ABG3-SELFHOSTING-007**: A successor-use invocation shall bind the exact
installed builder identity, exact successor source/input identity, selected
GraphFunction and declaration identities, workspace authority, result contract,
and replay basis. Package presence, an ambient source path, or an adapter hint
shall not supply missing binding truth.

**REQ-R-ABG3-SELFHOSTING-008**: Material produced by successor use shall remain
ordinary typed output with lineage to the installed builder, source/input,
GraphCall, worker, result, and replay identities. Successor output shall not
silently replace either the installed builder product or the mutable source
project that was used as input.

**REQ-R-ABG3-SELFHOSTING-009**: Successor use is a composition over the public
GTL and ABG atom set. ABIogenesis 5.0 shall not publish a special self-host
operation, engine capability, event authority, or closure path whose semantics
duplicate ordinary graph-function execution.

**REQ-R-ABG3-SELFHOSTING-010**: Evidence from installed 5.0 authoring or building
5.0.1 may qualify the 5.0.1 successor and the installed-product development
workflow. It shall not retroactively become release evidence required for the
already qualified stable 5.0 product.

**REQ-R-ABG3-SELFHOSTING-011**: Missing or incompatible builder identity,
workspace binding, declaration, input, result, replay, source-isolation, or
provenance truth shall block the successor-use claim. It shall not block the
stable 5.0 release unless the same defect independently falsifies a retained 5.0
product claim.

**REQ-R-ABG3-SELFHOSTING-012**: A successor workspace may bind an independently
released compatible catalog product, including odd_glc, through the ordinary
multi-product workspace contract. That catalog product remains distinct from
the ABG builder and contributes no runtime, traversal, event, continuation,
retry, or closure authority. Its release or campaign is not a 5.0 release gate.

**REQ-R-ABG3-SELFHOSTING-013**: Any later fixed-point, reproducibility, or
equivalence claim over successor builds shall declare its compared subjects,
inputs, deterministic and nondeterministic fields, equivalence relation, and
proof surface before execution. Stable 5.0 makes no such claim by implication.
