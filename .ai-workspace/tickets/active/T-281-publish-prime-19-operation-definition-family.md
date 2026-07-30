# T-281 - Publish The Product-Neutral Installed Public Path

> **Current disposition (2026-07-31):** S06 realization candidate `4953508d`
> remains returned evidence. Accepted native-closure design `4f80f84a` remains
> the basis. Accepted supplemental parent `2bb7b594` contains a circular
> definition/family/Product-catalog digest relation. Candidate `5770755a`
> repairs the cycle but incorrectly replaces the existing catalog and is
> returned evidence. Catalog-preserving candidate `458ce3c2`, tree
> `b5c7a1eb`, is also returned. Nested catalog-authority replacement
> `356aa6a2`, tree `4af5ada4`, is returned because its 44-row residual is
> only one required publication subset. Candidate `844df3fc`, tree `c48e9df9`,
> is returned because it pulls later T-270 publication assurance into S06
> without a complete satisfaction relation. Bounded replacement `8dc59264`,
> tree `77a7ee37`, is frozen for independent delta review.
> Realization, Prime compression, S04, and later work remain held.

- id: T-281
- title: Publish the Product-neutral installed public path
- type: feature
- ticket_category: implementation_migration
- status: active
- phase_status: m5_s06_bounded_public_refusal_design_review
- review_status: s06_bounded_design_delta_review_pending
- proof_status: s06_bounded_design_candidate_frozen
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- parent_owner: T-270
- priority: critical
- implementation_hold: s06_bounded_public_refusal_design_delta_review
- implementation_hold_effect: >-
    review exact candidate 8dc59264 only; prohibit realization, recursive
    design revision, Prime compression, S04, unified M5 freeze, M6
    qualification, M7 release, alternate functionality, and broad refactoring
- delivery_phase: M5_after_accepted_s03_and_s05
- change_intent: >-
    Prove one Product-neutral installed public contract through the native SDK,
    native CLI, bounded Codex process shell, and one independently flavored
    downstream Product without copied runtime or core Product-specific
    behavior.
- change_class: requirement_reprice_plus_design_reframe
- re_entry_point: >-
    REQ-P-POLICY-049 plus build_tenants/abiogenesis/typescript/design/
    M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md
- triaged_at: 2026-07-24
- created_at: 2026-07-16
- updated_at: 2026-07-31
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
- returned_s06_candidate: 4953508de83ab6d6c65dbb81e5407ccb539e44e6
- returned_s06_candidate_tree: cd8bf69d79014e29e45bda52f9a785907eab8e74
- returned_s06_package_sha256: 287263398b31ea39b94cd140071f00b3ef372df6f4cdc6df06698ac67bb0673b
- returned_s06_package_inventory_sha256: 2cf73f22cfdd1cc7491e8e3eaaa71fd18478dc3154afeb6e4a4e59601a8dc5d7
- returned_s06_handoff: >-
    .ai-workspace/comments/codex/
    20260729T091138Z_HANDOFF_t281_s06_public_native_contract_candidate.md
- returned_s06_design_candidate: b645595c16d23e98c7f65b958fcdf3e206ad3893
- returned_s06_design_candidate_tree: 130af56655ec46ec26ff66dd6a4f2bbe99d8bed8
- returned_s06_design_sha256: 815369932469eb6c833417116c63d130b0e9629b9721a0f8d429e693e0e69507
- returned_s06_supplemental_design_candidate: 9fb14e6859af51e97789a599ad0fae6c367c34b3
- returned_s06_supplemental_design_tree: 919e0a7b09c99a1fe7a246a6c46e729313eebb30
- returned_s06_supplemental_design_sha256: d5435631cb4fcba1bec7a3e0df61eb00fddf98957e4dc1c73209086caa8e6cd3
- returned_s06_supplemental_design_handoff: >-
    .ai-workspace/comments/codex/
    20260729T111754Z_HANDOFF_t281_s06_public_function_native_occurrence_design.md
- returned_s06_public_native_design_candidate: 8eb7564c04673cab26d938ad9bb2b026c1597d15
- returned_s06_public_native_design_tree: 9c753f86727fc1bc7fe0836f517d5157aa5de7d8
- returned_s06_public_native_design_sha256: 5c3e985c1895abd339e2ecda8c0617cc9a147caf0e3c86233f640ddde0418d35
- returned_s06_digest_design_candidate: 5770755af7cc19c55d1f526c4e34e482f0ba7df5
- returned_s06_digest_design_tree: 77842794bdafb25b48f3ef1554fd6d47e002a456
- returned_s06_digest_design_sha256: 163da0eaa3b91505d896dfeac745ff31474484585fe3f2d78d185073a2d98a0f
- returned_s06_catalog_design_candidate: 458ce3c285ab9161e90a9d6cefb3eeb9b94f4257
- returned_s06_catalog_design_tree: b5c7a1ebc5385f5b0af68bd28fd80b806b36860f
- returned_s06_catalog_design_sha256: beab3ee572c665c8f63ec7c3a8f8d44fba31cf513f7b966fde891d64b6dad1d7
- returned_s06_nested_catalog_design_candidate: 356aa6a24fbfaac32c9ce2bb4fbc8b78f59bcd92
- returned_s06_nested_catalog_design_tree: 4af5ada4d1487d4e63b5ae55b4f55be522f3ae3c
- returned_s06_nested_catalog_design_sha256: 3a65c0f1b8e5c15011197f48fb61e730c16dac45ec160077139eb42fc758e49c
- returned_s06_full_closure_design_candidate: 844df3fcbccaef97e27cc27264ad2622cea6e889
- returned_s06_full_closure_design_tree: c48e9df90bf125ac08d2c4b9183a7622d966859a
- returned_s06_full_closure_design_sha256: 5da0de37d0eba0143f3562eaa7dfcb5caa323ab17f075c4b0fdc2aa88349adba
- current_s06_design_candidate: 8dc59264e8aa32e606c925f6a933ba3131e41bde
- current_s06_design_candidate_tree: 77a7ee374be4375c1b67d6cd9730dab6f04007e2
- current_s06_design_sha256: 25c5578552e0f4b47bf6f1711f579de3ca9ed7cd04b17b01c0bcaccba1dd710d
- current_s06_requirement_sha256: 26eb36ca6701ac9970b2e4d63b1125a48353cf553c37addbb85c9586e9204ad7
- current_s06_design_subject_aggregate_sha256: d79fe1d8db6649b7ae414a98b7e5d1532fd2405515839dd7508f15c68f57f132
- accepted_s06_public_native_design_commit: 2bb7b594920b1b126a6d314ed7bb39dabd211823
- accepted_s06_public_native_design_tree: c57c237e8c5950fb85552d19203df4cd526cd7b7
- accepted_s06_public_native_design_sha256: ae3a775af039bcc95b99b6f27dabe8c166e78405d3d42b1cd58f3629a9e55876
- accepted_s06_public_native_design_decision: >-
    .ai-workspace/comments/codex/
    20260729T171254Z_DECISION_accept_s06_contracted_design.md
- accepted_s06_native_contract_design_commit: 4f80f84a826de86b4cfb4d9fec3baff428dcb44a
- accepted_s06_native_contract_design_tree: 7070dca7d0f2ca90374b525faa60d5b810488763
- accepted_s06_native_contract_design_sha256: ab44417157853490f4a3d8f9055b5eca8c295fd16f9615020b70e327f57c09fe
- current_s06_design_subject: >-
    build_tenants/abiogenesis/typescript/design/
    M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md
- returned_s06_design_handoff: >-
    .ai-workspace/comments/codex/
    20260728T161212Z_HANDOFF_t281_s06_native_contract_design_candidate.md
- current_s06_design_handoff: >-
    .ai-workspace/comments/codex/
    20260730T141754Z_HANDOFF_t281_s06_bounded_public_refusal_design.md

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

## Replacement Design Gate

`M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md` is the sole
candidate design delta for the returned realization boundary. It supplements,
and does not replace, accepted
`M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN.md`. Before code resumes independent
review must confirm:

- the complete 5.0 family contains exactly 18 operation identities, 56
  operation-definition keys, and the closed 24-member `project.read` family;
- the parameterized source map fixes every key's owner schema symbol, fields,
  domains, defaults, metadata, and exact owner port;
- the common catalog, operation-row, invocation, outcome, and
  projection-refusal carriers are singular and constructable;
- indexed admission refusal is distinct from owner refusal, and every failed
  PFC-F08 merge projects one catalog-binding refusal;
- the exact 44-row S06 diagnostic is not a release-closure predicate and later
  T-270 publication completion remains outside this design;
- F01 emits source-contract-indexed pending selectors only, while F02's linked
  checker alone derives semantic occurrences, canonical targets, target
  contracts, and exact bindings;
- relation form and semantic use are orthogonal, target identity is stable,
  and A-to-B-to-C authority re-anchors at each admitted Product contract;
- clarified `REQ-P-POLICY-049` preserves packed verify, installed verify,
  linked resolve, and install as distinct authority stages;
- the existing `EnvironmentBasis` remains the sole affected Prime/IACS family;
  and
- the Ontology, Prime contraction, module mapping, three semantic views,
  lifecycle, cross-view axioms, and falsification proof agree.

Returned realization candidate `4953508d` is evidence only. No retained
realization may select fields, functions, module exports, dependency
semantics, or proof expectations absent from the accepted design.

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

The next exact realization can close S06 only after this design is accepted
and independent realization review confirms:

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

- realization resumes before the replacement design gate is accepted;
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
digest closure, and external-reference authority. Review then returned design
candidate `b645595c16d23e98c7f65b958fcdf3e206ad3893` for three bounded choices:
proposal versus admission, contract-to-symbol ownership, and cross-Product
augmentation. They are repaired together and accepted at candidate
`4f80f84a826de86b4cfb4d9fec3baff428dcb44a`, tree
`7070dca7d0f2ca90374b525faa60d5b810488763`. Realization candidate
`4953508de83ab6d6c65dbb81e5407ccb539e44e6`, tree
`cd8bf69d79014e29e45bda52f9a785907eab8e74`, is returned because the complete
public-function family and contract-indexed native occurrence relation were
not yet singular. Design candidate
`9fb14e6859af51e97789a599ad0fae6c367c34b3`, tree
`919e0a7b09c99a1fe7a246a6c46e729313eebb30`, was returned because its 56-key
owner contracts, common public carriers, native phase split, occurrence/lock
identity, and packed/installed verification relation remained incomplete.
Those findings were first repaired at candidate
`8eb7564c04673cab26d938ad9bb2b026c1597d15`, tree
`9c753f86727fc1bc7fe0836f517d5157aa5de7d8`, which review returned for
constructable invocation authority, verified resolve basis, complete
owner/version/authority coordinates, and three native-occurrence identity
relations. Contracted replacement `2bb7b594920b1b126a6d314ed7bb39dabd211823`,
tree `c57c237e8c5950fb85552d19203df4cd526cd7b7`, repairs those relations through
owner references without reproducing all payload families. Exact realization
then exposed one circular digest relation in that accepted design. Candidate
`5770755a`, tree `77842794`, repairs the cycle but replaces the complete flat
catalog and is returned evidence. Candidate
`458ce3c285ab9161e90a9d6cefb3eeb9b94f4257`, tree
`b5c7a1ebc5385f5b0af68bd28fd80b806b36860f`, preserves the carrier but is
returned because its owner-contract join is unsatisfiable, its complete-catalog
basis does not exist, and its pre-family witness digest is undefined.
Replacement candidate
`356aa6a24fbfaac32c9ce2bb4fbc8b78f59bcd92`, tree
`4af5ada4d1487d4e63b5ae55b4f55be522f3ae3c`, derives the complete nested join
from family truth, exposes the mandatory catalog gap for T-270 completion
before unified M5, and removes that witness digest. It is returned because the
44-row residual covers only the schema, vocabulary, and corpus subset.
Full-closure replacement
`844df3fcbccaef97e27cc27264ad2622cea6e889`, tree
`c48e9df90bf125ac08d2c4b9183a7622d966859a`, is returned because its later
publication-closure evaluator is both outside S06 and underdefined. Bounded
replacement `8dc59264e8aa32e606c925f6a933ba3131e41bde`, tree
`77a7ee374be4375c1b67d6cd9730dab6f04007e2`, retains only the 44-row S06
diagnostic and repairs the affected refusal projections. That exact delta
receives one independent review; the worker does not realize, recursively
review, or refreeze it.

Prior X-era operation rosters, intermediate candidates, and checkpoint
narratives remain in repository history and commentary. They carry no active
authority.
