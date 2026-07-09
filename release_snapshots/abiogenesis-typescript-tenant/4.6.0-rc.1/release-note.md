# abiogenesis 4.5.1 — Foundation Release, mutation-soundness patch

It follows `4.5.0` and is the release-grade Foundation cut: 4.5.0's
adversarial-verification claim rested on an unsound kill mint (a hostile
kernel review found it post-cut). This patch (T-216) makes the
adversarial guarantee mechanically sound. 4.5.0 is superseded for
downstream consumption.

- D1 (CRITICAL): mutation kill evidence is attributed PER TEST, not per
  suite exit. A row carries mutantCompiled (a compile-broken mutant
  refuted nothing -> mints nothing) and failedTestIdentityRefs (the
  tests that ACTUALLY went red, verified against the mutant run's
  report). The kernel mints a kill only for named failures; the -039
  obligation cross-check requires the failed identities to cover the
  map row's required identities. One lazy or compile-broken row can no
  longer discharge the kill topology, and an internal-consistency law
  rejects contradictory rows.
- D2: the last admitted event per EDGE is the sole authority for depth
  maps and mutation outcomes; a superseding retry that omits the
  section emits an empty retraction — stale cross-attempt evidence
  cannot persist.
- D3: report verification is element-scoped (counts testcase elements)
  — CDATA/comment/aggregate-wrapper text can no longer inflate the pass
  count toward false-green.
- D4: execution-family refs are rejected from proof-strength
  resolution.
- D5: admission is read-once (detach to a plain snapshot; validate the
  snapshot) — value-changing/second-read getters cannot escape.
- D6: carrier canonicalization is deterministic (full-content,
  sorted-keys, codepoint order) — locale-free, ambiguity-free digests.
- D7: socket-needing live scenarios assert an explicit sandbox
  capability (reproducible by construction).

Release-grade proving: the frozen-law cold run re-executes on THIS
artifact (4.5.0's proving-run kill evidence is retired by D1). The
release record is completed by that run.

Remainder: the report-verification MECHANISM still lives in the odd_glc
binding (three-layer violation, correctness fixed in place); its
eviction into a kernel surface is T-209's remaining scope.

# abiogenesis 4.5.0 — THE FOUNDATION RELEASE

It follows `4.5.0-rc.17` and closes the 4.5.0 release-candidate line
(rc.1-rc.17) as the FOUNDATION RELEASE: typed F_P workers EXECUTE processes into typed
nodes on a declarations-only path, with earned depth, adversarial
verification, and admission-gated evidence provenance. The
consciousness tier (tuner, intent observer) is DEFERRED by design; its
plan is ratified in specification/GOALS.md (the Consciousness Wave).

## What this release claims — exactly what was proven

1. EXECUTION-DEFAULT LAW, REALIZED AND PROVEN LIVE. Execution belongs
   to typed F_P worker turns: workers run the subject toolchain inside
   their own turns and return typed execution results; the framework
   executes nothing. Proven by the T-032 data-mapper campaign: every
   subject execution (full sbt suites, repair cycles, 16 mutant
   apply-execute-restore loops) was a worker turn — audited
   independently, 74/74 worker invocations. Enforced mechanically:
   executionAuthority contract vocabulary (worker_turn default;
   annealed_fd_handler admissible only with a ratified equivalence
   ref), and standing signature-pinned conformance differentials in
   substrate and downstream.
2. EARNED DEPTH (-032/-033/-034/-039). Depth truth is DERIVED by the
   kernel from admitted intermediate assets — the worker-declared
   depth-proof map (admitted once at the artifact ingress, replay-total
   event admission) plus test identities corroborated as exact
   executed-report testcase names. Declaration equality is demoted at
   EVERY seam (admission and projection). Proof obligations are
   DISCOVERED from admitted map rows (the Goedel projection) —
   cardinality never enumerated. Proven live: 8/8 CDME requirement
   folds eligible under derived truth; 48-row map; hollow declarations
   fold residual by construction.
3. ADVERSARIAL VERIFICATION (-035/-036). Mutation-kill outcomes are
   admitted typed rows (restore-digest law: mismatch rejects); the
   KERNEL mints kill/survived evidence from admitted rows only — raw
   attached refs are dead; survived mutants are counterexamples that
   BLOCK closure. The full ProofStrengthAdmission carrier preserves the
   -035 field list with a closed disposition lattice; strength closes
   through F_D criteria or admitted adversarial verification, never
   list presence or self-report. Proven live: 16/16 mutants killed,
   zero survived.
4. EVIDENCE PROVENANCE. Execution-family evidence is closure-bearing
   only with declared worker-turn attribution (runner-scope dispatch
   truth, not spoofable provider lists); framework-assembled execution
   evidence is inadmissible by construction.
5. THE CONSTITUTIONAL BOOTSTRAP. The installer stamps the four boundary
   blocks (three-layer ownership, execution default, earned depth,
   evidence provenance), agent-addressed, into every installed
   workspace — gate zero, content-verified at install. The proving
   campaign ran under it: workers refused fabrication under
   contradictory law rather than comply (the truthful-halt property).
6. HONESTY OF THE LOWER LAYER (the load-bearing fact for the deferred
   consciousness tier): across the proving campaign the system NEVER
   false-closed — it halted honestly (truthful refusals, truthful red
   evidence, fail-closed terminals). Imperfect-and-honest is the
   substrate the higher-order regulator will be built on.

## Release-grade proving

The release-grade classification is earned by the frozen-law cold
proving run ON THIS ARTIFACT (fresh workspace, zero resumes, zero law
amendments): the builder converges the full data-mapper scenario
unaided. The run is recorded in the release record upon completion;
the release-grade claim is conditional on it.

## Known residuals (stated, not hidden)

- Restore digests are worker-reported at admission (kernel-witnessed
  workspace digests ride the T-209 remainder); the citable campaign
  audit spot-verified them against files.
- Replay-log authentication (forged canonical events by a log-writing
  actor) is the named T-195 refinement (T-211).
- Depth-class witness distinctness (one test may witness several
  classes) is a named tightening lever, as is declaring further
  adversarial classes.
- The valibot toolchain-payload installer defect persists (T-211);
  installs repair via the documented symlink.
- T-209's declarations-only adoption (worker-loop plumbing into the
  standard handler family) continues post-release.

# abiogenesis 4.5.0-rc.17 Release Candidate Note

This checkpoint is the seventeenth `4.5.0` release candidate. It follows
`4.5.0-rc.16` and carries one campaign-found kernel fix:

- DECLARATION-EQUALITY DEPTH LAW FULLY DEMOTED (T-032 campaign BUG #10):
  the carry-through envelope admission still required declared
  depthClassRefs to enumerate the contract's required classes — the old
  self-declaration law surviving at one seam. It rejected the lawful
  map-or-residual design (declared [] + admitted depth map = earned
  depth) before derivation could run, collapsing the campaign's first
  full earned-depth cycle (48-row admitted map, 16/16 mutants killed,
  zero survived) into owed-but-missing residuals. Envelope depth
  declarations are template data; depth closure is owned by the
  coverage projector's DERIVED truth (earned classes, typed gaps,
  discovered kill obligations). Mixed-law pin repriced.

Suites at cut: semantic 1174/1174, t188 67/67, t205 22/22.

# abiogenesis 4.5.0-rc.16 Release Candidate Note

This checkpoint is the sixteenth `4.5.0` release candidate. It follows
`4.5.0-rc.15` and carries one campaign-found fix:

- ABG_TS_CODEX_SANDBOX ENV INGRESS (odd_glc T-032 campaign BUG #6): the
  codex transport contract hardcoded --full-auto, whose sandbox denies
  ServerSocket binding — sbt's forked test transport and Spark's Netty
  failed BEFORE subject tests executed, and workers lawfully recorded
  truthful red they could not repair. The sandbox capability is an
  ENVIRONMENTAL BINDING of the install (the ABG_TS_CODEX_MODEL
  precedent, runtime truth rule 11): ABG_TS_CODEX_SANDBOX=<level>
  replaces --full-auto with --sandbox <level>; unset keeps the default.

Suites at cut: semantic 1174/1174.

# abiogenesis 4.5.0-rc.15 Release Candidate Note

This checkpoint is the fifteenth `4.5.0` release candidate. It follows
`4.5.0-rc.14` and carries T-032 Stage A: the mutation-outcome carrier
and the constitutionally compressed installer bootstrap.

- ADMITTED MUTATION OUTCOMES (T-032 Stage A): the worker's mutation
  campaign returns typed rows {requirementId, mutantIdentity,
  testIdentityRefs, suiteExit, baselineDigest, restoreDigest} in the
  attached result artifact; admission is total with a closed issue
  vocabulary; a restore-digest mismatch REJECTS the row (typed, never a
  downgrade); the mutation_outcomes_admitted event closes rows at
  canonical event admission (digest shape, surrogate, restore laws).
- KERNEL EVIDENCE MINT: mutation-kill:// (suite red + verified restore,
  per test identity) and mutant-survived:// (suite green ->
  counterexample, blocks) derive ONLY from accepted admitted rows. Raw
  worker-attached mutation-family refs are excluded from the
  provenance-scoped view — attaching them does nothing.
  RESIDUAL (stated): baseline/restore digests are worker-reported until
  the F_D materialization handler witnesses workspace digests.
- CONSTITUTIONAL BOOTSTRAP (T-212): the installer-injected
  AGENTS.md/CLAUDE.md context now carries the four boundary blocks,
  agent-addressed (three-layer ownership; execution default — the
  worker runs the toolchain in its turn, the framework never does;
  earned depth; evidence provenance), compression-reviewed with the
  removal list recorded on the ticket. The install lane CONTENT-verifies
  the blocks in the stamped files.

Suites at cut: semantic 1172/1172, t188 66/66, t205 22/22, installer
lane 6/6.

# abiogenesis 4.5.0-rc.14 Release Candidate Note

This checkpoint is the fourteenth `4.5.0` release candidate. It follows
`4.5.0-rc.13` immediately and carries one review-found fix to the
Phase 3 provenance gate:

- DECLARED-ATTRIBUTION WORKER-TURN GATE: rc.13's gate accepted any
  evidence_admitted event with non-empty providerRefs as worker-turn
  evidence — spoofable by a forged provider (harness://not-worker).
  The gate now requires attribution to match the DECLARED worker-turn
  set, composed entirely from runner scope: the fp_dispatch plugin
  contract the engine actually invoked plus the runner-minted
  invocation's worker identity. An empty declared set resolves nothing
  (fail-closed). The spoof probe is pinned as a differential. The
  rc.13 claim "framework-assembled execution evidence is inadmissible
  by construction" is reliable only from this cut.

Suites at cut: semantic 1171/1171, t188 65/65, t205 22/22.

# abiogenesis 4.5.0-rc.13 Release Candidate Note

This checkpoint is the thirteenth `4.5.0` release candidate. It follows
`4.5.0-rc.12` and opens the Foundation Phase 3 kernel surface: execution
authority becomes admission-gated law, realizing the 2026-07-09
governance-failure ruling (the sbt forensics — prose safeguards without
an admission chokepoint are advisory).

- EXECUTION-AUTHORITY VOCABULARY (T-209 b1): carry-through contracts
  carry a closed executionAuthority — worker_turn by default (the
  execution-default law as contract structure); annealed_fd_handler
  admits ONLY with a ratified equivalenceContractRef (the T-206
  annealing path); anything else is an admission error, never a silent
  downgrade.
- PROVENANCE-SCOPED EVIDENCE LEDGER (T-209 b2): execution-family
  evidence (mutation-kill://, mutant-survived://, test-identity://) is
  closure-bearing only when worker-turn attributed (plugin-attributed
  evidence_admitted); the payload_validated side door is closed for the
  family; unattributed evidence carries no provenance. Framework-
  assembled execution evidence is inadmissible BY CONSTRUCTION.
- STANDING KERNEL CONFORMANCE (T-209 b4, kernel half): a default-suite
  differential asserts the m03 contracts layer contains no
  process-execution capability — drift is a red test the day it
  happens. The downstream (odd_glc) red test lands with the Phase 4
  worker-loop deletion.

Escrowed by name: kernel-witnessed materialization digests (D1.4,
restore-digest proof) ride the Phase 4 mutation-outcome payload; the
odd_glc deletion set (D3) is the Phase 4 campaign's entry.

Suites at cut: semantic 1171/1171, t188 65/65, t205 22/22.

# abiogenesis 4.5.0-rc.12 Release Candidate Note

This checkpoint is the twelfth `4.5.0` release candidate. It follows
`4.5.0-rc.11` immediately and carries exactly one review-found fix:

- -036 LEDGER LAW INSIDE THE STRENGTH CARRIER: rc.11's
  ProofStrengthAdmission derivation marked `adversarially_verified`
  from list presence of verification refs — only the producer happened
  to pass ledger-resolved refs, so a direct caller could obtain
  closure-bearing strength from an unledgered `mutation-kill://` ref.
  Verification refs now resolve against the admitted evidence ledger
  inside the derivation itself (verifierRefs carry only admitted refs);
  the reviewer's probe is pinned as a differential. rc.11's recorded
  artifact is superseded for downstream consumption.

Suites at cut: semantic 1168/1168, t188 62/62, t205 22/22.

# abiogenesis 4.5.0-rc.11 Release Candidate Note

This checkpoint is the eleventh `4.5.0` release candidate. It follows
`4.5.0-rc.10` and carries Phase 2 of the Foundation Release wave: depth
is now EARNED truth derived by the kernel, never declared into closure.
T-210 (all five breaks) and T-197 land together; two external review
waves hardened the carriers before this cut.

- EARNED DEPTH (-032/-033/-034): a worker-delivered depth-proof map
  (test identity -> depth class -> requirement) is collapsed once at the
  accepted-artifact ingress into an admitted, digest-bound carrier with
  a closed issue vocabulary and replay-total event admission (row shape
  and string well-formedness checked at the canonical admitter). For
  map-bearing requirements, declared depth classes and typed gaps derive
  from the admitted map plus admitted test-identity evidence; the
  per-(requirement, class) lattice is {unmapped, identity-unverified,
  earned}. Declaration equality is severed from closure authority: a
  hollow declared-equal plan with an admitted map missing rows folds
  residual, never satisfied. Mixed old/new depth authority is
  non-closure: one mapped requirement holds every entry sibling to
  earned truth.
- DISCOVERED KILL OBLIGATIONS (-039, the Goedel projection): map rows in
  contract-declared adversarial depth classes project kill obligations —
  one per admitted row, cardinality discovered at admission, never
  enumerated. An obligation without complete admitted mutation-kill
  evidence is a typed gap through the existing depth gate.
- ADVERSARIAL ADMISSION (-035/-036): adversarial refs are
  ledger-resolved, never template-static; admitted survived-mutant
  evidence is counterexample truth and BLOCKS through the existing gate
  (kill evidence does not outvote a counterexample). Kill and survived
  evidence identity embeds the requirement id — evidence proves only the
  obligation it names; a foreign entry's survived mutant does not block,
  and a shared test identity cannot false-close a sibling requirement.
- FULL ProofStrengthAdmission CARRIER (T-197): the -035 field list
  preserved verbatim in one typed carrier per strength ref, derived
  totally over already-admitted truth as an equivalent admitted
  projection (no new event kind — strength has no open ingress of its
  own). Closed disposition lattice: counterexample -> not_admitted;
  admitted ref + F_D criteria total over the ledger -> fd_checked;
  admitted ref + admitted adversarial verification ->
  adversarially_verified. The -036 disjunct is proven end to end:
  strength closes through adversarial verification when F_D criteria
  never resolve. Consumers swapped, not forked: proof-depth truth
  consumes only the carrier's closure-bearing set.
- READ-MODEL HONESTY: the coverage projection's
  proofStrengthAdmissionRefs exposes only the carrier-resolved
  closure-bearing set when depth truth is present — a declared-but-
  unadmitted ref no longer displays as strength anywhere downstream.

Differential surface: 18 new pinned differentials across admission
totality, the severing negative proof, the earned positive path, the
mixed-authority law, obligation cardinality/determinism, scoped-evidence
probes (both review HIGHs), the disposition lattice, and the -036
disjunct. Suites at cut: semantic 1167/1167, t188 62/62, t205 22/22.

Downstream: odd_glc repins to this cut before the T-032 earned-depth
proving campaign (Phase 4); the campaign delivers depth maps, test
identities, and mutation evidence through the carriers this cut
publishes.

# abiogenesis 4.5.0-rc.10 Release Candidate Note

This checkpoint is the tenth `4.5.0` release candidate. It follows
`4.5.0-rc.9` and carries the T-031 campaign's second builder fix, found
live at the typed-UAT data-mapper proving edge:

- MULTI-REQUIREMENT COVERAGE FOLD SEAM: a projected requirement's proof
  coverage truth now always reaches its fold. Previously, in
  multi-requirement scope a requirement without a per-requirement
  evidence binding fell through silently — eight eligible carry
  admissions at the proving edge produced eight folds with EMPTY sources
  (no_close_preserved by default), and synthesized residual pressure had
  been dropped by the same seam. Coverage truth is requirement-proof
  truth (-013); the fold consumes it whenever it exists.

The rc.9 content follows.

# abiogenesis 4.5.0-rc.9 Release Candidate Note

This checkpoint is the ninth `4.5.0` release candidate. It follows
`4.5.0-rc.8` and carries the T-031 campaign's first builder fix, found
live on the typed-UAT data-mapper run within five vector closes:

- SPAN-BOUNDARY COVERAGE LAW: a multi-vector traversal span now covers
  its own boundary vectors. Endpoint-node corroboration applies only
  where it is defined — the span's source endpoint at its first vector,
  its target endpoint at its last; single-vector spans check both
  (node-identity drift protection preserved exactly). Previously the
  whole-span endpoints were corroborated against every member edge, so
  boundary vectors silently failed coverage and the requirement route
  emitted no fold truth at the creating and proving edges.

The rc.8 content follows.

# abiogenesis 4.5.0-rc.8 Release Candidate Note

This checkpoint is the eighth `4.5.0` release candidate. It follows
`4.5.0-rc.7` and realizes `REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-007`
— the gap found by odd_glc T-030's reopened lineage review (a converged
downstream run whose canary showed zero requirement pressure entering any
instruction prompt):

- REQUIREMENT PRESSURE IN MANIFESTS (-007): the engine derives per-vector
  requirement pressure — requirement ids, obligation projection refs, owed
  obligation refs, declared proof obligation refs — from admitted route
  facts in replay plus the admitted carry-through startup, and binds it as
  `requirement_pressure` runtime facts at every F_P instruction-bind site.
  The pressure renders into the worker prompt (`abg.runtime.bound_refs`)
  and surfaces replay-visibly as `requirementPressureRefs` on the prompt
  manifest carrier and event, under the existing digest/replay law.
  Products supply declarations only; ABG derives, binds, emits, and
  replays the pressure.

The rc.7 content follows.

# abiogenesis 4.5.0-rc.7 Release Candidate Note

This checkpoint is the seventh `4.5.0` release candidate. It follows
`4.5.0-rc.6` and exists because the rc.6 ARTIFACT predates the
self-review F1 hardening (rc.6 sourceCommit 6517268; F1 landed at
24b8583) — an installed rc.6 carries the pre-F1 shallow-freeze
admitted-template path. Release review classified that gap
release-blocking for downstream repin. rc.7 delta over rc.6:

- ADMITTED-TEMPLATE DEEP CLOSURE (self-review F1): the carry-through
  startup admission derives the admitted envelope template FROM the
  probe construction — constructor-frozen, canonical, detached from
  caller arrays. Post-admission mutation of the raw template cannot
  reach the admitted carrier or defeat the probe guarantee; the
  mutation-invisibility differential pins it.

Downstream repin targets THIS artifact, not rc.6.

The rc.6 content follows.

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
