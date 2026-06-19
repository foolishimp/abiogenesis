# ODD SDLC GTL Prompt Asset Projection

Status: active design surface

Implements: REQ-F-ODDSDLC-087, T-191

## Purpose

Prompt text is contract code, but it is not the governing authority surface.
Production worker prompts are rendered views over GTL `Node` carriers with an
`AssetSurface` admitted by the released abiogenesis TypeScript tenant.

The GTL surface owns the structural prompt asset interface. odd_sdlc owns only
the product overlay: prompt-family authority policy, clause construction, and
rendering for transform, design-depth evaluator, and review-grade evaluator
prompts.

## Boundary

F_D may:

- construct a GTL `AssetSurface` from selected edge facts
- construct a GTL `Node` carrying that surface
- carry authority packet refs, method-compression refs, tool/effect policy refs,
  output-carrier refs, obligation refs, proof refs, section rows, and clause rows
- validate SDLC authority policy over declared clause metadata
- render Markdown from admitted GTL-bound prompt rows

F_D must not:

- infer clause authority by parsing already-rendered Markdown
- inspect product authority to decide product meaning
- prescribe a deterministic semantic extraction recipe to `F_P`
- use raw bootstrap or raw intent as routine evaluator input
- recreate an SDLC-local prompt asset register or admission layer beside GTL

## Carrier Flow

```text
edge contract
  + work-category governance
  + worker construction brief
  + invocation package / worker report
  + obligations / target carrier / tenant tool policy
  + installed method compression refs
    -> prompt-constructor://odd-sdlc/<family>/v1
    -> SDLC prompt section/clause rows
    -> GTL AssetSurface
    -> GTL Node
    -> SDLC prompt invocation sidecar
    -> rendered Markdown view
    -> worker_prompt.md | design_depth_fp_evaluator_prompt.md |
       review_grade_edge_fulfillment_prompt.md

SDLC prompt invocation sidecar
  -> *_prompt_asset.json
  -> archive/read-model proof for provenance and authority compression
```

## State Diagram

```text
[edge facts selected]
  -> [construct SDLC prompt clause rows]
  -> [validate SDLC authority overlay]
  -> [construct GTL AssetSurface]
  -> [admit GTL AssetSurface]
  -> [construct GTL Node]
  -> [render Markdown view]
  -> [write prompt + prompt_asset sidecar]
  -> [worker/evaluator consumes Markdown]
  -> [post-run review audits sidecar + prompt digest]

[SDLC overlay validation fails]
  -> [operator blocks before worker dispatch]

[GTL shape admission fails]
  -> [operator blocks before worker dispatch]
```

## Constructor Pseudocode

```text
constructPromptProjection(input):
  policy = authorityPolicy[input.promptFamily]
  clauseRows = input.sections.map(section =>
    section.clauses.map(clause =>
      prompt_clause_row(
        textLines = clause.textLines,
        authorityKindRefs = clause.authorityKindRefs,
        fallbackPreconditionRefs = clause.fallbackPreconditionRefs,
        provenanceRefs = [REQ-F-ODDSDLC-083, REQ-F-ODDSDLC-087,
          REQ-L-GTL3-ASSET-SURFACE, PRODUCT prompt law],
        expectedOutcome = clause.expectedOutcome
      )
    )
  )

  validateSdlcAuthorityOverlay(clauseRows, policy)

  renderedPrompt = renderHeader(input, methodCompressionRefs)
    + renderClauseRows(clauseRows)
  digest = sha256(renderedPrompt)

  surface = GTL.constructAssetSurface(
    authoritySlots = policy.normal + policy.bounded + policy.forbidden,
    constructorRefs = [input.constructorRef],
    rendererRefs = [prompt-renderer],
    sectionKindRefs = section roles,
    clauseKindRefs = clause modes,
    standardsRefs = methodCompressionRefs,
    outputContractRefs = input.outputCarrierRefs,
    proofObligationRefs = input.proofObligationRefs
  )
  GTL.admitAssetSurface(surface)

  node = GTL.constructNode(assetSurface = surface, schema = prompt schema)

  return {
    promptText: renderedPrompt,
    invocationAsset: {
      kind: "sdlc_prompt_invocation_asset",
      gtlNode: node,
      promptSections: clauseRows,
      renderedPromptDigest: digest
    }
  }
```

## Authority Compression

Normal authority kinds:

- product definition
- requirements
- admitted design
- typed obligations
- target carrier
- tenant stack authority
- worker report evidence
- materialization evidence
- execution evidence
- tool/effect policy
- installed method compression

Bounded fallback authority kinds:

- bootstrap provenance
- intent fallback
- runtime forensics

Forbidden routine authority kinds:

- sibling workspace history

The odd_sdlc family policy is the single source for normal, bounded fallback,
and forbidden prompt authority. GTL receives these as opaque authority-kind refs
with generic disposition labels; it does not know or interpret SDLC policy
values.

## Production Prompt Families

- `transform`: writes `worker_prompt.md` and `worker_prompt_asset.json`
- `evaluate_design_depth`: writes `design_depth_fp_evaluator_prompt.md` and
  `design_depth_fp_evaluator_prompt_asset.json`
- `evaluate_review_grade`: writes `review_grade_edge_fulfillment_prompt.md` and
  `review_grade_edge_fulfillment_prompt_asset.json`

All three families use installed method-compression refs under:

`workspace://.abiogenesis/docs/standards/authority_compressions/`
