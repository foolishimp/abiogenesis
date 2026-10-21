# M05 SDLC Bootstrap Lineage First Slice IACS

**Status**: Active
**Date**: 2026-04-26
**Derived from**: [M05_SDLC_BOOTSTRAP_LINEAGE_DERIVATION.md](./M05_SDLC_BOOTSTRAP_LINEAGE_DERIVATION.md), [M05_QUALIFICATION_DERIVATION.md](./M05_QUALIFICATION_DERIVATION.md), [M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md](./M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md), [T-063](../../.ai-workspace/tickets/completed/T-063-realize-typescript-m05-sdlc-bootstrap-lineage-poc-over-gtl-abg-provenance.md)

## Purpose

Declare the smallest TypeScript carrier set for the
`SDLC_BOOTSTRAP_LINEAGE_001` PoC.

## Boundary

This boundary proves conformant bootstrap ingress and derived-element lineage.
It consumes GTL and ABG truth. It does not redefine GTL graph functions, ABG
runtime events, ABG projection, or ABG traversal authority.

## Irreducible Architectural Carrier Set

This slice is allowed exactly these prime carrier families:

1. `SdlcBootstrapInputSet`
2. `SdlcProject`
3. `SdlcDerivationLedger`

`SdlcDerivationLedger` is prime because lineage is not a formatting detail of
the project. It is the semantic derivation surface that lets SDLC answer why a
project element exists and which source input produced it.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `SdlcBootstrapInputSet` | `M05-qualification-scenarios` | authoritative bootstrap ingress envelope over weak source material | `admitSdlcBootstrapInputSet(input)` | none | `GF_BOOTSTRAP_PROJECT`, project derivation |
| `SdlcProject` | `M05-qualification-scenarios` | authoritative typed project result for the PoC | derived only from admitted input set plus runtime provenance ref | none | unit proof, later SDLC.TS design |
| `SdlcDerivationLedger` | `M05-qualification-scenarios` | authoritative semantic lineage between inputs, assets, elements, and runtime provenance | derived only inside project derivation | none | project element lookup, lineage proof |

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| `SdlcBootstrapInputRef` | subordinate | one item inside the admitted input set | parsed only through `SdlcBootstrapInputSet` |
| `SdlcProjectElement` | subordinate | one element inside one project | derived only as part of `SdlcProject` |
| `SdlcAssetLineageEntry` | subordinate | row inside the derivation ledger | derived only as part of `SdlcDerivationLedger` |
| `SdlcElementLineageEntry` | subordinate | row inside the derivation ledger | derived only as part of `SdlcDerivationLedger` |
| `SdlcRuntimeProvenanceRef` | subordinate | ABG provenance join row, not runtime authority | derived from existing ABG basis/probe truth |
| `SdlcAmbiguityEntry` | subordinate | one ambiguity observation inside one project | derived only as part of `SdlcProject` |
| `GraphFunction` | upstream authoritative | GTL carrier already owns graph-function truth | consumed unchanged |
| `ExecutionBasis` | upstream authoritative | ABG carrier already owns admitted runtime basis | consumed unchanged |
| `TraversalStructureProbe` | downstream diagnostic projection | probe over ABG truth, not SDLC authority | consumed unchanged |

## Rules

- Weak input is lawful only at `admitSdlcBootstrapInputSet(...)`.
- Semantic derivation consumes only admitted `SdlcBootstrapInputSet` truth.
- `SdlcProject` must carry the derivation ledger; lineage must not live only in
  comments or test assertions.
- Runtime provenance is joined through a subordinate
  `SdlcRuntimeProvenanceRef`. It must not become a new ABG event family.
- SDLC project meaning remains in M05 proof code and later SDLC.TS design, not
  in M03 runtime carriers.
- The PoC may construct `GF_BOOTSTRAP_PROJECT`, but it must not make SDLC
  bootstrap a public ABG command.

## Deferred Families

- SDLC.TS tenant public app surfaces
- filesystem/workspace normalization
- live F_P dispatch
- Gap/Triage/Create_Ticket loop
- durable project store
- cross-project lineage index

## Promotion Rule

No subordinate payload may become prime unless it gains independent
identity-bearing authority outside one `SdlcProject` or one
`SdlcDerivationLedger`, and a successor ticket updates this IACS first.
