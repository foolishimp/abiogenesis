# Step 4. Value family

Plan: `.ai-workspace/comments/claude/20261021T162409Z_PLAN_library_consolidation_pen.md`, step 4.
Executive: Claude Fable. Worker: Opus 5.5, xhigh, fresh context, Writer grant. No review at this step.

## Activation

**Role and outcome.** You are the Worker holding the Writer grant for step 4.
Outcome: one `derive` family in `shared/value/` owns canonical equality,
canonical record digests and canonical writing over `JsonValue`; every
private equality copy, inline canonical comparison, inline digest-of-both-
sides comparison, hand-rolled record digest and NUL-joined sequence
comparison in the tree calls it; the C2 currentness path keeps its truthful
materialization and is proved positive and negative; O-TYPE is decided per
site touched. Change class: `realization_refactor`. One commit on `main`, no
push.

**Subject and frame.** `/Users/jim/src/apps/abiogenesis`, branch `main`, head
= the step 3 commit in the plan ledger. Tenant root
`build_tenants/abiogenesis/typescript`; source `code/src`. Frames `f-law`,
`f-checks`, `f-claim`. Design authority:
`build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`
§4.3 (`derive`: `shared/value/`, domain `JsonValue` only), §6 (Prime atoms:
`canonicalEquals`), §10.2 (D3), §10.5 (P-EQUAL). Read those sections only.
`admitJson` from step 3 (`shared/admit/`) is the ingress for `unknown`.

**Census the Executive made at `93a4b08df` (re-verify; lines move):**

- Twelve private equality functions, all `(left: unknown, right: unknown)`
  except the last: `shared/public_function_family.ts:175`,
  `product/public_contract_publication.ts:416`, `product/worksite_operations.ts:99`,
  `product/verify_product.ts:1361`, `product/worksite_branch_construction.ts:227`,
  `product/worksite_construction.ts:198`, `abg/open_call.ts:153`,
  `abg/retry.ts:672`, `abg/c_call.ts:1386`, `abg/execution_basis.ts:529`,
  `hog/operator_support.ts:28` (exported), `hog/parent_rehydration.ts:62`
  (`(left: object, right: object)` with casts).
- About 70 inline `canonicalJson(a) === canonicalJson(b)` (or `!==`) sites
  across `abg/`, `product/`, `gtl/`, `hog/`, `validator/`.
- About 44 inline `sha256Canonical(a) === sha256Canonical(b)` sites. Only
  those that digest both sides for equality are in scope; a comparison of a
  freshly computed digest against a stored digest is a digest check and
  stays.
- Two hand-rolled record digests over `unknown`:
  `abg/execution_basis.ts:955` and `abg/invocation_execution_truth.ts:233`
  (`canonicalRecordDigest`).
- Eighteen NUL-joined sequence comparisons of two string arrays
  (`a.join("\0") === b.join("\0")`) in `abg/closure.ts`, `abg/execution_basis.ts:2171`,
  `abg/fh_resume_relation.ts`, `abg/traversal_route.ts:2992`, `gtl/consensus.ts`,
  `gtl/declarations.ts`, `hog/route_proposal.ts`, `product/environment.ts`,
  `product/invocation.ts`, `product/result_assessment_operation.ts`,
  `product/verify_product.ts`, `abg/invocation_admission.ts`: these are
  equality of two `JsonValue` arrays and belong to `canonicalEquals`.
- The C2 path: `abg/execution_basis.ts:800` materializes the event-body view
  (`runtimeEventBodiesAtPrefix(...).materialize()`) before comparing with the
  durable read; the private `sameCanonical` at `:529` compares `unknown`.
  `shared/i_json.ts:141` refuses a non-plain object (custom prototype), so an
  unmaterialized lazy view is refused at ingress.
- Existing modules `shared/canonical_json.ts` (`JsonValue`, `canonicalJson`,
  `writeCanonicalJson`, `compareUnicodeCodeUnits`), `shared/digests.ts`
  (`sha256Bytes`, `sha256Canonical`, `sha256File`, `payloadInventoryDigest`,
  `isSha256Digest`), `shared/immutable.ts` (`deepFreeze`, `isDeeplyFrozen`)
  are imported by 73 test files through `build/` and by most of the tree.
  **Do not move or rename them.** `shared/value/` is a directory that adds
  the new atoms and re-exports those three modules, so the design's naming
  holds without import churn.

**What changes.**

1. New `shared/value/equality.ts`: `canonicalEquals(left: JsonValue, right: JsonValue): boolean`
   (equal canonical text; implement without allocating two full strings if
   `writeCanonicalJson` lets you stream-compare, else by `canonicalJson`),
   and `shared/value/record.ts`: `canonicalRecordDigest(value: JsonValue): Sha256Digest`
   and `writeCanonicalRecord` as design §4.3 types it. `shared/value/index.ts`
   re-exports these and the three existing modules.
2. The twelve private equality functions go; their call sites call
   `canonicalEquals`. Where a caller holds `unknown`, it admits through
   `admitJson` first (an `Outcome`; a refusal takes the site's existing
   negative branch) or, where the value is already typed `JsonValue`, calls
   directly. `hog/parent_rehydration.ts:62` compares suspension carriers that
   are not typed `JsonValue`: decide it per D3 (admit at the site, or type the
   carrier) and record it; if neither is possible without a behavior change,
   leave the cast with a one-line comment and list it.
3. The inline canonical comparisons, the both-sides digest comparisons and
   the sequence comparisons call `canonicalEquals`. Behavior is preserved
   for every valid input; a comparison whose operands can today be non-JSON
   (`undefined`, `bigint`, functions, class instances) is a D3 site: admit
   or type, record, or leave and list.
4. The two `canonicalRecordDigest(unknown)` copies become the one atom over
   `JsonValue`, with `admitJson` at their ingress.
5. The C2 path: keep `.materialize()` at `:800`; replace `:529` with
   `canonicalEquals` over the materialized bodies and the durable read.
6. Unit lane, one file `test_env/tests/t287-value-equality.test.mjs`
   (module-derived; constitution SP-05, SP-06): P-EQUAL positive: two
   materialized event-body sequences from one recorded prefix compare equal
   to the durable read and the C2 reuse branch proceeds (use the existing
   test support for a recorded store if one exists; otherwise a minimal
   fixture of plain `JsonValue` bodies); P-EQUAL negative: an unmaterialized
   view object with a custom prototype is refused by `admitJson` before any
   comparison; plus `canonicalEquals` agrees with `sha256Canonical` equality
   on a small set of `JsonValue` pairs including key order and unicode keys.
7. O-TYPE per site (D3): every site where a producer's data was not
   assignable to `JsonValue` is recorded in Return with the decision taken.

**Grant.** Under `build_tenants/abiogenesis/typescript`: `code/src/shared/value/**`
(new), every file holding a site in the census (the sites and the imports
they need), the new test file, and the build outputs the gate regenerates.
Plus this file's `## Return`. No moves of the three existing modules, no
design text, no ticket, no GOALS, no change to any comparison outcome for a
valid `JsonValue` input.

**Gate** (in `build_tenants/abiogenesis/typescript`, in order): `npm run build`;
`npm run lint:imports`; `node --experimental-vm-modules --test test_env/tests/t287-value-equality.test.mjs`;
`npm run test:installed:language`. Record exit codes and wall times.

**Self-check:** (1) `grep -rn "function sameCanonical" code/src` returns nothing; (2) `grep -rn -E 'canonicalJson\([^)]*\) [!=]== canonicalJson\(' code/src` returns nothing; (3) `grep -rn -E '\.join\("\\0"\) [!=]== ' code/src | grep -v Object.keys` returns nothing or only sites you listed as left; (4) `grep -rn "function canonicalRecordDigest" code/src` shows one definition, in `shared/value/`; (5) the gate passed; (6) only grant files in `git diff --stat`.

**Return contract.** Stage by path, commit on `main`, no push. Message first
line `Step 4: value family; one owner for canonical equality and record digests`,
last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Append:

```
## Return
- commit: <hash>
- atoms: <file: exported names>
- retired: counts before/after for each census class (private functions, inline canonical, both-sides digest, record digest copies, sequence joins), with the file list
- D3 / O-TYPE sites: <site: decision>, one per line; sites left with a cast, listed
- C2 path: what :800 and :529 now read
- gate: build; lint:imports; unit lane (pass/fail counts); test:installed:language
- self-check: 1..6
- residuals
- return route: this file
```

Final report to the Executive: at most eight lines.

**Stop contract.** Stop without committing if: (a) a replacement would change
a comparison outcome for a valid input at a site (report the site and both
behaviors); (b) the gate fails after one bounded fix; (c) the C2 positive
test cannot be written without a Product or ABG behavior change.

ACTION: execute step 4 as activated.

## Executive note (2026-10-22, from the step 3 Return at `a2516dbdc`)

Head for this step is `a2516dbdc` (the Executive's bookkeeping commit sits
on top; the source tree equals it). Steps 2 and 3 landed: `shared/refusal.ts`
(`ok`, `refused`, `andThen`), `shared/select/exact_match.ts`,
`shared/admit/` (`isRecord`, `hasExactKeys`, `admitJson`, `admitContract`,
`admitRef`), the binding family in `public/binding/`. The retired names
`isJsonRecord`, `isJsonRecordShape`, `hasUnicodeNulJoinedKeys`,
`hasExactJsonKeys` and the other NUL-joined predicates no longer exist. Three
items join your grant:

1. **D3 ruling at `abg/retry.ts:659-663`** (`isProjectedRetryResumeCarrier`):
   the site keeps `sha256Canonical(value.inputValue as JsonValue)` behind an
   `isRecord` check. Ruling: ingress through `admitJson`; the digest is
   computed over the admitted value. The carrier's contract makes
   `inputValue` a JSON value whose canonical digest is `inputDigest`; a value
   that is not I-JSON has no canonical digest, so refusing it changes no valid
   input's outcome, and digesting a cast value is the C2 bug class this
   step closes. Record it under O-TYPE with the site.
2. **Test maintenance for the library's own unit lane.**
   `test_env/tests/t287-common-computational-library.test.mjs` imports
   retired names (`sameJson`, `sameCoordinate` from the binding mechanics;
   `hasUnicodeNulJoinedKeys`) and fails to import. Rewrite its four cases
   over the consolidated atoms: D02 over `canonicalEquals` (this step), D02
   coordinate equality over whatever `exactContractCoordinate` now exposes
   or drop it if the binding mechanics no longer export an equality,
   D03 unchanged over `resolveExactMatch`, D04 over `hasExactKeys` with the
   P-KEYS counterexample (a key containing U+0000 against the split keys
   yields `false`; the retired NUL-joined bodies returned `true`). Keep the
   file name. Delete `test_env/tests/t288-admission-predicates.test.mjs`:
   it asserts the retired bodies by name and their mutual differences,
   which row 2 of the design retires; say so in Return. Neither file is in
   a package script; the step 8 run names the first.
3. Your own unit lane `t287-value-equality.test.mjs` stays as activated.

List the files and the retry decision in Return.
