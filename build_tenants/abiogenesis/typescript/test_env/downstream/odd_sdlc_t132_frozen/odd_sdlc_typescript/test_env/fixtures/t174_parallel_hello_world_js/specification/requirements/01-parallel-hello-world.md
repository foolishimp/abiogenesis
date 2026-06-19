# Parallel Hello-World Requirements

**Status**: Active
**Derived From**: `T-174 live fixture`

## REQ-T174-PARALLEL-HELLO-001

The product shall provide one Node.js package manifest at
`build_tenants/parallel_hello_world/package.json`.

## REQ-T174-PARALLEL-HELLO-002

The product shall provide `build_tenants/parallel_hello_world/src/hello.js`
whose owned behavior returns exactly `hello`.

## REQ-T174-PARALLEL-HELLO-003

The product shall provide `build_tenants/parallel_hello_world/src/world.js`
whose owned behavior returns exactly `world`.

## REQ-T174-PARALLEL-HELLO-004

The product shall provide `build_tenants/parallel_hello_world/src/index.js`
that imports the hello and world branches and exports `helloWorld()`.

## REQ-T174-PARALLEL-HELLO-005

The product shall provide `build_tenants/parallel_hello_world/test/hello.test.js`
that verifies the hello branch returns exactly `hello`.

## REQ-T174-PARALLEL-HELLO-006

The product shall provide `build_tenants/parallel_hello_world/test/world.test.js`
that verifies the world branch returns exactly `world`.

## REQ-T174-PARALLEL-HELLO-007

The live proof shall verify the public import returns exactly `hello world` and
shall run both branch test files with Node.js.
