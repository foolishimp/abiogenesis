# ADR-002 Implementation Design Surface

**Status**: Active
**Derived From**: `T-174 live fixture`

- Module: parallel_hello_world
- language: JavaScript
- package manager/build tool: node
- Public boundary: src/index.js exports helloWorld

## Product File Targets

| Path | Role | Owner Component |
| --- | --- | --- |
| package.json | build_config | package |
| src/hello.js | source | dev/hello |
| src/world.js | source | dev/world |
| test/hello.test.js | test | test/hello |
| test/world.test.js | test | test/world |
| src/index.js | source | fan-in |

## Component Topology

| Component Ref | Module Name | Public Boundary | Depends On |
| --- | --- | --- | --- |
| dev/hello | hello_branch | hello() returns hello | none |
| dev/world | world_branch | world() returns world | none |
| test/hello | hello_branch_test | Node test for hello branch | none |
| test/world | world_branch_test | Node test for world branch | none |
| fan-in | composition | helloWorld() returns hello world | dev/hello, dev/world, test/hello, test/world |

## Component Realization Targets

| Component Ref | Module Name | Target Path | Public Boundary |
| --- | --- | --- | --- |
| dev/hello | hello_branch | src/hello.js | hello() returns hello |
| dev/world | world_branch | src/world.js | world() returns world |
| test/hello | hello_branch_test | test/hello.test.js | Node test for hello branch |
| test/world | world_branch_test | test/world.test.js | Node test for world branch |
| fan-in | composition | src/index.js | helloWorld() returns hello world |

## Requirement Lineage

| Requirement ID | Component Ref | Product File Target |
| --- | --- | --- |
| REQ-T174-PARALLEL-HELLO-001 | package | package.json |
| REQ-T174-PARALLEL-HELLO-002 | dev/hello | src/hello.js |
| REQ-T174-PARALLEL-HELLO-003 | dev/world | src/world.js |
| REQ-T174-PARALLEL-HELLO-004 | fan-in | src/index.js |
| REQ-T174-PARALLEL-HELLO-005 | test/hello | test/hello.test.js |
| REQ-T174-PARALLEL-HELLO-006 | test/world | test/world.test.js |
| REQ-T174-PARALLEL-HELLO-007 | fan-in | src/index.js |
