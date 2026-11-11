# Area findings: gtl-validator

Commentary, not law. Independent read-only reviewer (Claude Opus 5.5), 2026-11-12, `main` at `002035b8a`. Area: the graph language and its validator, 36 files under `T/code/src/gtl/` (22,722 lines) and 18 files under `T/code/src/validator/` (6,913 lines), T = `build_tenants/abiogenesis/typescript`. All line numbers are at `002035b8a`.

Labels used below:

- **Application**: a `graph_function_application` record in a graph template. Its `relationKind` is one of eleven: `compose`, `substitute`, `recurse`, `fan_out`, `fan_in`, `gate`, `registered_selection`, `re_enter`, `promote`, `identity`, `same_object`. Constructors are in gtl/graph_applications.ts; the law is in validator/validation.ts.
- **Shipped producer**: a publication constructor under `code/src` (the default library, Consensus, the worksite modules, semantic stage and revision, requirement handoff, self-conformance) whose output contains the kind. Test fixtures are not shipped producers.
- **Raw admission**: `rawAdmitValue` (validator/raw_admission.ts). It copies the value to I-JSON, parses it against the valibot structural schema, canonicalizes, parses again, deep-freezes, and computes `subjectDigest`.
- **Program validation**: `validateProgramSubject` (validator/validation.ts:732-1954). It checks one Program and its publications against the GTL law and caches the result by frozen object identity.
- **Consensus proper**: the submitter-reviewer rounds module, the graph `submitter-reviewer-rounds`, its reduce and project functions, and its Public schema. The owner has ruled that the Executive replaces it.
- **One Surface**: the ConstructionComposition protocol with its ActionCatalog. It has eight loci and four authorities: synthesizeModel, evalGap, evaluateNext and evaluateAction. It ships inside gtl/consensus.ts as the system One Surface Program.
- **O1 option (b)**: the proposal in `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc12-executive-01/O1_TRACE.md` to keep a thin system One Surface Program over the Executive.
- **Manifest script**: `T/scripts/generate-product-manifest.mjs`. It writes the Public contract manifest. The census does not count it as a consumer, so several `package` and `none` rows below are refuted by it.
- **Native typed locator**: a manifest row naming a package export path and a symbol, for example `./gtl/m01` with `GTL_C_PROGRAM_SERIALIZATION_API`. Renaming either is a Public contract change.

## What I checked and what I did not

**Checked.**
- The census rows for all 54 files: declarations, compiler-unused, kinds never produced or never read, clones, test reach and npm scripts.
- Full reads:
  - gtl/graph_applications.ts, gtl/serialization_contracts.ts, gtl/stdo_run_environment.ts, gtl/self_conformance.ts;
  - the three milestone modules and gtl/serialization.ts;
  - validator/validation.ts and validator/raw_admission.ts.
- Outline plus targeted ranges: gtl/consensus.ts, gtl/consensus_schema.ts, gtl/graph_construction.ts:1-450, gtl/c_algebra.ts:191-320, validator/c_algebra.ts:250-480, validator/qualification.ts:560-650.
- `grep` for every `none`-tier and `package`-tier name across `code/src`, `scripts`, `contracts`, `test_env/tests`, `test_env/support` and `test_env/fixtures`.
- `grep` for producers and executors of each relation kind across `code/src`.
- `grep` for `stdoRunEnvironments` across `contracts` and `test_env/fixtures`.
- Cross-reads outside the area: owner_bindings/run_invocation.ts:247-718, product/catalog_operations.ts:108-229, product/implementation_resolution.ts:592, abg/graph_application.ts and abg/traversal_route.ts application lookups, abg/construction_continuation.ts unions, and the manifest script.
- Requirement text: REQ-L-GTL3-HOF-003 and REQ-L-GTL3-CONTRACT-LAW-API-002.

**Not done.**
- No tests, builds, runs or profiling. Every performance item is structural.
- I did not search `test_env/test_runs/` or the recorded proof and evidence roots. A grep over `test_env` timed out earlier, and I stopped a grep over `.ai-workspace/work` after its first five hits.
- Several files were read from the census and outline only; see the coverage table.
- Claims marked *inferred* were reasoned from code I did not read in full or did not run.

## Answers to the leads

1. **Relation kinds; `gate` is the suspect.** Confirmed: `gate` is constructed, serialized and validated, and nothing executes it (GV-01). Four other kinds have no shipped producer and are declaration witnesses by design: `substitute`, `promote`, `identity` and `same_object`. A fifth, `compose`, has no shipped producer and is merged at construction time. These four are proven only by static tests (GV-10). Full table under check 5.
2. **Consensus versus One Surface.** Confirmed as one entry, GV-02.
   - gtl/consensus.ts (5,267 lines) holds about 1,150 lines of One Surface and about 4,100 lines of Consensus proper and shared helpers.
   - The two cannot be separated as shipped. One Surface locus 3 calls `submitter-reviewer-rounds` (consensus.ts:4685-4689), and the ActionCatalog row invokes the Consensus graph.
   - Outside consensus*.ts, the only reference in my area is the re-export block in gtl/index.ts:171-297.
3. **m01, m02, requirements, serialization.ts.** Refuted as dead.
   - The three modules are re-export barrels, 2 to 16 lines each.
   - They are Public native typed locators: manifest script :693-695 names `./gtl/m01` and `./gtl/m02` with their `GTL_*_SERIALIZATION_API`; :722-724 names `abg.contract.gtl.m01`, `abg.contract.gtl.m02` and `abg.contract.gtl.requirements`.
   - serialization.ts owns those APIs.
   - The milestone names are a naming debt that only a Public contract change can retire. I raise no entry; the owner may want one.
4. **`graph_construction` package-only declarations.** Refuted as dead. `composeGraphFunctions`, `substituteGraphFunction`, `identityGraphFunction` and `promoteGraphFunction` are consumed by test_env/fixtures/language-structural/program.mjs, the developer-mini-product fixture and m5-c-algebra-validation. They are the authoring API for Products, not runtime code. The helpers are internal to them.
5. **`c_program_syntax`, `existing_contract`, `json_value`.** Refuted.
   - They are phantom type brands with unique-symbol keys, at gtl/serialization_contracts.ts:15-17.
   - They exist only for recursive type inference. No value carries them by design.
6. **Same-named modules.** implementation_resolution, self_conformance and qualification are layered, not second owners. See check 4 and GV-13 for what each side owns, what invokes it, and whether its intended run ever completed.
   - implementation_resolution has one real second owner: the single-leaf and set validators (GV-09).
   - The qualification run never completed: D5-d was never dispatched.
7. **Validator checks that only one shipped program reaches.**
   - Only Consensus reaches the ActionCatalog, `publicAssetTargets`, construction composition, and node_type and overlay contributions.
   - Only the default library reaches `registered_selection` and `abg.functional_purpose`.
   - Only worksite recovery reaches preserved-result recovery.
   - The ActionCatalog, construction composition and the contribution checks are Public-authorable law: the developer-mini fixture authors One Surface. They stay when Consensus goes. Whether One Surface itself stays is the GV-02 decision.
8. **Performance of validation, serialization and hashing.** Warm validation in one process is cached by frozen identity (validation.ts:748-752; product/catalog_operations.ts:108-229). The cold path re-parses and re-hashes values that raw admission already digested (GV-07). Serialization is not on a runtime path: the census lists gtl/serialization.ts among modules the runtime never loads.

## Candidate entries

### GV-01 `gate` is accepted, validated and never executed
- Category: failed or superseded feature
- Evidence:
  - Construction: gtl/graph_applications.ts:219-229 (read).
  - Schema arm: `GRAPH_APPLICATION_SCHEMA`, gtl/serialization_contracts.ts:135 (read). It is emitted into contracts/schemas/gtl-serialization.schema.json.
  - Validation: validator/validation.ts:405, :1197-1210, :1241-1294, :1364 (read).
  - Other handling sites (grep): gtl/declaration_references.ts:111, owner_bindings/run_invocation.ts:390, and six copies of the application union in abg/construction_continuation.ts (:475, :663, :850, :1169, :1376, :1582).
  - No producer: no shipped producer constructs a gate (grep over `code/src`). The only producer is the fixture case test_env/fixtures/language-structural/program.mjs:92-97, with rule kind `fixture_subject_gate` and `blockedSubject: "Blocked"`. Nothing in `code/src` reads either field.
  - No executor: every ABG lookup from a composition reference to an application handles `recurse` or construction composition only: abg/graph_application.ts:718, :729, :884, :898 and abg/traversal_route.ts:4065, :4074, :4088 (read). abg/traversal_transition.ts:97 switches on evidence class, not relation kind.
  - Tests are static only: m5-c-algebra-validation :511, :825 and t287-static-declaration-closure. m5-installed-graph-edge replaces the case list with `rc5-retained-route`.
  - Requirements: REQ-L-GTL3-HOF-003 says "`gate(target, *, rule, evaluators)` shall block or allow continuation over an explicit boundary". REQ-L-GTL3-CONTRACT-LAW-API-002 lists gate in the core algebra.
- Retire: this needs an owner decision.
  - (a) Implement gate. ABG evaluates the gate rule before continuation past `targetRef` and blocks on refusal. One owner sits beside the recurse lookup in abg/graph_application.ts.
  - (b) Reprice. Remove gate from the two requirements, then delete the constructor, the `GateApplication` type in gtl/contracts.ts, the schema arm, the validation branches, declaration_references.ts:111, the run_invocation.ts:390 arm, the gate member of the six unions, the fixture case and its static cases.
- Size: L. (b) removes about 200 lines in the area and about 40 outside it.
- Risk: Public contract. (b) changes the bytes of gtl-serialization.schema.json and its manifest pin. No shipped publication contains a gate, so no shipped Program changes.
- Change class: requirement_reprice for (b); design_reframe for (a).
- Confidence: verified that no shipped producer exists and that no relation-kind dispatch reaches gate. *Inferred*: the attached evaluator leaf runs as an ordinary C leaf and its refusal never stops the Run. Settle by one run of the language-structural case with the evaluator returning a block: if the Run continues, confirmed.

### GV-02 Retire Consensus proper; re-home or retire One Surface with it
- Category: failed or superseded feature
- Evidence:
  - gtl/consensus.ts (outline and ranges read):
    - IDs :75-355; types :357-777.
    - One Surface functions :795-1500: catalog guard, observation, synthesize, gap, next action, evaluateAction, three refreshes.
    - Consensus proper :1517-3626: constructors, `is*` guards, reduce and project.
    - `resolveConsensusJudgmentRelation` :3627-3898 (272 lines; One Surface case :3826-3894).
    - Helpers and `CONSENSUS_NATIVE_CONTRACT_DEFINITIONS` :3900-4113.
    - `constructConsensusModulePublication` :4115-5266 (1,153 lines). One Surface parts: :4130-4147, :4660-4808, :4819-4920 (`abg.root_mode` supervised), :5026-5081, :5114-5118.
  - gtl/consensus_schema.ts (1,839 lines): a hand-written JSON Schema literal, `CONSENSUS_PUBLIC_SCHEMA` :276-1765 (1,490 lines). It is emitted to contracts/schemas/consensus.schema.json, with 13 Public schema rows in `CONSENSUS_SCHEMA_ASSET_BINDINGS` :1780.
  - The Consensus value shape has three owners: that JSON Schema, the `is*` guards in consensus.ts, and `CONSENSUS_SCHEMA_REQUIRED_KEYS` :1796. The clone census shows 600 normalized lines of self-clone in consensus_schema.ts (for example :1451 and :1699) and 47 in consensus.ts.
  - The ActionCatalog row's exact key set is written twice: consensus.ts:818 and validator/validation.ts:1725 (clone census, 11 lines).
  - Manifest script consumers: :59 schema bindings, :636 `consensusContractRows`, and the publication constructor among the ten at :1204-1213.
  - Re-exports: gtl/index.ts:171-297, about 120 symbols.
- Retire:
  - Delete Consensus proper: consensus.ts outside the One Surface ranges, all of consensus_schema.ts, the re-exports and the manifest rows.
  - Under O1 option (b), move the One Surface ranges to their own GTL module, retarget locus 3 and the ActionCatalog row to the Executive graph, and let `ACTION_CATALOG_SCHEMA` (serialization_contracts.ts) own the catalog row keys alone. Without option (b), One Surface goes too and only the Public-authorable law in validation.ts stays.
  - If the owner keeps Consensus, the three-owner shape is a second-owner entry on its own. The GTL side already derives its JSON Schema from one valibot owner (`nativeStructuralSchema` in serialization_contracts.ts); Consensus should do the same.
- Size: L. About 5,900 lines removed (about 4,100 in consensus.ts plus 1,839 in consensus_schema.ts); about 1,150 moved.
- Risk:
  - Public contract: consensus.schema.json, 13 schema rows, the native contract rows and their manifest pins.
  - Replay digests of recorded Runs that executed Consensus Programs. *Inferred*: I did not check whether replay re-admits their publications. Retirement must keep those Runs readable or declare them closed history.
- Change class: product_reprice, recording the ruling that the Executive replaces Consensus; then design_reframe for the One Surface re-home.
- Confidence: verified for the split and the coupling by reading. Investigate the replay dependency on recorded Consensus Runs.

### GV-03 run_invocation hand-copies the GTL schema family, and the copy has drifted
- Category: second owner
- Evidence:
  - owner_bindings/run_invocation.ts:247-718 (read) re-declares the C-term, application, graph function and module publication schemas. It imports only `FOLDBACK_DECLARATION_SCHEMA` from the owner. It is used at :926, :1015 and :1017 for catalog entries and publications.
  - Drift against gtl/serialization_contracts.ts (read):
    - compose has no `minLength(2)`;
    - batch has no `minLength(1)`;
    - `vectorIndex` has no maximum;
    - it uses `v.union` where the owner uses `variant`;
    - declarations and policies require nonblank strings where the owner allows plain strings;
    - it uses `v.tuple` where the owner uses `strictTuple`;
    - the publication lacks `stdoRunEnvironments`;
    - `semanticJobLifecycle` uses `SEMANTIC_JOB_LIFECYCLE_SCHEMA`, not the owner's stages variant.
  - No generated contract is built from the copy. Only contracts/schemas/gtl-serialization.schema.json contains `registered_selection` (grep over `contracts/`).
- Retire: import the owner's schemas from gtl/serialization_contracts.ts and delete the copy.
- Size: M. About 470 lines removed.
- Risk: Public contract none, since no generated bytes change. Request admission becomes stricter in five places and looser in one (`stdoRunEnvironments`; GV-04 removes it from the owner). If replay re-runs request admission over recorded requests, a recorded request with a one-term compose would now be refused. *Inferred*: such requests are unlikely, because Program validation refuses them later.
- Change class: realization_refactor
- Confidence: verified for the drift by reading both. Investigate whether replay re-runs this admission.

### GV-04 The STDO run environment shape is still admitted and always refused
- Category: failed or superseded feature
- Evidence:
  - Accepted:
    - gtl/stdo_run_environment.ts:34 (read): the old `STDO_RUN_ENVIRONMENT_SCHEMA`, with a release URI allowlist for v2.5.0-rc.6 and rc.7 at :61 and `isStdoRunEnvironmentDeclaration` at :58;
    - `MODULE_PUBLICATION_SCHEMA` (serialization_contracts.ts:217-218) includes `stdoRunEnvironments`;
    - raw_admission.ts:125 checks it.
  - Refused: `runEnvironmentForProgram` :229 and `validRunEnvironmentPublication` :300 refuse any `stdoRunEnvironments` member or `abg.stdo_run_environment` policy.
  - `none` tier:
    - `stdoEnvironmentForProgram`, `validStdoEnvironmentPublication` and `validStdoEnvironmentProgram` (:80-103);
    - cross-area: product/stdo_environment.ts:27-197 and abg/stdo_environment.ts:37-180, the latter also raised as AT-07 in abg-traversal.
  - Still live: `constructStdoRunEnvironmentDeclaration` :215, which wraps the generic `RunEnvironmentDeclaration`, and `stdoRoleForDeclaredLeaf` :105.
  - `MODULE_PUBLICATION_SCHEMA` is a valibot `strictObject` (serialization_contracts.ts:217, read), so an undeclared member is refused, not stripped.
  - Recorded data: under `contracts/` and `test_env/fixtures`, `grep` finds the member only in contracts/schemas/gtl-serialization.schema.json. A search of `.ai-workspace/work` returned five hits, all staged source copies under `T287_CONTEXT_PROJECTION_PACKAGE_02/stage/`; I capped and then stopped that search, so it is incomplete.
- Retire:
  - Remove the member from `MODULE_PUBLICATION_SCHEMA`. Because the schema is strict, the refusal moves into structural admission and is not weakened.
  - Delete the old schema, the allowlist, `isStdoRunEnvironmentDeclaration`, the raw-admission check, the three `none` functions and the refusal branches.
  - Keep the two live functions.
  - Update the tests that assert the validator's refusal code: t287-stdo-run-environment(-installed), t287-gtl-serialization-publication, t287-management-context, t287-declared-testing-capability, and support declared-testing-capability.mjs and stdo-environment-pilot.mjs. The value is still refused, only earlier, so the check is not weakened.
- Size: M. About 150 lines in the area and about 320 outside it.
- Risk:
  - Public contract: the bytes of gtl-serialization.schema.json and its manifest pin change.
  - Replay digests of recorded Runs, unknown. The refusal covers only Runs recorded after it was added. The release URI allowlist for v2.5.0-rc.6 and rc.7 shows the shape was once admitted for real, so Runs recorded before the refusal may carry it. Whether replay re-admits their publications under the current schema is unknown.
  - Settle with a grep of `test_env/test_runs/` and the recorded proof roots, which I did not search, and one read of the replay admission path.
- Change class: design_reframe
- Confidence: verified for the accept-then-refuse path and the schema's strictness by reading. Investigate the pre-refusal history.

### GV-05 The closure event sequence has four owners and eleven hand-written copies
- Category: second owner
- Evidence (grep and read):
  - The rule "run closure ends terminal_reached, frame_closed, graph_call_closed, run_closed; graph_call closure omits run_closed" is computed at:
    - gtl/declarations.ts:149-151 (the `closureContract` constructor checks it);
    - validator/validation.ts:1806-1810;
    - abg/fh_continuation_projection.ts:335;
    - owner_bindings/run_invocation.ts:~690, as a schema literal.
  - Eleven publication modules also contain the list literal: requirement_handoff, semantic_stage_publication, native_workspace_work, default_library, worksite_c0, self_conformance, worksite_branch_construction, consensus, worksite_construction, worksite_command_forward and worksite_command_execution (grep for `"graph_call_closed",`). I read the two worksite sites, which write both lists by hand and pass them to `closureContract`; that the other nine do the same is *inferred* from the grep. The clone census pairs worksite_branch_construction.ts:96 with worksite_construction.ts:71 (15 lines), which is this block.
- Retire: export `closureEventKindRefs(scope)` from gtl/declarations.ts. Let `closureContract` derive `eventKindRefs` from `closureScope`, so callers stop passing it. Validation, the F_H projection and the request schema then import that function.
- Size: S to M. About 120 literal lines removed across eleven modules.
- Risk: none. Published closure contracts keep identical bytes because the derived list equals the literal.
- Change class: realization_refactor
- Confidence: verified for the sites. Likely for the byte claim; settle by regenerating the manifest and checking for an empty diff.

### GV-06 C-term local law has three owners in sequence
- Category: second owner
- Evidence (read):
  - The C-term schemas in serialization_contracts.ts: C_COMPOSE `minLength(2)`, C_BATCH `minLength(1)`, strict objects.
  - `assertCProgramLocalRelations`, gtl/c_algebra.ts:264-318. It is called by the term constructor (:169) and by raw admission (raw_admission.ts:112, :141).
  - `inspectTerm`, validator/c_algebra.ts:250-461. It is called through `inspectCProgramTerm` :463 from validation.ts:992.
  - Both functions check the same relations:
    - identity keeps its carrier;
    - compose has at least two flat, non-identity terms in a continuous carrier chain;
    - edge keeps its roles and carrier chain;
    - batch is non-empty, with one carrier pair and one result cardinality;
    - retry preserves its carrier pair.
  - `inspectTerm` also re-checks exact keys (`hasOnlyKeys`), which the strict schema already enforces.
  - A fourth, drifted copy is in run_invocation (GV-03).
- Retire: one pure relation function in gtl/c_algebra.ts that returns (path, code, message) using the Public diagnostic codes. The constructor throws on its first result; the validator reports all of them. `inspectTerm` keeps only the context checks: leaf requirements against the context, and root result cardinality.
- Size: M. About 200 lines.
- Risk: Public contract on diagnostic codes only. The manifest script :8 publishes the diagnostic vocabulary, so the codes must not change.
- Change class: realization_refactor
- Confidence: likely. Settle by confirming that every caller of `validateProgramSubject` passes a raw-admitted value; the structural branches of `inspectTerm` are then unreachable failures. I compared identity and compose line by line, and edge and batch partly.

### GV-07 Cold validation re-parses and re-hashes values raw admission already digested
- Category: performance
- Evidence (read; structural, not measured):
  - (a) raw_admission.ts:186 and :207 parse the whole value against the structural schema twice: once on the I-JSON copy and once on the canonical value. This runs on every raw admission of a publication, graph function or request.
  - (b) validation.ts:941 runs `sha256Canonical(graphFunction)` for every graph function of the Program. Each graph function was already raw-admitted on its own at :772 (`graphFunctionAdmissions`), and :1895 reads that admission's `subjectDigest` for the same functions.
  - (c) validation.ts:1908 and :1924 run `sha256Canonical(publication)` twice, which equals the admitted `subjectDigest` when the publication is the admitted value.
  - (d) validation.ts:975 filters all edges once per edge, which is O(E²) per graph.
  - (e) The Consensus observation constructor hashes the snapshot, then `isConsensusObservationSnapshot` re-admits and re-hashes it. This goes with GV-02.
  - What scales it: total publication bytes and edge count, per cold validation. The warm path pays nothing, because results are cached by frozen identity (validation.ts:748-752; product/catalog_operations.ts:108-229). Every process launch pays the cold path.
- Retire:
  - At (b), reuse the per-function `subjectDigest` from the :772 admissions. At (c), reuse the publication's admitted `subjectDigest`.
  - Index edges by source once at (d).
  - Drop the second parse at (a) only if canonicalization is proven to preserve structure. gtl/canonicalization.ts may rewrite terms (I read it from the census only), in which case the second parse is load-bearing.
- Size: S per site; M in total.
- Risk: none. The digests are equal by construction.
- Change class: realization_refactor
- Confidence: likely for (b) to (d). Investigate (a). Settle (b) and (c) by asserting digest equality once in a test. For (b), also confirm that the :941 loop iterates the admitted values from :788 and not copies of them.

### GV-08 `validateProgramSubject` holds every relation law and imports Product owners
- Category: structure
- Evidence: validator/validation.ts:732-1954 is about 1,220 lines (read).
  - Per-kind law: recurse :1139-1196, gate :1197-1210 and :1241-1294, registered_selection :1211-1240, re_enter :1295-1348, compose :1375, substitute :1392-1457, fan_out :1458, fan_in :1504, identity :1519, promote :1529, same_object :1542.
  - Construction composition :1574-1692; ActionCatalog :1693-1775; closure :1776-1821; preserved-result recovery :1822-1829; failure, raw-result and child-closure declarations :1830-1892.
  - The file imports Product-specific owners: requirement_handoff, graph_construction `graphTemplateDiagnostics`, semantic_job, stdo_run_environment, worksite_construction_recovery, semantic_stage and `RETAINED_GRAPH_INPUT_CONTRACT`.
  - Why it blocks consolidation: GV-01, GV-02, GV-04 and GV-05 all edit this one function. The generic validator depends on Product publications, so retiring a Product feature means editing the language validator.
- Retire:
  - Move per-kind application law into a table keyed by `relationKind`, beside the constructors in gtl/graph_applications.ts or in a new law module.
  - Have Product-specific declaration checks (semantic job, worksite recovery, requirement handoff) registered by their owners instead of imported.
- Size: M. About 1,000 lines moved; none removed.
- Risk: none, provided diagnostic codes and paths stay the same.
- Change class: design_reframe, because the layering changes.
- Confidence: verified by reading.

### GV-09 The single-leaf implementation resolution duplicates the set path
- Category: second owner
- Evidence:
  - The single-leaf pair:
    - product/implementation_resolution.ts:592, `resolveImplementation` (98 lines);
    - validator/implementation_resolution.ts:98, `validateImplementationResolution` (117 lines, `package` tier).
  - The runtime uses the set pair: `resolveImplementationSet` and `validateImplementationResolutionSet` (validator/implementation_resolution.ts:248, 240 lines).
  - The clone census pairs validator/implementation_resolution.ts:130 with :230 (15 lines).
  - Not dead: `resolveImplementation` is the native typed locator of Public contract `abg.contract.product.implementation-resolution-root` (manifest script :852-867), with authority REQ-R-ABG3-INTERPRET-010 and REQ-P-POLICY-054. The validator side is not named in the manifest (grep).
  - Single-leaf consumers: r6-implementation-resolution (in `test:m4`), t287-post-binding-worksite-write and test_env/support/root-installed-environment.mjs.
- Retire: keep the Public name and make both single-leaf functions delegate to the set functions with a set of one, so the rule has one owner. Delete the single-leaf bodies.
- Size: M. About 180 lines removed.
- Risk: Public contract, possibly. `nativeContractDigest(nativeInventory)` may cover declaration text (*inferred*); if so, the contract digest pin changes.
- Change class: realization_refactor
- Confidence: likely. Settle by reading both bodies side by side for any check the set path lacks. I read only their outlines and the clone pair.

### GV-10 Four relation kinds are proven only statically, and the runtime tests sit outside every npm script
- Category: test debt
- Evidence: the relation-kind table under check 5 (grep for producers and executors).
  - `substitute`, `promote`, `identity` and `same_object` have no shipped producer. Their executor is a declaration witness at validation time. Their only tests are static: m5-c-algebra-validation and t287-gtl-graph-law.
  - The only runtime test of `compose` is t287-single-address-space-consolidation, which is in no npm script.
  - The `registered_selection` runtime tests, t287-default-library*, are in no npm script and need the `ABI5_DEFAULT_LIBRARY_*` environment variables.
  - Other GTL-law tests in no npm script: t287-gtl-graph-law, t287-static-declaration-closure, a5-f02-canonical-gtl-identity, t287-gtl-serialization-publication, t287-malformed-gtl-gate, t287-consensus-ref-shape and t287-qualification-carrier-resource (census tests-not-in-any-npm-script.json).
- Retire: put the GTL-law tests in one named lane. Either give the witness kinds one installed Run each, or record that a declaration witness needs no Run.
- Size: S
- Risk: none
- Change class: realization_refactor
- Confidence: verified from the census and grep.

### GV-11 Dead declarations with no feature left
- Category: dead code
- Evidence (census `none` tier, then grep over `code/src`, `scripts`, `contracts` and `test_env`, with no hits outside the declaring file):
  - validator/conformance_operation.ts:345, `CONFORMANCE_CONTRACTS`.
  - validator/conformance_operation_contracts.ts:101, the interface `ConformancePort`. Its name collides with the live const `ConformancePort` at conformance_operation.ts:341, which conformance_definition_bindings.ts:47 and :431 use.
  - gtl/serialization_contracts.ts, `GTL_SERIALIZATION_SCHEMA_FAMILY` (in :235-269). The two neighbours in that range are live through the manifest script :7 and :224-245.
- Retire: delete all three.
- Size: S. About 30 lines.
- Risk: none
- Change class: realization_refactor
- Confidence: verified.

### GV-12 Compiler findings in the area, including a type error that likely stops `npm run build`
- Category: dead code; repository
- Evidence:
  - From census compiler-unused.json: validator/qualification.ts:456 declares `normalized` and never reads it.
  - From census summary.json `compilerOtherSample`: TS2322 at validator/conformance_operation.ts:325.
    - The returned `deepFreeze({...})` carries `diagnostics`, `violatedContractRefs` and `repairAffordances` as `Object.freeze([])` (:335-337, read), which is `readonly never[]`.
    - `GtlProgramConformanceResult` (:48-60, read) declares the three as `readonly []`.
  - Why it is not a census artifact: the census compile (census/ts-census.mjs:24-35, read) loads T's own `tsconfig.json` and T's own TypeScript 5.9.2. It adds only `noEmit`, `noUnusedLocals` and `noUnusedParameters`, and none of these can raise TS2322.
  - Consequence: T's build script is `tsc -p tsconfig.json` with `noEmitOnError: true`. *Inferred*: `npm run build` on `main` fails at this line and emits nothing. That would fit the brief's note that `main`'s build output is stale. The file last changed in 8566b228e (2026-10-24); I did not find which change made the error appear.
- Retire: drop the unused local. Type the three empty arrays as the declared tuple, for example `Object.freeze([] as const)`.
- Size: S
- Risk: none. The emitted values are unchanged.
- Change class: realization_refactor
- Confidence: verified for the census report and the type mismatch by reading. Settle the build claim with one `npx tsc --noEmit -p tsconfig.json` in T, which I did not run.

### GV-13 Qualification and self-conformance: retained, never completed
- Category: failed or superseded feature (retention to confirm, not removal)
- Evidence:
  - Layered owners, not second owners:
    - GTL declarations: gtl/self_conformance.ts (read in full; seven Programs, including AF-22 exact-candidate and an F_H ruling leaf);
    - law and contracts: validator/qualification*.ts (about 1,880 lines) and validator/self_conformance*.ts (about 650 lines);
    - leaf realizers: implementation/qualification.ts and implementation/self_conformance.ts;
    - proof projection: abg/qualification_proof.ts (1,149 lines).
  - The only invoker is the operator driver test_env/support/exact-candidate-qualification.mjs. Its "live" mode was authored and not run in D5-c. D5-d was never dispatched.
  - The repair from RP-1 P2 is present: hashed-set plan matching with a bounded memo at validator/qualification.ts:620-650 (read).
  - Remaining structural cost: `qualificationMaterialMatches` (:570-614) does `task.material.find` once per member, which is O(members × material). It also base64-decodes and re-hashes every material byte on every call, with no memo.
  - The value `qualification_ruling_continuation` (gtl/self_conformance.ts:114) is produced and read by no literal anywhere in `code/src` (grep).
  - Test-only exports: `parseQualificationCatalogs` (qualification.ts:57, 5 tests) and `normalizeQualificationScope` (qualification_resources.ts:252, 1 test) are `none` tier.
- Retire: nothing until the owner decides whether F11 and AF22 qualification stays in the 5.0 scope.
  - If it stays: index material by ref in `qualificationMaterialMatches`, and settle the ruling continuation.
  - If it goes: the whole layer goes as one product_reprice, about 4,400 lines in the area and 1,300 outside it.
- Size: L if retired; S for the two repairs.
- Risk: qualification mirrors. The native self-conformance assets are Public rows (manifest script :745).
- Change class: product_reprice if retired; realization_refactor for the repairs.
- Confidence: investigate. Settle whether `qualification_ruling_continuation` is read through a contract reference rather than a literal; I did not trace the ABG F_H resume path.

## Named checks

### 1. Dead declarations
- **Confirmed dead.** GV-11 (three declarations) and the STDO run environment group in GV-04.
- **Refuted as dead.**
  - Manifest script consumers: the ten publication constructors (:1204-1213); the serialization schema definitions and corpus (:7); the milestone locators (:693-695, :722-724); `GTL_DECLARATION_CONSTRUCTORS` (:796); `GTL_PROGRAM_CONFORMANCE_INPUT_API`; `constructSelfConformanceAssetRows`, re-exported by product/public_contract_publication.ts:771.
  - Used by tests and fixtures as the Product authoring API:
    - `constructWorksiteC0ModulePublication`: t287-post-binding-worksite-write.
    - `constructRequirementHandoffConsumerPublication`: t287-d1-requirement-handoff and three support files.
    - `constructSemanticJobGraphFunction`: two support files and fixtures/native-semantic-revision.
    - `rehydrateMaterializedGtlGraph`: two tests.
    - The graph construction helpers: see lead 4.
    - `typecheckGtlProgram`: also loaded through abg/m03.ts.
- **Package tier, kept.** The construct*ModulePublication functions and the `gtl/index.ts` re-exports are the package authoring surface. They are not debt in themselves; the Consensus share goes with GV-02.

### 2. Compiler-unused
One entry: GV-12.

### 3. Kinds never produced, and produced but never read
- **Phantom brands**: `c_program_syntax`, `existing_contract`, `json_value`. Type-only by design (lead 5).
- **External input.** These are produced by callers outside `code/src`, so this is not dead code:
  - `worksite_preserved_result_source` (gtl/worksite_construction_recovery.ts:56), produced by operators through `product.constructWorksitePreservedResultSource` and by test support;
  - `conformance_evaluation_resource_assertion` (validator/conformance_definition_bindings.ts:72), the Public conformance call's resource argument, supplied by test support and the qualification driver;
  - `envelope_output`, `evidence_input`, `worksite_plan` and `worksite_bridge` (gtl/semantic_stage_publication.ts:71, :85), `operation` arguments passed through a computed value (abg/worksite_construction_recovery.ts:126) or by test support.
- **Produced and never read.** Most entries are diagnostic codes, stage roles and contract value kinds. They are read as data by ABG and by Public consumers, so they are not dead.
  - One open item: `qualification_ruling_continuation` (GV-13).
- **Handled and never produced in a shipped Program**: `gate` (GV-01).

### 4. Second owners
- Entries: GV-03 (GTL schema family), GV-05 (closure event sequence), GV-06 (C-term local law), GV-09 (implementation resolution), GV-02 (Consensus shape in three owners; ActionCatalog row keys in two).
- Not second owners:
  - implementation_resolution: the product side constructs candidates from installed descriptors; the validator side validates them against Program validation.
  - self_conformance and qualification are layered (GV-13).
- Clone pairs not read closely, worth one look each:
  - validator/conformance_operation.ts:84 against abg/witness_admission_operation.ts:282 and abg/probabilistic_result.ts:146 (15 and 14 lines);
  - gtl/worksite_command_execution.ts:13 against gtl/worksite_construction.ts:16 (12 lines).
- Cross-area: six copies of the application union in abg/construction_continuation.ts (GV-01 Evidence).

### 5. Failed, unfinished or superseded features
Entries GV-01, GV-02, GV-04 and GV-13. The milestone modules are Public locators (lead 3).

Relation-kind table (producers and executors by grep over `code/src`; test reach from the census and grep):

| Kind | Shipped producer | Runtime executor | Test reach |
|---|---|---|---|
| compose | none | merged at construction time (graph_construction.ts:441) | runtime: t287-single-address-space-consolidation, in no npm script |
| substitute | none | merged at construction time (graph_construction.ts:566) | static only |
| recurse | consensus, default_library | hog/recursion_lifecycle.ts:174; abg/graph_application.ts; abg/traversal_route.ts:4065 | default library, language-structural |
| fan_out | worksite_construction, worksite_branch_construction, consensus | abg/fan_out.ts:187; hog/workflow_lifecycle.ts:141 | yes |
| fan_in | consensus, worksite_construction, worksite_branch_construction | abg/traversal_route.ts:3866 | yes |
| gate | none | none | static only (GV-01) |
| registered_selection | default_library | hog/route_proposal.ts:395-420; product/execution_resolution.ts:1055; gtl/registered_selection.ts | default library tests, in no npm script |
| re_enter | fixtures only (developer-mini-product, S03) | abg/c_call_outcome.ts:1880; hog/route_proposal.ts:477 | S03 test, gated by an environment variable |
| promote | none | declaration witness | static only |
| identity | none | declaration witness | static only |
| same_object | none | declaration witness | static only |

### 6. Structure
GV-08. gtl/consensus.ts (5,267 lines, one 1,153-line constructor) is structural debt only if Consensus is kept, and goes with GV-02. Nothing else in the area blocks consolidation.

### 7. Performance
GV-07 for validation and hashing; the material check in GV-13. Serialization is not on a runtime path. None of these items is measured.

### 8. Coverage

| File | Lines | How read | Findings |
|---|---|---|---|
| gtl/c_algebra.ts | 612 | outline; :191-320 | GV-06 |
| gtl/canonicalization.ts | 224 | census only | GV-07 (a) depends on it |
| gtl/consensus_schema.ts | 1839 | outline; :276, :703, :1765-1839 | GV-02 |
| gtl/consensus.ts | 5267 | outline; the ranges in GV-02 | GV-02, GV-07 (e) |
| gtl/contracts.ts | 137 | census only | GV-01 (type) |
| gtl/declaration_references.ts | 135 | grep, :111 | GV-01 |
| gtl/declarations.ts | 244 | :120-175 | GV-05 |
| gtl/default_library.ts | 323 | census, grep | none |
| gtl/graph_applications.ts | 298 | full | GV-01 |
| gtl/graph_construction.ts | 710 | :1-450 | none (lead 4) |
| gtl/index.ts | 333 | :171-297 | GV-02 |
| gtl/m01.ts | 16 | full | none (lead 3) |
| gtl/m02.ts | 6 | full | none (lead 3) |
| gtl/materialize.ts | 331 | census, grep | none |
| gtl/native_workspace_work.ts | 78 | census, grep | GV-05 |
| gtl/public_start.ts | 132 | census only | none |
| gtl/registered_selection.ts | 82 | census, grep | none |
| gtl/requirement_handoff.ts | 188 | census, grep | GV-05 |
| gtl/requirements.ts | 2 | full | none (lead 3) |
| gtl/self_conformance.ts | 196 | full | GV-13 |
| gtl/semantic_job.ts | 77 | census only | none |
| gtl/semantic_revision_identity.ts | 34 | census only | none |
| gtl/semantic_revision_publication.ts | 121 | census only | none |
| gtl/semantic_stage_identity.ts | 70 | census only | none |
| gtl/semantic_stage_publication.ts | 198 | :65-90 | GV-05; check 3 |
| gtl/semantic_stage.ts | 186 | census only | none |
| gtl/serialization_contracts.ts | 269 | full | GV-01, GV-03, GV-04, GV-11 |
| gtl/serialization.ts | 45 | full | none (lead 3) |
| gtl/source_path.ts | 1114 | census only | none |
| gtl/stdo_run_environment.ts | 313 | full | GV-04 |
| gtl/worksite_branch_construction.ts | 574 | census; :92-112 | GV-05 |
| gtl/worksite_c0.ts | 401 | census, grep | GV-05 |
| gtl/worksite_command_execution.ts | 357 | census, grep | GV-05; clone in check 4 |
| gtl/worksite_command_forward.ts | 85 | census, grep | GV-05 |
| gtl/worksite_construction_recovery.ts | 159 | :50-62 | check 3 |
| gtl/worksite_construction.ts | 653 | census; :68-88 | GV-05 |
| validator/c_algebra.ts | 480 | outline; :250-480 | GV-06 |
| validator/conformance_definition_bindings.ts | 562 | :66-78; grep | check 3 |
| validator/conformance_operation_contracts.ts | 103 | census, grep | GV-11 |
| validator/conformance_operation.ts | 347 | :48-64, :300-345; census, grep | GV-11, GV-12; clone in check 4 |
| validator/graph.ts | 143 | census only | none |
| validator/implementation_resolution.ts | 487 | outline; census clone | GV-09 |
| validator/index.ts | 61 | grep | none |
| validator/qualification_catalogs.ts | 143 | census only | GV-13 (layer) |
| validator/qualification_contracts.ts | 518 | census only | GV-13 (layer) |
| validator/qualification_resources.ts | 269 | census, grep | GV-13 |
| validator/qualification.ts | 950 | :560-650; census | GV-12, GV-13 |
| validator/raw_admission.ts | 235 | full | GV-04, GV-07 |
| validator/self_conformance_basis.ts | 81 | census only | GV-13 (layer) |
| validator/self_conformance_contracts.ts | 85 | census only | GV-13 (layer) |
| validator/self_conformance_publication.ts | 31 | grep | none (refuted, check 1) |
| validator/self_conformance_semantics.ts | 170 | census only | GV-13 (layer) |
| validator/self_conformance.ts | 282 | census only | GV-13 (layer) |
| validator/validation.ts | 1966 | full | GV-01, GV-02, GV-05, GV-06, GV-07, GV-08 |
