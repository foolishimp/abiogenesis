"""One external selection. No dispatch, test/build, owner replacement or body clipping."""
from pathlib import Path
import json,hashlib,collections
O=Path(__file__).resolve().parent;G=O.parent;R=G.parents[3]
D=G/'final-f11-scope-inputs-01';C=G/'final-candidate-construction-02';Q=G/'final-qualification-inputs-02'
T='build_tenants/abiogenesis/typescript/';P='repo://abiogenesis/';I=C/'install/node_modules/@abiogenesis/typescript-tenant'
def sha(b):return hashlib.sha256(b).hexdigest()
def digest(b):return 'sha256:'+sha(b)
def canonical(v):return json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
def save(n,v):(O/n).write_text(json.dumps(v,indent=2,ensure_ascii=False)+'\n')
def read(p):return json.loads(p.read_bytes())
acquired=[]
def acquire(p):
 b=p.read_bytes();acquired.append({'path':str(p),'bytes':len(b),'sha256':sha(b)});return b
cuts={}
for name,path,h in [('scope',D,'e6ef1710c98f26da61bde1111ec71af5739e829e2dbee25c5de1b6c2977f5545'),('candidate',C,'7256ca2e716e73912f4937fdddc6d8a980a217ecf965cac1512ba5162dac4469'),('qualification',Q,'a4c2b5afd94fd7402b6bbfc732e691eb345dbcf4334a0300de490f607b9aad79')]:
 b=acquire(path/'freeze.json');assert sha(b)==h;v=json.loads(b);cuts[path]={r['path']:r for r in v['records']}
def frozen(root,n):
 b=acquire(root/n);r=cuts[root][n];assert len(b)==r['bytes'] and sha(b)==r['sha256'],str(root/n);return json.loads(b) if n.endswith('.json') else b
old=frozen(D,'scope-body.json');old_bank=frozen(D,'material-index.json');classes=frozen(D,'member-classification.json');before=frozen(D,'body-inputs/rule-154-0.json')
inventory=frozen(Q,'qualification-inventory.json');corr=frozen(Q,'qualification-member-correspondence.json');basis=frozen(Q,'basis-template.json')
catalog=frozen(C,'install/node_modules/@abiogenesis/typescript-tenant/contracts/qualification/rule-catalog.json')
assert len(inventory['members'])==1950 and len(catalog['rules'])==2137 and len(catalog['sources'])==95
assert inventory['inventoryDigest']=='sha256:107360f76fdbdfa7920d912aac2edc10ecaf80ca88406190748f28d834c40101'
old_by={m['ref']:m for m in old['inventory']['members']};new_by={m['ref']:m for m in inventory['members']}
assert len(corr['members'])==len(old_by)==len(new_by)==1950
refmap={r['original']['ref']:r['successor']['ref'] for r in corr['members'] if r['original']['ref']!=r['successor']['ref']}
assert len(refmap)==19
oldbank={m['ref']:m for m in old_bank['materials']};class_by={m['ref']:m for m in classes['records']}
bank=[];coverage=[]
for row in corr['members']:
 a,b=row['original'],row['successor'];assert old_by[a['ref']]==a and new_by[b['ref']]==b
 raw=acquire(Path(row['successorPhysicalOrigin']));assert digest(raw)==b['digest'] and len(raw)==b['byteCount'],b['path']
 donor=oldbank[a['ref']];same_body=a['digest']==b['digest'] and a['byteCount']==b['byteCount']
 retained={'path':str(D/donor['file']),**{k:cuts[D][donor['file']][k] for k in ['bytes','sha256']}}
 bank.append({'member':b,'physicalOrigin':row['successorPhysicalOrigin'],'retainedOriginalMaterial':retained,
  'retainOriginalBody':same_body,'rebindCoordinate':a['ref']!=b['ref'] or a['path']!=b['path'],
  'originalMember':a,'cohort':class_by[a['ref']]['cohort'],'originalGeneratedSourceJoin':next((j for j in classes['generatedSourceJoins'] if j['memberRef']==a['ref']),None)})
 coverage.append({'original':a,'successor':b,'actualBytesMatched':True,'bodyIdentityPreserved':same_body,'logicalPathPreserved':a['path']==b['path']})
authority=[]
for s in catalog['sources']:
 raw=acquire(I/s['path']);assert digest(raw)==s['digest'] and len(raw)==s['byteCount']
 authority.append({'member':s,'physicalOrigin':str(I/s['path'])})
for r in catalog['rules']:
 s=next(s for s in authority if s['member']['ref']==r['sourceRef']);raw=Path(s['physicalOrigin']).read_bytes()
 assert r['sourceDigest']==s['member']['digest'] and digest(raw[r['startByte']:r['endByte']])==r['spanDigest'] and r['startByte']<r['endByte']<=len(raw)
save('current-material-bank.json',{'inventory':{'ref':inventory['inventoryRef'],'digest':inventory['inventoryDigest']},'members':bank,'authority':authority,'meaning':'Whole exact bodies remain at frozen original/current origins. A ref is not supplied content. Unchanged donor bodies are referenced, not copied; external coordinate rebinding preserves body bytes only where verified.'})

# The responsibility is selected by actual governance declaration/realization
# ownership. All other members remain in the full rule partition, unassessed.
hosts={
 'gtl/default_library.ts':('defaultGovernanceGraphFunctions','Ordinary graph templates, nested workflow calls and recursive Executive publication.'),
 'gtl/registered_selection.ts':('resolveRegisteredSelection','Declared fixed graph membership and exact selected child input.'),
 'gtl/stdo_run_environment.ts':('constructRunEnvironmentDeclaration','Reusable frame/source/context/role bindings on existing Program and GraphFunction declarations.'),
 'product/default_library.ts':('FramedSynthesisTask','Frame evaluation data, contracts, policies and existing source-grounded prompt relation.'),
 'product/default_library_fulfillment.ts':('export','Existing governed task/fulfillment contract consumed by default graph work.'),
 'product/default_library_identity.ts':('governanceRef','Existing declared governance identity family; no new callable kind is inferred.'),
 'product/registered_selection_native.ts':('export','Existing probabilistic registered-selection contract realization.'),
 'abg/default_library.ts':('observedGovernanceTaskMatches','Native admission/provenance correspondence of ordinary default-library computations.'),
 'abg/registered_selection_provenance.ts':('export','Admitted source-to-selected-work relation retains existing runtime authority.'),
 'implementation/default_library.ts':('export','Published leaf implementations delegate to existing declared owners.')}
primary=[P+T+'code/src/'+p for p in hosts]
assert all(p in new_by for p in primary)
rule=next(r for r in catalog['rules'] if r['governedClaim']=='REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-015B')
oldgroup=old['ruleGroups'][154];assert oldgroup['ruleRefs']==[rule['ruleRef']]
oldns='scope-group://abiogenesis/final-f11-scope-inputs-01/';newns='scope-group://abiogenesis/final-f11-material-selection-02/'
def rewrite(v):
 if isinstance(v,str):return refmap.get(v,v).replace(oldns,newns)
 if isinstance(v,list):return [rewrite(a) for a in v]
 if isinstance(v,dict):return {k:rewrite(a) for k,a in v.items()}
 return v
class_current={refmap.get(m['ref'],m['ref']):m for m in classes['records']}
groups=collections.OrderedDict()
for m in inventory['members']:
 c=class_current[m['ref']]['cohort'];p=m['path']
 if m['ref'] in primary:k='abi-composition-frame-hosts'
 elif '/build/code/src/' in p:k='emitted-abi-projections'
 elif c=='supplier_toolchain':k='supplier-toolchain'
 elif c in ['generated_contracts','law_catalog_projection']:k='published-law-contract-projections'
 elif c=='proof_historical_records':k='historical-proof-records'
 elif c in ['proof_retained_source','proof_selected_regressions']:k='proof-source'
 elif c in ['constitution','current_how','retained_design_historical','retained_design_declarations']:k='law-and-design'
 elif c in ['campaign_controls','workspace_governance','build_controls','release_claim','frozen_supply_manifests']:k='construction-controls-and-claims'
 else:k='other-runtime-hosts-unresolved'
 groups.setdefault(k,[]).append(m['ref'])
old_surfaces=old['surfaceGroups'];cohort_by_ref={r['ref']:r['cohort'] for r in classes['records']}
oldsurface_by_member={ref:g for g in old_surfaces for ref in g['memberRefs']}
inverse={v:k for k,v in refmap.items()}
group_ref=rewrite(oldgroup['groupRef']);domains=[]
for label,refs in groups.items():
 original=[oldsurface_by_member[inverse.get(ref,ref)] for ref in refs]
 roots=[r for r in inventory['selectedRoots'] if any(ref==r or (r.endswith('/') and ref.startswith(r)) for ref in refs)]
 owners=list(dict.fromkeys(rewrite(x) for g in original for x in g['ownerRefs']))
 sources=list(dict.fromkeys(rewrite(x) for g in original for x in g['sourceRefs']))
 if label=='abi-composition-frame-hosts':
  owners=[P+'specification/PRODUCT.md',P+T+'design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md',P+T+'code/src/gtl/contracts.ts']
  sources=[rule['sourceRef'],P+'specification/requirements/gtl/REQ-L-GTL3-CONTEXT.md',*owners]
 domains.append({'groupRef':group_ref+'/domain/'+label,'memberRefs':refs,'rootRefs':roots,
  'surfaceRoles':list(dict.fromkeys(role for ref in refs for role in new_by[ref]['surfaceRoles'])),'ownerRefs':owners,'sourceRefs':sources})
assert len([r for g in domains for r in g['memberRefs']])==len(set(r for g in domains for r in g['memberRefs']))==1950
assert set(r for g in domains for r in g['rootRefs'])==set(inventory['selectedRoots'])
transform={'preimage':next(a for a in acquired if a['path']==str(D/'scope-body.json')),'currentInventory':next(a for a in acquired if a['path']==str(Q/'qualification-inventory.json')),
 'memberRefRebindings':refmap,'groupNamespace':{'from':oldns,'to':newns},'replaceRuleGroupRef':group_ref,
 'replacementApplicationDomain':{'ruleGroupRef':group_ref,'surfaceGroups':domains},'unchangedRuleGroupCount':186,
 'semantics':'Reconstruct existing complete scope, rebind current coordinates and replace only 015B application domain. Membership/roles/source refs remain explicit. Grouping and applicability are unassessed; no omitted member is waived.'}
body=rewrite(old);body['inventory']=inventory;body['applicationDomains'][154]=transform['replacementApplicationDomain'];transform['postimageBodyCanonicalDigest']=digest(canonical(body))
save('scope-transform.json',transform)
save('domain-responsibilities.json',{'rule':rule,'partition':[{'groupRef':g['groupRef'],'memberCount':len(g['memberRefs']),'members':g['memberRefs'],'status':'proposed; applicability and adequacy unknown','selectedForOneMaterialPreparation':g['groupRef'].endswith('/abi-composition-frame-hosts'),'relation':g['groupRef'].rsplit('/',1)[-1]} for g in domains],
 'originalAffectedDomainMembers':before['subjectMembers'],'conservedUnionCount':1950,'oldDomainDisposition':'Every former rule-154-0 member persists in this explicit successor partition. No satisfaction/inapplicability or dependent task is selected.'})

# Explicit full-body selection. Anchors document why each body is supplied;
# they are not substituted bodies or qualifications of other members.
spec=[
 ('specification/PRODUCT.md','Graph Composition And Reference Frames','Product meaning and prohibition of rival topology/runtime.'),
 ('specification/requirements/product/REQ-P-SELF-CONFORMANCE.md','REQ-P-SELF-CONFORMANCE','Published qualification role authority and independent semantic assessment obligation.'),
 ('specification/requirements/product/REQ-P-QUAL.md','REQ-P-QUAL-057','Published qualification role authority, exact basis and full coverage limits.'),
 ('specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md','REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-015B','Entire governing source; all 015B clause parts and adjacent composition/frame meanings.'),
 ('specification/requirements/gtl/REQ-L-GTL3-CONTEXT.md','REQ-L-GTL3-CONTEXT-009','Explicit 015B dependency 009..012; complete Context source retains all four clauses.'),
 ('specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md','REQ-L-GTL3-GRAPHFUNCTION','Existing callable and graph template semantics.'),
 ('specification/requirements/gtl/REQ-L-GTL3-C-ALGEBRA.md','REQ-L-GTL3-C-ALGEBRA','Existing nested graph/declaration composition law.'),
 ('specification/requirements/abg/REQ-R-ABG3-FRAME.md','REQ-R-ABG3-FRAME-001','ABG runtime Frame meaning and authoritative event/history boundary.')]
supports={
 'gtl/contracts.ts':('export','Existing Program, graph, callable, Context and contract carrier shapes.'),
 'gtl/c_algebra.ts':('workflow','Existing nested graph and computation composition algebra.'),
 'gtl/graph_applications.ts':('registeredSelectionApplication','Existing selection/recursion application declarations.'),
 'gtl/declarations.ts':('modulePublication','Existing module publication constructor and declared topology.'),
 'gtl/materialize.ts':('export','Existing graph-template materialization, without another executable language.'),
 'gtl/requirement_handoff.ts':('CONTEXT_DECLARATION_SCHEMA','Exact existing Context declaration shape reused by frame bindings.'),
 'hog/graph_execute.ts':('traversalProgram','Direct execution consumes original graph and C terms.'),
 'hog/evaluation_frame.ts':('EvaluationFrame','HoG local evaluation/return frames remain distinct from reference-frame evaluation contracts.'),
 'hog/workflow_lifecycle.ts':('export','Ordinary nested workflow invocation/return path.'),
 'hog/recursion_lifecycle.ts':('export','Ordinary recursive frame/foldback path.'),
 'abg/event_contract_profiles.ts':('frame_opened','Existing ABG Frame event contract family.'),
 'abg/traversal_transition.ts':('export','Existing native transition/admission owner for graph consequences.')}
designs={
 'T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md':('Common application contract','Accepted ownership and complete default-library graph composition relation.'),
 'T287_REGISTERED_GRAPH_SELECTION_DESIGN.md':('Existing mechanics','Accepted fixed-domain selection architecture and excluded hidden planner.'),
 'T287_REGISTERED_GRAPH_SELECTION_NATIVE_DESIGN.md':('Selected realization','Existing F_P/native binding to declared graph choices.'),
 'ABI5_PROJECT_REFERENCE_FRAME_BASIS.md':('F-END-TO-END-INTERFACE-INTEGRATION','Development reference-frame meaning and explicit runtime distinctions.')}
tests={
 'tests/t287-default-library.test.mjs':('default catalogue publishes','Concrete positive/negative composition and publication tests as source; no test execution claimed.'),
 'tests/t287-native-registered-selection.test.mjs':('test(','Native choice/source-input test obligations as retained source only.'),
 'tests/t287-recursive-registered-selection.test.mjs':('test(','Recursive same-HoG contract and frame/parent tests as retained source only.'),
 'support/default-library.mjs':('libraryConsumerDeclaration','Actual independent-consumer fixture declaration used by selected proof source.')}
requests=[(P+p,a,r) for p,a,r in spec]+[(P+T+'code/src/'+p,a,r) for p,(a,r) in hosts.items()]+[(P+T+'code/src/'+p,a,r) for p,(a,r) in supports.items()]+[(P+T+'design/'+p,a,r) for p,(a,r) in designs.items()]+[(P+T+'test_env/'+p,a,r) for p,(a,r) in tests.items()]
resolved={x['member']['ref']:x for x in bank};resolved.update({x['member']['ref']:x for x in authority})
selected=[]
for ref,anchor,why in requests:
 row=resolved[ref];m={k:row['member'][k] for k in ['ref','path','digest','byteCount']};raw=Path(row['physicalOrigin']).read_bytes();needle=anchor.encode();start=raw.lower().find(needle.lower())
 assert start>=0,('selection reason anchor absent',ref,anchor)
 selected.append({'member':m,'physicalOrigin':row['physicalOrigin'],'reason':why,'reasonSource':{'sourceRef':ref,'startByte':start,'endByte':start+len(needle),'spanDigest':digest(raw[start:start+len(needle)]),'line':raw[:start].count(b'\n')+1},'wholeBody':True,'originalBytesRetained':True})
assert len({r['member']['ref'] for r in selected})==len(selected)
primary_group=next(g for g in domains if g['groupRef'].endswith('/abi-composition-frame-hosts'))
criteria={'ruleRef':group_ref,'surfaceRef':primary_group['groupRef'],'evidenceRole':'semantic_assessment'}
criterion={'criterionRef':'criterion://abiogenesis/'+sha(canonical(criteria)),**criteria}
rationale={'kind':'external_material_selection_derivation','schemaVersion':'1','author':'/root/f11_attribution_inputs','activation':'T287_F11_MATERIAL_SELECTION_02','authority':'External construction grant only; no Product-owner authority or independent J',
 'criterion':criterion,'originalRule':rule,'parts':[
  {'part':'overlays bind graph composition','sources':[P+'specification/PRODUCT.md',P+T+'code/src/gtl/default_library.ts',P+T+'code/src/gtl/contracts.ts']},
  {'part':'nested graph calls and declared computations share HoG law','sources':[P+T+'code/src/gtl/c_algebra.ts',P+T+'code/src/hog/graph_execute.ts',P+T+'code/src/hog/workflow_lifecycle.ts']},
  {'part':'frame contracts reuse composition Context contracts and policy, including Context009..012','sources':[P+'specification/requirements/gtl/REQ-L-GTL3-CONTEXT.md',P+T+'code/src/gtl/stdo_run_environment.ts',P+T+'code/src/gtl/requirement_handoff.ts',P+T+'code/src/product/default_library.ts']},
  {'part':'no separate topology callable kind registry or interpreter','sources':[P+T+'code/src/gtl/contracts.ts',P+T+'code/src/gtl/declarations.ts',P+T+'code/src/gtl/registered_selection.ts',P+T+'code/src/hog/graph_execute.ts']},
  {'part':'frame contract overlay composition and runtime Frame retain distinct meanings','sources':[P+'specification/requirements/abg/REQ-R-ABG3-FRAME.md',P+T+'code/src/abg/event_contract_profiles.ts',P+T+'code/src/hog/evaluation_frame.ts',P+T+'design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md']}],
 'materialReasons':selected,'unprovidedAndUnknown':{'otherMemberResponsibilities':'Complete union and member refs in scope-transform/domain-responsibilities; every unselected group remains unassessed. No representative-example qualification.',
 'execution':'No actual current execution result is supplied in this source-only preparation; runtime adequacy remains unknown wherever required.',
 'grouping':'This common declaration/realization responsibility is a proposal requiring independent J. Metadata and source selection do not establish sufficiency.',
 'nativeBindings':'Current actual basis, declarations, provenance authority, actor independence and finite plan are still required for a genuine assessment.'}}
save('selection-rationale.json',rationale)
raw=(O/'selection-rationale.json').read_bytes();selected.append({'member':{'ref':'material://abiogenesis/final-f11-material-selection-02/selection-rationale','path':str((O/'selection-rationale.json').relative_to(R)),'digest':digest(raw),'byteCount':len(raw)},'physicalOrigin':str(O/'selection-rationale.json'),'reason':'Actual attributed external selection derivation; must join genuine construction provenance before binding. Its statements are proposals to assess.','wholeBody':True,'externalConstructionRecord':True})
selection={'label':'rule-015B-composition-frame-hosts','roleName':'rule','subjectMembers':[{k:new_by[ref][k] for k in ['ref','path','digest','byteCount']} for ref in primary_group['memberRefs']],
 'coverage':[criterion],'materialSelection':selected,'requiredRoleSourceRefs':old_bank['authorityMaterials'] and [P+'specification/requirements/product/REQ-P-SELF-CONFORMANCE.md',P+'specification/requirements/product/REQ-P-QUAL.md'],
 'nativeReady':False,'genuinelyBoundRequest':False,'fullRequestRendered':False,'unprovidedAssessedMemberRefs':[ref for ref in primary_group['memberRefs'] if ref not in {r['member']['ref'] for r in selected}],
 'unknown':'No all-member or runtime conformity follows from selected bodies; remaining rule domains stay explicit and unassessed.'}
save('selection.json',selection)
save('construction-checks.json',{'status':'passed','completeInventoryMembers':1950,'rules':2137,'sources':95,'ruleSpansMatched':2137,'memberCorrespondences':coverage,
 'changedSourceGenerated':sum(not r['bodyIdentityPreserved'] and r['logicalPathPreserved'] for r in coverage),
 'externalRebindings':19,'externalChangedBodies':sum(not r['bodyIdentityPreserved'] and not r['logicalPathPreserved'] for r in coverage),
 'applicationDomainUnion':1950,'selectedResponsibilityCount':1,'selectedMemberCount':len(primary_group['memberRefs']),'selectedBodyCount':len(selected),'selectedRawBytes':sum(r['member']['byteCount'] for r in selected),
 'retainedOriginalFullBodies':'Reuse unchanged closed Scope01 material by exact reference; current C02/Q02 raw origins conserve all1950 bodies. No body cut or new provenance supplied.'})
save('acquired-inputs.json',{'records':list({x['path']:x for x in acquired}.values())})
print(json.dumps({'status':'constructed','members':1950,'rules':2137,'partitionCounts':{k:len(v) for k,v in groups.items()},'selectedBodies':len(selected),'selectedRawBytes':sum(r['member']['byteCount'] for r in selected),'genuineBinding':False},indent=2))
