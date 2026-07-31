# AGENTS.md

## Operating Mode

- Act within the current Product outcome selected by `specification/GOALS.md`
  and the active T-270 execution contract.
- Specification and requirements define WHAT. Accepted design and build
  tenants define HOW.
- Comments, reviews, completed tickets, donor branches, generated views, test
  counts, and implementation momentum do not select work.
- Preserve working behavior, but do not preserve an invalid closure claim.
- Do not begin a later Product outcome until GOALS selects it.
- More specific `AGENTS.md` files may further restrict their subtree.

## Worker And Reviewer Separation

- The worker may reason and revise privately while authoring one coherent cut.
- Worker readiness checks are mechanical only: tests, formatting, hashes,
  traceability, and rendering.
- The worker does not issue semantic review verdicts, publish intermediate
  review posts, or recursively refreeze candidates.
- Freeze one exact subject, produce one handoff, and stop editing.
- Independent reviewers assess that subject. Consolidate their findings into
  at most one bounded repair pass.
- A finding that changes Product meaning, requirements, the 18/56 family, or
  materially different authority structure returns to F_H; it does not
  authorize another autonomous patch-review loop.

## Current Gate

The sole current Product implementation outcome is:

```text
close ABG5-S06
  -> frozen exact STDO 2.2.2 authority baseline 8a4630e8 / 0e5281c2
  -> accepted exact census blob efe88cac
  -> rejected frozen Gate 1 candidate ba2e39a4 / 3d5686d4
  -> rejected replacement 29aea26d / 057e4d5f on AX-F09 ingress
  -> direct F_H outcome-level Gate 1 completion envelope
  -> reviewed complete candidate 2a60c2b7 / fc19ebdf
  -> current: one bounded full-retry-frontier repair frozen for delta reviews
  -> held Gate 1 acceptance and all semantic implementation
  -> held falsifier, realization, projection, and installed Product proof
  -> under T-281 and parent T-270
```

Candidate `8865ccff844d06f4f97765f014ae2b59c1e7d84b` is accepted through S03.
The S05 design is directly accepted at `283325aa`; S05 realization is accepted
at `1ddc802d`. S06 implementation candidates `4f9bf707` and `51664393` are
returned evidence.
Native declaration design candidate `b645595c`, tree `130af566`, is also
returned. Its three findings are repaired together at replacement candidate
`4f80f84a`, tree `7070dca7`, under
`M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN.md`, and that exact design is directly
accepted. Its bounded Section 8 realization at candidate `4953508d`, tree
`cd8bf69d`, is returned evidence. Supplemental design
`M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md` at
`8eb7564c`, tree `9c753f86`, is returned evidence. Its contracted replacement
at `2bb7b594`, tree `c57c237e`, is the accepted parent. Its digest cycle is
partially repaired at returned candidate `5770755a`, tree `77842794`.
Catalog-preserving candidate `458ce3c2`, tree `b5c7a1eb`, is returned.
Replacement candidate `356aa6a2`, tree `4af5ada4`, defines the family-derived
nested contract join, exposes mandatory catalog gaps, assigns their later
completion to T-270 before unified M5, and removes the undefined pre-family
witness digest. It is returned because its 44-row residual does not cover the
complete public-contract publication predicate. Candidate `844df3fc`, tree
`c48e9df9`, is returned because it pulls later T-270 publication assurance
into S06 without a complete satisfaction relation. Bounded replacement
`8dc59264`, tree `77a7ee37`, is returned because catalog-binding refusal and
common pre-index parse refusal remain underconstrained. Replacement
`aa0daa62`, tree `9fa25663`, closes those two refusal relations and corrects
the PFC-F05 aliases. Direct human authority accepted that exact design as
predecessor evidence. Its former Section 11 realization permission is held.
The STDO 2.2.2 authority baseline is frozen and verified at `8a4630e8`, tree
`0e5281c2`. Direct F_H accepted exact census blob `efe88cac` and authorized
bounded Gate 1 authority/design/map construction only. Frozen candidate
`ba2e39a4`, tree `3d5686d4`, was rejected by the required reviews on five
bounded relations. Replacement `29aea26d`, tree `057e4d5f`, repaired four but
was rejected because its selected `run.continue/current_intent` ingress cannot
consume the cited retry frontier. Direct F_H then authorized completion of
Gate 1 inside the accepted Product and STDO 2.2.2. The worker owns missing
owner-internal HOW that adds no Public operation, rival authority, controller,
runtime, catalog, or Product meaning. Complete candidate `2a60c2b7`, tree
`fc19ebdf`, passed constructability review; authority review found one local
omission of the complete prior-attempt retry frontier. The one permitted
bounded repair is consumed and frozen for delta review. Return only the final
Gate 1 disposition. Escalate only for a Product, requirement, 18/56-family, or
materially different authority choice.
Production, falsifiers, schemas, generators, semantic tests, donor adoption,
and legacy deletion remain held pending direct acceptance.
Post-S06 Prime entropy
reduction, full
public-contract publication closure, unified M5, conservation qualification,
M6, and M7 remain held.

`A5-F12` and `ABG5-S04` are deferred to planned ABIogenesis 5.1. Their design
is frozen at candidate `4897ead1`, tree `11d0ef7b`, under backlogged T-268 as
non-operative future input. Do not review, edit, qualify, or implement that
design for 5.0.

S06 closes only when:

- its complete 18-operation, 56-definition-key public family projects one
  operation-indexed contract through native types, parser, JSON Schema, SDK,
  CLI, runtime, publication, and replay;
- every native external occurrence is checker-derived, indexed by its exact
  source contract, and binds exactly once;
- its four named recurrence families are dispositioned within the accepted
  Prime carrier set before the portability path is promoted;
- native declaration roots, complete inventories, owner-relative direct
  dependency linkage, final compiler export truth, and resolved-lock identity
  project the accepted native-contract design without adding a new Prime
  carrier or public analyzer;
- native SDK, native CLI, and the bounded Codex delegate use one installed
  public operation contract and produce the same deterministic result;
- the Codex delegate is process transport only;
- one independently packed flavored Product compiles and executes against
  installed public exports, owns its declarations and semantics, uses the
  existing catalog, and reaches the ordinary HoG/ABG path;
- no fixture identity or semantic branch enters ABIogenesis core; and
- accepted S03/S05, M4, external Product, catalog negatives, and package
  reproducibility remain green.

The current conservation matrix is implementation coverage, not completed RC5
conservation.

## Reload Order

Read:

1. `specification/GOALS.md`
2. `specification/INTENT.md`
3. `specification/PRODUCT.md`
4. applicable files under `specification/requirements/`
5. `build_tenants/abiogenesis/typescript/design/M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md`
6. `build_tenants/abiogenesis/typescript/design/M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md`
7. `build_tenants/abiogenesis/typescript/design/M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md`
8. `build_tenants/abiogenesis/typescript/design/M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN.md`
9. `build_tenants/abiogenesis/typescript/design/M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md`
10. `build_tenants/abiogenesis/typescript/design/M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md`
11. `.ai-workspace/tickets/active/T-281-publish-prime-19-operation-definition-family.md`
12. `.ai-workspace/tickets/active/T-270-bind-public-catalog-invocation-to-execution-authority.md`

Repository history and commentary may explain prior failure. They do not
authorize implementation.

<!-- SDLC_BOOTLOADER_START -->
## Method Bootstrap

ABIogenesis 5.0 development is governed by the selected immutable STDO release:

- version and tag: `2.2.2` / `v2.2.2`;
- release commit: `0519129d63de10822ae6353fa0c5ce05d56f13e9`;
- standards member-set digest:
  `4cc6a10fca6b1a2c6991664d2a7ee19220401d95f3f1c0f4fa848c6a9ed81c21`;
- operative local projection: `.genesis/docs/standards/`.

Mutable methodology source and candidate releases do not govern this
consumer.

Authority flows:

```text
Goals -> Intent -> Product -> Requirements -> Design -> Code
  -> Events -> Projection -> Delta -> Scenarios -> Gap -> Reprice
```
<!-- SDLC_BOOTLOADER_END -->

<!-- GTL_BOOTLOADER_START -->
## GTL / HoG / ABG Bootstrap

- GTL.TypeScript is the sole program language.
- TypeScript checks local type law; raw admission checks erased input; the GTL
  validator checks whole-program law without lowering.
- A GTL composition is a Program.
- GraphFunction is the named callable work contract and publishes a replayable
  GTL graph template.
- HoG directly traverses the admitted GTL Program and materialized graph.
- ABG owns runtime admission, events, frames, C calls, evidence, results,
  judgments, replay, continuation, correction, and closure.
- Module and catalog publish declarations. Implementation bindings realize
  declared leaf seams only.
- SDK and CLI are thin typed invocation and projection shells.
- `F_D` is restricted to interfaces and declared total functions over closed
  domains. Open semantic work is `F_P`. Attributed policy and ambiguity
  decisions are `F_H`.

A semantic compiler, lowered executable Program, generated HoG Program,
`CompiledCProgramPlan`, hidden default, adapter selector, public controller,
feature controller, or second runtime is prohibited.

RC5, X, final-integration, archive branches, completed tickets, and rejected
WIP are historical or donor evidence. Do not infer implementation authority
from them.
<!-- GTL_BOOTLOADER_END -->

## Worktree Discipline

- A clean session starts from a clean tracked and untracked worktree.
- Do not restore or implement the planned 5.1 observer/tuner design on the 5.0
  active line.
- Once the current Gate 1 candidate freezes, change no candidate code, schema,
  test, proof, or design file while its two independent reviews run. Only
  review commentary and direct disposition may advance the exact subject;
  one consolidated bounded repair is permitted only for cited local
  counterexamples.
- Do not edit the deferred S04 design or any S04 realization surface.
- A review finding blocks its exact claim; it does not automatically authorize
  another ticket, refactor, artifact family, or review programme.
- Refactor only where accepted design proves duplicate, ambiguous, or rival
  authority.
