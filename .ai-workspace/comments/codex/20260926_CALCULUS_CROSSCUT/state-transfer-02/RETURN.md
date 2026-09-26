Product Frame: fixed fifteen-family ABG5, GOAL035/T287/LIFE01; GTL declares, HoG traverses, owners effect, ABG admits, replay projects. ABI selects immutable STDO 2.5.1RC1, manifest `5d306da13994e69aa9f215d4c1cd2d0be96283c1e33a652b58e6e9262d036b64`; GLC remains RC4. The selected Interface Integration frame joins project F-END-TO-END-INTERFACE-INTEGRATION with Computational Whole-Path, Owner, Conservation and Proof. Product semantics remain independent of the trusted-desktop tenant distribution/risk policy.

**Writer continuation CLOSED — R-ST01 correction implemented and self-checked; independent review pending. Native continuation remains HOLD.** HEAD remains `420336a50b8fbec42ab244521cfa4d8a0351c4af`; Product remains `bb0c211a3fe04be9b3d8a12779387f6b26e3e0d0bd2bf513cf7fe826c8ba5176`. This return succeeds the frozen state-transfer-01 review `b2e731c7bc26eb68dc921081a8e74184553a2d1f4a310ba74da941b5256c675f` without changing that review or its evidence.

**Correction and owner.** Paths below are relative to `build_tenants/abiogenesis/typescript/`.

- `code/src/abg/event_prefix.ts:436–456` extends the existing incremental `RuntimeEventIndex` with exact cursor-origin and input-origin reference buckets. It stores references to the existing admitted events, with the existing prefix cut/range rules. No second index owner, cache, ledger or persisted carrier was added.
- `code/src/abg/traversal_cursor.ts:158–194,239–283` selects cursor admissions and input values by their exact references. The existing ref/digest/value check and retained-input owner authentication remain. The old whole-prefix input-origin generator is gone.
- `traversal_cursor.ts:310–447` follows the selected cursor's admitted predecessor identities and decreasing event ordinals to its initial cursor. It projects forward through the existing GTL structural, continuation and retry target relations, checking one actual cursor identity per transition. Enclosing batch entry uses the actual path, task and retry coordinates on that ancestry. F_H uses its admitted successor; reentry uses its admitted target projection; completed retry progress follows its named completion witness; fan-out retains the complete vector; parent CCall Result remains the foldback coordinate. The old per-origin speculative cursor construction is gone.
- `traversal_cursor.ts:450–488` selects the exact opened call through the existing aggregate index, checks the opened cursor's scope/order/causation, and consumes that ancestry relation for recovery and shared-batch continuation. Warm batch selection no longer rehydrates an ExecutionBasis merely to enumerate input candidates.

Current-input lookup now depends on the selected reference bucket. Batch/opened-call projection depends on the selected admitted ancestry, not unrelated input-producing history. The existing index still performs its ordinary cold construction and incremental suffix work. This is a source-level computational correction; no unrelated-history benchmark, CPU speedup or large-journal magnitude is claimed. Independent ABG route admission and its existing callers remain unchanged and still derive/check the selected transfer. The private ancestry array is a temporary projection of admitted events, not traversal control or additional truth.

Production changes in this successor are limited to those two ABG files and emitted companions. HOW 5.7.1 states the indexed selection/ancestry boundary. The existing installed helper, its small execution wrapper and the existing finite test gained optional coarse accounting. Generated manifest/capability metadata was refreshed. The accepted context freeze is **7/7 unchanged**; other first-candidate production owners and tests are reused unchanged.

**Current proof.** `checks.json` records successful final noEmit, ordinary tsc emission, manifest generation and scoped whitespace checks. `composition.log` records one installed deterministic run: **seven finite cases, eight Node tests including the enclosing test, zero failures/skips, 270.954 s**. Every case uses real package verification/install, publication, invocation, basis, traversal, leaf implementation and ABG admission. No authority or runtime event was substituted.

| Case | Actual changing-leaf inputs | Preserved relation |
|---|---|---|
| compose | `seed`, `seed!` | predecessor Result progression |
| ordinary batch | `seed`, `seed` | enclosing shared entry |
| composed tasks in batch | `seed`, `seed!`, `seed`, `seed!` | inner progression and outer reset |
| batch after outer progress | `seed`, `seed!`, `seed!` | progressed batch entry |
| batch in batch | `seed`, `seed`, `seed`, `seed` | each actual enclosing entry |
| failed consumer after equal-output batch | `seed`, `seed`, `seed!` | same-basis progressed input; exact producer B, not equal-valued A |
| identity-ending task | `seed`, `seed` | structural continuation uses enclosing entry |

The test compares implementation evidence input digests with reconstructed admitted cursors and selected values, and asserts one shared basis per composition. The recovery case fails a real deterministic consumer and preserves its successful predecessor Result. It proves the current-input/producer relation, not full semantic/nativeIntake admission. The two scoped Product pending-asset/value checks from state-transfer-01 remain valid for their unchanged source and are reused without rerunning. Full native intake with the preserved F_P author Result remains OPEN; no author was repeated. Fan-out, retained-input, retry, F_H, graph-span reentry and child foldback are source-accounted here, not newly executed special-route cases. Raw/cold refusal beyond this composition evidence remains a source-preservation claim, not fresh qualification.

**Coarse setup accounting.** `accounting.json` retains every observed phase and volume from the required run. This is the ABG deterministic fixture, **not measured odd_glc sandbox setup**. Wall time includes I/O and child-process waits; CPU attribution and actual installed-tree bytes are unknown. No profiling or timing-only rerun occurred.

The one-time scratch file/dependency copy took **1.038 s**. Per-case fixture artifact preparation, including manifest generation, took **12.965–14.115 s**, separately from the helper. Helper setup took **21.952–22.686 s**. For the compose case its **22.522 s** divides as follows:

| Phase | Wall seconds |
|---|---:|
| pack | 3.327 |
| extract | 0.499 |
| artifact verification | 12.068 |
| install | 2.702 |
| installed content check | 0.583 |
| bootstrap owner loading/candidate preparation | 0.277 |
| installed owner loading | 0.262 |
| install/workspace admission | 0.441 |
| execution preparation: publication/program/catalog | 0.336 |
| execution preparation: resolution/program validation | 1.227 |
| execution preparation: invocation | 0.144 |
| execution preparation: graph/implementation resolution | 0.089 |
| execution preparation: basis/leaf port | 0.566 |

Thus measured provisioning/verification accounts for **19.178 s**, while these execution-preparation phases account for **2.362 s**. Opening the scope is separately **0.025 s**, and traversal is **2.347 s**. Across the seven cases traversal is **2.286–3.545 s**. Bootstrap preparation mixes module loading, metadata and file hashing; finer attribution remains unknown. These observations do not label the whole setup or test remainder framework overhead, justify a hard time cap, or make file-copy cost a cleanup trigger.

Compose archive volume is **10,165,702 B compressed / 66,857,195 B unpacked / 5,231 members**. Before traversal the fixture has **six events / 2,341,560 log bytes**; afterward **86 events / 2,592,981 bytes**. Other cases' final counts/bytes are recorded in accounting.json. Pack metadata gives archive volume, not an independently measured installed-tree footprint. The existing helper verifies an artifact before installation and checks installed content afterward; it validates publication/selected programs for catalog setup, then resolves and validates the selected execution program before invocation. These are observed stages, not a finding that their duties are redundant. Verification's internal CPU/I/O split and any deeper repeated acquisition remain unmeasured.

**Freeze and return.** `freeze.json` binds the current repair family, emitted files, helpers/tests, HOW, generated metadata and evidence, with predecessor and accepted-context references. State-transfer-01 RETURN/freeze/review hashes remain `c6e586c38206dae2e3cf8598edaba23e316210b2849511b367b365c249fe850e`, `ed8856ef5aef3da762661e9e39d3d223550fd8ab8efdb6990fa10a59c9c15880`, and `b2e731c7bc26eb68dc921081a8e74184553a2d1f4a310ba74da941b5256c675f`.

Attribution correction to the prior return: Root fixed the missing import in `instruction_assembly.ts`; that Root fix was not in `semantic_revision.ts`. No commits, candidate publication, provider/native call, giant historical journal scan or broad qualification occurred. No further Writer work is running; Executive owns independent review and subsequent disposition.
