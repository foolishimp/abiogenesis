# abiogenesis 4.2.0-rc.1 Release Candidate Note

This checkpoint is the first TypeScript ABG `4.2.0` release candidate. It
follows `4.1.0-rc.17` and publishes the T-180 reusable GTL node-type and
type-composition substrate needed by downstream lifecycle consumers such as
`odd_glc`.

It is an RC candidate, not the final tapped `4.2.0` release.

## Release Claim

RC1 preserves the earned `4.1.0-rc.17` requirements, execution, registry, and
parallel-proof substrate and adds reusable GTL node types without introducing a
second type carrier, product-local type registry, or callable node-type
function surface.

The release includes:

- reusable node types realized as non-callable identity `GraphFunction`
  publications with `Node.typeRef` carrier truth;
- `node_type` registry entries admitted and projected by ABG while remaining
  ineligible for callable graph-function selection;
- composed node types that preserve constituent obligations;
- explicit typed wiring for composition across differently named ports;
- ABG node-type satisfaction projection and close-time validation support;
- exported graph-call and invocation guards that reject node-type graph
  functions even when caller-supplied data attempts to smuggle them in;
- installed startup binding for product registry declarations/config so a
  downstream product can publish graph functions, overlays, node types, and GTL
  bindings through canonical ABG startup rather than product-local shells;
- installer refresh upgrade handling that preserves an existing target package
  identity when `--installed-package-name` is omitted, while still rejecting an
  explicitly conflicting installed package name.

The steel-thread proof uses an `odd_glc`-style GLC Hello World bootstrap graph
only as a downstream proof binding. ABI/GTL owns the generic node-type,
composition, registry admission, selection, invocation, projection, and startup
mechanics. ABI does not own odd_glc lifecycle policy, software build policy,
test policy, deployment policy, or release-readiness semantics.

## Boundary

The release keeps this authority split:

```text
GTL declares:
  node types, graph functions, composed types, typed wiring,
  product library entries, and startup config refs

ABG admits and projects:
  registry entries, lookup eligibility, selection truth, graph-call opening,
  invocation guards, node-type satisfaction, runtime events, and replay state

Downstream products own:
  domain names, prompt/policy overlays, product plugin behavior,
  lifecycle interpretation, and product-specific readiness claims
```

Node-type identity is not callable work. A node-type graph function may be
published, admitted, projected, and used for satisfaction checks, but it may not
be selected as `graph_function_selected`, opened as a graph call, or accepted as
public callable work.

## Versioned Artifacts

- RC branch: `main`
- RC identity: `4.2.0-rc.1`
- Candidate package version: `4.2.0-rc.1`
- Candidate tag: `v4.2.0-rc.1`

## Verification

Required evidence for accepting this RC:

```text
ABG semantic gate:
  npm run test:semantic

Focused T-180 gate:
  npm run test:t180

Registry regression gate:
  npm run test:t177

Live F_P proof gate:
  ABG_TS_LIVE_AGENT=claude CODEX_LIVE_FP=1 ABG_TS_T180_GLC_BOOTSTRAP_LIVE=1 npm run test:t180:live

Boundary and packaging gates:
  node --test test_env/tests/test_t109_agent_callout_guard.test.mjs
  node --test test_env/tests/test_m04_typescript_installer_integration.test.mjs
  git diff --check
  npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run
```

The live proof must create an installed sandbox instance from a release
snapshot, write only product GTL declarations and product startup config into
the installed bootstrap binding, run installed `genesis-ts start`, and observe
ABG-emitted registry admission, `graph_function_selected`, `graph_call_opened`,
and vector-closure truth. A direct in-process harness is diagnostic evidence
only; it is not this RC's closure lane.

## RC Decision

RC1 is the ABI/GTL publication candidate for reusable node types and explicit
type composition. Downstream `odd_glc` may consume the release by declaring its
own node types, graph functions, overlays, and product library entries through
GTL and ABG startup. Downstream code must not create a product-local type
registry, product-local graph-call shell, product-local selection truth, or
parallel runtime registry.
