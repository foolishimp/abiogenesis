---
id: T-205
title: HoG iteration 2 — the standard worker plugin lifts into the substrate
status: active
class: design_reframe
opened: 2026-07-06
depends: T-200 strangler step 2 (program/catalog interpretation) — same seam, arrives together
requirements: REQ-R-ABG3-CCALL-014/-015/-016 (consumed); new family to ratify at P0
acceptance: a product on the standard F_P path ships ZERO plugin code —
  declarations only (catalog + selections + response contracts +
  materialization specs + calibration); the odd_glc data-mapper runs on
  the substrate's standard worker plugin with its binding reduced to
  declarations; -012 audit green on the result.
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

## Plan sketch (P0 ratify before realization)

P0 requirements family (worker-plugin law: what is mechanics vs domain;
fail-closed declaration admission; no tool names — T-030 boundary law
holds at the substrate too). P1 standard transform interior. P2
standard evaluate interior (latitude/golden consumed). P3 deterministic
interiors (materialize/execute from declarations). P4 odd_glc adoption:
binding → declarations; campaign reruns as the proof. Gödel checkpoints
per phase; codex review at P0.

## Absorbed (board consolidation, user 2026-07-06)
- T-199 per-vector temporal formulas — subsumed by -017 ladder
  predicates (per-edge-class declared conditions).
- T-202 product-grade drift witness loader — rides this wave's gate
  infra.
- T-203b legacy sunsets (trace dual-write, branch_lease producer,
  FP-review ratification) — erase-adjacent, this wave.
