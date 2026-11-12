# TD-26 PS Return: the start request's root mode defaults to `direct`

**Status: DONE. The `rootMode` default of the `run.invoke(start)` request is `direct` at its owner, `RUN_OPERATION_CONTRACTS.invoke.start` (`product/run_operation_contracts.ts`). The start law, every Program policy and the two invocation guards are unchanged. Through the installed Public CLI, a start that states nothing but defaults, with target `next`, of the default library's own Program reaches the Executive and stops at a scripted selection gap. Every request that states its root mode observes the same outcome on the base and the final build. Replay, artifact truth and lock reads over 29 recorded logs (the 19 default-library logs and the live rc.12 Run among them) are identical on both builds. Lanes: the same 46 files run before and after, 250 cases each. Base: 236 pass, 4 fail, 10 skip. Final: 240 pass, 0 fail, 10 skip. The only cases that change are the new lane's 4, red on the base and green on the final. Two gated, model-free lanes, run in addition with their gates set, agree on both builds. Nothing needs a ruling; three residuals are listed. Nothing is pushed or tagged.**

- Ticket: T-292, package TD-26 PS, second form. Writer: Claude Opus 5.5.
- Branch `claude/td26-ps-executive-supervised`, worktree `/private/tmp/abg-td26ps`, from local `main` at `5c9df5056`. The branch name is kept from the first form.
- T is `build_tenants/abiogenesis/typescript`. Paths without a prefix are under `T/code/src`. Line numbers are at the final commit unless marked `5c9df5056`.
- Commits, in order:
  - `4fa99698e` specification;
  - `74f7ec841` design;
  - `7a98dfd9d` source and the new lane;
  - the commit that carries this Return.
- The two earlier commits on the branch, `f62ee78bd` and `823dc7408`, are the first form's Return. Its trace is kept below, under "First-form trace".
- Scratch evidence is under `/private/tmp/abg-td26ps-work/`. The base copy is `base-root/` (rsync of `5c9df5056`, built clean). Scripts are in `scripts/`.

## Executive ruling and how it is realized

The ruling: the standard system program is the default library's Executive, started as it is started today, by a `direct` start of a Program whose default start is the Executive. The start request's root mode defaults to `direct`. `supervised` stays what the start law makes it: the policy of a Program entered only through its declared starts, selected by a request that states `supervised`.

### A. Specification, before and after (`4fa99698e`)

Each clause is taken from `gtl/public_start.ts` as coded: `resolveProgramStart`, `graphFunctionStartRefusal` and `directStartRefusal`. Identifiers do not change. The diff is 2 files, +22/−14.

**REQ-P-POLICY-013** (`specification/requirements/product/REQ-P-POLICY.md`), the paragraph after the two values.

Before:
> `supervised` is the default. It selects the admitted system program and session policy that own convergence inside GTL/HoG/ABG; it does not authorize a CLI, SDK, service, or installer loop around repeated starts. `direct` selects one admitted entry traversal without that Product policy overlay. `root_mode` shall remain outside `scope + target + until` and shall be lawful only when `until = converged`.

After:
> `direct` is the default. It selects one admitted entry traversal of a Program whose root-mode policy is `direct`, and the request names no start: the Program's default start for target `next`, the declared start that a published asset target names, or the named callable member for a `graph_function` target. `supervised` selects the one declared start that the request names, of a Program whose root-mode policy is `supervised`; such a Program admits no other entry. A `graph_function` target is a direct entry whatever root mode the request states. Neither mode authorizes a CLI, SDK, service, or installer loop around repeated starts. `root_mode` shall remain outside `scope + target + until` and shall be lawful only when `until = converged`.

Where each clause comes from:

| Clause | Law |
|---|---|
| `direct`: a Program whose policy is `direct`, no start named | `directStartRefusal`: `until = converged`, `startRef` undefined, `program.policies["abg.root_mode"] === "direct"` |
| default start for `next` | `resolveProgramStart`, target `next` resolves `abg.default_start_ref` |
| declared start named by a published asset target | `resolveProgramStart`, target `asset:<handle>` resolves through `publicAssetTargets` to a declared start |
| named callable member for `graph_function` | `graphFunctionStartRefusal`: the scope rule plus the direct law |
| `supervised`: the one declared start the request names, of a supervised Program | the supervised branch: `rootMode = supervised`, `startRef === target`, policy `supervised`, exactly one matching declared start (`missing_target` for none, `ambiguous_target` for several) |
| such a Program admits no other entry | a supervised policy fails `directStartRefusal`, so `next`, asset and `graph_function` entries are refused |
| `graph_function` is direct whatever mode is stated | `graphFunctionStartRefusal` never reads the stated mode |

**REQ-P-POLICY-023**, second paragraph.

Before:
> When `root_mode = direct`, `start` selects one admitted entry traversal. When `root_mode = supervised`, it selects the admitted standard system program, the default library's Executive. Neither the program nor HoG may mint runtime truth, and ABG shall not reorder the program's steps, select traversal topology, or become a scheduler.

After:
> When `root_mode = direct`, `start` selects one admitted entry traversal. When `root_mode = supervised`, it selects one declared start of a supervised Program. The standard system program is the default library's Executive. A `start` with target `next` under the default `direct` root mode, over a Program whose default start is the Executive, selects it. Neither the program nor HoG may mint runtime truth, and ABG shall not reorder the program's steps, select traversal topology, or become a scheduler.

**PRODUCT.md, "Standard System Program".**
- Before: "The standard system program is the default library's Executive, and the default `supervised` root mode selects it."
- After: "The standard system program is the default library's Executive. A start with target `next` under the default `direct` root mode, over a Program whose default start is the Executive, selects it."

**PRODUCT.md, default-library section.**
- Before: "…the Executive is the standard system program, and a start under the default `supervised` root mode selects it by naming its declared start."
- After: "…the Executive is the standard system program, and a start with target `next` under the default `direct` root mode selects it as the default start of the library's Program or of a consumer Program that composes it."

**Searched and left.** A search of `specification/` for `supervised`, `root mode`, `root_mode`, `rootMode` and `system program`, excluding `GOALS.md`, finds no other sentence that states the default or ties `supervised` to the system program:
- `PRODUCT.md:467` ("direct or supervised root control") lists the two modes and states no default.
- REQ-P-POLICY-014, REQ-P-QUAL-059, REQ-P-SCENARIOS-010 and `PRODUCT.md` A5-F07 and `ABG5-S03` name the standard system program without a root mode.
- Every other `supervised` in `requirements/abg/` is supervised dispatch, not the root mode.

### B. The default's sites

| Site | States or applies | Before | After |
|---|---|---|---|
| `product/run_operation_contracts.ts:110`, `runMetadata("start").defaults` | states; feeds the start member's `definitionDigest` | `{ fhMode: "direct", rootMode: "supervised" }` | `{ fhMode: "direct", rootMode: "direct" }` |
| `product/run_operation_contracts.ts:161`, the start request schema | applies: the request admission fills an omitted key | `v.optional(v.picklist(["direct", "supervised"]), "supervised")` | `… "direct")` |
| `contracts/schemas/operations/run/invoke/request.schema.json`, `$defs/start/properties/rootMode/default` | generated | `"supervised"` | `"direct"` (restored before commit; section H) |
| `contracts/schemas/public-operation.schema.json`, `PublicInvocation` and `PublicInvocationEnvelope` member 45 `rootMode/default` | generated | `"supervised"` | `"direct"` (restored before commit) |
| SDK intent `ProductRunInvocationSelectionIntent.rootMode` (`product/run_invocation_operation.ts:847`) | requires the mode; no default | required | unchanged |
| SDK typings (`.d.ts` of the request) | `rootMode?: "direct" \| "supervised"` with no default literal | — | unchanged |
| CLI `public/cli.ts` | takes one JSONL transport request carrying the whole invocation; has no grammar of its own, so the request schema's default applies | — | unchanged |
| test support `support/registered-graph-selection.mjs:236` `constructInstalledStartCall({ rootMode = "direct" })` | a support parameter default, already `direct`, always passed to the SDK | `direct` | unchanged |

Not defaults, checked and left:
- `product/run_invocation_operation.ts:651` `rootMode: "direct"` is the placeholder selection for a request that `startSelection` cannot read. Its empty target is refused `invalid_target` at `/target` before resolution.
- `public/gap_authority.ts:48` types `PublicStartIdentity.rootMode` as the literal `"supervised"`. It is a type only; no runtime check reads it (residual 2).
- `abg/invocation_admission.ts:1104`, `:1124`, `:1310`–`:1360` read the admitted request's `rootMode`, which always carries the default by then.

The start law (`gtl/public_start.ts`), the Program policies and the two guards (`product/invocation.ts:1155`, `abg/invocation_admission.ts:958-966`) are byte-identical to `5c9df5056`.

### C. The start table (ruling 3)

Observed on both builds:
- **Law code.** The new lane's unit case runs the start law over each Program policy. `scripts/start-table.mjs` gives the same table on the base, in `start-table.base.json`.
- **Public outcome.** The new lane's installed cases run one CLI process per row, against the default library's own Program and against a supervised Program.

Every start-law refusal reaches Public as `invalid_target` at `["/program"]`, with 0 events appended and no actor call. The request schema admits only `until: "converged"` (`v.literal("converged")`) on both builds, so no Public row varies `until`; the law refuses any other `until` with `unsupported_control`.

**The default library's own Program** (`program://abiogenesis/default-library/default@5`, policy `direct`, digest `sha256:d97c7579…9dca`, unchanged).

| Stated root mode | Target | Base | Final | Changes |
|---|---|---|---|---|
| omitted | `next` | admitted as `supervised`; law `unsupported_control`; Public refused | admitted as `direct`; **started**: `next`, the declared default start, the Executive; recorded `rootMode: direct` | **yes** |
| omitted | `declared_start`, the Program's start | admitted as `supervised`; `unsupported_control`; refused | admitted as `direct`; `unsupported_control`; refused | no |
| omitted | `declared_start`, another ref (law only) | `unsupported_control` | `unsupported_control` | no |
| omitted | `asset` (no published handle) | `unsupported_control`; refused | `missing_target`; refused | law code only; Public outcome identical |
| omitted | `graph_function`, the Executive | started; recorded `rootMode: supervised` | started; recorded `rootMode: direct` | **recorded mode** |
| `direct` | `next` | started, the Executive | same | no |
| `direct` | `declared_start` (either ref) | `unsupported_control`; refused | same | no |
| `direct` | `asset` | `missing_target`; refused | same | no |
| `direct` | `graph_function` | started; recorded `direct` | same | no |
| `supervised` | `next`, `declared_start`, `asset` | `unsupported_control`; refused | same | no |
| `supervised` | `graph_function` | started; recorded `supervised` | same | no |

**A supervised Program** (the lane's fixture `program://default-library-witness/supervised@5`, which composes the library Executive under `abg.root_mode: supervised` with one declared start).

| Stated root mode | Target | Base | Final | Changes |
|---|---|---|---|---|
| omitted | `declared_start`, its start | admitted as `supervised`; **started**: the declared start, the Executive | admitted as `direct`; `unsupported_control`; refused | **yes** |
| omitted | `declared_start`, another ref (law only) | `missing_target` | `unsupported_control` | law code only; Public would be `invalid_target` on both |
| omitted | `next`, `asset`, `graph_function` | `unsupported_control`; refused | same | no |
| `direct` | every target | `unsupported_control`; refused | same | no |
| `supervised` | `declared_start`, its start | started, the Executive | same | no |
| `supervised` | `declared_start`, another ref (law only) | `missing_target` | same | no |
| `supervised` | `next`, `asset`, `graph_function` | `unsupported_control`; refused | same | no |

**A Program with no root-mode policy.** Every row is refused `unsupported_control` on both builds.

**Identity moves for every start call; outcomes do not for stated modes.**
- The edit to the owner module moves the start member's `definitionDigest` and the Public function family digest (section H). So the identity of every `run.invoke` call moves, whether its mode is stated or omitted, as with any edit to that module.
- What a request that states its mode observes does not move. This is the third stop condition, and it is not met. It is shown by the 16 stated-mode Public rows, the 30 stated-mode law rows, the lane set (section I) and the recorded-log probes (section E).

**Which rows change.** Exactly the rows whose request omits the root mode, and among them only those where the old and new default select differently. Every row that states its root mode has the same law code and the same Public outcome on both builds. The new lane shows this on all 16 stated-mode Public rows (8 per Program) and all 30 stated-mode law rows.

### D. What a caller writes

**Starting the default library with nothing but defaults.** The Public `run.invoke(start)` request on the wire (the `request` of the JSONL `invocation`) is:

```json
{
  "program": {"ref": "program://abiogenesis/default-library/default@5", "digest": "sha256:d97c7579717f7989f1f76e3cadd1cf3cf886d86bbdfee3c7448c1f5be7c99dca"},
  "scope": "program",
  "target": {"kind": "next"},
  "until": "converged",
  "catalogView": {"ref": "<view ref>", "digest": "<view digest>"},
  "allowlist": ["<the Program's 12 callable members>"],
  "input": {"contract": {"ref": "<the Executive's input contract>", "digest": "…"}, "valueRef": "…", "valueDigest": "…", "value": "<governance work state>"},
  "sourceBasis": {"kind": "none"}
}
```

- The request carries no `fhMode` and no `rootMode`.
- Admission fills both, giving `"fhMode": "direct", "rootMode": "direct"`.
- The call's `requestDigest` and `invocationDigest` name that admitted request (§10.11 X1). A call whose digests name the raw request is refused `call_identity_mismatch`, as `t287-w2-05-static-binding-algebra` shows for `fhMode`.

The recorded `invocation_admitted.payload.publicStart` is:

```json
{"kind": "public_start_identity", "schemaVersion": "5.0.0",
 "programRef": "program://abiogenesis/default-library/default@5",
 "graphFunctionRef": "graph-function://abiogenesis/default-library/executive@5",
 "startRef": "start://abiogenesis/default-library/default@5",
 "scope": "program", "target": "next", "until": "converged", "rootMode": "direct"}
```

An SDK caller always states the mode, because the intent requires it. The same start through the SDK is `{memberKey: "start", target: {kind: "next"}, rootMode: "direct", fhMode: "direct"}` with `programRef: "program://abiogenesis/default-library/default@5"`.

The same request with `programRef` naming a consumer Program that composes the Executive starts that Program's Executive. Examples are the witness fixture and the sandbox-UAT lifecycle. Every Executive Run in use is started this way, and each states `direct` today.

**A caller that relied on the old default to start a supervised Program** now states it: `"rootMode": "supervised"` with `"target": {"kind": "declared_start", "start": {"ref": "<declared start>", "digest": "<sha256Canonical of the declared start>"}}`. Without the mode, the request is refused `invalid_target` at `["/program"]` (law `unsupported_control`) and appends nothing.

Searched for such callers, none found:
- **SDK callers.** None can omit the mode.
- **Callers that build the request or the selection themselves.** These state `rootMode`:
  - `w2-steel-serial-branch-installed:516`;
  - `w2-steel-single-start-installed:509`;
  - `steel-consumer-declaration:513`;
  - `r5-invocation-admission:636`, `:713`;
  - `t287-w2-05-static-binding-algebra:124`;
  - `t287-st1`.
- **Other request literals.** `t287-installed-product-coordinate:51` builds a partial start request for the authority-slot comparison only, and never admits it as a start.
- **Every supervised start in the lanes and support states `supervised`.** The sites are:
  - `t287-selected-action`;
  - `t287-exact-construction-intent`;
  - `t287-rp2-correction-carriers`;
  - `support/t287-s03-automatic.mjs`;
  - `support/root-installed-environment.mjs:965`;
  - ST-1.
- **Method.** A search of `test_env` and `scripts` for start targets without a nearby `rootMode` finds only the authority-comparison literal above.

### E. Recorded Runs

The replay, artifact-truth and lock probes from TD-28b (`scripts/replay-log.mjs`, `probe-artifact-truth.mjs`, `probe-lock.mjs`) run over the TD-28b replay set. That set is 29 logs: the 19 default-library logs (`dl19.txt`), the live rc.12 Run `/private/tmp/abg-demo-tmp/abi5-root-env-hRgyFy/runtime/events.jsonl`, and 9 others.

| Probe | Base | Final |
|---|---|---|
| replay (`replay-base.jsonl`, `replay-final.jsonl`) | 29 logs, 22 Runs | byte-identical |
| artifact truth (`truth-*.jsonl`) | 29 logs | byte-identical |
| lock (`lock-*.txt`) | 219 lines | identical except the build path in stack traces |

Five logs report the same pre-existing replay refusals on both builds. All five concern `run_stopped` history; TD-28b's base replay of the same set also reports five.

**Does a recorded request that omitted the root mode exist?**
- **None can be identified, and none reads differently.**
- **What a log keeps.**
  - A log records the admitted request only. `invocation_admitted` carries `publicStart` with the admitted `rootMode`, `publicRequestDigest` and `invocationDigest`; the raw Public request is not recorded.
  - Under X1 a request that omitted its mode and one that stated the admitted mode have the same recorded identity.
  - No reader re-admits a recorded request through the request schema. `publicRequestDigest` is compared recorded-to-recorded only. So a recorded start reads by its recorded mode on both builds.
- **Scans** (`scripts/scan-public-start.mjs` over the 29 replay logs, and over all 267 `*.jsonl` logs under the evidence root that carry `publicStart`):

| Recorded `publicStart` | Replay set | Evidence root |
|---|---|---|
| `rootMode: direct`, target `next` | 28 admissions, 21 logs | 100 admissions, 60 logs |
| `rootMode: direct`, target `graph_function:…` | 30 admissions, 3 logs | 95 admissions, 26 logs |
| `rootMode: direct`, target `asset:…` | 4 admissions, 4 logs | 4 admissions, 4 logs |
| `rootMode: supervised`, `start://selected-action/root@5` | 1 admission, 1 log | 81 admissions, 34 logs |
| `rootMode: supervised`, `start://exact-intent/root@5` | 1 admission, 1 log | 20 admissions, 20 logs |
| `rootMode: supervised`, `start://s03-automatic/root@5` | — | 26 admissions, 15 logs |
| `null` (an `invoke`, not a start) | 3 admissions, 3 logs | 92 admissions, 90 logs |
| `{}` on `direct` invocations (U1 physical logs of T-287) | — | 25 admissions, 9 logs |

- **No recorded start lacks `rootMode`.** The 25 empty objects are on `invocationVariant: "direct"` invocations of the native-work Program. They carry `{}` where later logs carry `null`; they are invocations, not starts.
- **Under the base build an omitted mode admits `supervised`.** So a recorded `direct` start made on the base stated its mode.
- **The recorded `supervised` starts are of the three supervised fixture Programs** (`selected-action`, `exact-intent`, `s03-automatic`). Their lanes and support state `supervised` today.

### F. Design (`74f7ec841`)

**`T/design/M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md`**, the `RunStartDefaults` block in the Public request types. The owner is `RUN_OPERATION_CONTRACTS.invoke.start` in `product/run_operation_contracts.ts`.
- Before: `RunStartDefaults = { fhMode: "direct"  rootMode: "supervised" }`.
- After: `rootMode: "direct"`.
- The kept sentence "`run.invoke(start)` has exactly the modes and defaults above." now continues: "Its owner, `RUN_OPERATION_CONTRACTS.invoke.start` in `product/run_operation_contracts.ts`, states each default twice: as the request schema's optional default and in `metadata.defaults`."

**Retired text.** The replaced text (lines 747-750 and 816-818 at `5c9df5056`) is appended verbatim after `---` to `T/design/history/M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN__RETIRED_SECTIONS.md`.

**Read and left.** None of these states the request default or that `supervised` selects the system program:
- `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md:1266` and `:2152-2180` (the start law);
- `T287_PENDING_CONSUMER_CONTINUATION_DESIGN.md:908-972`, whose "direct/next defaults" are a helper's defaults;
- `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md`, which declares the Program `direct` and states no request default.

### G. Tests

**Changed: none.** No lane or support module relies on the old default to start a supervised Program (section D), so no kept assertion moves.

**New: `T/test_env/tests/t292-td26-ps-default-root-mode.test.mjs`** (247 lines, 4 cases).

1. **"the start request admits an omitted root mode as direct and a stated root mode as stated".**
   - `metadata.defaults` is `{fhMode: direct, rootMode: direct}`.
   - An omitted mode admits as `direct`; each stated mode admits as stated; another value is refused at `/rootMode`.
2. **"start law table: an omitted root mode selects as direct over each Program policy".**
   - Covers 3 modes × 3 Program policies (`direct`, `supervised`, absent) × 5 targets.
   - Each request is admitted through the request schema and resolved by `resolveProgramStart` or `graphFunctionStartRefusal`, as Product resolution calls them.
   - The absent rows equal the `direct` rows.
3. **"Public start table over the default library Program: a default-only next start reaches the Executive".**
   - **Setup.** One packed, verified and installed tenant (`installTenantOnce`, `packed_artifact`, `worksite_construction`). The workspace is bound to the library owner's install (HS3, `workspaceProductIndex: 0`). The Catalog view is the Program's callable membership, and the Program's own run environment resources are used.
   - **Rows.** 12 rows: 3 modes × `next`, `declared_start`, `asset`, `graph_function`. Each is one installed CLI process over the closed event resource.
   - **Actor.** A scripted selector answers every selection with a gap; any other role exits 1. No model is called.
   - **Calls.** A lawful selection is populated by the shipped SDK `constructInstalledStartCall`. A selection the law refuses has no SDK population, so its call carries the Program's lawful population with the row's target and mode, built with `constructInstalledPublicDefinitionCall`. This is lawful because Product resolves the start before it compares slots.
   - **Default-only rows.** These send neither `fhMode` nor `rootMode`. Their digests name the request as the installed contract admits it. The lane checks that the call's `requestDigest` equals the digest of the admitted wire request.
   - **Per-row observation.** The refusal code and path, events appended and actor calls; or the recorded `publicStart`, the Executive, the stop disposition and the selection gap.
4. **"Public start table over a supervised Program: only a start that states supervised selects its declared start".**
   - Same shape as case 3, over a fixture Product whose one Program is a supervised copy of the witness consumer Program (`supervised@5`).
   - That Program is the lane's own fixture; no existing Program changes its policy (ruling 4).

**Red on the base, run from `base-root` with the lane copied in** (`newlane.base.tap`):
- **Case 1** fails on `metadata.defaults` (`rootMode: supervised`).
- **Case 2** fails at "root mode absent, Program policy direct": `next` is `unsupported_control`, `asset` is `unsupported_control`.
- **Case 3** fails on exactly two rows:
  - `absent next` is refused instead of started;
  - `absent graph_function` records `rootMode supervised`.

  The other 10 rows are equal.
- **Case 4** fails on exactly one row: `absent declared` starts. The other 11 rows are equal.

**Final.** Green, 4/4 (lane table in section I).

### H. Generated contracts and identity

**Restored before commit.** `npm run build` and `scripts/refresh-candidate-basis.mjs` change 24 tracked generated files: `contracts/**`, `product-toolchain-manifest.json` and `test_env/fixtures/abi5-root-candidate-basis.json`. They were restored with `git checkout --` before each commit, and the Executive regenerates them at merge.

**Content changes** (`scripts/json-diff.mjs`, `contracts-diff.txt`). Three values change; every other change is a digest or a reference that embeds one:
- `contracts/schemas/operations/run/invoke/request.schema.json` `/$defs/start/properties/rootMode/default`: `"supervised"` → `"direct"`;
- `contracts/schemas/public-operation.schema.json` `/$defs/PublicInvocation/oneOf/45/properties/request/properties/rootMode/default`: the same;
- `contracts/schemas/public-operation.schema.json` `/$defs/PublicInvocationEnvelope/oneOf/45/properties/requestCandidate/properties/rootMode/default`: the same.

**What pins the start member.**
- `contracts/public-operations/run/invoke/operation-contract.json` changes 20 digests. Both members' `definitionDigest` and their contracts' `sourceModuleDigest` move, because the owner module changed; the start member's request `memberDigest` and `schemaRef` move too.
  - Start `definitionDigest`: `sha256:5e72ba65…e914` → `sha256:fe48a6ad…3ad1`.
  - Invoke `definitionDigest`: `sha256:2f51e92b…ddaf` → `sha256:cdbebdc9…1c02`.
  - Row digest: `sha256:910c0716…2075` → `sha256:72726a06…c495`.
- The Public function family digest, which every operation contract carries, moves from `sha256:94a6be2f…79b1` to `sha256:f728ee84…78fc8`. So each of the other 17 operation contracts changes 4 digests (`familyDigest`, `familyRef`, `rowDigest`, `rowRef`), and `contracts/public-functions/adapter-projection.json` changes 4.
- `contracts/schemas/public-operation.schema.json` changes 102 digests besides the two defaults.
- `contracts/capabilities/capability-definition-graph.json`:
  - the graph digest moves `sha256:4afda51d…a98b` → `sha256:29348cb2…d21a`;
  - each of the 16 rows keeps its `capabilityId` and its content except digests;
  - `owningPublicContracts` order follows the new digests, and as sets the rows are equal.
- `product-toolchain-manifest.json` changes 114 file digests.
- The request schema file is `sha256:8f26a680…840c` → `sha256:bf404977…0df7`.

**Identity digests** (`refresh-candidate-basis.mjs`; the same after the rebuild following `7a98dfd9d`):

| | Base `5c9df5056` | Final |
|---|---|---|
| `artifactDigest` | `sha256:fef29348ed850f904b55578e5cf3ee7948fa11127e76ac8494e55e60f38109d0` | `sha256:a681fb46b1b41a6cc832b64da1ae1d3844ee6357ec5d2aea9b32aec1e23dcad4` |
| `productContentDigest` | `sha256:cf8787da8f1b268f7816f9c62754630dacbc6c919b469f4718310f25ab999eb2` | `sha256:d84fe9dc8ccc9127cce170c23c882ca0589a9158215f6ea41af0d30e55500b14` |
| `manifestDigest` | `sha256:e744a7bceda5b58a8f9cad2b8e58e5f20843678d71c8501af062eb5ca3d4e0ab` | `sha256:6fbe9c9a64535d6f37f596e71472031f9d930092297f2aded7d14a37e1891f5b` |
| capability `graphDigest` | `sha256:4afda51db02375d4d58b1a86dde5b29d153cddc37133a0fd81e86fac41c6a98b` | `sha256:29348cb267695e25ca3224055124a42bd62163d9f92527dd395ceff6b241d21a` |

The library Program body and digest are unchanged (`sha256:d97c7579…9dca`), as are its declared start (`sha256:72560165…aa68`) and policies.

**Checks.** `npm run build`, `lint:imports` (3 forbidden owner pairs hold), `lint:lifecycle` (288 modules, 7 allow-listed sites, no offender) and `lint:calculus` (6 modules, no offender) pass.

### I. Lanes before and after

Each file runs alone, in the foreground order of `lane-list.txt`, with the brief's command (`scripts/lane.sh`). The summaries are `lanes-base/summary.txt` and `lanes-final/summary.txt`; the taps are beside them.
- **Base.** Run from `base-root` (`5c9df5056`, with the new lane copied in). `test_env` is not packed (`package.json` `files` is `build/**`, `contracts/**` and the manifest), so the copy does not change the base artifact.
- **Final.** Run from the worktree after the rebuild that follows `7a98dfd9d`, with the regenerated contracts, manifest and refreshed candidate basis in the working tree.

| Lane | Base tests/pass/fail/skip | Final tests/pass/fail/skip | Base s | Final s |
|---|---|---|---|---|
| `d2-frame-installed` (`tests/d2-frame-installed.mjs`) | 1/0/0/1 | 1/0/0/1 | 1 | 0 |
| `m5-installed-graph-edge` | 2/2/0/0 | 2/2/0/0 | 97 | 91 |
| `m5-s03-authority` | 4/4/0/0 | 4/4/0/0 | 45 | 48 |
| `r5-invocation-admission` | 2/2/0/0 | 2/2/0/0 | 53 | 48 |
| `steel-consumer-declaration` | 1/0/0/1 | 1/0/0/1 | 0 | 0 |
| `t287-c2-child-program` | 4/4/0/0 | 4/4/0/0 | 1 | 0 |
| `t287-c2-core-environment` | 7/7/0/0 | 7/7/0/0 | 1 | 1 |
| `t287-default-library` | 35/34/0/1 | 35/34/0/1 | 266 | 267 |
| `t287-exact-construction-intent` | 1/1/0/0 | 1/1/0/0 | 67 | 70 |
| `t287-held-owner-fold-reuse` | 1/1/0/0 | 1/1/0/0 | 43 | 45 |
| `t287-management-context` | 13/12/0/1 | 13/12/0/1 | 1 | 1 |
| `t287-retry-run-prefix` | 3/3/0/0 | 3/3/0/0 | 49 | 51 |
| `t287-rp2-correction-carriers` | 1/1/0/0 | 1/1/0/0 | 48 | 49 |
| `t287-selected-action` | 1/0/0/1 | 1/0/0/1 | 1 | 1 |
| `t287-st1-installed-cross-owner-hello` | 3/3/0/0 | 3/3/0/0 | 123 | 131 |
| `t287-w2-05-static-binding-algebra` | 4/3/0/1 | 4/3/0/1 | 1 | 1 |
| `w2-steel-serial-branch-installed` | 2/0/0/2 | 2/0/0/2 | 0 | 0 |
| `w2-steel-single-start-installed` | 1/0/0/1 | 1/0/0/1 | 0 | 0 |
| `w2-steel-single-start` | 7/7/0/0 | 7/7/0/0 | 0 | 1 |
| `uat/harness` | 33/33/0/0 | 33/33/0/0 | 69 | 71 |
| `t287-default-library-fulfillment` | 7/7/0/0 | 7/7/0/0 | 2 | 2 |
| `t287-default-library-prerequisites` | 7/7/0/0 | 7/7/0/0 | 0 | 0 |
| `t287-default-library-reviews` | 10/10/0/0 | 10/10/0/0 | 146 | 147 |
| `t287-default-library-recoverable-failure` | 5/5/0/0 | 5/5/0/0 | 201 | 208 |
| `t287-readable-stops` | 5/5/0/0 | 5/5/0/0 | 206 | 212 |
| `t287-registered-graph-selection` | 1/1/0/0 | 1/1/0/0 | 63 | 64 |
| `t287-recursive-registered-selection` | 7/7/0/0 | 7/7/0/0 | 76 | 79 |
| `steel-basic-cli-public` | 1/1/0/0 | 1/1/0/0 | 295 | 293 |
| `t287-public-groups` | 3/3/0/0 | 3/3/0/0 | 26 | 24 |
| `hello-product-boundary` | 1/1/0/0 | 1/1/0/0 | 6 | 5 |
| `t287-framework-handoff-types` | 6/6/0/0 | 6/6/0/0 | 33 | 34 |
| `t287-wave2-owner-contract-source-set` | 15/15/0/0 | 15/15/0/0 | 0 | 0 |
| `t287-w2-05-install-catalog-owner-chain` | 3/3/0/0 | 3/3/0/0 | 81 | 81 |
| `r1-packed-artifact` | 1/1/0/0 | 1/1/0/0 | 29 | 28 |
| `r2-clean-install` | 1/1/0/0 | 1/1/0/0 | 53 | 51 |
| `r3-workspace-binding` | 1/1/0/0 | 1/1/0/0 | 36 | 35 |
| `t287-historical-source-resource` | 4/4/0/0 | 4/4/0/0 | 324 | 316 |
| `r10-child-proof` | 10/10/0/0 | 10/10/0/0 | 113 | 111 |
| `t287-cross-cut-public-read` | 5/5/0/0 | 5/5/0/0 | 590 | 578 |
| `t287-selected-action-authority` | 3/2/0/1 | 3/2/0/1 | 1 | 1 |
| `t287-native-assessment-evidence` | 4/4/0/0 | 4/4/0/0 | 1 | 1 |
| `t292-td36r-admitted-binding-owner` | 1/1/0/0 | 1/1/0/0 | 33 | 33 |
| `t292-td36r-bind-door-strings` | 6/6/0/0 | 6/6/0/0 | 33 | 33 |
| `t292-td36r-remaining-owners` | 6/6/0/0 | 6/6/0/0 | 0 | 1 |
| `t292-td36s-bind-string-rule` | 7/7/0/0 | 7/7/0/0 | 40 | 39 |
| `t292-td26-ps-default-root-mode` | 4/0/4/0 | 4/4/0/0 | 164 | 165 |
| **Total** | 250/236/4/10 | 250/240/0/10 | | |

**Per case** (`scripts/case-diff.py`, every `ok`/`not ok`/`SKIP` line of each base tap against its final tap):
- 4 cases change, all in `t292-td26-ps-default-root-mode`, each `not ok` → `ok`.
- No case on kept behaviour changes. No case timed out, so none was rerun.

**The `t292-td36r-*` and `t292-td36s-bind-string-rule` lanes.** On the final they compare the packed archive with the candidate basis refreshed by `scripts/refresh-candidate-basis.mjs`. That refresh lives in the working tree, uncommitted, and is restored before the Return commit. They pass: 1/1, 6/6, 6/6 and 7/7. They were not run against the committed (base) fixture.

**Skips: 10 on each build, the same cases.**
- **Skipped because it needs a live provider:** `t287-default-library` "one installed Public default-library invocation reuses observed files, corrects actual work and independently closes" (`ABI5_DEFAULT_LIBRARY_LIVE`).
- **Skipped by their own gates, which need frozen artifacts, retained evidence or an isolated author territory, not a provider:**
  - `d2-frame-installed` (`ABI5_D2_FRAME_RUN` and the frozen-artifact territory);
  - `steel-consumer-declaration` (`ABI5_STEEL02_*`);
  - `w2-steel-serial-branch-installed`, 2 cases (`ABI5_STEEL04_*`);
  - `w2-steel-single-start-installed` (`ABI5_STEEL03_*`);
  - `t287-w2-05-static-binding-algebra` case 4 (`ABI5_PREPARATION_RESOLVE_CALL`);
  - `t287-selected-action-authority` case 3 (`ABI5_SELECTED_ACTION_OWNER_SUBJECT`).
- **Gated, model-free, and run in addition with the gate set** (`extra-base/`, `extra-final/`):
  - `t287-selected-action`, the supervised declared-start lane, which states `supervised`. With `ABI5_SELECTED_ACTION_EVIDENCE_ROOT` set to a fresh scratch directory it passes 1/1 on both builds (216 s base, 221 s final).
  - `t287-management-context` with `ABI5_CONTEXT_PUBLIC_PROOF=1` passes 13/13 on both builds; its Public-start proof makes 0 provider calls.

**Continuation.** The recorded-log probes of section E cover replay, artifact truth and lock reads; they do not exercise continuation. Continuation is covered by the continuation lanes in the set, with the same results on both builds:
- `t287-exact-construction-intent` (`run.continue(current_intent)` through the installed CLI);
- `t287-default-library` (Public start and `run.continue` CLI across a SIGKILL interruption);
- `t287-retry-run-prefix`;
- `t287-held-owner-fold-reuse`.

### J. Lines changed

`git diff --numstat 5c9df5056` over `specification`, `T/code/src`, `T/design` and `T/test_env`: 6 files, +290/−18.

| File | + | − |
|---|---|---|
| `specification/PRODUCT.md` | 6 | 4 |
| `specification/requirements/product/REQ-P-POLICY.md` | 16 | 10 |
| `T/design/M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md` | 4 | 2 |
| `T/design/history/M05_S06_…__RETIRED_SECTIONS.md` | 15 | 0 |
| `T/code/src/product/run_operation_contracts.ts` | 2 | 2 |
| `T/test_env/tests/t292-td26-ps-default-root-mode.test.mjs` | 247 | 0 |

### K. Deviations

1. **The lane's supervised Program is new and lane-owned.** It is `program://default-library-witness/supervised@5` in the lane's own fixture Product, a copy of the witness consumer Program with `abg.root_mode: supervised`. It shows the supervised rows through the Public surface on a Program that composes the Executive. No existing Program, fixture or support changes its policy.
2. **The design note gains one sentence that names the default's owner.** Ruling 6 asks for the kept sentences to be restated with file and symbol; the sentence carries that citation.
3. **Lane runs.** Each build's lane set runs as one sequential command, one file at a time with the brief's command (`scripts/lane.sh`). The harness moves a command that passes 180 s to the background; each batch was waited for before anything else was run.
4. **`uat/harness.test.mjs` is in the set** because it names `rootMode`. It needs no provider.
5. **Two gated lanes ran in addition with their gates set**, because they are model-free and exercise starts: `t287-selected-action` (a supervised declared start) and the Public-start proof of `t287-management-context` (section I). Their gated runs are outside the 46-file table.

### L. Residuals

1. **A code comment is wrong.** `gtl/public_start.ts` says "An absent policy is the supervised default". By the law as coded, an absent policy admits neither mode: the direct law requires `direct` and the supervised branch requires `supervised`. The ruling keeps the start law unchanged, so the comment is left; correcting it is a realization_refactor of one comment.
2. **A type-only literal.** `public/gap_authority.ts:48` types `PublicStartIdentity.rootMode` as `"supervised"`, while every recorded start of the Executive is `direct`. No runtime check reads it: the module's key lists (`AUTHORITY_KEYS`, `PUBLIC_START_KEYS`, `SOURCE_KEYS`) are not referenced, and `constructPublicGapAuthority` has no caller in `code/src` or `test_env` besides the `public/index.ts` export. This belongs to the Public gap-authority package (P5), or to the technical debt register as possibly unused code.
3. **Identity regeneration at merge.**
   - The specification edit changes the qualification mirrors, which the Executive restages at merge.
   - The generated contracts, manifest and candidate basis are regenerated at merge (section H).
   - Until then, the `t292-td36r-*` and `t292-td36s-bind-string-rule` lanes fail on the committed fixture. They are shown green with the fixture refreshed in the working tree (section I).

## First-form trace (stopped; kept as recorded)

The first form made the Executive's Program `supervised` and stopped at the trace. Its sections follow unchanged. "Ruling" in them means the first form's rulings.

### 1. Start table (ruling 2)

**Method.**
- `trace-start-law.mjs` builds the library publication with `constructDefaultGovernanceLibraryModulePublication`. It runs `resolveProgramStart` and `graphFunctionStartRefusal` (`gtl/public_start.ts`) over every request shape the law distinguishes: 3 stated root modes × 5 targets × 2 `until` values, 30 rows.
- Each row runs on the base Program (`abg.root_mode: direct`) and on the same Program with `supervised`.
- On a probe build with only `gtl/default_library.ts:318` set to `supervised`, the law gives the "after" column on all 30 rows.

**The Program.**
- `program://abiogenesis/default-library/default@5` declares one start, `start://abiogenesis/default-library/default@5`, which runs `graph-function://abiogenesis/default-library/executive@5`.
- `abg.default_start_ref` names that start.
- The Program publishes no asset targets.

**Rows.** Every row with `until` other than `converged` is refused `unsupported_control`, on the base and after. At the Public surface the request schema admits only `converged`. Every start-law refusal reaches Public as `invalid_target` at `["/program"]`: `programStartRefusal` (`product/execution_resolution.ts:282-294`), stage `catalog`, maps through `resolutionRefusalCode` (`product/run_invocation_operation.ts:283-290`). The rows below are for `until: converged`.

| Stated root mode | Target | Today (policy `direct`) | After (policy `supervised`) |
|---|---|---|---|
| absent (the default, `supervised`) | `next` | refused `unsupported_control` | refused `unsupported_control` |
| absent | `declared_start` naming the declared start | refused `unsupported_control` | **started**: `declared_start`, the Executive |
| absent | `declared_start` naming another ref | refused `unsupported_control` | refused `missing_target` |
| absent | `asset` | refused `unsupported_control` | refused `unsupported_control` |
| absent | `graph_function` (a member) | admitted by the law (TD-35: a direct start; the stated mode is not read) | **refused `unsupported_control`** |
| `supervised` | each target | as the absent rows | as the absent rows |
| `direct` | `next` | **started**: `next`, the default start, the Executive | **refused `unsupported_control`** |
| `direct` | `declared_start` (either ref) | refused `unsupported_control` | refused `unsupported_control` |
| `direct` | `asset` | refused `missing_target` (no asset targets) | refused `unsupported_control` |
| `direct` | `graph_function` (a member) | admitted by the law | **refused `unsupported_control`** |

The `invoke` member is not governed by the start law. It is added here because it decides the stop:

| Member | Request | Today | After |
|---|---|---|---|
| `invoke` | `catalogHandle` of the Testing or UAT wrapper under the library Program | admitted; observed in "RC7 fixed admission" on the base | Product refuses `authority_mismatch`, "a supervised Program may be entered only through public start selection" (`product/invocation.ts:1155-1162`); Public gives `invalid_intent` at `["/request"]` with no events (observed on the probe build). Behind it, ABG refuses `selection_mismatch`, "a supervised Program cannot be admitted through direct invocation" (`abg/invocation_admission.ts:958-966`, read). On every Public path Product refuses first. |

### 2. What a caller would write

**A start of the default library after the change.**
- The SDK selection intent is `{memberKey: "start", target: {kind: "declared_start", startRef: "start://abiogenesis/default-library/default@5"}, rootMode: "supervised", fhMode: "direct"}`, with `programRef: "program://abiogenesis/default-library/default@5"`.
- The Public request that Product populates from it has:
  - `scope: "program"`;
  - `target: {kind: "declared_start", start: {ref: "start://abiogenesis/default-library/default@5", digest: "sha256:72560165afd84c5c5e9c30991f09e497eef722ff919f320b0ed212ed9b01aa68"}}`, where the digest is `sha256Canonical` of the declared start (`product/run_invocation_operation.ts:1030-1035`);
  - `until: "converged"`;
  - `rootMode` omitted, which defaults to `supervised` (`product/run_operation_contracts.ts:161`), or stated as `supervised`.

**Today's request after the change.** `{target: {kind: "next"}, rootMode: "direct"}` against the library's own Program is refused at Product resolution: law code `unsupported_control`, Public `invalid_target` at `["/program"]`.

**Who starts the library's own Program today: no lane and no maintained caller.**
- Every Executive Run in the lanes, and the live rc.12 Run, starts a consumer Program that copies the library Program: the witness fixture, the sandbox-UAT lifecycle or the registered-selection fixtures (section 4).
- The one maintained use of the library's own Program is the RC7 fixed route through `invoke`.
- The one recorded log of the library's own Program (TD-28 map §6.4, `release-qualification-rc6-01/rc7-held-session-author-02/blocked-testing-diagnostic-001/runtime.events.jsonl`) records `invocationVariant: "direct"` and no `rootMode`. It is a fixed-route invocation, read from the main checkout.

### 3. The stop

**Observed.** Both runs are one case each, run with the brief's command and `--test-name-pattern='RC7 fixed admission'` on `test_env/tests/t287-default-library.test.mjs`.

| Build | Result | Wall |
|---|---|---|
| base | `ok 1`: 1 test, 1 pass | 86 s |
| probe (only `:318` set to `supervised`) | `not ok 1` at `:2487` (`completedRun`): `{"label":"fixed-testing","exitCode":1,"outcomeKind":"refusal","code":"invalid_intent","issuePaths":["/request"],"failure":null,"events":[]}` | 63 s |

The probe edit was reverted and the base rebuilt. `git status` shows no tracked change.

**Why the route has no lawful form under a supervised library Program.**
- The route invokes the registered Testing wrapper and then the UAT wrapper with no selector, through `invoke` (the `direct` variant). The callers are `test_env/uat/public-setup.mjs` `constructFixedTestingCall` (`:419`), `constructFixedUatCall` (`:444`) and `constructFixedWrapperCall` (`:450`), with `libraryProgram` (`:401`). The design is `design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md` "RC7 fixed Testing/UAT direct wrapper route" (`:260`): "Product makes the Executive optional".
- F2-PROGRAM-001 (`:403`) keeps the library's wrapper rows on `program://abiogenesis/default-library/default@5`. A consumer Program cannot host the route: population refuses `wrong_owner`, and Public reports `invalid_target` at `/program`.
- Under a supervised policy the start law offers no other entry:
  - the Program declares one start, the Executive;
  - a `graph_function` start is a direct start, refused under `supervised` (section 1);
  - the Program publishes no asset targets.

**Stop conditions met.**
- "A kept lane's claim cannot be stated with the new start." The lane claims that a Public direct Testing state Result admits a direct UAT invocation on the library Program.
- Ruling 1. Keeping the lane needs a change to law other than the Program's policy: the two guards in section 1.
- Lanes that carry the route:
  - `t287-default-library` "RC7 fixed admission" (`:2399`, installed, observed red);
  - "RC7 fixed proof: public-setup invokes Testing directly…" (`:1342`). It stubs the SDK constructor, so it does not reach the guard, but its claim is the same route.
- The UAT runner, scenarios and harness do not call the fixed route: a search of `uat/runner.mjs`, `uat/scenarios.mjs` and `uat/harness.test.mjs` finds no call.

### 4. Consumer Programs inherit the policy (ruling 4)

Two consumer Programs build their policies by spreading the library Program's policies:
- `test_env/support/default-library.mjs:22-25`, the witness fixture `program://default-library-witness/witness@5`. Its Runs are the live rc.12 Run and 18 of the 19 recorded default-library logs.
- `test_env/uat/consumer.mjs:35-41`, the sandbox-UAT lifecycle `program://abi5-tests/sandbox-uat/lifecycle@5`.

`probe-consumer-policy.mjs` gives:

| Program | Base: root mode, digest | Probe build, unpinned | Probe build, with `'abg.root_mode': 'direct'` pinned |
|---|---|---|---|
| library `…/default-library/default@5` | `direct`, `sha256:d97c7579…9dca` | `supervised`, `sha256:67f4543c…b459` | (not pinned) |
| witness `…/witness@5` | `direct`, `sha256:4c24090c…e651` | `supervised`, `sha256:f21befc0…2884` | `direct`, `sha256:4c24090c…e651` (equals base) |
| sandbox-UAT `…/lifecycle@5` | `direct`, `sha256:ef753b16…8d98` | `supervised`, `sha256:d5913f08…0237` | `direct`, `sha256:ef753b16…8d98` (equals base) |

- Without a pin, the change flips both consumers to `supervised`. That is what ruling 4 excludes.
- With one explicit pin in each spread, both keep `direct` with a byte-identical Program digest. The pin is a two-line support change and is digest-neutral.
- Two unit lanes spread the library policies into in-test Programs and would follow the library: `t287-default-library-reviews.test.mjs:261` and `t287-default-library-fulfillment.test.mjs:129`.

**Root-mode policies in source.**
- `supervised`: `gtl/consensus.ts:4910` (One Surface) and `gtl/worksite_command_execution.ts:257` (the revision child, `starts: []`).
- `direct`: every other Program, including `gtl/default_library.ts:318`. The others are:
  - `worksite_command_execution.ts:272`, `:288`;
  - `native_workspace_work.ts:40`;
  - `requirement_handoff.ts:132`, `:183`;
  - `semantic_stage_publication.ts:131`;
  - `semantic_revision_publication.ts:84`;
  - `self_conformance.ts:51`, `:160`, `:190`;
  - `worksite_c0.ts:199`, `:341`;
  - `worksite_construction.ts:452`;
  - `worksite_branch_construction.ts:457`;
  - `worksite_command_forward.ts:81`.

**Root-mode policies in fixtures and support.**
- `supervised`:
  - `fixtures/exact-intent-product`;
  - `fixtures/t287-selected-action-product`;
  - `fixtures/t287-s03-automatic-product`;
  - developer-mini One Surface (one of six Programs);
  - the in-test override in `r5-invocation-admission`.
- `direct`, declared:
  - `fixtures/registered-selection-product`;
  - `language-smoke`;
  - `language-structural`;
  - `flavored-catalog-product`;
  - `native-semantic-revision`;
  - developer-mini (five Programs);
  - `falsifiers/runtime-f09-product`;
  - the support Programs (`serial-branch-worksite-program`, `single-start-worksite-program`, `d2-static-smoke`, `d2-frame-fixture`, `d5-authentic-preserved-result-fixture`, `t287-generic-job-intake`);
  - `w2-steel-single-start`;
  - `t287-retry-run-prefix`.
- Inherited from the library: the witness fixture and the sandbox-UAT lifecycle, above.
- `support/root-installed-environment.mjs:918`, `:965` take the start or direct variant from the selected Program's own policy. Its callers select root fixtures, not the default library.

### 5. Corrected site list for ruling 7

With the consumer pin from section 4, the sites named by the specification step's Return fall as follows.

| Site | Program it names | Change |
|---|---|---|
| `t287-default-library.test.mjs:436`, `:458` | the library's own Program (`library.programs[0].programRef`), in unit premises | moves to the declared start: `invocationVariant: "start"`, target and `startRef` the declared start, `rootMode: "supervised"`; the binding section shows what the start records |
| `t287-default-library.test.mjs:1436` | sandbox-UAT lifecycle (consumer) | none (ruling 4) |
| `t287-default-library.test.mjs:2606` | witness (consumer) | none (ruling 4) |
| `support/registered-graph-selection.mjs:236`, `:263` | consumer fixture Programs (default `fixture.ids.programRef`) | none (ruling 4) |
| `uat/public-setup.mjs:412`; `uat/continuation.mjs:319`, `:370` | sandbox-UAT lifecycle (consumer) | none (ruling 4) |
| `uat/public-setup.mjs:419-452`; `t287-default-library.test.mjs:1342`, `:2399` | the library's own Program, through `invoke` | cannot be stated (section 3) |

No lane starts the library's own Program through a Public start. Only the new lane of ruling 7 would.

### 6. Needs a ruling

1. **The RC7 fixed route under a supervised library Program.** Options:

   | Option | Change | What it touches |
   |---|---|---|
   | (a) Add a `direct` Program for the fixed route | The library publication declares a second Program with `direct` policy that hosts the fixed wrapper route. The wrapper rows' `programMembershipRefs` name it. | A design_reframe of F2-PROGRAM-001 and the RC7 section. It moves the library publication and its catalog rows. `uat/public-setup.mjs` `SETUP_PROGRAMS.library` and `libraryProgram` select the new Program. The recorded fixed-route log stays on the old Program reference. |
   | (a') The reverse of (a) | `…/default@5` stays `direct` for the fixed route, and a new Program declares `supervised` and the Executive start. | The same scope as (a), with the recorded log keeping its Program's meaning. |
   | (b) Change the guards | The direct-invocation guards (`product/invocation.ts:1155-1162`, `abg/invocation_admission.ts:958-966`) admit a direct `invoke` under a supervised Program, but only of a callable member that is not a declared start's GraphFunction. Admitting any member would admit the Executive itself and leave `supervised` without effect. | A law change outside ruling 1. Whether REQ-P-POLICY-013 ("`direct` selects one admitted entry traversal without that Product policy overlay") permits a direct invoke under a supervised Program is a requirement reading. It touches no Program identity. |
   | (c) Retire the route | Retire the RC7 fixed route. | A feature decision: "Product makes the Executive optional" leaves the design note. It removes the `constructFixed*` callers and the two cases. No UAT runner path uses the route. |
   | (d) Declare starts for the wrappers | The library Program declares two more starts, one for the Testing wrapper and one for the UAT wrapper. The fixed route moves from `invoke` to supervised `declared_start` starts, under the start law as it stands. | Probed (`probe-option-d.mjs`): on the supervised Program with the two starts added, `resolveProgramStart` resolves `start://abiogenesis/default-library/testing@5` and `…/uat@5` to their wrappers, both callable members, and still resolves the Executive start. It touches the Program body and so the library publication digest. It is a design_reframe of F2-PROGRAM-001 and the RC7 section. `constructFixed*` moves from `invoke` to start, and a fixed Run's recorded `publicStart` reads `supervised` with its own start. Open question: POLICY-013 and PRODUCT say `supervised` selects the system program, so a supervised start of a Testing wrapper is a requirement reading. Two places read, and neither reads the invocation variant: the retained-state declared-entry clause (`abg/invocation_admission.ts:1507-1530`) and the opening of the direct-route owner (`abg/default_library.ts:52-72`). The rest of the route was not traced for variant sensitivity. |

2. **What "a default start selects the standard system program" covers.**
   - Under ruling 4 every Executive Run in use today stays a `direct` start of a consumer copy: the witness fixture, the sandbox-UAT lifecycle and the registered-selection fixtures.
   - After the change, the sentence holds for a caller that names the library's own Program. No current lane or maintained caller does.
   - The ruling needed: is the new lane alone the intended evidence, or should a consumer copy of the Executive also declare `supervised`? The second reverses ruling 4.

### 7. Not reached

These steps come after the stop, and none was done:
- the Run comparison (ruling 3);
- the replay and artifact-truth comparison (ruling 5);
- the design restatement (ruling 6);
- the test changes and the new lane (ruling 7);
- the generated-contract report (ruling 8);
- the before-and-after lane set.

Other figures:
- Lines changed under `code/src`, `design` and `test_env`: 0.
- No lane needing a live provider was run. Only the one RC7 case ran, on the base and the probe build, with the scripted stand-in actor.
- The machine was not left with background commands.
