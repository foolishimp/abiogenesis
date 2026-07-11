# STRATEGY: ABG 5.0 Course Correction — Full Context

**Type:** STRATEGY (commentary under POSTING_GUIDE). This is the single, self-contained
context document intended to **drive the 5.0 course correction**. It carries three
things F_H asked to see together: (1) the **recovered original 5.0 feature set**, (2) the
**three-way gap** between *ABG/GTL 4.6 today*, *codex's in-flight 5.0 plan*, and the
*correct delivery goal*, and (3) the KEEP/DROP/DEMAND-DRIVEN retarget with a recovery
accounting. It is commentary for F_H adjudication — it changes no live authority until
repriced.
**Author:** claude · 2026-07-11 (rev 2026-07-12)
**Reader:** whoever picks up 5.0 next (codex, a fresh agent, or F_H). §2 is the
diagnostic spine; §11–§12 are the actions.

---

## 0. The correction in one paragraph

The 5.0 plan drifted from the target F_H actually scoped. The original 5.0 framed
self-hosting as a **data-mapper–style software-build campaign** whose subject is the next
ABG/GTL generation (features F2/F25). During promotion into T-218 that was reinterpreted
into a **formal compiler self-host** (installed ABG rebuilds ABG's own source into C1,
C1 rebuilds C2, prove `C1 ≡ C2` as a fixed point) **plus a core C-runtime rewrite**
(retire the CCALL strangler window, rebind the deepest M03 kernel) that was never in the
original feature set. F_H's restated intent: **ABG/GTL 4.6 is good enough; GLC 0.1 is
installed over it; use GLC's spec-driven/ODD discipline — exactly the data-mapper
campaign that already produces good results — to build GTL 5.\* and beyond.**
"Self-hosting" here is operational dogfooding, not a cryptographic fixed-point proof.
Retarget to the campaign model; stand down the self-host and kernel-rewrite leaves; keep
the substrate + discipline + campaign + release machinery. Nothing committed unwinds.

## 1. What 5.0 was originally scoped to be (recovered feature set)

Recovered verbatim from `comments/claude/20260710T160000Z_ANALYSIS_5_0_feature_set_and_closure_conditions.md`.

**5.0 in one sentence (original):** the release after which a released GLC runs over a
released ABG, ABG builds ABG under SPEC_METHOD conformance, and a stranger can consume
the substrate without reading the source tree.

**Gate 0:** G1 4.6.0 final ships · G2 5.0 direction lawfully admitted (goal/intent reprice).

**Chain SH — self-hosting (the defining goal):**
- F1 self-hosting closure invariant + Maturity Method
- **F2 ABG-builds-ABG acceptance campaign — subject is the abiogenesis tenant itself, over the installed prior release, "committed evidence ledger (rc.2 pattern)"**
- F3 SPEC_METHOD conformance audit of ABG's own surfaces
- F4 typed path carriers · F5 job-bound materialization plan · F6 B-010 executed
- **F25 SCN-ABG-SOFTWARE-BUILD scenario — subject is the next ABG source, "declared in the data-mapper pattern (scenario declarations + worker turns + earned depth)"**
- F26 observer/tuner supervisor seat over ABG's own build
- F27 citability / frozen-law as the tenant-independent verdict

**Chain SP — spec-as-product + conformance suite:** F7 suite extraction · F8 discoverable catalog · F9 pass@k · F10 generic test-harness · F11 F_D-leak gate · F12 causal-predecessor gate · F13 comment→spec lifecycle · F14 handler-authority Prime · F15 EVENTS-025 semantics.

**Chain EX — externalization:** F16 license/metadata · F17 registry/publish + semver · F18 curated public API · F19 agent-CLI decoupling · F20 portable docs + consumer gate · F21 public ingress + SDK entrypoint · F22 registry lifecycle.

**Chain TM — tenant multiplication (sets up, doesn't build):** F23 tenant-onboarding pack · F24 four runtime-law residual pins (hygiene).

**Load-bearing recovery fact:** read F2 and F25 verbatim — *"a software-build scenario
whose subject is the abiogenesis tenant itself… declared in the data-mapper pattern…
committed evidence ledger (rc.2 pattern)."* **The original self-hosting chain WAS the
campaign model.** It was right on 2026-07-10. The drift is not in the original scope; it
entered at promotion.

## 2. The three-way gap: 4.6 today · codex's 5.0 · correct delivery

This is the diagnostic spine. For each capability that 5.0 touches, three columns: what
**ABG/GTL 4.6** (= `4.6.0-rc.3`, the exact immutable predecessor; no `4.6.0-final`
exists; dev tree is `5.0.0-dev.0`) does **today**, what **codex's T-218 plan** builds,
and the **correct 5.0 delivery** under the campaign model. The last column is the gap
that actually matters.

| # | Capability | ABG/GTL 4.6 today | Codex's 5.0 plan (T-218) | Correct 5.0 delivery | Gap verdict |
|---|---|---|---|---|---|
| 1 | Build engine (spec → real software via AI worker turns) | data-mapper campaign runs on rc.3, converges (rc.1/rc.2, **64/64** verified-restore kills), real Scala/sbt | re-cast as a formal `self_build_program_manifest` **B5** carrier (DS-1F/T-224) | use the campaign **as-is** — it *is* the engine | **none in 4.6**; codex delta = drift |
| 2 | Dev environment (released stack installed as builder: GLC over ABG) | odd_glc **0.1 installed over rc.3**, digest-verified chain (peerDep `4.6.0-rc.3` / `9cffb372…`) | DS-1 install/bind/catalog (T-222/T-223) — correct, committed | keep DS-1 exactly | **closed** — this codex work is KEEP |
| 3 | Self-hosting (stack builds its successor) | campaign can target **any** subject, incl. the next GTL/ABG source | formal `I4+B5+S5→C1`, `I1+B5+S5→C2`, prove `C1≡C2`; `R5:=C1` (DS-3/T-233/234) | point the campaign at the **GTL-5 source** (operational dogfood) | **none in 4.6**; codex delta = wrong bootstrap |
| 4 | C runtime / `workflow.C` | 4 of 7 C terms execute; `workflow.C` returns honest `semantic_not_realized`; strangler window stands but rc.2 showed **86/86 arms enclosed** | full rewrite — retire strangler, rebind M03 stage kernel, realize `workflow.C` up front (DS-2/T-227) | **additive + demand-driven** — realize `workflow.C` only if a GTL-5 program uses it | **small, real, demand-driven**; codex delta = premature big-bang |
| 5 | Authoring grammar (typed GTL/C algebra + guard) | T-220 landed (`014448f`, 1430/1430, 19 negatives) | T-220 — correct work | keep | **closed by committed work** |
| 6 | **The GTL-5 spec (the build subject)** | **does not exist yet** | buried under the bootstrap; never written as a spec | **write it** — the first real piece of forward work | **REAL — the gap that matters — unaddressed** |
| 7 | **Run GTL-5 through the campaign (the delivery)** | engine ready; only the subject spec is missing | gated behind `C1/C2` — can't run until the fixed point proves | run it once the spec exists; earned-depth + evidence ledger (rc.2 pattern) | **REAL — the delivery — blocked only by ordering** |
| 8 | Release GTL-5 | pack→install→live-proof→digest→tag discipline proven (rc.3, odd_glc 0.1) | `R5:=C1` — release defined as the self-host output | release via the **proven discipline** | **none in 4.6**; codex delta = coupled to wrong artifact |
| 9 | Conformance-suite-as-product (chain SP, F7–F15) | gates exist internally; not extracted/discoverable; no pass@k harness | on the up-front critical path | **F_H scope call** (5.0 vs 5.1) | **real if scoped; deferrable** |
| 10 | Externalization (chain EX, F16–F22) | odd_glc proves a consumer can install; no public registry / license / curated API | on the up-front critical path | **F_H scope call** (5.0 vs 5.1) | **real if scoped; deferrable** |
| 11 | 4.6 as the permanent foundation | exists only as `4.6.0-rc.3`; T-221 **abandoned** the `4.6.0-final` tap (rc.3 = permanent predecessor) | rc.3-permanent, rebound as T-218 `P4`/`I4` | revisit the T-221 fork — qualify a clean `4.6.0-final` rather than build on an RC | **F_H fork to revisit (premise changed)** |
| 12 | Python parity | paused (T-096), held as reactivation authority | carried as reactivatable in constitutional surfaces | **withdrawn** — no python parity | **tickets closed 2026-07-12; constitutional surfaces pending** |

**Reading the gap.** Four patterns fall out, and they are the whole correction:

- **Rows 1–3, 8 — the gap between 4.6 and the correct goal is ZERO.** 4.6 already builds
  software, already hosts an installed GLC, can already target its successor, and already
  knows how to release. Every place codex built heavy machinery here (the B5 carrier, the
  `C1≡C2` fixed point, `R5:=C1`) is machinery spanning a gap that **isn't there**. Remove
  from the critical path; keep the designs as a reference shelf.
- **Rows 6–7 — the ONLY gaps that actually deliver 5.0** (write the GTL-5 spec, run it
  through the campaign) — and codex buried both under the bootstrap. This is where all
  forward work goes.
- **Rows 4, 9, 10 — real but optional:** `workflow.C` is demand-driven (build it only if
  a GTL-5 program needs it), and SP/EX are an F_H scope call — none of them is up-front
  kernel work.
- **Rows 5, 11, 12 — already closed or a clean decision:** T-220 landed; `4.6.0-final`
  and Python are F_H calls, not builds.

**Net:** the shortest path from 4.6 to a delivered GTL-5 crosses **two real gaps** (write
the spec, run the campaign) plus a release you already know how to do. Codex's plan
crosses ~10 constructed gaps, most of which don't separate 4.6 from the goal at all.

## 3. F_H's model, restated precisely (the reframe)

> abg/gtl → 4.6 is good enough → glc 0.1, install glc over working abg/gtl, use glc
> discipline spec-driven/ODD to build gtl 5.* beyond … it's just like data mapper, which
> we are currently getting good results for.

In toolchain terms: **ABG 4.6 = the stable machine/VM (frozen). GLC 0.1 = the
compiler-front-end + build-system + methodology, installed on it. GTL 5.\* = the next
thing you build with that toolchain.** Building GTL 5 is the data-mapper campaign pointed
at a new subject: spec → GLC/ODD lifecycle → AI worker F_P turns → F_D admission →
earned-depth proof → converged artifact. Self-hosting = the working stack building its
own successor. Operational, not a formal proof.

## 4. Where the plan drifted (three precisely-located moves)

1. **Reinterpretation.** F2/F25 ("the campaign builds ABG's next source") became a
   *formal compiler self-host*: a `self_build_program_manifest` B5, an `I4+B5+S5→C1` /
   `I1+B5+S5→C2` two-stage bootstrap, and a `C1 ≡ C2` equivalence proof. Same words,
   heavier machine (row 3).
2. **Added scope never in the original.** A **complete-C-runtime rewrite** — retire the
   CCALL strangler window, "rebind the deepest M03 stage-selection kernel," realize
   `workflow.C` up front (DS-2/T-227). No such feature exists in the original 27. Pure
   drift (row 4).
3. **Front-loaded the milestone chains.** SP (conformance-suite-as-product) and EX
   (externalization) placed on the up-front critical path — legitimately *productization*
   scope, but deferrable and F_H's call, not the defining work (rows 9–10).

## 5. The evidence the drift's premise is false

The plan's load-bearing premise — "complete/rewrite the C runtime and formally self-host
before you can build forward" — is contradicted by measured facts:

1. **The data-mapper campaign runs on ABG 4.6 as-is and gets good results** — real Scala,
   real sbt, mutation-tested, converged (rc.1: 3 retries/~56 min; rc.2: 2/~81 min; 64/64
   verified-restore kills). It needs neither `workflow.C` realized nor the strangler
   retired. You are already building real software forward over 4.6.
2. **The capabilities exist and ran** — 31 source files carry the working
   spine/dispatch/consequence/foldback/handlers; four of seven C terms execute today.
3. **The "debt" DS-2 rewrites is tiny** — every deferred-strictness marker in `code/src`
   is 7 files (9 "transitional", almost all in one `c_call_enclosure.ts`; 2 "strangler";
   1 "rival export"). rc.2 showed **86 `c_call_opened` / 86 `c_call_judged`** — arms are
   already enclosed in the real runtime. The strangler catches a theoretical path the
   working engine doesn't take; retiring it is "flip a severity + fix a few edges," not a
   kernel rewrite.

## 6. Course correction — KEEP / DROP / DEMAND-DRIVEN

### KEEP — the foundation, mostly already committed

| Piece | Commit(s) | Why it stays |
|---|---|---|
| ABG/GTL 4.6 as the frozen substrate | rc.3 boundary | the "good enough" base (see §11 finalize fork) |
| odd_glc 0.1 — GLC installed as the discipline | odd_glc `a878475` | released, live-proven; this is the dev environment |
| the data-mapper–style campaign machinery | (existing) | this IS the build engine |
| DS-1 install/bind/catalog foundation | T-222 `7be217c`, T-223 `28da030` | the campaign binds over an installed stack; keep, don't extend |
| T-219 spec reconciliation | `cc8bd22`/`58905ca` | spec honesty; independent of the bootstrap |
| T-220 typed C algebra + authoring guard | `014448f` | prevents the vector-router category error; pure keep |
| release discipline (pack→install→live-proof→digest→tag) | rc.3 + odd_glc 0.1 | proven; how you ship any artifact incl. GTL 5 |
| existing observer/tuner + witness (4.6) | (shipped) | already the supervisor over campaigns |
| truth-corrupting correctness residuals (replay-ordinal, per-store emitter, basis-fork) | CR-RL-01/02/06 | real bugs regardless; small independent fixes |

### DROP — the compiler-bootstrap and core-rewrite apparatus

| Piece | Leaf | Why it goes |
|---|---|---|
| B5 self-build carrier | DS-1F / **T-224 (active)**, T-225 | formal "ABG rebuilds ABG" — wrong bootstrap. **Codex is in T-224; stop first.** |
| DS-2 as a kernel rewrite | T-227 (unstarted) | the core rewrite F_H didn't expect; premise contradicted by live results |
| two-stage self-host C1/C2 | DS-3 / T-233, T-234 (unstarted) | the gcc fixed-point proof; not this model |
| formal self-conformance proof | T-231/T-232 (unstarted) | existing observer/tuner already runs over campaigns |
| heavy A5-R1 qualification framework | T-238/T-239 (unstarted) | the campaign's earned-depth proof IS the qualification; keep only the lightweight self-certifying snapshot |

Note: of the DROP leaves, **only T-224 is live** — the rest are unstarted, so the DROP is
mostly "do not open," not "unwind."

### DEMAND-DRIVEN — build only when the GTL-5 campaign pulls it

- `workflow.C` runtime — only if a GTL-5 program uses it (data-mapper doesn't).
- node_type/overlay public application (T-228) — only if GTL 5 needs those kinds.
- odd_glc declarations-only demotion (T-033) — a convenient cleanup, not required.
- public SDK/operator completions (DS-1 tail, T-229/T-230) — only if the campaign surface
  needs them; `genesis-ts start/gaps/witness/tune` already drives campaigns.

## 7. Recovery — almost nothing is wasted

- **Reused directly (foundation):** rc.3 substrate, GLC 0.1, DS-1 install/catalog
  binding, T-220's authoring grammar, the release discipline, the campaign engine, the
  observer/tuner. Keep-able as-is.
- **Reused as reference (design library):** the DROP leaves are not deleted effort —
  T-226's C-runtime design, T-233's self-host design, and codex's in-flight DS-1F carrier
  thinking become the **reference specs the discipline consults if/when the GTL-5 campaign
  genuinely demands those capabilities.** They move from the critical path to an on-demand
  shelf.
- **Reclassified (candidates):** `workflow.C`, node_type/overlay, declarations-only
  demotion → demand-driven candidates.
- **Genuinely stopped:** only codex's uncommitted DS-1F (T-224) continuation; even its
  notes archive as reference.
- **Not unwound:** DS-0, DS-1, T-219, T-220, T-221, and the releases stay committed.
  Nothing reverts; you stop building the bootstrap from here.

## 8. Python parity — withdrawn (F_H ruling, executed 2026-07-12)

F_H ruling: **"there should not be any python parity."** Python is *abandoned*, not
paused. Executed: the three -PY parity tickets (T-092/094/095-PY), previously held "as
reactivation authority," are terminal-**rejected** (`withdrawn_python_parity_line`) and
moved to `completed/` (commit `8ea0310`). The `abg-total-assurance-calculus` capability
they named is realized in the TypeScript line only.

**Remaining constitutional reconciliation (not yet done — reprice/owner territory):**
`build_tenants/TENANT_REGISTRY.md`, completed `T-096` ("declare TS primary and *pause*
Python"), and any INTENT/GOALS language naming the Python carrier in shipping /
self-reconstruction criteria must move from "paused/reactivatable" to "withdrawn." The
TypeScript tenant is the primary and only line; Python is not owed parity and is not a
reactivation target.

## 9. The new shape of "5.0"

1. **Settle ABG/GTL 4.6** (see §11 finalize fork).
2. GLC 0.1 installed — done.
3. Data-mapper campaign proven — done, good results.
4. **Write the GTL 5.\* spec** (the build subject) — row 6.
5. **Run the campaign with GTL 5 as the subject** — same lifecycle as data-mapper — row 7.
6. Let ODD surface any small ABG increment GTL 5 truly needs; build those through the
   discipline (row 4 and the demand-driven set).
7. **Release** GTL 5 via the proven pack/install/live-proof/tag discipline — row 8.

~4 of the 18 leaves kept (mostly done) + the campaign, versus an 18-leaf kernel-touching
milestone. This is the incremental effort that was expected — and it matches the original
SH chain (F2/F25), which was the campaign model all along.

## 10. The genuine remaining scope decision (SP + EX)

The one thing the campaign model does NOT auto-resolve: **how much of the original SP
(conformance-suite-as-product) and EX (externalization) chains belong in 5.0** (rows
9–10). Two coherent positions:

- **5.0 = the increment** (matches "just like data-mapper"): SH-campaign + F24 hygiene +
  demand-driven only. SP and EX lift to 5.1. Fastest; days-to-weeks of authoring.
- **5.0 = the productization milestone** (the original one-sentence definition): keep SP +
  EX so a stranger can consume the substrate and tenants certify against a suite. The
  original 27-feature scope minus the drift.

This is the decision that actually sizes 5.0. It is F_H's.

## 11. Concrete retarget actions

1. **Immediate:** stand codex down on **T-224 (DS-1F)** before it deepens the self-build
   carrier, and **do not open T-227's break order.**
2. **Settle 4.6 (revisit the T-221 fork).** T-221 recorded F_H *abandoning* the
   `4.6.0-final` tap because 5.0 was going to supersede ABG via self-host. That premise is
   gone: under this model **4.6 is the permanent, load-bearing foundation** — so a clean
   `4.6.0-final` is worth revisiting rather than building the future on a release
   candidate. This re-opens the T-221 disposition as a goal-reprice decision (row 11).
3. **Reprice the target.** Reprice GOAL-034 / the T-218 successor to the campaign model;
   reclassify DROP leaves (T-224/225, T-227, T-231–234, T-238/239) as
   dropped-or-demand-driven; keep DS-0/DS-1/T-219/T-220 as landed foundation.
4. **Python reconciliation** (§8): TENANT_REGISTRY / T-096 / INTENT-GOALS "paused" →
   "withdrawn."
5. **Decide SP/EX scope** (§10): increment vs milestone.

## 12. Decisions for F_H (the queue)

1. Confirm the retarget: campaign model over compiler self-host (§2 rows 1–3, §6).
2. Settle 4.6 — qualify a `4.6.0-final` or keep rc.3 as the permanent predecessor (§11.2).
3. SP + EX in 5.0, or lift to 5.1 (§10) — this sizes the release.
4. Ratify the Python withdrawal reconciliation of the constitutional surfaces (§8).
5. On your word, I draft the GOAL-034 / T-218-successor reprice and the leaf
   reclassifications.

## 13. Artifact boundary

Commentary. It changes no GOALS, INTENT, PRODUCT, requirement, design, or release scope.
The Python-parity ticket withdrawals (§8) are executed because they are a direct
disposition of a clear F_H ruling on backlog items; the constitutional Python
reconciliation and the T-218 retarget require the normal reprice through F_H
adjudication. Until repriced, T-218's promoted target and its leaf DAG remain the
standing authority.
