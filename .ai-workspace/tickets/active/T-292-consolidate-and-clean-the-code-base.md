# T-292 - Consolidate and Clean the Code Base

- id: T-292
- status: active
- goal: GOAL-035
- owner: abiogenesis
- build_tenant: typescript
- parent: T-287
- updated_at: 2026-11-12
- current_activation: T292_CONSOLIDATION_01
- current_package: TD-69 (deterministic product payload), in flight
- change_class: realization_refactor
- derived_change_classes: design_reframe, requirement_reprice and product_reprice, each only for a register entry the owner decides
- re_entry_point: specification/GOALS.md, the selection block of 2026-11-12

## Scope

Owner, 2026-11-12: "our next major effort before adding new features to
consolidate and clean the code base of tech debt, failed and redundant
features, and performance improvements", and then: "i authorise the work".

This ticket carries that wave. Its work list is the second edition of the
[technical debt register](../../TECHNICAL_DEBT_REGISTER.md): entries TD-25 to
TD-74, and TD-19 from the first edition. The register came from a full
walk-through of the source, tests, scripts, design notes, specification and
repository; its method, limits and sources are in the register and under
[TECH_DEBT_REGISTER_02](../../work/TECH_DEBT_REGISTER_02/).

[T-287](T-287-deliver-abiogenesis-5-feature-waves.md) keeps the 5.0 delivery.
No new feature work starts there while this wave runs, unless the owner says
otherwise.

A package closes when the named implementation is removed, or consolidated
into the owner the register names, and the affected obligations still execute.
A renamed wrapper, a register row, a passing type check or a baseline
attribution alone does not close it.

## Rules

- The Executive (Claude Fable 5.2) decomposes, rules and reviews. It writes
  records, not source.
- One Writer (Claude Opus 5.5 at xhigh) per package, with a grant naming its
  entry, its stop conditions and its Return.
- Each package runs in a sparse worktree created from local `main`. At
  acceptance its branch is merged back to local `main` and the worktree is
  deleted (owner rule, 2026-11-11).
- Nothing is pushed. Pins are refreshed per package. A cut is made only at a
  checkpoint the owner selects.
- A register entry marked Decision waits for the owner's word. The Executive
  rules the rest from recorded rules and states the rule.
- A package stops and returns to the Executive if it would change the bytes of
  a recorded Run's replay, the Public contract, or the truth of a requirement.
- Independent review (Claude Opus 5.5 at max) at each phase close, and for any
  package that touches replay digests or the Public contract.
- One Return per package under
  [T292_CONSOLIDATION_01](../../work/T292_CONSOLIDATION_01/). One ledger line
  per package below.

## Sequence

1. Make the clean-up cheap: a deterministic product identity (TD-69), a suite
   that runs by one command with one install per test file (TD-57, TD-58), the
   coverage census as a tenant script (TD-46), the cut procedure in the tenant
   (TD-71).
2. Take the owner decisions in one sitting (the register's decisions table).
3. Remove what the decisions release, largest first.
4. One owner per rule, starting with the entries that carry defects or
   correctness risk (TD-34, TD-35, TD-36, TD-37).
5. Performance, measured costs first (TD-50 to TD-56).
6. Design, requirements and repository (TD-64, TD-65, TD-70, TD-72 to TD-74,
   TD-19).

## Ledger

| Package | Register entry | Subject | Disposition | Evidence | Carried forward |
|---|---|---|---|---|---|
| TD-69 | The product's identity depends on npm's private state | `claude/td69-payload-rule`, from `59fbaf8a0` | In flight | Cause confirmed by experiment before activation: touching `node_modules/.package-lock.json` changes the payload from 5,325 to 5,327 locators and the product digest | |
