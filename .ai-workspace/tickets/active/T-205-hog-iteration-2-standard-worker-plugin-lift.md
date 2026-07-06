---
id: T-205
title: HoG iteration 2 — the standard worker plugin lifts into the substrate
status: active
class: design_reframe
opened: 2026-07-06
depends: T-200 (SATISFIED — closed 2026-07-06; the interpretation seam landed here at B2)
requirements: REQ-R-ABG3-CCALL-014/-017 (programs/ladders consumed); REQ-R-ABG3-HANDLERS-001/-014 (B1 handler-law authority)
acceptance: THE INTERNAL-EVERYTHING GATE first — ABG's own sandbox lanes prove catalogs/ladders/resume/re-entry/handlers with a real worker and -012 green, BEFORE any glc step; 4.5.0-rc.1 cuts on that gate. Then: a product on the standard F_P path ships ZERO plugin code —
  declarations only (catalog + selections + response contracts +
  materialization specs + calibration); the odd_glc data-mapper runs on
  the substrate's standard worker plugin with its binding reduced to
  declarations; -012 audit green on the result.
progress: B1 AUTHORED (REQ-R-ABG3-HANDLERS-001..-014, codex review requested). B-PREP PINNED (engine differentials, review-independent): re-entry continues from the frontier, closed C calls stay closed, FRESH ATTEMPT WINDOW after exhaustion is engine law (fixed worker re-attempts and converges), cCallRefs unique across resume, combined replay enclosure-clean — the odd_glc resume flag is pure scaffolding, no new engine law.
---

# T-205: The Plugin Lift

## Problem

The last downstream-encoded piece is THE PLUGIN: odd_glc's generated
binding hand-implements the F_P worker loop — transport invocation,
manifest→prompt consumption, response parsing, file materialization,
post-validation execution, evidence archiving, evaluator prompting.
Under the algebra these are GENERIC F_P/F_D mechanics (the substrate
already owns runAgentTransport, manifests, payload admission, the
attached-worker path); only the DOMAIN DATA is lawfully downstream.
Downstream plugin code is where campaign bugs #1/#3b/#4/#5/#9/#10/#11
all lived — every one a generic-mechanics defect encoded downstream.

## Target

`standardFpWorkerPlugin(declarations)` — substrate-owned, configured
entirely by admitted declarations:
- transport: the known-agent contract + env ingress (exists);
- prompt: the rendered manifest (exists) + per-stage
  instructionCategoryRefs (-016 prompt-level tuning);
- response: declared response contracts (JSON schemas are already
  scenario data);
- materialization + post-validation: declared file specs and execution
  plans run as F_D interiors (the deterministic machinery exists);
- evidence/archives: engine-owned, spine-enclosed (-006/-012).
Downstream keeps: domain declarations ONLY (catalogs, selections,
contracts, calibration/latitude). The plugin SEAM remains for exotic
fibres; the standard path needs no code.

## The factoring (user, ratification-grade): category vs functor

A plugin is TWO things, and only one of them is code:
- its CATEGORY — the declared composition: program/catalog/ladder,
  stage roles, contracts, response shapes, evidence classes, budgets.
  This is GTL structure (-014..-017) — the work already done. It is
  data, admitted fail-closed, drift-witnessed, tunable.
- its FUNCTOR — the effect handler: the mapping from a declared leaf
  morphism to the world. Invoke a transport; spawn a process; write
  files; await a human. Small, effectful, irreducible.
The substrate ships STANDARD HANDLERS per effect signature (F_P
agent-transport, F_D process-execution, F_D materialization, F_H
human-gate); the census binds armId → handler ref + declared config.
Custom handlers remain the plugin seam. "Plugin" stops meaning
"downstream program" and starts meaning "handler binding".

## Handler classes (user extension: the capability outcall)

Two handler classes realize a leaf, same obligations, different depth:
- PIPELINE HANDLERS (standard, substrate-shipped): realize the
  CONSTRUCTED F_P/F_D interior — manifest render → transport → payload
  admission (or plan execution). The substrate composes the interior;
  the handler runs its steps.
- CAPABILITY HANDLERS (complete replacement): ONE plugin replaces the
  entire constructed interior — a complete outcall into a local
  downstream capability (installed product, local service, library,
  in-proc engine). No manifest, no agent transport; the capability IS
  the worker. The C call's category position is unchanged: spine,
  selection (the capability declares its regime), judgment, budgets,
  evidence (capability invocation refs) — O1–O8 hold in full, O3
  especially (the outcall's effects must be evidenced, not asserted).

This completes the BOUNDARY SPECTRUM per call, cheapest to deepest:
inline instruction category (-015) < reified stage (-014) < capability
outcall (opaque leaf, this class) < workflow.C sub-traversal
(transparent, -013). Products place each obligation at the depth its
trust and cost deserve — all four rungs declared data.

## Handler obligations (P0 requirements family, O1–O8)

O1 ARM FIDELITY: realize exactly the census-bound arm; nothing else.
O2 INTERIORS ONLY: return interior results; never mint spine or truth
   (enforced: engine-owned spine, kind-restricted sink).
O3 EVIDENCE HONESTY: outcome status and evidence refs correspond to
   real effects — archives ≡ refs, audited by -012 per configuration.
O4 TOOL EMERGENCE: tool knowledge stays inside declared handler config
   (T-030 boundary law holds AT the handler).
O5 DECLARED CONFIG ONLY: parameters come from admitted declarations
   (transport contract, env ingress, plans); no ambient authority.
O6 TYPED FAILURE: a throw IS a contract_failure blocked outcome
   (P4 executor guards make breach lawful truth).
O7 IDEMPOTENT EVIDENCE: archives keyed by cCallRef; resume-safe.
O8 BUDGET RESPECT: timeout/attempt envelopes from the selected
   configuration's ladder; overrun is a typed judgment, never a hang.

## Boundary vs T-200

T-200 closes on delegation + erase + gate (envelope law realized).
T-205 consumes that seam: catalog/selection interpretation and the
standard plugin ride the SAME resolveCCall integration point — one
seam, two tickets, T-200's oracle-equality proof first.

## Adaptive selection (-017, in scope)

The catalog is not statically bound: edge-classes declare selection
LADDERS (ordered configs + predicates over replay signals); the router
escalates the program on retry (compression descent) and toward F_H on
repeated failure. P0 realizes programRef on c_call_fibre_selected
(carrier + closed keys + all emission sites + differentials) so every
call records its governing configuration; ladder interpretation lands
with step-2 integration; per-configuration -012 cost reporting feeds
the offline tuner (§13.1 boundary holds).

## B1 review surface (handler law before code)

Authority now lives in `REQ-R-ABG3-HANDLERS-001/-014`:

- `-001/-002` O1/O2: arm fidelity and interiors-only.
- `-003` O3: evidence honesty.
- `-004/-005` O4/O5: tool emergence and declared configuration only.
- `-006/-008` O6/O8: typed failure and budget respect.
- `-007` O7: idempotent evidence.
- `-009/-010` pipeline and capability handler classes.
- `-011/-014` the interpretation family: one seam, fail-closed
  interpretation, ladder semantics, and resume semantics.

B1 cannot proceed to code while any of these review checks fail:

1. The handler law does not introduce a second compute ontology beside
   the C-call envelope.
2. The handler law does not let downstream product code implement the
   standard worker loop.
3. Pipeline and capability handlers are separated without changing the
   C-call spine, selection row, judgment vocabulary, or audit equality.
4. Handler output remains candidate interior material until ABG admits
   it.
5. Evidence honesty is replay-auditable; no handler can assert effects
   without evidence refs.
6. Hidden configuration from ambient process state, shell defaults,
   local path scans, or product prompt assembly is non-closure.
7. Failure, timeout, overrun, malformed output, and missing evidence
   become typed outcomes under the judgment router, not host exceptions
   or product controller state.
8. Resume is keyed by cCallRef plus handler binding identity, with
   digest mismatch and duplicate archive claims failing closed.
9. The interpretation family is one ABG-owned runtime family; standard
   path products declare data only.

## Plan sketch (P0 ratify before realization)

B1 ratifies and reviews handler-law requirements before realization.
P1 standard transform interior. P2 standard evaluate interior
(latitude/golden consumed). P3 deterministic interiors
(materialize/execute from declarations). P4 odd_glc adoption: binding
→ declarations; campaign reruns as the proof. Gödel checkpoints per
phase; codex review at B1/P0.

## Proof commands

```sh
rg -n "Arm fidelity|Interiors only|Evidence honesty|Tool emergence|Declared config only|Typed failure|Idempotent evidence|Budget respect|Pipeline handlers|Capability handlers|One seam|Fail-closed interpretation|Ladder semantics|Resume semantics" specification/requirements/abg/REQ-R-ABG3-HANDLERS.md
rg -n "REQ-R-ABG3-HANDLERS-001/-014|B1 review surface|standard worker loop|product prompt assembly" .ai-workspace/tickets/active/T-205-hog-iteration-2-standard-worker-plugin-lift.md
git diff --check
```

## Absorbed (board consolidation, user 2026-07-06)
- T-199 per-vector temporal formulas — subsumed by -017 ladder
  predicates (per-edge-class declared conditions).
- T-202 product-grade drift witness loader — rides this wave's gate
  infra.
- T-203b legacy sunsets (trace dual-write, branch_lease producer,
  FP-review ratification) — erase-adjacent, this wave.

## Proof commands (codex MEDIUM actioned)
```bash
cd build_tenants/abiogenesis/typescript
npm run test:t205        # all T-205 behavioral differentials (t200 + t192 lanes)
npm run test:semantic    # full suite
```
B2 status: interpretation seam LIVE (resolution at run entry, typed
fail-closed truth per codex HIGH: runtime_failure_observed +
gap_stop(hog_program_unresolvable), zero spine rows, no host
exception); declared program identity proven flowing into real replay.

## B3 status (current)
Contract + F_D handlers (strict-F_D/totality law) DONE. Interpreter
plumbing DONE: c_call_handler_execute through the effect protocol;
registry admitted AT ENTRY (admitHandlerRegistry with field validation
— codex probe pinned as differential); executability gate
binding-complete (program×stage×arm + regime match + registered
handler). REMAINING: the execution anchor (extra stages running
spine-enclosed), F_P agent-transport + F_H gate handlers, B4, B5.

## Absorbed-stub ruling (board audit 2026-07-06)
Neither absorbed stub BLOCKS functional-complete 4.5 (the clean run):
- T-202 (witness loader leaves the test lane): B6 cut QUALITY item;
  acceptable to ship rc with gate-lane witnesses as 4.4.0-rc.1 did;
  schedule with the post-run cleanup.
- T-203b (timeout dual-write sunset; branch_lease producer-or-replay;
  FP-review wired-or-ratified): erase work, post-clean-run.
T-199 repointed to T-206 (its merge note overclaimed: ladders are
attempt-based selection, not per-vector property formulas).

## B5 EARNED MAP + 4.5.0-rc.1 READINESS (2026-07-07)
The internal-everything gate items and where each earned:
- declared catalog override: LIVE LANE (t194 sandbox, real gpt-5.5
  worker) — per-configuration {gtl://sandbox/hog/lean: 6}, declared
  arms on all rows, session parity 2==2, converged, releaseGrade
  sourceClean=true classification on the run artifact;
- ladder escalation: engine battery (compression descent across
  resume, governing-attempt coherence);
- resume: engine battery (frontier holds, fresh window, -004
  replay-global attempts);
- consequence re-entry: engine battery (t152-lane: upstream landing,
  monotone spines through the loop);
- handlers end-to-end: engine battery (keystone 4-stage + triad
  6-stage, all three fibres); binding DECLARATION surface live
  (bindings/configs as GTL, registry admitted at entry);
- -012 per configuration: live-lane audit row.
READINESS: version 4.5.0-rc.1, note single-current, docs swept
(witness-driven), battery 1129/1129 + t205 13/13 + t188 32/32.
AWAITING: user code review + test-results review; then B6 cut
(snapshot:release + tarball + toolchain manifest) and T-205 closure.

## codex rc.1 round CLOSED + final-candidate gate (2026-07-07)
P1-a raw-field binding admission (no coercion, closed keys, probes
pinned) + P1-b closed-key program/stage admission (explicit no-spread
build; syntax layer uniform) — both fixed same-pass. Scenario-coverage
matrix posted (4 in-review gaps closed incl. declared-bindings e2e +
async driver law; 4 named gaps with phase owners). FINAL-CANDIDATE
GATE at HEAD: sourceClean=true, releaseGrade=true, installed package
4.5.0-rc.1, converged, per-config {gtl://sandbox/hog/lean: 6} — the
evidence-scope caveat is retired. Suite 1134/1134, t205 18/18.
B6 cut remains the only pending act.
