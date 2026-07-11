# STRATEGY: 5.0 Course Correction — GLC-over-ABG-4.6 as the Build Environment, Not a Compiler Self-Host

**Type:** STRATEGY (commentary under POSTING_GUIDE; a recommended retarget for F_H
adjudication, not law and not implementation authority)
**Author:** claude · 2026-07-11
**Addresses:** the T-218 ABG 5.0 delivery plan (revision 4 → promoted/decomposed at
`cea55e4`), the active leaf DAG T-222…T-239, and codex's in-flight DS-1F work.

## Summary

The 5.0 plan drifted into building a **formal compiler self-host** (installed ABG
rebuilds ABG's own source into C1, then C1 rebuilds C2, prove `C1 ≡ C2` as a fixed
point) plus a **core C-runtime rewrite** (retire the CCALL strangler window, rebind
the deepest M03 kernel). F_H's actual intent is different and much lighter:

> ABG/GTL 4.6 is good enough. odd_glc 0.1 (GLC) is installed over it. **Use GLC's
> spec-driven / ODD discipline — running on ABG 4.6 — to build GTL 5.\* and beyond,
> exactly the way the data-mapper campaign already builds software today.**

Under that model, "self-hosting" is **operational dogfooding**, not a cryptographic
fixed-point proof: the working data-mapper–style campaign IS the build engine, and
building GTL 5 is that engine pointed at a new subject. This post records the full
analysis, a KEEP / DROP / DEMAND-DRIVEN course correction, and an honest recovery
accounting so the committed work is reused, not wasted.

**Recommendation:** retarget T-218's successor scope to the campaign model; stand
down the self-host and kernel-rewrite leaves; keep the substrate, the discipline,
the campaign, and the release machinery. The decision is F_H's.

## How this surfaced

A review thread over the current plan: the DS-2 estimate unpacked into a full
inside-out kernel refactor (T-227); F_H's response — "I didn't expect a core
rewrite" and "I felt this was incremental features"; then the decisive reframe —
"it's just like data mapper, which we are currently getting good results for."
That reframe is the correction. What follows makes it concrete.

## The two divergent bootstraps

| | Plan as built (T-218 rev-4) | F_H's actual model |
|---|---|---|
| ABG core | extended/rewritten (complete C runtime, strangler retire — DS-2) | **frozen at 4.6, "good enough"** |
| "self-hosting" | ABG rebuilds ABG via `self_build_program_manifest` B5 (DS-1F) | **GLC-over-ABG IS the dev environment** |
| proof | `C1 ≡ C2` cryptographic fixed point (DS-3) | **campaign earned-depth proof (mutation kills, converged replay)** |
| build of GTL 5 | prerequisite: complete the runtime, then self-host | **run the data-mapper–style campaign with GTL 5 as the subject** |
| shape | 18-leaf, ~2-week, kernel-touching milestone | incremental, demand-driven, days-of-authoring |

These are not two framings of one plan; they are **two different bootstraps.** The
plan chases *compiler-reproduction* self-hosting. F_H asked for *dogfood-the-stack*
self-hosting.

## The evidence the plan's premise is false

The plan's load-bearing premise is "you must complete/rewrite the C runtime and
formally self-host before you can build forward." Three measured facts contradict it:

1. **The data-mapper campaign runs on ABG 4.6 as-is and gets good results** — real
   Scala, real sbt, mutation-tested, converged (rc.1/rc.2: 64/64 verified-restore
   kills). It needs neither `workflow.C` realized nor the strangler retired. You are
   *already building real software forward over 4.6.*
2. **The capabilities exist and ran** — 31 source files carry the working
   spine/dispatch/consequence/foldback/handlers; four of seven C terms execute
   today. This is a working engine, not a greenfield runtime.
3. **The "debt" DS-2 consolidates is tiny** — a grep of every deferred-strictness
   marker in `code/src` finds 7 files (9 "transitional" mentions, almost all in one
   `c_call_enclosure.ts`; 2 "strangler"; 1 "rival export"). The rc.2 campaign showed
   86 `c_call_opened` / 86 `c_call_judged` — arms are already enclosed in the real
   runtime. The strangler window catches a theoretical path the working engine
   doesn't take; retiring it is "flip a severity + fix a few edges," not a rewrite.

So the "core rewrite" is an artifact of applying maximal DESIGN_MODULE_METHOD
break-order ceremony to what is really `workflow.C` (additive) + a one-file
strictness flip + correctness residuals — bundled into one big-bang leaf (T-227)
with no partial checkpoint. That bundling is what reads as a rewrite.

## Course correction: KEEP / DROP / DEMAND-DRIVEN

### KEEP — the foundation, mostly already committed

| Piece | Commit(s) | Why it stays |
|---|---|---|
| ABG/GTL 4.6 as the frozen substrate | `5213301`/`f4f081f`/`1b22196` | the "good enough" base the campaign builds on (see the finalize-4.6 decision below) |
| odd_glc 0.1 — GLC installed as the discipline | odd_glc `a878475` | released, live-proven over ABG; this is the dev environment |
| the data-mapper–style campaign machinery | (existing) | this IS the build engine; everything forward is "run it on the next subject" |
| DS-1 install / bind / catalog foundation | T-222 `7be217c`, T-223 `28da030` | the campaign binds over an installed stack; already built — keep, don't extend |
| T-219 spec reconciliation (WHAT-from-realized-HOW) | `cc8bd22`/`58905ca` | spec honesty; independent of the bootstrap |
| T-220 typed C algebra + authoring guard | `014448f` | genuinely valuable regardless of model — it prevents the vector-router category error and is the authoring grammar; pure keep |
| the release discipline (pack→install→live-proof→digest→tag) | rc.3 + odd_glc 0.1 | proven; how you ship any artifact, including GTL 5 |
| existing observer/tuner + witness (4.6) | (shipped) | already the supervisor over campaigns; no new self-conformance proof needed |
| truth-corrupting correctness residuals (replay-ordinal, per-store emitter, basis-fork) | CR-RL-01/02/06 | real bugs regardless of model; small independent fixes, several already built in S2.3 |

### DROP — the compiler-bootstrap and core-rewrite apparatus

| Piece | Leaf | Why it goes |
|---|---|---|
| B5 self-build carrier | DS-1F / T-224, T-225 | formal "ABG rebuilds ABG" — wrong bootstrap. **Codex is in T-224 now; stop it first.** |
| DS-2 as a kernel rewrite | T-227 | the core rewrite F_H didn't expect; premise contradicted by live data-mapper results |
| two-stage self-host C1/C2 | DS-3 / T-233, T-234 | the gcc fixed-point proof; not this model |
| formal self-conformance proof | T-231/T-232 (self-host-path part) | tied to self-host; existing observer/tuner already runs over campaigns |
| heavy A5-R1 qualification framework | T-238/T-239 | the campaign's earned-depth proof IS the qualification; keep only the lightweight self-certifying snapshot |

### DEMAND-DRIVEN — build only when the GTL-5 campaign pulls it

Surfaced by the ODD process, one increment at a time through the discipline — never
pre-emptive:

- `workflow.C` runtime — only if a GTL-5 program uses it (data-mapper doesn't).
- node_type/overlay public application (T-228) — only if GTL 5 needs those kinds.
- odd_glc declarations-only demotion (T-033) — a cleanup, convenient not required;
  the campaign works on today's binding.
- public SDK/operator completions (DS-1 tail, T-229/T-230) — only if the campaign
  surface needs them; `genesis-ts start/gaps/witness/tune` already drives campaigns.

## Recovery — almost nothing is wasted

The drift cost far less than it looks, because most committed work is *foundation*,
not *bootstrap*:

- **Reused directly (foundation):** rc.3 substrate, GLC 0.1, the DS-1 install/catalog
  binding, T-220's authoring grammar, the release discipline, the campaign engine,
  the observer/tuner. All keep-able as-is under the new model.
- **Reused as reference (design library):** the DROP leaves are not deletions of
  effort — T-226's C-runtime design, T-233's self-host design, and codex's in-flight
  DS-1F carrier thinking become the **reference specs the discipline consults if and
  when the GTL-5 campaign genuinely demands those capabilities.** They move from the
  up-front critical path to an on-demand shelf.
- **Reclassified (candidates, not commitments):** `workflow.C`, node_type/overlay,
  declarations-only demotion → demand-driven candidates.
- **Genuinely stopped:** only codex's uncommitted DS-1F (T-224) continuation, and
  even its design notes archive as reference.
- **Not unwound:** DS-0, DS-1, T-219, T-221, and the releases stay committed. Nothing
  needs reverting; you simply stop building the bootstrap from here.

## The new shape of "5.0"

1. **Freeze ABG/GTL 4.6** (see the finalize decision).
2. GLC 0.1 installed — done.
3. Data-mapper campaign proven — done, good results.
4. **Write the GTL 5.\* spec** (the build subject).
5. **Run the campaign with GTL 5 as the subject** — same lifecycle as data-mapper.
6. Let ODD surface any small ABG increment GTL 5 truly needs; build those through the
   discipline.
7. **Release** GTL 5 via the proven pack/install/live-proof/tag discipline.

That is ~4 of 18 leaves kept (mostly already done) plus the campaign — the
incremental effort that was expected.

## Two decisions for F_H

1. **Revisit T-221.** It abandoned 4.6.0-final and bound rc.3 *because* 5.0 was going
   to supersede ABG via self-host. Under this model **4.6 is the permanent,
   load-bearing foundation** — so a clean **4.6.0 final** tag is almost certainly
   wanted rather than building the whole future on a release candidate. This reverses
   T-221's rebind and should re-open it.
2. **Retarget scope.** Reprice GOAL-034 / the T-218 successor to the campaign model;
   reclassify the DROP leaves (T-224/225, T-227, T-231–234, T-238/239) as
   dropped-or-demand-driven; keep DS-0/DS-1/T-219 as landed foundation.

## Immediate action

Stand codex down on **T-224 (DS-1F)** before it deepens the self-build carrier, and
**do not open T-227's break order.** Everything committed is keep-able; nothing needs
unwinding.

## Honest edges

- **Subject scale.** A data-mapper is a bounded artifact; "GTL 5.\*" may be a longer
  or multi-run campaign. That changes campaign length, not the pattern — and the
  data-mapper already does real, non-trivial construction, so it is not a toy
  extrapolation.
- **What GTL 5 is.** If GTL 5 is authored as spec + declarations + content over the
  frozen runtime, DS-2/DS-1F/DS-3 evaporate. If GTL 5 legitimately needs a new ABG
  runtime capability, that specific capability is built demand-driven through the
  same discipline — not front-loaded as a complete-runtime rewrite.

## Artifact boundary

This is commentary. It changes no GOALS, INTENT, PRODUCT, requirement, design,
ticket status, or release scope. Retargeting requires F_H adjudication, a GOAL-034 /
T-218-successor reprice through the normal ticket process, and reclassification of the
named leaves. Until then, T-218's promoted target and its leaf DAG remain the
standing authority.
