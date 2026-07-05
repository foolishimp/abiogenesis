# abiogenesis 4.2.0-rc.5 Release Candidate Note

This checkpoint is the fifth TypeScript ABG `4.2.0` release candidate. It
follows `4.2.0-rc.4` and publishes T-189 live runtime wiring for ratified
instruction assembly and registry selection law.

It is an RC candidate, not the final tapped `4.2.0` release.

## Release Claim

RC5 preserves the earned `4.2.0-rc.4` reusable node-type, composition,
registry, startup, invocation-guard, instruction-assembly, installed-context,
canonical live Hello World, and first requirement-proof carry-through
substrate. It adds the missing live-runtime wiring so the ratified dispatch and
selection law is applied on the actual runner path:

- every F_P dispatch is governed by instruction assembly law;
- absent, unresolved, unadmitted, or non-matching instruction-assembly startup
  blocks before worker, plugin, evaluator, response admission, assurance,
  continuation, residual, or closure paths;
- scalar transform, scalar evaluate, composed transform, composed consequence,
  and F_P evaluation-rule batch dispatches bind admitted prompt manifests
  before invocation;
- a source-derived dispatch-site census guards the runner against adding a new
  F_P-capable site without instruction assembly binding;
- registry selection treats admitted registry entries as the candidate
  universe and vector declarations as optional constraints;
- absent vector registry constraints are unconstrained, not filled from the
  already-selected entry;
- selected graph functions must remain eligible after the registry universe and
  declared vector constraints are applied.

The release includes:

- `REQ-R-ABG3-INSTRUCTION-ASSEMBLY-005` tightened so all F_P dispatch requires
  admitted instruction assembly;
- `REQ-R-ABG3-INSTRUCTION-ASSEMBLY-017` ratifying fail-closed behavior for
  absent or non-matching instruction assembly startup at any F_P boundary;
- `REQ-R-ABG3-SELECTION-APPLICATION-006` ratifying registry universe plus
  vector-constraint selection semantics;
- `constructDefaultInstructionAssemblyStartupForBasis(...)` as the production
  helper for installed contexts and proof scripts to derive startup data from
  admitted basis truth;
- runner wiring for composed transform/consequence F_P tasks and F_P
  evaluation-rule batches;
- optional registry lookup constraints so vectors can narrow candidate
  identity, interface, contract, context, authority, overlay, namespace,
  version, provenance, readiness, proof, and policy refs without creating
  selected-entry self-confirmation;
- T-189 focused proofs for fail-closed missing startup, source-derived dispatch
  census, manifest-before-plugin invocation, contract-boundary rejection, and
  vector candidate allow-list rejection.

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
- caller-supplied `dependencyClosed`, `depthComplete`, or
  `proofStrengthAdmitted` as closure authority;
- product-local proof coverage ledgers, closure registers, or registry truth.

## Versioned Artifacts

- RC branch: `main`
- RC identity: `4.2.0-rc.5`
- Candidate package version: `4.2.0-rc.5`
- Candidate tag: `v4.2.0-rc.5`

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

The T-189 proof must demonstrate:

- missing instruction-assembly startup blocks before F_P worker invocation;
- the dispatch-site census is derived from the live runner source, not a
  hand-authored scenario list;
- composed F_P task invocation receives an admitted prompt manifest before the
  plugin is invoked;
- a vector-declared contract mismatch rejects selected graph-function
  selection before dispatch;
- a vector-declared candidate allow-list can exclude the selected graph
  function even when that function is present in the registry.

## RC Decision

RC5 is the ABI/GTL publication candidate for live runtime dispatch and registry
selection wiring over the RC4 requirement-proof substrate. Downstream products
may consume RC5 to rely on ABG-owned prompt manifestation and registry
selection on live runner paths without creating product-local prompt shells,
registry mirrors, dispatch wrappers, proof ledgers, or closure registers. RC5
does not make ABG own product acceptability, software policy, release
readiness, or downstream lifecycle interpretation.
