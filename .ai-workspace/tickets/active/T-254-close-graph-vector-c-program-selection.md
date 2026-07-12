# T-254 - Close GraphVector To Declared C-Program Selection

- id: T-254
- title: Close the generic GraphVector-to-declared-C-program selection relation
- type: bug
- ticket_category: gtl_c_program_selection_relation
- status: active
- phase_status: design_complete_pending_fh_review
- review_status: independent_review_accepted
- implementation_admission: blocked_until_design_accepted
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- delivery_phase: DS-1 prerequisite
- priority: critical
- owner: abiogenesis
- build_tenant: typescript
- change_class: design_reframe
- re_entry_point: >-
    M01 host-indexed execution declarations and M03 semantic compilation of the
    already-ratified (GraphFunction, GraphVector) to declared C relation
- triaged_at: 2026-07-12
- created_at: 2026-07-12
- updated_at: 2026-07-12
- source_ticket: T-252
- dependencies:
  - completed T-220 typed C-algebra authoring and semantic compiler
  - completed T-253 exact typed fan-out vector relation
  - accepted T-252 target topology, with executable body still blocked
- authority_refs:
  - specification/PRODUCT.md GTL contract-law boundary and atom criterion
  - specification/requirements/gtl/REQ-L-GTL3-C-ALGEBRA.md sort chain and clauses 011-017
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md clauses 005-007 and 017-020
  - specification/requirements/abg/REQ-R-ABG3-CCALL.md clauses 016-017
  - /Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md section 5E
- design_refs:
  - build_tenants/abiogenesis/typescript/design/M01_M03_GRAPH_VECTOR_C_PROGRAM_SELECTION_BEHAVIOR_DESIGN.md
- affected_boundary: >-
    abg.hog_program_ref host law, canonical ordered Node-interface C carriers,
    raw GraphVector declaration admission, containing GraphFunction catalog
    resolution, exact vector/program boundary compilation, typed diagnostics,
    and the truthful pre-runtime semantic_not_realized result
- change_intent: >-
    Make the already-ratified per-edge labelled C-program relation authorable
    and compiler-visible without adding a second selector, vector-local plugin
    route, helper GraphFunction topology, or runtime behavior.

## Intake Triage

1. **Demand**: T-252's accepted Consensus topology assigns different declared C
   programs to different C-program-executing transition GraphVectors.
2. **Observed defect**: `abg.hog_program_ref` is currently legal only on
   GraphFunction, and `compileExecutionDeclarations(...)` produces one
   GraphFunction-wide plan. No current native/raw/compiler carrier proves
   `(GraphFunction, GraphVector) |- selected declared C`.
3. **Existing authority**: the C-algebra sort chain already names this relation,
   GraphVector declarations already own transition governance, and CCALL-016
   already says edges select labelled programs through `abg.hog_program_ref`.
4. **Smallest re-entry**: one `design_reframe` and generic M01/M03 realization.
   No requirement wording, new key, runtime plan, or Consensus code is needed.
5. **Probability and proportionality**: the likely failure is malformed or
   ambiguous LLM-authored GTL. Native host typing, raw admission, exact catalog
   resolution, stable compiler diagnostics, and one generic fixture are the
   proportionate controls. Tamper resistance and runtime hardening are outside.

## Singular Boundary

T-254 owns exactly this relation:

```text
catalog(gf) : ProgramRef -> CProgram
v in materialize(gf).vectors
v.declarations["abg.hog_program_ref"] = p
p in catalog(gf)
programBoundary(p) matches vectorBoundary(v)
------------------------------------------------
(gf, v) |- selected declared C program p
```

Program and catalog bodies remain GraphFunction-owned. A vector carries only
the existing selector key. M03 derives the exact binding; the author does not
duplicate function/vector/source/target/carrier fields into a second selector
payload.

T-254 applies only to a present vector-local fixed selector. If absent, it emits
no local binding and leaves the existing required GraphFunction fixed/ladder
plan unchanged. It never chooses a runtime ladder member. A local selector
requires the containing GraphFunction catalog. `abg.fn_composition` remains a
separate selected regime/closure-governance contract.

The exact boundary join is:

```text
inputRef(v)  = cInterfaceContractRef(v.source)
outputRef(v) = cInterfaceContractRef([v.target])
program.term.inputCarrierRef  = inputRef(v)
program.term.outputCarrierRef = outputRef(v)
```

`cInterfaceContractRef` digests the existing ordered `interfaceContract(nodes)`
value. `cInterfaceCarrier<Type>(nodes)` returns an ordinary invariant C carrier
with that ref. This makes multi-source order explicit without a caller-built
string or new topology object.

## Design Gate

The mandatory domain model, execution sequence, lifecycle state machine, IACS,
cross-view axiom matrix, generic fixture, and non-scope are complete in the
referenced design. Implementation remains blocked until independent review and
direct F_H acceptance.

## Accepted-Design Execution Sequence

Only after F_H acceptance:

1. Extend the existing registered `abg.hog_program_ref` host set to include
   GraphVector. Do not admit any program/catalog/ladder/handler/plugin definition
   key on GraphVector. Because execution-law metadata carries one precedence row
   per key, reprice that row to the combined cross-host law
   `graph_function_fixed_exclusive_with_ladder_and_graph_vector_fixed_local_exact_else_graph_function_plan`
   while retaining `selects_one_catalog_member` composition law. The combined
   rule preserves existing GraphFunction fixed-versus-ladder exclusivity and
   adds GraphVector local-exact/else-GraphFunction-plan precedence.
2. Add the canonical `cInterfaceContractRef(...)` and invariant
   `cInterfaceCarrier<Type>(...)` builders over a non-empty normalized ordered
   Node interface. Continue using the existing
   `hogProgramRefDeclarationEntry(programRef)` selector builder; membership is a
   global compiler fact.
3. Preserve the same selector and interface identities through canonical
   serialization and raw GraphVector declaration admission, including a new
   key-specific empty-ref refusal.
4. Extend the existing M03 GTL conformance compiler to inspect only present
   local selectors and resolve the containing
   GraphFunction, its admitted graph/vector, its program catalog, local-selector
   exactness, selected C member, ordered source contracts, target contract, and
   program input/output carriers before nested C-to-HoG compilation can stop on
   a separate unrealized constructor. Replace the current origin-erasing
   `cAlgebraCandidates(...)` projection with raw candidate records retaining
   `{ declarationKey, catalogIndex, candidate }`. For locally selected members,
   stage `checkCAlgebraDeclarations(...)` so nested diagnostics run exactly once
   only after the outer vector/program relation is lawful. An invalid outer
   relation suppresses nested semantic gaps for that candidate; unselected
   candidates retain ordinary C-algebra checking.
5. Emit typed conformance issues for empty ref, containment, missing catalog,
   unresolved/duplicate member, malformed selected C program, legacy member
   without a C interface, and boundary mismatch. Emit
   `gtl-c-unrealized-vector-program-selection` directly through the typed issue
   path only after the full relation is lawful.
6. Add the Scenario 09 two-vector/two-program fixture and raw/native/negative
   corpus. Generic implementation and fixture names must contain no Consensus
   vocabulary.
7. Run focused and full gates, render all three diagrams, then self-review the
   diff against PRODUCT, requirements, accepted design, trusted-desktop scope,
   and T-252's unchanged topology before checkpointing.

## Closure Conditions

1. F_H accepts the three-view design before specification or product code edits.
2. `abg.hog_program_ref` is the sole vector program selector; no second reserved
   key or opaque convention appears, and its published precedence metadata
   matches the accepted cross-host law.
3. `cInterfaceCarrier` derives the exact input/output refs from a non-empty
   normalized ordered Node interface; native C generics then preserve the typed
   pair and multi-source order.
4. Native and raw TypeScript permit the existing selector on a GraphVector.
   Catalog membership remains an M03 global judgment rather than a forged
   native admitted-program claim.
5. Raw admission rejects wrong host, wrong kind, empty ref, duplicate key,
   unregistered reserved spelling, and vector-local program/catalog/handler/
   plugin definitions.
6. M03 binds each present local selector to one exact admitted
   `gtl-c-algebra/1` member of its containing GraphFunction catalog, recomputes
   the ordered Node-interface refs, and preserves exact function, vector,
   source, target, program, and C carrier identities.
7. A vector without a local selector yields no T-254 binding and leaves the
   existing GraphFunction fixed or ladder plan unchanged.
8. Missing containment/catalog/member/interface, malformed selected C data, or
   contradictory boundary truth is `invalid_program`. A lawful relation with no
   runtime consumer is the exact typed `semantic_not_realized` issue; it is not
   thrown through execution-compiler exception filtering.
9. The generic Scenario 09 fixture proves two different vectors select two
   different programs from one catalog. Native/raw equivalence and all named
   negative differentials pass. In particular, a locally selected unrealized
   `C.batch` with mismatched outer carriers yields the exact catalog-indexed
   `invalid_program` carrier-mismatch issue and no `semantic_not_realized` issue.
10. T-254 adds no runtime plan, runner branch, plugin, handler interior, worker,
   event, archive, replay, Consensus code, or public operation.
11. Focused, full semantic, declaration-law, generated publication, lint,
    diff-check, and Mermaid render gates pass.
12. A phase self-review confirms the implementation matches all three views and
    the exact generic boundary without drift.

## Non-Closure Conditions

- One GraphFunction-global selector stands for vectors that require different
  programs.
- `operator.binding`, `abg.fn_composition`, a plugin selector, opaque config,
  names, tags, vector ordinal, or observed behavior supplies the program choice.
- Vector-local declarations copy a C program, program catalog, handler,
  handler config, or plugin binding.
- Each vector is rewritten as a helper GraphFunction to evade the missing
  relation.
- Raw admission accepts a selector that native host/value/non-empty/duplicate
  law rejects, or native and raw program refs differ.
- A caller-built string, unordered source set, vector name, tag, or ordinal
  substitutes for `cInterfaceContractRef`.
- M03 reports `semantic_not_realized` before proving containment, membership,
  and boundary coherence.
- The eager ordinary C-algebra pass emits a nested semantic gap for a selected
  candidate whose outer vector/program relation is invalid, loses the candidate
  catalog index, or emits the lawful selected candidate's nested diagnostics
  more than once.
- Runtime reparses vector declarations or T-254 claims a vector-indexed
  executable plan.
- The only positive fixture or any generic M01/M03 implementation symbol is
  Consensus-shaped.
- Implementation begins before F_H accepts the design.

## Explicit Non-Scope

- runtime consumption of vector-indexed compiled selection;
- `workflow.C`, `C.batch`, `C.retry`, fan-out, fan-in, or recursion execution;
- T-252 Consensus body authoring or compiler census;
- schemas, profiles, prompts, F_P/F_H behavior, CLI, catalog publication, or
  workspace invocation;
- new execution keys or GraphVector ontology;
- GraphFunction fixed/ladder redesign beyond leaving the existing plan
  unchanged when no local selector exists; and
- hostile-workstation or cryptographic tamper defense.

## Current Disposition

`design_complete_pending_fh_review`. The ticket and three-view design are ready
for independent review. No implementation is authorized. T-252 remains blocked
and no canonical Consensus body digest is claimed.
