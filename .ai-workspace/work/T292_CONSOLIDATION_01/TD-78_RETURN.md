# TD-78 — executing Product and selected bound toolchain

## Activation and owner triage

| Binding | Exact basis |
| --- | --- |
| Writer / consumer | `T292-TD78-CODEX-01`, Codex; return to Root Executive, then stop |
| Subject | predecessor `54024d63fdbf42d36d1508bb2a4d59f4cb73233c`; sparse `/private/tmp/abg-td78`, branch `codex/td78-bound-product` |
| Product / method | `urn:stdo:product-definition:abiogenesis`; `stdo://releases/v3.0.4/`, manifest `102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b`; installed source reader verified `installed: true`, `valid: true`, definition SHA-256 `b5720642ff00ebcb47f77ae68df3a960ab70f82cd1227c0712edda9d40745f44` |
| Admission | Existing human authorization in T-292's amendment and Codex resumption (`continue approvedd`), TD-78 ruling and T-293 B-03; Root's exact Writer packet selects this bounded repair after TD-77. Receive validated; no new approval inferred from the ticket's status |
| Frame | `ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-end-to-end-interface-integration`, revision 2, with Product/identity/admission/effect/Proof owners |
| Host | Fresh packet context, shared filesystem and tools; no information exclusion, security isolation or independent semantic review claimed; no subagents |
| Effects | Tenant source/design/test and this Return; isolated dependency/build/test/temp evidence and authored commit. No main, push, builder pin, user install or generated identity commit |
| Durable evidence | This Return and `/private/tmp/abg-td78-work/codex-resume/`; original TD-78 evidence preserved |

The pre-code triage reuses `TD-78_TRACE.md`, sections 6–9: two builds with the
same package name/version but different Product content digests append Runs to
each other's selected bound environment. The transport checks the executing
definition; the admission capability checks the caller's executing-owner
artifact; neither establishes the executing-versus-bound-ABI relation. Existing
pure read success is required behavior. TD-77's strict capability question
does not establish content identity.

`REQ-P-CATALOG-013` requires an explicit resolution and new lock for different
Product bytes; `REQ-R-ABG3-RUN-010` forbids silent governing-environment upgrade.
Root selects stable-requirement defect repair. The first changed relation is
the missing admission predicate in the existing HOW, not Product meaning,
Public membership, contract schema or recorded history. The affected cone is
the executing identity reader and lock comparison, the selected binding's
authenticated causal lock, run entry/continuation, and other bound append or
effect admission. Pre-binding install/bind/setup does not select an already
bound workspace. Several locks/bindings in one store remain legal.

Compact design: the Product identity owner supplies one digest comparison;
the ABG environment owner supplies the exact lock selected by the operation's
binding. The appending owner conjoins these before its first append or effect,
using its existing refusal. Pure/historical projections do not acquire this
predicate. Existing currentness, strict new-work eligibility, operation scope,
grants and replay checks remain distinct. Source census and focused proof below
will bind the actual handoffs and report any unclosed door.

```text
caller -> existing owner: exact binding + authenticated prefix
owner -> ABG environment: selected binding's causal lock
owner -> Product identity: bound ABI digest == executing Product digest
owner -> append/effect: only after existing admission and identity both pass
read -> recorded projection: unchanged, no executing identity requirement
```

Closure requires mismatched start/invoke/continuation to refuse with zero rows
and no effect, same-bound positives including installed model-free start and
scripted positive continuation, cross-build pure reads, mixed-store selection,
and focused affected checks. Changed Public signatures/contracts, changed kept
history, missing owner decision or integration failure return to Executive;
no release or QA acceptance is claimed here.

## Construction and evidence

### Owner route and finite boundary census

The admitted design is recorded in
`design/T287_PUBLIC_DEFINITION_CALL_CONSTRUCTION.md#selected-bound-toolchain-at-work-admission-t-292-td-78`.
`product/declaration_exports.ts::toolchainProductContentMatches` is the one
content comparison, factored from native lock construction and also used by its
retained-result shortcut. `product/environment.ts::resolvedLockMatchesExecutingToolchain`
selects exactly one ABI row from the supplied lock. The existing ABG environment
owner reconstructs the operation's exact binding and causal lock under its
unchanged **strict** question; its new internal boundary helper conjoins the
comparison. No generic projection or recorded-lock predicate gains an
executing-identity condition.

| Supported boundary | Selected basis and pre-effect gate | Existing refusal |
| --- | --- | --- |
| Run `start`, `invoke`, `current_intent` | `owner_bindings/run_invocation.ts::projectSetupTruth`; exact request/catalog binding before invocation or continuation append, traversal or leaf | `invalid_program` for start/invoke; `basis_mismatch` for current intent |
| Materialize `configuration`, `context_bootstrap`; result `assess`; witness `reprice`, `run-stopped`; release `published_rc`, `tapped_release` | `withAdmissionAuthority` → `admitAdmissionCapabilityBasis`; exact bound environment, only existing non-`none` event-admission metadata, after the executing-owner artifact has been verified equal to executing content and before entering the owner | Existing `ENVIRONMENT_UNADMITTED` admission failure |
| Direct ABG invocation admission/refusal, root/child execution basis, traversal opening | The selected invocation/basis binding at the existing admission boundary | Existing workspace/basis refusals or existing TypeError route |
| Direct F_H open/hold and pending continuation | Product basis or invocation's exact binding before a transaction can stage rows | Existing continuation refusal or TypeError route |
| Direct actor dispatch / probabilistic-result admission | Actual runtime/basis binding before process effect or result append | Existing workspace / contract-capability refusal |
| Direct HoG `executeGraphTraversal` and Effect entry, including pending resumption | Shared `traversalProgram`, selecting `input.root` for the declared pending union, before restoration, traversal or leaf | `graph_traversal_entry_refusal/owner_refusal` |
| Direct HoG `resumeProjectedRetry` | Its runtime execution basis's binding before retry reconstruction/transaction | `projected_retry_resume_refusal/runtime_basis_mismatch` |

Root explicitly selected these new/resumed bound-work entries, and retained
ongoing kernel failure/retry/cursor/close primitives under the admitted entry
and their existing owned basis/scope invariants. They are **not newly gated**.
Root's initial shorthand `owner_refusal` for retry resume was corrected to that
owner's existing `runtime_basis_mismatch`; no code was added to the Public
algebra. Product `SDK And CLI` forbids public hosts from constructing bases,
events, retries or continuations; export alone does not make each kernel helper
an independent Public operation. The retained definition bindings and GTL
construction routes inspected select the guarded owners; no concrete retained
Public/GraphFunction binding independently selecting an ungated primitive was
found. This is the bounded operating-model claim, not arbitrary kernel-host
policing.

The exact owner projection enumerates 56 declarations and 45 callable leaves.
The callable census is: 10 bound appending/effect members above; 26 bound pure
members; 4 unbound setup appenders (`install`, `bind`, workspace clean/imported);
5 unbound pure members. Eleven declared members have no callable binding and
retain their existing unavailable behavior. Catalog construction/admit/view/apply
and conformance are pure; lower materialization/result/witness routines enter
through their fixed wrappers. Setup has no selected input binding and gains no
policy. Generic event admission and reconstruction remain generic. Several
installs and bindings in one store remain legal.

### Focused proof and conservation

All commands below run from `build_tenants/abiogenesis/typescript` in the sparse
worktree unless the absolute command specifies otherwise. Evidence directory:
`/private/tmp/abg-td78-work/codex-resume/`.

| Proof | Exact command / evidence | Outcome |
| --- | --- | --- |
| Build | `npm run build` → `candidate-build-3.log` | Pass; TypeScript and manifest generation |
| TD-78 installed discriminator and positives | `node --experimental-vm-modules --test test_env/tests/t292-td78-bound-product.test.mjs` → `td78-final.tap` | 8 pass (parent + 7 cases), 0 fail/skip; 273,627 ms |
| Adjacent installed scope, coordinates and Run schema | `node --experimental-vm-modules --test --test-concurrency=1 test_env/tests/r8-direct-hog-entry.test.mjs test_env/tests/t292-td34a-run-invocation-schema-owner.test.mjs test_env/tests/t287-installed-product-coordinate.test.mjs` → `adjacent-1.tap` | 15 pass, 0 fail/skip |
| Existing retry failure diagnostic | `node --experimental-vm-modules --test --test-name-pattern='the retry-resume HoG site' test_env/tests/t287-runtime-failure-diagnostic.test.mjs` → `retry-diagnostic-2.tap` | 1 pass, 0 fail/skip; downstream assertions preserved |
| Boundaries | `npm run lint:imports`; `npm run lint:lifecycle`; `npm run lint:calculus` → `lint-imports-2.log`, `lint-lifecycle-2.log`, `lint-calculus.log` | Pass: 30 shared modules/3 forbidden pairs; 281 modules/7 existing exceptions; 6 calculus modules/0 exceptions |
| Mechanical | `git diff --check`; `node --check test_env/tests/t292-td78-bound-product.test.mjs`; `node --check test_env/tests/t287-runtime-failure-diagnostic.test.mjs` | Pass |

The new lane installs two genuine regenerated Products with the same package
name and version (`@abiogenesis/typescript-tenant`, `5.0.0-rc.12`) and different
content. The second differs by a comment in shipped JS; its manifest is
regenerated and verified, not forged. Tests cover start and direct invoke
mismatch, exact pending `current_intent` mismatch, direct ABG opening, direct
HoG Promise/Effect and pending entry, and retry entry before reconstruction.
Each mismatch compares the entire durable event-log bytes before/after; HoG's
instrumented leaf sees zero reads. The bound effect-admission proof uses the
common materialization gate, with same-bound positive and cross-build pure
catalog admission control. The mixed-store case installs/binds both Products
lawfully and proves a matching sibling binding cannot satisfy the selected one.

Same-bound installed start/invoke and direct HoG execution produce Hello World.
A controlled process interruption before the sole F_D leaf creates a genuine
admitted pending occurrence; the exact installed continuation resumes that Run,
closes it once, and has no actor-invocation row. Only the interruption is
injected; all prefix creation and continuation execution use installed owners.
Cross-build `run_status` answers without append. No actor/provider or real
provider expenditure is needed.

The predecessor archive was built and packed from exact
`54024d63fdbf42d36d1508bb2a4d59f4cb73233c` with `npm run build` and
`npm pack --ignore-scripts --pack-destination /private/tmp/abg-td78-work/codex-resume/base --json`.
Only the mismatched-start discriminator was run against it, using the same
new lane restricted to `start`, with development support copied beside the
unpacked archive. Command:
`node --experimental-vm-modules --test /private/tmp/abg-td78-work/codex-resume/base/package/test_env/tests/t292-td78-bound-product.test.mjs`.
`base-discriminator-2.tap` records the expected failing zero-append assertion:
3 → 34 rows, 3,110,044 → 3,214,331 bytes (**31 rows and 104,287 bytes appended**).
No broad predecessor suite was run.

`compare-public.mjs` invokes the existing `PUBLIC_PROJECTION_PAYLOADS` and
`OWNER_CONTRACT_MODULE_SOURCES` producers from predecessor and candidate builds,
compares every serialized asset byte and SDK/CLI/documentation value, callable
path and package export key, and records the finite owner metadata census.
Exact command:
`node /private/tmp/abg-td78-work/codex-resume/compare-public.mjs /private/tmp/abg-td78-work/codex-resume/base/package /private/tmp/abg-td78/build_tenants/abiogenesis/typescript /private/tmp/abg-td78-work/codex-resume/public-comparison.json`.
Result: **78 Public assets, 18 operations, 56 definitions, 45 callable leaves,
15 package export paths; zero membership/value/key delta**. Both projection
digests are `sha256:48035b2163e1e92781a2b13c22c3de15c86adc9bbb523fef5d96448a1409d3d9`.
`declarations-3.json` records **486 emitted `.d.ts` files, byte-identical**.
Requirements, Public contracts and recorded event schemas/bytes are unchanged;
new refusal paths append nothing. TD-77 strict/recorded law remains unchanged.

Failed intermediate checks were bounded construction/test corrections, retained
in the evidence directory: the first alternate-product fixture omitted a
generator input; the predecessor unpack omitted its development package lock;
an effect-admission assertion expected the wrong existing message; the first
HoG gate used the direct fields before accounting for the pending input union;
and the HoG positive assertion expected Public `completed` instead of HoG
`closed`. The existing retry diagnostic fixture deliberately supplied a
synthetic basis without a binding; the new gate intercepted that missing
premise before its intended nested route failure. Root explicitly accepted
adding the admitted-entry premise to that fixture's existing controlled
dependency injection. Its real downstream route failure and cold-read assertions
remain intact; the real TD-78 mismatch lane is separate.

### Exact bytes, limits and return

The frozen authored payload is **14 source, 1 design and 2 test files**, plus
this Return (18 files total). `source-bytes.json` records all 17 payload paths,
lengths and SHA-256 values: **948,032 bytes**; SHA-256 of the compact sorted
path/length/hash array is
`442c2d5eaca3d70f30a2a0a3773d6c7c600a41dadff4302fe492a1afc94cbf88`.
The enclosing authored commit freezes this Return as well. Candidate generated
Product content is `sha256:3fb16d4fe103a89900a6d121474c54c3ea30181e6f9e5d8082d977fc605a4c99`;
predecessor content was `sha256:bd98d6d278fd2911cc7bded30418089d0784c7fc3aaabc2e7f1f0feac07f1672`.
The generated manifest is retained in temporary evidence; generated manifest and
capability graph changes are excluded from the authored commit.

Limits: one representative shared effect-admission path, not seven separately
executed materialization/result/witness/release scenarios; retry entry mismatch
is proven before reconstruction, not a newly run successful retry lifecycle;
one representative historical read, not the whole read/history population.
The pending positive is exact and model-free. Ongoing admitted kernel primitives
are not individually gated under Root's ruling. No live provider, whole suite,
full-history population, release qualification, installation/pin mutation,
merge or independent QA acceptance is claimed. Parent consumes the candidate;
QA does not gate the authorized merge. Any future concrete supported binding
that independently bypasses these entries invalidates this bounded census and
returns to Executive.

All selected checks are complete: **24 tests pass, 0 fail/skip** across the
three focused commands. The bounded Writer repair is closed as a candidate,
frozen by the enclosing authored commit on `codex/td78-bound-product`; its exact
hash is returned to Root. No selected check remains outstanding. Root owns
integration and consumption of this Return. Return and stop; no main/push mutation.
