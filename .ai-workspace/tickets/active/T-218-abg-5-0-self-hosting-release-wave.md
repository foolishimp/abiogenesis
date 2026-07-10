# T-218 — ABG 5.0: The Self-Hosting Release Wave

- id: T-218
- title: ABG 5.0 — self-hosting, spec-as-product, externalization (find-and-close the feature set)
- type: release-wave plan (feature-set carrier)
- status: active — feature set FOUND and tabulated; cut adjudication + G2 reprice are F_H
- goal: abg-5-0-self-hosting
- change_intent: >-
    Bring ABG from all-internal to the self-hosting milestone: a released GLC
    operates over a released ABG; ABG builds ABG under SPEC_METHOD conformance
    ("gcc v1.0 builds gcc v2.0"); the specification plus a tenant-independent
    conformance suite becomes the product; a stranger can consume the substrate
    without reading the source tree. Sets up (does not build) the genuine
    tenant wave: production Scala, cloud-native.
- change_class: goal_reprice + intent_reprice (G2 below — externalization
  inverts the RATIFIED T-142 no-npm stance; self-hosting becomes a named goal)
- re_entry_point: specification/GOALS.md + specification/INTENT.md (ratification
  is F_H's; this ticket carries the proposal, it does not edit them)
- affected_span: specification/ (goals, intent, requirements families for the
  closure invariant and suite law), build_tenants/common (suite home),
  build_tenants/abiogenesis/typescript (reference implementation + public
  surface), release machinery, odd_glc (released-over-released consumer proof),
  specification_methodology (F13 lifecycle)
- release_scope: 5.0 line; opens after 4.6.0 final (G1)
- intake_source: F_H direction rulings 2026-07-10 (self-hosting; spec-as-product;
  tenant endgame); externalization survey; comment miners over abiogenesis +
  odd_sdlc (489 files vs 545 tickets); dual-review round 2 residuals; active
  ticket T-217; backlog B-010/T-178/T-179
- created_at: 2026-07-10

## Intake triage (performed — the upward walk)

Substantive: yes — a release-line direction change, not realization detail.
Boundary: the product boundary itself moves (who may consume ABG, and what
"the product" is: spec+suite vs one TS package). Upward walk: code and design
cannot lawfully absorb this; requirements cannot (no requirement family names
self-hosting closure, conformance-suite law, or a public consumer); PRODUCT
partially (installer-as-product exists, distribution does not); INTENT does
not carry externalization (T-142 ratified the opposite) and GOALS' live wave
is 4.6. First missing layer: GOALS/INTENT ⇒ change class goal_reprice +
intent_reprice ⇒ re-entry at the goal surface. Affected span and release
scope as above. Pro forma check: this triage is the reason the ticket exists —
the feature set below cannot enter law any lower.

## Constitutional basis (proposals G2 ratifies)

- Self-hosting is the conformance proof SPEC_METHOD demands: the method
  governs its own builder (workspace law already states the compiler chain:
  release P0 → install P0 → installed P0 builds source for P1).
- The specification + tenant-independent certification suite IS the product;
  `abiogenesis/typescript` is the reference implementation that passes it
  first. gcc's real asset was the standard plus the test suite.
- Tenants certify against the suite; they never port the TS code.

## Gate 0 — prerequisites

| ID | Item | Closure |
|----|------|---------|
| G1 | 4.6.0 final ships (T-217 Ph 5–6: F_H proving campaign; C-2 splits + C-6 prune; rc.2 P0 + review-round fixes ride the cut) | T-217 closes by its own non-closure conditions |
| G2 | 5.0 direction ratified: goal_reprice + intent_reprice; T-142 no-npm stance formally superseded | GOALS/INTENT edits ratified under SPEC_METHOD (F_H) |

## The feature set (27 features, 4 chains)

### SH — self-hosting (the defining goal)

| ID | Feature | Source | Closure condition |
|----|---------|--------|-------------------|
| F1 | Self-hosting closure invariant + Maturity Method (Stage 0→4, per-stage enforcement regime + exit closure_law) | mined A7+S1; B-010's missing prerequisite | Requirement family ratified; F_D gate evaluates the predicate over a real run's replay |
| F2 | ABG-builds-ABG acceptance campaign over the INSTALLED prior release — the 5.0 exit gate | F_H gcc ruling | Converged campaign; committed evidence ledger; zero scenario patches; F1 green over its replay |
| F25 | **SCN-ABG-SOFTWARE-BUILD scenario** — the campaign scenario whose subject is the next ABG version's source; the builder's own tickets/requirements are the campaign's requirement surface (the heaviest single feature of the line) | direction discussion | Scenario declared+admitted over the installed substrate; drives F2; unmodified across attempts (bugfix precedence) |
| F26 | **Observer/tuner supervisor seat over ABG's own build** — the 4.6 consciousness tier operates the self-build; Jim holds F_H | direction discussion ("it compounds") | ≥1 observer-derived ticket draft AND ≥1 lawfully-ratified tuner optimisation ride a real F2 run; zero out-of-framework interventions |
| F3 | SPEC_METHOD conformance audit of ABG's own constitutional surfaces (the method applied to itself) | F_H ruling | Every deviation fixed or F_H-accepted debt row; drift gates extended to constitutional-surface conformance |
| F4 | Typed path carriers: SourceTreePath/InstallRoot/TenantLane/SandboxPath/BuilderSubstrate mutually non-assignable, fail-closed at install/materialization/sandbox admission | mined S5 (177-ticket topology-blur cluster) | Carriers + gates + cross-assignment differentials |
| F5 | Job-bound materialization plan: typed write/delete roots, protected siblings, effect shell validates pre-disk | mined S12 | Sibling-delete differential refuses typed |
| F6 | B-010 executed: ABG source development governed by the released substrate | backlog B-010 (blocked on exactly what 5.0 delivers) | B-010's own acceptance; no .genesis residue; boundaries intact |

### SP — spec-as-product + conformance suite

| ID | Feature | Source | Closure condition |
|----|---------|--------|-------------------|
| F7 | Tenant-independent conformance suite: partition the 1296 differentials into spec-law vs TS-detail; versioned artifact in build_tenants/common; campaign scenarios as the cross-tenant acceptance battery | F_H tenant ruling | Suite green against the INSTALLED TS tenant from outside the source tree; manifest versioned + self-certifying |
| F27 | **Citability/frozen-law as the tenant-independent verdict**: certification output is a citable, frozen-law-predicated replay claim, never a test count | direction discussion | Suite emits citable verdicts; TS tenant's own 5.0 certification is the first |
| F8 | Consumer-discoverable published-function catalog | mined A3 | No-source consumer enumerates and composes |
| F9 | pass@k worker reliability characterization | mined A5 | Per-edge first-try vs after-retry measure admitted as certification evidence |
| F10 | generic_test_harness qualification family (carrier now; uat/dev split may lag) | mined S7 | One non-JS binding certified through it |
| F11 | Behavioral-F_D-leak fail-closed gate at the closure-fold | mined S17 (recurrence proven) | Typed gate + differential; existing registers migrated/registered |
| F12 | A13a causal-predecessor admission gate (universal carrier law) | mined S18 | Gate + differentials; completes T-188/196/197 |
| F13 | Comment→spec ratification lifecycle + F_H review-surface spec (spec-only) | mined S2+S19 (the meta-finding) | Method ratified in specification_methodology; exercised once end-to-end |
| F14 | Handler-authority Prime: binding schema carries/derives authority class + equivalence-contract identity; F_D interiors enter through ratified annealing/equivalence | codex C7 (requirement_reprice class) | Reprice ratified; schema + resolution law + differentials; tuner auto-ratify policy rider lands with it |
| F15 | EVENTS-025 scope-class semantics: classes consumed or explicitly demoted; null-runId blending resolved | review residual | F_H design ruling, then per-ruling implementation + differential |

### EX — externalization core

| ID | Feature | Source | Closure condition |
|----|---------|--------|-------------------|
| F16 | License + publishable metadata; de-private (package + installer stamp) | survey B1+B2 | npm pack publish-lints clean |
| F17 | Registry/publish flow + semver stable-tag discipline (ends file:-hash-dir pinning) | survey B3+B6; needs G2 | Stranger installs by version range; odd_glc repinned once via the public path |
| F18 | Curated public API — the C-6 payoff (~1053 identifiers, ~372 dead today); sourcemaps decision; breaking-change policy | survey B7 | Exports census == declared list; policy documented |
| F19 | Agent-CLI prerequisite declared + decoupled (transports = operator-supplied capability; typed absence failure) | survey B4 | No-CLI machine fails typed with setup instructions; with CLIs, live green |
| F20 | Consumer-portable docs + consumer test gate | survey B5+B8 | Builder guide de-personalized; documented consumer gate green on fresh install |
| F21 | ABG public ingress for all six tenant runtime-transition classes + SDK entrypoint reshape (drop .genesis territory assumptions) | mined S20+A2 | odd_glc emits ZERO runtime events locally; entrypoint embeddable |
| F22 | Registry lifecycle: retirement/revocation/supersession + non-graph entry kinds | backlog T-178+T-179 | Their own ticket acceptances |

### TM — set-up only + hygiene rider

| ID | Feature | Source | Closure condition |
|----|---------|--------|-------------------|
| F23 | Tenant-onboarding pack: spec + suite + public API + docs sufficient to START a tenant without reading TS source | F_H tenant ruling | Dry-run: a fresh-context scoped agent builds a hello-world tenant skeleton from published artifacts ONLY |
| F24 | Runtime-law completion pins: engine-level assembly fail-closed differential; installed cross-process C-4 pre-stamp rejection; decisiveByAdmissionOrdinal equal-ordinal tie fail-closed; C-4 store-scoped contexts on engine emissions | review round 2 residuals | Each pin/differential green |

Named post-5.0 exits (deferred WITH triggers): production Scala tenant,
cloud-native (A8/S3), PnL-Explain, domain_builder, portable orchestration IR —
each begins by certifying against F7/F27.

## 5.0 release closure conditions

1. Every F-row closed by its stated condition or carried as an F_H-ACCEPTED
   debt row (debt acceptance is Jim's — the gates-run-every-review law).
2. F2 green over the released 5.0-rc substrate ITSELF — the release proves
   itself before it ships.
3. Released-GLC-over-released-ABG proven via the public path (F17): odd_glc
   pinned, suite green, campaign evidence committed.
4. The suite (F7) green from an installed-only context; zero source-tree
   imports on any live proof path (mechanically enforced by the strengthened
   conformance pin).
5. Snapshot manifests self-certify build+lint+suite (mechanical since 8b508c2);
   a cut from red is structurally impossible.
6. Standing rulings hold: dual review before the cut; a clean campaign precedes
   any RC claim; all live proof on sandbox-style installs.

## Explicitly out of 5.0

Python parity line (T-092/094/095, paused); observer/tuner enhancements
(A9/A10/A15/A16, S10, S11); odd_service (S4); RBAC/auth (A4); F_H approval
infra (A11); BPMN import (A6); ReqIF interchange (A13); CrewAI projection
(A17); worker identity/capability split (A18); promise-graph executor (S8 —
revisit only if F2 wall-time demands); make-carrier scaffold (S9);
abg_defaults carrier (S16); subtype dispatch (S14); OpenLineage (S15 — its
precondition becomes true only AFTER 5.0); GTL4 ratification loop (S13 —
principle folded into F13). Patents (S21) parked for one-time F_H disposition.

## Phases (each exits by the ritual; entry gated on G1+G2)

- Phase 1 — foundations: F13 FIRST (everything after ratifies through the new
  lifecycle), F14, F15, F4, F5, F24.
- Phase 2 — suite + surface: F7, F27, F8–F12, F16–F20, F22.
- Phase 3 — the proof: F21+F8 integration, F25 (scenario), F1, F2+F26 (the
  self-build with the supervisor seat), F3, F6, F23, then closure conditions
  1–6 and the 5.0 cut.

## Non-closure conditions

- Any F-row neither closed nor explicitly F_H-accepted as debt (nothing-lost).
- F2 claimed on a source-tree substrate, a patched scenario, or a run with
  mid-flight law amendments (frozen-law predicate required).
- A certification verdict that is a test count rather than a citable
  frozen-law replay claim (F27 violated).
- Suite "tenant-independence" claimed while any suite check imports TS-tenant
  realization detail.
- Externalization closed with the agent-CLI prerequisite still undeclared, or
  with the installer still stamping consumers private.

## F_H decision queue (blocking, in order)

1. G2: the goal/intent reprice + T-142 supersession (this ticket's proposal).
2. The cut itself: adjudicate F1–F27 make/defer against this table.
3. F14 requirement reprice (handler-authority Prime).
4. F15 EVENTS-025 semantics ruling.
5. S21 patents disposition (one-time, so it stops resurfacing).
