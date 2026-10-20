"""Pure external input construction. No dispatch/build/test/native/Git path."""
import base64
import collections
import hashlib
import json
from pathlib import Path

D = Path(__file__).resolve().parent
R = D.parents[4]
G = D.parent
C = G / 'final-candidate-construction-01'
Q = G / 'final-qualification-inputs-01'
OLD = R / '.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/successor-05'
T = 'build_tenants/abiogenesis/typescript/'
INSTALL = C / 'install/node_modules/@abiogenesis/typescript-tenant'
PREFIX = 'repo://abiogenesis/'
SCOPE = 'scope-group://abiogenesis/final-f11-scope-inputs-01/'

def sha(b): return hashlib.sha256(b).hexdigest()
def digest(b): return 'sha256:' + sha(b)
def read(p): return json.loads(Path(p).read_text())
def dump(name, value):
    p = D / name
    p.parent.mkdir(parents=True, exist_ok=True)
    encoded=json.dumps(value,ensure_ascii=False,separators=(',', ':'))+'\n'
    if p.exists():
        assert p.read_text()==encoded, 'existing constructed input differs: '+str(p)
        return p
    with p.open('x') as f:
        f.write(encoded)
    return p
def coord(m): return {k: m[k] for k in ('ref','path','digest','byteCount')}
def unique(xs): return list(dict.fromkeys(xs))
inputs = {}
def checked(p, expected=None, size=None):
    p = Path(p).resolve()
    b = p.read_bytes()
    if expected is not None: assert sha(b) == expected.removeprefix('sha256:'), p
    if size is not None: assert len(b) == size, p
    inputs[str(p.relative_to(R)) if p.is_relative_to(R) else str(p)] = {'bytes':len(b),'sha256':sha(b)}
    return b

assert R == Path('/Users/jim/src/apps/abiogenesis')
checked(G/'final-f11-scope-controls-01/request.txt','bdd00cc903ac9343df9299f1fb81bd9e32b67896d734ad46ebcb2d4cec8cd806',6348)
checked(Q/'freeze.json','0a386fd10e1067abb3f09ba4d7f115b56593045ca0d0d1aa272fb7fcc0a46bbe')
checked(C/'freeze.json','f6199e3f9ce72f99ecd16307eabc9ca92cc2ecdbc320c70bdd075962eb09650f')
qfreeze = read(Q/'freeze.json')
for row in qfreeze['records']: checked(Q/row['path'],row['sha256'],row['bytes'])
external = read(Q/'external-input-freeze.json')
external_rows = external if isinstance(external,list) else external['records']
for row in external_rows:
    checked(R/row['path'],row['sha256'],row['bytes'])
inventory = read(Q/'qualification-inventory.json')
catalog_path = INSTALL/'contracts/qualification/rule-catalog.json'
catalog_bytes = checked(catalog_path,'e9aa4d0a863050f17ca8ed89b1911ae237df08ce1727ee24e3016f2f7297f5c4')
catalog = json.loads(catalog_bytes)
law = json.loads(checked(INSTALL/'contracts/qualification/law-basis.json','578fb695296f9939ba1dfdc6ac0c4ab17bd067845e657ec4b61615795244cc06'))
old = json.loads(checked(OLD/'scope-policy.json'))
checked(OLD/'prepare-assessments.mjs'); checked(OLD/'control-selection.json')
members = inventory['members']; by_ref={m['ref']:m for m in members}; by_path={m['path']:m for m in members}
assert len(members)==1950 and len(by_ref)==1950 and len(catalog['rules'])==2137 and len(catalog['sources'])==95
source_rows=read(C/'source-members.json'); source_paths={m['path'] for m in source_rows}
generated_rows=read(C/'generated-after.json'); generated_paths={T+m['path'] for m in generated_rows}
source_bytes={}
source_locations={}
for m in members:
    p = (C/'source-freeze/repo'/m['path']) if m['path'] in source_paths else ((C/'staged-repo'/m['path']) if m['path'] in generated_paths else R/m['path'])
    source_bytes[m['ref']]=checked(p,m['digest'],m['byteCount']); source_locations[m['ref']]=str(p.relative_to(R))

# The bank retains exact original bodies once. Selecting a ref makes its entire
# body assessor material; unselected bank entries remain retained C input only.
bank={}
def material(m,b,origin):
    assert digest(b)==m['digest'] and len(b)==m['byteCount']
    key=sha(m['ref'].encode())
    value={**coord(m),'contentBase64':base64.b64encode(b).decode()}
    if m['ref'] in bank:
        assert bank[m['ref']]['digest']==m['digest']; return m['ref']
    p=dump('material/'+key+'.json',value)
    bank[m['ref']]={**coord(m),'file':str(p.relative_to(D)),'origin':origin,'serializedBytes':p.stat().st_size}
    return m['ref']
for m in members: material(m,source_bytes[m['ref']],source_locations[m['ref']])

authority_joins=[]
for s,j in zip(catalog['sources'],read(C/'authority-joins.json')):
    assert s['ref']==j['ref']
    original=checked(C/'source-freeze'/j['frozenOriginal'],s['digest'],s['byteCount'])
    copied=checked(C/'source-freeze/repo'/T/s['path'],s['digest'],s['byteCount'])
    installed=checked(INSTALL/s['path'],s['digest'],s['byteCount'])
    assert original==copied==installed
    authority_joins.append({**s,'frozenOriginal':str((C/'source-freeze'/j['frozenOriginal']).relative_to(R)),
        'frozenCopy':str((C/'source-freeze/repo'/T/s['path']).relative_to(R)),
        'installedCopy':str((INSTALL/s['path']).relative_to(R)),'equalBytes':True})
    # A constitutional inventory ref may share the authority ref but uses its
    # own original path. Role sourceBindings require catalog paths; such refs
    # are resolved in the binder from this exact authority record.
    value={**s,'contentBase64':base64.b64encode(original).decode()}
    dump('authority/'+sha(s['ref'].encode())+'.json',value)
source_by_ref={s['ref']:s for s in catalog['sources']}
for r in catalog['rules']:
    s=source_by_ref[r['sourceRef']]
    b=checked(INSTALL/s['path'],r['sourceDigest'],s['byteCount'])
    assert 0<=r['startByte']<r['endByte']<=len(b)
    assert digest(b[r['startByte']:r['endByte']])==r['spanDigest']
dump('authority-correspondence.json',{'status':'computed bytes and spans only','sources':authority_joins,'ruleSpansChecked':len(catalog['rules'])})

# Preserve existing shared-duty proposals only for exactly conserved rule
# identities. New/changed spans are singleton rule groups: no title/path-based
# assertion that they inherit another clause's applicability or evidence duty.
current_rules={r['ruleRef']:r for r in catalog['rules']}
rule_groups=[]; rule_rationale=[]; old_group_for_new={}
for g in old['ruleGroups']:
    refs=[r for r in g['ruleRefs'] if r in current_rules]
    if not refs: continue
    gr=SCOPE+'duty/'+g['groupRef'].split('/duty/')[-1]
    rule_groups.append({'groupRef':gr,'ruleRefs':refs,'sourceRefs':unique(current_rules[r]['sourceRef'] for r in refs)})
    old_group_for_new[gr]=g['groupRef']
    rule_rationale.append({'groupRef':gr,'kind':'conserved_exact_rule_duty_proposal','donor':g['groupRef'],
        'relation':g['relation'],'groupingProposal':g['groupingProposal'],'residuals':g.get('residuals',[]),
        'status':'independent common scope/applicability/adequacy J required; updated source bodies govern'})
retained={r for g in rule_groups for r in g['ruleRefs']}
for r in catalog['rules']:
    if r['ruleRef'] in retained: continue
    gr=SCOPE+'current-clause/'+r['ruleRef'].split('/')[-1].split('@')[0]
    rule_groups.append({'groupRef':gr,'ruleRefs':[r['ruleRef']],'sourceRefs':[r['sourceRef']]})
    rule_rationale.append({'groupRef':gr,'kind':'current_clause_singleton','governedClaim':r['governedClaim'],
        'sourceBinding':{k:r[k] for k in ['sourceRef','sourceDigest','startByte','endByte','spanDigest']},
        'sharedDuty':'This exact governed clause is the only rule in this group; all of its parts and phase restrictions remain for source-grounded assessment.',
        'reason':'No admitted equivalence links this new or changed row to the historical shared-duty group.',
        'alternatives':'An independent assessor may justify a common duty with another current group; this construction makes no such semantic consolidation.',
        'status':'applicability and adequacy unassessed'})

# Rebind known explicit ownership cohorts, preserving member-level roles.
# Newly compiled files join their exact TS source owner only after the existing
# build inventory and declared compiler rootDir/outDir relation are checked.
old_path_group={m['path']:g['groupRef'].split('/surface/')[-1] for g in old['surfaceGroups'] for m in g['members']}
group_config={g['groupRef'].split('/surface/')[-1]:{'ownerRefs':g['ownerRefs'],'sourceRefs':g['sourcePaths'],'donor':g['groupRef']} for g in old['surfaceGroups']}
qual='specification/requirements/product/REQ-P-QUAL.md'; selfc='specification/requirements/product/REQ-P-SELF-CONFORMANCE.md'
def cfg(name,paths,reason):
    group_config[name]={'ownerRefs':[PREFIX+p for p in paths],'sourceRefs':paths,'reason':reason}
cfg('campaign_controls',[qual,str((Q/'verification-recipe.json').relative_to(R))],'Current Q controls replace historical campaign controls; each exact member remains explicit.')
cfg('proof_selected_regressions',[qual,str((Q/'test-selection.json').relative_to(R))],'Current exact title selection is owned by Q/test-selection; historical membership is not an execution claim.')
cfg('governance_library',[T+'design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md',T+'code/src/gtl/default_library.ts',T+'code/src/product/default_library.ts'],'Published default-library graph construction and its declared runtime/leaf counterparts.')
cfg('registered_selection',[T+'design/T287_REGISTERED_GRAPH_SELECTION_NATIVE_DESIGN.md',T+'design/T287_REGISTERED_GRAPH_SELECTION_DESIGN.md',T+'code/src/gtl/registered_selection.ts'],'Registered selection publication, admitted provenance and native consequence bindings.')
cfg('pending_continuation',[T+'design/T287_PENDING_CONSUMER_CONTINUATION_DESIGN.md',T+'code/src/abg/construction_continuation.ts'],'Pending consumer input/continuation owner and conserved producer relation.')
cfg('workspace_governance',['AGENTS.md','CLAUDE.md','README.md','stdo_abiogenesis.json'],'Current source-project role, authority and method entry declarations; no runtime role inferred.')
cfg('proof_historical_records',[qual,selfc,T+'design/ABI5_REALIZATION_CONSTITUTION.md'],'Retained historical fixtures/proof records are explicit proof members, not results for this new candidate.')
cfg('supplier_toolchain',[T+'package.json',T+'tsconfig.json',T+'scripts/generate-product-manifest.mjs',str((C/'dependency-archives.json').relative_to(R))],'Bundled compiler and library members are supplier input/output, not newly authored ABI semantics; native comparison and attribution remain separate.')
cfg('frozen_supply_manifests',[T+'package.json',str((Q/'verification-recipe.json').relative_to(R)),str((C/'dependency-archives.json').relative_to(R))],'Closed archive/dependency/environment inventories supporting the protected C2 reproduction.')
membership={}; member_evidence=[]; generated_derivations=[]
compiler_config=json.loads(source_bytes[PREFIX+T+'tsconfig.json'])
assert compiler_config['compilerOptions']['rootDir']=='code/src'
assert compiler_config['compilerOptions']['outDir']=='build/code/src'
assert compiler_config['compilerOptions']['declaration'] is True
assert compiler_config['include']==['code/src/**/*.ts']
new_code={
 T+'code/src/abg/construction_continuation.ts':'pending_continuation',
 **{T+'code/src/'+s:'governance_library' for s in ['abg/default_library.ts','gtl/default_library.ts','implementation/default_library.ts','product/default_library.ts','product/default_library_fulfillment.ts','product/default_library_identity.ts']},
 **{T+'code/src/'+s:'registered_selection' for s in ['abg/registered_selection_provenance.ts','gtl/registered_selection.ts','product/registered_selection_native.ts']}}
def source_group(p):
    if p in new_code:return new_code[p]
    if p in old_path_group:return old_path_group[p]
    if p in ['AGENTS.md','CLAUDE.md','README.md']:return 'workspace_governance'
    if p==T+'.gitignore':return 'build_controls'
    if p.startswith(T+'design/'):return 'current_how'
    if p.startswith(T+'contracts/default-library/'):return 'governance_library'
    if p.startswith(T+'contracts/schemas/'):return 'generated_contracts'
    if p.startswith(T+'test_env/proof/'):return 'proof_historical_records'
    if p.startswith(T+'test_env/'):return 'proof_retained_source'
    if p.startswith(str(Q.relative_to(R))+'/'):return 'release_claim' if p.endswith('/release-claims.json') else 'campaign_controls'
    if p.startswith(str(C.relative_to(R))+'/'):return 'frozen_supply_manifests'
    raise ValueError('unowned current member '+p)
for m in members:
    p=m['path']; source_ref=None; relation='explicit donor member or selected current owning construction'
    if p.startswith(T+'build/code/src/'):
        stem=p[len(T+'build/'):]
        for suffix in ['.js.map','.d.ts','.js']:
            if stem.endswith(suffix): stem=stem[:-len(suffix)]+'.ts';break
        src=T+stem; assert src in by_path, p
        group=source_group(src);source_ref=by_path[src]['ref']
        relation='exact declared compiler rootDir/outDir emission path plus current generated inventory; semantic emitter correspondence still requires observed C2 and independent J'
        generated_derivations.append({'memberRef':m['ref'],'sourceRef':source_ref,'sourcePath':src,
            'compilerDeclaration':{'rootDir':'code/src','outDir':'build/code/src','declaration':True,'include':['code/src/**/*.ts']},
            'emitterOwnerRefs':[PREFIX+T+'tsconfig.json',PREFIX+T+'package.json']})
    elif p.startswith(T+'build/toolchain/'): group='supplier_toolchain';relation='current generated supplier inventory; exact dependency archive and manifest owner required'
    else: group=source_group(p)
    membership[m['ref']]=group
    member_evidence.append({**m,'cohort':group,'frozenBody':source_locations[m['ref']],
        'classificationEvidenceRefs':m['classificationEvidenceRefs'],
        'classificationSource':str((Q/'classification-evidence.json').relative_to(R)),
        'ownerRelation':relation,'sourceMemberRef':source_ref,'assessment':'unassessed proposal; paths route to explicit byte/source/owner evidence, not applicability'})

surfaces=[]; surface_rationale=[]
for name in unique(membership.values()):
    refs=[m['ref'] for m in members if membership[m['ref']]==name]
    config=group_config[name]
    src_refs=unique(PREFIX+p for p in config['sourceRefs'])
    assert all(s in by_ref or s in source_by_ref for s in src_refs),(name,src_refs)
    roots=[root for root in inventory['selectedRoots'] if any((by_ref[r]['ref'].startswith(root) if root.endswith('/') else by_ref[r]['ref']==root) for r in refs)]
    assert roots,name
    surfaces.append({'groupRef':SCOPE+'surface/'+name,'memberRefs':refs,'rootRefs':roots,
        'surfaceRoles':unique(role for r in refs for role in by_ref[r]['surfaceRoles']),
        'ownerRefs':config['ownerRefs'],'sourceRefs':src_refs})
    surface_rationale.append({'groupRef':SCOPE+'surface/'+name,**config,
        'basis':'Exact individual member declarations and full selected bodies; current explicit owner sources; declared compiler rootDir/outDir and generated inventory joins for compiled counterparts.',
        'alternatives':'Mixed trigger, owner, historical phase or evidence duty may require further partition by independent J. No omitted member or inferred waiver.',
        'classificationStatus':'proposal_requires_inventory_J'})

old_apps={a['ruleGroupRef']:a for a in old['applicationSelection']}
surface_by_name={s['groupRef'].split('/')[-1]:s for s in surfaces}
domains=[]; domain_rationale=[]
new_support={'workspace_governance','campaign_controls','frozen_supply_manifests','supplier_toolchain','proof_historical_records'}
for rule in rule_groups:
    donor=old_apps.get(old_group_for_new.get(rule['groupRef']))
    buckets=collections.defaultdict(list); explanations={}
    if donor:
        routes={x.split('/surface/')[-1]:idx for idx,p in enumerate(donor['partitions']) for x in p['surfaceGroupRefs']}
        for name,s in surface_by_name.items():
            if name in routes:
                key='duty-'+str(routes[name]);buckets[key].append(s)
                explanations[key]={k:v for k,v in donor['partitions'][routes[name]].items() if k!='surfaceGroupRefs'}
            else:
                key='current-owner-extension';buckets[key].append(s)
                explanations[key]={'proposedRelation':'new current ownership/source population; direct, supporting or indirect applicability not assumed','evidenceDuty':'Read exact current bodies and owner/source relations; assess trigger and phase for this whole declared member domain.'}
    else:
        # Exact new clause with four evidence-duty populations. These are
        # classifications, never declarations of common applicability.
        for name,s in surface_by_name.items():
            roles=set(s['surfaceRoles'])
            if name in new_support or roles<= {'proof','release_claim','qualification','execution_contract','manifest'}: key='proof-construction-and-claim'
            elif roles & {'constitutional','design'} and not roles & {'code'}:key='definition-and-design'
            elif name in {'generated_contracts','law_catalog_projection'}:key='published-projection'
            else:key='realization-and-declared-host'
            buckets[key].append(s)
            explanations[key]={'proposedRelation':key,'evidenceDuty':'Apply the exact current clause to every declared member under its actual role, owner and phase; common applicability is unknown until independent J.'}
    app=[]
    for n,(key,parts) in enumerate(buckets.items()):
        refs=[r for s in parts for r in s['memberRefs']]
        group={'groupRef':rule['groupRef']+'/domain/'+key,'memberRefs':refs,
            'rootRefs':unique(r for s in parts for r in s['rootRefs']),
            'surfaceRoles':unique(role for r in refs for role in by_ref[r]['surfaceRoles']),
            'ownerRefs':unique(r for s in parts for r in s['ownerRefs']),
            'sourceRefs':unique(r for s in parts for r in s['sourceRefs'])}
        app.append(group)
        domain_rationale.append({'groupRef':group['groupRef'],'ruleGroupRef':rule['groupRef'],
            'classificationGroups':[s['groupRef'] for s in parts],**explanations[key],
            'disposition':'unassessed; no automatic inapplicability, waiver, common satisfaction or runtime gate',
            'unresolvedAlternatives':'Owner/trigger/phase differences may falsify common grouping; split only at the affected domain with existing scope carriers.'})
    domains.append({'ruleGroupRef':rule['groupRef'],'surfaceGroups':app})
scope_body={'kind':'qualification_scope','lawBasis':{'ref':law['lawBasisRef'],'digest':law['lawBasisDigest']},
    'catalog':{'ref':catalog['catalogRef'],'digest':digest(catalog_bytes)},'inventory':inventory,
    'ruleGroups':rule_groups,'surfaceGroups':surfaces,'applicationDomains':domains}
dump('scope-body.json',scope_body)
dump('grouping-rationale.json',{'status':'authored proposals; no independent J','ruleGroups':rule_rationale,'surfaceGroups':surface_rationale,'applicationDomains':domain_rationale,
    'claimBoundary':'C checks full exact declared unions and byte/source joins. Product applicability, scope adequacy, author independence and sufficient evidence remain independent J.',
    'noNativeCallPlan':True,'unchangedRuleIdentities':len(retained),'currentSingletonRules':len(catalog['rules'])-len(retained)})
dump('member-classification.json',{'status':'current explicit unassessed declarations','inventoryRef':inventory['inventoryRef'],'records':member_evidence,'generatedSourceJoins':generated_derivations})

def extra(name,value):
    p=dump('selected-material/'+name+'.json',value);b=p.read_bytes()
    m={'ref':'material://abiogenesis/final-f11-scope-inputs-01/'+name,'path':str(p.relative_to(R)),'digest':digest(b),'byteCount':len(b)}
    return material(m,b,str(p.relative_to(R)))
role_refs=['repo://abiogenesis/specification/requirements/product/REQ-P-SELF-CONFORMANCE.md','repo://abiogenesis/specification/requirements/product/REQ-P-QUAL.md']
# These authority records use catalog coordinates, as the installed role policy
# requires. Their corresponding inventory members are separately declared.
authority_refs=set(source_by_ref)
def resolve_meta(ref):return source_by_ref[ref] if ref in authority_refs else bank[ref]
catalog_rows_by_source={s['ref']:[r for r in catalog['rules'] if r['sourceRef']==s['ref']] for s in catalog['sources']}
catalog_populations={s['ref']:extra('catalog-population-'+str(n),{'source':s,'completeExtractedRows':catalog_rows_by_source[s['ref']],
    'meaning':'Every catalog row for this governing source; missing governing clauses remain a source-completeness J question.'}) for n,s in enumerate(catalog['sources'])}
classification_material={}
for n,s in enumerate(surfaces):
    classification_material[s['groupRef']]=extra('classification-'+str(n),{'group':s,
        'rationale':next(r for r in surface_rationale if r['groupRef']==s['groupRef']),
        'members':[m for m in member_evidence if m['ref'] in set(s['memberRefs'])],
        'derivations':[r for r in generated_derivations if r['memberRef'] in set(s['memberRefs'])]})
authority_material=extra('source-correspondence',read(D/'authority-correspondence.json'))
input_catalog=[]
def criteria(rule,surface,role):
    body={'ruleRef':rule,'surfaceRef':surface,'evidenceRole':role}
    return {'criterionRef':'criterion://abiogenesis/'+sha(json.dumps(body,sort_keys=True).encode()),**body}
def packet(label,role,subjects,refs,coverage,needs):
    refs=unique(role_refs+refs)
    assert all(ref in bank or ref in authority_refs for ref in refs),label
    declarations=[coord(by_ref[r]) for r in unique(subjects)]
    metadata=[coord(resolve_meta(r)) for r in refs]
    context_members=[{'memberRef':m['ref'],'path':m['path'],'digest':m['digest'],'byteCount':m['byteCount']} for m in metadata]
    assert len({m['path'] for m in metadata})==len(metadata),label
    record={'label':label,'roleName':role,'subjectMembers':declarations,'materialRefs':refs,'coverage':coverage,
        'contextMembers':context_members,'requiredLaterMaterial':needs,'nativeReady':False}
    f=dump('body-inputs/'+label+'.json',record)
    input_catalog.append({'label':label,'role':role,'file':str(f.relative_to(D)),
        'criteria':len(coverage),'assessedMembers':len(declarations),'providedBodies':len(refs),
        'providedBodyBytes':sum(m['byteCount'] for m in metadata),
        'contextDeclarationBytesWithoutIdentity':len(json.dumps(context_members,separators=(',',':')).encode()),
        'unprovidedAssessedMemberRefs':[m['ref'] for m in declarations if m['ref'] not in refs],
        'nativeReady':False,'renderedPromptBytes':None,'remaining':needs})

# Catalog material follows the renderer's source-completeness closure: every
# extracted row for every governing source in the selected group, not just the
# rows proposed for that group.
for n,g in enumerate(rule_groups):
    subject=[]
    for ref in g['sourceRefs']:
        s=source_by_ref[ref];copy_path=T+s['path'];assert copy_path in by_path
        subject.append(by_path[copy_path]['ref'])
    packet('catalog-'+str(n),'catalog',subject,
        g['sourceRefs']+[catalog_populations[r] for r in g['sourceRefs']]+[authority_material],
        [criteria(g['groupRef'],catalog['catalogRef'],'catalog_fidelity')],
        ['genuine final basis and assessor grant/declarations','actual construction/author chains for assessed source/catalog production'])
for n,s in enumerate(surfaces):
    packet('inventory-'+str(n),'inventory',s['memberRefs'],s['sourceRefs']+s['memberRefs']+[classification_material[s['groupRef']],authority_material],
        [criteria(inventory['inventoryRef'],s['groupRef'],e) for e in ['inventory_coverage','inventory_classification']],
        ['genuine final basis and assessor grant/declarations','complete actual author and construction Context for every selected member'])
for n,d in enumerate(domains):
    rg=rule_groups[n]
    for k,s in enumerate(d['surfaceGroups']):
        rationale=next(r for r in domain_rationale if r['groupRef']==s['groupRef'])
        selected=extra('rule-domain-'+str(n)+'-'+str(k),{'ruleGroup':rg,'domain':s,'rationale':rationale,
            'ruleRationale':rule_rationale[n],'selectedRows':[current_rules[r] for r in rg['ruleRefs']]})
        class_refs=[classification_material[r] for r in rationale['classificationGroups']]
        packet('rule-'+str(n)+'-'+str(k),'rule',s['memberRefs'],rg['sourceRefs']+s['sourceRefs']+s['memberRefs']+class_refs+[selected],
            [criteria(rg['groupRef'],s['groupRef'],'semantic_assessment')],
            ['genuine final basis and assessor grant/declarations','complete actual author/construction Context','current admitted claim-specific execution evidence where the rule requires it'])

coverage=read(INSTALL/'contracts/qualification/coverage.json')
coverage_material=extra('coverage-catalog',coverage)
tenant_members=[m['ref'] for m in members if (m['path'].startswith(T+'code/src/') or m['path'].startswith(T+'design/') and membership[m['ref']]=='current_how'
    or m['path'] in [T+'package.json',T+'tsconfig.json',T+'product-toolchain-manifest.json'] or m['path'].startswith(str(Q.relative_to(R))+'/'))]
tenant_refs=unique(tenant_members+[PREFIX+'specification/PRODUCT.md',PREFIX+'specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md',coverage_material,authority_material])
packet('tenant','tenant',tenant_members,tenant_refs,
    [criteria('qualification://abiogenesis/tenant-readiness',inventory['inventoryRef'],'tenant_readiness')],
    ['actual installed Product/WB/tenant manifest and published Public coordinates','actual observed C2 executionSelectionRef and comparison/test/lint evidence','selected exact-candidate native scenarios','genuine author chains and independent assessor declarations'])
coverage_subjects=[m['ref'] for m in members if membership[m['ref']] in ['campaign_controls','frozen_supply_manifests','release_claim']]
coverage_selection=extra('coverage-selection',{'inventory':{'ref':inventory['inventoryRef'],'digest':inventory['inventoryDigest']},
    'ruleGroups':rule_groups,'classificationGroups':surfaces,
    'applicationDomains':[{'ruleGroupRef':d['ruleGroupRef'],'surfaceGroups':[s['groupRef'] for s in d['surfaceGroups']]} for d in domains],
    'meaning':'Finite current domains and declared roles only. No plan, admitted judgments, full coverage pass or exact-candidate native results.'})
packet('coverage','coverage',coverage_subjects,coverage_subjects+[coverage_material,coverage_selection,authority_material,PREFIX+'specification/PRODUCT.md',PREFIX+'specification/requirements/product/REQ-P-SCENARIOS.md'],
    [criteria(coverage['catalogRef'],inventory['inventoryRef'],'coverage_assessment')],
    ['actual final basis','actual finite assessment plan/slots and admitted judgments with independence','current selected S01/S02/S03/S06 and F11 native evidence','seven valid semantic/mechanical mutants and sole A-F22 conclusion','genuine construction author Context'])
dump('material-index.json',{'materials':list(bank.values()),'authorityMaterials':[{'ref':s['ref'],'file':'authority/'+sha(s['ref'].encode())+'.json',**coord(s)} for s in catalog['sources']],
    'meaning':'Only refs selected by a body-input file are supplied to that assessor. Other complete bank bodies remain retained input bytes. No bank location creates actor access or authority.'})
dump('body-input-index.json',{'status':'unbound reusable body inputs; no assessment task/plan/request/J or call quota','packets':input_catalog,
    'byRole':{r:{'packets':len(v),'minimumBodyBytes':min(x['providedBodyBytes'] for x in v),'maximumBodyBytes':max(x['providedBodyBytes'] for x in v),'sumSelectedBodyBytes':sum(x['providedBodyBytes'] for x in v)} for r in ['catalog','inventory','rule','tenant','coverage'] if (v:=[x for x in input_catalog if x['role']==r])},
    'measurement':'Exact selected original body and Context declaration sizes; final prompt/provenance/plan bytes deliberately unmeasured until genuine bindings permit the existing renderer.',
    'providerAssumptions':[]})
dump('construction-checks.json',{'status':'pure input byte/source construction','QRecords':len(qfreeze['records']),'QExternalRecords':len(external_rows),
    'inventoryMembers':len(members),'inventoryBodyBytes':sum(m['byteCount'] for m in members),'rules':len(catalog['rules']),'sources':len(catalog['sources']),
    'conservedRuleIdentities':len(retained),'newCurrentSingletonRows':len(catalog['rules'])-len(retained),'ruleGroups':len(rule_groups),'classificationGroups':len(surfaces),
    'applicationDomains':len(domains),'applicationPartitions':sum(len(d['surfaceGroups']) for d in domains),'generatedSourceJoins':len(generated_derivations),'materialPackets':len(input_catalog),
    'semanticJudgment':None,'nativeEffects':0})
dump('input-freeze.json',{'records':[{'path':p,**row} for p,row in sorted(inputs.items())]})
print(json.dumps(read(D/'construction-checks.json'),indent=2))
