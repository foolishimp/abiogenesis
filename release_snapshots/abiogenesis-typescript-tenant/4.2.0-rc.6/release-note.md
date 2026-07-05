# abiogenesis 4.2.0-rc.6 Release Candidate Note

This checkpoint is the sixth TypeScript ABG `4.2.0` release candidate. It
follows `4.2.0-rc.5` and publishes the post-RC5 dispatch-review follow-up
records as part of the release source boundary.

It is an RC candidate, not the final tapped `4.2.0` release.

## Release Claim

RC6 preserves the earned `4.2.0-rc.5` runtime behavior:

- every F_P dispatch is governed by instruction assembly law;
- absent, unresolved, unadmitted, or non-matching instruction-assembly startup
  blocks before worker, plugin, evaluator, response admission, assurance,
  continuation, residual, or closure paths;
- scalar transform, scalar evaluate, composed transform, composed consequence,
  and F_P evaluation-rule batch dispatches bind admitted prompt manifests
  before invocation;
- registry selection treats admitted registry entries as the candidate
  universe and vector declarations as optional constraints;
- absent vector registry constraints are unconstrained, not filled from the
  already-selected entry;
- selected graph functions must remain eligible after the registry universe and
  declared vector constraints are applied.

RC6 adds the post-RC5 review record to the release source:

- completed T-189 now records the post-closure DMM review disposition;
- active T-190 tracks replacement of the source-text dispatch census with
  runtime F_P dispatch enumeration and mutation differentials;
- active T-188 now has an explicit non-closure guard forbidding assurance fold,
  lifecycle closure, release proof, or downstream closure from trusting
  startup-carried `dependencyClosed`, `depthComplete`, or
  `proofStrengthAdmitted` flags as proof truth;
- GOAL-030 tracks the runtime dispatch proof-hardening successor work.

RC6 intentionally does not reprice `REQ-R-ABG3-SELECTION-APPLICATION-006`.
The ratified design remains:

```text
registry universe -> optional vector constraints -> selected candidate remains eligible
```

Absent vector or edge registry constraints are unconstrained. Any future move
to intrinsic edge-contract defaults requires a separate requirement reprice.

## Boundary

The release keeps this authority split:

```text
GTL declares:
  graph overlays, graph functions, node types, vector constraints, plugin
  contracts, fulfillment bindings, registry entries, startup config, and policy
  refs as language/configuration truth

ABG derives and admits:
  instruction assembly startup, runtime binding, prompt manifests, registry
  lookup, registry selection, graph-function invocation truth, worker response
  admission, requirement/proof pairing, proof coverage, residual pressure, and
  replay-visible runtime truth

F_P workers provide:
  candidate material and semantic evidence only

Downstream products own:
  domain meaning, product plugin behavior, prompt/policy content, lifecycle
  interpretation, and product-specific readiness claims
```

The release specifically rejects these drift paths:

- unmanifested F_P worker, plugin, or evaluator invocation;
- product-local prompt shells or prompt loaders;
- selected-entry registry self-confirmation;
- vector constraints inferred from the candidate being selected;
- worker self-report, transport success, or response shape as closure truth;
- startup-carried `dependencyClosed`, `depthComplete`, or
  `proofStrengthAdmitted` as closure authority;
- product-local proof coverage ledgers, closure registers, or registry truth.

## Versioned Artifacts

- RC branch: `main`
- RC identity: `4.2.0-rc.6`
- Candidate package version: `4.2.0-rc.6`
- Candidate tag: `v4.2.0-rc.6`

## Verification

Required evidence for accepting this RC:

```text
ABG semantic gate:
  npm run test:semantic

Focused runtime wiring gate:
  npm run test:t189

Instruction assembly regression gate:
  npm run test:t183

Registry regression gate:
  npm run test:t177

Requirement-proof regression gate:
  npm run test:t188

Boundary and packaging gates:
  git diff --check
  npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run
```

The T-189 proof remains the RC5 runtime proof. T-190 is the active successor
that hardens the proof method by replacing source-text census closure with
runtime per-arm enumeration and mutation differentials.

## RC Decision

RC6 is the ABI/GTL publication candidate for the RC5 runtime dispatch and
registry-selection behavior plus the completed post-review follow-up records.
Downstream products may consume RC6 to depend on the RC5 runtime behavior while
also receiving the current T-188 hazard guard and T-190 proof-hardening work
surface in the release source. RC6 does not make ABG own product acceptability,
software policy, release readiness, or downstream lifecycle interpretation.
