# Decision — Apply The One S06 Gate 1 Bounded Repair

Date: 2026-07-31T16:33:00Z

Owner: T-281 worker under the direct F_H completion envelope

Reviewed subject: `2a60c2b704ce431804f26238ea0dd0718a4c456a`

Reviewed tree: `fc19ebdf0766050e53b6bc673a4c761ff6ad77c4`

## Disposition

The constructability review passed. The authority review found one local
counterexample: AX-F09 and `ExecutableRetryInput` preserved the selected retry
attempt but not the complete prior-attempt frontier required by
`REQ-R-ABG3-PROJECTION-009..010` and T-281 `CL-05`.

The single authorized bounded repair is selected:

```text
one current held retry-progress fluent
  + every admitted prior attempt relation in the same exact boundary
  -> one structurally asserted full RetryAttemptFrontier
  -> selected executable retry input
  -> HoG resume
```

The repair adds the exact owner-internal full-frontier carrier and structural
assertion, includes it in the ABG projection, and changes AX-F09 to stop after
two distinct failed attempts before resuming attempt three in another process.
The oracle now proves prior-attempt identities, reason classes, owner surfaces,
source event kinds, and exact attempt coverage rather than permitting a
latest-only dossier.

No Product meaning, requirement, Public operation, 18/56 member, catalog,
controller, runtime, owner allocation, package boundary, or milestone changes.
The existing ABG reconstruction and HoG execution architecture remains the
only path. This consumes the one bounded-repair allowance. Review after this
cut is delta-only over the repaired full-frontier relation and its tracking.
