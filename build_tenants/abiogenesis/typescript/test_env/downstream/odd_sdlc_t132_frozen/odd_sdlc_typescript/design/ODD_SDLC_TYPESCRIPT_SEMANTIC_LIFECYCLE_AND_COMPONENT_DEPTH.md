# odd_sdlc TypeScript Semantic Lifecycle And Component Depth

## Status

Active design for T-112 and T-113.

## Position

ABG owns traversal, process execution, traced callout evidence, F_P stage
carriers, replay, retry, reentry, and runtime lineage.

`odd_sdlc` owns SDLC semantic meaning over those substrate facts:
requirements, component topology, code/test materialization interpretation,
testcase allocation, assurance ledgers, gap dossiers, release qualification,
and product-depth parity.

Process success is not semantic success. File existence is not obligation
fulfillment. Worker prose is not closure authority.

## Lifecycle Phases

| Phase | Owner | Carrier | Producer | Consumer | Blocking outcome |
| --- | --- | --- | --- | --- | --- |
| intent admission | odd_sdlc over ABG start | `SdlcPublicStartOutcome`, ABG start intent | CLI/operator adapter | ABG engine | invalid target or unattached worker |
| graph/vector selection | ABG | execution basis, vector probe | ABG runner | installed operator | no selected edge |
| process callout | ABG substrate | traced process result, process archive | traced executor | installed operator | transport failure, timeout, lost terminal |
| transform admission | ABG plus odd_sdlc mapping | `FpTransformResult`, transform artifact | framework after worker exits | odd_sdlc evaluator | missing or malformed artifact |
| deterministic envelope checks | odd_sdlc | postflight result, blocking reason carriers | installed operator | F_P.evaluate, gap dossier | contract violation |
| semantic evaluation | odd_sdlc | assurance ledgers, component-depth admission | assurance gate | satisfaction fold | open gap, block, reprice |
| ledger projection | odd_sdlc over ABG truth | materialization, requirement, component-depth ledgers | assurance gate | gap dossier/release | missing required dimension |
| retry frontier | ABG plus odd_sdlc reasons | satisfaction retry handoff, gap dossier | fold and dossier projection | ABG iteration/reentry | retry exhausted or reprice required |
| graph-span reentry | ABG | traversal attempt envelope and reentry frontier | ABG runner | installed operator | no lawful reentry |
| closure | odd_sdlc domain interpretation | `close_allowed` satisfaction plus release-depth parity | assurance fold | release qualification | not closed |

## Component-Depth Admission

T-113 adds a typed `component_depth_register` transform carrier. The worker may
write markdown for readability, but closure consumes only admitted JSON.

Canonical carrier:

```json
{
  "kind": "sdlc_component_depth_register",
  "registerVersion": "ts-component-depth-v1",
  "targetAssetType": "component_code_surface",
  "componentRealizationRows": []
}
```

Admission is deterministic:

1. The framework reads the transform artifact.
2. It locates a fenced `component_depth_register` JSON block or whole-artifact
   JSON.
3. It validates the closed carrier shape.
4. It checks that the carrier target matches the current graph-function target.
5. It requires the row family for that target surface.
6. It returns an admitted register or typed blocking reasons.

No LLM judgement participates in carrier admission.

## Component-Depth Closure Law

The `component_depth` assurance dimension compares admitted rows against
observed framework truth.

Implementation component topology closes only when component rows have stable
component ids, file paths, public boundaries, requirement allocation, and source
asset refs.

Component code closes only when component realization rows map to non-empty
materialized source files. Multiple component ids collapsed into one file are
not accepted unless a future typed deferral carrier explicitly admits that
collapse.

Test component topology closes only when test class rows preserve testcase ids,
component ids, and requirement ids.

Component tests close only when test rows map to non-empty materialized test
files and preserve testcase/component allocation.

Component test qualification closes only when execution evidence maps back to
test class ids, testcase ids, component ids, and requirement ids.

Release depth parity closes only when `releaseDepthParity.status` is `met`.
`blocked` produces repair pressure. `repriced` produces design reframe pressure.

## Composite Surface Authority

`code_surface` is the aggregate governed code surface. `component_code_surface`
is the materialized component implementation boundary.

`test_design_surface` is the composite test-plan authority. `component_test_surface`
is the materialized component-test boundary.

`worker_result_report.json` remains a framework-generated read model. It does
not own closure. The authoritative path is:

```text
process outcome -> transform admission -> typed register admission ->
postflight checks -> assurance ledgers -> satisfaction fold -> gap/release
projection
```

## Test35 Alignment

The Python test35 line forced production-shaped code because component and test
topology were constructive prerequisites before code/test/release. The
TypeScript line restores that pressure through graph functions and typed
postflight law rather than copying Python file structure.

The restored TypeScript mechanism is:

```text
component topology -> component schedule -> component code ->
component realization qualification -> test topology -> component tests ->
component test qualification -> release depth parity
```

This is not line-count parity. It is topology, materialization, testcase
allocation, execution mapping, and release interpretation parity.
