# ODD SDLC TypeScript Evaluation Grid Contract

Status: active design surface

Implements: REQ-F-ODDSDLC-088, T-192

## Purpose

Evaluation is a typed grid, not a mini-SDLC embedded in one evaluator prompt.
The logical contract crosses declared transform units with evaluation
dimensions. Small products may physically fuse the grid into one prompt, but the
typed prompt asset still carries the grid, scoped carriers, expected findings,
and ABG fold input refs.

## Boundary

odd_sdlc owns:

- transform-unit and evaluation-dimension declarations for SDLC edges
- scoped disambiguation-carrier refs projected from admitted SDLC authority
- evaluator prompt construction over typed prompt assets
- evaluation finding carrier interpretation

F_P owns:

- bounded local semantic judgment for cell dimensions
- declared relation checks when the relation requires semantic judgment
- emitting typed findings with segment/dimension/carrier/evidence refs

F_D/GTL own:

- typed carrier construction
- rendered prompt views
- structural ref-set coverage checks
- prompt sidecar publication

ABG owns:

- admission, replay, runtime facts, continuation, and fold
- redispatch/block/close selection through the ABG iteration-outcome fold

ABG and F_D do not comprehend product semantics. F_P does not write ABG events,
ledgers, continuation decisions, or closure authority.

## Structural Carrier Shape

```text
SdlcEvaluationGridContract
  kind: sdlc_evaluation_grid_contract
  logicalGridRef
  physicalExecution: fused_prompt | bounded_cells
  transformUnits[]: SdlcTransformUnitRef
  evaluationDimensions[]: SdlcEvaluationDimensionRef
  disambiguationCarriers[]: SdlcDisambiguationCarrierRef
  expectedFindingRefs[]
  abgOutcomeFoldRef
  provenanceRefs[]

SdlcTransformUnitRef
  unitRef
  segmentKey
  sourceAssetRefs[]
  targetAssetRefs[]

SdlcEvaluationDimensionRef
  dimensionRef
  scope: cell | fold | relation
  expectedFindingRef

SdlcDisambiguationCarrierRef
  carrierRef
  scopeRef
  authoritySnapshotRefs[]
  priorFindingRefs[]
  lineageRefs[]
```

## Flow Diagram

```text
admitted transform decomposition
  + traversal-hop / proportionality evidence
  + target carrier / obligation refs
  + prior admitted findings / lineage refs
    -> build SdlcEvaluationGridContract
    -> construct prompt clause rows
    -> construct GTL AssetSurface + Node
    -> render prompt view
    -> F_P evaluator emits EvaluationFinding rows
    -> ABG admits findings + runtime facts
    -> ABG iteration-outcome fold
    -> close | block | suspend | redispatch(target segment/dimension)
```

## State Diagram

```text
[grid contract admitted]
  -> [physical execution selected]
  -> [fused prompt or bounded cell prompts]
  -> [typed findings emitted]
  -> [findings admitted]
  -> [ABG fold]
      -> [converged]
      -> [blocked]
      -> [suspended]
      -> [redispatch segment/dimension]

[grid contract invalid]
  -> [operator blocks before evaluator dispatch]

[F_P evaluator process failure]
  -> [runtime fact admitted]
  -> [ABG fold chooses block/suspend/redispatch according to runtime policy]
```

## Constructor Pseudocode

```text
constructEvaluationGrid(input):
  units = projectTransformUnits(input.targetCarrier, input.decomposition)
  dimensions = declaredDimensions(input.promptFamily, input.targetAssetType)
  carriers = units x dimensions scoped to admitted authority refs

  assert every dimension has scope cell | fold | relation
  assert coverage dimensions have scope fold
  assert every cell has a scoped carrier
  assert expectedFindingRefs cover units x dimensions

  return SdlcEvaluationGridContract(
    physicalExecution = fuseWhenSmall(units, dimensions),
    transformUnits = units,
    evaluationDimensions = dimensions,
    disambiguationCarriers = carriers,
    abgOutcomeFoldRef = abiogenesis T-149 fold ref
  )

constructPrompt(input):
  grid = constructEvaluationGrid(input)
  sections = constructPromptSections(input, grid)
  surface = GTL.AssetSurface(sections, grid refs, authority policy)
  return rendered Markdown view + prompt invocation sidecar
```

## Cell, Fold, And Relation Rules

Cell dimensions are local F_P questions. A dimension is a cell only when it can
be decided from one transform unit, the current target slice, and that cell's
scoped disambiguation carrier.

Fold dimensions are structural reductions over typed refs and admitted findings.
Coverage is a fold. Coverage checks whether declared segment obligation refs
tile the obligation set without gaps; it does not judge product meaning.

Relation dimensions bind two or more typed refs. Cross-segment trace is a
relation. It may require a narrow F_P judgment over the relation, but it must
not force every local cell to load the full graph.

## Physical Fusion

Physical fusion is a runtime optimization. The logical grid remains present.

```text
logical 1 x k grid + small prompt budget -> one fused evaluator prompt
logical n x k grid or high complexity    -> bounded cell/relation prompts
```

Config may tune fusion thresholds and runtime budgets. Config does not change
the logical contract or remove typed finding refs.

## ABG Fold Reuse

GridFold is not a second odd_sdlc outcome decider. The grid contributes typed
finding rows and runtime facts to the ABG iteration-outcome fold introduced by
the T-149 ABG work. If ABG cannot target redispatch at a segment/dimension, the
required change is an abiogenesis substrate ticket and release dependency.

## Invariants

- rendered prompt text is a view over typed prompt assets
- no prompt constructor slices already-rendered Markdown to recover authority
  sections
- no evaluator prompt asks F_P to reconstruct global coverage, closure, and
  local semantic judgment as one untyped task
- raw bootstrap and raw intent are bounded fallback authority, not routine
  evaluator context
- coverage is structural over refs; semantic satisfaction remains F_P finding
  work
- ABG owns continuation; odd_sdlc maps domain findings to typed ABG fold inputs
