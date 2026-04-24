# M05 Installed Sandbox First Slice IACS

**Status**: Completed
**Date**: 2026-04-24
**Derived from**: [M05_INSTALLED_SANDBOX_DERIVATION.md](./M05_INSTALLED_SANDBOX_DERIVATION.md), [M05_QUALIFICATION_FIRST_SLICE_IACS.md](./M05_QUALIFICATION_FIRST_SLICE_IACS.md), [ABG_COMMON_DELIVERY_LIBRARY_FIRST_SLICE_IACS.md](./ABG_COMMON_DELIVERY_LIBRARY_FIRST_SLICE_IACS.md), [T-022](../../.ai-workspace/tickets/completed/T-022-realize-typescript-m05-installed-sandbox-live-lane-and-archive-proof-under-explicit-installed-runtime-qualification-law.md)

## Purpose

Declare the second TypeScript `M05-qualification-scenarios` slice as an
explicit carrier inventory so installed-line proof, installed live-lane proof,
and archive proof remain closed and separate from the completed delivery and
runtime modules they consume.

## M05 Installed-Sandbox First Slice Boundary

The second TypeScript `M05` wave is:

- one installed-sandbox qualification request carrier
- one installed-sandbox qualification outcome family
- one run-archive qualification request carrier
- one run-archive qualification outcome family
- one bounded installed-line qualification kernel extending `M05`

This wave does **not** include:

- real external-agent transport or readiness probing
- entropy campaigns or repeated statistical qualification
- release automation or packaging publication
- alternate-runtime mapping

## Upstream Authoritative Carriers Consumed By Installed M05

This slice does not redefine delivery or app truth.

The following remain authoritative upstream truth and are consumed unchanged:

- `PublicInstallBootstrapOutcome`
- `PublicBootloaderOutcome`
- `DeliveryPlan`
- `DeliveryVerification`

Installed `M05` evaluates qualification truth over those completed delivery
surfaces plus installed-line observations. It does not recreate install or
bootloader semantics itself.

## Irreducible Architectural Carrier Set

The installed `M05` slice is allowed exactly these prime carrier families:

1. `InstalledSandboxQualificationRequest`
2. `InstalledSandboxQualificationOutcome`
3. `RunArchiveQualificationRequest`
4. `RunArchiveQualificationOutcome`

Explicit pass or reject variants are members of the two outcome families
rather than separate outer carrier families.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `InstalledSandboxQualificationRequest` | `M05-qualification-scenarios` | authoritative installed-line proof request | test/support harness admits delivered root observations and installed execution results | none | installed-sandbox qualification kernel |
| `InstalledSandboxQualificationOutcome` | `M05-qualification-scenarios` | authoritative installed-line proof outcome family | derived from admitted installed request only | none | install integration lane, live-lane integration lane, closure review |
| `RunArchiveQualificationRequest` | `M05-qualification-scenarios` | authoritative archive-proof request | test/support harness admits stable archive-root observations | none | archive qualification kernel |
| `RunArchiveQualificationOutcome` | `M05-qualification-scenarios` | authoritative archive-proof outcome family | derived from admitted archive request only | none | archive integration lane, closure review |

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| `InstalledRootObservation` | subordinate | installed delivery detail nested under one installed request | admitted once into `InstalledSandboxQualificationRequest` |
| `InstalledSandboxStepRef` | subordinate | per-step proof detail only | derived only from installed qualification evaluation |
| `InstalledSandboxQualificationPassed` | prime family variant | explicit installed outcome variant | pattern-matched as part of `InstalledSandboxQualificationOutcome` |
| `InstalledSandboxQualificationRejected` | prime family variant | explicit installed outcome variant | pattern-matched as part of `InstalledSandboxQualificationOutcome` |
| `RunArchiveFileRef` | subordinate | archive file detail nested under one archive request | admitted once into `RunArchiveQualificationRequest` |
| `RunArchiveGapRef` | subordinate | rejection detail only | derived only from archive qualification evaluation |
| `RunArchiveQualificationPassed` | prime family variant | explicit archive outcome variant | pattern-matched as part of `RunArchiveQualificationOutcome` |
| `RunArchiveQualificationRejected` | prime family variant | explicit archive outcome variant | pattern-matched as part of `RunArchiveQualificationOutcome` |
| method-trace and source-tree fake-lane carriers | already completed | prior `M05` slice, not installed-line truth | consumed indirectly through completed `T-021` |
| external live-agent transport carriers | deferred | later qualification refinement, not this installed-line slice | successor ticket only |
| entropy or repeated-run statistics | deferred | later qualification refinement, not this installed-line slice | successor ticket only |

## M05 Installed-Sandbox First Slice Rules

- `InstalledSandboxQualificationRequest` is the only lawful first-slice carrier
  for installed-line proof over completed `M04` delivery surfaces.
- `InstalledSandboxQualificationRequest` consumes already observed delivery and
  execution truth; it does not call installers or writers directly.
- installed-line proof must fail closed when the delivered root is incomplete,
  unbound, or not importable through the installed package surface.
- `InstalledSandboxQualificationRequest` may use a bounded local package
  binding step for installed proof, but that binding remains subordinate and
  test/support owned rather than becoming a rival delivery semantic center.
- `RunArchiveQualificationRequest` is the only lawful first-slice carrier for
  archive-shape proof over stable installed run roots.
- archive proof must validate stable run metadata, summaries, stdout/stderr,
  event logs, and workspace artifacts.
- this slice proves installed-line and archive shape only. External live-agent
  transport remains deferred.

## Promotion Rule

No subordinate payload may be promoted during this installed `M05` wave unless:

1. it acquires independent public or persisted authority,
2. it crosses more than one module boundary unchanged, and
3. the promotion is recorded here and in `T-022` before code lands.
