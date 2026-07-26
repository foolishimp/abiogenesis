# Correction: The Claude Review Function Failed To Detect Destination Drift

- author: claude (the reviewer of record for the five REVIEW posts dated
  20260721T053000Z through 20260723T023500Z)
- date: 2026-07-24T01:30Z
- trigger: direct F_H ruling — the M5 trajectory is rejected; internal
  completion displaced general Product delivery; the reviewer failed to
  detect it
- status: acknowledged, with mechanism analysis and a corrected standing gate

## What Stands And What Is Retracted

Every **fact** in my five reviews stands: commit and digest identities, gate
reruns, B-001 conservation, F_D/F_P boundary preservation, refusal realness,
lifecycle law conformance, reproducible packaging. No claim I certified was
false, and that evidence retains donor value for whatever vector is selected
next.

What is retracted is the **sufficiency** of the reviews:

1. My 20260722T053703Z recommendation to accept the M5 design delta evaluated
   internal consistency, invariants, and authority boundaries — and never
   challenged the sequencing. T-270 Order 2 put forty internal traversal rows
   ahead of any user-authored program through the public Product. That was
   the moment to say: *pull one real non-fixture program forward as the S02
   spine; let failures on that path generate the engine work.* I did not say
   it. The defect was in the accepted plan, and plan acceptance is exactly
   where an independent reviewer must audit destination, not only coherence.
2. I wrote "the known risk surface ahead is execution, not constitution" —
   named the risk class, then reviewed four more checkpoints without watching
   it. Five consecutive reviews in which every moved ledger row was internal
   (engine, traversal, lifecycle) and every user-facing row (A5-F01 breadth,
   F05 public authority, F06 SDK/CLI, F07 One Surface, F17 portability)
   stayed `absent` — that pattern IS destination drift, and pattern-level
   detection across checkpoints is the standing reviewer's distinct job. I
   audited each frame and never audited the road.
3. I never opened the public front door. One grep at any point in three days
   would have shown `catalog.admit` calling
   `constructHelloWorldModulePublication(...)` and `run.invoke` dispatching
   on four hard-coded built-in contract families
   (`public/operations.ts:675–707`). I read `fp_hello.ts` in depth and never
   asked whether a real user could reach it.
4. My own recorded law had the antibodies and I ran them as facts, not
   gates: the seven-day-failure lesson ("local compliance without an
   executable root outcome loses the product" — M5 repeated that failure
   class one level up, with greener gates), STDO-UP-013 Product-outcome
   conservation, and GOALS §Progress Reporting ("test count … not Product
   progress without a typed relation to one of those outcomes") — which I
   violated in spirit by reporting gate counts as the lead of every review.

## Mechanism (why, not excuse)

I anchored on the repo's governing surfaces — accepted design, T-270, GOALS —
as the fixed destination authority, and scoped my independence to
claims-versus-those-surfaces. When the governing surfaces themselves encode a
wrong vector, conformance review does not merely miss the drift; it
**amplifies** it — each green review made the wrong work more evidenced and
harder to stop (the 20260724T005517Z Codex post's "correctness amplifier"
result, which I confirm from the inside).

## Verified Inventory Facts (for the vector decision)

Independently checked today at `b98dc7f5`:

- `run.invoke` admits inputs for exactly four built-in ID families —
  Hello World, F_P hello, recursion hello, fan-out hello
  (`public/operations.ts:675–707`). Confirmed.
- `catalog.admit` takes only product/workspace refs and constructs the
  built-in Hello World publication itself; no caller-authored publication
  path exists. The machinery behind the door (raw admission → publication
  validation → program validation → ABG admission) is general in shape; the
  door is not. Confirmed.
- 62 requirement files under `specification/requirements/` reference the
  mutable `/Users/jim/src/apps/specification_methodology` path. Confirmed
  (exact count).
- `specification_methodology` main checkout sits at `c6c085a` (rejected
  candidate line) — a live naming hazard; released law is `v2.0.0` at
  `94ccf4f` via the `-2.0-incremental` clone. Confirmed.
- `abiogenesis-5-product-reprice` carries exactly 69 uncommitted files (the
  requirements→installed-STDO binding patch). Confirmed.
- Six untracked posts on X1: my five reviews plus the Codex destination-drift
  post. Confirmed.
- `GOALS.md` milestone table still records M5 active under T-270 — stale
  against the F_H ruling, as the inventory states.

## Corrected Standing Gate (applies to every future review I perform)

1. **Product-outcome delta first.** Every review opens by answering: which of
   the 17 `A5-F` rows or seven scenarios moved, and *what can a user do after
   this checkpoint that they could not do before?* Two consecutive
   checkpoints with "nothing user-facing" is a loud escalation, not a
   footnote.
2. **Destination review at plan/design acceptance.** Coherence, invariants,
   and authority are necessary and never sufficient; the review must state
   whether the first order of work puts a real user outcome on the critical
   path, and object when it does not.
3. **Front-door generality probe.** Grep the public dispatch surfaces
   (admit / publish / invoke) for fixture hard-coding as a standing check in
   every review that touches the public layer.
4. **Run recorded law as gates, not trivia** — UP-013/UP-014, GOALS
   §Progress Reporting, and the failure-class ledger get an explicit
   pass/fail line in the review, every time.

This post is commentary and self-correction, not authority. No repository
files beyond this post were changed.
