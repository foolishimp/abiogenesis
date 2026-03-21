# ADR-001: Codex Build Realization

## Status

Accepted

## Context

`builds/codex/` is an independent realization of the abiogenesis engine from the shared constitutional surfaces. It must stay isolated from the release build and keep its build-specific paths, worker identity, and package surfaces under `builds/codex/`.

## Decision

- The Codex runtime lives under `builds/codex/code/genesis/`.
- The Codex package surfaces live under `builds/codex/code/gtl_spec/`.
- The Codex worker identity is `codex`.
- Build-specific commands and traceability checks point at `builds/codex/`.

## Consequences

The Codex build can validate itself without mutating shared release paths. Differences from the Claude build are allowed only where the specification leaves room for distinct build-layer choices.
