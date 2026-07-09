# T-216 Mutation-Soundness Remediation Wave (DMM-governed)

- id: T-216
- type: bug
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: active
- goal: GOAL-032 (Phase 6 release-grade BLOCKED on this wave; fixes cut as 4.5.1)
- change_intent: >-
    Hostile kernel review (2026-07-09, post-4.5.0) confirmed 1 Critical,
    2 High, 3 Medium framework bugs. Remediate under DESIGN_MODULE_METHOD:
    every fix derives from the violated product/requirement surface, one
    authority per concern, cross-boundary items routed to their owner,
    verification mechanism evicted from GLC userland.
- change_class: design_reframe (kernel) + product-boundary enforcement (glc)
- re_entry_point: design_surface (abg/m03 mutation/carry family)
- triaged_at: 2026-07-09
- created_at: 2026-07-09

## Intake Triage (performed)

1. SUBSTANTIVE? Yes — the -036/-039 adversarial-proof guarantee is
   satisfiable by evidence that proved nothing (Critical, honest-path).
2. UPWARD WALK: requirements EXIST and are violated (-036 refutation
   semantics; -039 discovered-proof; runtime truth rules 3/5/7). No
   design decision realizes per-test kill attribution or evidence
   supersession => first missing layer = DESIGN => design_reframe.
3. PRODUCT-DEFINITION VIOLATIONS (user adjudication: the worst class,
   glc paths worst of all): HIGH-2 and the whole binding verify path
   are F_D verification MECHANISM in userland — a standing three-layer
   ownership violation; remediation MIGRATES verification kernel-side
   (elevates T-209's remaining scope to soundness-critical).
4. RELEASE SCOPE: 4.5.0's release-grade classification is NOT grantable
   (its adversarial claim rests on the unsound mint); the in-flight
   proving run stopped (ticket-first law); fixes cut as 4.5.1; the
   release-grade run re-executes on 4.5.1.

## Design derivation (DMM: requirement -> decision -> realization)

- D1 (CRITICAL, kernel mutation_outcomes): -036 refutation semantics =>
  a KILL requires (a) compile-green under the mutant (reports present),
  and (b) PER-TEST failure evidence: the row's killing identities must
  be the tests that ACTUALLY failed, verified against the mutant run's
  report XML delivered as typed rows (worker returns per-test outcomes;
  kernel cross-checks identity membership against the obligation's map
  row). One lazy row earns exactly its observed failures, nothing more.
- D2 (HIGH-1, kernel ledger/runner): runtime rule 5 => evidence
  supersession law: mutation/depth payload truth is scoped per
  sourceResultRef; a superseding accepted artifact for the same edge
  RETIRES prior attempts' payload truth (explicit retraction semantics
  for omission: last accepted artifact per edge is the ONLY payload
  authority). Ledger projections consume only the latest.
- D3 (HIGH-2, cross-boundary => kernel): F_D totality over reports =>
  XML report verification becomes a KERNEL surface (standard handler /
  contracts module) with a real element-scoped parse (testsuite-child
  only, CDATA/comment-inert); the binding calls the kernel surface or
  ships declarations; the regex summer dies with the migration.
- D4 (MEDIUM, proof_strength_admission): ref-family typing at
  resolution — strength/fd-criterion refs must NOT be execution-family
  (closed prefix check mirrors isExecutionEvidenceRef).
- D5 (MEDIUM, both admissions): read-once law — parse via one JSON
  round-trip snapshot, validate the snapshot, freeze from the snapshot.
- D6 (MEDIUM, both carriers): deterministic canonicalization —
  codepoint comparator (never localeCompare) over an unambiguous
  JSON-array key; digest-migration note (map/outcome digests change;
  no recorded cut depends on their VALUES, only their format law).

## Break order (inside-out)

1. D6 + D5 (canonical/admission hygiene; no consumer changes)
2. D1 (kill semantics; repriced differentials: compile-break earns
   nothing; non-listed identity earns nothing; per-test truth)
3. D2 (supersession; differential: omitted-section retry retires truth)
4. D4 (family guard)
5. D3 (verification eviction from glc — with T-209; the binding pin
   suite repriced to consume the kernel surface)
6. 4.5.1 cut + repin + the release-grade frozen-law run.
