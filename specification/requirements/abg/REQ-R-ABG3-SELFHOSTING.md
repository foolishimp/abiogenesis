# REQ-R-ABG3-SELFHOSTING — Self-Hosting And Fixed-Point Governance

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define the installed two-stage bootstrap by which ABIogenesis builds and proves
its next release candidate. Apply the same runtime discipline to derived
artifacts and bootstrap surfaces as to all other governed work.

## Acceptance Criteria

**REQ-R-ABG3-SELFHOSTING-001**: Derived artifacts such as bootloader documents, constraint surfaces, and qualification summaries shall be governed by the same event, replay, provenance, and correction discipline as other runtime work.

**REQ-R-ABG3-SELFHOSTING-002**: Drift between source-of-truth runtime/design surfaces and derived artifacts shall be detectable through deterministic consistency checks.

**REQ-R-ABG3-SELFHOSTING-003**: Derived artifact governance is ordinary graph-function application and runtime truth, not special bootstrap magic.

**REQ-R-ABG3-SELFHOSTING-004**: The ABIogenesis 5.0 bootstrap predecessor,
`P4`, shall be the exact released
`@abiogenesis/typescript-tenant@4.6.0-rc.3` product whose release-tarball
SHA-256 is
`9cffb372c0dfc00983a5d0e882efbc3d0c3ac937a56f313000f35a4473358113`.
`I4` shall be an installed `P4` selected by that package identity,
release-tarball digest, and `product-toolchain-manifest.json` SHA-256
`92b3f94dd32bca9368a9511d823cc8b6e2eae75cd7168c9e901d3cbe8eadf07d`.

**REQ-R-ABG3-SELFHOSTING-005**: `S5` shall be one frozen ABIogenesis 5.0 source project used as the declared build input for both bootstrap stages.

**REQ-R-ABG3-SELFHOSTING-006**: `B5` shall be one immutable ABG-owned,
specialized serialized GTL Module governed by
`abg.schema.self-build-program-manifest`. Its Module metadata shall declare
kind `self_build_program_manifest`, schema version, identity, version, digest,
selected GraphFunction reference and digest, compatibility with exact `P4`/`I4`
and the ABIogenesis 5.0 candidate line, the `S5` input-root contract, result and
equivalence surfaces, and required plugin and capability references. B5 shall
not introduce a rival executable envelope around the GTL Module.

**REQ-R-ABG3-SELFHOSTING-007**: Exact I4 shall admit the frozen B5 Module bytes
through its released public Module, StartIntent, execution-basis, event, and
callable-start contracts. An installed 5.0 candidate shall re-admit those exact
same B5 bytes as declaration and data through its public catalog and source-
product input. Neither leg may import executable runtime, provider, plugin,
controller, or private helper code from `S5`; no adapter may make I4 appear to
implement a 5.0 catalog operation it does not publish.

**REQ-R-ABG3-SELFHOSTING-008**: The first bootstrap stage shall execute `I4 + B5 + S5` to convergence and produce candidate `C1`. `I1` shall be an installation of exact `C1` with no mutable `S5` import or source fallback.

**REQ-R-ABG3-SELFHOSTING-009**: The second bootstrap stage shall execute `I1 + same B5 + same S5` to convergence and produce candidate `C2`. The stage-two invocation shall re-admit the exact `B5` identity and digest under its declared 5.0 compatibility predicate.

**REQ-R-ABG3-SELFHOSTING-010**: `C1` and `C2` shall be equivalent across release-significant package identity, exports, compiled behavior, tenant-conformance result, install and catalog manifests, runtime binding meaning, and declared `B5` input and output meaning. Nondeterministic fields shall be declared and shown irrelevant; surfaces declared deterministic shall compare byte for byte.

**REQ-R-ABG3-SELFHOSTING-011**: `R5` shall be the exact `C1` content frozen as
the ABIogenesis 5.0 self-hosted source candidate only after both stages converge,
source isolation passes, and `C1`/`C2` equivalence passes. `R5` enters the
release-candidate window; it is not itself a published versioned RC or tapped
release. `C2` is the fixed-point witness and shall not become a second source candidate.

**REQ-R-ABG3-SELFHOSTING-012**: A missing or incompatible bootstrap identity, manifest, capability, input root, result, convergence fact, source-isolation fact, or equivalence fact shall block the self-hosting claim and the release cut. It shall not be waived, inferred from package presence, or repaired by a bootstrap-specific controller.

**REQ-R-ABG3-SELFHOSTING-013**: The `P4`/`I4` compatibility obligation is
bounded to admitting and executing the frozen B5 Module/GraphFunction through
the public GTL/runtime semantics shared with the 5.0 candidate line. I4 binds
and starts through its released public contracts; the 5.0 candidate additionally
uses its catalog/SDK contract. Stage-one success shall not imply that `P4`
implements any DS-1 operation or the complete ABIogenesis 5.0 contract.
