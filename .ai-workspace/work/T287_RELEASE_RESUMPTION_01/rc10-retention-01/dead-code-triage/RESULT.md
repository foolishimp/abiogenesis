# RC10-DEAD-CODE-TRIAGE-01

Product Frame. ABIogenesis 5.0 fixed fifteen families, GOAL-035/T-287 active, prospective RC10 built by immutable installed RC9. The selected increment removes genuinely dead source machinery while retaining direct GTL/HoG execution, ABG-only admission, replay reconstruction, declared Public/native contracts and exact packaging. Definition/tool/projection helpers are deterministic computations; removal confers no new runtime authority. Unexercised failure, retry, fan-out, continuation, human-handoff and reserved-5.1 semantics are not dead merely because one operational trace omitted them. No Product semantic change is selected.

Subject is main `dd6938dd84fac37a76128d14cf1b5f0fa8aec299`, with RC9 Product source `e30ac16b4a9406c43d054f45bad864746352dad6`. Same verified `urn:stdo:product-definition:abiogenesis`, STDO `stdo://releases/v3.0.4/`, manifest `102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b`, empty composition and project-frame hash `2c2a3295928b4a40cd423623145c029b08f0f79576a086df7506f002627a1f10` as preceding triage. Current AGENTS, GOALS/T287 selection and Product authority were reacquired/reused without changed basis. Parent explicitly grants this independent read-only frame and result path; new user instruction selects dead-code removal intake. Prior HS05 no-deletion text records historical scope, not a permanent veto. No Product source/design/test/Git effects, tests, build, native invocation or Product code execution occurred. Static Python text/identity analysis only.

## Recommendation

Admit the following **eight non-barrel helper/wrapper functions in five files** as a small RC10 removal slice, under `realization_refactor`. They total **65 source lines / 3,049 UTF-8 bytes**, excluding adjacent comments, blank separators and newly unused imports. These are exact measured source spans, not predicted package or runtime savings. Removal is useful surface contraction, not a performance claim. Core lifetime work touches three of these files: use one coordinated author/freeze, not competing writers.

The current static census found 25 exported functions with exactly one lexical occurrence across production TypeScript plus current test/support/scripts. No non-exported top-level function had one occurrence. The 25 are candidates, not a general deletion list. The selected eight additionally passed source inspection, barrel/package-route tracing, and named-symbol searches of contracts, manifest, design, specification, README and generator inputs. They are declarations without top-level effects; each has no producer of its function value apart from its own declaration, no caller, no import, no barrel re-export, no named registration or string-selected handler, no test caller, no schema/manifest symbol selection and no declared package subpath. This is stronger than an isolated rg absence, though compiler/build proof remains unperformed.

Rank 1: the four narrow helpers in event_store/event_prefix/runtime_history (18 lines / 841 bytes) have the smallest deletion cone. `projectHeldRuntimeEventsAtDurablePrefix` merely forwards to the retained, still-used `readHeldRuntimeEventsAtDurablePrefix`; `isEventStoreAdmissionOpen` reads private state; `runtimeEventProfileSourceFromValidatedPrefix` reads the private profile-source member after validation; `runtimeHistoryPayload` wraps selection.event(). Keep their underlying owners and shared imports unless the post-delete reference census proves the import unused.

Rank 2: the two obsolete project-read entries (26 lines / 1,580 bytes). `projectGraphCallSourceAtDurablePrefix` wraps prepareRead/graphCallContext/graphCallSource, while the actual prepared read path uses those owners directly. `projectGapReadAtValidatedPrefix` is an unused decoded-array ingress. Keep `graphCallSource`, `prepareRunReadAtDurablePrefix`, the current gap projectors and all Public read contracts. Removing either helper must not remove historical or cold reads.

Rank 3: two shared schema convenience helpers (21 lines / 628 bytes). `resultWithEvidence` constructs a strict schema; `contractSchemaEntries` extracts schema entries. Neither participates in the current owner-contract source set or generator call graph. Remove only these functions, preserving all actual schema declarations and shared atoms.

## Exact candidate spans

Paths below are tenant-relative. Span hashes cover exactly the UTF-8 function declaration through its closing brace, with its final newline; they exclude preceding comments.

| Path | Symbol | Lines | LOC | Bytes | Span SHA-256 |
|---|---|---:|---:|---:|---|
| `code/src/abg/event_store.ts` | `projectHeldRuntimeEventsAtDurablePrefix` | 2326–2330 | 5 | 207 | `9d6540d76bddfabf85b22a716ecaadfc6c808d400dc43485a4204a5f26866d66` |
| `code/src/abg/event_store.ts` | `isEventStoreAdmissionOpen` | 2773–2776 | 4 | 176 | `af5599b98abe4a05547d151568e557f4fd953d38a43bdb94bd417ecbe227f52e` |
| `code/src/abg/event_prefix.ts` | `runtimeEventProfileSourceFromValidatedPrefix` | 381–384 | 4 | 204 | `a30d2efd24ecf344dce53eb6d5240761586aa26c5180cc50b7deb55d3cba2264` |
| `code/src/abg/runtime_history.ts` | `runtimeHistoryPayload` | 541–545 | 5 | 254 | `d13de94363b397bd0d8eb1f5b009ac5930c6cad9cae86a974d788fd57573839b` |
| `code/src/abg/project_read_ports.ts` | `projectGraphCallSourceAtDurablePrefix` | 962–972 | 11 | 610 | `d5891b4134a914fe6a9fb859162409f50841dbbd4401ab2c5fe7c06591f3e8f9` |
| `code/src/abg/project_read_ports.ts` | `projectGapReadAtValidatedPrefix` | 1504–1518 | 15 | 970 | `421353d1b141d27931a336c034fc569ad84facaf69e05f926becb356f3f6ed74` |
| `code/src/shared/public_function_contracts.ts` | `resultWithEvidence` | 414–421 | 8 | 211 | `8bd6409ed3e2be803114859d7b0d0cc6c419c1f23649bb364539ef3a3dff2c05` |
| `code/src/shared/public_function_contracts.ts` | `contractSchemaEntries` | 669–681 | 13 | 417 | `ae5d7a0d705fa380ed3bdd88a7f46adbd6fdafeec341136171a9baaafe35cb29` |

## Exact file preimages

| Path | SHA-256 |
|---|---|
| `code/src/abg/event_store.ts` | `3ccabe2beab865f8a89181d169f9ae14b31dc4c5d9aad8e90e517b2a4c5c8fbb` |
| `code/src/abg/event_prefix.ts` | `cfe2ce70db4935aac785bc92c24fa3634bd8e14ff38476fb612afe4cc12f512b` |
| `code/src/abg/runtime_history.ts` | `58bfd6ef4d02b60dd3159a8485846561d48cb94fef01003584d26d21777d9217` |
| `code/src/abg/project_read_ports.ts` | `e78700981aba2ecb2b0b8b4f893b226f51685d2f5aa4f5e2e953888981e1a697` |
| `code/src/shared/public_function_contracts.ts` | `add45e14c6b77eb342ab4858cee7cbc43204553b9b2a8b8c5a159a853cb53814` |

## Reachability and generated/package boundary

- `code/src/index.ts` re-exports named layer barrels. `abg/index.ts` explicitly selects event_store, event_prefix and project_read_ports symbols; none of these eight is selected. It does not wildcard-export runtime_history. No shared barrel exposes the two shared helpers. The selected modules themselves remain reachable and must not be deleted.
- `package.json` declares finite package exports, two CLI bins and package files `build/**`, `contracts/**`, manifest. It has no arbitrary deep source subpath. `tsconfig.json` compiles every `code/src/**/*.ts`, emits declarations and strips `@internal`; therefore dead module exports still produce bytes even without callable consumers. `runtimeHistoryPayload` and `resultWithEvidence` are explicitly @internal, reinforcing their implementation standing.
- `scripts/generate-product-manifest.mjs:565-575` reads generated declarations and resolves native closures through packageExports. Public contract native locators require named symbols in those closures (:617 onward). The selected eight have no explicit contract/manifest matches and no route through the selected package barrels. Build output and manifest hashes will change; exact generated correspondence still requires normal clean build/package checks. Do not hand-edit generated inventories or claim unchanged archive bytes.
- Dynamic owner bindings and GraphFunction implementations are not inferred dead from identifier counts. Current source/test/script searches include string contents; selected helper bodies are ordinary direct wrappers, absent from declared implementation/ref tables. Inspection of manifest generation confirms no universal registration of all module exports.
- Existing tests may import owner modules by path. The finite current test/support census found no use of the selected symbols, and no selected contract names them. Test text/fixture selection and archived old source must remain distinct; historical evidence is not deleted or rewritten.

## Items rejected or held from this slice

1. Old S7/HS05 machinery is **live** on current main: `OWNED_PREFIXES` is written and checked in event_prefix:61-146; `DurableHistoryDerivation` issues/captures/binds coordinates in event_store:1767 onward; `captureDurablePrefixCoordinate` is a published ABG export and has active consumers; `ArtifactTruthDerivation` and `runtimePrefixFromOwnedArtifactTruth` authenticate artifact projection/currentness at artifact_truth:714,816-898. Old proposed disappearance is not current deadness. Decoder verification, locks and identity checks stay.
2. The RC6 F9 “576 unreferenced exports” is a name-count census explicitly labelled candidates by its author, on a different cut. It is not a current count. Qualification contracts are wildcard-exported (`validator/index.ts:53`), so even a function unused internally can be a declared downstream surface. Retry/fan-out/continuation have preserved Product semantics; one 17.9h trace with no event is not reachability proof. Consensus has a reserved-5.1 dedicated qualification scenario, not a blanket deletion grant.
3. Governed context is demonstrably live: generate-product-manifest imports `GC03_SELECTED_RELEASE`, copies the host adapter, hashes `governed_context_client.js` and emits its exact selection at :465-483. Its owner and CLI dynamic endpoint cannot be removed from F9 counts.
4. `WorksiteContextBodyUse.readable` (event_prefix:830; resolver check :995) remains a plausible tiny retirement candidate, and the old RC4 review flagged it. Current producer `governanceContextBodyUse` makes only runId/sourceResults. However, removing an optional caller constraint changes accepted input/denial behavior, and this exported owner type needs an exact declaration-closure check. It is **not** included in the pure dead-function slice without a separate exact contract decision.
5. `realizeSemanticRevisionNativeConstruction` / `realizeSemanticRevisionNativeExecution` are single-occurrence candidates, but the same file publishes native descriptors derived from GTL binding declarations and implementation IDs. Their registration/substitution relation was not closed within this bounded pass. Hold them; do not delete a required leaf realization because its JavaScript name has no literal call.
6. Other single-occurrence functions (e.g. planned CCall failure/human-interaction wrappers, public authority update/parse entries, historical STDO declaration constructor, blocked-retry wrapper) need distinct contract/lifecycle analysis. Their absence from observed runtime traces establishes no removal claim. No code quarantine/profile change is proposed.

## Retirement history reconciled

`.ai-workspace/TECHNICAL_DEBT_REGISTER.md` TD-10 / T-290 C-11/C-15/C-15b already retired dead full-replay producers/imports and deliberately retained complete-output variants whose fields are published declarations. Those accepted decisions cannot be rediscovered as new deletions. TD-04/05 fixture retirements likewise have exact dispositions; skipped evidence-root fixtures are not dead code. Existing `CENSUS_FOLLOWUP_CLASSIFICATION.md` distinguishes real complete replay, historical authentication and owner outputs from redundant arrays; it does not authorize deleting those owners. Old held-session design §4.6 and S7 are context, with actual current reach deciding this slice.

## Proposed author/proof territory and stops

Only the five listed source files, adjacent comments exclusively describing removed helpers, and imports proven newly unused in those same files. No replacement API, export, registry, status, feature removal or new test is required. Apply the canonical generated-output path used by the selected RC10 build; Root/operator must name its generated artifact territory separately. This static return grants no implementation effect by itself.

Affected proof: TypeScript compile/declaration closure and existing import/lifecycle/calculus gates; normal manifest/package verification and public export/native-locator correspondence; relevant held-prefix/owned-reconstruction/event-body and current project-read/graph-call-gap tests; existing owner-contract source-set/binder schema tests. Reuse still-valid unrelated evidence. No test should be weakened or rewritten just to permit removal; a consumer found by build/test or a changed declared export closes this candidate's deadness claim and returns it to triage. Broad qualification, provider calls, S7 and archive publication remain separate.

Falsifiers: any dynamic descriptor resolves one selected name, any exported declaration/API promises it, a supported caller or current test imports it, the deletion changes an actual schema/owner output, or manifest regeneration changes native contract leaf sets beyond the intended internal declaration contraction. Stop rather than widen to semantics or delete tests. Final author return must report exact diff/remaining identifiers and generated correspondence; static reachability here is not executed proof.

Result: source-grounded, finite removal recommendation; bounded static evidence satisfied, build/runtime equivalence unperformed. No new backlog beyond this proposed slice is decided here. Root owns selection and conjunction with the retention and Operator frames. O3 is untouched/open.
