# RV4 — independent review of RC12 package C (standalone Consensus retired)

Reviewer return to the Executive. Commentary only; nothing repaired. Subject: branch `claude/rc12-consensus`,
worktree `/private/tmp/abg-rc12-executive-20261111`, range `62fd17271..9c086294b` (`f4aad7d5e` text, `fb86974e3`
code, `be05bbfbc` intent, `9c086294b` Return). T = `build_tenants/abiogenesis/typescript`. Basis: STDO 3.0.4
`stdo-review` and AGENTS.md "Worker And Reviewer Separation". Return read last.

## Product Frame

- **Outcome.** One immutable, source-independent ABIogenesis 5.0: GTL.TypeScript Programs, GraphFunction as the only
  callable, direct HoG traversal, ABG as sole event and replay authority, thin SDK and CLI (AGENTS.md:137-153).
- **Fixed set.** 15 families: F01–F07, F09–F11, F13–F17 (PRODUCT.md:1131, :1321-1335). F12/S04 is reserved for 5.1.
  S01/S02/S03/S06 pass on one installed candidate; S07 keeps the release boundaries (item 9, :1695-1701). At base, F08/S05 was a reserved 5.1
  identity; Consensus code was "preserved without a dedicated release-complete claim" (base :1146, :1204).
- **Slice.** T-287 RC12 package C. Owner ruling: "consensus has been replaced by executive, who is able to issue
  reviwers of different type". Framed review (package A) is in base.
- **Authority split.** Specification owns WHAT. Owner F_H rulings are recorded in the Product and Intent headers.
  The Executive disposes, the Writer edits, the Reviewer reads. Build, generator and staging are derived tools; ABG
  events are the only runtime truth.
- **Prohibitions.** No hidden default programs (PRODUCT.md:1576). No SDK, CLI or fixture controller (:1395,
  INTENT.md:313). No Product or requirement change without lawful re-entry (AGENTS.md:50-51). No law's coverage
  deleted with its feature. Tech debt is discharged, not recorded.
- **Classes.** Definitions, derived tools, and tests as observation; no runtime class is promoted.

## Verdict: changes requested

F1 blocks merging `fb86974e3` as it stands. F2–F5 are bounded repairs required before any cut.

## Findings

**F1 — S1. The One Surface cone is open; the two-sentence ruling neither suffices nor falls within the Consensus ruling.**
- **Rejected.** "The dependency cone was closed" (C_RETURN.md:30-31), and the ruling that rewording PRODUCT.md:1054
  and :1327 to "A system program" makes the removal lawful.
- **Sites.** `git grep 'standard system program'` finds three, the same at base and head:
  - PRODUCT.md:1054, under "Standard GTL Product Constructions" (:1049: "5.0 publishes product capabilities");
  - PRODUCT.md:1327, A5-F07;
  - REQ-P-POLICY.md:178-181: supervised "selects the admitted standard system program… Product-owned GraphFunctions
    own the four synthesis and evaluation contracts".
- The ruling misses :178, and nothing shipped now realizes 023's clause. The only realization was
  `program://abg/system/consensus-one-surface@5`, the only shipped supervised root (base `gtl/consensus.ts:4910`).
  T-287:4079 records "One Surface code exists around Consensus".
- **Evidence, not a new code defect.** Every other shipped startable Program was already `direct` at base. At head
  the one supervised Program has `starts: []` (worksite_command_execution.ts:250-257). The default `rootMode` is
  `supervised` (run_operation_contracts.ts:157), so it now has no shipped target (public_start.ts:51-71).
- **Consumer-satisfiable.** S03 (PRODUCT.md:1382-1399), REQ-P-QUAL-059 (:286-292) and REQ-P-POLICY.md:62 ("the
  admitted system program"). The S03 proof already starts a fixture root (support/t287-s03-automatic.mjs:165;
  gated).
- **Blast radius.** T-287:4079 says the general composition "remains unproved" even at base. The removal drops a
  partial realization, not a proven claim. The block rests on Product text and authority (AGENTS.md:107).
- **Repair, one of:**
  - (a) An owner F_H `product_reprice`, recorded in the Product header, that 5.0 ships no standard system Program.
    It covers all three sites, says how F07 is realized and proven, and leaves the default `rootMode` as an explicit
    owner choice. Text only, about 1 h.
  - (b) Retain or re-home one shipped four-authority supervised Program with an S03-style test. Larger.
- **Recommendation.** Do not merge `fb86974e3` until (a) or (b) is authorized.

**F2 — S2. A generic validator law lost its only executing proof.**
- **Rejected.** T5's claim that re-pointing keeps each law's coverage.
- **Law.** validator/validation.ts:667-669 refuses a non-callable contribution whose `declarationOrContractRef` is
  not a published contract. Its only test was the deleted m5-consensus-module "S05 every non-callable catalog row
  references one published contract" (base :655-690).
- **Mutant (check removed).** Base copy: 16/1, failing exactly that case. Head, the 8 files that call
  `validatePublication` or assert `invalid_reference`: 141 tests, 135 pass, 1 fail (environmental, identical
  unmutated), 5 skip, so the mutant survives. No tracked test asserts `invalid_reference` on
  `declarationOrContractRef`; r6 asserts it on `validateImplementationResolution`.
- **Boundary.** Catalog admission law, not Consensus.
- **Repair.** One negative case reusing r4's `structuralPublication()` node_type row with its contract removed (about
  25 lines), in this package.

**F3 — S2. The packed law basis binds the pre-amendment Intent.** This confirms residual 6 and decision 4.
- The mirror `T/contracts/qualification/sources/INTENT.md` (`5b237ef5…`) equals INTENT at `62fd17271` and
  `fb86974e3`; live INTENT is `327c0a06…`.
- `contracts/**` is packed (T/package.json:77-79). The ungated law test checks only the mirror, and staging is
  gated, so no check detects the drift.
- Restaging after acceptance is correct sequencing. It is required before any cut carrying `be05bbfbc`: restage,
  build, commit, and review the 22 INTENT-sourced rules. Under 1 h.

**F4 — S2. The change authority is unrecorded, and the ticket contradicts the tree.**
- PRODUCT.md:3-25 has no entry for retiring F08, S05 and REQ-P-CONSENSUS. INTENT.md:5-7 still reads "Updated
  2026-09-28". LEDGER.md has package A only. The owner's words are in no tracked file I searched.
- T-287:4040 (CONSENSUS-QUAL-5.1, "Preserve existing ordinary Consensus GraphFunction… Status: deferred"), :4079 and
  :4080 ("Preserve existing ordinary GTL code") are now false (AGENTS.md:5-6, :50-51).
- **Repair.** Record the ruling with its quote and date, cite it in both headers, and retire the three rows. About
  30 min.

**F5 — S2. INTENT.md:174-176 is false.** This confirms residual 1 and decision 1; the Return's :164 is the
pre-amendment line. The passage says standalone Consensus qualification keeps "the release allocations owned by
Product", but Product allocates none (PRODUCT.md:1131-1134, :1183-1190). Lines :313 and :316 remain true
prohibitions. Repair: delete the phrase in the intent commit.

**F6 — S3. The re-pointed Public view tests changed law.** This confirms residual 8. steel-basic-cli-public and the
W2-05 owner chain now view only callable rows. `catalog.view` over node_type and overlay rows is proven only by the
gated steel-consumer-declaration.test.mjs:231-234. I did not establish whether the view has a separate path for
those rows. Repair: give the W2-05 view a consumer node_type and overlay publication, such as the flavored fixture
at m5-installed-portability.test.mjs:362. 1–2 h.

**F7 — S3. The removal left dead residue.**
- product/semantics.ts:152, :226, :469-482 and :619-665 have no producer or caller in code, scripts or tests. They
  are `publicResultProjectionKinds`, `projectPublicResult` and three `*PublicResultProjection` functions exported
  through `./product` (index.ts:145-149).
- public/run_projection_authority.ts (189 lines) has no caller at base or head. Its only test was the deleted
  "…rejects digest tampering" case; only its type is exported (public/index.ts:5-7).
- **Repair.** Delete both and list the export removal in the Public delta, or test them generically (about 1 h).

**F8 — S3. The intent amendment lacks its Product derivation.**
- INTENT.md:207-212 ("…as the default experience") conflicts with four Product passages: PRODUCT.md:943-945
  ("explicitly adopts"), :958-959 ("Neither selection implicitly supplies the other"), :1096-1097 ("explicitly
  selected") and :1576.
- INTENT.md:34-36 ("…which agent implements or assesses") holds only if read relative to roles: :745-747 and :779
  require assessor independence.
- **Repair, on acceptance.** Product states how the default is explicitly selected, or Intent says "ready to select".

**F9–F12 — S4.**
- **F9.** E5's base column comes from the tracked manifest, which is already stale at base: a base build gives 49
  contribution rows and digest `1918f274…`, the tracked file 48 rows and `778f5667…`. E5's counts still hold against
  the base build (16 capabilities, 10 publications, 5,325 locators, catalog rows 75→59). Both tracked generated
  files are base bytes that still name Consensus.
- **F10.** E1 omits the `lint:lifecycle` red (4 offenders) and the `lint:evidence` red. Both have untouched inputs;
  lifecycle is also red at base.
- **F11.** 54 retained rules were re-minted (90 ruleRefs out, 54 in). Evidence bound to the old refs does not carry.
- **F12.** REQ-P-CATALOG.md:93-97 (009A) has no referent. F08 leaves the numbering without a note. E3's 21 files
  split 10 G + 11 other, not 9 + 12.

## Answers

- **Q1.** Open on F07 (F1), closed elsewhere: no tracked code or test uses a removed export. The 22 test_env edits
  are list removals and count changes. The remaining mentions are history, stale files, or the developer fixture's
  own Program.
- **Q2.** m5-consensus-module (17): 12 Consensus-domain cases retire with the feature; schema-as-projection stays
  generically in t287-gtl-serialization-publication (not mutated); non-callable contract lost (F2); invocation basis
  kept by four other providers; replay projection and tampering now dead and untested (F7); "no Consensus branch"
  vacuous. consensus-ref-shape held local guards. a5-f02 and r4 keep their laws on structural specimens (read, not
  mutated); st2a-g keeps its crossing refusal; W2-05 and steel changed law (F6).
- **Q3.** Not lawful as an Executive rewording (F1). Counts agree: 15 families, no Consensus row, and item 9 excludes
  only F12/S04. As worded, item 9 fails for F07.
- **Q4.** The counts are exact against both a head and a base build (F9); residue is in F7.
- **Q5.** No dangling refs to A5-F08, ABG5-S05, REQ-P-CONSENSUS, REQ-P-SCENARIOS-012, REQ-P-QUAL-061 or deleted files.
  Residues are F3, F5 and F9. The proof log and the 4.6 note are history; five qualification files are stale pre-RC
  resources.
- **Q6.** `be05bbfbc` touches only INTENT.md (+18) and drops cleanly. Before merge it needs F8, F4 (header) and F3.
- **Q7.** No qualification standing. A local cut must say "unqualified local cut; no qualification or release
  claim", commit the regenerated manifest and capability graph, restage after acceptance or state the stale INTENT
  binding, list the stale qualification resources, and claim no shipped F07 Program.
- **Q8.** Results below. Retained tests miss a broken non-callable law (F2); the deleted test caught it.
  **Q9.** `run_projection_authority.ts` (F7); the Return's INTENT lines 164/295/298 are now 175/313/316.

## What I ran (`TMPDIR=/private/tmp/abg-rv4-tmp`)

- **Head build.** `npm run build` exit 0 in 33 s. It changed only the two tracked generated files.
- **Lints.** Head: imports "3 forbidden owner pair(s) hold"; calculus "no offender"; recipe lint exit 0; lifecycle
  "4 offender(s)"; evidence "2 mirror root(s)… 3 tracked path(s)". Base copy: lifecycle "4 offender(s)".
- **Batch.** a5-f02, r4, c2-child-program, pfc-f08a, st2a-g, result-evidence-lineage, r10, qualification-law and
  multi-candidate-admission: 122 tests, 108 pass, 0 fail, 14 skip.
- **Alone.** steel-basic-cli-public 1/1 (297 s); W2-05 owner chain 3/3 (77 s).
- **Base copy.** `git archive 62fd17271` with node_modules copied: build exit 0; m5-consensus-module 17/17, and 16/1
  with the mutant.
- **Cleanup.** My build rewrote the two tracked files. I saved the diff to
  `/private/tmp/abg-rv4-tmp/generated-build-drift.diff` and ran `git restore`. The worktree matches its pre-review
  status; `qualification-scratch/` was already there and is not mine.

## Not checked

- No full suite at head or base. Gated tests not run: steel-consumer-declaration, s03-automatic, D1, staging, HC1.
  Not rerun: wave2 source-set, framework-handoff-types, w2-05 generator, uat harness, default-library reviews.
- Only one mutation. Design edits sampled; Python G rows not assessed; the 289-member figure not recomputed;
  `.ai-workspace` searched only in the RC12 directory, tickets/active and the cited T-287 rows.
- I share the author's model family (Claude), so this review has no family independence.
