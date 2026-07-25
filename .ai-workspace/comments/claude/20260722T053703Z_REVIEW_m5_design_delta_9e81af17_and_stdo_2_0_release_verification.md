# Review: M5 Design Delta At 9e81af17 And STDO 2.0.0 Release Verification

- reviewer: claude (independent, unbounded scope, direct F_H commission)
- date: 2026-07-22T05:37Z
- subject commit: `9e81af178697857774dfae58452842e201c006b5`
  (`codex/t286-abi5-root`, pushed to origin, not on `main`)
- subject file: `build_tenants/abiogenesis/typescript/design/M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md`
- subject file SHA-256: `4addf147975ee5b5d3e9a8bae127fcdf34c04f5bee174731580b89c227b24298`
  (recomputed from the commit blob; matches the ruling request exactly)
- worktree state at review: clean except this untracked comment and the
  20260721 review comment

This post is commentary. Acceptance is an F_H ruling; this review does not
accept anything.

## Acceptance Subject Scope

The ruling request names the design delta, but accepting at `9e81af17`
ratifies three commits above the M4 closure `e0575b82`:

| Commit | Content | Verification |
|---|---|---|
| `2dabd709` | plan(a5): T-270 reprice to M5 parent, GOALS milestone table, PRODUCT.md governance pin of released STDO `v2.0.0`, CLAUDE/AGENTS/README refresh | PRODUCT.md diff replaces the 20260721 premature-tap guard with the now-true released identity (commit + member-set digest); same substitution law retained; lawful post-tap bookkeeping under the 20260719 lineage ruling and the 20260722 publication decision |
| `62f89ed1` | refactor(m5): move `canonical_json` / `digests` / `immutable` (+ opaque refs) from `src/product` to `src/shared`; rewire ~31 files' imports; respell a few indexed-access contract types to direct types; regenerate M4 proof artifacts | Moved files are byte-identical renames; non-import edits are type-level only; proof regeneration is digest-consequent (packaged paths changed); behavior neutrality proven by independent gate rerun below |
| `9e81af17` | design(m5): freeze the 745-line M05 expansion design | Reviewed in full below |

## Verified Claims

1. **M4 is still 25/25 — independently rerun, not replayed.**
   `npm run test:m4` executed in this worktree at `9e81af17`: clean `tsc`
   build, then 25/25 pass, 0 fail (R1–R10 chain including three post-open
   rejection totalizations, nine B8 rival-authority mutations, the
   `ABI5-ROOT-001` governor re-evaluation, two runtime-scope regressions).
   Duration 31.2s. No lint gate is declared in the tenant (no eslint/biome
   config, no lint script), so build + test:m4 is the complete declared gate
   set. All declared gates green.

2. **Eight-family Prime preserved.** §4.3 evaluates four alternatives and
   contracts to the direct fold; the delta adds subordinate variants inside
   `GtlDeclarationFamily`, `InvocationBasis`, and `TraversalAggregateFamily`
   only. No ninth family, no second authoring surface. §5 classifies every M5
   carrier under an existing M3 IACS family.

3. **Direct GTL traversal.** §1 decision chain traverses the original
   admitted GTL; §8 axiom rows "original GTL is sole program" and "no
   compiled execution carrier" hold with named native and admission
   enforcement; B8 mutations prove the negative on the installed path.

4. **Exact child bases.** Invariant 9 plus the §6.1 decidable mapping
   (`childRows == rootSet.rows filtered by childKeys`, equality both ways,
   child `ExecutionBasis` binds both set digests). Invocation-local admission
   of already-resolved declarations; no second resolution authority.

5. **ABG-only truth.** §3.4 authority matrix keeps proposal, evaluation,
   execution, and admission separated at every row; invariant 14; B8 tests
   prove forged controller output and copied `ExecutionBasis` cannot satisfy
   the installed root.

6. **Total C-call rejection.** Invariant 13, `completeRejectedCCall`
   (missing-suffix-only totalization, judgment only after result admission),
   the `RejectedBeforeResult` / `JudgmentRejected` lifecycle path, and the
   three R9 rejection tests plus B8 exception tests on the installed path.

7. **Replay-derived F_H continuation.** F_H is a distinct non-executable
   boundary (disjoint requirement-key families, no implementation binding);
   the request C-call completes the uniform spine with typed pending result;
   continuation opens from ABG event truth; response admission validates
   against the exact replay-derived basis; `run.continue` explicitly
   re-enters HoG. T-272 owns domain behavior. This also strengthens the
   F_D/F_P/F_H separation at the type level.

8. **Bounded-delta conformance.** The seven T-270 delta obligations map onto
   the document one-to-one (constructor representation §2/§6; cursor and
   transition generalization §3.1/§6; lineage preservation §3.2/§3.3; shared
   primitive ownership §5; implementation seam §3.4; durable continuation §2
   item 6/§6; three-view and Prime delta §7/§4.3 citing unchanged M3
   evidence). The M03 parent digest cited in the header recomputes exactly
   (`9faeb41d…`).

9. **STDO v2.0.0 selection is real and reproducible** (see next section).

## STDO 2.0.0 Release Verification

- Annotated tag `v2.0.0` → commit `94ccf4faa1c0a10b002273b1e9a9e7bf4a34753a`,
  pushed to `origin` with branch `release/2.0.0`. Cut from the
  incremental-from-v1.8 lineage per the 20260719 F_H lineage ruling; both
  rejected 2.0 candidates stayed rejected.
- Accepted tree digest matches the human decision record
  (`250ace7dc18c85fd30bffc635d96245c58e1a2f9`).
- Member set: 41 files; digest recomputed from the tag content with the
  release note's exact recipe → `284efbb31affd6772fe8e523bdd157f7f2ebe4d4d8dee7b5c9ddfd0482da93a0`.
  Matches T-270, GOALS.md, PRODUCT.md, and CLAUDE.md pins.
- Publication sequence lawful to the second: refrozen exact candidate
  checkpoint (00:32Z) → human decision `accept and publish` authored 01:54:30Z,
  committed 01:55:06Z (`fdf5e3d`) → tag created 01:55:16Z → publication wave
  closed 01:55:57Z. The 20260721 premature-tap defect is repaired in
  substance: this tap followed review and explicit F_H acceptance with a
  durable record pinning commit and tree.
- Consumer projection: `.genesis/docs/standards/` carries exactly 41 files;
  spot hashes (SPEC_METHOD, TICKET_METHOD, RELEASE_METHOD, stdo_compressed)
  match the release inventory. The operative law the tenant reads is the
  released cut.
- Mutable `specification_methodology` main retains two local unpushed
  candidate commits (20260721 "freeze/repair STDO 2.0.0 candidate"); these are
  future authoring under the released supersession law and PRODUCT.md's new
  wording, not rival consumer law.

## Findings

- **F1 (design, low semantic severity, literal breach of acceptance
  condition 6).** The §7.2 sequence diagram assigns child-subset derivation
  to the `Product` participant ("HoG->>Product: derive exact child subset
  from root AdmittedImplementationSet"). Every other surface excludes Product
  from child preparation: §3.1 (`ChildTraversalPreparationPort` "neither
  selects the child nor re-resolves Product catalog truth"), §3.3 ("GTL
  materializes, validator judges, ABG admits; Product is not called"), §3.4
  (prepare-child row has no Product), §6.1 ("not ambient selection or a
  second implementation-resolution authority"; the subset is a pure filter of
  the ABG-owned root set). The diagram arrow is the outlier and, read
  literally, puts catalog projection into the child hot path. Semantics are
  unambiguous because four surfaces agree against one; but acceptance
  condition 6 ("the three views project the same Ontology delta") is not
  literally met. Disposition options for F_H: (a) accept with this recorded
  erratum, entity/lifecycle/authority tables governing, diagram repaired in
  the first co-evolution commit; or (b) require a one-line diagram repair and
  refreeze (new file hash) before acceptance. Either is proportionate; (b) is
  cleaner under exact-candidate identity law.

- **F2 (process, minor).** The aborted independent re-review ("stopped when
  it breached the bounded scope") left no durable disposition in
  `.ai-workspace`. The escalation to a direct F_H decision is honest and
  correct — but per STDO-UP-007 the abort and its reason should be recorded.
  Recommend the F_H decision comment for this ruling incorporate that
  statement, continuing the M0–M4 DECISION-comment pattern, and that T-270
  `review_status` / `phase_status` and the GOALS basis table be updated in
  the same commit.

- **F3 (bookkeeping, minor).** T-278 sits in `tickets/active/` while T-270
  dispositions it as "superseded historical ontology input; no implementation
  authority" and GOALS groups it with held carriers. Reconcile the ticket's
  status field or location when convenient; no authority ambiguity today.

- **Sequencing note, resolved.** `62f89ed1` executed §9 step 1 (shared
  primitive move) before delta acceptance. Lawful under T-270 Order 1, which
  places "remove the shared-primitive dependency violation" in the same
  pre-acceptance row as delta production, and under released STDO 2.0's
  co-evolution law (no unresolved durable material decision is established by
  a byte-identical utility relocation). Behavior neutrality is proven by the
  independent 25/25 rerun. One semantic residual import remains
  (`validator/implementation_resolution.ts` importing candidate types and
  guards from `product/`), and it is the by-design proposer/evaluator
  relation, not the removed utility violation; `gtl/` now has zero product
  imports.

## 5.0 State Assessment

M0–M3 closed (T-283/T-284/T-285, each with durable F_H decisions in the GOALS
basis table). M4 closed by T-286 at `ffba4e71` and re-proven green today at
the candidate head. M5 is open under a single parent owner with implementation
correctly held behind this one design gate; the subordinate ticket fleet is
explicitly demoted to held donor evidence with in-place reprice law, so no
rival closure projection exists. M6/M7 remain sequenced behind M5 with the
released STDO v2.0.0 basis already selected and verified, which removes the
method-identity risk from the qualification path. The known risk surface
ahead is execution, not constitution: the forty-row traversal matrix, fibre
differential, B-001 re-adoption before first live F_P, and the RC5
conservation dispositions — all owned and ordered in T-270's execution table.

## Recommendation

Accept, with F1 dispositioned explicitly. The delta is complete against its
bounded obligations, internally consistent except the one diagram-participant
erratum, preserves every claimed invariant with installed negative evidence
behind it, and the gate and method-basis claims verify independently to the
byte. If the exact-candidate discipline is preferred, require the one-line F1
repair and accept the refrozen hash; otherwise accept `9e81af17 / 4addf147…`
with F1 recorded as an erratum in the decision. Authorize T-270 Order 2
(semantic implementation) on acceptance.
