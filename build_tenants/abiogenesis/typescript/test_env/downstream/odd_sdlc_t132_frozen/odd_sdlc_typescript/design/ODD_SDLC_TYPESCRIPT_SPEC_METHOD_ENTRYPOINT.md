# odd_sdlc TypeScript Spec Method Entrypoint

**Status**: Active
**Date**: 2026-05-07
**Owner Tickets**: `.ai-workspace/tickets/completed/T-058-realize-typescript-public-cli-adapter-over-graph-query-start-surfaces.md`, `.ai-workspace/tickets/active/T-120-realize-retry-local-repair-prompts-from-typed-gap-dossiers.md`, `.ai-workspace/tickets/active/T-194-migrate-typescript-tenant-to-abg-4-0-0-rc-1.md`
**Supersedes**: `ODD_SDLC_TYPESCRIPT_PUBLIC_CLI_ADAPTER.md`
**Implements**: REQ-F-ODDSDLC-040, REQ-F-ODDSDLC-041, REQ-F-ODDSDLC-043, REQ-F-ODDSDLC-051
**Derives From**: `ODD_SDLC_TYPESCRIPT_TENANT_DERIVATION.md`, `ODD_SDLC_TYPESCRIPT_POLICY_SURFACES.md`, `ODD_SDLC_TYPESCRIPT_DETERMINISTIC_TRAVERSAL_STATE_MACHINE.md`

## Purpose

Define the single TypeScript operator entrypoint under Spec Method discipline.

The entrypoint admits method command intent and calls the installed
ABG/odd_sdlc contract. It is not a CLI controller, retry controller, traversal
controller, or compatibility facade. The executable process binding is only a
launch mechanism for the same method entrypoint.

## IACS

| Carrier | Owner | Notes |
| --- | --- | --- |
| `OddSdlcSpecMethodRequest` | `spec_method/entry.ts` | admitted method command intent and options |
| `OddSdlcSpecMethodResult` | `spec_method/entry.ts` | closed method result projection |
| gaps evaluator priority edge | `spec_method/entry.ts` | single public domain-policy ingress for read-only gap priority customization; admitted only on `gaps` and projected through ABG construction priority carriers |
| workspace source snapshots | `spec_method/entry.ts` | read-only filesystem admission into `deriveSdlcSourceInput` |
| project constraints fallback | `spec_method/entry.ts` | admission default when imported workspace has no project constraints file |
| graph catalog | `graph/` | entrypoint reads only |
| query-domain projection | `projection/` | entrypoint reads only |
| public start outcome | `start/` | entrypoint reads only |
| installed operator start | `operator/installed_operator.ts` | ABG-owned traversal and retry/reentry boundary |
| RC qualification report | `qualification/` | entrypoint reads only |

## Structural Carrier Diagram

```text
operator intent
  -> spec_method/entry.ts
      -> workspace source snapshots
      -> workspace/deriveSdlcWorkspaceIngressReport
      -> graph/constructSdlcGtlModule
      -> projection/projectSdlcQueryDomain
      -> start/publicStartOnce
      -> operator/executeInstalledOperatorStartWithReentry
      -> projection/deriveSdlcGapDossier
      -> runtime/deriveOddSdlcConstructionEvaluatorReport
      -> qualification/describeOddSdlcTypescriptRcQualification
  -> OddSdlcSpecMethodResult
```

The shell binary `odd-sdlc-ts` may call this entrypoint, but it does not define
command law and does not export a separate CLI command module.

## Module Shape

| Module | Classification | Owns | Does Not Own |
| --- | --- | --- | --- |
| `spec_method/entry.ts` | Spec Method entrypoint | method intent admission, read-only workspace source discovery, dispatch to graph/query/start/operator/release/install surfaces | graph truth, vector advancement, retry budget, closure fold, repair policy |
| `cli/main.ts` | Process launcher | argv/stdout/stderr/exit binding | command semantics, retry/reentry, traversal law |
| `operator/installed_operator.ts` | Installed ABG boundary | installed start execution, ABG plugin dispatch, typed retry/reentry projection, archives | user-interface grammar |

## Commands

`catalog` returns the declared TypeScript graph-function catalog.

`query-domain` reads workspace authority surfaces, derives ingress, constructs
the TypeScript GTL module, and projects the query domain.

`gaps` derives a read-only gap dossier from ABG replay/start truth. It may
admit `--evaluator-priority-edge <edge-name>` as the single public
odd_sdlc-domain priority customization surface. That option names a published
graph edge and is converted into an ABG construction priority scheme for the
gap evaluator projection. The entrypoint does not rank candidate actions
locally and does not choose or dispatch traversal. In this command,
`nextLawfulActions` is read-only evaluator preview truth; runner-facing code
must consume admitted evaluator/action carriers rather than treating that field
as traversal control.

`start` admits the public start contract first. If no worker transport is
provided for `F_P`, the command returns the typed worker-unattached block. If a
worker is attached, the entrypoint calls the installed operator boundary. The
installed operator, not the entrypoint, owns retry/reentry control and emits
runtime/archive truth through ABG-compatible surfaces.

`install`, `release-cut`, and `rc-report` call their product-owned modules.
They do not own traversal or retry policy.

## Non-Ownership

The Spec Method entrypoint must not:

- select next vectors directly
- rank candidate actions locally
- own ABG iteration, retry budget, vector advancement, or closure fold
- synthesize retry context
- retry worker output
- treat `repair_worker_output` as prose without a typed repair/reentry plan
- export a second CLI command module
- claim full Python operational replacement

## Accepted Proof

The prior T-058 proof is no longer sufficient as closure evidence where it
describes a public CLI adapter as the command authority. Current closure must
prove:

- `cli/command.ts` is absent
- `spec_method/entry.ts` contains no retry loop or retry context synthesis
- `gaps --evaluator-priority-edge <edge-name>` proves domain priority is
  admitted through the Spec Method surface and ranked by ABG construction
  priority projection
- invalid, duplicate, unknown, and already-closed priority edge selectors fail
  closed through the same Spec Method request surface
- installed retry/reentry control is owned by `operator/installed_operator.ts`
- focused tests run and remain available for operator review before ticket
  closure
