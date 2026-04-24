# B-021 Reprice The Public Runtime Advancement And Observation Contract Around `gen-start` And `gen-gaps`

- id: B-021
- title: Reprice the public runtime advancement and observation contract so human truth is `gen-start` plus `gen-gaps`
- type: feature
- status: completed
- goal: operator-command-unification
- change_intent: Ratify one public runtime advancement and observation contract. `gen-gaps` and `gen-start` are named composition truth owned by intent/product/policy surfaces. `gen-start` is the only public advancement command and accepts one product-owned request grammar expressed as `scope + target + until`. Literal CLI spellings, service routes, and adapter-specific entrypoints are build/adapter binding surfaces beneath that named composition truth. `gen-iterate` and `run-status` may remain only as internal or explicitly diagnostic realization detail and must be removed from live co-equal public command surfaces. This ticket does not attempt to collapse the entire CLI, including administrative or qualification commands, into two verbs.
- change_class: intent_reprice
- re_entry_point: intent
- priority: high
- intake_source: operator UX direction 2026-04-19 after ABG B-018 review
- dependencies: none
- affected_boundary: `INTENT.md`, `PRODUCT.md`, product policy requirements, README/help surfaces, installed runtime docs, named service composition surfaces, CLI/operator binding design
- triaged_at: 2026-04-19
- created_at: 2026-04-19
- activated_at: 2026-04-19
- completed_at: 2026-04-19
- updated_at: 2026-04-24
- authoritative_contract: one public advancement/observation contract with named compositions `gen-start` and `gen-gaps`; `gen-start` accepts `scope + target + until`; lower-level hooks remain below that public contract
- superseded_surface: the public three-command story (`gen-start` / `gen-iterate` / `gen-gaps`), co-equal `run-status`, and any surface that teaches literal CLI spellings as operator truth
- closure_law: intent, product, policy, docs, adapter help, and installed scaffolds all teach the same public operator contract and no superseded surface remains authoritative
- producer_set: `INTENT.md`, `PRODUCT.md`, `REQ-P-POLICY.md`, `README.md`, `build_tenants/abiogenesis/python/README.md`, `cli_adapter.py`, `services.py`, `app_bootstrap.py`, `gen-install.py`
- consumer_set: human operators, installed app bootstrap surfaces, downstream domain/operator docs, CLI help, install proof
- derived_projections: top-level CLI help, repo README examples, installed-line README/examples, scaffold narration, install tests
- old_path_classification: `gen-iterate`=`re-authorize` as internal diagnostic hook; `run-status`=`re-authorize` as diagnostic projection; old public three-command story=`remove`; literal binding spellings as public truth=`replace`

## Context

Live intent still states that abiogenesis provides:

- `gen-start`
- `gen-iterate`
- `gen-gaps`

That is not the operator contract the current work is trying to establish.

The intended public advancement/observation surface is:

- `gen-gaps`
  - observe current truth
- `gen-start`
  - advance current truth through one public request grammar:
    - `scope`
    - `target`
    - `until`

Any lower-level traversal or live-status primitive may still exist
structurally, but it must sit below that public operator contract rather than
beside it as a co-equal human command.

This ticket is about the human advancement/observation contract only. It does
not claim that the entire shipped CLI has only two subcommands; administrative,
projection-ingest, and qualification commands may still exist as separate
adapter/build surfaces.

The current code also mixes two different layers:

- named composition truth such as `gen-start` and `gen-gaps`
- literal binding spellings such as CLI subcommands, service routes, and entry
  point wrappers

Those are not the same thing and must not remain collapsed.

Intent/product/policy ratify named compositions such as `gen-start` and
`gen-gaps`. Adapter/build surfaces own literal spellings such as
`python -m genesis start`, `genesis start`, and `/gen-start`.

If that change is real, it must be ratified in live product/policy surfaces
first, with leaked contradictory intent detail cleaned up as part of the same
wave. Otherwise parser/help cleanup would create a shadow contract.

The public command contract is product/operator behavior, not project
direction. The fact that `INTENT.md` currently leaks the three-command model is
itself drift that must be cleaned up as part of the product reprice.

## Problem Statement

ABG currently carries a split human-facing advancement surface in live intent,
service narration, and operator-facing docs.

That creates avoidable drift:

- public operator truth is harder to explain than necessary
- command semantics are split across multiple verbs rather than one entrypoint
- product/docs can diverge from intent if this is treated as a local parser
  cleanup only

## Required Direction

1. Ratify the public runtime advancement/observation contract in live
   product/policy surfaces:
   - `gen-gaps` is the public observation command
   - `gen-start` is the public advancement command
   - those names are the public named-composition truth
2. Ratify the public `gen-start` request grammar as:
   - `scope`
   - `target`
   - `until`
3. Explicitly separate named-composition truth from literal adapter spellings:
   - intent/product/policy surfaces ratify only the named composition truth
   - CLI spellings such as `genesis start`
   - module entry spellings such as `python -m genesis start`
   - service routes such as `/gen-start`
   - project entrypoints or scripts
   must be treated as delivery bindings beneath the same public command truth
   and owned by adapter/build realization surfaces rather than constitutional
   operator law
4. Remove `gen-iterate` and `run-status` from live co-equal public command
   language
5. If lower-level traversal or status primitives are still needed
   structurally, treat them as internal or explicitly diagnostic realization
   detail rather than public operator truth
6. Reprice `INTENT.md` so it no longer carries a contradictory product-shaped
   three-command statement
7. Only after ratification, update CLI help, README, install-time docs, and
   product-facing guidance to match the same contract

## Acceptance

- live product/operator-facing surfaces describe the human command contract in
  terms of `gen-start` and `gen-gaps`
- the public `gen-start` contract is expressed as `scope + target + until`
- named composition truth is distinguished explicitly from literal CLI or
  service spellings
- no intent/product/policy surface ratifies concrete adapter spelling as the
  public operator truth
- the ticket scope is limited to advancement/observation contract truth and
  does not implicitly collapse unrelated administrative or qualification CLI
  commands
- `INTENT.md` no longer contradicts the ratified product/operator contract
- `gen-iterate` and `run-status` are no longer taught as part of the public
  human workflow
- no public surface contradicts the ratified product/operator contract
- any retained lower-level traversal or status primitive is clearly below the
  public operator contract rather than co-equal with it

## Post-Closure Trace Note

On 2026-04-24, intent/product/policy wording was tightened to say the primary
operator UX is interactive work with an agentic coder CLI surface where an
operator defines or refines assets, runs `gen-start`, receives one truthful
stop or gap seam, works with the agent to remove the ambiguity or roadblock,
runs `gen-gaps`, and runs `gen-start` again.

This completed ticket is the closed source anchor for that loop's public named
composition truth:

- `gen-start` is the public advancement composition
- `gen-gaps` is the public observation composition
- the loop is not a rival website or wrapper controller story
- literal CLI or service spellings remain bindings beneath those named
  compositions
