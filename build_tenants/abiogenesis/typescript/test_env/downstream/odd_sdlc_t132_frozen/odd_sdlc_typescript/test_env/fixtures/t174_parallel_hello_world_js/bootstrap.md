# T-174 Parallel Hello-World Bootstrap

This bootstrap document is the scenario contract for a minimal product that
still has lawful parallel construction pressure.

The product intent is small: build one Node.js tenant whose final behavior is
`hello world`. The construction shape is intentionally split into two
independent dev branches, two independent test branches, and one fan-in so the
SDLC can publish dependency topology without making the product itself large.

The generated product has no runtime dependency on `odd_sdlc`, GTL, ABG, or the
scenario harness.

## Product Definition

Product name: `t174_parallel_hello_world_js`

Active tenant: `parallel_hello_world`

Selected output root:

```text
build_tenants/parallel_hello_world
```

The generated tenant must:

- provide a package manifest at
  `build_tenants/parallel_hello_world/package.json`;
- provide an independent hello branch at
  `build_tenants/parallel_hello_world/src/hello.js`;
- provide an independent world branch at
  `build_tenants/parallel_hello_world/src/world.js`;
- provide an independent hello test branch at
  `build_tenants/parallel_hello_world/test/hello.test.js`;
- provide an independent world test branch at
  `build_tenants/parallel_hello_world/test/world.test.js`;
- provide a fan-in module at
  `build_tenants/parallel_hello_world/src/index.js`;
- prove that the composed exported behavior is exactly `hello world`.

## Requirements

### REQ-T174-PARALLEL-HELLO-001 Package Contract

The product shall provide one Node.js package manifest at
`build_tenants/parallel_hello_world/package.json` and support direct Node.js
execution from the tenant root.

### REQ-T174-PARALLEL-HELLO-002 Hello Branch

The product shall provide a hello branch module at
`build_tenants/parallel_hello_world/src/hello.js` whose owned responsibility is
returning exactly `hello`.

### REQ-T174-PARALLEL-HELLO-003 World Branch

The product shall provide a world branch module at
`build_tenants/parallel_hello_world/src/world.js` whose owned responsibility is
returning exactly `world`.

### REQ-T174-PARALLEL-HELLO-004 Composition Fan-In

The product shall provide a composition module at
`build_tenants/parallel_hello_world/src/index.js` that imports the hello and
world branches and exports a composed behavior returning exactly `hello world`.

### REQ-T174-PARALLEL-HELLO-005 Hello Branch Test

The product shall provide a Node.js test at
`build_tenants/parallel_hello_world/test/hello.test.js` that verifies the hello
branch returns exactly `hello`.

### REQ-T174-PARALLEL-HELLO-006 World Branch Test

The product shall provide a Node.js test at
`build_tenants/parallel_hello_world/test/world.test.js` that verifies the world
branch returns exactly `world`.

### REQ-T174-PARALLEL-HELLO-007 Execution Proof

The live proof shall verify the generated product by importing the public module
from the tenant root and observing exactly `hello world`, then running the
branch test files through Node.js test execution.

## Dependency Topology

The hello branch, world branch, hello test branch, and world test branch are
independent construction branches. The composition module depends on the two dev
branch outputs. The execution proof depends on the composed public behavior and
the branch test files.

The SDLC proof must make this topology visible as admitted decomposition,
dependency-map, traversal-selection, and runtime-event evidence. ABG owns any
bounded parallel realization over those branch declarations.

## Generated File Contract

The fixture must not contain these files before traversal:

```text
build_tenants/parallel_hello_world/package.json
build_tenants/parallel_hello_world/src/hello.js
build_tenants/parallel_hello_world/src/world.js
build_tenants/parallel_hello_world/test/hello.test.js
build_tenants/parallel_hello_world/test/world.test.js
build_tenants/parallel_hello_world/src/index.js
```

Traversal must create them as product evidence.
