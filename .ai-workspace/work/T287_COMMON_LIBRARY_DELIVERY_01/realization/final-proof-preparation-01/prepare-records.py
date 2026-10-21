from pathlib import Path
import hashlib, json, re

repo=Path('/Users/jim/src/apps/abiogenesis')
w=repo/'.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01'
r=w/'realization/final-proof-preparation-01'
tenant=repo/'build_tenants/abiogenesis/typescript'
def pin(path,expected=None):
    p=Path(path);p=p if p.is_absolute() else repo/p
    b=p.read_bytes();h=hashlib.sha256(b).hexdigest()
    if expected is not None: assert h==expected,(str(p),expected,h)
    return dict(path=str(p),sha256=h,bytes=len(b),mode=oct(p.stat().st_mode&0o777))
def save(name,value):
    with (r/name).open('x') as f:json.dump(value,f,indent=2);f.write('\n')
known={
 'L2-execution-contract.md':'65f4007521634d808a3fd94bc87707ae4183ddb00ec4ec0da49e37381ee403c1',
 'proof/L2-report.md':'7beb5ee434076ed1e9e89759f4c237264318fbdb7c479f241a4893e41c337487',
 'proof/run-installed.mjs':'fb20ffc2a5f3bdfcbbbebc51e68d17ac1ec52b4fc20093aaa652efcfd84a7164',
 'realization/proof/oracle.mjs':'dee13b0b642c9b3184d5ed27a5ee1bbd07a951c19b7481469bc4a681aff995dc',
 'realization/pure/freeze.json':'ce01cdb084f5b0c3827ac9cce481d12e63193a24a1467c9409c9be9a768acca4',
 'realization/currentness/freeze.json':'433107b89d8eb01cc5a67ad6c8543e18d37575d5f89ba490c3795108955e788d',
 'realization/lifetime-stream-repair-01/freeze.json':'8668dfa9ddbfb2fcfa860659e383e0527b009afb532e385e876384eba5b1b155',
 'realization/k11-role-source-successor-01/freeze.json':'a1fe796ac076672cc2b8835f66b68c007ee1a41c374a62a6455ab75975ad446d',
 'realization/u1-physical-scope-successor-01/freeze.json':'1d8ec427aa2486c31763bf3d40ac1afc0f0cf9dafa3032165cd996096ed868ce',
 'realization/p5-installed-preparation-01/freeze.json':'b8859cda37f284ef928360059664b14b4304c131b23e21f453cdc4cf135e92b6',
 'realization/l4-p1-baseline-01/freeze.json':'5af8841ae028de12ec51f6e02402ebbe1f53fdc4b1b45e388ef3127857e8a816',
 'realization/l4-p3-baseline-successor-01/freeze.json':'5cc9b52989fa0136f850a11dee1f41cda1d6b9de858612bf3209d2c158cfe087',
 'realization/p3-fixture-dependency-repair-01/freeze.json':'5bcbfbfa14151ad35126431bd9ee4a2930c62d797cdcece59b147a46f2e9b933',
}
inputs=[pin(w/p,h) for p,h in known.items()]
for p in ['realization/currentness-consumers/freeze.json','realization/currentness-consumers/case-to-owner-results.json',
          'realization/pure/report.md','realization/pure/retirement-audit.json',
          'realization/currentness/report.md','realization/currentness-consumers/report.md',
          'realization/u1-physical-scope-successor-01/report.md','realization/u1-physical-scope-successor-01/case-matrix.json',
          'realization/lifetime-stream-repair-01/report.md','realization/lifetime-stream-repair-01/selected-cases.json','realization/lifetime-stream-repair-01/case-results.json',
          'realization/k11-role-source-successor-01/report.md','realization/p5-installed-preparation-01/report.md',
          'realization/proof/comparison.json','realization/proof/retirement.json',
          'realization/l4-p1-baseline-01/output-correspondence.json','realization/l4-p3-baseline-successor-01/output-correspondence.json']:
    inputs.append(pin(w/p))
save('inputs.json',{'status':'preparation_inputs_verified','files':inputs,'finalPackage':'pending separately built combined-final-01; no moving artifact pin or execution authority','basis':'Closed source streams are separate subjects; their receipts are not acceptance.'})

def tests(name):
    p=tenant/'test_env/tests'/name;text=p.read_text();rows=[]
    for m in re.finditer(r"\btest\(\s*(['\"`])(.*?)\1",text,re.S):
        rows.append({'line':text[:m.start()].count('\n')+1,'name':m.group(2),'dynamic':m.group(1)=='`'})
    return {'file':str(p),'selectionSource':pin(p),'cases':rows,
            'executionCorrespondence':'Final isolated execution source must match this file or its specifically closed successor; this inventory alone is not an execution receipt.'}
groups=[]
def add(id,owners,files,evidence,status,selection=None,limits=None):
    groups.append({'id':id,'owners':owners,'files':[tests(n) for n in files],
      'existingEvidence':[pin(w/'realization'/p) for p in evidence], 'status':status,
      'selection':selection,'limits':limits,
      'supportPrerequisite':'Compare exact tested source/body, emitted owner and complete imported support cone against final stage and archive. Physical, installed, controlled and native premises remain distinct; reused counts never migrate to a different artifact identity.'})
add('V1-pure','K01–K04',['t287-common-computational-library.test.mjs','t288-admission-predicates.test.mjs','t287-tv5-rooted-topology-partition.test.mjs'],['pure/commands/05-common-computations.json'],'reuse_exact_support',limits='Equality, exact-match multiplicity/order, key predicates, canonical algebra and rooted topology; not actual installed resolution closure.')
add('V2-static-and-V4-declaration','K05/K07',['t287-static-declaration-closure.test.mjs','t287-w2-05-static-binding-algebra.test.mjs','m5-s06-prime.test.mjs'],['pure/commands/06-owner-selection.json','pure/commands/08-owner-selection-generated-input.json'],'reuse_only_passing_selected_cases',selection=json.loads((w/'realization/pure/commands/06-owner-selection.json').read_text())['argv'],limits='13 passing owner/static cases in command06; m5 module setup failed in that aggregate. Only command08 supplies its 3 actual m5 passes. No skipped case credit. The additional preparation-resolution case needs final actual P1 call/receipt via owner-resolution.mjs.')
add('V3-seven-C','K06/HoG',['m5-c-algebra-validation.test.mjs'],[],'requires_final_selected_execution',selection='Exact first 18 named cases only. Last 3 require ABI5_STEEL02_RESOLVER_PROOF_PATH and receive no credit.',limits='C constructor and validator laws; no invented all-seven installed workload.')
groups[-1]['selectedNames']=[x['name'] for x in groups[-1]['files'][0]['cases'][:18]]
groups[-1]['excludedNames']=[x['name'] for x in groups[-1]['files'][0]['cases'][18:]]
assert len(groups[-1]['selectedNames'])==18 and len(groups[-1]['excludedNames'])==3
add('V3-retained-traversal','HoG/ABG',['m5-retry-lifecycle-authority.test.mjs','t287-retry-run-prefix.test.mjs','t287-generic-job-parent-foldback.test.mjs'],[],'source_routed_not_credited',limits='Exact prior receipt/support reuse or bounded owner selection still required for retry lineage, child/foldback and batch partial/unstarted relations. These files are candidate routes, not additional broad-suite activation.')
add('V4-actual-owner','Product verification/environment/catalog/execution resolution',['t287-w2-05-static-binding-algebra.test.mjs'],['l4-p1-baseline-01/result.json'],'final_P1_and_owner_glue_required',selection='Original P1 all ten calls + first/warm resolution + copy/mutate/crossed lock; owner-resolution.mjs positive and duplicate collection refusal; exact named preparation resolution test at line770.',limits='D03-OWNER-ORACLE-TRIAGE-01 replaces impossible duplicate→ambiguous expectation with actual earlier dependency refusal. Historical selected-execution-closure/conformance-owner-reuse environment is not automatically ready.')
add('V5-codec','K10/EventStore',['t287-event-body-encoding.test.mjs'],['pure/commands/09-event-body-codec.json'],'requires_final_full_14_case_execution',limits='14 actual existing codec cases. Keep heap-constrained subcase at its existing source-owned setting; no new quota.')
add('V5-reopen','K08/K09/EventStore/ABG',['m5-event-store-reopen.test.mjs'],[],'requires_final_full_18_case_execution',limits='Durable new/held/reopen/rollback/reappend/poison/forged/cold owner cases; exact source-selected fixtures, not historical continuation17.')
add('V5-route','K08/K09/EventCalculus/HoG',['t287-route-reconstruction.test.mjs'],[],'requires_final_self_contained_selection',selection='All named tests except the two P0_RETAINED_NATIVE_SCRATCH cases; explicit CLI name pattern excludes them. Pass --experimental-vm-modules and --expose-gc for existing source/GC checks.',limits='Two excluded historical rows remain gaps requiring exact supported reuse or owned replacement selected by Executive. No skipped-case closure; no acquisition of continuation17.')
groups[-1]['excludedNames']=['retained native outputs and exact pre-basis historical owner facts are conserved','route facts ignore unrelated growth and preserve relevant source, cursor and intent changes']
groups[-1]['selectedNames']=[x['name'] for x in groups[-1]['files'][0]['cases'] if x['name'] not in groups[-1]['excludedNames']]
add('V6-K11','GTL STDO context/actual Product access/ABG assembly',['t287-stdo3-run-environment.test.mjs'],['pure/commands/04-stdo3-acquisition-after-fixture-reentry.json','k11-role-source-successor-01/report.md'],'reuse_closed_K11_cases_then_final_installed_P4',limits='Original acquisition support is unchanged; successor constructor/management cases supersede affected original source. Final P4 asserts literal spans55240–55942 and64650–65910 and fresh canonical mirror≠installed STDO. Baseline is capability refusal, never native timing ratio.')
add('V6-E03','K12 owned process lifetime/command/HTTP/worker',['t287-owned-process-lifetime.test.mjs'],['lifetime-stream-repair-01/selected-cases.json','lifetime-stream-repair-01/case-results.json'],'reuse_27_exact_closed_successor_cases',limits='13 controlled +4 physical +10 worker, separately scoped. Capture policies and original failed EPIPE receipts remain; E03 event-order regressions below are still required on final combined subject.')
groups[-1]['exactClosedCases']=json.loads((w/'realization/lifetime-stream-repair-01/selected-cases.json').read_text())
add('V6-U1-full','EventCalculus/native join and seven consumers',['t287-native-work-unknown-effect.test.mjs','t287-native-work-currentness-consumers.test.mjs'],['currentness/passing-support-correspondence.json','currentness-consumers/case-to-owner-results.json','u1-physical-scope-successor-01/case-matrix.json'],'requires_one_full_combined_aggregate',selection='Run both complete files once on final combined source; do not use prior case-selection environment filters.',limits='Original U1 26 local tests/subtests, consumer eight owner rows/38 gate calls, successor one test/eight vectors are separate subjects. Latest cross-binding target correction and real C0 successors require this aggregate; same-family reviews are not semantic independence.')
add('V6-E03-event-order','native workspace physical transport/ABG terminality',['t287-native-workspace-work.test.mjs','m5-terminal-quiescence-owner.test.mjs'],['currentness/regression-native-work-03.json','currentness/regression-terminal-01.json'],'requires_final_selected_execution',selection='Native-workspace: post-effect channel conflict retains admitted native failure scope without a fabricated exchange; terminal-quiescence: full7.',limits='Actual disposable local native-workspace regression, no paid provider. Fixture lower installation/ancestry premises remain disclosed; no historical retained native root.')
add('V6-P5-physical','installed C2/HTTP/common lifetime/fresh replay',['t287-worksite-command-execution.test.mjs'],['p5-installed-preparation-01/report.md'],'prepared_not_executed',selection='Exact P5 draft rebound to final archive plus new canonical /private/tmp roots under separate grant.',limits='Actual installed common lifetime; captured cleanup; canonical budget27750, explicit HTTP Connection close. Template roots insideW are placeholders. P4 requires final P5 result.')
add('V6-E04-physical','Product C0 observation/replacement/native after-state',['t287-worksite-file-replace-owner.test.mjs','t287-native-workspace-work.test.mjs'],['u1-physical-scope-successor-01/case-matrix.json'],'owning_cases_identified_not_aggregate_credit',selection='C0 named owner case; native unavailable after-observation / observed partial failure / timeout/malformed/read-only-change cases only if separately selected.',limits='C0 case covers relative/escape path, symlink, directory, hard-link/physical alias and stale predecessor. Latest U1 supplies real C0 commit plus unavailable-after observation at actual byte bound, but not interrupted publishCreateOnly or persistExactFile collision execution.')
add('V7-paths-and-cost','P1–P5 actual owner paths/cost/retirement',[],['l4-p1-baseline-01/result.json','l4-p3-baseline-successor-01/result.json','proof/comparison.json','proof/retirement.json'],'final_artifact_and_effect_grants_required',limits='Uninstrumented final P1→P2 actual-returned-prefix→P3; P5 physical/U1; then one native P4 only. Deterministic diagnostic repetitions and complete retirement/package/source checks are separately granted. No original candidate01 evidence as final identity.')
save('coverage.json',{'kind':'finite_final_case_to_owner_map','status':'NOT_GRANTED','groups':groups,
 'gaps':[{'id':'route-history-two','owner':'route reconstruction','needed':'Exact reusable historical receipts with full support matching, or separately selected owned replacement; P0 environment placeholders are not proof.'},
 {'id':'HoG-retained-laws','owner':'HoG/ABG','needed':'Exact receipt/support selection for retry lineage, child/foldback and batch partial/unstarted beyond constructor checks. No broad-suite launch.'},
 {'id':'E04-create-only','owner':'implementation/worksite_command_helper.ts publishCreateOnly/materializeSnapshot; product/materialization_operations.ts persistExactFile','needed':'No standalone exact passing receipt selected here for identical-content collision, concurrent no-clobber/temp partial-write residue, malformed link/node kind across these distinct owners. Root must select exact prior evidence or bounded owner replacement. C0/native partial effect is not substitute.'},
 {'id':'K07-historical-environments','owner':'selected-execution-closure/conformance-owner-reuse','needed':'No blanket readiness from source presence; final P1 and new controlled actual-owner glue cover selected admitted domain only. Any additional accepted multi-entry or next-call module-acquisition relation requires exact supported owning receipt.'},
 {'id':'V7-unobserved-channels','owner':'cost observation','needed':'Native trace unsized IO, non-Node child IO/CPU, cold-scope causal iteration count and GC-cache retained bytes remain explicit. Observed channels do not create a global byte total.'}],
 'nativeGate':{'requires':['P1','P2','P3','P5-physical','P5-U1'],'subjectId':'same final candidate identity','maxCalls':1,'noExtraNativeForMeasurement':True},
 'reuseRule':'Only exact tested support correspondence; control/local/physical/installed/native are distinct. No test count, skip or source-presence closure.'})

ownerfiles=['product/execution_resolution.ts','product/catalog.ts','product/environment.ts','product/declaration_closure.ts','shared/public_function_family.ts','shared/owner_contract_source_set.ts']
save('D03-admissible-domain.json',{'status':'source_argument_pending_final_emission_correspondence','authority':'D03-OWNER-ORACLE-TRIAGE-01','sources':[pin(tenant/'code/src'/p) for p in ownerfiles],
 'relations':[
 {'owner':'exactInstallForCoordinate','argument':'Resolver424–498 reconstructs Catalog/View, verifies every admitted install against actual ABG projection, requires unique installId/admissionEventRef and exact candidate bijection. Coordinate predicate311–321 includes installId equality. Therefore its matching subset has at most one member at all actual joins.'},
 {'owner':'exactInstallForPublication','argument':'Program declaration closure is required at500–508. declaration_closure exactOwnerCoordinate348–371 requires exactly one Catalog installed candidate with the same Product/content/manifest tuple for every selected declaration, including Program owner. Resolver candidate bijection preserves that multiplicity. Therefore the Program publication match at698–716 cannot be many on admitted inputs.'},
 {'owner':'publicationForCoordinate','argument':'Both program and selected declaration closures are produced by declaration_closure resolve; selectedPublicationMap789–795 deduplicates moduleRef+semanticDigest and returned publications906–915 are exactly its values. publicationForCoordinate374–385 includes equality on that tuple and additionally owningProductId. Every call642/759/768/789/832/938/962 consumes one of those closure arrays; additional product equality cannot increase multiplicity. Therefore at most one matches without digest/coordinate substitution.'},
 {'owner':'selected intrinsic Public definition','argument':'owner_contract_source_set520–542 checks56 source rows,56 distinct composite keys,18 operation IDs and fixed key-set digest at module construction. public_function_family342–357 maps those sources then deep-freezes family and definitions. Canonical definitionKey equality cannot select many. Actual installed glue checks frozen keys through the immutable exported family; no constant mutation.'}],
 'boundary':'Pure resolveExactMatch still requires many/duplicate/order/throw laws. Actual resolver duplicate collection must yield incompatible_or_unproven/dependency before inner exact matching. No claim that every other catalog/GraphFunction ambiguity is unreachable.'})
baseComparison=json.loads((w/'realization/proof/comparison.json').read_text())
save('output-correspondence.json',{'status':'frozen_before_final_candidate_and_diagnostic_outputs','policy':pin(w/'realization/proof/comparison.json'),'policyContents':baseComparison,
 'baselineP1':pin(w/'realization/l4-p1-baseline-01/output-correspondence.json'),'baselineP3':pin(w/'realization/l4-p3-baseline-successor-01/output-correspondence.json'),
 'finalCandidate':{'archive':None,'manifest':None,'packageInventory':None,'sourceFreeze':None,'status':'pending final combined artifact'},
 'withinSubject':'All original frozen oracle predicates, full literal Hello World, owning Program/graph contracts, actual resolution/validation values, fresh CLI result/replay, exact close handoff and event-prefix bytes remain. Duplicate-owner glue additionally preserves prefix without acquisition/admission.',
 'diagnosticRelation':'Use identical original runner and oracle, fresh independent roots and exact same subject archive/support. Owner/digest/path/currentness differences are paired through the actual producer identities; no global stripping. Retain full receipts before asserting comparison. Diagnostic overhead is observed versus its matching uninstrumented endpoint, with intervals/scopes stated and no speed threshold.',
 'P4':'Capability witness only; one native selector after same-subject prerequisites. Exact literal spans in original runner389–390; sourceMirror→newRoot requires absent path and realpath equality. Final configuration must bind explicit fresh mirror distinct from exact installed STDO root.',
 'P2':'Use actual returned successor close handoff and prefix for projections. Refusal alone never proves unchanged prefix.'})
print(json.dumps({'inputs':len(inputs),'coverageGroups':len(groups),'status':'prepared','workloadsRun':0}))
