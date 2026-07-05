# abiogenesis 4.2.0-rc.7 Release Candidate Note

This checkpoint is the seventh TypeScript ABG `4.2.0` release candidate. It
follows `4.2.0-rc.6` and publishes the completed requirement-proof
carry-through wave, the runtime dispatch enumeration proof, the GTL
authoring-loop meta-law, and the standing installed-sandbox live gate.

It is an RC candidate, not the final tapped `4.2.0` release.

## Release Claim

RC7 preserves the earned RC5/RC6 runtime behavior and adds, as closed-ticket
truth:

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
- RC identity: `4.2.0-rc.7`
- Candidate package version: `4.2.0-rc.7`
- Candidate tag: `v4.2.0-rc.7`

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

RC7 is the ABI/GTL publication candidate for the carry-through, dispatch
enumeration, authoring-loop, and standing-gate waves. Downstream products may
consume RC7 to depend on coverage-gated closure on declared carry-through
edges, bind-path dispatch enumeration, permission-rendered latitude,
evaluator-consumed golden calibration, and the self-classifying installed
live gate. RC7 does not make ABG own product acceptability, software policy,
release readiness, or downstream lifecycle interpretation. The named open
successors (mandatory carry-through witness migration, full
`ProofStrengthAdmission` carrier, frame-identity fold scoping, temporal
property layer T-192) are work surfaces, not RC7 claims.
