# abiogenesis 4.2.0-rc.2 Release Candidate Note

This checkpoint is the second TypeScript ABG `4.2.0` release candidate. It
follows `4.2.0-rc.1` and publishes the consolidated GTL/ABG full-stack Hello
World proof surface added after the reusable node-type and type-composition
substrate.

It is an RC candidate, not the final tapped `4.2.0` release.

## Release Claim

RC2 preserves the earned `4.2.0-rc.1` reusable node-type, composition,
registry, startup, and invocation-guard substrate and adds the canonical
installed live Hello World proof lane. The release-facing proof now exercises
the downstream-shaped path through one installed sandbox run instead of
scattered ticket-specific live smoke tests.

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
- instruction assembly startup binding through the installed CLI runtime
  binding path;
- ABG-rendered instruction prompt manifests used as the live F_P worker prompt;
- admitted instruction responses tied to derived output contracts;
- causal carry rendered into subsequent instruction envelopes from admitted
  runtime truth;
- one canonical `test:hello-world:live` proof script used by the T-180, T-182,
  and T-183 live aliases;
- installer refresh upgrade handling that preserves an existing target package
  identity when `--installed-package-name` is omitted, while still rejecting an
  explicitly conflicting installed package name.

The steel-thread proof uses an `odd_glc`-style GLC Hello World bootstrap graph
only as a downstream proof binding. ABI/GTL owns the generic node-type,
composition, registry admission, selection, invocation, instruction assembly,
response admission, projection, startup, and event-sourced proof mechanics. ABI
does not own odd_glc lifecycle policy, software build policy, test policy,
deployment policy, or release-readiness semantics.

## Boundary

The release keeps this authority split:

```text
GTL declares:
  node types, graph functions, composed types, typed wiring,
  product library entries, startup config refs, and instruction-plan data

ABG admits and projects:
  registry entries, lookup eligibility, selection truth, graph-call opening,
  invocation guards, node-type satisfaction, instruction prompt manifests,
  response-contract admission, runtime events, and replay state

Downstream products own:
  domain names, prompt/policy content, product plugin behavior,
  lifecycle interpretation, and product-specific readiness claims
```

Node-type identity is not callable work. A node-type graph function may be
published, admitted, projected, and used for satisfaction checks, but it may not
be selected as `graph_function_selected`, opened as a graph call, or accepted as
public callable work.

Prompt construction is not a downstream shell. Product instruction content may
enter as declared data, but the live worker prompt for the canonical proof is
the ABG-projected `instructionPromptManifest.renderedPrompt`.

## Versioned Artifacts

- RC branch: `main`
- RC identity: `4.2.0-rc.2`
- Candidate package version: `4.2.0-rc.2`
- Candidate tag: `v4.2.0-rc.2`

## Verification

Required evidence for accepting this RC:

```text
ABG semantic gate:
  npm run test:semantic

Focused node-type gate:
  npm run test:t180

Instruction assembly gate:
  npm run test:t183

Canonical live F_P proof gate:
  npm run test:hello-world:live

Boundary and packaging gates:
  git diff --check
  npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run
```

The live proof must create an installed sandbox instance from a release
snapshot, write only product GTL declarations and product startup config into
the installed bootstrap binding, run installed `genesis-ts start`, use the
ABG-rendered instruction prompt manifest for the worker prompt, execute the
generated artifact, and observe ABG-emitted registry admission,
`graph_function_selected`, `graph_call_opened`,
`instruction_prompt_manifest_projected`,
`instruction_response_contract_admitted`, vector-closure truth, and terminal
truth. A direct in-process harness is diagnostic evidence only; it is not this
RC's closure lane.

## RC Decision

RC2 is the ABI/GTL publication candidate for reusable node types, explicit type
composition, canonical startup pickup, instruction assembly, and the
release-facing installed live Hello World proof. Downstream products may consume
the release by declaring their own node types, graph functions, overlays, and
product library entries through GTL and ABG startup. Downstream code must not
create a product-local type registry, product-local graph-call shell,
product-local prompt shell, product-local selection truth, or parallel runtime
registry.
