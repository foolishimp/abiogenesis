# Step 3. Admit family

Plan: `.ai-workspace/comments/claude/20261021T162409Z_PLAN_library_consolidation_pen.md`, step 3.
Executive: Claude Fable. Worker: Opus 5.5, xhigh, fresh context, Writer grant. No review at this step.

## Activation

**Role and outcome.** You are the Worker holding the Writer grant for step 3.
Outcome: one `validate` family in `shared/admit/` owns record shape, exact
key sets, JSON ingress, contract admission and reference admission; every
private copy of those algorithms in the tree is retired; the five owner
obligations O-RESOURCE, O-SHAPE, O-SCHEMA, O-KEY and O-CODEC are closed with
site lists; D3 and D4 are applied as decided. Change class:
`realization_refactor`. One commit on `main`, no push.

**Subject and frame.** `/Users/jim/src/apps/abiogenesis`, branch `main`, head
= the step 2 commit recorded in the plan ledger. Tenant root
`build_tenants/abiogenesis/typescript`; source `code/src`. Frames `f-law`,
`f-checks`, `f-claim` (project basis). Design authority:
`build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`
§3 (carrier set), §4.1 (`validate`: `shared/admit/`, the exact signatures),
§4.5 (lift: `bindStaticOwner` consumes `admitContract`), §10.2 (D3, D4) and
§10.3 (owner obligations). Read those sections only. The refusal carrier is
`shared/refusal.ts` from step 2.

**Decisions already taken.** D3: the two native composite classifications are
ingress questions; decide each site you touch (does this ingress admit a
plain `JsonValue` record, or a typed contract through `admitContract`?) and
record the decision per site in Return; no blanket rule. D4: the throwing
`admitIJsonValue` and `admitIJsonText` in `shared/i_json.ts` stay as thin
lifts over the new `admitJson` (call it; throw `IJsonAdmissionError` on a
refusal); callers are not changed in this step.

**Census the Executive made at `93a4b08df` (re-verify; line numbers may have
moved after step 2):**

- `shared/admission_predicates.ts`: `isRecord` (7), `isJsonRecordShape` (26),
  and five exact-key bodies built on `Object.keys(value).sort().join("\0")`
  at lines 17, 44-45, 56, 67, 78-79. Two use `compareUnicodeCodeUnits`
  ordering, three default ordering; all compare sets, so one body serves all
  five once both sides use the same ordering.
- Local record guards: `abg/execution_basis.ts:169`, `abg/artifact_truth.ts:167`.
- `isJsonRecordShape` imported under the alias `isRecord` by
  `product/builtin_semantics.ts`, `abg/continuation.ts`, `abg/retry.ts`,
  `abg/invocation_execution_truth.ts`, `gtl/canonicalization.ts`,
  `gtl/materialize.ts`; and by name in `abg/event_body_encoding.ts`.
- Inline exact-key bodies outside `admission_predicates.ts` (the same
  `sort().join("\0") ===` algorithm on `Object.keys`): `validator/validation.ts:102`,
  `product/worksite_preparation.ts:89`, `product/worksite_revision.ts:87`,
  `product/registered_selection_native.ts:10`, `product/default_library.ts:117`,
  `product/semantic_stage.ts:135`, `product/workspace_operations.ts:194`,
  `product/worksite_command_forward.ts:86`, `product/execution_resolution.ts:184`,
  `abg/stdo_environment.ts:39`, `abg/invocation_admission.ts:365`,
  `abg/transport_contracts.ts:20`, `:26`, `:30`, `abg/c_call.ts:6294`, `:6299`,
  `abg/event_store.ts:3853`, `abg/definition_event_resource.ts:151`, `:226-237`,
  `:249-257`, `:296-297`, `:329-330`, `abg/actor_process.ts:469-471`,
  `abg/project_read_definition_bindings.ts:763-764`,
  `implementation/worksite_command_execution.ts:155-156`,
  `gtl/worksite_c0.ts:81-82`, `gtl/materialize.ts:33-45`,
  `gtl/registered_selection.ts:13`. About thirty sites.
- Not in this step: `join("\0")` comparisons of two arrays (sequence
  equality, for example `product/invocation.ts:311-344`,
  `abg/traversal_route.ts:2992`, `abg/execution_basis.ts:2171`) belong to
  the `derive` family at step 4; `includes("\0")` validity checks on paths
  and strings are not key-set comparisons and stay.
- `bindStaticOwner` inlines `v.safeParse` at `shared/static_definition_bindings.ts:134` and `:153`.
- O-RESOURCE: `shared/definition_binding_mechanics.ts` `requiredSlot` (135)
  and `exactContractCoordinate` (148) take `unknown`.
- O-SCHEMA: `product/default_library.ts:44` `jsonRecord = v.custom(...)` with
  a shallow check; `abg/project_read_definition_bindings.ts:149` `asRecord`
  casts after a shallow check.
- O-KEY: `product/default_library.ts:117` private `exactKeys` (used at 133).
- O-CODEC: `abg/event_body_encoding.ts:26` `nativeParts` and the decoders
  at 43, 52, 60 return an unknown restored event for later event-store
  validation. Keep that order.
- Inline `typeof x === "object" && x !== null` guards: 57 in the tree; replace
  those that guard a record you touch; do not sweep the rest.

**What changes.**

1. New `shared/admit/` with the five atoms of design §4.1, typed exactly as
   there, returning `Outcome` from `shared/refusal.ts` where the design says
   so. `hasExactKeys` compares own enumerable string keys as a set against
   the expected keys; one ordering, stated in a comment.
2. `shared/admission_predicates.ts` becomes a re-export of the new atoms (or
   is deleted and its importers updated; your choice, state it). The alias
   imports switch to `isRecord`.
3. Every inline exact-key site above calls `hasExactKeys`. Every local
   record guard you touch calls `isRecord`. Behavior is preserved for every
   valid input: an exact-key check that today compares own keys keeps
   comparing own keys; if a site's old body would accept an input that
   `hasExactKeys` refuses (or the reverse), stop and report the site rather
   than silently changing admission.
4. `bindStaticOwner` consumes `admitContract` for both `safeParse` sites and
   maps a refusal to the existing fault exactly as before.
5. O-RESOURCE: `requiredSlot` and `exactContractCoordinate` consume
   `admitRef` and `admitContract`; absent selection still yields the existing
   outcome.
6. O-SCHEMA: `jsonRecord` and `asRecord` are replaced by `isRecord` or
   `admitContract` with the existing schema, as D3 decides per site.
7. O-KEY: `default_library.ts:117` goes; line 133 uses `hasExactKeys` with the
   same five keys; exact owner shape (own keys), not inherited keys.
8. O-CODEC: `nativeParts` and the decoders use `isRecord` and `hasExactKeys`
   for their shape checks only; the restored event stays `unknown` for the
   store's later validation.
9. D4: `admitIJsonValue` and `admitIJsonText` call `admitJson` and throw on
   refusal; their signatures and error class are unchanged.
10. Tests under `test_env/` that import `admission_predicates.js` or
    `i_json.js` through `build/`: census them yourself; update import paths
    only.

**Grant.** Under `build_tenants/abiogenesis/typescript`: `code/src/shared/admit/**`
(new), `code/src/shared/admission_predicates.ts`, `code/src/shared/i_json.ts`,
`code/src/shared/static_definition_bindings.ts`,
`code/src/shared/definition_binding_mechanics.ts`, every site file named in
the census (the lines named and the imports they need), test import lines,
and the build outputs the gate regenerates (`build/**`, `contracts/**/*.json`,
`product-toolchain-manifest.json`). Plus this file's `## Return`. No design
text, no ticket, no GOALS, no sequence-equality sites, no change to any
admission outcome for a valid input.

**Gate** (in `build_tenants/abiogenesis/typescript`, in order): `npm run build`;
`npm run lint:imports`; `npm run test:installed:language`. Record exit codes
and wall times.

**Self-check before the commit:** (1) `grep -rn 'sort().join("\\0") ===\|sort().join("\\0") !==' code/src --include='*.ts'` lists only sites you have classified as sequence equality (step 4) in Return, none on `Object.keys`; (2) `grep -rn "function isRecord\|const isRecord" code/src` shows exactly one definition, in `shared/admit/`; (3) `grep -n safeParse code/src/shared/static_definition_bindings.ts` returns nothing; (4) the gate passed; (5) `git diff --stat` touches only grant files.

**Return contract.** Stage by path, commit on `main`, no push. Message first
line `Step 3: admit family; one owner for record shape, exact keys, JSON ingress and contract admission`,
last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Append:

```
## Return
- commit: <hash>
- atoms: <file: exported names>
- retired: <file:line -> atom>, one per line, with the before/after count of `Object.keys(...).sort().join("\0")` bodies in code/src
- obligations: O-RESOURCE, O-SHAPE, O-SCHEMA, O-KEY, O-CODEC: closed/open, each with its site list
- D3 decisions: <site: plain record | typed contract (schema)>, one per line
- gate: build <rc, s>; lint:imports <rc>; test:installed:language <rc, s, pass/fail>
- self-check: 1..5
- residuals
- return route: this file
```

Final report to the Executive: at most eight lines.

**Stop contract.** Stop without committing if: (a) any replacement would
change the admission outcome for a valid input at a site (report the site
and both behaviors); (b) the gate fails after one bounded fix; (c) a site
needs a Product or requirement change to close.

ACTION: execute step 3 as activated.

## Executive note (2026-10-22, from the step 1 re-review)

Design §10.6 row 2 omits two relations that this step's Return records:
(1) the admit atoms return `Outcome` and so depend on the step 2 carrier
(`shared/refusal.ts`), which the constitution §16.14 record of step 2 admits;
(2) the catalog disposition of the five admit atoms: the design's §10.7
calls them a `catalog_extension` of `N05`, and `N05` is a row of Table
5.6.3-B (the selected leaf-instance catalog: "strict schema and I-JSON
admission", `shared/i_json.ts::admitIJsonValue` and the owner Valibot
schemas), not a §10 catalog relation. In Return, state which §16.14 (b) row
of the step 2 record covers the admit atoms and that they extend the `N05`
leaf instance; change no constitution text in this step.

## Executive note 2 (2026-10-22, from the step 2 Return at `69132360f`)

Do these first, before any admit code; they are in your grant:

1. Rename the carrier's sequencing export `then` to `andThen` in
   `code/src/shared/refusal.ts` and in every design mention (§3's code
   block and prose, §4, §5, §10.7's carrier row) and in the constitution
   §16.14 (b) row that lists the carrier's exports. Reason, stated in one
   sentence in design §3: a module namespace with an export named `then` is
   a thenable, so `import()` of the module never settles; static imports
   work, dynamic ones hang. The step 2 Worker verified it with a probe.
2. Design §2: the `shared/refusal.ts` row's Imports column says `none`;
   the file imports the type `JsonValue` from `canonical_json.ts`. Change
   the column to `value` (types only).
3. Design §2 move 1 links `static_definition_bindings.ts` at its old path,
   which no longer exists; point the link at `public/binding/static_definition_bindings.ts`.
4. Design §10.6 row 1: record that the carrier's `catalog_addition_proposal`
   was accepted through the constitution §16.14 record at step 2 (commit
   `69132360f`), so the row's `U(B)` is empty and it co-evolves.

List each of these lines in Return. Head for this step is `69132360f`.
