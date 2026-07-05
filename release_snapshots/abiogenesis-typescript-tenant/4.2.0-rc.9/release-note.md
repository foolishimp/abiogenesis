# abiogenesis 4.2.0-rc.9 Release Candidate Note

This checkpoint is the ninth TypeScript ABG `4.2.0` release candidate. It
follows `4.2.0-rc.9` with two downstream-driven root-cause fixes from the
odd_glc data-mapper live campaign (T-030): the causal-excerpt render bound
is plan-declared policy (`causalExcerptMaxChars`, fail-closed validation)
instead of a hardcoded 12k constant that silently starved product-scale
admitted content, and the codex worker model is adapter ingress
(`ABG_TS_CODEX_MODEL`) instead of a hardcoded account-dependent pin. All
rc.8 claims are preserved unchanged.

It is an RC candidate, not the final tapped `4.2.0` release.

## Release Claim

RC8 preserves the earned RC7 claims below and adds, as closed-ticket truth:

Temporal property layer (T-192, closed):

- GTL temporal properties are a Rule kind (no new ontology) over trace-only
  atoms (event-occurrence + fluent-hold from the one event-calculus
  vocabulary), checked as total three-valued LTL3/LTLf functions over
  finite replay traces (REQ-L-GTL3-TEMPORAL-PROPERTIES-001..-012);
- the five standing audit gates run as DECLARED properties on every run
  carrying the startup family: dispatch-requires-manifest,
  coverage-requires-payload-admission, invocation-requires-dispatch,
  selection-requires-registry-admission (safety), and
  dispatch-eventually-closes (liveness);
- online enforcement: a violated safety property blocks the dispatch
  BEFORE the candidate event enters truth, with a replay-visible violated
  verdict; unlawful property sets fail closed at startup;
- verdict law: zero-witness satisfied is VACUOUS and never gate-
  satisfying; open-prefix liveness is undetermined and routes to residual,
  never blocking; completed terminals decide future obligations; yields
  do not judge;
- proven live from the installed sandbox: five verdicts, all satisfied,
  dispatch gate witnessed non-vacuous, liveness decided by completion.

Constitutional drift detection (T-193, closed):

- constitutional surfaces are witnessed data (REQ-L-GTL3-LAWS-028):
  loaders witness surface digests, declared version lines, and cited
  ticket refs plus live facts; the ONE semantic compiler judges drift as
  typed diagnostics with default repair affordances;
- the four drift classes: version-line-drift, release-claim-cites-active-
  ticket (the RC4 class), surface-digest-missing, seam-parity-drift;
- the real-tree witness stands in the semantic suite: this RC's own
  bootstrap version lines are drift-checked against the package version —
  an rc bump without bootstrap propagation is a red suite;
- day-one proof: the detector caught live bootstrap version drift on its
  first real-tree run; the drift was fixed at its authored home.

RC7 claims preserved (all still in force):

Requirement proof carry-through (T-188, closed):

- on an edge bearing a declared carry-through contract, requirement closure
  derives from replay-derived proof coverage: producer-computed coverage is
  admitted at the accepted-payload result site, threaded to the closing fold
  under basis + edge + vector identity, and an uncovered or residual
  obligation shall not close (proven engine-driven and from a
  snapshot-installed sandbox with a real worker);
- proof-strength refs resolve against the admitted replay ledger through one
  named projection (`deriveAdmittedStrengthRefSet`, the
  `REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-035` interim admitted
  projection); string presence, worker self-report, and startup-carried
  booleans are not strength truth;
- rejected attached payloads mint no coverage truth; rejected admissions
  carry residual no-close pressure; coverage truth refs are parseable,
  digest-checked, and cross-validated at event construction;
- SCOPE (per `REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-038`, ratified this
  RC): coverage-gated closure applies to DECLARED carry-through edges. An
  edge with active obligations and no declared contract is a typed
  transitional state, not silent permission; the mandatory carry-through
  witness migration is the named successor that retires it. RC7 does NOT
  claim universal coverage-gated closure.

Runtime dispatch enumeration (T-190, closed):

- the F_P dispatch census is the bind path itself: every binding site names a
  registered arm (compile-forced, runtime fail-closed) and an unregistered
  arm cannot bind or dispatch;
- scalar transform, scalar evaluate, composed transform, composed
  consequence, and evaluation-rule batch arms carry runtime manifest-presence
  and per-stage manifest-identity proofs plus omitted-plan blocking
  differentials; the latent singular `evaluation_rule_evaluate` effect is
  construct-and-block guarded in both executor twins;
- the source-text census is deleted; classification-as-data with registry
  set-equality fails the suite by construction when a new arm is registered
  without a proof row.

GTL authoring-loop meta-law (T-191, closed):

- REQ-L-GTL3-LAWS-019..-027 ratified: stable diagnostic identities with a
  closed vocabulary and constructor gate, typed admissible repairs, canonical
  authored form (declarations-are-data), witnessed declaration-source rows,
  golden-instance bindings, declared underdetermination, authorship,
  supersession, and the language conformance corpus;
- declared latitude renders into instruction manifests as PERMISSION
  (`## abg.declared_latitude`); golden instances bound on a
  requirement-bearing edge are consumed by the evaluator arm's manifest as
  calibration with counterexample refutation material
  (`## abg.golden_instance_calibration`) — both proven live from the
  installed sandbox;
- the latitude/calibration carriers and predicates have ONE rule home
  (`gtl_program_conformance`); plan-compile validation derives from it.

Registry selection and public seams:

- ambiguity is not authority: with multiple basis-matching entries the runner
  asserts no pre-picked candidate; a declared vector candidate constraint
  lawfully resolves selection; unauthorized ambiguity fails closed with a
  replay-visible `graph_function_selection_rejected`;
- the engine-start passthrough family has one authority
  (`EngineStartPassthroughFields`) consumed by every public seam (m04 start
  context, public start, CLI runtime-binding parse);
- vector/function declarations admit through a fail-closed typed carrier:
  unknown sibling keys are rejected, not silently dropped.

Standing installed-sandbox live gate (T-194, closed; lane is infrastructure):

- one lane installs the release snapshot into a sandbox and proves the
  14-row feature matrix through the installed CLI public path with a real
  worker: carry-through both branches, fail-closed dispatch, registry
  boundary both ways, rejected-payload no-emission, the installed T-191
  compiler surface, exact replay, and the latitude/calibration live guards;
- gate runs self-classify (`t194-gate-classification.json`): only a
  `sourceClean` run is release-grade; this RC cites such a run;
- runtime-affecting tickets close only with a fresh green gate run (standing
  closure rule; T-188/T-190/T-191 closed under it);
- the canonical hello-world full-stack lane is repaired (proof-depth truth
  and evaluate-stage plans in its generated startup) and green on the shared
  binding-source builder.

RC7 intentionally does not reprice `REQ-R-ABG3-SELECTION-APPLICATION-006`.
The ratified design remains: registry universe first, optional vector
constraints second, no selected-entry backfill.

RC7 does not accept as truth:

- closure claims on undeclared carry-through edges beyond the typed
  transitional state named by `-038`;
- vector constraints inferred from the candidate being selected;
- worker self-report, transport success, or response shape as closure truth;
- startup-carried `dependencyClosed`, `depthComplete`, or
  `proofStrengthAdmitted` as closure authority;
- product-local proof coverage ledgers, closure registers, or registry truth;
- dirty-source gate runs as release evidence.

## Versioned Artifacts

- RC branch: `main`
- RC identity: `4.2.0-rc.9`
- Candidate package version: `4.2.0-rc.9`
- Candidate tag: `v4.2.0-rc.9`

## Verification

Required evidence for accepting this RC:

```text
ABG semantic gate:
  npm run test:semantic

Requirement-proof gates:
  npm run test:t188

Runtime dispatch enumeration gate:
  npm run test:t189

Authoring-loop meta-law gate:
  npm run test:t191

Temporal-property gate:
  node --test test_env/tests/test_t192_temporal_properties.test.mjs

Constitutional drift gate (real-tree witness):
  node --test test_env/tests/test_t193_constitutional_drift.test.mjs

Instruction assembly regression gate:
  npm run test:t183

Registry regression gate:
  npm run test:t177

Standing installed-sandbox live gate (release-grade, sourceClean):
  npm run test:t194:sandbox-live

Canonical installed live lane:
  npm run test:hello-world:live

Boundary and packaging gates:
  git diff --check
  npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run
```

## RC Decision

RC8 is the ABI/GTL publication candidate for runtime self-enforcement:
downstream products consuming RC8 get the standing audit gates as
declared per-run temporal law and constitutional drift as a typed
compiler diagnostic, on top of every RC7 claim. Downstream products may
consume RC7 to depend on coverage-gated closure on declared carry-through
edges, bind-path dispatch enumeration, permission-rendered latitude,
evaluator-consumed golden calibration, and the self-classifying installed
live gate. RC8 does not make ABG own product acceptability, software policy,
release readiness, or downstream lifecycle interpretation. The named open
successors (mandatory carry-through witness migration, full
`ProofStrengthAdmission` carrier, frame-identity fold scoping, temporal
property layer T-192) are work surfaces, not RC8 claims — joined by the T-192/T-193 successors
(per-vector property formulas, composed-arm dispatch gating,
closure-point verdict consumption, paragraph-scoped release witnessing,
product-grade witness loader).
