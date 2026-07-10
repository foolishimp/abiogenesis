# REVIEW: T-131 odd_chat Shell vs the 5.0 Interface Set

**Type:** REVIEW (commentary; the T-218 amendment ruling is F_H's)
**Author:** claude · 2026-07-10
**Subject:** odd_sdlc backlog T-131 (guided odd_chat CLI) reviewed as a CONSUMER
TEST of the adopted T-218 5.0 target — the shell is NOT a 5.0 delivery; 5.0 must
expose every interface the shell consumes, so it is deliverable post-5.0 as a
pure consumer.
**Sources:** odd_sdlc `backlog/T-131-create-guided-odd-chat-live-build-lane.md`;
odd_sdlc `active/T-204` (CLI decommission); adopted T-218 body; the ratified
session-allowlist ruling (T-217, 2026-07-09); kernel surfaces at rc.2.

## What T-131 actually specifies

A standalone operator CLI (odd_chat) that: creates/opens an operator workspace;
loads DEPLOYED ODD/GTL/ABG domain products into it; lists available graph
functions; records the human-selected graph function as a separate dialogue;
and only then exposes a LAWFUL ACTION MENU derived from the GTL projection —
with a human evaluator choosing actions, edge-local F_P constructing assets,
and F_D admitting evidence. Its non-closure conditions are already aligned with
three-layer ownership: the shell may not own action selection outside the
GTL projection, may not be an odd_sdlc runtime wrapper, and may not collapse
workspace/domain/selection/action into one hidden step. T-204 (active) makes
the same point from the other side: product CLIs collapse to GTL program +
plugins; orchestration is ABG's.

So the shell is exactly "a terminal that can only run graph functions from a
catalog" — the operator-shell consumer archetype, complementing the
build-tenant archetype (odd_glc) and the fresh-tenant archetype (F23).

## Capability → 5.0 interface map

| # | Shell capability | 5.0 owner | Status |
|---|------------------|-----------|--------|
| 1 | Install released ABG + deployed domain products by version range | A5-EX1 (public distribution) | **Covered** |
| 2 | Bind MULTIPLE deployed domain products into ONE operator workspace (create/open; load domains as separate acts) | toolchain binding already carries `products[]` (readInstalledProductBinding); REQ-P-INSTALL extension | **Mechanism exists, interface unnamed** — no A5 row names multi-product workspace binding as public behavior (GAP G-d) |
| 3 | Enumerate the graph-function catalog, source-blind, read-only | A5-EX2 (read-only catalog query/composition API) | **Covered explicitly** |
| 4 | Constrain execution to a catalog subset — the SESSION ALLOWLIST as an initial condition of the root frame (the ratified A4 view restriction) | kernel-realized (`narrowRegistryStartupToSessionAllowlist`, the `--allow` grammar) | **Realized but unnamed in the 5.0 public contract** (GAP G-a). This is the shell's defining constraint; if the allowlist is not a stable public operator-contract element, the shell cannot promise "can ONLY run catalog functions" |
| 5 | Start/resume/drive traversal to the next lawful stop; gaps projection | the A5-P2 operator/API contract reconciliation (Current Reality #8: PRODUCT still says gen-start/gen-gaps while witness/tune shipped) | **Covered via the reconciliation item** — with a pin needed: the reconciled contract must retain the OPERATOR half (start/resume/gaps) as public and versioned, not just the supervisor grammar |
| 6 | Project the LAWFUL ACTION MENU at the current frontier | engine-internal today: `constructConstructionActionCatalogProjection` + `admitConsequenceTraversalActionForAllowedCatalog` (the consequence world); `gaps` exposes typed_asset_gaps/next_step but not the action catalog | **GAP G-b** — the shell's core screen must derive from a PUBLIC replay-derived projection (its own non-closure demands GTL-projection-owned menus); no A5 row names a "lawful actions at frontier" query |
| 7 | Submit the human's acts: action selection, F_H approval/assessment, answer an escalation | run-scoped F_H event kinds exist (approved/revoked/reset/assessed); `assess-result` is public; ingress catalog class 4 names traversal-selection admission; S19 is spec-only | **Partially covered** (GAP G-c) — the OPERATOR-facing F_H interaction surface needs explicit naming in the reconciled contract; today it is a mix of CLI command, event kinds, and an unspecified escalation-answer path |
| 8 | Dispatch F_P work via operator-supplied agent capability; typed absence failure | A5-EX3 | **Covered** |
| 9 | Inspect evidence/replay read-only | gaps + replay files + A5-SP2 citable verdicts | **Covered** |
| 10 | Own zero orchestration; certify as a lawful consumer | three-layer ownership + execution-authority pins (odd_glc precedent); F23 onboarding pack | **Law exists; certification class unnamed** — the conformance suite certifies TENANTS; an operator-shell consumer class is a natural F23 rider |

## The four gaps (interface obligations 5.0 owes T-131)

- **G-a — session allowlist as public contract.** Kernel-realized and F_H-ratified,
  but no A5 package names catalog-constrained execution as a public operator-
  contract element. Belongs in A5-EX2 or the A5-P2 contract reconciliation.
- **G-b — lawful-action-menu projection as a public read surface.** The
  consequence world's action-catalog projection is engine-internal; the shell
  needs a versioned "lawful actions at frontier" query (fits ingress/catalog
  class review — the six-class catalog's classes 2/4 are admission-side; this
  is the READ side).
- **G-c — operator-facing F_H interaction surface.** Approve/assess/answer-
  escalation as named public operations in the reconciled operator contract
  (S19 spec work is adjacent but supervisor-oriented).
- **G-d — multi-domain workspace binding named public.** `products[]` exists in
  the binding; name create/open + load-domain as public installer/workspace
  behavior so the shell's first two dialogues are contract, not accident.

None of these adds a 5.0 DELIVERY — all four are naming/contract work inside
packages the adopted T-218 already carries (A5-EX2, A5-P2 reconciliation,
REQ-P-INSTALL extension, F23). The test is simple: **if the four gaps close,
T-131 is buildable post-5.0 without touching ABG source; if any stays open,
the shell would need private interfaces and the 5.0 public-consumption claim
is falsified by its second consumer.**

## Interplay with T-204 and T-131's own state

- T-204 (active) deletes the odd_sdlc CLI; post-5.0, odd_chat is BUILT BY
  odd_sdlc as a campaign subject (T-131's lifecycle: sandbox → install
  odd_sdlc as builder → build odd_chat → deploy → test) and odd_chat itself
  consumes only ABG public interfaces. T-131's architecture already matches;
  its realization details (test_env paths, package scripts) predate T-204's
  collapse and the 5.0 API and will need a design-pass at activation — but its
  closure law and non-closure conditions need no correction.
- T-131 also gives 5.0 something back: it is the natural SECOND consumer
  dry-run after F23's tenant-skeleton — a cheap post-5.0 certification that
  the public surface suffices for an operator shell, not only a build tenant.

## Recommendation to F_H

1. Keep T-131 odd_sdlc-owned, backlog, post-5.0 — confirmed not a 5.0 delivery.
2. Amend T-218 with the four interface obligations as riders on existing
   packages (G-a, G-c → the A5-P2 operator-contract reconciliation; G-b → the
   ingress/catalog requirement review; G-d → the REQ-P-INSTALL extension), each
   with the closure test "T-131 buildable as a pure consumer".
3. Add the operator-shell consumer archetype to F23's onboarding-pack closure
   (dry-run may remain post-5.0; the PACK must cover the archetype).
