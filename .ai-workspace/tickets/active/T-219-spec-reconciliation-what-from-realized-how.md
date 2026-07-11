# T-219 - Reconcile Specification WHAT From Realized HOW (TS Tenant, Tickets, Design)

- id: T-219
- title: Reconcile specification WHAT from realized HOW and restore build-a-tenant-from-spec sufficiency
- type: maintenance
- ticket_category: constitutional_reconciliation
- status: active
- goal: abg-5-0-self-hosting (preparatory; feeds T-218 target admission)
- priority: high
- governance_scope: STDO Method
- change_class: product_reprice
- re_entry_point: specification/PRODUCT.md
- created_at: 2026-07-11
- updated_at: 2026-07-11
- owner: claude
- intake_source: >-
    F_H direction 2026-07-11: the specification (WHAT) of GTL/abiogenesis is
    out of date with the HOW, specifically the TypeScript build tenant; the
    truth currently lives between tickets and code. For future spec-method
    work (and T-218 candidate adjudication over accurate baselines) the WHAT
    must be updated from the current HOW: tickets AND code AND design.

## Intake Triage (performed)

- substantive: yes. Constitutional surfaces (PRODUCT.md, REQ-R-ABG3-*,
  REQ-L-GTL3-*) predate the 4.5/4.6 waves (T-201..T-217). Realized truth —
  witness/attestation events, basis-scope law, kernel adoption surface,
  capability catalogs, installer/toolchain-binding contracts, typed artifact
  schemas, earned depth, mutation soundness — lives in tickets, code, and
  design notes. STDO prime rule violated: the tickets/code have become a
  second truth surface because the first is stale.
- boundary: specification/ (WHAT) versus build_tenants/abiogenesis/typescript
  + .ai-workspace/tickets + build_tenants/*/design + docs/ (HOW and its
  history). The Python tenant is a paused reference line, not reconciliation
  target.
- upward-propagation walk: realization is ahead of requirements; requirements
  are ahead of PRODUCT in places; GOALS was recently repriced (4.6/T-217,
  proposed GOAL-034). First missing layer: requirements (constitutional
  requirement truth no longer names realized law), with PRODUCT drift where
  public contracts changed (CLI verbs, install layout, observation surfaces).
- derived change class: `product_reprice`, the earliest changed layer. Its
  accepted product corrections flow into requirement reconciliation. Direction
  is stable; this admits realized truth into the constitution and does not
  change the goal.
- re-entry point: specification/PRODUCT.md, followed by the owning
  specification/requirements/ families. GOALS remains untouched except for
  cross-reference review; GOALS ownership stays with T-218.
- affected span: specification/PRODUCT.md, specification/requirements/abg/*,
  specification/requirements/gtl/*, specification/requirements/mapping,
  specification/scenarios where they name obligations; no code changes; no
  ticket rewrites (tickets are history, not editable truth).
- release scope: none frozen; this is maintenance that T-218's adjudication
  depends on. No 5.0 scope is admitted by this ticket (T-218 owns that).

## Closure Law

Close only when a competent agent, from specification/ alone (plus published
GTL/ABG contracts the spec explicitly references), can complete the
walkthrough "realize a new build tenant that passes conformance" without
consulting tickets, code, or design history. Per STDO: a walkthrough a
competent agent using declared authority cannot complete is a method defect.
Residual gaps must be named in the spec as explicit `Gap:` entries, not left
silent. Proof = the reconciliation delta register with every row dispositioned
(admitted-to-spec | already-current | named-gap | out-of-scope-5.0[→T-218]),
plus present-tense spec text carrying the admitted rows.

## Method

1. Inventory the WHAT: current claims of PRODUCT.md and every REQ-R-ABG3-* /
   REQ-L-GTL3-* file, keyed by tenant-builder obligation.
2. Inventory the HOW: TS tenant public surface (module map, GTL type surface,
   event families, projections, admission, installer/binding contracts, CLI
   verbs, conformance/self-hosting checks) as realized at HEAD.
3. Inventory ticket-and-design truth: T-190..T-218 landed behavior and
   ratified design/RC notes not yet in spec.
4. Produce the delta register: spec-stale / spec-silent / spec-wrong /
   spec-current rows, each traced to its realization evidence.
5. Reprice requirements and PRODUCT from admitted rows (present-tense; no
   migration narration). F_H review of the register and the spec diff remains
   open; agent output is not constitutional truth by itself.

## Delta Register (reconciliation of WHAT vs realized HOW, 2026-07-11)

Dispositions: `admit` (reprice spec now, this ticket) · `gap` (name in spec
as explicit Gap with owner) · `current` (verified already admitted) ·
`5.0→T-218` (out of scope here).

### Spec-wrong / stale (reprice)

- D-01 `admit/product_reprice`: PRODUCT §646–745 public operator contract
  says `gen-start`/`gen-gaps`; realized ONE control plane is
  `start | gaps | assess-result | witness <act> | observe report|drafts |
  tune report|propose|ratify|reject | typecheck-gtl-program | gen-config |
  context-bootstrap | install | release-snapshot`, with `--allow`,
  `--codex-model/--codex-sandbox` as declared start args. (T-217 S2.1;
  T-218 CR#9.)
- D-02 `admit`: PRODUCT GOAL-001/002 proving-surface columns name `.py`
  test files; TESTCASE_AUTHORITY routes product verification to the python
  test map. Reprice to the TS-tenant proof lanes / tenant-neutral wording.
- D-03 `gap→intent_reprice`: INTENT.md (Draft) is migration narration with
  deep `.py`/realization reach. Out of this ticket's change class; name as
  Gap with re-entry `intent_reprice` (operator to schedule; T-218 adjacent).

### Spec-silent, requirement-grade (admit into requirements/abg)

- D-04 `admit`→EVENTS/PROJECTION: replay ordinal-ingest law — every
  "latest" fold decided by admission ordinal, never array/caller order;
  fail closed on collisions/unorderable candidates. (T-217 replay-ingest
  law.)
- D-05 `admit`→EVENTS: store-scoped emitter contexts — admission ordinal is
  per-store; live contexts fail closed on pre-stamped envelopes (forgery
  resistance); replay-tolerant contexts admit replayed truth forward-only.
  (T-217 C-4.)
- D-06 `admit`→SUPERVISOR-WITNESS: replay-log attestation — digest chains
  over full canonical event content, ordinal-ordered; tamper-evidence
  inside attested spans on cross-process re-derivation. (T-211.2/T-217.)
- D-07 `admit` (restated round 2)→PAYLOAD-028: worker-artifact schema law
  as realized — an artifact MAY carry exactly one declared schema; a
  declared schema is rendered into the worker instruction, enforced at
  ingress (`payload_rejected` schema_invalid, section withheld), sole
  shape authority under planDigest. The universal
  every-artifact-carries-a-schema obligation is an owned Gap
  (Owner: T-217). (T-213/T-217 S6.)
- D-08 `admit`→SUPERVISOR-WITNESS or RUN: basis-fork fail-closed — a new
  basisId on a spine run under a different basisId fails closed
  (`basis_fork_detected`) unless a covering reprice names the exact pair;
  enforced at runner AND every operator route. Also admit the route-basis
  vs execution-basis split (route-grade basis reconstructable from replay,
  acts without traversing). (T-217 S5/C-5.)
- D-09 `admit` (restated round 2)→REQ-R-ABG3-PLUGIN-SEAMS: the kernel
  adoption surface — five named scalar bootstrap seams (fdEvaluator,
  fpEvaluator, fpDispatch, fhAdmission, consequenceProjection), standard
  plugin catalog with governed refs, fail-closed declared selection
  (`abg.plugin_selection`; sole realized attachment
  GraphFunction.declarations), live capability injection as CLASS-level
  F_H-ratified operator ingress (never a kernel fork; per-instance
  approval attribution an owned Gap), live F_P evaluator corroboration
  REALIZED engine-internally with acceptance-by-omission Gaps (tolerant
  private parser; bare accepted-true when no expected identities derive;
  identities not rendered into the PromptManifest). Gap owners: T-217.
  (T-217 S2.3.)
- D-10 `admit`→EVENTS adjunct: the canonical runtime event-kind census —
  the RuntimeEvent union (~127 kinds at 4.6) is a published, versioned
  conformance contract; tenant conformance means producing exactly the
  census kinds under the canonical envelope. Spec admits the census as a
  normative published-contract reference with family enumeration
  (lifecycle/basis, advancement/regime, actor/process, instruction,
  witness/attestation/proof, tuner, c-call spine, retry/continuation,
  leaf/branch saga, payload ledger, F_H assessment, overlay/output/zoom,
  traversal modulation, graph-span foldback, timer, construction,
  registry/projection).
- D-11 `gap`: exact wire/serialization schemas — all carrier laws are
  "at minimum" field lists; the normative schema authority (typed contracts
  in the published tenant package; `schema://abiogenesis/*` refs remain an
  unpublished target) must be named by spec as the published contract
  surface. Named Gap with pointer law now; full schema admission is a
  follow-up slice. Owner: T-218.
- D-12 `gap/partial-admit`: realized GTL surface outside the 14-type
  ontology — GraphFunction zoom family, type wiring, asset/ref primitives,
  Gtl* plugin-binding cluster. FN-COMPOSITION/ASSET-SURFACE/
  REQUIREMENTS-ALGEBRA already carry parts; zoom/type-wiring have no home.
  Name Gap rows in CONTRACT-LAW-API index; admit zoom/foldback declaration
  law if trivially statable, else leave owned Gap. Owner: T-219.

### Conformance surface (the closure-test spine)

- D-13 `admit`→PRODUCT + mapping: `typecheckGtlProgram` /
  `admitGtlProgramConformanceInput` contract — typed diagnostic-id enum,
  repair-edit classes, default admissible repairs, target-carrier and
  edge-closure rows — admitted as the named conformance proof surface.
- D-14 `gap`(owned): REQ-M-GTL3-CAPABILITY stays Deferred but its Gap text
  must state that engine conformance profiles are the missing tenant
  conformance manifest and name T-218 as owner for 5.0 scoping.
- D-15 `admit` (restated round 2)→QUAL deltas: (a) diff-execution witness
  gate + binding export-pin (T-214); (b) self-certifying release snapshot
  — gate evidence embedded in the snapshot manifest, with DECLARED bypass
  booleans for non-release snapshots; mechanical red-refuses-to-cut
  release-grade enforcement is an owned Gap (Owner: T-217); (c)
  live-install-only proof law scoped to NEW/MIGRATED live proofs
  (conformant from birth), with the 26-entry legacy list an owned
  migration Gap (Owner: T-219) enforced by the shrink-only pin (operator
  ruling 2026-07-10).

### HOW-leak scrub (tenant-neutralize; keep meaning)

- D-16 `admit`: SAGA-FRONTIER-008 "TypeScript … native Node asynchronous
  primitives" → restate as engine-neutral (host tenant uses its native
  async primitives; law is the serial/parallel equivalence, not Node).
- D-17 `admit`: HANDLERS refs to `runner/c_call_spine.ts` → replace with
  contract-level naming; keep the named FpTransportConfig.prompt Gap as an
  explicit Gap row (still open per T-205).
- D-18 `admit`: COMPUTE-NOTATION-014 "TypeScript contracts" → "published
  tenant contracts".
- D-19 `admit`: REQ-P-INSTALL TS-specific paths → state as the reference
  tenant's binding with the tenant-neutral rule (product payload resolves
  below `<toolchainRoot>/products/<product>/<packageVersion>/`); keep
  concrete TS values as the reference example, marked as such.
- D-20 `current/keep` (restated round 2): PRODUCT "Current Product Shape"
  naming build_tenants paths is product law of the current source
  project; the read-model label was withdrawn (round-1 F9) — the section
  states current product shape as law, not as a disclaimer-bearing read
  model.

### Transitional-law audit

- D-21 `gap`(kept, owned): CCALL strangler window (ENCLOSED vs PENDING
  arms) — still open; keep, but the clause must read as an explicit Gap
  with owner and retirement condition (already mostly does).
- D-22 `gap`(kept): HANDLERS T-205 P0 status + prompt-boundary gap — keep
  as named Gap; realization not final.
- D-23 `admit`(retire if true): ITERATION-013 "callers shall migrate" —
  verify the transitional layers are gone at HEAD; if so, retire the
  migration sentence to present-tense law.
- D-24 `admit` (repriced): NODE-014 "optional for migration" — verified at
  HEAD: typeRef genuinely optional at admission, fail-closed satisfaction
  when present; repriced to optional-with-reason in the executed reprice.
- D-25 `gap`(kept): PROOF-CARRY-THROUGH migration-gap lines — still open
  (REQ-...-032 gap class known from odd_glc campaign); keep as Gap.

### Already current (verified; no action)

- D-26 `current`: EVENTS-024/025/026, WITNESS-001..015, TUNER-001..014,
  FPC-018..021 — the 4.6 wave's law IS admitted in spec.
- D-27 `current`: earned depth / mutation-outcome admission /
  carry-through admissions have requirement homes (HANDLERS, T-210/T-216
  admissions); census D-10 covers their event kinds.
- D-28 `admit`(one line): methodology standards dependency — spec states
  the four method standards are install-mirrored from
  specification_methodology (installer writes docs/standards); a tenant
  builder needs them named as required inputs.

### Out of scope → T-218

- D-29: observer/tuner 5.0 refinements, marketplace/catalog product,
  abg.cli, host adapters, lawful-GraphFunction — future candidates, not
  reconciliation.

## Execution Record

2026-07-11: ticket opened with performed triage; reconciliation fan-out
launched (spec inventory, TS tenant reality, ticket/design truth).
2026-07-11: three-way inventory complete; delta register D-01..D-29
recorded above. Spec reprice execution launched for the `admit` rows;
`gap` rows to be written into spec as explicit Gap entries with owners.
F_H review of register and spec diff remains open.

2026-07-11 (reprice executed, uncommitted; 17 spec files, +222/−69 lines,
1 new requirement file):
- EVENTS-027/028/029 admitted (ordinal-ingest law; per-store emitter +
  forgery resistance; event-kind census as published conformance contract
  with 17-family normative map).
- WITNESS-016/017/018 admitted (full-content attestation chains;
  basis-fork fail-closed with covering-reprice pair law; route-grade vs
  execution basis).
- PAYLOAD-028 admitted (one-schema worker-artifact law; PAYLOAD chosen
  over HANDLERS as the admission/shape authority).
- NEW REQ-R-ABG3-PLUGIN-SEAMS-001..006 (five seams, standard catalog,
  fail-closed declared selection, F_H capability rows never kernel forks,
  live F_P mechanical corroboration); indexed in abg/README.md.
- Verified retirements: ITERATION-013 present-tensed (no transitional
  layers at HEAD — evidence iteration_state_action.ts and its five
  consumers); NODE-014 repriced to optional-with-reason (typeRef
  genuinely optional at admission, fail-closed satisfaction when present).
- HOW-leaks scrubbed: SAGA-FRONTIER-008 engine-neutral; HANDLERS .ts refs
  → contract naming (prompt-boundary Gap kept, owner T-205);
  COMPUTE-NOTATION-014 tenant-neutral; INSTALL tenant-neutralized with
  labeled TS reference examples.
- PRODUCT: public operator contract repriced to the realized control
  plane (11 top-level verb families; adapter-bindings law preserved); conformance
  proof-surface contract admitted; wire-schema pointer law + Gap;
  methodology-inputs paragraph; current-shape section labeled read model;
  proving surfaces tenant-neutral. TESTCASE_AUTHORITY off the python map.
- QUAL-025/026/056 admitted (diff-execution witness gate;
  live-install-only proof with shrink-only pin; self-certifying snapshot).
- CAPABILITY (Deferred) Gap repriced: names itself the missing tenant
  conformance manifest, owner T-218.
- Beyond-register change flagged for F_H: REQ-P-POLICY verb rename
  (gen-start→start, gen-gaps→gaps; zero law change).
- Open Gaps carried in spec text: D-03 INTENT intent_reprice (operator to
  schedule), D-11 full wire-schema admission (follow-up slice), D-12
  zoom/foldback/type-wiring language law (owned Gap rows in
  CONTRACT-LAW-API), D-21 CCALL strangler (T-200 checkpoints), D-22
  HANDLERS prompt boundary (T-205), D-25 carry-through migration gap.
- Residual pressure, present tense: the spec now states the tenant
  conformance path (census + envelope + seams + conformance verb + QUAL
  proof laws), but a from-spec-alone tenant build still lacks the
  conformance manifest (D-14, 5.0/T-218) and exact wire schemas (D-11).
  Closure walkthrough not yet re-run; F_H review of the full diff open.

2026-07-11 (hostile review round 1 received: 9 findings, all repaired,
uncommitted):
- F1 EVENTS-027/028 overclaim — law kept; explicit Gap blocks added naming
  the array-order latest folds (construction-pressure projection, runner
  latest-selected-graph-function) and the singleton replay-tolerant default
  emitter context. Owner T-218.
- F2 PLUGIN-SEAMS-001 overreduction — narrowed to the five scalar
  declaration-selectable bootstrap effect seams; "no sixth seam"
  exhaustiveness deleted; boundary clause -001a added naming HANDLERS,
  CCALL fibres, providers, ingress, sinks, and composed task/rule stages
  as separate lawful plugin surfaces.
- F3 PAYLOAD-028 + PLUGIN-SEAMS-006 overclaim — PAYLOAD-028 restated as
  realized MAY-carry-one-schema law with Gap for the universal obligation
  (T-218); PLUGIN-SEAMS-006 narrowed to realized corroboration with Gap
  naming the tolerant private parser and empty-expected-ID acceptance
  (T-218).
- F4 ITERATION-013 false retirement withdrawn — law restored as shall-form
  plus Gap naming RuntimeContinuationTransitionProjection as the remaining
  publicly exported adapter surface (T-218).
- F5 QUAL-056 — restated as realized (embedded gate evidence; declared
  bypass booleans for non-release snapshots) with Gap: mechanical
  red-refuses-to-cut release-grade enforcement unrealized (T-218).
- F6 QUAL-025 scoped to changed TS executable lines under code/src with
  Gap for every-changed-executable-file generality (T-219); QUAL-026
  states the shrink-only 26-entry legacy pin as the current mechanism.
- F7 PRODUCT read-command sentences aligned to WITNESS-009 (read verbs do
  not mutate runtime truth; invocation witnessing per the one grammar);
  ratification sentence aligned to TUNER-004 (ratify admits the draft;
  adoption re-enters via ordinary ticketed re-entry).
- F8 PRODUCT — Public Operator Contract Gap added for the unpublished
  POLICY-017 per-verb contract (T-218); example spellings corrected to
  shipped bins (abiogenesis-ts / genesis-ts / abg.install) labeled
  reference-adapter; wire-schema pointer law names published typed
  contract modules as current authority with Gap for the unpublished
  schema:// registry (T-218).
- F9 register hygiene — INTENT.md Gap banner added (intent_reprice, F_H
  scheduling, D-03); Current Product Shape disclaimer removed and section
  restated as product law of the current source project; D-11 owner
  T-218, D-12 owner T-219, D-24 corrected gap→admitted/repriced.

2026-07-11 (hostile review round 2 received: 9 findings, all verified
against cited code sites and repaired, uncommitted):
- F1 WITNESS-009 narrowed — event admission covers commands that CHANGE
  or ATTEST truth; pure read verbs (gaps, observe, tune report) project
  replay-derived read models and admit no events; PRODUCT gaps/observe
  sentences aligned (verified: runGapsCommand/runObserveCommand/tune
  report read replay and print, no sink).
- F2 PLUGIN-SEAMS-003 — realized attachment law stated (sole attachment
  GraphFunction.declarations, one tagged json_blob, duplicate
  declaration/seam-key fail-closed); Gap added for the unconsumed
  HOOKS-001 attachment scopes (Owner: T-217).
- F3 PLUGIN-SEAMS-005 — capability CLASS F_H-ratified once by the
  admitting wave; rows compose from flags/env with recorded provenance;
  Gap added for per-instance approval attribution (Owner: T-217).
- F4 PLUGIN-SEAMS-006 — corroboration restated to the realized mechanism
  (expected identities derived internally from vector evaluators, never
  rendered into PromptManifest); render-into-manifest expectation moved
  into the Gap block (Owner: T-217).
- F5 WITNESS-017 — runner law kept (typed fail-closed startup result);
  Gap added: operator routes refuse forks untyped (raw thrown error),
  typed basis-fork results at routes unrealized (Owner: T-217).
- F6 QUAL-026 — scoped to NEW/MIGRATED live proofs conformant from
  birth; 26-entry legacy list restated as owned migration Gap
  (Owner: T-219) with the shrink-only pin as enforcement.
- F7 residual ownership rerouted — 4.6 runtime-law realization residuals
  (EVENTS-027/028 folds+emitter context, PAYLOAD-028 universal schema,
  PLUGIN-SEAMS-006 parser, ITERATION-013 adapter, QUAL-056
  red-refuses-to-cut) now Owner: T-217; publication-of-new-public-surface
  gaps stay T-218 (schema:// registry + schema-surface spec admission,
  POLICY-017 per-verb contract, D-14 conformance manifest in CAPABILITY).
- F8 register reconciled — D-07/D-09/D-15/D-20 restated to repaired
  truth; this round-2 entry appended.
- F9 PRODUCT schema-authority pointer law repriced to the actual
  addressable surface: the package `exports` map root export (entry
  module re-exports gtl/m01, gtl/m02, abg/m03 contract modules) and the
  published subpath exports (./gtl/m01, ./gtl/m02, ./abg/m03,
  ./abg/m03/transport); Gap kept for version/digest semantics and the
  resolvable schema:// registry (Owner: T-218).

2026-07-11 (rc.3 reconciliation pass — T-217 closed superseded-and-split,
4.6.0-rc.3 published at `f4f081f`, T-220 completed at `014448f`, T-221
active as the prior-release qualification boundary):
- Every specification Gap block naming Owner: T-217 was re-verified
  against HEAD code. NONE is fully realized; none retired. All nine were
  removed from the closed owner and routed to T-218 intake for DS-0 leaf
  adjudication. Two align with named T-217 successors; seven use the default
  residual intake rule:
  - EVENTS-027 array-order latest folds STILL OPEN
    (`deriveConstructionPressureProjection` folds in event-array order at
    construction_pressure_package.ts:477; `latestSelectedGraphFunctionEvent`
    reverse array scan at engine_runner.ts:857) → Owner: T-218.
  - EVENTS-028 singleton default emitter context STILL OPEN
    (module-level replay-tolerant `defaultEmitterContext` at
    events/emit.ts:44) → Owner: T-218.
  - PAYLOAD-028 universal one-schema obligation STILL OPEN
    (`artifactSchemas` optional at instruction_assembly.ts:284; ingress
    checks declared schemas only) → Owner: T-218 A5-GF1/A5-EX4 intake;
    downstream adoption odd_glc T-033.
  - PLUGIN-SEAMS-003 five unconsumed HOOKS scopes STILL OPEN (selection
    compiles from `graphFunction.declarations` only,
    execution_declaration_compiler.ts:363; the R5 driverRequirement
    admission and repair gate did not add attachment scopes) → T-218.
  - PLUGIN-SEAMS-005 per-instance approval attribution STILL OPEN
    (`resolveLiveCapabilityProvenance` carries flag/env value sources,
    no actor/approval identity, cli/command.ts:1876) → T-218.
  - PLUGIN-SEAMS-006 STILL OPEN but NARROWED by T-220: review admission
    is now closed-key (unknown fields, malformed dispositions, duplicate
    and unexpected assessmentIds rejected,
    standard_live_plugins.ts:503-566,680-696); still open: no manifest
    rendering of expected identities (no assessment surface in
    instruction_assembly.ts), private free-text JSON extraction,
    closeDisposition defaulted from accepted, empty-expected bare
    `{accepted:true}` close-eligible. Gap text repriced to present truth
    → Owner: T-218 A5-GF1/A5-EX4 intake.
  - ITERATION-013 adapter STILL OPEN (`RuntimeContinuationTransitionProjection`
    still defined and barrel-exported, continuation_transition.ts:69,
    contracts/index.ts:200-208) → T-218.
  - WITNESS-017 typed route fork results STILL OPEN (routes throw raw
    TypeError carrying `basis_fork_detected`,
    runtime_authoring_routes.ts:189) → T-218.
  - QUAL-056 red-refuses-to-cut STILL OPEN (bypass booleans honored
    unconditionally at release_snapshot.ts:243,532,547; when gates run
    they do refuse red and the rc.3 snapshot manifest embeds the
    evidence, so the gap text was narrowed to the release-grade bypass
    distinction) → T-218.
- Routing note flagged for F_H: the T-217 successor map names owners
  only for the one-schema and declaration-consumed-response residuals
  (A5-GF1/A5-EX4). The other seven runtime-law residuals are unnamed in
  the map and were routed to T-218 (5.0 target admission) by the default
  residual rule; T-221 authorizes no runtime work, so none route there.
  F_H may re-adjudicate these seven into named leaves.
- GOALS cross-reference review found that the published immutable
  4.6.0-rc.3 checkpoint and terminal T-221 disposition must enter through
  T-218's DS-0 `goal_reprice`; no GOALS edit belongs to T-219. No `rc.2` or
  version facts exist elsewhere in specification/ (swept; requirement law
  stays version-silent per the T-219 rule).
