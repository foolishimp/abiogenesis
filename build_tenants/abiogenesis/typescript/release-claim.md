# ABIogenesis 5.0.0-rc.5 Development Preview Candidate Claim

This source identifies `5.0.0-rc.5` as a **local, unqualified
development-preview candidate** for the bounded T-287 / GOAL-035 RC5 scope.
It is built through ABG on the installed RC4 runtime. It is not cut, tagged,
published or deployed. It is not stable ABIogenesis 5.0, an accepted release,
whole-product or fifteen-family qualification, human acceptance, an AF22 green
verdict or an AF25 qualified release snapshot. Whether this candidate becomes
an immutable RC5 is a separate owner/operator decision.

| Coordinate | Value |
|---|---|
| Product | `product://abiogenesis/typescript-tenant@5.0.0-rc.5` |
| Package | `@abiogenesis/typescript-tenant` `5.0.0-rc.5`; `private: true` |
| Namespace/profile/subtree | `abiogenesis` / `one_project_unqualified` / `.` |
| Immutable ref | none; `v5.0.0-rc.5` is prospective and not created |
| Discovery selector | `v5.0.0`; not moved by this candidate; not an artifact or qualification identity |
| Builder substrate | installed `5.0.0-rc.4` acting as Development Product |
| Predecessor | immutable RC4 source `3c113133d` |
| Source root | checkpoint `53acfe7c6`; the F4 retained-route repair and the rc.5 identity are uncommitted worksite source on it |
| Method | `stdo://releases/v3.0.4/` (manifest `102817a3…`); frozen RC4 and historical Runs keep their exact 3.0.2 bases |
| Distribution | none; no tag, push, registry or external publication |

## Delta from 5.0.0-rc.4

1. **STDO 3.0.4 runtime method inputs.** The default-library STDO snapshot,
   role context and skill bindings, and the affected qualification inputs are
   staged from the verified 3.0.4 release through their existing owners
   (`90721c866`). Seventeen C2-generated outputs are adopted as unaccepted
   candidate custody (`9f3f22b0f`). No actor, Public relation, host
   registration or loader was added.
2. **Retained-route source carriage.** A durable `traversal_route_admitted`
   row whose bound input is a `retained_graph_input` may omit its nested
   `source` body. It may do so only when that body equals the exact earlier
   admitted same-Run, same-basis, same-graph-call, same-frame, same-cCall
   successful Result that the route consumes. The row is a codec-v3
   `abg_admitted_body_reference_record` that names the Result. The Result's
   own body, inline or v1-referenced, is acquired through the existing durable
   owner. Missing, forward, foreign, tampered, uncommitted and counterfeit
   references refuse before history is exposed. Unavailable, unequal or larger
   references stay inline. Staging, rollback and fsync poison are the existing
   batch's. Full, selected and descriptor cold reads restore the exact logical
   event. The owning HOW is the "Retained-route source carriage" section of
   `design/T289_IMMUTABLE_INSTALL_EVENT_BODIES_DESIGN.md`.
3. **Identity.** Package, lock root and the two Product constants move from
   `5.0.0-rc.4` to `5.0.0-rc.5`. Logical schema and workflow versions stay
   `5.0.0`. Dependency versions and integrity entries are unchanged.

Logical events, payload and value digests, route identities, lineage,
currentness, refusal classes, Public operations, Event Calculus and Product
authority are unchanged. Physical event-log bytes and physical prefix digests
of new histories may differ.

## Evidence standing

When this claim was written, no isolated build, packed artifact, C2 Testing,
installed run or native UAT had run on this candidate, and this claim reports
no result for them. Artifact, Product content and manifest identities come
only from actual packaging output and are recorded outside this file. RC4
evidence does not transfer to a new package digest.

The F4 Worker's own checks used an in-memory TypeScript loader that wrote no
build output. They are author feedback, not C2 Testing or acceptance:

- `tsc --noEmit` exited 0.
- The six `RC5 retained route` cases in `t287-event-body-encoding.test.mjs`
  passed 6/6 with no skip.
- Nine existing codec cases selected from the same file passed 9/9.
- On the three captured physical rows of route 37961, encoded bytes fell from
  3,139,020 to 1,678,257 (1,460,763 saved), with exact logical
  reconstruction. On the component retained history, they fell from 113,561 to
  61,898.

These figures count physical rows only. They are not a complete admitted
history, a campaign saving or a latency result.

## Open limits

- The installed `RC5 retained route` case in
  `m5-installed-graph-edge.test.mjs` has not run. It needs the C2-packed
  candidate.
- The rest of `t287-event-body-encoding.test.mjs`, the route-reconstruction
  suite and the omitted non-capture selector-planning case have not run on
  this source.
- The 3.0.4 method candidate's native UAT is indeterminate (M3 open). Final
  C2 and a new native UAT over the whole RC5 scope are pending.
- Readers older than this candidate cannot read codec-v3 rows. Histories
  written by this candidate need an RC5-or-later reader. Earlier inline, v1 and
  v2 histories remain readable here.
- No setup, launch or between-task latency change is made or claimed. No
  capacity threshold or universal performance improvement is claimed.
- The generated `product-toolchain-manifest.json` and
  `test_env/fixtures/abi5-root-candidate-basis.json` still name `5.0.0-rc.4`
  until actual build and packaging regenerate or reconcile them. Canonical
  generated outputs (`contracts/`, `product-toolchain-manifest.json`) are
  reconciled only by traced materialization of accepted ABG-generated bytes.
- These remain excluded: the broader capsule's crash/saga cases, the capture
  and live lanes listed in `PROOF_EXCLUSIONS.json`, and whole fifteen-family,
  F11/AF22, GC03 host-adapter and stable-release qualification.
- Limits carried from RC3/RC4 remain open: Increment B fixed-client native
  delivery, an allowed GC03 read, prompt fit of the captured 18/51 assemblies,
  model-identity independence, Public typed-stop fidelity, and literal
  `5.0.0-rc.1` identities in owner tests.

## Release boundary

F08 standalone Consensus and F12 dedicated observer/tuner remain reserved for
5.1. The other Product release-boundary deferrals are unchanged, including
yield production, native human response/resume and required host parity.
Dynamic graph generation/recomposition remains outside 5.0 acceptance.

RC1 through RC4 release, install, tag, claim and evidence bytes are unchanged.
The RC3 candidate claim remains at source `97406077c`, and RC4 remains at
`3c113133d`. Only accepted changes actually executed through ABG count as
accepted output. Failures, workarounds, retries and proxy interventions remain
visible. Missing usage/cost telemetry stays unknown.
