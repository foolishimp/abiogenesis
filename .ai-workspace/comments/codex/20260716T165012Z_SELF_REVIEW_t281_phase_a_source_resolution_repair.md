# Self-Review - T-281 Phase A Source-Resolution Repair

## Disposition

The bounded repair is implementation-complete and ready for independent
re-review. T-281 remains active; Phase A acceptance is not claimed, and P1/P2
remain fenced.

## Corrected Boundary

- `defineNativeContract` accepts only an opaque typed source minted by the
  fixed-root `semantic_build` resolver. The resolver accepts a frozen typed
  owner-source row and requires its schema to be the identical compiled member,
  preserving `S` without trusting a caller pairing.
- Resolution walks own data properties to one recursively frozen Valibot
  schema. The compiled owner-module bytes and locator enter the witness basis.
- The process claims a module URL's byte digest before `import()` yields and
  refuses any later byte change, including overlap with an in-flight import.
- Public contract, schema, and projection digests remain equal and depend only
  on projected schema bytes. Source semantics affect only the private witness.
- Neutral M03 locators terminate at `schema`; M03 imports no M04 carrier.
- Consensus admission uses the shared `freezeNativeValue` mechanism.
- T-281 owns the generic `project.read` wrapper. T-274A supplies only the exact
  Consensus source/result coordinates and does not close P1.

## Negative Proof

The focused lanes reject a raw schema beside an opaque source, a forged source
carrier, a mismatched typed owner row, traversal and absolute paths, missing or
inherited members, a locator ending before a schema, an unfrozen schema,
lookalike native constructors, and changed module bytes. A native type proof
conserves the exact schema and inferred value through resolution and definition.
Opposite family-owned predicates produce equal public
projection digests but different source-basis and witness digests, while real
native admission produces opposite results.

## Gates

- full semantic: `1767/1767`;
- GTL law: `82/82`;
- T-223 source-blind publication: `70/70`;
- focused: T-281 `8/8`, T-274A `7/7`, neutral owner contracts `9/9`;
- strict host and type builds: passed;
- public schemas: `82`; publication assets: `40`; immutable payload files:
  `1143`;
- design: 32 files and 96 Mermaid diagrams; Prime and governance: passed;
- package dry run and `git diff --check`: passed.

Independent re-review must bind the exact committed repair span before Phase A
can close. No P1 constructor, public operation, handler, SDK, CLI, or runtime
work is included.
