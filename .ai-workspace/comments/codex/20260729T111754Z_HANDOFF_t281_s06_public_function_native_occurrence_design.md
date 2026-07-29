# T-281 S06 Public-Function And Native-Occurrence Design Handoff

## Purpose

Review one exact S06 design re-entry. Realization candidate `4953508d` is
returned evidence. The worker changed no realization file and issues no
semantic verdict over this design.

The design closes two relations before code resumes:

1. the complete 5.0 public-function algebra and all of its projections; and
2. checker-derived native external occurrences indexed by source contract and
   conserved one-to-one through binding.

Prime compression, S04, M5 freeze, M6, and M7 remain held.

## Exact Subject

| Identity | Value |
|---|---|
| design commit | `9fb14e6859af51e97789a599ad0fae6c367c34b3` |
| tree | `919e0a7b09c99a1fe7a246a6c46e729313eebb30` |
| parent | `54c14dee32c284a95e6eba3e312b2e2ce285a5f8` |
| design file | `build_tenants/abiogenesis/typescript/design/M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md` |
| design SHA-256 | `d5435631cb4fcba1bec7a3e0df61eb00fddf98957e4dc1c73209086caa8e6cd3` |

The accepted native-closure basis remains:

| Identity | Value |
|---|---|
| accepted design commit | `4f80f84a826de86b4cfb4d9fec3baff428dcb44a` |
| accepted design tree | `7070dca7d0f2ca90374b525faa60d5b810488763` |
| accepted design SHA-256 | `ab44417157853490f4a3d8f9055b5eca8c295fd16f9615020b70e327f57c09fe` |

Returned realization evidence:

| Identity | Value |
|---|---|
| realization commit | `4953508de83ab6d6c65dbb81e5407ccb539e44e6` |
| realization tree | `cd8bf69d79014e29e45bda52f9a785907eab8e74` |
| package SHA-256 | `287263398b31ea39b94cd140071f00b3ef372df6f4cdc6df06698ac67bb0673b` |
| inventory SHA-256 | `2cf73f22cfdd1cc7491e8e3eaaa71fd18478dc3154afeb6e4a4e59601a8dc5d7` |

Review the design blob at the exact design commit. The later status/evidence
child does not alter it.

## Why Design Re-Entry Was Required

Independent review of `4953508d` found three P1 families:

- an 11-operation implementation subset could be mistaken for the complete
  18-operation 5.0 authority;
- native types, unknown-value parser, JSON Schema, runtime admission, SDK, CLI,
  result, and refusal meanings remained separate contract surfaces; and
- native linking still derived authority from physical syntax occurrences and
  declaration roots instead of source-contract-indexed checker meaning.

These are design choices. Patching individual counterexamples would leave
materially different systems lawful.

## Resolved Constraint Network

The design selects:

- exactly 18 public operation identities;
- exactly 56 operation-definition keys;
- exactly 24 closed `project.read` definition members;
- one owner-native strict schema source projecting TypeScript types, the
  unknown-value parser, JSON Schema, SDK, and CLI;
- operation-indexed request, result, refusal, non-terminal, authority, effect,
  workspace-binding, capability, event, and adapter contracts;
- structural all-or-none, exactly-one, and ref/digest relations;
- typed outcomes rather than generic `JsonValue`;
- one complete operation-contract packet and deterministic family identity;
- one `product.verify` operation with disjoint packed-artifact and
  installed-artifact request members, where only the installed member consumes
  an exact lock and verification never constructs one;
- `ContractExternalOccurrence` as a checker-derived semantic occurrence whose
  identity includes the exact source contract;
- physical declaration relations as subordinate evidence, never binding keys;
- checker ownership of namespace, star, type-query, value, and type meaning;
  and
- exact one-to-one conservation between contract occurrences and admitted
  bindings.

No new public operation, catalog, runtime, compiler/lowering carrier, Prime
family, IACS family, controller, or event authority is introduced.

## Design Module Method Evidence

The exact subject contains:

- affected Ontology entities, functions, authority relations, and lifecycle;
- whole-family Prime contraction and irreducibility tests;
- IACS mapping under the existing `EnvironmentBasis`;
- singular abstract module and interface placement;
- domain, sequence, and lifecycle Mermaid views;
- cross-view axioms and explicit evaluation;
- operational lifecycle and constructability proof;
- realization projection constraints; and
- focused positive, mutation, conservation, and non-reproduction proofs.

## Mechanical Readiness

The worker verified:

- Pandoc parse: pass;
- Mermaid discovery and render: `3/3`;
- public operation roster: `18`;
- operation-definition keys: `56`;
- `project.read` members: `24`;
- `git diff --check`: pass; and
- realization files changed by the design commit: `0`.

These are readiness checks, not semantic acceptance.

## Review Questions

1. Is the 18-operation, 56-definition-key family complete against active 5.0
   requirements, with no provisional subset promoted as complete authority?
2. Does one owner-native definition source determine every native, serialized,
   parser, SDK, CLI, runtime, publication, result, refusal, and replay
   projection without a second contract-meaning surface?
3. Are all relational field laws structural and falsifiable?
4. Is `product.verify` one coherent operation without erasing the packed versus
   installed lock distinction?
5. Does every native external semantic occurrence include its exact source
   contract and derive from the linked TypeScript checker?
6. Can namespace, star, type-query, value, or type use bypass checker meaning
   or contract ownership?
7. Does every contract occurrence bind exactly once, with no raw physical
   occurrence becoming authority?
8. Do Ontology, Prime, IACS, modules, all three views, lifecycle, and proof
   describe one constructible system?

If a material choice remains for code, return this exact design. If the
constraint network is complete, direct acceptance may authorize one bounded
realization pass against its realization section.
