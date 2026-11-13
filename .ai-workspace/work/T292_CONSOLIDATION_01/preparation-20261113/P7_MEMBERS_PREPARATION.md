# TD-26 P7 + TD-25M: read-only preparation return

Status: preparation complete; Writer activation is pending Root's exact post-P6 main. No repository/source/Git mutation, build or test was performed. The only output written is this scratch report. No subagent was used. Shared host and inherited control instructions; no isolation or independence claim. Line numbers below refer to main `94e588ec9209c0fed89f967601e8f9071573a9cd`. The final HEAD check found `1613d2dc6308347606cea1c73d05ab4b11c71bf8`; its diff from the selected main is confined to T-292/T-293 and preparation records, with no mapped source/test/script/Product change. P5's moving files were read only to route attention; no acceptance or frozen-source claim follows.

## Product frame and binding

- Product: the 15 selected 5.0 families in `specification/PRODUCT.md:1351-1376`. This withdrawal serves F01/F05/F06/F07 while preserving F10 admitted history, pure replay, pending execution, human hold and truthful blocked handoff. Consensus/F08 and native response/resume remain 5.1. Definitions/catalog/registers remain immutable Product/tool truth; only ABG admits runtime truth. No controller, runtime, profile, B-09/B-21 or feature scope is added.
- Authority: T-292 amendment/resumption at lines 85-201, T-293 B-01/B-02/B-03/B-23 and dependency-ready schedule, `TD-26_RETIREMENT_PLAN.md` sections 0/3.4/4/5.4/P7, and `TD-25M_RETURN.md` census. P7 and TD-25M are one serial Writer increment because they share the family/register; no intermediate release.
- Exact definition: `stdo_abiogenesis.json`, `urn:stdo:product-definition:abiogenesis`, SHA-256 `b5720642ff00ebcb47f77ae68df3a960ab70f82cd1227c0712edda9d40745f44`; empty composition. `stdo status --definition ... --verify`: installed/valid true, no failures, basis `stdo://releases/v3.0.4/`, manifest `102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b`.
- Loaded installed native `stdo-work/SKILL.md`, `PRODUCT_BASIS.md` and `COORDINATED_HANDOFF.md`. The manager-resolved bootstrap was verified with the installed reader: member SHA-256 `9fb337b2c8462e9d6788f52f11ca75199253a3a66a10774bc05a9798a772e502`; acquired Minimal activation binding / Intake / Admission. Project frame: `design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md`, especially lines 22-96 and 304-367. This is read-only Public identity/register and recorded-vs-strict preparation returned to Root; Root owns durable recording and subsequent Writer admission.
- TD-77 is integrated at `54024d63f`; TD-78 at `e709bd24f`. Preserve the existing explicit ProductTruthQuestion propagation and executing-versus-selected-binding guard. Do not reintroduce the stopped TD-25M branch as implementation.

`T` below means `build_tenants/abiogenesis/typescript`; source paths are relative to `T/code/src`.

## Exact authored source owners

| Owner | Exact removal/update | Preserve |
|---|---|---|
| `product/project_read_operation_contracts.ts:26,96-104,272-292` | `ticket_consensus` case union, sole projection schema, packet, map member | Other Product reads; the packet's `Product.ConsensusProjection` abstract module disappears completely |
| `product/run_operation_contracts.ts:188-199,218-237,248,320,326` | selected-action-only refusal schema, variant factory, generic arm, packet/map entry | `current_intent` as the pending-execution member; P5's final result alternatives, current refusal schema and pending request |
| `abg/project_read_operation_contracts.ts:38-40,124-174,252-258,490-536` | Three key literals, subjectGap/admittedGap/ABG_ADMITTED_GAP_SCHEMA, lawful-action projection, three packets/map entries | `admittedGapSupportRefSchema` at 183 and stopped-Run missing-support semantics at 222; these serve kept Executive gaps. P5 already removes the three ports/bindings, so refresh their post-P6 locations |
| `product/interaction_operation_contracts.ts:23-141,260-265` | Response-kind roster/type, response authority, response/refusal schemas, packet factory, five packets/map and `InteractionResponsePort`; remove imports used only by those declarations | `RESULT_OPERATION_CONTRACTS`, result-assessment schemas and `ResultAssessmentPort` at 143-258/267 onward. Keep file name and `app/m04.ts` re-export; result bindings still import it |
| `public/binding/owner_contract_source_set.ts:8,36,187-193,329,679-697` | Interaction import/source row; expected digest; counts; stale fifty-six comment | The separate RESULT source row at 194-199, typed actual-binding classification and derived owner-source enumeration |
| `shared/capability_contracts.ts:39,82,87,88,91` | Remove Consensus mandatory id and row; 9 schema + 3 vocabulary projections from invoke-graph row; ten withdrawn keys and respond operation from replay/operator rows | `run.continue#current_intent`, all kept F_H/runtime capability semantics; strict/recorded guard bodies below the register |
| `product/public_contract_publication.ts:87-95,116-118` | Nine mandatory Consensus schema corpus ids; operation/replacement/corpus checks | `abg.schema.fh-interaction`; common three Public contract ids |
| `shared/public_invocation.ts:191`, `product/invocation.ts:980`, `abg/environment_admission.ts:75`, `abg/effectful_invocation_truth.ts:44` | Respond authority/type arms and new-work grant allowlist entry | `abg/fh_continuation_projection.ts:334-340` explicitly rejects historical respond admissions. Its fact variant is `facts: readonly []` at 70-73; no valid 5.0 respond fact requires the prior-admission type arm |
| `public/binding/public_function_family.ts:457`; `product/verify_product.ts:1618,1641-1661` | Family comment and exact-family verification cardinalities/messages | Derived equality among documentation/SDK/CLI/owner keys, not counts alone |
| `gtl/consensus_schema.ts` (whole, 1687 lines), `gtl/index.ts:168` | Entire remaining schema module and both re-exports | No package export subpath needs removal |
| `T/scripts/generate-product-manifest.mjs:51-54,154,178,284-289,381,456-475,531`; `T/scripts/clean.mjs:10` | Schema imports/path/mkdir/write/digest/catalog-row construction/spread and retired clean target | Existing operation-directory cleanup at generator 183-185; all generic generation and payload selection |

No production change is indicated in TD-77's replay/provenance/revision cone or TD-78's guard. Those are protected dependencies, not new withdrawal mechanisms.

## Thirteen contracts, one physical asset

The schema asset bindings at `gtl/consensus_schema.ts:1672-1685` and current manifest independently agree on these thirteen catalog rows. All point into the single tracked `T/contracts/schemas/consensus.schema.json`:

| Contract suffix after `abg.schema.` | Fragment after `#/$defs/` |
|---|---|
| consensus-subject | ConsensusSubject |
| consensus-panel | ConsensusPanel |
| consensus-reviewer-profile | ConsensusReviewerProfile |
| consensus-submitter-profile | ConsensusSubmitterProfile |
| consensus-ruling-overlay | ConsensusRulingOverlay |
| consensus-submitter-response | ConsensusSubmitterResponse |
| consensus-escalation-decision | ConsensusEscalationDecision |
| review-findings | ReviewFindings |
| review-rulings | ReviewRulings |
| consensus-round-policy | ConsensusRoundPolicy |
| consensus-round-outcome | ConsensusRoundOutcome |
| consensus-result | ConsensusResult |
| ticket-consensus-projection | TicketConsensusProjection |

The selected withdrawal must explicitly remove the tracked Consensus file. Removing only `clean.mjs:10` stops its cleanup; the file then survives under `package.json`'s `contracts/**` rule and `scripts/product-payload.mjs:selectTree/selectPackage`. The generator does not blanket-clean `contracts/schemas`. Assert physical and manifest-payload absence after the real build/pack.

Five other tracked generated paths leave with the respond operation: `contracts/public-operations/interaction/respond/operation-contract.json` and `contracts/schemas/operations/interaction/respond/{request,result,non-terminal,refusal}.schema.json`. Their existing generator directory cleanup removes them during regeneration. Root's integration owns regenerated mirrors/identity; these explicit retired deletions must not be restored with generic generated-output cleanup. `contracts/qualification/sources/REQ-P-CONSENSUS.md` is a requirement mirror, not one of the thirteen schema assets.

## Derived final identity expectations

A read-only calculation compared the main compile oracle's 56 distinct keys with all 56 current adapter CLI keys: exact equality. SHA-256 over sorted `operationId#memberKey` lines plus final newline reproduces current `61077d017dbbe0bd071f312066d27bc6535a732aa9da00cd543a70506ec24a4f`. Subtracting exactly the ten selected keys produces:

- 17 operations, 46 definitions; after P5's binding retirement, 42 callable and four unavailable.
- Remaining unavailable keys: `witness.admit#{attest,hygiene-stamp,intake,run-resumed}`. `result.assess#assess` remains.
- Expected final key-set digest: `sha256:0988d2088a089d32fa2c90589ee02afb44140dcf68cb463a0f68df6c1a0dcd81`. This is a derived preparation expectation, not a postimage owner result.
- 15 capability rows/mandatory ids (current 16 minus Consensus); 33 mandatory schema/vocabulary/corpus ids (current source 42 minus 9); 20 S06 replacement contracts (three common plus 17 operations). Current catalog has 72 rows; subtraction suggests 58 after 13 schema rows plus respond leave, pending exact final generation.
- Final operation/member cardinalities: catalog.admit 1; catalog.apply 2; catalog.view 1; conformance.evaluate 1; product.install 1; product.materialize 2; product.resolve 1; product.verify 1; project.read 20; release.snapshot 2; result.assess 1; run.continue 1; run.invoke 2; witness.admit 6; workspace.bind 1; workspace.create 2; workspace.open 1.

Use `OWNER_CONTRACT_SOURCES`/`PUBLIC_FUNCTION_DEFINITION_FAMILY` postimage output and the explicit selected set subtraction to prove membership, then compare CLI/SDK/documentation/schema coordinates and actual typed binding leaves. Counts and the expected hash are secondary checks, not the sole oracle.

Expected digest coupling: abstract-module membership is hashed at `owner_contract_source_set.ts:498-527`. Removing members moves module coordinates for kept `current_intent` (Product.RunContinuation), `run_status/run_result/run_evidence/run_replay` (ABG.RunProjection), and `workspace_replay` (ABG.WorkspaceProjection), despite unchanged kept schemas. Removing respond does not change the separate Product.ResultAssessment abstract-module membership merely because it shares a physical file. Family/adapter, all operation assets carrying family identity, catalog, capability graph and Product/payload identities then move through their existing owners. Event profile, event contract/calculus, digest-carried null/[] keys and original recorded bytes stay fixed. Recompute rather than hand-predict the non-key digests.

## Existing proof owners and obligations to retain

| Existing owner/test | Smallest relevant adjustment/proof |
|---|---|
| `types/framework-handoff.compile.ts`; `tests/t287-framework-handoff-types.test.mjs:124-317` | Remove ten keys from DECLARED/UNAVAILABLE and retain exact type equality, negative diagnostics, canonical package compile and packed runtime binding checks. Keep the four unavailable members on `installed_binding_unavailable`. Add/retain a table of all ten withdrawn keys returning `unknown_definition` through real installed transport and CLI exit 2; retain predecessor unavailable evidence, using a base run only if needed to attribute a failure. The CLI is `--jsonl <file>` (`public/cli.ts:81-88,147-150`), not a separate operation parser |
| `t287-wave2-owner-contract-source-set.test.mjs:206,334,412,438,632,746-855` | Remove D10 respond representative and dead expected vectors; remaining all-packet checks stay. Replace respond's recursive-refCount perturbation coordinate at 764 with an already-kept recursive schema, or retain the two remaining actual perturbations while preserving nonempty defs, increasing refCount and normalized equality assertions |
| `support/single-address-space-consolidation.mjs:151-190`; two RAW F_H cases at test 1029/1116 onward | Retarget the test-owned grant from respond.approve to `RUN_OPERATION_CONTRACTS.invoke.invoke`. Preserve positive invocation/basis/Run/pending/held/open gates, absence one row earlier, grant tamper/no-grant variants, reuse/clone/unrelated-growth assertions and all four retired F_H lifecycle refusals. Keep conditional RAW evidence language; no current admission claim |
| `t287-st1-installed-cross-owner-hello.test.mjs:250-299` | Preserve prototype getter count zero and refusal behavior. The current respond vehicle is request-less and already fails before module traversal; after withdrawal it becomes unknown_definition. Prefer a kept unavailable witness member for an exact-member poison/refusal case, or explicitly retain a retired/fabricated-key early-refusal case without claiming it exercises missing-export traversal. Do not drop the independent inherited-member assertion |
| `t287-st2a-g-capability-definition-graph.test.mjs:91,225,348-371` | Remove retired expected key/row; transfer rehashed crossed-dependency falsifier from Consensus to kept `catalog.invoke-graph-function` (which has dependencies), preserving the same false verdict and other graph tamper assertions |
| `t287-pfc-f08a-product-verification-boundary.test.mjs:286-295,334,503-558` | Remove the fixture's Consensus-row/asset stuffing, update exact family assertions/messages; preserve the real artifact verification and all coordinate/manifest/graph forgery cases |
| `t292-td26-p2-module-refused.test.mjs:92-110` | Its positive 13-schema/corpus-42 residue premise is now stale: assert all thirteen ids, capability id, GTL schema exports and physical asset absent while retaining all earlier retired module/Program/catalog/vocabulary refusals |
| `r10-projection-contracts`, `t287-w2-05-install-catalog-owner-chain`, `t287-w2-05-generator-package-reproducibility` | Update exact roster/count literals and removal-specific unavailable cases; preserve installed owner-chain, projection and reproducibility obligations. Generator test also has proposal count 21 at 191, now 20 |
| `t292-td77-recorded-product-truth.test.mjs` | Its RC10 recordedLock is no longer strict-positive: hardcoded premises at 235-244,351,480-491,510,641,675,788-808,844,869,1190-1227,1338-1341,1444 need classification. Keep old-lock recorded truth, tamper and all strict refusal assertions; replace each needed strict-positive work/control fixture with current-register/current-executing evidence. Do not apply a global flag or drop the positive obligation |

TD-77 already supplies the suitable support: `support/t292-current-terminal-fixture.mjs` exports `recordedLockMatchesCurrentRegister`, `createCurrentConformanceFixture` and `createCurrentTerminalFixture`. The last executes the installed R9/Hello Program through HoG/ABG to an exact closed result, then cold-reopens its real log. `r10-child-proof` and `t287-historical-source-resource` already distinguish recorded D2/S01 from current strict-positive fixtures; preserve that established split. `t287-cross-cut-public-read` already selects the explicit recorded environment/grant route. Parent confirmed these premise updates belong in P7 proof; P5's separate stop-test setup issue is outside this task.

## Minimal final focused execution plan (not executed here)

1. On exact post-P6 main and one real final build, run the updated HC1/owner-source family and relevant capability-graph/verification/P2 absence checks. Exercise all ten real installed transport refusals plus CLI exit 2; prove retained four unavailable members still have their old refusal. Retain any needed prototype and RAW F_H checks as focused named cases in their existing owners.
2. Actual-register history discriminator: compare bounded RC12 and D2 artifact truth/replay and kept Public reads against the exact predecessor results; assert old locks are recorded-valid/strict-invalid. Run `r10-child-proof`, `t287-historical-source-resource`, `t287-cross-cut-public-read` and the adapted TD77 file with `ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace`. Their current terminal/conformance cases supply the positive real execution/work path. No old log is migrated or rewritten.
3. Keep P5's explicit retired One Surface refusal proof on its frozen recorded subjects; do not treat rejection as preserved kept history. Reuse P5's `bounded-logs.txt` routes once frozen: RC11 selected-action and RC4 hc2-current-intent. The old tracked selected-action fixture named by TD-25M is now absent and its loader accepts only native-assessment; do not recreate it silently.
4. Run remaining affected-file checks only where the actual edits require them. Full suite, full census/history population and broad QA run once at group close under the current amendment. No before/after 83-file battery.

Read-only exact evidence identities checked during prep:

| Subject | Bytes / SHA-256 |
|---|---|
| RC12 `/private/tmp/abg-demo-tmp/abi5-root-env-hRgyFy/runtime/events.jsonl` | 14,506,732 / `440994c04f0bf214a8c62bd03d7f9905217b145cc34ce741aca8e5e393a76511` |
| D2 `comments/codex/20260911_D2_BOUNDED_REPAIR/installed-continuation-09/installed-frame-01/events-01/runtime.events.jsonl` below evidence root | 19,058,361 / `f841bba98385cb572a944edf1793634fcf10baf59a74331110042bcb200f8e82`; existing lanes select the 846-row, 13,540,472-byte prefix `4f561ceacf40fd13db82132d93890cb67750453dfa81a75c0401f04bd9345649` |
| Tracked native-assessment compressed input | 779,443 / `66162a9332dcabf7410d630551cdf12b4b272c70aa02d777f879a165a7fa8a2e`; its existing fixture/loader owns decompressed/profile checks |

These are input identities only; no reader was executed by this preparation. Refresh/compare the exact P6 baseline before use.

## B-08 handoff and residuals

No specification/design edit is proposed in this increment. `REQ-P-CONSENSUS-004` is conditional while the catalog publishes schema rows; withdrawal removes the generator references rather than creating new WHAT. Root's final design pass should consume the final source and reconcile these named stale owners already identified by the TD-25M census:

- `ABI5_REALIZATION_CONSTITUTION.md`, exact family/effect partitions/E33 and source-owner rows;
- `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md`;
- `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md`;
- `M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md`;
- `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`, especially P-FH-PAIR at 666 (test grant vehicle) and ticket_consensus at 1119;
- `T287_PUBLIC_DEFINITION_CALL_CONSTRUCTION.md`;
- `T287_W2_R2_CONSUMER_DECLARATION_ADMISSION_DESIGN.md`;
- `T287_R10_TYPED_TERMINAL_OUTCOME_DESIGN.md`;
- `T287_PENDING_CONSUMER_CONTINUATION_DESIGN.md`;
- `T287_D6_RC6_RELEASE_IDENTITY_DESIGN.md`.

Qualification inventories/mirrors remain Root's cut regeneration, not Writer-authored output. The existing TD77 strict release.snapshot/release-evidence exception and A8 sensitivity limit remain explicit; this withdrawal grants no guard weakening. No new material Product/history conflict was established by read-only preparation. The concrete outstanding binding is exact post-P6 main and the later Writer operation grant. Stop here.
