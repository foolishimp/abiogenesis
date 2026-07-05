---
id: T-191
title: Ratify GTL authoring-loop meta-law (diagnostics, canonical form, examples, latitude, authorship, evolution vocabulary, corpus seed)
type: requirements_realization
ticket_category: gtl_llm_first_meta_language
status: active
goal: >-
  Move the static half of the LLM authoring loop into compiler-visible law:
  ratified diagnostic IDs with admissible-repair sets, a canonical authored
  program format with declarations-as-data law, contract-carried golden
  examples promoted from existing ABG shape/counterexample refs, declared
  underdetermination markers, declaration authorship/authority fields, an
  evolution vocabulary extending the existing requirement relation-kind
  family, and a mechanically seeded language conformance corpus.
change_class: requirement_reprice
re_entry_point: gtl_authoring_loop_meta_law
owner: abiogenesis
priority: high
created_at: 2026-07-05
updated_at: 2026-07-05
governance_scope: STDO Method, SPEC_METHOD, GTL, Semantic Compiler / Conformance, Instruction Assembly (read-only consumer)
build_tenant: typescript
source_documents:
  - .ai-workspace/comments/claude/20260705T030432Z_STRATEGY_gtl_llm_first_language_gaps.md
  - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md
review_status: pending
proof_status: pending
target_truth: >-
  The generate->typecheck->repair->admit loop runs on ratified law: every
  conformance diagnostic carries a stable ID and (top set) an admissible
  repair set; GTL programs have one ratified canonical authored data format
  and computed declarations are drift; contracts may bind ratified
  example/counterexample instances via the promoted ABG ref families;
  underdetermination is declarable with owner routes and undeclared holes are
  defects; declarations carry authorship/authority checked at admission; the
  relation-kind family carries supersession/compatibility vocabulary; and a
  ratified language-conformance-corpus format exists with a mechanically
  harvested seed.
non_closure_conditions:
  - Any phase mints a parallel surface where a named existing partial carrier
    exists (open ruleRef strings, repair-surface disposition, serializeModule
    machinery, ABG shape/counterexample ref families, relation-kind family) —
    promote-don't-re-mint is closure law.
  - Diagnostic IDs are added without ratification of ID stability, or repair
    sets are prose rather than typed admissible-edit carriers.
  - The canonical-form law ratifies digest-identity canonicalization as the
    authored format (they are different capabilities; both must be named).
  - The corpus artifact is named "corpus" bare — it must be the language
    conformance corpus, distinct from the requirements corpus and test
    evidence senses.
  - Constitutional surfaces (PRODUCT owns-lists, CONTRACT-LAW-API index) are
    not repriced in the same wave as the new clauses.
required_work:
  - "Phase 0 - Evidence pin: re-verify the strategy post's exists/absent table against the tree at execution time (diagnostics fields, serializeModule, relation kinds, shape/counterexample refs); record deltas."
  - "Phase 1 - Diagnostics: ratify stable diagnostic IDs over the open GtlProgramConformanceIssue.ruleRef, a severity taxonomy, and admissible-repair sets extending the existing GtlProgramRepairSurfaceDisposition; migrate the top ten diagnostics."
  - "Phase 2 - Canonical form: ratify the public authored-program data format over the existing gtl/m01+m02 serialization machinery; declarations-are-data clause; conformance check that declaration files are pure data."
  - "Phase 3 - Examples: promote/bridge positiveEvidenceShapeRefs / negativeEvidenceShapeRefs / adversarialCounterexampleRefs into GTL contract law binding ratified instances with digests; pilot one requirement-bearing hello-world edge; wire strength resolution to calibration-set provenance."
  - "Phase 4 - Small riders: underdetermined marker (scope + owner route + undeclared-hole diagnostic); declaration authorship/authority fields + admission check + self-dealing replay query; supersession/compatibility kinds extending GTL_REQUIREMENT_RELATION_KIND_VALUES (T-178 reconciled, not duplicated)."
  - "Phase 5 - Corpus seed: ratify the language-conformance-corpus format (program + expected diagnostic IDs + denotation); mechanically harvest the existing semantic-suite fixtures into it while Phase 1 touches the same files; full curation is successor work."
acceptance_criteria:
  - Stable diagnostic IDs ratified; top-ten diagnostics carry typed repair
    sets; a mutation test proves an unknown ruleRef is rejected.
  - Canonical authored format ratified; a computed declaration fails
    conformance differentially.
  - One live edge binds golden instances consumed by evaluator calibration
    and non-tautology mutation material.
  - Underdeclared holes produce a typed diagnostic; declared latitude renders
    into instruction manifests as permission.
  - Corpus seed exists in the ratified format with harvested lawful/unlawful
    pairs and passes against the TS tenant.
notes:
  - Split boundary - this ticket is the STATIC authoring-law half (compiler
    surface; no runtime enforcement changes). The dynamic/temporal
    enforcement half is T-192. Strategy post section 11 carries the
    bang-for-buck rationale; phases follow it.
---

# T-191: GTL Authoring-Loop Meta-Law

Static half of the LLM-first gap map: errors, form, meaning, latitude,
authorship, evolution vocabulary, corpus. Every phase extends a named
existing surface; promote-don't-re-mint is closure law.

## Execution Record

- 2026-07-05: Activated (backlog -> active); GOAL-031 registered (GOAL-030
  was taken by T-190 proof-hardening).
- 2026-07-05 Phase 0 evidence pin (tree at post-rc.6 main):
  - `GtlProgramConformanceIssue` (gtl_program_conformance.ts:107-115)
    unchanged: `severity: "error"` fixed; `ruleRef: string` OPEN.
  - NEW precision: `ruleRef` values are pass-throughs at issue sites
    (`ruleRef: input`, zero literals) — actual rule strings originate at
    caller check sites, so the ratified closed vocabulary must be enforced
    at the issue CONSTRUCTOR boundary, and the top-ten migration set must be
    harvested from caller literals, not from this file.
  - Repair surface confirmed: `GtlProgramRepairSurfaceDisposition` at :655,
    `repairSurfaceDisposition` field at :680.
  - Absences re-confirmed: underdetermined marker, authorship fields,
    corpus artifact — zero hits in code/src/gtl.
  - Phase 1 constitutional home: `REQ-L-GTL3-LAWS` (50 lines, clauses
    -001..-018; next free: -019).
  - Serialization machinery re-confirmed per strategy post section 4
    (machinery exists incl. serializeModule; gap is ratified law only).
- 2026-07-05 Phase 1 (diagnostics law) — constitutional + realization landed:
  - Ratified REQ-L-GTL3-LAWS-019 (typed diagnostic identity; closed
    vocabulary; unknown identity is itself a conformance failure; stability
    by supersession) and -020 (admissible repair affordance; typed carriers,
    not prose; routing only — no repair authority).
  - Harvested and ratified `GTL_PROGRAM_DIAGNOSTIC_ID_VALUES`: 314 literal
    IDs + 15 closed-domain IDs from the two template-literal builders
    (`target-carrier/${fieldName}` over the frozen 8-field list;
    `bind-conservation-${fieldKey}` over the frozen 8-key list) = 329 total.
  - Constructor-boundary gate live in `issue(...)` via exported
    `assertRatifiedGtlProgramDiagnosticId` (one truth surface for the gate).
    The gate CAUGHT the 15 missed dynamic IDs on first run — REQ-019 doing
    its job during its own installation.
  - Declaration-carried namespace decision:
    `abg://gtl-program/source-authority/*` identities originate from
    admitted sourceAuthorityPolicy declarations and are accepted by
    declaration, not by the built-in vocabulary. NAMED FOLLOW-UP: validate
    them against the admitted declaration set instead of by namespace.
  - REQ-020 realization: `GtlProgramAdmissibleRepair` carrier
    (closed edit-class vocabulary: add_missing_declaration /
    correct_reference / remove_duplicate_declaration /
    align_digest_or_version / constitutional_reprice) +
    `admissibleRepairs` field on the issue carrier (frozen, empty default).
  - Proofs: test:t191 5/5 (vocabulary closed/frozen/unique; unknown ID
    rejected differentially; assert total over vocabulary;
    declaration-carried accepted; live issues carry ratified IDs + repair
    field; edit-class vocabulary frozen). test:t150 97/97.
    test:semantic 1044/1044. git diff --check clean.
  - REMAINING in Phase 1: populate admissible-repair sets on the top-ten
    diagnostics (field + vocabulary exist and are enforced; population is
    the open slice — do not close Phase 1 without it).
- 2026-07-05 Phase 1 COMPLETE (checkpoint commit + population slice):
  - `GTL_PROGRAM_DEFAULT_ADMISSIBLE_REPAIRS` ratified default-repair table
    (16 mapped diagnostics — one truth surface applied at the constructor;
    callers may override; unmapped IDs carry no default). Edit-class
    vocabulary extended with `correct_field_shape` (pre-release extension in
    the same wave).
  - Differentials added: mapped live issues carry exactly one populated
    repair (kind/editClass/surfaceRef/changeClassRef asserted); every table
    key must itself be a ratified identity (dead-law guard).
  - Proofs: test:t191 6/6; test:t150 97/97; test:semantic 1045/1045.
- 2026-07-05 Phase 2 (constitutional half): ratified REQ-L-GTL3-LAWS-021
  (canonical authored form — one canonical serialization; digest identity
  and authored form are the SAME serialization law, closing the
  internal-vs-public split from the strategy review) and -022 (declarations
  are data; computed declarations rejected at the declaration boundary).
  REMAINING in Phase 2 (realization): the pure-data declaration conformance
  check + canonical-form/digest check over the existing
  gtl/m01+m02 serialization machinery. Reprice-before-code sequencing
  honored: clauses land first; realization is the next slice.
- 2026-07-05 design note (Phase 2 seam, settled with product owner): the
  SEMANTIC COMPILER is the sole enforcement home — no loader-side checker.
  The epistemic gap (a parsed object has no memory of how it was authored)
  is closed by the T-187 witness/judge pattern: startup supplies
  declaration-source rows (canonical_data vs module_export + source bytes'
  canonical digest) as conformance INPUT; the compiler owns all law. Slice
  A = canonical digest identity on the conformance report (the -021
  identity half). Slice B = witnessed source rows + pure-data law (the
  -022 half).
- 2026-07-05 standing law note (from the four-recursions strategy post,
  20260705T073323Z): factory provenance and traversal lineage are DISJOINT
  carrier families joined only by reference — at admission (factory->shop)
  and at self-hosting output (shop->factory, producing-run cited). The
  installed-context artifact is the basis-change operator between
  instances; T-186/T-187 are its law. Nothing in T-191 may merge those
  families.
- 2026-07-05 Phase 2 Slice A COMPLETE — by RECOGNITION, not code:
  `inventoryDigest = stableSha256Digest(inventoryDigests)` over per-family
  stable digests of the admitted inventory ALREADY REALIZES the LAWS-021
  canonical identity. Adding a parallel canonicalProgramDigest would have
  been two_truth (promote-don't-re-mint applied to this ticket's own
  work). What was missing was PROOF, now added to test:t191: (a)
  order-invariance — key-permuted inputs yield identical digests (the
  canonical property); (b) mutation sensitivity; (c) derived-not-stored —
  report.inventoryDigest recomputes from report.inventoryDigests; (d)
  determinism. test:t191 8/8; test:semantic 1047/1047.
  REMAINING in Phase 2 (Slice B): witnessed declaration-source rows
  (canonical_data vs module_export + source-bytes digest) as conformance
  input, the -022 pure-data/computed-declaration rules, and their new
  diagnostic IDs added to the ratified vocabulary as a deliberate recorded
  act with default repair mappings.

## Phase 2 Slice B Record (2026-07-05)

Slice B COMPLETE — witnessed declaration-source rows, T-187 pattern:

- New carrier: `GtlProgramDeclarationSourceRow` (`sourceRef`, `sourceKind`
  canonical_data|module_export, `canonicalDigest`) as OPTIONAL conformance
  input (`declarationSourceRows`), admitted by
  `admitDeclarationSourceRows` mirroring the installed-context rows.
- The -022 rule (`checkDeclarationSourceRows`): module_export ingress
  without a stable canonical round-trip digest ->
  `abg://gtl-program/declaration/module-export-round-trip` with default
  repair `align_digest_or_version`. Unknown sourceKind fails closed
  (`input/declaration-source-kind-field`).
- Vocabulary extended by 3 IDs as a deliberate recorded act (the -019 gate
  governing its own extension); surface kind `declaration_source` added.
- Proofs: test:t191 9/9 (flagged / clean / bad-kind differentials with
  repair assertion); test:semantic 1048/1048.
- DECLARED DEFERRAL (not silent): rows are OPTIONAL in this slice —
  observability first. Making the witness MANDATORY per declaration
  surface flips every startup caller (the T-189 Phase-2 migration shape)
  and is successor work, named here so absence of rows is a recorded gap,
  not assumed coverage. Loader-side witness EMISSION (startup supplying
  the rows) is the other half of that successor.

## Phases 3-5 Record (2026-07-05)

Constitutional: REQ-L-GTL3-LAWS-023 (golden instance binding, promoted from
the ABG evidence-shape/counterexample families), -024 (declared
underdetermination with owner routes), -025 (declaration authorship as
factory provenance, reference-joined only), -026 (evolution via the
existing relation-kind family; removal only by supersession), -027
(language conformance corpus as the implementation-independent oracle).
Constitutional propagation done in-wave per non_closure: PRODUCT GTL
owns-list + CONTRACT-LAW-API index sentence.

Realization:
- Phase 3: `GtlProgramGoldenInstanceBindingRow` as optional conformance
  input; instances without a content digest ->
  `contract/golden-instance-digest-required` with repair
  `align_digest_or_version`.
- Phase 4: underdetermined rows (`scopeRef`, `ownerRoute` F_P|F_H
  fail-closed, `latitudeNote`); authorship fields (`authorRef`,
  `authorityRef`) on the declaration-source row (factory provenance
  carrier — one carrier, one job); relation-kind `supersession` realized
  BY RECOGNITION (present in `GTL_REQUIREMENT_RELATION_KIND_VALUES` in the
  current tree — corrects the gaps-post second-round refutation, third-round
  note added there).
- Phase 5: `test_env/corpus/gtl-language-conformance-corpus.json` — 6-entry
  seed harvested mechanically from the built compiler; replay test asserts
  EXACT diagnostic-identity sets per entry and that every expected ID is
  ratified.
- Vocabulary extended by 4 IDs (recorded act); surface kinds
  `golden_instance`, `underdetermined_scope` added.
- Proofs: test:t191 12/12; test:semantic 1051/1051; git diff --check clean.

## Named Remainders (ticket stays ACTIVE; do not close over these)

1. Golden-instance PILOT on a live requirement-bearing edge + calibration
   consumption — overlaps T-188/M3 strength resolution (codex-owned);
   handoff, not silent deferral.
2. Declared latitude rendered into instruction manifests (ABG
   instruction-assembly side).
3. Undeclared-hole DETECTION (requires semantic analysis; -024 currently
   governs declared latitude and fail-closed routes).
4. Mandatory declaration-source witness + loader-side emission (the
   T-189-shaped migration; recorded in Slice B).
5. Corpus curation beyond the seed (grow per REQ family; harvest the
   semantic-suite fixtures).
6. Authorship self-dealing replay query (join declaration authorRef to
   evaluating worker identity).

## Self-Review Record (2026-07-05, full pass over the five T-191 commits)

Method: the workspace failure taxonomy applied to my own work; every
suspicion verified against the tree before acting.

CLEARED by verification:
- Dynamic-domain completeness: both template-literal builders' domains are
  exactly the ratified 8+8 (requiredRefPrefixes, requiredConservationFields).
- No unbounded template ruleRefs: the traversal-unit digest template
  (:8689) is a surface ref, not a diagnostic identity; zero
  backtick-built ruleRefs remain.
- Repair-table dead-law risk: already covered by the table-keys-must-be-
  ratified differential.
- Corpus version stability: `version/exact-package-version` fires on
  ABSENT input, so replay is stable across version bumps.
- PRODUCT / CONTRACT-LAW-API propagation landed correctly.

FOUND and FIXED in this pass (all law-vs-code gaps of my own making — the
exact class this workspace audits):
1. -019 clause text did not grant the declaration-carried namespace
   exception the code implements (source-authority/* prefix acceptance).
   Clause amended to name declaration-carried identities + the successor
   validation against the admitted declaration set.
2. -019 said an unknown identity "is a conformance failure"; the
   realization THROWS at the constructor (fail-closed crash, not an
   emitted issue). Clause amended to say fails closed at the constructor
   boundary — law now matches realization honestly.
3. -025 said authorship is "checked at admission"; realization only
   CARRIES the fields. Clause amended: admitted with the declaration;
   authority checks bind as successor law.
4. Corpus placement contradiction: -027 says distinct from qualification
   evidence, yet the seed lives under test_env/. Placement declared
   PROVISIONAL in the corpus note pending a published-language-surface
   decision — remainder #7.
5. Corpus exactness brittleness declared in the note: any new base check
   intentionally breaks all entries; regenerate deliberately, never patch
   expected sets to green.

FOUND, known, unchanged (already-named remainders confirmed adequate):
- The declaration-carried namespace is an open prefix inside a closed
  vocabulary — reachable by design via declared policy rows; successor
  validation named in -019 itself now.
- Latitude rows and authorship fields have no consumers yet
  (declared_not_wired BY DESIGN, remainders 2/6).

Verdict: the wave survives its own audit with five honest corrections,
zero carrier changes, and no conclusion reversed. Proofs after fixes:
test:t191 12/12; corpus replay green.

## External Review Adjudication (2026-07-05, two reviewer sets)

REAL and FIXED:
- P1 identity omission (CONFIRMED — the reviews caught what my self-review
  missed): declarationSourceRows, goldenInstanceBindings, and
  underdeterminedDeclarations were absent from GtlProgramInventoryDigests /
  computeInventoryDigests, so valid row mutations moved neither
  inventoryDigest nor reportRef — violating LAWS-021 coverage. Fixed: all
  three families are identity members; NEW coverage differential in
  test:t191 proves each row family (and an authorship mutation) moves
  inventoryDigest and reportRef. Self-review lesson recorded: I proved the
  digest's PROPERTIES (order-invariance) but never its COVERAGE — the
  presence-not-differential class in mirror form.
- P1 silent coercion (PARTIALLY REAL): underdetermined scopeRef and golden
  contractRef now fail closed via requiredStringField (new differentials).
  authorRef/authorityRef remain optional BY AMENDED LAW (-025: checks are
  successor). canonical_data rows with empty digest remain un-checked —
  ADDED as remainder #8 (per-kind digest law needs a deliberate corpus
  regeneration, per the corpus discipline note).

STALE (addressed pre-review by the self-review commit):
- "checked at admission" authorship wording — already amended in -025.
- Namespace bypass as an undeclared hole — already named in amended -019 as
  successor law; test title reworded to stop claiming "by declaration".

ACCEPTED, DEFERRED (named, not silent):
- Declaration-set validation of source-authority identities (successor per
  -019; reviewers' pressure acknowledged — it is the top successor).
- Phase 5 "denotation" column: seed is conformance-only (programs +
  expected diagnostic identities); traversal denotations require runnable
  corpus programs — remainder #9.
- "Phases 3-5 landed" reads as SEED SURFACES, not earned semantics —
  reviewer framing adopted verbatim; matches remainders 1-3.

RECORD-DRIFT corrections: default repair table has 18 entries (record said
16 before the phase 3-5 additions); commit count through this entry is
seven, not four/five.

Proofs after fixes: test:t191 14/14; test:t150 97/97;
test:semantic 1053/1053.

## Closure Audit + Acceptance-4 Realization (2026-07-06)

AUDIT against verbatim non_closure + acceptance criteria:
- All five non_closure conditions HOLD (promote-don't-re-mint verified in
  wave; ID stability + typed repairs ratified; canonical-form law names
  both capabilities; corpus named language-conformance; constitutional
  surfaces repriced same-wave).
- Acceptance 1, 2, 5 MET (ratified IDs + unknown-ruleRef rejection;
  computed-declaration differential + F6 admission fail-closed; corpus
  seed passes + T-194 row e exact replay from the installed artifact).
- Acceptance 4 was HALF-met (typed underdetermined diagnostic existed;
  latitude did NOT render) — REALIZED NOW: DeclaredLatitudeRow carrier on
  CompiledPromptPlan; compile validates owner route (F_P/F_H only — F_D
  latitude is a contradiction) and non-empty notes, failing closed with
  the ratified issueKind declared_latitude_invalid; the manifest renders
  "## abg.declared_latitude" with explicit permission framing (ODD §5:
  permission, not prescription). Differentials: render + note present;
  absence -> no section; F_D route and empty note -> rejected.
  Lanes: t188 28/28 (unit home of instruction assembly), t191 14/14,
  t183 16/16, semantic green.
- Acceptance 3 REMAINS THE SOLE CLOSURE BLOCKER: "one live edge binds
  golden instances consumed by evaluator calibration and non-tautology
  mutation material" — the law + digest enforcement exist (T-194 row d3),
  but no live edge consumes bound instances for calibration/mutation.
  This is Phase 3's pilot; ticket stays ACTIVE until it lands or the
  criterion is repriced by explicit decision.
