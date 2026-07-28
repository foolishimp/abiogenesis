# T-281 - Publish The Product-Neutral Installed Public Path

> **Current disposition (2026-07-28):** Independent review returned S06
> candidate `ac61e080`, tree `90d16730`, for one bounded Product-authority
> repair. Retain its verified shell, Prime-constructor, installed portability,
> and dependency-reducer work. Repair only publisher-owned contribution truth,
> complete public-contract rows, pre-materialization lock consumption, the
> resolved CLI path, and focused proof.

- id: T-281
- title: Publish the Product-neutral installed public path
- type: feature
- ticket_category: implementation_migration
- status: active
- phase_status: m5_s06_bounded_authority_repair
- review_status: changes_requested
- proof_status: mechanical_green_m5_167_m4_26_external_36_prime_4_portability_6
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- parent_owner: T-270
- priority: critical
- implementation_hold: bounded_s06_authority_repair_only
- implementation_hold_effect: >-
    permit only the consolidated contribution-manifest, public-contract,
    pre-install lock, resolved CLI path, and focused proof repair while M5
    freeze, M6 qualification, M7 release, planned 5.1 observer/tuner work,
    alternate functionality, and broad refactoring remain held
- delivery_phase: M5_after_accepted_s03_and_s05
- change_intent: >-
    Prove one Product-neutral installed public contract through the native SDK,
    native CLI, bounded Codex process shell, and one independently flavored
    downstream Product without copied runtime or core Product-specific
    behavior.
- change_class: requirement_reprice
- re_entry_point: >-
    specification/requirements/product/REQ-P-SCENARIOS.md
    REQ-P-SCENARIOS-009 and REQ-P-SCENARIOS-013
- triaged_at: 2026-07-24
- created_at: 2026-07-16
- updated_at: 2026-07-28
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
- current_s06_candidate: ac61e0805b38f5535049bc792865daddd569e434
- current_s06_candidate_tree: 90d16730524f7376c63d056a358e2c20f70da9d5
- current_s06_package_digest: b72284ed9d8ded15e0f6e7c8e2b8f8654e36914e1e2f8367503ddda5446e73bc
- current_s06_package_inventory_digest: bb4d1f71aca8ba387c529669225d0674f6bf15d1e0145c2a91f878a12d816fb8
- current_s06_handoff: >-
    .ai-workspace/comments/codex/
    20260728T010929Z_HANDOFF_t281_s06_portability_repair_candidate.md

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

## Acceptance

The exact candidate closes S06 only when independent review confirms:

- native SDK, native CLI, and the Codex shell preserve one serialized public
  operation contract and deterministic outcome;
- the shell derives or verifies the exact installed CLI, refuses substitution
  and missing paths deterministically, and has no alternate functionality;
- dependencies originate in immutable verified Product declarations and
  cannot be invented by `workspace.bind`;
- contribution and compatibility rows originate in the exact verified
  contribution manifest and cannot be invented by `catalog.admit`;
- complete public-contract rows, rather than bare IDs, satisfy dependency
  requirements;
- the dependency lock resolves before installation, every selected
  installation consumes it, and workspace binding consumes the same lock;
- the independently packed flavored Product compiles and runs using declared
  package exports only, owns all fixture meaning, and reaches the ordinary
  catalog, HoG, and ABG path;
- no flavored-Product identity, semantic branch, deep import, second catalog,
  resolver, controller, runtime, or event family enters ABIogenesis core;
- all four Prime relations remain mutation-sensitive;
- accepted S03 and S05, M4, the external Product, catalog negatives, and
  package reproducibility remain green; and
- the reviewed commit, tree, package, inventory, and evidence identities match
  this ticket exactly.

## Non-Closure

S06 remains open if:

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

Independent reviewers inspected
`ac61e0805b38f5535049bc792865daddd569e434` through the named handoff. Their
consolidated findings authorize the bounded repair above. The worker freezes
one replacement subject, publishes one exact handoff, and stops. Direct F_H
acceptance closes S06.

Prior X-era operation rosters, intermediate candidates, and checkpoint
narratives remain in repository history and commentary. They carry no active
authority.
