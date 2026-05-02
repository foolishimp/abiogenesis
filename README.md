# Abiogenesis

Abiogenesis is the constitutional source for a GTL-native AI SDLC engine.

The repo is organized around spec-driven development:
- `specification/` is the constitutional source
- `build_tenants/TENANT_REGISTRY.md` is the canonical tenant registry
- `build_tenants/common/` is the shared tenant-local realization root
- `build_tenants/abiogenesis/typescript/design/` is the primary release design
  surface for the current GTL 3 / ABG 3 line
- `build_tenants/abiogenesis/typescript/code/` is the primary TypeScript
  realization
- `build_tenants/abiogenesis/typescript/test_env/` is the primary TS RC proof
  harness
- `build_tenants/abiogenesis/python/` is a paused released reference line

The active engine and language surface is GTL 3 / ABG 3.4.0-rc.5:
- GTL: `Module`, `Graph`, `Node`, `GraphVector`, `Context`, `Job`, `Role`
- ABG: interpreter, typed runtime carriers, event stream, projection,
  convergence, regime binding, run, graph call, continuation, transport,
  provenance, payload ledger, assurance projection

The 3.4.0 RC runtime boundary is carrier and event owned. Public execution
still enters through published `GraphFunction` work, but advancement, dispatch,
convergence, completion, and projection consume typed runtime truth rather than
controller-local state or `runtime_config` side channels. In the TypeScript RC
line, `start(...)` owns the public `start -> iterate` engine path and
`publicStart(...)` is only a compatibility adapter over that path.

Downstream ODD domain builders declare hook refs in GTL and bind executable
behavior through ABG plugin contracts. Payloads that influence authority,
evidence, ambiguity, traversal, or closure pass through ABG admission and the
event-sourced payload ledger.

## Public Operator Surface

The public advancement and observation contract is:

- `gen-start`
- `gen-gaps`

Concrete spellings such as `python -m genesis start` or `genesis gaps` are
adapter/build bindings for that same contract.

`gen-start` accepts one traversal request grammar:

- `scope`
- `target`
- `until`

Current public target families are:

- `next`
- `graph_function:<published_handle>`
- `asset:<published_handle>` when the selected runtime publishes an operator
  asset registry and ownership surface

Control modes such as F_H proxying or root supervision sit outside that
request grammar.

The current public control-mode families are:

- `fh_mode = direct | human-proxy`
- `root_mode = direct | supervised`

Both default to `direct`. Concrete spellings such as `--fh-mode` and
`--root-mode` are adapter/build bindings for those same product-policy control
families. In the current cut, both are lawful only with `until = converged`.

Lower-level traversal or status hooks may still exist in the runtime and
install line, but they are not the public human operator workflow.

Internally, `gen-start` binds operator input to the kernel carrier family
(`ExecutionBasis`, `AdvancementTransition`, `IterationAdvanceDecision`, and
`RegimeBindingSet`). Those carriers and replay-visible events are the runtime
source of truth.

## Source of Truth

Read these first:
- Public methodology master: `https://github.com/foolishimp/specification_methodology`
- Methodology standard: [SPEC_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/SPEC_METHOD.md)
- [INTENT.md](specification/INTENT.md)
- [PRODUCT.md](specification/PRODUCT.md)
- [requirements/gtl/](specification/requirements/gtl/)
- [requirements/abg/](specification/requirements/abg/)
- [requirements/mapping/](specification/requirements/mapping/)
- [requirements/product/](specification/requirements/product/)
- [TENANT_REGISTRY.md](build_tenants/TENANT_REGISTRY.md)
- [build_tenants/common/design/README.md](build_tenants/common/design/README.md)
- [build_tenants/common/design/module_decomp.md](build_tenants/common/design/module_decomp.md)
- [build_tenants/abiogenesis/typescript/design/README.md](build_tenants/abiogenesis/typescript/design/README.md)

The project method is explicit:
- requirements are the constitutional `what`
- design is the structural bridge
- code must derive from requirements plus design
- live requirements need downstream realization or explicit deferment
- shipping behavior must trace back to constitutional authority

## Shipping Surface

The primary release line is the package-first TypeScript realization under
`build_tenants/abiogenesis/typescript/`.

The Python realization under `build_tenants/abiogenesis/python/` is retained as
a paused released reference line. Python tests and archives remain useful
evidence, but Python work is not part of the TS-primary RC gate while the tenant
registry keeps Python paused.

Relevant directories:

```text
build_tenants/abiogenesis/typescript/
├── code/         TypeScript GTL/ABG primary release implementation
├── design/       TypeScript design, IACS, and structural carrier surfaces
├── test_env/     semantic, sandbox, installed, and live RC proof lanes
└── package.json  package-first scripts and binary bindings
```

```text
build_tenants/abiogenesis/python/
├── code/         paused released reference engine + GTL types + domain packages
├── design/       paused released reference design / ADR surface
├── test_env/     paused released reference test harness
└── test_runs/    persistent reference test archives
```

`build_tenants/abiogenesis/codex/` is non-shipping and not part of the canonical publish gate.

## Test Harness

The primary TypeScript proof lane is:

```bash
cd build_tenants/abiogenesis/typescript
npm run test:semantic
npm run test:b016
npm run test:t072
npm run lint:semantic
CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=180000 npm run test:t094:live
CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude npm run test:live:uat
CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude npm run test:live
```

The repo root is not the active test bed.

The paused Python reference harness remains available for reference-only
regression evidence:

```bash
cd build_tenants/abiogenesis/python/test_env
./run_tests
./run_tests e2e
./run_tests live
./run_tests file tests/test_live_fp_qualification.py -m live_fp -k TestLiveFpSmoke -v
```

## Installer

The TypeScript RC installer is the primary bootstrap path:

```bash
cd build_tenants/abiogenesis/typescript
npm run build:semantic
node build/semantic/code/src/bin/abiogenesis.js install --target /path/to/project
```

That installs a package-backed ABG TypeScript runtime into the target project:
`.abiogenesis/install-manifest.json`,
`.abiogenesis/typescript-installer-manifest.json`,
`.abiogenesis/docs/`,
`node_modules/@abiogenesis/typescript-tenant`, and
`node_modules/.bin/{abiogenesis-ts,genesis-ts}`.

The paused Python reference installer remains historical/reference-only:

```bash
python build_tenants/abiogenesis/python/code/gen-install.py --target /path/to/project
```

That installs a `.genesis/` runtime into the target project. It is not the
primary TS release bootstrap path.

## GTL Hook And ABG Plugin Setup

For ODD domain builders, the setup rule is:

```text
GTL declaration -> hook ref + replay-safe config
ABG plugin      -> admitted provider/evaluator/policy implementation
ABG events      -> payload, evidence, ambiguity, and closure truth
Read models     -> projected lifecycle and lineage registers
```

The assurance plugin concerns are authority snapshot, evidence adapter,
ambiguity classifier, closure policy provider, and gain-function adapter.
Plugins supply inputs to ABG; ABG owns event emission, projection, selection,
closure, and ledger truth.

## Notes

- Historical V1 doctrine and supersession history still exist in the specification where they matter constitutionally.
- Compatibility debt is being pruned aggressively from shipping surfaces.
- Live domain artifacts are versioned constitutional history and must change by supersession or withdrawal, not silent in-place mutation.
