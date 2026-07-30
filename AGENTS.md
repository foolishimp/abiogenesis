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
- A further architectural finding returns to design or F_H; it does not
  authorize another autonomous patch-review loop.

## Current Gate

The sole current Product implementation outcome is:

```text
close ABG5-S06
  -> native SDK + native CLI + bounded Codex CLI shell
  -> independent flavored Product through installed public exports
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
Replacement candidate `458ce3c2`, tree `b5c7a1eb`, preserves the complete
existing flat catalog and is frozen pending one independent delta review and
direct disposition. Do not edit or refreeze that candidate, and do not resume
realization before acceptance.
Prime compression, full conservation
qualification, qualification, and release must not receive implementation
while S06 remains unresolved.

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
10. `.ai-workspace/tickets/active/T-281-publish-prime-19-operation-definition-family.md`
11. `.ai-workspace/tickets/active/T-270-bind-public-catalog-invocation-to-execution-authority.md`

Repository history and commentary may explain prior failure. They do not
authorize implementation.

<!-- SDLC_BOOTLOADER_START -->
## Method Bootstrap

ABIogenesis 5.0 development is governed by the selected immutable STDO release:

- version and tag: `2.2.0` / `v2.2.0`;
- release commit: `5326562f075d60052806d0d2c79d3db49671a8ea`;
- standards member-set digest:
  `ca6dc3d5094fc5473380df45d76da3c52263c5c21c52a3af62f542c97db2f86c`;
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
- During the current exact-cut review gate, change no candidate code, schema,
  test, proof, or design file. Only independent review commentary and direct
  disposition may advance the subject.
- Do not edit the deferred S04 design or any S04 realization surface.
- A review finding blocks its exact claim; it does not automatically authorize
  another ticket, refactor, artifact family, or review programme.
- Refactor only where accepted design proves duplicate, ambiguous, or rival
  authority.
