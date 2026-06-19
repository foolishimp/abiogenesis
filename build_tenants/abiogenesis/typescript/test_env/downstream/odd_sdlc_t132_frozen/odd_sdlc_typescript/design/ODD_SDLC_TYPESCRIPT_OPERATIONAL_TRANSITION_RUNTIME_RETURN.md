# ODD SDLC TypeScript Operational Transition And Runtime Return

## Scope

This design closes T-037 for the TypeScript tenant.

Python operational dispatch is discovery evidence. TypeScript keeps the ODD
shape: command-side intent, admitted returned result, current state projection,
and runtime-return observation are separate carriers.

## Carrier Chain

```text
project constraints capability contract
  -> operational transition plan
  -> operational transition command
  -> one cooperative advance
  -> admitted operational result or pending state
  -> operational state projection
  -> runtime-return observation
```

## Closure Law

Command intent is not execution proof.

Missing capability blocks the transition. Missing returned evidence keeps the
lane pending and queryable. A returned result must be admitted against the
command id before it can drive the current state projection.

The tenant executes at most one cooperative operational advance and returns
control to ABG/public-start policy.

## Runtime Return

Runtime-return evidence feeds:

- `derive_runtime_observation_surface`
- `derive_retrofit_plan_surface`

It does not silently close deployment, runtime, or retrofit obligations.

