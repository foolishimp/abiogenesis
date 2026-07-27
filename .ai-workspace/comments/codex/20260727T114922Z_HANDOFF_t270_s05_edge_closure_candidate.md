# T-270 S05 Edge-Closure Handoff

## Purpose

This handoff binds one exact replacement S05 realization candidate for
independent review. It addresses only the two findings against candidate
`17c6444a`:

- direct `AbgEventStore.projectReopenAuthorityAndClose()` did not revoke
  catalog candidates and applications; and
- result-bearing stdout was not frozen at direct-process exit, allowing an
  inherited-pipe descendant to emit a salvageable candidate afterward.

No Product, GTL, design, requirement, ticket, scenario, controller, catalog,
runtime, or event family changed. S06 remains held.

This is a worker handoff, not a semantic review verdict or S05 acceptance.

## Exact Subject

- accepted S03 base:
  `8865ccff844d06f4f97765f014ae2b59c1e7d84b`
- accepted S05 design:
  `283325aa082844ad4691ca07bb39882fda7152dc`
- superseded candidate:
  `17c6444a39a4542f4bf7015d222ec0c383f4e2a8`
- replacement candidate:
  `3e0a148ae8ea3110d715cc142fb9708010876dcb`
- candidate tree:
  `0db18d769c870f10bb8eecb7646a16b907092268`

The candidate-to-evidence delta is limited to `GOALS.md`, T-270, and this
handoff. Those surfaces project review state; they do not alter the candidate.
The isolated future T-247 qualification amendment remains unchanged at
`625cffed`.

## Realized Boundary

### EventStore Lifecycle

EventStore now exposes its existing admission-open lifecycle predicate from
the same private state that `projectReopenAuthorityAndClose()` closes.
Catalog scope minting, candidate admission, and admitted-application
recognition all require that predicate.

The focused mutation:

1. mirrors an exact admitted Product/install/CatalogView history;
2. mints a genuine Product-authenticated candidate in that store;
3. configures the durable log;
4. calls `projectReopenAuthorityAndClose()` directly; and
5. proves candidate admission and another scope request refuse.

Public context closure remains green, but is no longer the only path that can
revoke catalog authority.

### First Terminal Process Boundary

Worker transport snapshots result-bearing stdout once, at the first terminal
boundary: timeout, spawn failure, direct-process exit, or close fallback.
Stream draining may continue so all later bytes remain archived in diagnostic
stdout, but those bytes cannot enter parser output or the semantic output
artifact.

The focused mutation starts a direct worker that gives an inherited stdout
pipe to a descendant and exits with status `47`. The descendant emits valid
stream JSON afterward. Transport records the late bytes diagnostically while
returning empty semantic output and `transport_failure`.

Both retained positive cases remain green: a valid candidate observed before
non-zero exit and a valid candidate observed before timeout are salvageable
with their failed-process evidence.

## Design Basis

No design amendment was required. The unchanged S05 design already limits
semantic evidence to result-bearing bytes observed before timeout, exit, or
no-output stop. ADR-046 already makes catalog validity expire with the exact
ABG event-store context.

The retained four-file design aggregate remains:

`015a158a8a636502e76b88fe87866633757deca597832e1010099ba371e13c2d`

## Mechanical Evidence

| Gate | Result |
|---|---:|
| Focused worker and portability lanes | `14/14` |
| Complete M5 | `161/161` |
| S05 module within M5 | `18/18` |
| Installed Consensus | `26/26` |
| Retained M4 | `26/26` |
| Installed external Product | `36/36` |
| S03 authority unit | `4/4` |
| Conservation projection | `62/62` |
| `git diff --check` | pass |

Every aggregate reported zero failures, skips, and todos. Complete M5 contains
exactly two more tests than candidate `17c6444a`: the direct-store-close
mutation and post-direct-exit descendant-output mutation.

## Reproducible Package

Two independent `git archive` extractions of exact candidate `3e0a148a` each
ran `npm ci` and `npm pack --json`. The resulting archives are byte-identical.

| Property | Exact value |
|---|---|
| Archive | `abiogenesis-typescript-tenant-5.0.0-dev.286.tgz` |
| SHA-256 | `79d0b12c21d049353266c888d6a28596108efb6cd77ecd70ead73f4ff5c1feda` |
| SHA-1 | `9cceab7ed1227b0266e701fa1df0f56ac17c920e` |
| npm integrity | `sha512-k6vbV/0vMUwOp4sP/jPKnnrsAbOh8Xk7JwvU0Xm+h7IzE3mI+Tej/tiA+14bPdbj+MyeEGfpuMYSG0NLnjq4Sw==` |
| Packed size | `308581` bytes |
| Unpacked size | `2281830` bytes |
| Entries | `186` |
| Sorted payload inventory | `15cf76447cf164662f0a5fc499be88343c067878fe9c7bfa46ca779f91430c2e` |
| Product content | `08785889d7a33af4dfc5d7a10e9b8521227ec5085d82470a637551f0b874d5f6` |
| Canonical manifest | `c8088312e94b071b511f0d68f1e116cd1d0c64831c1a8c16c39cc63c3dc64827` |

The inventory is SHA-256 over C-sorted lines
`<file-sha256><two spaces><package-relative-path><newline>` from an empty
archive extraction. Both archives produced the recorded digest.

## Retained Root Proof

| Proof | SHA-256 |
|---|---|
| Governor | `b9ba2a5854538c3674fa6879460159998521b7e9a73c88887e879e51337de757` |
| Event log | `e5bd712527efd3c0b43b6b1f874369a75facbf9e4527a785cd5a6606b1c24e8a` |
| R10 result | `d97ca91d59f90fcd26d6715166e9fb0dfcdda7f5ce1cbdac79d2352e6a15a7e0` |
| Outcomes | `e3dbea55be57c56211a292d1801da15107fa015f66edc46fda8cfbdaa7882655` |
| Transcript | `78caf31fb89fe78c3cad7de858cb9347e243733dfa4b47b79ab17a92a14f11f8` |

## Review Boundary

Independent review should inspect only these affected relations:

1. Can a genuine catalog candidate or admitted application remain valid after
   direct EventStore closure, without passing through Public?
2. Can bytes observed only after direct-process exit enter result-bearing
   output or Consensus salvage?
3. Do valid-before-exit and valid-before-timeout salvage remain intact?
4. Did the repair avoid Product, design, catalog, runtime, event-family, or
   S06 scope expansion?

Direct human acceptance remains required after independent review. No further
worker edits or self-review are authorized against this frozen subject.
