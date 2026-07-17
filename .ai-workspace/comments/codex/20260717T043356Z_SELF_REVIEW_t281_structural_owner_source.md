# Self Review - T-281 Structural Owner Source

## Scope

Review commit `d4ce8abf` against the accepted project-read owner design digest
`6f7a6d9a40d593d0ff687b8dc94af1cbca12213266ccd5715e7163595ad58019`.

## Result

Accepted. The implementation adds one neutral structural owner-source
constructor and retains the prior variant helper as a derived adapter. Exact
`DefinitionKey`, slot, schema, identity, and locator truth remain correlated.

Both constructor paths reject literal fake `project.read` variants in the
type system. Runtime admission rejects the same invalid form from broad,
untyped, or cast callers, plus mixed variant/case keys and mismatched locator
case or slot tails. The sole open generic M03 wrapper propagates the neutral
non-read type relation without importing M04 or authoring an operation roster.

No semantic owner moved. No handler, event, runtime route, public schema,
catalog row, SDK/CLI output, package export, or compatibility surface changed.

## Verification

- strict host build: pass
- T-281 owner type and runtime gates: 19/19
- T-270/T-272 neutral contracts: 9/9
- Prime gate: 9/9
- focused ESLint: pass
- `git diff --check`: pass
- independent review: accept, no P0/P1 finding

## Next Boundary

Implement the 27 project-read request/result/refusal owner relations through
the accepted ten Prime result families. Central P1 admission remains blocked
until all 81 slots resolve, and P2 remains fenced.
