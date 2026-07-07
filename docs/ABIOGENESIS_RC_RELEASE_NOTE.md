# abiogenesis 4.5.0-rc.6 Release Candidate Note

This checkpoint is the sixth `4.5.0` release candidate. It follows
`4.5.0-rc.5` and carries the carry-through applicability remediation —
the information-loss defect that paused the B6 cut — through three
review rounds to a reviewed, differentially pinned close:

- CARRY-THROUGH APPLICABILITY (REQ-R-ABG3-REQUIREMENT-PROOF-
  CARRY-THROUGH-002/-005/-010/-013/-037/-038): "coverage required but
  missing" is no longer collapsed into "coverage not required". At edge
  close, every requirement owed coverage by an admitted startup contract
  with no admitted coverage truth receives a synthesized residual
  coverage projection through the existing projector and truth-ref
  grammar; the fold preserves no-close. Undeclared requirements retain
  the `-038` transitional path unchanged. Predicate scope is pinned:
  `entry.edge` scopes production, `entry.requirementIds` scope
  obligation — carry-through pressure crosses edges by design.
- DEEP STARTUP ADMISSION (F_D totality law): the carry-through startup
  family is admitted once at engine entry by reconstructing each entry
  through the existing carrier constructors, with a probe-validated
  envelope template; consumers accept only the admitted carrier type.
  Null startup, kind-tag-only carriers, tampered classification-table
  digests, and lone-surrogate identifiers are typed entry rejections
  (`gap_stop`, closed issueKind vocabulary), never host exceptions.
- COMPRESSION WAVE (principles review, 11 confirmed findings applied or
  escrowed): one fail-closed startup realization and one requirement-
  route close bundle in the runner; one owed-obligation derivation
  feeding produced and synthesized coverage; scheme-conformant
  synthesized refs; export surface reduced to the consumed functions.
  Cross-boundary commonization is escrowed to T-208.

The rc.5 content follows.

# abiogenesis 4.5.0-rc.5 Release Candidate Note

This checkpoint is the fifth `4.5.0` release candidate. It follows
`4.5.0-rc.4` and carries the live replay-log append remediation required
before downstream sandbox observation continues:

- LIVE REPLAY-LOG APPEND (REQ-R-ABG3-EVENTS-024): installed/public
  runtime event emission now appends the canonical event to
  `.ai-workspace/events/events.jsonl` as part of event-sink acceptance,
  before the next effectful runtime step. Terminal-only batch flush is
  no longer a lawful realization for replay event truth.
- SINGLE EVENT-TRUTH SINK: `genesis-ts start` and `assess-result` share
  the ABG-owned event-log-backed runtime sink. Product transcripts,
  PTY/process traces, and archives remain evidence interiors; they do
  not replace the replay log.
- INSTALLED CLI DIFFERENTIAL: the M04 CLI integration proof now reads the
  workspace replay log during F_P dispatch and requires already-emitted
  ABG events to be visible before the plugin emits its own probe.

The rc.4 content follows.

# abiogenesis 4.5.0-rc.4 Release Candidate Note

This checkpoint is the fourth `4.5.0` release candidate. It follows
`4.5.0-rc.3` and carries the post-rc.3 run-19 campaign fixes required
before the next citable data-mapper run:

- INSPECT-GATE NARROWING (campaign F4): archive-inspection exceptions
  stay limited to the typed pre-spawn dispatch-failure lane rather than
  weakening unrelated failure handling.
- CONSEQUENCE-THROW GUARD (campaign F5): consequence-plugin throws are
  converted to typed blocked projection truth on both sync and async
  drivers; routing plugins do not escape as host failures.
- TYPED CLOSURE FAILURE CLASS (campaign F6): invocation closure class is
  derived once at the construction boundary and consumed as typed retry
  truth; prose parsing is fallback only.
- BATCH-SAFE ATTEMPT IDENTITY (campaign F7): invocation attempt identity
  is replay-global by maximum prior attempt index, so composed-batch and
  resume paths do not collide or orphan closure truth.

The rc.3 content follows.

# abiogenesis 4.5.0-rc.3 Release Candidate Note

This checkpoint is the third `4.5.0` release candidate. It follows
`4.5.0-rc.2` and carries the remaining run-18 campaign fixes — the
substrate that carried the FIRST COMPLETE data-mapper run (26/26
vectors converged by replay; 8 Scala modules built from specification;
24/24 subject tests green):

- INVOCATION ATTEMPT IDENTITY IS REPLAY-GLOBAL (campaign #16, the -004
  law at the invocation layer): a resumed fresh window continues
  numbering instead of colliding invocation ids (collision orphaned the
  new closure detail and dead-ended the retry lane); the projection
  close-merge targets the last unclosed matching row.
- NULL-BASIS OBSERVABILITY TOLERATED (campaign #17): a
  runtime_failure_observed with basisId null (P0-4 CLI-error-as-event)
  no longer poisons projection over a shared workspace log.

The rc.2 content follows.

This checkpoint was the second `4.5.0` release candidate. It follows
`4.5.0-rc.1` and carries the run-18 campaign fix on top of it:

- PRE-SPAWN DISPATCH FAILURES RETRY (campaign #13): invocation closure
  truth (closureStatus/detail) lands on the projection row; trio-marked
  closures with no spawned process classify as their retryable class;
  BOTH archive-inspection gates except retryable classes — a typed
  dispatch conversion re-enters the retry lane instead of dead-ending
  in missing_process_evidence; compression descent now occurs WITHIN a
  run (differential: lean@1 -> deep@2 in one start).

The rc.1 content follows.

This checkpoint was the first `4.5.0` release candidate. It follows
`4.4.0-rc.1` and publishes the BASELINE STATIC HoG solution on graph
overlays: all system-level functions higher-order dynamic functions
need, with programs, catalogs, ladders, and handler bindings as typed
GTL declarations (REQ-R-ABG3-CCALL-001..-017, REQ-R-ABG3-HANDLERS-001..
-016, design §1–§18.1):

- PROGRAM INTERPRETATION at one seam: declared program / labelled
  catalog / attempt-laddered selection resolve per graph function
  (ladder outranks static selection; the bootstrap triple is a TYPED
  CATALOG CITIZEN under a reserved, unshadowable ref); unresolvable or
  unexecutable declarations are typed truth at run entry
  (runtime_failure_observed + gap_stop), never host exceptions;
- THE MULTI-STAGE MONAD EXECUTES: declared extra stages run
  spine-enclosed at two anchors (post-transform, post-evaluate) through
  census-bound effect handlers; position law fails misplaced stages
  closed; a blocked stage stops the run lawfully; an F_H stage
  escalates with its own terminal truth;
- HANDLERS: binding tuples are DECLARED data (abg.hog_handler_bindings
  / _configs); the registry is admitted at entry (field-validated,
  binding-complete executability); implementations arrive by ref —
  standard set shipped (F_D process-execution via the traced-process
  surface with archive evidence, F_D materialization with write-root
  confinement, F_H gate that can never approve on a human's behalf,
  F_P agent-transport mapping worker dispositions, never inventing
  them); handler throws become typed blocked interiors on both drivers;
- STRICT F_D LAW: totality (an FSM over a total function, or vice
  versa — a program) with mechanical outcome vocabulary
  (executed/blocked); semantic consumption of deterministic
  observations is F_P's judgment;
- ITERATION HEIGHTS: retry (attempt ladders as compression descent,
  proven across the resume boundary with governing-attempt coherence),
  resume (re-entry over persisted replay: closed C calls stay closed,
  fresh attempt window is engine law, attempt identity replay-global),
  re-enter (consequence-routed upstream landing with fresh monotone
  spines through the loop);
- -012 audit rows live in the standing gate; the internal sandbox lane
  declares its compute (catalog + ladder as GTL) and the live run is
  governed by the declared attempt-1 rung with per-configuration audit.

Realization state: the FpTransportConfig.prompt field is a named
transitional violation of the config boundary (HANDLERS-015) pending
prompt re-homing to instruction categories; the CCALL Realization
State clause remains narrowed to T-205-owned interpretation items.
