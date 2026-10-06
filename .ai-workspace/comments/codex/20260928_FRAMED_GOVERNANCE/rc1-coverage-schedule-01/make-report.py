from pathlib import Path
from hashlib import sha256
import json

R = Path('/Users/jim/src/apps/abiogenesis')
G = R / '.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE'
D = R / '.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE'
O = G / 'rc1-coverage-schedule-01'

def write(name, value):
    (O / name).write_text(json.dumps(value, indent=2) + '\n')

def pin(path, relation, role='retained evidence or exact source'):
    path = Path(path)
    data = path.read_bytes()
    return {'path': str(path), 'bytes': len(data), 'sha256': sha256(data).hexdigest(),
            'relation': relation, 'role': role,
            'limit': 'Read this file; no complete enclosing freeze audit or native sufficiency inferred.'}

sources = [
    (R/'AGENTS.md', 'declared Worker/Reviewer separation and Executive mutation lock'),
    (R/'README.md', 'Product and source/installed native path boundary'),
    (R/'specification/GOALS.md', 'GOAL-035 fixed wave and preserved accepted witnesses'),
    (R/'specification/INTENT.md', 'selected composable graph/reference-frame intent'),
    (R/'specification/PRODUCT.md', 'fifteen families; S01/S02/S03/S06 and ordered S07'),
    (R/'stdo_abiogenesis.json', 'exact current STDO RC2 work-governance selection'),
    (R/'specification/requirements/product/REQ-P-QUAL.md', '056/057/062/064A-C exact qualification, shared proof and sole reducer'),
    (R/'specification/requirements/product/REQ-P-SELF-CONFORMANCE.md', 'full real-subject F11 and seven defect categories'),
    (R/'specification/requirements/product/REQ-P-SCENARIOS.md', 'source-linked required scenario joins and exclusions'),
    (R/'build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md', 'selected end-to-end integration claims and material coordinates'),
    (R/'build_tenants/abiogenesis/typescript/design/T287_D4_D5_NATIVE_QUALIFICATION_DESIGN.md', 'reuse conditions, sufficient scoped material, identity/independence and actual proof'),
    (G/'rc1-sunny-day-steel-thread-01/coverage-request.txt', 'Root exact bounded report operation grant'),
    (G/'rc1-sunny-day-steel-thread-01/plan.md', 'Root selected sunny-day steel thread; commentary, not Product authority'),
    (G/'final-candidate-construction-02/return.md', 'exact frozen prospective C02 construction/install; no qualification'),
    (G/'final-candidate-construction-02/freeze.json', 'C02 enclosing evidence coordinate only; not wholly reverified here'),
    (G/'final-candidate-construction-02/selected-core.json', 'actual selected read-only bootstrap/archive coordinate'),
    (G/'final-native-setup-03/selected-core.json', 'N03 caller actual selected C02/archive'),
    (G/'final-native-setup-03/driver.mjs', 'ready seven-operation isolated setup donor; old final Hello assertions excluded'),
    (G/'final-native-setup-03/public-support.mjs', 'installed exports loader; original start is Hello-grant pinned'),
    (G/'final-native-continuation-04/return.md', 'actual S01 operation success and stale proof-consumer failure preserved'),
    (G/'final-native-continuation-04/ordinary-caller.mjs', 'current six-key conformance and three-key read resource/caller donor'),
    (G/'final-native-continuation-04/owner-checks.mjs', 'current native wrapper/owner construction seam donor'),
    (G/'final-s01-retained-output-review-02/return.md', 'accepted exact C02 retained S01 proof'),
    (G/'final-candidate-coverage-selection-01.md', 'C01 advisory history; old S01/build-input selection superseded'),
    (G/'s7-release-scenario-inputs.md', 'routed scenario source/caller/oracle donors; not executable unchanged'),
    (D/'s02-installed-continuation-17/cases.json', 'selected World graph-substitution and gate/child/view cases'),
    (D/'s02-installed-continuation-17/caller.mjs', 'general DefinitionCall/Program-membership donor'),
    (D/'s02-installed-continuation-17/campaign.mjs', 'external malformed subject and native result/failed oracle'),
    (D/'s02-installed-continuation-17/oracle-basis.json', 'exact independent source/assertion routes'),
    (D/'s02-installed-continuation-17/return.md', 'actual foreign-subject substitution/child/gate/conformance outcomes'),
    (D/'s02-installed-continuation-13/assertions.mjs', 'caseInput at5-12 and graph-substitution oracle at102-105'),
    (D/'s02-carrier-02/public-support.mjs', 'general installed public export loader and constructStart donor'),
    (D/'s02-carrier-02/cases.json', 'existing recursion/vector/compute/input donor population'),
    (D/'s02-installed-continuation-04/return.md', 'bounded recursion/vector/compute acceptance on foreign archive; prior nested-retry stop'),
    (D/'s02-installed-continuation-15/cases.json', 'exact nested-compose donor input'),
    (D/'s02-installed-continuation-15/return.md', 'actual six-call compose and later genuine cold read relation'),
    (D/'s02-installed-continuation-09/cases.json', 'invalid-json/const-contradiction F_P and later case donors'),
    (D/'s02-installed-continuation-10/cases.json', 'incomplete/missing/wrong attribution F_P donor inputs'),
    (D/'s02-installed-continuation-10/return.md', 'preserved actual malformed/unattributed transport outcomes'),
    (D/'s02-installed-continuation-18/held-readback-disposition.json', 'correct actual nonterminal held/refusal/replay scope'),
    (G/'s03-automatic-01/oracle.json', 'independent target3/desired10/unaffected7 paired oracle'),
    (G/'s03-automatic-review-01.md', 'accepted bounded deterministic loop plus old Public handoff gap'),
    (G/'s03-installed-handoff-01/return.md', 'actual final installed reader over historical workload'),
    (G/'s7-pending-consumer-01/selected-action-final-review-03.md', 'foreign-subject same/covered occurrence acceptance and refusal limits'),
    (G/'s6-raw-contract-01/installed-live-05/review.md', 'complete original selected basic-CLI lifecycle at exact foreign subject'),
    (G/'s6-raw-contract-01/installed-live-05/input.json', 'preserved original witness input meaning'),
    (G/'s6-raw-contract-01/installed-live-05/fulfillment-policy.json', 'preserved selected complete application obligations/oracle'),
    (G/'s6-raw-contract-01/installed-live-05/prepare.mjs', 'original installed native lifecycle preparation donor; not launch authority'),
    (G/'s6-raw-contract-01/installed-live-05/launch.mjs', 'original native lifecycle launcher donor; foreign subject'),
    (G/'final-qualification-inputs-02/return.md', 'exact Q02 immutable inputs and unbound native/independence slots'),
    (G/'final-qualification-inputs-02/verification-recipe.json', 'thirteen command selections'),
    (G/'final-qualification-inputs-02/test-selection.json', 'five group thirty exact test titles; prepared not run'),
    (G/'final-qualification-inputs-02/recipe.mjs', 'existing recipe/native producer task constructor route'),
    (G/'final-c2-output-consumer-repair-01/output-checks.mjs', 'task/attempt/artifact snapshot-root output consumer'),
    (G/'final-c2-current-resource-caller-02/return.md', 'prepared C2 caller at old84, not current136 execution'),
    (G/'final-c2-current-resource-caller-02/owner-relations.json', 'exact current owned C2/qualification proof path'),
    (G/'final-f11-bound-assessment-01/return.md', 'one genuinely bound015B responsibility, eight unassessed'),
    (G/'final-f11-bound-assessment-01/closed-state.json', 'genuine bound input/plan/role/render footprint'),
    (G/'final-f11-bound-assessment-01/task.json', 'one exact task; no semantic sufficiency'),
    (G/'final-f11-bound-assessment-01/plan.json', 'one exact declared role/selection slot'),
    (G/'final-f11-material-selection-02/domain-responsibilities.json', 'all nine015B responsibility populations; proposed applicability'),
    (G/'final-f11-material-selection-02/return.md', 'scope/material conflation root cause and unresolved fullcampaign'),
    (G/'final-f11-native-disposition-01/disposition.md', 'accepted dispatch/failure closure only; actual cost and provider unknowns'),
    (G/'final-f11-native-assessment-execution-01/final-handoff.json', 'genuine current136 handoff; no source/store acquisition here'),
    (R/'build_tenants/abiogenesis/typescript/test_env/tests/m5-installed-substitute.test.mjs', 'original independent exact3locus/twoComposition oracle'),
    (G/'final-candidate-construction-02/source-freeze/repo/build_tenants/abiogenesis/typescript/test_env/tests/m5-installed-substitute.test.mjs', 'same oracle included in frozen exact candidate source'),
    (G/'final-candidate-construction-02/source-freeze/repo/build_tenants/abiogenesis/typescript/code/src/gtl/hello_world.ts', 'exact installed source publication/substituteGraphFunction construction'),
    (R/'build_tenants/abiogenesis/typescript/code/src/gtl/self_conformance.ts', 'declared qualification assess/native/malformed/F11/soleAF22 carriers'),
    (R/'build_tenants/abiogenesis/typescript/code/src/implementation/release_publication.ts', 'clean exact source carrier and unchanged archive/verdict publication preconditions'),
]
S = Path('/Users/jim/Library/Application Support/STDO/releases/v2.5.1-rc.2/standards')
sources.extend([
    (S/'authority_compressions/stdo_bootstrap.md', 'exact release authority entrypoint and scoped engagement'),
    (S/'REFERENCE_FRAME_METHOD.md', 'required results/conjunction/exact closed result applicability'),
    (S/'STDO_REFERENCE_FRAME_BASELINE.md', 'Worker return/Executive conjunction and whole-path integration claims'),
    (R/'.genesis/development-products/axiom-indexer/build_tenants/core/code/ac.py', 'installed section join only; not source authority'),
])
records = [pin(p, why) for p, why in sources]
write('evidence-index.json', {'status': 'read-and-pinned', 'records': records,
      'populationLimit': 'Selected source/file reads; no complete freeze, runtime, scenario or qualification recertification.'})

catalog_path = G/'final-candidate-construction-02/install/node_modules/@abiogenesis/typescript-tenant/contracts/qualification/coverage.json'
catalog = json.loads(catalog_path.read_text())
routes = {
 'ABI5-ROOT-001': ['S01'], 'conservation/compute': ['S02a','S02g','S02j'],
 'conservation/structural': ['S02a','S02b','S02c','S02d','S02e','S02f','S03a'],
 'conservation/consequence': ['S02b','S02e','S03a','S03b','S03c','S06'],
 'conservation/disposition': ['S02b','S02d','S02e','S02f','S02g','S02i','S03a','S03b','S03c','S06'],
 'conservation/public': ['S02a','S02c','S03b','S03c'],
 'fibre-substitution': ['S02g'], 'complete-C-algebra': ['S02a','S02b','S02c'],
 'malformed-GTL': ['S02h'], 'malformed-FP': ['S02i'],
 'public-operator-loop': ['S03a','S03b'], 'self-conformance': ['F11a','F11b','F11c','F11d','V22'],
 'native-projection': ['S01','S02a','S03a','Q56','F11a','V22'],
 'selected-downstream-lifecycle': ['S06'], 'ABG5-S02': ['S02d','S02e','S02f','S02h','S02i'],
 'ABG5-S03': ['S02g','S03b'],
}
groups = []
for claim in catalog['claims']:
    short = claim['coverageRef'].removeprefix('qualification-coverage-claim://abiogenesis/').removesuffix('@5')
    groups.append({**claim, 'scheduleRows': routes[short],
                   'qualificationState': 'unjoined; attention mapping is not applicability/sufficiency judgment',
                   'actualBehaviorRows': [{'behavior': b, 'scheduleRows': routes[short],
                      'producingEvidenceLimit': 'Use schedule.md actual producer scope; no label-based current runtime credit.'}
                        for b in claim['behaviors']]})
write('coverage-map.json', {'kind': 'non_authoritative_schedule_read_model',
    'source': pin(catalog_path, 'exact C02 published complete retained coverage declarations'),
    'catalogRef': catalog['catalogRef'], 'catalogDigest': catalog['catalogDigest'],
    'lawBasis': catalog['lawBasis'], 'groups': groups, 'groupCount': len(groups),
    'behaviorCount': sum(len(c['behaviors']) for c in catalog['claims']),
    'nativeQualification': False, 'missingJoinOwner': 'actual existing independent F11 coverage judgment'})

resp_path = G/'final-f11-material-selection-02/domain-responsibilities.json'
resp = json.loads(resp_path.read_text())
write('f11-responsibilities.json', {
    'source': pin(resp_path, 'complete current015B partition, not all-rule assessment completion'),
    'rule': resp['rule'],
    'responsibilities': [{k: p[k] for k in ['groupRef','relation','memberCount','status','selectedForOneMaterialPreparation']}
                         for p in resp['partition']],
    'totalMembers': sum(p['memberCount'] for p in resp['partition']),
    'selected': 'abi-composition-frame-hosts', 'remainingResponsibilityCount': 8,
    'otherRuleDomainSchemes': 186,
    'actualSemanticJudgmentsProduced': 0,
    'limit': 'Each responsibility needs actual grounded applicability/material/grouping/sufficiency judgment; no nine-task fixed dispatch roster.'})

write('ready-increment.json', {
 'row': 'S02a', 'selection': 'graph-substitution',
 'subject': {'archiveSha256': '766f748ae9806be95ae8ea124209130c2906ba8c93e172e4c919307ca437d747',
             'productContentSha256': '5fdaa1938626a7ed2c4afbcdd0d6bdf34a1276c76c34d3ba2559caa4689cd124'},
 'programRef': 'program://abiogenesis/conformance/hello-substitute@5',
 'graphFunctionRef': 'graph-function://abiogenesis/conformance/hello-substitute@5',
 'inputConstructor': 'installed gtl.constructHelloWorldInput("World")',
 'input': {'kind':'hello_world_input','schemaVersion':'5.0.0','subject':'World'},
 'allowlist': ['graph-function://abiogenesis/conformance/hello-substitute@5'],
 'regime': 'F_D',
 'oracles': [pin(D/'s02-installed-continuation-17/cases.json','selected case row and original public-target boundary'),
             pin(D/'s02-installed-continuation-13/assertions.mjs','caseInput5-12/assertScenario graph-substitution102-105'),
             pin(R/'build_tenants/abiogenesis/typescript/test_env/tests/m5-installed-substitute.test.mjs','original independent native substitute oracle25-78')],
 'expectedValue': {'kind':'hello_world_output','schemaVersion':'5.0.0','message':'Hello World'},
 'expectedLoci': ['locus://abiogenesis/conformance/hello-graph-edge/normalize@5',
                 'locus://abiogenesis/conformance/hello-substitute/normalized-pass@5',
                 'locus://abiogenesis/conformance/hello-graph-edge/render@5'],
 'expectedRoutes': ['advance','advance','terminal'], 'expectedCompositionIdentities': 2,
 'coldReads': ['run_result','run_replay'],
 'resourceDecision': 'C02 read-only physical bootstrap available; N03 is shared current136; old S02 runtime resources are foreign. Selected no-shared-write effect needs new isolated ordinary installed setup.',
 'proposedWriteTerritory': str(G/'rc1-s02-substitution-01'),
 'operationOrder': ['workspace.create(clean)','product.verify(packed C02)','product.resolve(exact C02)',
                    'product.install(clean/new event resource)','product.bind(workspace/exact installs/roots)',
                    'catalog.admit(exact full declared publications)','catalog.view(only substitute)',
                    'conformance.evaluate(substitute Program)','run.invoke(start exact substitute)',
                    'project.read(run_result)','project.read(run_replay)'],
 'donorAdaptionRequired': ['N03 driver stop before Hello; select substitute view/conformance only',
                          'use current exact six-key conformance and three-key read carriers',
                          'general constructStart donor, current native-wrapper run environment/application resources',
                          'current terminalResult.producer contract, not obsolete provenance',
                          'new role/operation/provenance and all paths confined to new effect territory'],
 'executionByThisWorker': False, 'providerCallsRequired': 0,
 'independenceLimit': 'Root owns execution grant and separate assurance; no wholeS02 or F11 claim.'})
