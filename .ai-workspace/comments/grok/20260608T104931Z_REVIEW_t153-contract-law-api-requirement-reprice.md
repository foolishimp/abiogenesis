# REVIEW: T-153 GTL Contract-Law API Requirement-Reprice Slice

**Author**: grok
**Date**: 2026-06-08T10:49:31Z
**Addresses**:
  - `.ai-workspace/tickets/active/T-153-consolidate-gtl-contract-law-api-requirement-surface.md`
  - `.ai-workspace/tickets/active/T-152-admit-gtl-program-conformance-gate-for-downstream-graph-assets.md`
  - `specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md`
  - `specification/PRODUCT.md`
**Status**: Open
**Updated**: 2026-06-08T11:15:00Z

## Summary

The T-153 **requirement-reprice slice is lawful and well-shaped**. The new REQ
is an index surface, not a parallel constitution. `PRODUCT.md` and
`requirements/gtl/README.md` provide the promised fast reload anchor. T-152 is
correctly linked at ticket authority level.

T-153 is **not close-ready**, as stated. Remaining closure is the outward SDLC
audit (T-184 surfaces) plus revision binding. Two process gaps matter now:
constitutional files are still **untracked**, and the T-153 checklist slightly
overclaims T-152 code traceability to the new REQ.

## Current Reality

### What landed

| Artifact | Assessment |
| --- | --- |
| `REQ-L-GTL3-CONTRACT-LAW-API.md` | **Strong** — 11 acceptance criteria, indexed families, owner split, reload checklist; explicitly index-only |
| `PRODUCT.md` § GTL Contract-Law API Reload Anchor | **Strong** — names REQ, GTL/ABG/downstream split, `typecheckGtlProgram(...)` proof surface |
| `requirements/gtl/README.md` | **Correct** — fast reload anchor before detailed families |
| T-153 ticket | **Accurate** — audit checklist 6/10 complete; SDLC outward items open |
| T-152 `source_documents` | **Updated** — includes `REQ-L-GTL3-CONTRACT-LAW-API.md` |

### Proof run (verified 2026-06-08)

From `build_tenants/abiogenesis/typescript`:

| Command | Result |
| --- | --- |
| `npm run test:t150` | 24/24 pass |

Reporter also cites `lint:semantic` pass, `test:semantic` 745/745, and
`git diff --check` pass. Independent full semantic rerun not repeated in this
review.

### Repository state

```
 M T-152 ticket
 M gtl_program_conformance.ts
 M test_t150_gtl_program_conformance_tool.test.mjs
 M specification/PRODUCT.md
 M specification/requirements/gtl/README.md
?? T-153 ticket
?? REQ-L-GTL3-CONTRACT-LAW-API.md
```

**No commit.** The constitutional REQ and T-153 ticket are **untracked**.
T-152 realization edits remain dirty alongside unrelated untracked paths
(`.playwright-mcp/`, codex comment).

## Analysis

### STDO triage

| Field | Verdict |
| --- | --- |
| `change_class: requirement_reprice` | **Lawful** — missing truth was a reloadable GTL contract-law constitutional surface |
| `re_entry_point: requirements` | **Correct** — not a code-only refactor |
| Symptom vs authority | Correct — scattered implementation memory ≠ constitutional gap |

First missing layer at intake: **Requirements + Product anchor**. This slice
addresses that layer. Downstream SDLC audit is **proof/consumption**, not a
second requirement reprice.

### REQ quality

Strengths:

- REQ-004/005/006 tie ABG `typecheckGtlProgram(...)` to constitutional law
- REQ-008 forbids second contract-law surfaces in parsers, prompt prose, plugins
- REQ-006 target-carrier visibility rule matches T-152 lossy-row pressure
- REQ-007 prompt `AssetSurface` row policy aligns with T-150/T-152 scope
- Owner split table is reviewable in one pass

Index references are **not complete** for operator, evaluator, recursion, or
`F_*` composition law. See § One-Stop Capability Coverage below.

### PRODUCT anchor quality

The new section at `PRODUCT.md:76` satisfies T-153 "Required Product.md
Anchors":

- names `REQ-L-GTL3-CONTRACT-LAW-API` as reload surface
- states GTL declaration ownership vs ABG admission vs downstream meaning
- cites programmatic proof surface (`typecheckGtlProgram`, `admitGtlProgramConformanceInput`)
- derives from indexed detailed REQs

Pre-existing uses of "bridge" in PRODUCT (product-definition bridge surface,
mapping layer) are **not** retired-bridge vocabulary markers. They describe
legitimate GTL-to-runtime mapping concepts, not rejected compat-shim language.

### T-153 audit checklist status

**Complete (6):**

- PRODUCT reload anchor
- README index
- REQ indexes detailed families
- deterministic-integration vs MCP constitutional source distinction
- T-152 ticket links new REQ in `source_documents`
- no new bridge/legacy layer added

**Open (4) — correctly left open:**

- SDLC T-184 handoff owner classification
- component-depth register / target-carrier envelope traceability
- prompt assets traceable to GTL AssetSurface (not SDLC-local schema clone)
- plugin contracts traceable to GTL/ABG boundary declarations

These are the right outward consumers for the next closure wave.

### Findings

#### 1. Constitutional artifacts untracked (suggestion)

`REQ-L-GTL3-CONTRACT-LAW-API.md` and T-153 are `??` in git. Requirement
reprices should land as tracked specification truth before calling the slice
"posted." T-152 code/test edits should commit with or immediately after the REQ
in one atomic revision.

#### 2. T-152 REQ linkage is ticket-level only (nit)

T-153 checklist marks "T-152 references the new REQ" complete. T-152
`source_documents` includes the REQ. `gtl_program_conformance.ts` and
`test_t150` contain **no** `REQ-L-GTL3-CONTRACT-LAW-API` trace string.

Acceptable for this slice if understood as authority wiring, not runtime
traceability. For full closure, add a code comment or proof assertion binding
report identity to the REQ ref.

#### 3. T-152 remains broadly open (gap, expected)

T-152 audit checklist still has many unchecked items (edge-closure keying,
plugin admission, odd_sdlc T-194 consumption, live hello-world). T-153
correctly does not claim T-152 closure. The tickets are coupled but not
co-closed.

#### 4. Downstream ticket pointers (nit)

T-153 `source_documents` references
`odd_sdlc/.../T-194-migrate-typescript-tenant-to-abg-4-0-0-rc-3.md` and
`T-184`. Paths exist. odd_sdlc also carries T-195 proof-hygiene follow-on;
T-153 outward audit should read T-194/T-195 together when auditing SDLC
conformance inventory completeness.

## One-Stop Capability Coverage

**Question:** Does `REQ-L-GTL3-CONTRACT-LAW-API` (plus its PRODUCT anchor) act
as a one-stop document for:

1. full declaration of all ABG operators
2. ability to create recursive graph functions
3. definition of composition syntax for the `F_*` functors (`F_P`, `F_D`, `F_H`)

**Short answer:** **No — by design, and with two index gaps that should be
fixed.**

The REQ is explicitly an **index and reload router**, not a standalone
declaration manual. For the three capabilities, constitutional truth is
**distributed** across detailed GTL families plus at least one ABG family
(`REQ-R-ABG3-FN-COMPOSITION`). `PRODUCT.md` carries the richest single-surface
narrative, but even PRODUCT is not a complete operator catalog.

### Capability matrix

| Capability | Covered in CONTRACT-LAW-API alone? | Where truth actually lives | One-stop sufficient? |
| --- | --- | --- | --- |
| Declare GTL `Operator` / `Evaluator` with `F_P`/`F_D`/`F_H` regimes | **No** — only names algebra ops; does not index `OPERATOR` or `EVALUATOR` families | `REQ-L-GTL3-OPERATOR`, `REQ-L-GTL3-EVALUATOR`, `REQ-L-GTL3-GRAPHVECTOR` (vector attachment), `REQ-L-GTL3-MODULE` (publication) | **No** |
| Declare all ABG runtime/plugin/system "operators" (bind chain, admission, ledgers) | **No** — owner split says ABG owns admission/runtime; no bind grammar here | `REQ-R-ABG3-FN-COMPOSITION` (bind chain COMP-015), `REQ-R-ABG3-INTERPRET`, `REQ-R-ABG3-PAYLOAD`, `PRODUCT.md` § ABG bind chain | **No** |
| Recursive graph functions | **Partial** — indexes `RECURSE`, lists `recurse` in REQ-002 | `REQ-L-GTL3-RECURSE`, `REQ-L-GTL3-LAWS-009`, `REQ-L-GTL3-GRAPH-003`, `REQ-L-GTL3-HOF`, `REQ-L-GTL3-COMPOSE` | **No** — need RECURSE + GRAPH + publication surfaces |
| `F_*` functor composition syntax | **Partial** — indexes `HOOKS`, `COMPUTE-NOTATION`; does **not** index `REQ-R-ABG3-FN-COMPOSITION` | `REQ-L-GTL3-HOOKS-017/018` (declaration attachment), `REQ-L-GTL3-COMPUTE-NOTATION` (`fn<A,B>.C`, `transform.C`, `evaluate.C`, `consequence.C`), `REQ-R-ABG3-FN-COMPOSITION` (regime bindings, closure, bind chain) | **No** — three-document minimum |

### 1. Full declaration of all operators

**Terminology matters.** GTL declares **Operators** and **Evaluators** as
first-class declaration types. ABG does not re-declare them as GTL types; ABG
**admits and interprets** them through composition, plugins, and system binds.

What CONTRACT-LAW-API gives you:

- REQ-003 indexes hook/plugin boundary law generically
- REQ-002 lists `recurse`, `compose`, etc. as **graph algebra**, not operator
  declarations
- Owner split: GTL owns declarations; ABG owns admission/runtime

What it does **not** give you:

- `Operator` field law (`name`, `regime`, `binding`, `tags`) — see
  `REQ-L-GTL3-OPERATOR-001` through `005`
- `Evaluator` field law and edge-assurance evaluator constraints — see
  `REQ-L-GTL3-EVALUATOR-001` through `010`
- Vector attachment rules (`GraphVector.operators`, `GraphVector.evaluators`) —
  `REQ-L-GTL3-GRAPHVECTOR-001` through `004`
- ABG plugin category law (`plugin.transform.C`, `plugin.evaluate.C`,
  `plugin.consequence.C`, external human callout) —
  `REQ-R-ABG3-FN-COMP-016`
- The full ABG.system bind chain — `REQ-R-ABG3-FN-COMP-015` and
  `PRODUCT.md:188`–`206`

There is **no single constitutional catalog of every operator instance** in any
one document. The model is: declare typed `Operator`/`Evaluator` surfaces in
GTL, attach to vectors/modules, bind regimes through `abg.fn_composition`,
realize through engine plugins. That is correct architecture, but it is **not**
one-stop reading.

**Index gap:** `REQ-L-GTL3-OPERATOR` and `REQ-L-GTL3-EVALUATOR` appear in
`requirements/gtl/README.md` but are **missing** from
`REQ-L-GTL3-CONTRACT-LAW-API` § Indexed Requirement Families and § Reload
Checklist.

### 2. Recursive graph functions

**Yes, recursively — but not from CONTRACT-LAW-API alone.**

Coverage chain:

| Layer | Requirement | What it states |
| --- | --- | --- |
| Algebra name | CONTRACT-LAW-API-002 | `recurse` is a lawful graph algebra op |
| Index | CONTRACT-LAW-API indexed families | includes `REQ-L-GTL3-RECURSE`, `REQ-L-GTL3-HOF`, `REQ-L-GTL3-COMPOSE` |
| Recursion law | `REQ-L-GTL3-RECURSE-001`–`008` | `recurse(graph_function, termination, foldback)`; explicit termination/foldback; lineage; bounded application |
| Graph shape | `REQ-L-GTL3-GRAPH-003` | recursive workflow expressible as `Graph` |
| Lineage law | `REQ-L-GTL3-LAWS-009` | recursion preserves explainable lineage and foldback law |
| Publication | `REQ-L-GTL3-MODULE-001` | module owns graph functions that may be recursively applied |

What a reviewer still cannot get from CONTRACT-LAW-API alone:

- The `recurse(...)` signature and foldback semantics
- How recursive inner steps relate to frames, publication, and parent re-bind
- How recursion interacts with `compose` / `substitute` / higher-order surfaces

**Verdict:** Recursive graph functions are **constitutionally supported** and
**correctly indexed at README level**. CONTRACT-LAW-API points to the right
families but does not embed enough law to author or audit recursion without
opening `REQ-L-GTL3-RECURSE` and `REQ-L-GTL3-GRAPH`.

**Reload checklist gap:** no explicit bullet for recursion/HOF under § Reload
Checklist (only graph program shape lists GRAPH/GRAPHVECTOR/GRAPHFUNCTION).

### 3. `F_*` functor composition syntax

**Partially indexed; syntax is split across GTL notation and ABG grammar.**

Three layers must be read together:

**Layer A — GTL declaration attachment (`abg.fn_composition` hook)**

`REQ-L-GTL3-HOOKS-017/018`:

- precedence: `GraphVector.declarations` > `GraphFunction` > `Job` > `Role` >
  `Module` > visible defaults
- hook config carries host binding, ordered regime bindings, standards/policy/
  carrier/assurance context, deterministic closure, optimization
- GTL declares; ABG admits under `REQ-R-ABG3-FN-COMPOSITION`

**Layer B — GTL epistemic notation (`fn<A,B>.C`, staged plugins)**

`REQ-L-GTL3-COMPUTE-NOTATION`:

- `fn<A, B>.C` = notation over published `GraphFunction` + selected
  `abg.fn_composition`
- `transform.C` / `evaluate.C` / `consequence.C` = epistemic stages; plugins
  compute; ABG.system admits/writes/folds/transitions
- `evaluate.C.F_D.register_rule[*]` and `evaluate.C.F_P.semantic_judgment_rule[*]`
  name regime-specific evaluation work
- REQ-010: `F_P` and `F_H` cannot claim closure authority
- REQ-017: `F_H` = external human callout category

**Layer C — ABG composition grammar (runtime truth)**

`REQ-R-ABG3-FN-COMPOSITION` — **not indexed in CONTRACT-LAW-API**:

- COMP-001: `abg.fn_composition` binds how `F_D`, `F_P`, `F_H` participate at a
  boundary
- COMP-004: regime binding fields and closure authority rules per regime
- COMP-013–015: interpret notation; event-sourced bind chain
- COMP-016–017: plugin categories and external `F_H` callout law

`PRODUCT.md` § Canonical bind chain (`:188`–`236`) is the best **narrative
one-stop** for how `F_*` functors compose at runtime, but it derives from the
three REQ layers above — it is not substitutable for them as constitutional
source.

**Verdict:** CONTRACT-LAW-API **does not** fully define `F_*` composition
syntax. It routes to `HOOKS` + `COMPUTE-NOTATION` but **omits**
`REQ-R-ABG3-FN-COMPOSITION` from both the indexed family list and reload
checklist. That omission is the largest one-stop gap for composition review.

### Recommended one-stop reading order

For a cold reviewer who needs all three capabilities, the practical minimum
stack is:

```text
1. REQ-L-GTL3-CONTRACT-LAW-API.md     # router + owner split
2. specification/PRODUCT.md           # narrative bind chain + composition boundary
3. REQ-L-GTL3-OPERATOR.md             # GTL Operator declaration
4. REQ-L-GTL3-EVALUATOR.md            # GTL Evaluator declaration
5. REQ-L-GTL3-RECURSE.md              # recursion law
6. REQ-L-GTL3-HOOKS.md                # abg.fn_composition attachment precedence
7. REQ-L-GTL3-COMPUTE-NOTATION.md     # fn<A,B>.C and staged .C notation
8. REQ-R-ABG3-FN-COMPOSITION.md       # F_D/F_P/F_H regime grammar and bind chain
```

Seven files beyond the reload anchor. That is acceptable **if** the reload
surface indexes all seven explicitly. Today it indexes five of eight and omits
the most important ABG composition REQ.

### T-153 follow-up for one-stop completeness

Add to CONTRACT-LAW-API § Indexed Requirement Families:

- `REQ-L-GTL3-OPERATOR`
- `REQ-L-GTL3-EVALUATOR`
- `REQ-L-GTL3-RULE`
- `REQ-R-ABG3-FN-COMPOSITION`

Extend § Reload Checklist with bullets:

- operator/evaluator declaration and vector attachment:
  `OPERATOR`, `EVALUATOR`, `GRAPHVECTOR`
- recursion and higher-order algebra: `RECURSE`, `HOF`, `COMPOSE`, `LAWS`
- `F_*` composition syntax:
  `HOOKS` + `COMPUTE-NOTATION` + `REQ-R-ABG3-FN-COMPOSITION`

Optionally add a **Capability Router** table to PRODUCT or CONTRACT-LAW-API
mapping reviewer questions → REQ files (operators / recursion / composition).

Do **not** inflate CONTRACT-LAW-API into a monolith. Keep it an index; make the
index **complete** for the three capability questions above.

## Target Direction

T-153 closes when:

1. REQ + PRODUCT + README + tickets are **committed** as one specification slice
2. SDLC outward audit checklist items 187–194 are dispositioned with owning
   layer (GTL gap / ABG gap / SDLC consumption gap)
3. T-152 programmatic gate proves lossy target-carrier rows fail under REQ-006
4. odd_sdlc consumes the gate with full contract rows (T-194/T-195 line)

Do **not** close T-153 on specification text alone.

## Recommended Action

1. **Track and commit** `REQ-L-GTL3-CONTRACT-LAW-API.md`, T-153, PRODUCT,
   README as the specification commit (can be separate from T-152 code if needed,
   but REQ must not stay untracked).
2. **Execute SDLC outward audit** against T-184 surfaces using the reload
   checklist in REQ § Reload Checklist.
3. **Keep T-153 active**; update checklist rows as audit completes.
4. **Optional:** add REQ ref to `gtl_program_conformance.ts` report metadata or
   T-150 proof for constitutional traceability.

## References

- odd_sdlc prior review:
  `/Users/jim/src/apps/odd_sdlc/.ai-workspace/comments/grok/20260608T042453Z_REVIEW_t194-abg4-migration-stdo-triage.md`
- STDO method:
  `/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md`