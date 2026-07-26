# T-281 Structural Definition Key Acceptance

## Exact Basis

- implementation/design checkpoint: `6dbd8a5624ed808cc26fa9badc23485b0944a329`
- accepted design digest: `01022386a2a89e523f11b0ffb363573299d35985240840dc6adac2bfb4d16838`

## Findings

No P0 or P1 finding remains.

The general structural schema cannot instantiate packet APIs; an exact
module-private schema/value witness is required. `definitionKey` is the sole
packet key, and operation identity derives from `definitionKey.operationId`.
Exact `K` survives authority, invocation, successful outcome, and every typed
failure branch for both `variant` and `project_read_case` members. String keys,
broad schemas, and mismatched exact schemas fail TypeScript or runtime
admission.

The schema witness is mechanically derived and equality-checked rather than a
second authored authority. The checkpoint adds no public export, runtime
invocation, handler, catalog row, SDK/CLI path, generated publication, or
package surface. The emitted private declaration remains `export {};`.

## Verification

- T-281 Phase A: `9/9`
- owner contracts: `17/17`
- P1 design type witnesses: passed
- strict host build and ESLint: passed
- Mermaid: `32` files and `96` diagrams
- Prime and DS governance: passed
- `git diff --check`: passed

The named owner-schema gaps remain honest P1 inputs and block family admission,
not design authorization. The earlier full semantic run passed `1807/1811`;
the four failures were the known T-223 generated-publication derivative checks
that remain fenced until the atomic public switch.

## Delegated F_H Ruling

Accept the exact design digest and authorize T-281 P1 implementation within
the private, all-or-nothing constructor boundary. P2 publication and the
atomic hard break remain unauthorized until P1 and downstream dependencies
close.
