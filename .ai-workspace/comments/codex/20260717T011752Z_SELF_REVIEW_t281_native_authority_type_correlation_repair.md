# T-281 Native Authority And Type-Correlation Repair Self-Review

**Disposition**: bounded repair complete; candidate pending independent
re-review. P1 implementation and P2 publication remain prohibited.

## Basis

- reviewed exact candidate commit:
  `5a95f85845253cecb001baf033bfcb6c0ce93a7e`
- rejected native-key-repair design digest:
  `3cf2bfb274c27d553d9863353af2e8b3c4d177311042b7e9dd324b9f51e45d18`
- repaired candidate digest:
  `83de4ec5419c279ec09bd6e08bf3c67ef04a8b382b252947dccbe6b626e02a04`
- current Ontology file digest:
  `bcbacd4a4b4dd3b5b6db2a3ad281c92bf76a7a889da38562d5b6301e85764615`
- unchanged semantic census: 19 operations, 35 non-`project.read` variants,
  27 `project.read` cases, and 62 definition keys

## Rejection And Repair

The rejected candidate passed inferred payload values such as `RequestOf<K>`
to schema-constrained `NativeContractDefinition<S>` bindings. It also typed
every slot coordinate as the full slot union, allowing a result slot to occupy
the request field for the same definition key. Those relations were not
constructor-safe even though the repaired definition-key family itself was
distributive.

The repair defines separate `RequestSchemaOf<K>`, `ResultSchemaOf<K>`,
`RefusalSchemaOf<K>`, and `NonterminalSchemaOf<K>` selectors. The corresponding
`*Of<K>` aliases are only inferred values. Every resolved or missing slot is
parameterized by one literal slot, and each resolved owner row binds the exact
schema selector for that field.

The strict no-emit witness imports the actual Phase A
`NativeContractDefinition<S>`. It constructs one valid resolved row, proves
the distributive row projection, and consumes compile-fail assertions for a
same-key coordinate permutation, a request/result field permutation, and an
inferred payload value used as either a native definition schema or an owner
binding schema.

## Authority Boundary

The shared rejected M04 design singleton and its `accepted_design_pin` were
removed from the neutral owner-source type and constructor. All seven direct
consumers were repaired: the M03 shared helper, five M04 owner modules, and the
M05 release helper. Neutral owner sources now carry semantic-owner authority,
subject identity, source locator, and schema only. M03 and M05 neither receive
nor import the M04 contract-shape basis. The M04 P1 resolved-slot join alone
models composition of an independently accepted T-281 contract-shape basis.

The pre-existing T-270/T-272 One Surface source still uses a separate local
neutral envelope and `lawBasis`. It contains no M04 contract-shape basis, but
it is not accepted as a second permanent constructor. The design records
`p1_contract_one_surface_owner_projection_not_realized`: an accepted neutral
owner projection must conserve its semantic basis, locator, and schema through
the shared carrier before P1 can emit. This bounded repair does not migrate or
alter T-270/T-272 runtime code.

The Ontology citation was rebound from `039c19d3...` to the current
`bcbacd4a...` file. The change between those bases is only the GOALS
source-digest row; the semantic census and operation behavior rows remain
unchanged.

## Gates

- `build:host`: passed.
- Phase A and focused owner runtime tests: 25/25 passed.
- Phase A, both owner-source type configs, and
  `test:t281:p1-design-types`: passed.
- old shape-basis singleton/type/field/digest source and build scan: absent.
- M03-to-M04 private public-contract import scan: absent.
- Mermaid: 32 files, 96 diagrams, passed; source-set digest
  `sha256:935bd313b6ae814e4cbe078bffe073719264c0d69c4a9f2d6ab8934cd0e14179`.
- Prime: eight accepted designs plus T-281 as the sole pending design, passed.
- DS governance: 19 tickets and 77 comment references, passed.
- `git diff --check`: passed.

Independent re-review remains required. The repaired candidate is not accepted
P1 authority, the named owner-schema and One Surface projection gaps remain
blocking, and no public or runtime output was added.
