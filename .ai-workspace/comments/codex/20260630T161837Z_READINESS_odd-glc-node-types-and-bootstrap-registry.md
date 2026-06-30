# odd_glc Readiness: Reusable Node Types And Bootstrap Registry

## Status

Ready for downstream odd_glc consumption against ABI/GTL source commit
`fba9d990c1702355a94374165c6deeb0edf6bf48` and package identity
`@abiogenesis/typescript-tenant@4.2.0-rc.1`.

This readiness note closes the T-180 downstream publication obligation. It is a
consumption note, not an odd_glc product specification.

## Proven Capabilities

Downstream products may now rely on ABI/GTL for:

- reusable node types as non-callable identity `GraphFunction` publications;
- `Node.typeRef` carrier truth preserved through GTL admission,
  serialization, and graph-function contract identity;
- composed node types that preserve constituent obligations;
- explicit type-sensitive composition through `composeWithTypeWiring`;
- runtime registry admission/projection for `node_type` and `graph_function`
  entries;
- ABG selection rejection for non-callable registry entries, including
  `node_type`;
- graph-call and invocation guards that reject node-type graph functions;
- ABG node-type satisfaction projection for traversal-close validation;
- installed startup pickup of product GTL library declarations and product
  registry startup config through the canonical ABG start path.

## odd_glc Consumption Boundary

odd_glc may declare its own lifecycle node types, overlays, graph functions,
and product library entries through GTL declaration surfaces and ABG startup
config.

odd_glc must not create:

- a product-local node-type registry;
- a product-local graph-call shell;
- a product-local registry admission path;
- a product-local selection truth stream;
- a product-local invocation gate;
- a duplicate callable type carrier.

Domain names such as GLC bootstrap context, lifecycle artifact, executable
artifact, and execution evidence are proof-binding names only. They are not ABI
system policy.

## Proof Artifact

Installed sandbox/bootstrap live proof:

```text
build_tenants/abiogenesis/typescript/test_env/test_runs/t180_glc_hello_world_bootstrap_live/20260630T161623713Z_pid55795/t180-glc-hello-world-bootstrap-live-proof.json
```

Proof summary:

- source commit:
  `fba9d990c1702355a94374165c6deeb0edf6bf48`;
- source dirty: `false`;
- package version: `4.2.0-rc.1`;
- artifact durationMs: `111101`;
- node test duration: `112549.853917ms`;
- snapshot tarball sha256:
  `b558c437a508b1467ba02e0af2117b07587ddf19533425b1bd9ad809fffad68e`;
- start status: `converged`;
- event count in start output: `87`;
- admitted registry entries: five `node_type` entries and one
  `graph_function` entry;
- traversal selections: two `graph_function_selected` events and zero
  node-type selections;
- traversal closure: two `graph_call_opened`, two `vector_closed`, and
  `terminal_reached`.

The proof creates an installed sandbox instance from a per-run release
snapshot, writes product GTL declarations and product registry startup config
into the installed bootstrap binding, and runs installed `genesis-ts start`.
The live F_P worker is invoked during the installed run.

## Verification

The release metadata source commit passed:

```text
npm run test:t180
npm run test:t177
node --test test_env/tests/test_t109_agent_callout_guard.test.mjs
npm run test:semantic
npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run
ABG_TS_LIVE_AGENT=claude CODEX_LIVE_FP=1 ABG_TS_T180_GLC_BOOTSTRAP_LIVE=1 npm run test:t180:live
```

## Deferred Work

T-180 defines the `node_type` registry entry kind and the reusable type
composition substrate. It does not close the broader T-179 non-graph
entry-kind taxonomy work.
