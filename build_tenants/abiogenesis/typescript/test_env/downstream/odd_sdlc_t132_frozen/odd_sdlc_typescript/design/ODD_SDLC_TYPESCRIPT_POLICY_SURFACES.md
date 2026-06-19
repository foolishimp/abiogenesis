# odd_sdlc TypeScript Policy Surfaces

**Status**: Active
**Date**: 2026-04-27
**Owner Ticket**: `.ai-workspace/tickets/completed/T-057-extract-remaining-typescript-route-start-operational-policy-surfaces.md`
**Implements**: REQ-F-ODDSDLC-003, REQ-F-ODDSDLC-021, REQ-F-ODDSDLC-026, REQ-F-ODDSDLC-033, REQ-F-ODDSDLC-034, REQ-F-ODDSDLC-035, REQ-F-ODDSDLC-038
**Derives From**: `ODD_SDLC_TYPESCRIPT_TENANT_DERIVATION.md`, `ODD_SDLC_TYPESCRIPT_HOOK_CONTRACTS.md`, `ODD_SDLC_TYPESCRIPT_GAP_TRIAGE_HOMEOSTATIC_LOOP.md`, `ODD_SDLC_TYPESCRIPT_OPERATIONAL_TRANSITION_RUNTIME_RETURN.md`

## Purpose

Record the policy surfaces extracted from private TypeScript branches.

These policy tables are not a second engine. They declare domain mappings that
semantic kernels consume while ABG remains the owner of traversal, runtime
facts, continuation, and projection.

## Policy Modules

| Module | Classification | Owns | Does Not Own |
| --- | --- | --- | --- |
| `hooks/policy.ts` | Policy catalog module | hook target asset -> edge class and default operation | hook turn execution, ABG retry, generated-asset proof |
| `triage/policy.ts` | Policy catalog module | gap-observation condition -> classification, and classification -> route strategy | ticket mutation, constitutional change application, ABG start |
| `start/policy.ts` | Policy catalog module | public target kind -> query resolver strategy | query-domain truth, module admission, ABG execution |
| `operational/policy.ts` | Policy catalog module | operational lane -> substrate binding and evidence expectation | command execution, returned result truth, continuation |

## Local Optimization

The policy extraction removes branch-owned domain tables from semantic kernels.

The kernels still evaluate current facts:

- triage observes gap state and requirement pressure
- public start resolves a request through the admitted query domain
- operational transition checks project capabilities and admits command carriers

The policy modules only declare mapping data used by those kernels.

## Global Optimization

The same policy pattern now spans hook, triage, start, and operational modules:

```text
declared policy data
  -> semantic kernel consumes admitted facts
  -> carrier/projection output
  -> ABG or downstream product owns next traversal
```

This makes future graph-function reuse simpler because policy can be inspected
without reading imperative control flow.

## Structural Carrier Diagram

```text
hooks/policy.ts
  SDLC_HOOK_TARGET_POLICY
    -> hooks/catalog.ts
    -> hooks/fixtures.ts

triage/policy.ts
  SDLC_TRIAGE_CLASSIFICATION_POLICY
  SDLC_TRIAGE_ROUTE_POLICY
    -> triage/triage.ts

start/policy.ts
  SDLC_PUBLIC_START_TARGET_POLICY
    -> start/public_start.ts

operational/policy.ts
  SDLC_OPERATIONAL_LANE_POLICY
    -> operational/operational.ts
```

## Non-Ownership

Policy tables must not:

- select ABG next vectors
- emit runtime events
- mutate ticket state
- apply constitutional changes
- execute operational commands
- invent query-domain truth

## Residual Boundaries

Some condition evaluation remains code because it is not a static mapping:

- triage must inspect current gap status and requirement pressure
- public start must search the admitted query-domain projection
- operational transition must check capability presence and result identity

Those computations are semantic kernels over admitted carriers, not hidden
policy tables.
