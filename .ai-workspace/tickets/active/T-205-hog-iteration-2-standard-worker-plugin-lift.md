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
