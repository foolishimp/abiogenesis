# REQ-L-GTL3-ASSET-SURFACE — Typed Asset Interface Law

**Status**: Active
**Category**: Capability / Constraint
**Date**: 2026-06-06
**Derives from**: [SPEC_METHOD.md](../../../.genesis/docs/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ODD_METHOD.md](../../../.genesis/docs/standards/ODD_METHOD.md), [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define `AssetSurface` as the GTL-owned typed asset interface subordinate to
existing topology carriers. `AssetSurface` declares asset shape, authority,
constructor, renderer, policy, and proof contracts for a node locus or other
published GTL boundary without becoming a new public work carrier.

## Acceptance Criteria

**REQ-L-GTL3-ASSET-SURFACE-001**: `AssetSurface` shall remain subordinate GTL declaration truth hosted by existing carriers such as `Node`. It shall not become a new topology object, public execution target, or rival `GraphFunction`/`Job` carrier.

**REQ-L-GTL3-ASSET-SURFACE-002**: `AssetSurface` shall preserve the existing fields `kind`, `requiredContexts`, `standardsRefs`, and `outputContractRefs`.

**REQ-L-GTL3-ASSET-SURFACE-003**: `AssetSurface` may declare typed constructor references, constructor input asset kinds, renderer references, rendered-view digest policy, and proof obligation refs for an asset kind.

**REQ-L-GTL3-ASSET-SURFACE-004**: A renderer-backed asset surface may declare section kinds and clause kinds as subordinate rendered-view structure. Section and clause kinds are asset-interface metadata, not a new language ontology.

**REQ-L-GTL3-ASSET-SURFACE-005**: A prompt-like or renderer-backed asset surface may declare generic authority slots. Each slot shall carry an opaque authority-kind ref and a disposition label of `normal`, `bounded_fallback`, or `forbidden_routine`. GTL owns the slot shape and disposition labels; downstream products own the specific authority-kind vocabulary and assignment policy.

**REQ-L-GTL3-ASSET-SURFACE-006**: Any `bounded_fallback` authority slot declared by an `AssetSurface` shall have at least one fallback precondition ref. GTL admission shall validate that shape. Runtime enforcement of whether a concrete authority packet lawfully uses the fallback slot belongs to ABG/downstream assurance policy.

**REQ-L-GTL3-ASSET-SURFACE-007**: `forbidden_routine` authority slots declared by an `AssetSurface` shall be preserved through publication, admission, and serialization so deterministic consumers can enforce declared policy without inferring semantics from rendered text.

**REQ-L-GTL3-ASSET-SURFACE-008**: `AssetSurface` declaration admission shall validate metadata shape only: refs, slot dispositions, fallback precondition presence, constructor/renderer refs, and proof obligation refs. It shall not decide product-specific authority vocabulary, accepted prompt content, or runtime packet legality.

**REQ-L-GTL3-ASSET-SURFACE-009**: Rendered text, markdown, terminal output, or UI presentation derived from an `AssetSurface` is a view. It shall not outrank the typed asset-surface declaration, constructor refs, authority slots, or proof obligations.

**REQ-L-GTL3-ASSET-SURFACE-010**: Deterministic interpreters may validate declared asset-surface metadata, schema, refs, digest policy, authority-slot shape, and fallback-policy shape. They shall not infer semantic meaning from rendered text to classify prompt clauses, asset obligations, or product behavior.

**REQ-L-GTL3-ASSET-SURFACE-011**: GTL publication and interpretation surfaces shall preserve the full `AssetSurface` interface without semantic loss across constructor, admission, serialization, module publication, and graph-function chain composition.

**REQ-L-GTL3-ASSET-SURFACE-012**: Asset surfaces used by the ABG executive
observer shall bind target workspace availability through existing
`requiredContexts` and proof-obligation refs. They shall not create a separate
observer asset ontology or make rendered workspace summaries authoritative
over typed context, payload, evidence, span-lineage, and projection refs.
