# F_H Decision - Accept T-281 Project Read Owner Design

## Decision

Accept exact design digest
`6f7a6d9a40d593d0ff687b8dc94af1cbca12213266ccd5715e7163595ad58019`
for the T-281 private P1 `project.read` owner-contract boundary.

## Accepted Shape

- 27 exact read cases compress to ten reusable result graphs plus the unchanged
  T-274A `ticket_consensus` result.
- One structural case key indexes request, result, refusal, projection basis,
  native schema source, and locator truth.
- Replay uses only `fromOrdinal + limit` and admits exact
  `CanonicalRuntimeEvent` rows.
- Observer drafts derive from `ObserverObservables`; tuning truth stays with
  the tuner result family.
- Catalog refusals preserve unknown, ambiguous, hidden, unbound,
  inadmissible, incompatible, and not-ready distinctions where applicable.
- Concrete schemas remain with their M03/M04/M05 semantic owners. M04 composes
  them; it does not acquire their meaning.

## Boundary

This accepts design only. It adds no runtime path, handler, event, public
schema, operation, SDK/CLI output, or requirement. The neutral structural
owner-source helper must still reject fake `project.read` variants at compile
time and runtime before owner-schema implementation begins. The private P1
family remains all-or-nothing and P2 remains fenced.

## Verification

- independent exact-digest review: accept, no P0/P1 design finding
- exact case census: 27
- Prime result-family census: 10
- Mermaid gate: 96/96
- Prime gate: pass
- `git diff --check`: pass
