# Full GTL/ABG Product Review @ 4.2.0-rc.10

Commentary, not law. Five-dimension review (duplicate surfaces, fail-open
perimeter, dead code/debt, seam/authority architecture, requirement
traceability), each dimension executed as an independent read-only pass
over `code/src` + `specification/` + tickets, findings verified at
file:line before reporting. Trigger: user pause of the T-030 data-mapper
campaign to assess product completeness.

## Verdict

The product core is real: all four constitutional claims verify with code
evidence (one emit choke point on the main machine, one passthrough
authority at every public seam, census-is-the-bind-path fully sound,
plugin outcomes admitted at the engine seam); the inner contracts layer is
genuinely fail-closed; there is effectively zero dead code across 231
files and 2,385 exports. **It is not tap-ready.** Two lanes escape the
constitution entirely (P0-1, P0-3), three plugin defaults fabricate
success (P0-2), the CLI perimeter loses both stacks and already-emitted
truth (P0-4), digest drift has already landed in truth (P0-5), and the
entire successor ledger exists only in closed-ticket prose against an
empty active board (P1-8). The distance to a tapped 4.2.0 is roughly: one
lane-closure wave + one perimeter-hardening wave + one seam-consolidation
pass + a ticketing/release-note repair — all small, none optional.

## P0 — constitutional breaches (block the tap)

1. **Construction/consequence lane escapes both authorities.**
   `engine_runner.ts:3950` appends `terminal_reached(gap_stop)` via raw
   `appendEngineRunnerEvents` (bypasses the temporal choke point — a run
   can terminate with NO verdict batch, violating
   REQ-L-GTL3-TEMPORAL-PROPERTIES-006/-008);
   `construction_runner.ts:651-673,723-745` (request at
   `engine_runner.ts:4612-4635`) hand-forwards 2 of 5 passthrough fields
   under renamed keys and silently drops `temporalPropertyStartup`,
   `requirementProofCarryThroughStartup`,
   `requirementRouteDeclarationBundle` — consequence sub-runs execute with
   no temporal law and no carry-through; `engine_runner.ts:4650-4653`
   returns the inner terminal unjudged by any property set. The T-188
   forwarding-defect class, recurring. Fix: `ConstructionIntentRunnerRequest
   extends EngineStartPassthroughFields` + spread `engineStartPassthrough()`
   at both points; route the terminal through `emitRunnerEvents`.
2. **Three of five plugin defaults fabricate success.**
   `plugins.ts:2490` (`defaultFpDispatchPlugin` mints `status:"dispatched"`
   + synthetic resultRef; maps to task `accepted` at
   `engine_runner.ts:2248`), `plugins.ts:2435` (`defaultFdEvaluatorPlugin`
   unconditional accept — vacuous mechanical gate), `plugins.ts:2513`
   (fabricated consequence projection). `fpEvaluator`'s default
   (`plugins.ts:2478`) is the correct fail-closed counterexample one line
   away. Fix: all defaults return `blocked`.
3. **The CLI hands the raw event sink to workspace plugin factories.**
   `cli/command.ts:1240-1246,1557-1575`; transport plugins emit directly
   (`process_actor.ts:284,308,387,413`). Kind-unrestricted: a binding
   plugin can mint `assessed`/payload/terminal events verbatim into
   `events.jsonl`, outside outcome admission and the choke point. The
   contract inventory already declares `sink_receive_only`
   (`plugins.ts:157,2056-2061`) — unenforced. Fix: allowlist-wrapped sink.
4. **CLI perimeter loses truth on failure.** `cli/command.ts:1987` single
   catch: stack discarded, cause discarded, no runtime-failure event; and
   `runStartCommand` buffers emitted events until success
   (`cli/command.ts:1583`) so a mid-run throw drops every event lawfully
   emitted before it — root cause of the empty `events.jsonl` in every
   crashed T-030 campaign run. Fix: append-in-finally + typed
   runtime-failure event + stack/cause to stderr. (Matches the user's
   events-over-crash-log adjudication, 2026-07-06.)
5. **Digest drift has landed.** `composed_stage_set.ts:488,511` and
   `engine_runner.ts:3622-3626` double-prefix already-prefixed digests —
   `sha256:sha256:<hex>` malformed in `ComposedStageSetPlan.planDigest`
   and executive `targetWorkspaceDigest` today. Fix: only
   `shared/runtime_identity` mints the prefix.
6. **Retry law has two value homes.** `workspace_zoom_foldback.ts:57-62`
   vs `saga_frontier.ts:91-95` — identical `{transport_failure, no_output,
   contract_failure}` with no tie; consumers split by home (slice/traversal
   vs branch arms). CLAUDE.md §7.16 names ONE allowlist. Fix: single
   exported allowlist beside `RUNTIME_FAILURE_CLASS_VALUES`; branch default
   derives.

## P1 — product-cut blockers (honesty/integrity)

7. **Release note misdescribes its own cut.** `docs/ABIOGENESIS_RC_RELEASE_NOTE.md:3-4`
   "tenth… follows `4.2.0-rc.10`" (self-reference); stated delta is rc.9's
   (excerpt render bound + codex model) while rc.10's actual change (fact-
   construction cap, `5102a54`) appears nowhere; body still narrates "RC8
   preserves…". T-193's version-line-drift class in a window its witness
   does not cover. Fix now + successor: release-note delta witnessing.
8. **All eight named successors are unticketed; active board empty.**
   Carry-through witness migration (-038 names it in live law),
   ProofStrengthAdmission carrier (-035 interim at `payload_ledger.ts:1296`),
   frame-identity fold scoping, per-vector temporal formulas, composed-arm
   dispatch gating (confirmed genuinely ungated — no `fp_dispatch_requested`
   antecedent on composed paths, `engine_runner.ts:6012,6506,7338,8046`),
   closure-point verdict consumption, product-grade drift witness loader,
   CLI-error-as-event (unnamed in ABI anywhere — worse than unticketed).
   Fix: ticket wave.
9. **Digest trust without verification.** `instruction_assembly.ts:935,1031`,
   `requirement_proof_carry_through.ts:336,826` — caller-supplied digests
   accepted unverified into truth carriers. Fix: recompute-and-reject.
10. **Replay/ledger intake soft spots.** `cli/command.ts:837` catch→`[]`
    (corrupted ledger reads as genesis; ENOENT-discriminating pattern
    exists at :800); `cli/command.ts:850` rows cast not admitted (three
    consumers pre-admission incl. ordinal seeding — `emit.ts:32-43`
    silently skips invalid ordinals → reuse); `emit.ts:59-64` pre-stamped
    envelopes bypass ordinal minting unchecked.
11. **Governed enums re-laddered.** `cli/command.ts:416-444` (three inline
    parsers) + `event_admission.ts:642-643` (schema oneOf hand-lists) vs
    the declared one-home `shared/validation/governed_enums.ts`. Extend
    `UNTIL_VALUES` → CLI rejects what m03/m04 accept.
12. **Cast-minted carriers.** `temporal_property_gates.ts:40` standing-gate
    Rule minted `as unknown as Rule` (bypasses rule constructor — the
    strongest carrier violation); `temporal_properties.ts:607` unstamped
    eventId fallback (promote eventId to the carrier);
    `cli/command.ts:965-1075` five ingress casts in `coerceRuntimeBinding`
    (route through real admission — same seam as P0-3).

## P2 — before the tap (lower risk, cluster into one seam pass)

- Truncation transform two homes (`engine_runner.ts:895-898` vs
  `instruction_assembly.ts:673-681` — render re-truncates fact excerpts,
  stamps wrong lengths); target-carrier payload identity minted in two
  runners (`attached_fp_worker.ts:250-291` vs `engine_runner.ts:2950-2962`);
  envelope presence predicate copied (`emit.ts:50-57` vs
  `event_admission.ts:159-166`); `stableJson` forks (m04 gaps
  `localeCompare` + keeps undefined — env-sensitive digests; m05 pretty
  clones); failure classification ladders disagree on stalls
  (`agent_transport.ts:215-241` vs `traversal_non_progress.ts:219-235`);
  transport re-mints frame/graph-call fallback IDs
  (`transport/constructors.ts:36-37`); public terminal-kind subset spelled
  4+ places; transport failure trio re-spelled without tie; admission
  error message hand-lists 4 of 7 classes (`transport/admission.ts:71`).
- Assurance absence non-blocking (`assurance_gate.ts:318-327`) — needs
  declared opt-out or startup admission.
- Evaluation-rule/transform coverage vacuous when both sets omitted
  (`engine_runner.ts:460-470`).
- Debt tickets: legacy trace dual-write sunset
  (`traced_process/index.ts:855-1602`); `branch_lease_superseded` admitted
  but never produced (`saga_frontier.ts:1587`); FP-review capability wired
  or ratified proof-only (`gtl_program_conformance.ts:2551`); ticket-stamped
  names in live constants (T153 feature kinds, t192 tags);
  TEMPORAL-PROPERTIES.md missing Status header; dangling test citation
  (`test_t138…:3` cites FP-CONSCIOUSNESS-011 vs declared FPC-011); PRODUCT.md
  temporal rider mildly exceeds proof (blanket "online safety gating" vs
  scalar-arm-only); m04 deep type-imports bypass the m03 index seam; 14 GB
  git-ignored toolchain extracts under test_runs/.
- Traceability depth: 843/941 IDs (89.6%) uncited at ID level; 108/231
  files uncited at family level; four ACTIVE families zero-presence
  (MAPPING, PROVENANCE, JOB-WORKER, SELECTION-APPLICATION).

## Verified sound (for calibration)

Census-as-bind-path end to end; passthrough authority at all public seams;
emit choke point on the main machine; registry zero/multi-match fail-closed;
regime/hook duplicate rejection; plan compile rejects on any issue;
excerpt-bound plan policy with range admission; T-188/T-192/T-193 closure
records name their residuals honestly; release note correctly scope-narrows
carry-through per -038; zero dead exports.
