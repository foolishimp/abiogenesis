# ADR-040 — TypeScript tenant as package-first realization

**Series**: abiogenesis / typescript build
**Status**: Accepted
**Date**: 2026-04-23
**Implements**: tenant realization selection for the in-development TypeScript line
**Scope**: `build_tenants/abiogenesis/typescript/`, `design/README.md`, `TENANT_REGISTRY.md`

## Context

Abiogenesis already has one paused Python reference realization and one paused Codex
comparison line.

The TypeScript tenant exists for a different reason:

- package-first enterprise deployment is materially easier than shipping custom
  binaries
- TypeScript provides a strong discriminated-union and interface vocabulary for
  carrier-first runtime design
- MCP and surrounding agent tooling align naturally with the TypeScript
  ecosystem
- Node, Bun, and Deno provide broad runtime reach without changing product
  truth

The design mistake to avoid is treating those delivery advantages as a reason
to rewrite constitutional or runtime law.

## Decision

### 1. The TypeScript line is a new tenant realization

`build_tenants/abiogenesis/typescript/` is an in-development realization under
the same constitutional `specification/` surface as the paused Python reference line.

### 2. The TypeScript line is package-first

The primary delivery assumption for this tenant is:

- installable package first

Compiled executable delivery may exist later, but it is optional delivery
binding and not the governing design posture.

Package-first does not authorize a different public operator command grammar.
When the TypeScript tenant, an installed app, or a downstream wrapper exposes a
CLI, the executable prefix may differ but the command suffix, public flags,
target grammar, control-mode grammar, output contract, and stop classification
must bind the shared product command grammar.

### 3. Runtime choice stays below the public contract

Node, Bun, and Deno are runtime shells around the same carrier and event law.

This tenant must not let one runtime choice become hidden product truth during
the first design wave.

### 4. Python is source material, not tenant authority

The paused Python reference line is the reference implementation for:

- runtime law already proven in source
- public operator contract behavior
- current proof lanes and migration order

It is not authority for:

- file layout duplication
- Python-specific helper shapes
- Python-specific packaging assumptions

Python's executable prefix and adapter wiring are not tenant authority. The
shared public command grammar is product policy and remains tenant-invariant.

## Consequences

### Positive

- the TypeScript line has a clear delivery posture before code exists
- enterprise deployment considerations are explicit rather than implicit
- TypeScript runtime portability can be evaluated without changing product law

### Negative

- the tenant still has to choose one first runtime shell for actual code
  execution later
- package-first delivery does not reduce the need for hard carrier law inside
  the semantic center

### Follow-on

- port the key runtime ADR chain from the Python line
- add tenant-local TypeScript qualification design once code exists
- choose the first concrete runtime shell in a later ADR when implementation
  starts
