# T-281 Structural Definition-Key Repair Self-Review

**Disposition**: bounded repair complete; candidate pending independent
re-review. P1 implementation and P2 publication remain prohibited.

## Basis

- repair base after independently accepted T-274A closure:
  `53ef4f4aa42771aec44382f293db99290eece21d`
- rejected native-authority-and-type-correlation design digest:
  `83de4ec5419c279ec09bd6e08bf3c67ef04a8b382b252947dccbe6b626e02a04`
- repaired candidate digest:
  `01022386a2a89e523f11b0ffb363573299d35985240840dc6adac2bfb4d16838`
- unchanged semantic census: 19 operations, 35 non-`project.read` variants,
  27 `project.read` cases, and 62 definition keys

## Rejection And Repair

The rejected candidate's P1 type algebra used structural keys, but its actual
Phase A packet APIs still constrained `K extends string` and built
`v.literal(operationKey)`. `InvocationAuthority` also carried both
`operationKey` and `definitionKey`, allowing two fields to claim the same
operation authority. Its type witness did not instantiate the actual authority,
invocation, and outcome APIs or cover the `project_read_case` branch.

The repair defines one strict readonly structural `DefinitionKey` schema as a
closed `variant | project_read_case` discriminated union. An exact schema/value
witness derives from each nested-family structural value by materializing
literal operation, member-kind, and variant or case fields and privately
carrying the canonical structural value. There is no string overload. The API
generics accept only this exact branded schema family; the general structural
schema cannot instantiate a packet. One literal structural key is preserved
through authority construction/admission, invocation construction/admission,
outcome construction/admission, and typed outcome failure.

Every key admission first parses the general strict structural schema, then the
exact literal schema, and finally requires canonical structural equality.
`definitionKey` is the sole packet key. `operationId` derives only from
`definitionKey.operationId`; `operationKey` was removed from authority,
invocation, outcome, and failure carriers. A private string key now fails both
the compile-time witness and runtime admission with no compatibility path. A
different exact schema/value pair and the broad union schema also fail at the
compile-time API boundary.

The strict no-emit witness selects `workspace.create(clean)` and
`project.read(ticket_consensus)` keys from a nested operation/member proof
family and sends both through the actual Phase A authority, invocation, and
outcome APIs. Type equalities prove that each success and failure branch retains
its exact structural key. Runtime tests cover exact failures for both branches,
duplicate-key absence, canonical mismatch classification, and the negative
legacy fixture.

Independent diff audit found and rejected an intermediate implementation in
which the broad union schema still satisfied the API constraint and typed
failure branches widened to the full `DefinitionKey` union. The final repair
adds the exact-schema brand, broad-schema and mismatched-schema compile-fail
witnesses, a key-parameterized failure schema/helper, and failure-branch type
equalities for both structural branches.

## Boundary

The repair adds no P1 definition family, public schema, catalog row, package
export, SDK/CLI path, handler call, filesystem effect, runtime invocation, or
AF-24 publication. The private module's emitted declaration remains
`export {};`. Independently accepted T-274A supplies only the compatible
`ticket_consensus` result coordinate; T-281 still owns the unrealized generic
`project.read` request/refusal wrapper and absent non-terminal relation. All
other named owner-schema and One Surface projection gaps remain explicit.

## Gates

- strict host build and full host ESLint: passed;
- Phase A runtime/type gate: 9/9 passed;
- owner-contract runtime gates: 17/17 passed;
- Phase A, both owner-source, and P1 design type configurations: passed;
- static exact design census: 19 operations, 35 non-read variants, 27 read
  cases, and 62 definition keys;
- full semantic regression: 1807/1811 passed; the only four failures are the
  expected T-223 packed-publication derivatives fenced by the unchanged stale
  `product-toolchain-manifest.json`; all T-281 tests passed;
- private-source scan: no `operationKey`, unchecked cast, filesystem import,
  handler call, runtime invocation, or public operation implementation;
- package export, public-index, schema, publication, SDK, and CLI diff: empty;
- emitted private declaration: `export {};`;
- Mermaid: 32 files, 96 diagrams, passed; source-set digest
  `sha256:f3ef7bc6af6ffb34d7a592fbb441c5eafd4c93d7c90df22b9df30ccbe36449b6`;
- Prime: eight accepted designs plus T-281 as the sole pending design, passed;
- DS governance: passed;
- `git diff --check`: passed.

Independent re-review remains required. The repaired design candidate is not
accepted P1 authority, the named gaps remain blocking, and no public or runtime
output was added.
