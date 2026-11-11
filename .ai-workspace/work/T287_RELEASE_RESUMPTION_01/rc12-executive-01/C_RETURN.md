# RC12 package C Return — standalone Consensus retired

Writer Return, commentary. Worktree `/private/tmp/abg-rc12-consensus-20261111`,
branch `claude/rc12-consensus`, base `62fd17271`, T = `build_tenants/abiogenesis/typescript`.
Commits: `f4aad7d5e` (Product, requirements, design), `fb86974e3` (code,
contracts, scripts, tests), `be05bbfbc` (intent alone), then this Return.
Lines: text +271 −5,489; code +1,041 −15,349; intent +18; net −19,508.

## T1 Census, final disposition

| Class | Subject | Disposition |
|---|---|---|
| D | `T/code/src/gtl/consensus.ts` (5,267), `gtl/consensus_schema.ts`, `implementation/consensus.ts`; `T/contracts/schemas/consensus.schema.json`; vocabularies `consensus-fh-decision`, `consensus-round-outcome`, `review-ruling-kind` | deleted |
| D | six `T/design/*CONSENSUS*.md` (M01_M03, M02_M04, M03 domain family, M03 rejected as-built, M04_M05 installed scenario, M05_S05); `REQ-P-CONSENSUS.md` and its qualification mirror; tests `m5-consensus-module` (17), `t287-consensus-ref-shape` (2) | deleted |
| W | exports: `./gtl` 125 (83 values, 42 types), `./implementation` 33 | removed |
| W | `builtin_semantics.ts` system semantics `product-semantics://abiogenesis/system@5`; `project_read_*` member `ticket_consensus`; `public_contract_publication.ts` 11 mandatory ids; `capability_contracts.ts` `graph-function.consensus@5` | removed |
| W | `verify_product.ts`, `owner_contract_source_set.ts`, `public_function_family.ts` 56 → 55 and key-set digest | updated |
| W | `generate-product-manifest.mjs` publication, schema/vocabulary writes, rows; `clean.mjs`; root `.gitignore` (4 lines); `package.json` `test:m5:consensus-unit` and `test:m5` member | removed |
| W | qualification contracts and source mirrors | regenerated (T3, T4) |
| W | core publication lists in 4 support files and 7 tests | member removed |
| S | a5-f02, r4, w2-05 owner chain, steel-basic-cli-public, st2a-g | re-pointed (T5) |
| T | PRODUCT, GOALS, 6 requirement files, scenarios README, 44 `T/design` files, 2 ADRs | edited (`f4aad7d5e`) |
| G | Python tenant quorum/consensus rule kind: `operator_model.py`, `abiogenesis.py`, `project_package.py`, 3 tests, `SCENARIO_INTENT_TO_TAGGED_REQUIREMENTS.md`, `plugin.json` | kept: pattern, other tenant |
| G | `build_tenants/abiogenesis/design/ABG_3_UNIFORM_C_CALL_ENVELOPE_DESIGN.md` 371/379/637: odd_sdlc T-166 "consensus graph function", "consensus rounds" | kept: downstream pattern |
| G | `T/design/M03_RECURSIVE_EXECUTIVE_OBSERVER_DERIVATION.md:5`: link to ticket file `T-268-…-consensus-coverage.md` | kept: path |

The dependency cone was closed: nothing outside Consensus used its code for
its own behaviour.

## T2 Import sites of removed exports (base)

| Site | Used | Now |
|---|---|---|
| `T/code/src/{gtl,implementation}/index.ts` | re-export blocks | removed |
| `builtin_semantics.ts`, `project_read_{ports,operation_contracts,definition_bindings}.ts`, `shared/capability_contracts.ts` | descriptors, predicates, `ticket_consensus`, `ConsensusProjectionPort`, system semantics, capability ids | removed |
| `T/scripts/generate-product-manifest.mjs` | publication, `consensus_schema` | removed |
| support `d2-frame-fixture`, `declared-testing-capability`, `installed-qualification-conservation`, `uat/public-setup`; tests `steel-basic-cli-public`, `steel-consumer-declaration`, `t287-c2-child-program`, `t287-d1-requirement-handoff`, `t287-stdo-run-environment-installed.mjs`, `w2-steel-{serial-branch,single-start}-installed` | `constructConsensusModulePublication` | member removed |
| `a5-f02`, `r4-catalog-admission`, `t287-w2-05-install-catalog-owner-chain`, `t287-st2a-g`, `t287-wave2-owner-contract-source-set`, `types/framework-handoff.compile.ts` | `CONSENSUS_IDS`, publication, `ticket_consensus`, capability | re-pointed or key removed |
| `T/test_env/proof/abi5-root-r10.events.jsonl` | recorded refs | unchanged (residual 3) |

## T3 Derived identities that changed

| Subject | Change | By |
|---|---|---|
| `EXACT_OWNER_CONTRACT_KEY_SET_DIGEST` | `sha256:61077d01…ec24a4f` → `sha256:08ae1818…0e0707` | source literal, value from the owner's own refusal at build; no other pin |
| 18 `T/contracts/public-operations/*/operation-contract.json`, `public-functions/adapter-projection.json`, `schemas/public-operation.schema.json`, `schemas/operations/project/read/{request,result,refusal}.schema.json` | digests; `project.read` loses `ticket_consensus` | `npm run build` |
| `T/contracts/qualification/sources/*` (PRODUCT, REQ-P-CATALOG, -PUBLIC-CONTRACTS, -QUAL, -SCENARIOS, two READMEs; REQ-P-CONSENSUS removed) | restaged | `node scripts/generate-qualification-rule-catalog.mjs --stage-authorities ../../.. "<STDO v3.0.4 release>"` (read only) |
| `T/contracts/qualification/{authority-inputs,law-basis,rule-catalog,coverage}.json`, `schemas/self-conformance.schema.json` | sources 95 → 94, rules 2,110 → 2,074 | `npm run build` |
| `T/contracts/capabilities/capability-definition-graph.json`, `T/product-toolchain-manifest.json` | 15 capabilities, 9 publications | `npm run build`; uncommitted |

## T4 Qualification rules that cited F08, S05 or Consensus

36 base rules: 31 from `REQ-P-CONSENSUS.md`; `PRODUCT.md` `### Consensus` and
`ABG5-S05`; `REQ-P-SCENARIOS.md` `ABG5-S05` and `REQ-P-SCENARIOS-012`;
`REQ-P-QUAL-061`. Their spans are gone, so all 36 are gone; no rule was added
and no other rule was removed. `law-basis` and `authority-inputs` dropped the
`REQ-P-CONSENSUS` source. No contract cited `A5-F08` by identity.

## E5 Public surface delta

| Surface | Base | Now | Removed |
|---|---|---|---|
| Operations | 18 | 18 | none |
| Definitions | 56 | 55 | `abg.operation.project.read#ticket_consensus` (project.read 24 → 23) |
| Schema assets | 22 | 9 | `consensus-{subject,panel,reviewer-profile,submitter-profile,submitter-response,ruling-overlay,escalation-decision,round-policy,round-outcome,result}`, `review-findings`, `review-rulings`, `ticket-consensus-projection` |
| Vocabulary assets | 3 | 0 | `review-ruling-kind`, `consensus-round-outcome`, `consensus-fh-decision` |
| Mandatory schema/vocabulary ids | 44 | 33 | 9 schemas, 2 vocabularies |
| Capabilities; module publications | 16; 10 | 15; 9 | `graph-function.consensus@5`; `module://abg/consensus@5` |
| `productRelativeLocators` | 5,325 | 5,314 | built Consensus `.js`/`.d.ts` (6), mirror, schema, 3 vocabularies |

No event kind changed; no retained operation or member changed meaning.

## T5 Tests (tests/pass/fail/skip, base → after)

| File | Law and specimen | Result |
|---|---|---|
| `a5-f02-canonical-gtl-identity` | ActionCatalog canonicalization, rederived identity, duplicate refusal; structural fan-out Program with a test-authored ActionCatalog | 7/7/0/0 → same |
| `r4-catalog-admission` | determinism, refresh, collision, node_type separation and application; structural publication plus one inline node_type | 8/8/0/0 → same |
| `t287-w2-05-install-catalog-owner-chain` | Public catalog.view, session-view reads, declared-inventory conformance; requirement-handoff and semantic-stage rows, requirement-handoff Program; `ticket_consensus` arm deleted | 3/3/0/0 → same |
| `steel-basic-cli-public` | installed eventless catalog.view chain; same two core rows | 1/1/0/0 → same (rerun alone) |
| `t287-st2a-g-capability-definition-graph` | dependency-edge crossing refusal; `runtime.replay-continuation@5` | 4/4/0/0 → same |
| `t287-wave2-owner-contract-source-set`, `r10-projection-contracts`, `t287-pfc-f08a-…`, `t287-w2-05-generator-package-reproducibility` | 18/55 family | 15/15/0/0, 11/1/0/10, 1/1/0/0, 2/2/0/0 → same |
| `t287-framework-handoff-types` | 55 declared, 46 callable | 6/5/1/0 → same; red is pre-existing (`ABI5_HC1_BASELINE_PACKAGE_PATH` unset) |
| 10 other edited tests and support importers | core publication set | identical (e.g. `uat/harness` 33/33, `t287-c2-child-program` 4/4, `t287-declared-testing-capability` 7/3/0/4) |
| 25 further base files | — | identical except below |

Base reds unchanged: `t287-calculus-fold` 2 (HS03 metadata),
`t287-route-reconstruction` 2, `t287-single-address-space-consolidation` 10 →
7 (subset; absent `consolidation-inputs/`). `t287-st1-installed-cross-owner-hello`
3/1/2/0 and `t289-install-event-bodies` 4/0/4/0 failed at base because I edited
`code/src` while they packed; after 3/3, 4/4. Ten unbaselined importers
(`t287-default-library` 37/34/0/3, `t287-c0-post-publication-failure` 31/31,
management, generic-job, rp2, continuation) pass with env-gated skips only.

## Evidence

- E1 `npm run build` exit 0 on the tree of `be05bbfbc` (only the two permitted
  generated files change); `lint:imports` "3 forbidden owner pair(s) hold",
  `lint:calculus` "no offender", both as base. At that commit the source and
  digest tests (qualification law, scopes, carrier, wave2, pfc-f08a, a5-f02,
  r4) rerun equal to base.
- E2 per-file `node --experimental-vm-modules --test --test-concurrency=1` with
  `TMPDIR=/private/tmp/abg-consensus-tmp`; logs under `/private/tmp/abg-consensus-tmp/results-*`.
- E3 not fully met. `git grep -il consensus HEAD -- . ':!.ai-workspace'
  ':!release_snapshots'` returns 21 files: 9 G rows and 12 others, each with a
  cause: `INTENT.md` ("change nothing else"); the two generated files ("leave
  uncommitted"); the INTENT mirror (keeps the intent commit droppable); the
  proof log and the 4.6 release note (recorded history); 5
  `test_env/qualification` files (decision 2). E4: 0 missing script paths.

## Deviations

1. `GOALS.md` edited: its fixed-basis lines named Consensus.
2. Order text, code, intent, so the intent commit drops cleanly.
3. The text commit was amended for four late F08/S05 design citations.
4. Census miss caught by E2: steel and w2-05 viewed the Consensus node_type and
   overlay rows; both now view core callable rows.
5. Accepted-cut designs keep their dated 18/56, 24-read and 27-case counts.

## Residual risks

1. `INTENT.md:164` is now false ("standalone Consensus qualification … retain
   the release allocations owned by Product"); 295/298 stay true. Not edited.
2. `T/test_env/qualification/*` still lists Consensus files and ids (decision 2).
3. `T/test_env/proof/abi5-root-r10.events.jsonl` keeps recorded Consensus refs.
4. `docs/ABIOGENESIS_RC_RELEASE_NOTE.md:59` is the 4.6.0-rc.3 note.
5. HEAD's two uncommitted generated files still name Consensus.
6. The INTENT qualification mirror predates the amendment.
7. Design cites tickets T-252/T-274/T-275 118 times; ADR-045/046 cite "T-270 S05".
8. Installed Public view over non-callable rows is proven only by the env-gated
   `steel-consumer-declaration`.
9. No shipped A5-F07 standard system Program remains; fixtures carry the law.
10. Packing tests run `prepack` (full build) in place; run them serially.

## Decisions

1. Repair `INTENT.md:164`.
2. The brief says "qualification references are dependencies to update".
   `T/test_env/qualification/{inventory,tenant-manifest}.json` and `recipe/*`
   are the pre-RC candidate's resources: 289 of 1,191 inventory members already
   differ at base, and `build-resources.mjs` needs an installed package and a
   Public install record. Regenerate now, or at the next exact-candidate
   qualification after packages A and B land. Not regenerated here.
3. Whether F07 needs a shipped standard system Program.
4. Restage the INTENT mirror once the amendment is accepted.

## Standing after independent review

The retirement is not on the RC12 line: package CB reverted `f4aad7d5e`,
`fb86974e3` and the dependent `da1d589a9` and `a61231c6a`, so RC12 keeps
standalone Consensus as base `62fd17271` had it. The retirement is prepared on
branch `claude/rc12-consensus` at `9c086294b`.

It needs the owner's Product decision on how the One Surface feature (`A5-F07`,
PRODUCT.md section "System And One Surface", REQ-P-POLICY-023) is realized and
proved without the Consensus program, and what the default start mode
(`rootMode` `supervised`) targets.

Repairs from review RV4 to apply when it proceeds:

1. The three specification sites that require a shipped standard system
   program: PRODUCT.md "System And One Surface", the `A5-F07` feature row, and
   REQ-P-POLICY-023 (supervised start "selects the admitted standard system
   program") (F1).
2. The lost executing test of the non-callable-row contract reference law in
   `validator/validation.ts`: a non-callable contribution whose
   `declarationOrContractRef` is not a published contract is refused. Its only
   test was in the deleted `m5-consensus-module` (F2).
3. The dead projection seams and exports: `product/semantics.ts`
   `publicResultProjectionKinds`, `projectPublicResult` and the three
   `*PublicResultProjection` functions exported through `./product`;
   `public/run_projection_authority.ts` and its type export (F7).
4. The T-287 lines that would contradict the tree: `CONSENSUS-QUAL-5.1`
   ("Preserve existing ordinary Consensus GraphFunction"), the F07 row ("One
   Surface code exists around Consensus") and the F08 row ("Preserve existing
   ordinary GTL code") (F4).
5. The change authority recorded in the Product header: the owner's ruling with
   its quote and date (F4).
