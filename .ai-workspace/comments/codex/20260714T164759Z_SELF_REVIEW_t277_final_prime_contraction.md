# T-277 Final Prime Contraction Self-Review

**Status**: implementation complete; independent holistic review required

**Baseline**: `d018272f8fb729057aad170aca52b0ad8ac30662`

**Authority**:
`build_tenants/abiogenesis/typescript/design/A5_PRIME_CONTRACTION_CENSUS.md`
and ADR-044

## Scope

This review closes the T-277 implementation pass. It does not close T-277,
ratify its own design, or claim delivery of T-270, T-272, T-268, T-274,
T-275, or T-276 feature work.

The review asks whether Prime contraction reduced maintained authority and
update fan-out while preserving independently addressable public identities,
typed admission, replay boundaries, and package behavior.

## Findings And Repairs

### One remaining Consensus update roster

The first accepted Consensus-family checkpoint had one schema authority but
still repeated all variants through 20 overload declarations, 20 switch cases,
and nine public wrapper admitters. That was type-safe but not Prime: a new
variant required edits outside the schema maps.

The final repair removes all 49 repeated declarations and branches. Public
contracts use one schema-indexed public dispatcher. Graph-private loci use one
separate schema-indexed internal dispatcher. This separation is irreducible:
exporting the internal dispatcher would promote private graph variants into
the package API.

Focused proof now fails if a per-kind switch, named public wrapper roster, or
package export of the graph-private dispatcher returns.

### Generated publication drift

The first full semantic run found four T-223 packed/publication failures. All
four had one cause: five checked-in generated assets were stale after the
native declaration inventory gained the Consensus family.

The canonical publication generator changed only three native inventories and
their derived catalog/manifest digests. The 82 public schemas are unchanged;
the nine T-274 Consensus schemas were not published early. The four failed
T-223 paths then passed as 13 focused checks, including source-blind packed
execution and all seven negative families.

## Measured Result

| Measure | Baseline | Final |
|---|---:|---:|
| Consensus callable declaration sources | 2 | 1 |
| Operation roster/branch authoring surfaces | 7 | 2 |
| Operation schema-definition algorithms | 2 | 1 |
| Capability authoring graphs | 1 | 1; reused, no new carrier |
| Scenario orchestration implementations | 0 | 0; one-driver design fixed before code |
| Substantive Prime gates | 0 | 1 |
| Manual Consensus admission overloads/cases/wrappers | 0 before feature / 49 at first checkpoint | 0 |

Maintained TypeScript under `code/src` is `+1,174/-640`, net `+534`, from the
baseline. The previously absent 574-line Consensus contract family accounts
for the new domain surface: 20 closed variants, nine public identities, two
vocabularies, and two visibility-bounded indexed admission paths. Excluding
that new product surface, the refactor is `+600/-640`, net `-40`.

Test and gate code grew separately because this pass added recurrence guards,
cross-projection negatives, source-removal checks, and Prime governance. It is
not counted as production contraction.

## Source-Removal Evidence

The final source census finds none of the following in their owning surfaces:

- `ConsensusCarrier<...>` or its open `fields` payload
- a per-kind Consensus admission switch or named wrapper roster
- a second authored Consensus callable declaration
- authored `DS1_PUBLIC_OPERATION_IDS` arrays outside the definition register
- `OPERATION_SLUGS`
- the 19-way CLI invocation-construction switch
- duplicate `operationSchemaDefinitions` algorithms

The retained typed SDK behavior dispatch is intentional. Replacing it with a
generic mega-handler required type erasure and failed the accepted
proportionality stop.

## Verification

| Gate | Result |
|---|---|
| semantic lint / GTL law guard | pass; seven C constructors, zero private fan-in imports |
| semantic suite | 1,740 / 1,740 |
| GTL law suite | 82 / 82 |
| T-277 Consensus | 6 / 6 |
| T-223 packed/publication focus | 13 / 13 |
| Prime gate | 7 tickets, 7 accepted designs, 0 pending |
| Mermaid gate | 30 files, 90 diagrams |
| DS governance | 19 tickets, 72 commentary refs |
| public schemas | 82 / 82 current |
| product publication | 40 assets from 1,124 immutable payload files |
| package dry-run | pass; 1,125 entries |

## Open Authority

- T-270 and T-272 implement their accepted runtime-route contractions.
- T-268 extends the existing capability register into manifest coverage.
- T-274 publishes the nine Consensus schema projections and installed catalog.
- T-275 consumes the native Consensus family in the domain implementation.
- T-276 realizes the one-driver installed qualification design.
- T-247/T-248 retain the provisional qualification-journey census row when
  activated.

These are feature owners, not unfinished T-277 commonization code.

## Verdict

T-277 implementation is ready for independent holistic review. The tree has
fewer maintained update surfaces, no replacement mega-controller, no reduced
public identity set, and no premature feature-publication claim. T-277 remains
active until independent review accepts ADR-044, the final ledger, the
source-removal evidence, and the proportionality decisions.
