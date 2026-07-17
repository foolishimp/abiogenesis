# T-281 Project Read Wrapper And Registry Design Checkpoint

## Disposition

Accept the project-read request/refusal owner-contract slice at commit
`6e280bb8` and accept the owner schema/registry correlation design at commit
`f6ee8180`, exact design digest
`4a43048c7173d60a36de2eb912b7caa86d4f5ad681641db4974f9a9492391bb7`.

## Code Result

The 27 `project.read` cases now contribute 54 exact request/refusal owner
sources. Structural `project_read_case` identity remains correlated through
the owner authority, locator, schema, and exported native types. Empty
selectors are nominal admitted objects; replay uses only
`fromOrdinal + limit`; strict runtime admission and case-indexed refusals are
preserved.

This slice adds no result schema, handler, runtime route, public operation,
public schema, or central P1 family. The public surface remains 82 schemas and
40 publication assets.

## Design Result

An owner source must declare `none | family_registry`. A family registry is
resolved from the same compiled module and digest basis as its schema. The
resolver mints one opaque schema/registry source carrier, and
`defineNativeContract` accepts that carrier rather than a caller-selected
registry. This removes the second authority found during constructability
review while retaining the existing Consensus registry and all 27 project-read
cases.

## Verification

- canonical T-281 owner-contract gate: 24/24
- strict host build and type-only negative fixtures: pass
- project-read runtime tests: 5/5
- public schemas: 82 verified
- product publication: 40 assets from 1196 immutable payload files
- Mermaid: 96/96
- Prime: 9 tickets, 8 accepted and 1 pending
- focused ESLint and `git diff --check`: pass
- independent code and exact-digest design reviews: accept, no P0/P1

## Next Boundary

Implement the same-owner schema/registry resolver. Then complete the 27
project-read result owner sources and admit the private all-or-nothing P1
family. T-270/T-272 public integration and P2 remain fenced.
