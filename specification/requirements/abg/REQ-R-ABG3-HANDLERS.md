# REQ-R-ABG3-HANDLERS — Effect Handlers And Program Interpretation

**Status**: Active (T-205 P0; codex review requested before realization)
**Realizes**: T-205 (design: ABG_3_UNIFORM_C_CALL_ENVELOPE_DESIGN §8.1/§15–§17; T-205 factoring + handler classes)
**Derives from**: REQ-R-ABG3-CCALL-001..-017; T-030 emergence boundary law; T-195 C3/C4 adjudications.

ONTOLOGY: C is compute. A plugin factors into its CATEGORY (the
declared shape of compute — programs, catalogs, ladders, contracts:
GTL data) and its FUNCTOR (the effect handler realizing compute in the
world). This family governs the functor. A handler binding is admitted
configuration data: `{programRef, stageRole, armId, regime, handlerRef,
handlerClass, handlerConfigRef}`. A product may declare the category and
handler configuration; it does not implement a standard-path worker loop.

## Handler obligations

- **-001 Arm fidelity.** A handler realizes exactly the census-bound
  arm it is registered for; the (stageRole × regime × armId) census is
  asserted at the one interpretation seam.
- **-002 Interiors only.** Handlers return interior results and never
  mint spine or truth events. Spine construction has ONE authority
  (the C-call spine interpretation seam); handler-reachable sinks are
  kind-restricted to the transport envelope.
- **-003 Evidence honesty.** Outcome status and evidence refs
  correspond to real effects: external sessions reconcile against
  interior refs under the -012 audit, per configuration. Asserted-but-
  unevidenced effects are drift.
- **-004 Tool emergence.** Tool knowledge (commands, models, paths)
  enters only through the handler's DECLARED config (transport
  contracts, plans, env ingress). No tool name in handler code.
- **-005 Declared config only.** Handler parameters come from admitted
  declarations; ambient authority (globals, undeclared env, filesystem
  discovery) is a defect.
- **-006 Typed failure.** A handler throw IS a blocked outcome carrying
  the contract_failure class at both executor twins; the spine closes;
  the retry allowlist judges it. No handler error may kill a run.
- **-007 Idempotent evidence.** Evidence archives key on cCallRef;
  re-execution after resume must not duplicate or orphan evidence.
- **-008 Budget respect.** Handlers receive and honor the selected
  configuration's timeout/attempt envelope; overrun is a typed
  judgment, never a hang.

## Handler classes

- **-009 Pipeline handlers** (substrate-shipped standard set): realize
  the constructed interior — F_P agent-transport (manifest → transport
  → payload admission), F_D process-execution, F_D materialization,
  F_H gate. Products configure them by declarations only; the standard
  path ships zero downstream handler code.
  TOTALITY LAW (user, the formal criterion): F_D is lawful ONLY as a
  finite state machine over a TOTAL function — or, vice versa, a total
  function over a finite state machine: a program either way. BOTH
  properties must hold, composed in either direction: finite structure
  AND totality — defined output for every input, finite states,
  guaranteed termination. Drop either property and it is not F_D. Predicates that are partial over MEANING (semantic
  quality, intent satisfaction, "did the work succeed") have an open
  domain; executing them deterministically does not close it — they
  are F_P by nature. This is why executed/blocked is lawful F_D
  vocabulary (total: every process outcome maps to exactly one) and
  accepted/rejected over work quality is not (partial: presumes a
  semantic domain). F_P exists precisely because such functions are
  not total — they are distributions requiring sampling under
  judgment.
  STRICT F_D RIDER (user law): F_D handler outcomes are MECHANICAL
  vocabulary only (executed / blocked / envelope facts: existence,
  write-root, digest, identity). An F_D handler never pronounces
  accepted/rejected on the work: semantic consumption of deterministic
  observations (exit codes, test counts, artifact contents) is the F_P
  stage's judgment, informed by F_D evidence. Determinism never
  reclassifies a semantic check as F_D; a generic F_D traversal or
  evaluation handler is behavioral F_D (the recurring bug class
  B-003/013/014/016/017) and is non-closing.
- **-010 Capability handlers** (complete replacement): ONE handler is
  the entire interior — a declared outcall into a local downstream
  capability which itself declares its regime. All obligations hold;
  -003 especially: outcall effects are evidenced, never asserted.

## Program interpretation (the one seam)

- **-011 One seam.** Programs, catalogs, selections, and -017 ladders
  are consumed at exactly ONE interpretation point; the census derives
  from the admitted program; the baked bootstrap triple is the
  undeclared default. No second consumption path. Product-local prompt
  shells, handler scanners, file loaders, registries, and effect routers
  are not lawful interpretation seams for the standard path.
- **-012 Fail-closed interpretation.** An admitted-but-unresolvable
  selection (unknown programRef, unknown arm, missing handler binding)
  blocks the C call with a typed reason before any interior runs.
- **-013 Ladder semantics.** Attempt N's configuration is the ladder's
  declared rung for the observed signals; the selection row records the
  governing programRef (CCALL-017); escalation never skips declared
  rungs.
- **-014 Resume semantics.** Re-entry over persisted replay continues
  from the frontier (closed C calls stay closed) and OPENS A FRESH
  ATTEMPT WINDOW after gap_stop(retry_budget_exhausted) — engine law,
  differentially pinned (t192 lane, T-205 B-prep). The ratified-resume
  policy therefore governs WHO may resume (an F_H act on a stopped
  run), not budget mechanics; replay-derived frontier state is never
  hand-edited.

- **-015 Config boundary (user law 2026-07-07).** Handler config
  carries SYSTEM-LEVEL and ENVIRONMENTAL bindings ONLY: commands,
  paths, env, timeouts, archive roots — the io/deployment surface.
  All other configuration is GTL: domain content, workflow shape,
  prompts, contracts, and policies live as typed declarations that
  support systems consume.
  Gap: `FpTransportConfig.prompt` violates this boundary — a prompt
  living in handler config instead of GTL. Owner: T-244 routing;
  implementation requires a singular realization leaf.
  Non-closure condition: the gap stays open until that leaf re-homes
  prompts to GTL (instruction categories via the stage's
  instructionCategoryRefs and the section machinery) when extra F_P
  stages bind to the manifest pipeline.
- **-016 The default is a catalog citizen (user law 2026-07-07).** The
  substrate's default program (the bootstrap triple) is a TYPED,
  LABELLED entry in the effective catalog under a reserved ref, marked
  default — never an invisible code fallback. Higher-order functions
  choose against the FULL catalog including the default; declared
  entries cannot shadow the reserved ref (fail-closed).

## Non-closure

Weakened tests; a handler minting truth; a tool name in handler code;
unevidenced outcall effects; a second interpretation seam; product-local
standard-path worker loops; hidden handler configuration from ambient
scans or shells; a handler throw killing a run; duplicated evidence
after resume; glc adoption before the ABG-internal everything-gate is
green.
