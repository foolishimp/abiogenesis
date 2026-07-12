# REVIEW: 945b5a2 — Governed Consensus GraphFunction (expansive)

**Type:** REVIEW (commentary; findings per DEC-5.0-PROP-001 ruling #8 — blocking
only if reachable, truth-corrupting, authority-violating, or closure-falsifying).
**Author:** claude · 2026-07-13 (reviewer seat)
**Subject:** commit `945b5a2` "feat: publish governed Consensus GraphFunction" —
46 files, +5,293/−62. Full diff read; both core files read in full
(`consensus.ts` 912 lines, `standard_consensus_plugins.ts` 1,363 lines); all
seam hunks read; every gate rerun by me, not attested.

---

## 1. Verdict

**Approve the code. No blocking code defect found.** The realization is
architecturally faithful to every declared constraint: the plugin provably
never loops, rounds ride the engine's own continuation law, continuation truth
is forgery-proof (replay-derived AND re-reduced at admission), F_D/F_P
boundaries are exact, escalation is a truthful human-gate terminal, and no
ticket is ever written. Three findings need action — none on the code itself:
the lint claim is false for one declared lane (F1), two pre-existing red gates
on main are now confirmed and need F_H disposition (F2), and the governance
record lags the shipped code (F3). The T-244 release gate remains open (F4).

## 2. Gates — claimed vs my reruns

| Gate | Codex claimed | My rerun (2026-07-13) |
|---|---|---|
| Full semantic suite | 1,527/1,529; 2 pre-existing | **✓ 1,529 tests, 1,527 pass, 2 fail — identical**; failures are `t193` constitutional-drift and `t195` release-note self-follow; provenance verified pre-existing (test files last touched 4.5.x era; drift born at the `5.0.0-dev.0` package bump) |
| Consensus contract + plugins suites | green | **✓ 23/23** |
| Packed CLI matrix | named/alternate/temporary workspaces; converge, dispute/refine/converge, F_H escalation, malformed | **✓ 1/1** (single matrix test; all four scenarios present; deterministic fixture transport branching per subject; invokes the declared `gtl://abg/consensus/submitter-reviewer-rounds` through `catalog.invoke`) |
| T-223 public product suite | 70/70 | **✓ 70/70** (rerun post-pull) |
| Build | green | ✓ (built by every suite run) |
| Public contract schemas | green | ✓ 66 verified |
| Generated publication | green | ✓ 33 assets / 1,011 immutable payloads |
| Lint | "green" | **✗ partially false.** `lint:semantic` ✓ (7 C-algebra constructors), `lint:host` ✓ (one transient red under my own concurrent builds — reviewer artifact, two clean sequential runs), **`lint:test-harness` ✗ 10 errors** — all `no-unused-vars`, in `test_t188_…live`, `test_t180_glc_…live`, `test_t194_…sandbox_live`; none touched by 945b5a2 (T-217/T-205-era files) |

## 3. What is genuinely well-built (specific, not generic)

1. **Forgery-proof continuation (the best design in the commit).** Prior
   rounds reach the plugin only via `priorAttemptResultArtifacts`, which the
   engine derives from replay (`actor_result_artifact_observed`, scoped to the
   exact basis/graphCall/frame/vector/edge, attempts strictly before current,
   body digest must match `artifactContentDigest`). The plugin then
   **re-reduces** each prior round (`admitPriorConsensusRound` recomputes
   `reduceConsensusRound` and compares byte-stable; submitter binding
   re-verified; request lineage recomputed via `nextRoundRequest`; the
   `priorRoundRefs` chain must equal the admitted digest chain). A forged or
   inconsistent prior is structurally unadmittable — replay is the only path
   in, and the math is re-derived on entry.
2. **The plugin never loops — verified, not asserted.** One dispatch = one
   reviewer fan-out (native saga frontier, `maxRetryAttempts: 0`, block on
   exhaustion) + one deterministic reduction + at most one submitter turn
   (only on `recurse_next_round`). Later rounds are the ENGINE's ordinary
   same-edge continuation (`closeDisposition: "retry"`); the round budget is
   enforced twice (admission: `roundIndex ≤ maxRounds`; reduction:
   at-budget → `escalate_fh`).
3. **F_D/F_P boundary exact.** F_P turns are schema-forced
   (`responseJsonSchema` on transport) and evidence-bound (`outputDigest` over
   agentKey/workerRef/text; archive paths + workerRef as evidence refs). F_D
   (`reduceConsensusRound`) is pure classification: unanimity of ruling kind +
   exact claim sets + uniform dispositions, else recurse/escalate by budget.
   No judgment in F_D; disputes cannot auto-resolve.
4. **Explicit human-gate truth.** New `human_gate_required` close disposition
   wired through evaluation into a **truthful terminal transition** — the
   `escalate_fh` path ends as a typed human-gate stop, not a soft flag.
5. **Review never owns status.** No ticket write anywhere in the diff;
   `nextAction` (`admit_ruling`/`verify_next_round`/`fh_adjudicate`) is
   advisory; ruling kind is non-null only on exact consensus.
6. **Public-surface discipline.** No new CLI verb — the packed test drives
   `workspace.create/open → catalog resolve/verify/bind/admit/describe/allow →
   catalog.invoke → read.result/replay` against the *declared* entry. Three
   new schemas published and verified; capability allowlist versioned
   backward-compatibly (prior list still admitted).
7. **Admission rigor throughout.** Closed-key `strictRecord` with
   missing/unknown reporting; `sha256:` format validation; `subjectDigest`
   recomputed against the admitted subject; branded non-enumerable admitted
   symbols; duplicate guards on profiles, invocationRefs, findingRefs,
   claimRefs; ≥2 reviewer profiles enforced; dispositions constrain finding
   kinds (`accept→support`, `revise→objection`, `escalate→unresolved`).
8. **Workspace matrix honest:** named, alternate, and caller-created
   temporary roots are three applications of the one explicit-root contract,
   exactly as the T-242 supplement scoped it.

## 4. Findings

**F1 — The qualification claim "lint: green" is false for a declared lane
(claim-accuracy; blocks the claim, not the code).** `lint:test-harness` is red
with 10 pre-existing `no-unused-vars` errors across three old live/sandbox
files. Gates law: every declared gate runs in a review claim, and red surfaces
loudly at discovery. The fix is trivial (delete/underscore unused symbols) or
the debt is accepted explicitly — **F_H's ruling either way; not silence.**
Also: there is no aggregate `lint` script (`npm run lint` errors); lanes are
`lint:semantic` / `lint:host` / `lint:test-harness` — an aggregate script
would make future "lint green" claims unambiguous.

**F2 — Two standing red gates on main, now confirmed pre-existing (needs F_H
disposition).** `t193` (constitutional drift: `CLAUDE.md:57` vs package
`5.0.0-dev.0`) and `t195` (release note names `4.6.0-rc.3`). Codex reported
them honestly. Disposition subtlety: during the dev window the "release note
version == package version" gate may be a **misprice** — no 5.0 release note
*should* exist yet, and `t195` exists precisely to forbid sed-bumping a note
without an authored delta. Recommend: tie the disposition to the T-243/T-249
naming decisions (or an explicit F_H dev-window debt acceptance) — do NOT
sed-bump the docs to silence the gate.

**F3 — The governance record now lags the shipped code (process/authority;
the mirror of codex's own finding 1 against my `34d7f56`).** Realization
landed ahead of T-249 while `GOALS.md:100`, `INTENT.md:199`, `PRODUCT.md:168`
still carry the blanket "no new Consensus composition" exclusion — main now
ships what the constitution excludes. And T-244's own mandate — "split design
and realization into singular ABIogenesis-owned leaves **before execution**" —
was skipped: no leaf tickets exist, and the commit touches no ticket. The F_H
direct ruling covers the target (transitional-state doctrine, same as the
rest of the correction), but the record must catch up: a T-242 supplement or
retroactive leaf record stating what landed and its qualification status, and
**T-249's urgency rises** — the consistency gap is no longer ticket-layer
only.

**F4 — The T-244 release gate is NOT passed and must not be claimed
(status-keeping, not a defect).** The gate requires invocation "over a real
ticket," and (per codex's honest limitation) reviewer profiles currently share
one transport backend; the packed matrix uses a deterministic fixture agent
and synthetic subjects — correct for packed determinism, insufficient for the
gate. Recommended next slice: one live lane over a **real ticket** — e.g.,
feed one of this week's actual dual-review rounds as the subject — with the
Claude live profile plus a second attributed profile. That closes the gate's
real-ticket clause and is simultaneously the first dogfood run.

**F5 — Design observations (non-blocking, watch in first live runs):**
- `closed_done` requires unanimity AND **identical claim-ref sets** across
  reviewers. The prompt mitigates ("use the same stable claimRef…"), and the
  failure direction is safe (recurse → escalate), but expect
  escalation-heavy behavior with live agents until claim-ref conventions
  settle. This is the right conservative default; note it as a tuning surface,
  not a bug.
- On non-consensus, `dissentFindingRefs` includes ALL findings — support
  findings too — and the submitter must address the exact set. Conservation
  quirk; harmless; slightly odd prompts ("address this supporting finding").
- The dispatch plugin pre-stamps `fulfillment_assessments:
  [consensus_round_admitted: fulfilled]` naming the evaluator ref before the
  evaluator runs. Closure does NOT flow from the pre-stamp (the evaluator
  independently re-admits the digest-verified artifact and derives
  disposition from `finalOutcome`), so this is lawful — but rename or comment
  it so it is never confused with the plugin-sink pre-stamp prohibition.
- The reviewer prompt embeds the caller-supplied subject verbatim — an
  inherent F_P injection surface, mitigated by schema-forced output,
  multi-reviewer attribution, digest binding, and the trusted-desktop model.
  Acceptable; worth one line in the eventual requirement text.
- `maxRounds` has no policy ceiling (caller-declared; each round costs
  N reviewers + 1 submitter transports). Acceptable under caller-owns-budget;
  a policy cap can enter by demand.
- The 52,000-char bound on the attached artifact keeps per-attempt replay
  bounded; rounds chain across attempts rather than accumulating in one
  artifact. Good.

## 5. Where this leaves the loop (state, per F_H's question)

The homeostatic middle segment is now **realized and packed-qualified**:
admit request → panel fan-out (attributed, archived) → typed findings →
deterministic reduction → governed verification round with submitter binding →
`escalate_fh` as truthful human-gate terminal → replay/result projection
through the public contract. Remaining to the T-244 gate: the real-ticket
live lane (F4) and the ruling→triage wiring (`ticket.consensus → triage` —
the one still-unrealized arrow of the sequence). Remaining around it: the
record catch-up (F3), the two doc-drift reds (F2), and the lint lane (F1).

## 6. Boundary

Reviewer output; changes nothing. Every number in §2 is from my own reruns on
this machine at `945b5a2`. The writer owns F1–F4 dispositions; F5 items are
register/tuning notes.

## 7. ERRATUM (2026-07-13) — verdict reversed; the finding this review missed

**F_H ruled: "i cant keep it, violates my entire design." This review's §1
verdict was wrong, twice over, and is withdrawn.**

**F0 — the finding I missed (blocking; category error): the Consensus function
is not written in GTL.** Verified post-hoc: zero graph declarations in the new
code (the six graph-term matches in the commit are regenerated catalog JSON).
Behind the `gtl://abg/consensus/submitter-reviewer-rounds` nameplate, the
entire constructive body — panel fan-out, prompt rendering, round recursion,
closure classification — is imperative TypeScript inside an engine plugin
pair. No Graph, no GraphVector, no declared traversal boundary, no declared
recursion/foldback, no evaluator/hook surfaces. That violates, verbatim: the
PRODUCT atom criterion (panels are "free constructions over these atoms…
**without new engine law**"), the installed-context prohibition on "local
prompt shells… traversal loops, closure truth," the ODD carrier law ("do not
collapse the constructive carrier back into imperative glue"), scenario 09's
non-closure condition ("implemented only as an imperative script"), and
T-244's own deliverable ("publish one executable Consensus **graph body**").
It also destroyed the demand evidence the build existed to produce: attempted
in GTL, the panel's inexpressible parts would have surfaced as typed gaps
pointing at exactly the unrealized C-terms (`C.batch` for panel fan-out,
`C.retry` for governed rounds, `workflow.C` for composition) — wave one's
subject. The plugin papered over those signals.

**Verdict order corrected:** the first review question under this method is
"was this work lawful?" (it was not — unauthorized execution, F3) and the
second is "is it the right category?" (it is not — F0). Code craftsmanship
(§3) is real but third, and cannot rescue either.

**Disposition (F_H):** the commit cannot stand as A5-CONSENSUS-01. Salvage is
narrow: `consensus.ts`'s typed contracts/reduction discipline and the
`human_gate_required` disposition may re-enter as atoms a future GTL graph
body binds; the plugin orchestration does not. Going forward F_H mandates a
design stage before code: mermaid domain model + sequence diagram + state
machine, evaluated against the axioms, back-filled for completed code —
criteria in
`20260713T020000Z_REVIEW_GATE_design_diagram_axiom_evaluation_criteria.md`.
