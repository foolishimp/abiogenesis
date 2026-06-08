# REVIEW: T-153 Contract-Law API — Language-Completeness Revision

**Author**: grok
**Date**: 2026-06-08T11:06:49Z
**Addresses**:
  - `specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md`
  - `.ai-workspace/tickets/active/T-153-consolidate-gtl-contract-law-api-requirement-surface.md`
  - `.ai-workspace/tickets/active/T-152-admit-gtl-program-conformance-gate-for-downstream-graph-assets.md`
  - `specification/PRODUCT.md`
  - `specification/requirements/gtl/README.md`
**Status**: Open
**Supersedes**: `20260608T104931Z_REVIEW_t153-contract-law-api-requirement-reprice.md` (index-gap section)

## Summary

The **language-completeness revision closes every index gap** flagged in the
prior review. `REQ-L-GTL3-CONTRACT-LAW-API` is now a **complete reload router**
for GTL/ABG contract-law review: 15 acceptance criteria, full GTL family index,
ABG runtime-operation index, Capability Router table, and expanded reload
checklist.

T-153 remains **active and not close-ready**. Constitutional artifacts are still
**untracked**. SDLC outward audit (4 checklist items) is unchanged. T-152 code
still lacks a `CONTRACT-LAW-API` trace string despite ticket checklist claiming
otherwise.

## Delta Since Prior Review

| Prior finding | Current state |
| --- | --- |
| Missing `OPERATOR`, `EVALUATOR`, `RULE` in index | **Fixed** — indexed at lines 41–43, reload checklist 173–176 |
| Missing `REQ-R-ABG3-FN-COMPOSITION` | **Fixed** — indexed at line 60, Capability Router row 124 |
| No Capability Router table | **Added** — § Capability Router (lines 114–129) |
| No GTL Operator vs ABG runtime distinction | **Added** — § ABG Runtime Operation Index (lines 131–145) |
| Reload checklist missing recursion / F_* bullets | **Fixed** — lines 167–176 |
| 11 ACs, weak completeness claim | **Expanded** — 15 ACs; Purpose states language completeness (lines 15–21) |
| T-153 audit 6/10 | **Now 12/16** — specification slice largely complete |

Mechanical check: all 27 GTL families in `requirements/gtl/README.md` appear
in the REQ indexed-family list. No omissions.

## Proof Run (verified 2026-06-08T11:06Z)

From `build_tenants/abiogenesis/typescript`:

| Command | Result |
| --- | --- |
| `npm run test:t150` | **24/24 pass** |

Prior reporter claims (`lint:semantic`, `test:semantic` 745/745, `git diff --check`)
not independently rerun in this pass.

## Repository State

```
 M T-152 ticket
 M gtl_program_conformance.ts (+382 lines)
 M test_t150_gtl_program_conformance_tool.test.mjs
 M specification/PRODUCT.md
 M specification/requirements/gtl/README.md
?? T-153 ticket
?? REQ-L-GTL3-CONTRACT-LAW-API.md
?? .ai-workspace/comments/grok/
```

**No commit.** REQ and T-153 remain untracked constitutional truth.

## REQ Quality — Post-Revision

### Strengths

- **Completeness principle** (Purpose lines 15–21) states the constitutional
  boundary: every product-visible element ABG admits must be GTL-expressible.
- **AC-004 through AC-008** encode selection/synthesis, `F_*` composition,
  recursion, plugin/hook, and prompt/asset surfaces as first-class language
  configuration — not hidden orchestration.
- **Capability Router** maps reviewer questions to GTL surface, ABG owner,
  primary REQ trace, and proof surface in one table.
- **ABG Runtime Operation Index** correctly separates GTL `Operator` declarations
  from ABG interpreter families (start, iteration, retry, payload, worker,
  saga/frontier).
- **Owner split** and **reload checklist** are reviewable in one pass.
- **PRODUCT.md** anchor (lines 76–123) aligns with expanded REQ scope and cites
  `OPERATOR`, `EVALUATOR`, `RECURSE`, `FN-COMPOSITION`.

### Residual specification nits

1. **Capability Router recursion row** cites
   `test_m01_gtl_core_integration.test.mjs` but does not name the recursive
   graph-function reload row fields T-153 requires (termination, foldback,
   lineage, bounds, preserved outer interface). Those fields live in AC-006 and
   the indexed `RECURSE` family — acceptable, but the router row is thinner than
   the ticket's "reload row" checklist item claims.

2. **AC renumbering** shifts admission/typecheck to AC-009–011 (was AC-004–006
   in T-153 proposed shape). Ticket prose still references the old numbering in
   § Proposed REQ Shape. Low risk; ticket should align prose to landed AC IDs on
   next edit.

## One-Stop Capability Coverage (Reassessed)

**Question:** Does CONTRACT-LAW-API act as a one-stop document for:

1. full declaration of all ABG operators
2. recursive graph functions
3. `F_*` composition syntax

### Short answer

**No as monolith. Yes as complete router.**

The REQ still does not replace detailed families. It now **indexes every family
needed** and routes each capability question through the Capability Router and
ABG Runtime Operation Index without hunting README or conversation memory.

### Capability matrix (revised)

| Capability | Standalone manual? | Routed from CONTRACT-LAW-API? | Detail still required? |
| --- | --- | --- | --- |
| GTL `Operator`/`Evaluator`/`Rule` declarations | No | **Yes** — router row 123, index 41–43 | `REQ-L-GTL3-OPERATOR`, `EVALUATOR`, `RULE`, `GRAPHVECTOR` |
| ABG runtime/plugin/system binds | No | **Yes** — ABG Runtime Operation Index + `REQ-R-ABG3-FN-COMPOSITION` | `REQ-R-ABG3-FN-COMPOSITION`, `INTERPRET`, `PAYLOAD` |
| Recursive graph functions | No | **Yes** — AC-006, router row 125, checklist 167 | `REQ-L-GTL3-RECURSE`, `GRAPH`, `LAWS` |
| `F_*` functor composition | No | **Yes** — AC-005, router row 124, checklist 173–176 | `HOOKS`, `COMPUTE-NOTATION`, `FN-COMPOSITION` |

### Practical reading stack (unchanged count, now fully indexed)

```text
1. REQ-L-GTL3-CONTRACT-LAW-API.md   # router + completeness boundary
2. specification/PRODUCT.md           # narrative bind chain
3–8. Detailed families per Capability Router row
```

Prior review recommended adding four families and a Capability Router. **All
landed.** Do not inflate the REQ into a monolith; the index is now complete for
the three capability questions.

## T-153 Audit Checklist

**Complete (12):** PRODUCT anchor, README index, full GTL family index, Operator
vs ABG runtime distinction, Capability Router, recursive reload row (via AC-006 +
router), deterministic-integration vs MCP, T-152 ticket linkage, target-carrier
fields, no legacy bridge layer.

**Open (4) — correctly left open:**

- SDLC T-184 handoff owner classification
- component-depth register / target-carrier envelope traceability
- prompt assets vs SDLC-local schema clone
- plugin contracts vs GTL/ABG boundary declarations

## Findings

### 1. Constitutional artifacts untracked (suggestion)

REQ and T-153 are `??`. Requirement reprices should land as tracked specification
truth before calling the specification slice posted.

### 2. T-152 REQ traceability overclaimed (nit)

T-153 checklist marks "T-152 `typecheckGtlProgram(...)` references the new REQ"
complete. `gtl_program_conformance.ts` carries `// Supports: REQ-L-GTL3-ASSET-SURFACE`
only — no `CONTRACT-LAW-API` trace. Ticket `source_documents` linkage is
sufficient for this slice; code/report metadata binding remains optional for full
closure.

### 3. T-152 and SDLC consumption remain open (gap, expected)

T-152 closure law still requires odd_sdlc T-194 inventory gate with full contract
rows. odd_sdlc T-195 proof-hygiene follow-on should be read with T-194 during
outward audit.

## Verdict

| Layer | Status |
| --- | --- |
| Requirement-reprice slice (spec) | **Complete** — index gaps closed |
| T-153 ticket authority | **Accurate** — 12/16, not close-ready |
| Proof (T-150) | **Green** — 24/24 |
| Git hygiene | **Blocked** — untracked REQ, no commit |
| SDLC outward audit | **Open** — 4 items |
| One-stop router | **Sufficient** — not a monolith |

## Recommended Action

1. **Track and commit** REQ, T-153, PRODUCT, README as specification commit.
2. **Execute SDLC outward audit** (T-184 surfaces + T-194/T-195 consumption).
3. **Keep T-153 active** until audit items dispositioned.
4. **Optional:** add `CONTRACT-LAW-API` to `gtl_program_conformance.ts` report
   metadata for constitutional traceability.

## References

- Prior review:
  `.ai-workspace/comments/grok/20260608T104931Z_REVIEW_t153-contract-law-api-requirement-reprice.md`
- odd_sdlc T-195:
  `/Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/active/T-195-close-t194-proof-and-release-hygiene.md`