# T-281 - Publish The Product-Neutral Installed Public Path

> **Current disposition (2026-07-29):** S06 implementation candidate
> `4f9bf707` is returned evidence, not a closure candidate. Native declaration
> closure exposed a material design ambiguity. Realization is held while
> `M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN.md` completes Design Module Method
> review. S04 and later work remain held.

- id: T-281
- title: Publish the Product-neutral installed public path
- type: feature
- ticket_category: implementation_migration
- status: active
- phase_status: m5_s06_native_contract_design_gate
- review_status: pending_independent_design_review
- proof_status: candidate_design_mechanical_green_pandoc_7_mermaid_3_diff_check
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- parent_owner: T-270
- priority: critical
- implementation_hold: native_contract_design_acceptance
- implementation_hold_effect: >-
    prohibit retained realization until the bounded native-contract Ontology,
    Prime contraction, IACS, module mapping, three views, and design verdict are
    independently accepted; permit only design authoring, mechanical design
    checks, one exact design handoff, independent review, and direct disposition
    while M5 freeze, M6 qualification, M7 release, planned 5.1 observer/tuner
    work, alternate functionality, and broad refactoring remain held
- delivery_phase: M5_after_accepted_s03_and_s05
- change_intent: >-
    Prove one Product-neutral installed public contract through the native SDK,
    native CLI, bounded Codex process shell, and one independently flavored
    downstream Product without copied runtime or core Product-specific
    behavior.
- change_class: design_reframe
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/design/
    M04_PUBLIC_CONTRACT_PUBLICATION_BEHAVIOR_DESIGN.md native declaration
    closure and M05 Section 14 Product verification/resolution boundary
- triaged_at: 2026-07-24
- created_at: 2026-07-16
- updated_at: 2026-07-29
- owner: abiogenesis
- build_tenant: typescript
- source_ticket: T-278
- migration_strategy: inside_out_hard_break
- library_usage: replace
- governing_library: >-
    build_tenants/abiogenesis/typescript/code/src/product and
    build_tenants/abiogenesis/typescript/code/src/public
- accepted_s06_design_commit: 6aaedf8d826f846a11291676413bd35f93df0ef4
- accepted_s06_design_sha256: fb9e71bccf3e98972179df81a7c22ee7dbc266175d6cda1ae8bc5dff875429b3
- returned_s06_candidate: 4f9bf7077579469135963a73b20cac7d9d082fb3
- returned_s06_candidate_tree: 21ffbdaa5dfa52886a3cb29c6f2311f2d25012cc
- current_s06_candidate: none_design_gate_active
- current_s06_design_subject: >-
    build_tenants/abiogenesis/typescript/design/
    M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN.md

## Selected Outcome

```text
same installed public contract
  -> native SDK invocation
  -> native CLI invocation
  -> bounded Codex CLI process delegation
  -> independently packed flavored Product
  -> verified dependency lock
  -> existing catalog publish -> apply -> invoke
  -> one HoG and ABG runtime path
  -> replay-derived typed outcome
```

The developer Product owns its namespace, Module, Program, GraphFunction,
contracts, judgment, semantics provider, declaration application, and
implementation. ABIogenesis owns generic verification, installation,
dependency locking, catalog admission, invocation, HoG traversal, ABG truth,
replay, and public projection.

## Shell Constraint

`abg.codex` is convenience only. It may:

- validate its fixed transport arguments;
- derive or verify the exact installed `abg.cli` executable;
- spawn that CLI with `shell: false`; and
- forward bytes and process status without interpretation.

It may not own or select Product meaning, Program topology, graph traversal,
worker invocation, catalog behavior, ABG events, continuation, result
interpretation, retry, or closure. Removing the shell must leave the literal
installed CLI invocation it delegates to.

## Prime Projection

The accepted S06 design contracts four recurrence families:

| Family | Required projection |
|---|---|
| exact catalog coordinate lookup | one Product-local zero/one/many relation |
| verified installed-module loading | one Product-local content, confinement, and import relation; callers retain semantic validation |
| Product dependency topology | one declared-dependency cycle and compatibility relation used by verification, locking, and admission |
| GTL declaration/publication construction | shared mechanical constructors with Product-owned identities, topology, meaning, and assembly |

The independently flavored Product must consume the shared GTL constructors.
It may not rebuild a third local declaration family. This gate does not
authorize repository-wide cleanup or changes to ABG/HoG authority.

## Native Contract Design Gate

`M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN.md` is the sole candidate design delta
for the returned native-contract boundary. Before code resumes it must
establish:

- package export roots from exact packed `types` exports;
- complete local declaration inventory and native digest;
- private local evidence for unresolved external occurrences;
- one owner-indexed linked TypeScript declaration program at
  `product.resolve`;
- direct required-contract and imported-symbol authority without transitive or
  ambient leakage;
- one canonical native-closure digest inside the existing resolved-lock
  identity;
- the existing `EnvironmentBasis` as the only affected Prime/IACS family;
- private analyzer and occurrence/binding evidence; and
- exact module-owned positives and mutations.

The current uncommitted implementation is a disposable constructability probe.
It cannot select fields, functions, module exports, dependency semantics, or
proof expectations that the accepted design does not require.

## Bounded Review Repair

The replacement cut shall realize this exact authority order:

```text
publisher-authored Product descriptor
  + exact contribution manifest
  + complete public-contract rows
  -> Product verification from packed bytes
  -> complete dependency and compatibility lock
  -> selected Product installation consumes that exact lock
  -> workspace binding consumes the same installed set and lock
  -> catalog admission matches every publication contribution to its exact
     verified contribution-manifest row
```

The contribution manifest is immutable Product truth, not a reference label.
Each row binds its Module, handle, kind, declaration or contract, owning
Product, Program memberships, compatibility requirements, publisher
provenance, and readiness prerequisites. Verification carries the exact
manifest and digest into the resolved lock. Catalog admission may project only
an exact manifest row and may not infer or relabel contribution truth.

Every public-contract row must carry the complete
`REQ-P-PUBLIC-CONTRACTS-003` identity and authority family before it can satisfy
a dependency. A lock resolves from verified artifacts before target
materialization; unresolved, incompatible, ambiguous, cyclic, or incomplete
selection refuses without writing an install target. Every selected install
and the later workspace binding consume one identical lock identity.

The Codex shell resolves both the supplied CLI and its installed sibling, then
spawns the resolved installed sibling. The submitted path is never the
post-check execution path.

The serialized public boundary is singular:

```text
unknown host value
  -> common SDK parser
  -> product.verify
  -> product.resolve
  -> product.install(exact resolution)
  -> remaining public operations
  -> PublicOutcome | PublicInvocationRefusal
```

The CLI delegates to this parser and operation roster. Canonical invocation,
outcome, and refusal schemas publish the same closed contract. Root-operation
state and all verified Product, resolution, lock, install, binding, and
catalog carriers are opaque and deeply immutable after admission.

Publisher-authored packed manifest truth binds the complete normalized
`ModulePublication`, not only contribution metadata. Native contract locators
bind their exact exported symbols. Readiness prerequisites remain independent
from Program membership. The flavored Product consumes the published GTL
constructor contract and `abg.capability.gtl.declare@5`.

The final bounded review repair constrains readiness to the publishing
Product's direct resolved dependency edges. Native export resolution uses the
real TypeScript Program and checker over the exact packed declaration closure;
the pre-install verifier carries its exact compiler and declaration
dependencies inside the Product payload and does not consult an ambient
toolchain. JSON Schema definition pointers traverse both object properties and
canonical array indices before requiring an object or Boolean schema value.

That native declaration paragraph is superseded for realization detail by the
candidate design gate. It remains historical scope evidence until the design
is independently accepted.

## Acceptance

The exact candidate closes S06 only when independent review confirms:

- the native-contract Ontology and design verdicts were independently accepted
  before retained implementation resumed;
- native SDK, native CLI, and the Codex shell preserve one serialized public
  operation contract and deterministic outcome;
- `product.resolve` is a distinct public operation and `product.install`
  consumes only its exact immutable result;
- unknown or malformed SDK and CLI invocations receive the same typed refusal;
- the shell derives or verifies the exact installed CLI, refuses substitution
  and missing paths deterministically, and has no alternate functionality;
- root-operation state and remembered Product authority are opaque and cannot
  be changed after verification or resolution;
- dependencies originate in immutable verified Product declarations and
  cannot be invented by `workspace.bind`;
- contribution and compatibility rows originate in the exact verified
  contribution manifest and cannot be invented by `catalog.admit`;
- the complete publication body, exact native symbols, and independent
  readiness prerequisites remain bound to verified publisher truth;
- canonical invocation, outcome, refusal, catalog, and toolchain schemas agree
  with their native value domains;
- complete public-contract rows, rather than bare IDs, satisfy dependency
  requirements;
- the dependency lock resolves before installation, every selected
  installation consumes it, and workspace binding consumes the same lock;
- the independently packed flavored Product compiles and runs using declared
  package exports only, owns all fixture meaning, and reaches the ordinary
  catalog, HoG, and ABG path;
- no flavored-Product identity, semantic branch, deep import, second catalog,
  resolver, controller, runtime, or event family enters ABIogenesis core;
- all four recurrence contractions remain mutation-sensitive inside their
  accepted Prime carriers;
- accepted S03 and S05, M4, the external Product, catalog negatives, and
  package reproducibility remain green; and
- the reviewed commit, tree, package, inventory, and evidence identities match
  this ticket exactly.

## Non-Closure

S06 remains open if:

- realization resumes before the native-contract design gate is accepted;
- review examines a moving tree or another candidate;
- the Codex shell can launch a substituted executable or interpret Product
  semantics;
- callers can author undeclared Product dependency authority;
- the flavored Product uses source-tree/deep imports or locally rebuilds the
  contracted declaration family;
- ABIogenesis core recognizes the fixture or introduces alternate behavior;
- a green test count substitutes for installed-path or mutation evidence;
- planned 5.1 observer/tuner work, M6 qualification, M7 release, or broad
  recurrence cleanup enters the subject; or
- worker self-review or delegated acceptance substitutes for independent
  review and direct disposition.

## Handoff

Independent reviews returned `4f9bf7077579469135963a73b20cac7d9d082fb3`
because native declaration closure still allowed materially different roots,
digest closure, and external-reference authority. The next subject is one
exact design candidate, not the provisional implementation. After independent
design review, direct F_H either accepts the design or returns one consolidated
design repair. Implementation remains stopped.

Prior X-era operation rosters, intermediate candidates, and checkpoint
narratives remain in repository history and commentary. They carry no active
authority.
