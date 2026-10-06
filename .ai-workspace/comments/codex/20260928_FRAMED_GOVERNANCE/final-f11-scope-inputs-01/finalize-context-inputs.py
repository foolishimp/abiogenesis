"""Bind body selectors to the actual F11 consumer; no final native binding."""
import hashlib,json
from pathlib import Path
D=Path(__file__).resolve().parent
C=D.parent/'final-candidate-construction-01'
I=C/'install/node_modules/@abiogenesis/typescript-tenant'
def read(p):return json.loads(p.read_text())
def encoded(x):return json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n'
def write(p,x):
    if p.exists():
        old=D/'superseded-inputs'/p.relative_to(D)
        old.parent.mkdir(parents=True,exist_ok=True)
        with old.open('xb') as f:f.write(p.read_bytes())
    p.write_text(encoded(x))
def sha(b):return hashlib.sha256(b).hexdigest()
def criterion(rule,surface,role):
    b={'ruleRef':rule,'surfaceRef':surface,'evidenceRole':role}
    return {'criterionRef':'criterion://abiogenesis/'+sha(json.dumps(b,sort_keys=True).encode()),**b}
index=read(D/'body-input-index.json');bank=read(D/'material-index.json')
coverage=read(I/'contracts/qualification/coverage.json')
original=json.dumps(coverage,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
import base64
m={'ref':coverage['catalogRef'],'path':coverage['catalogRef'],'digest':'sha256:'+sha(original),'byteCount':len(original),'contentBase64':base64.b64encode(original).decode()}
mp=D/'material'/(sha(m['ref'].encode())+'.json')
assert not mp.exists();mp.write_text(encoded(m))
bank['materials'].append({k:m[k] for k in ['ref','path','digest','byteCount']}|{'file':str(mp.relative_to(D)),'origin':'Exact current installed coverage projected by self_conformance.ts typedMaterial canonical JSON relation','serializedBytes':mp.stat().st_size})
byref={m['ref']:m for m in bank['materials']}
byref.update({m['ref']:m for m in bank['authorityMaterials']})
for label in ['tenant','coverage']:
    row=next(x for x in index['packets'] if x['label']==label)
    p=D/row['file'];b=read(p)
    b['materialRefs']=[r for r in b['materialRefs'] if r!='material://abiogenesis/final-f11-scope-inputs-01/coverage-catalog']+[coverage['catalogRef']]
    if label=='tenant':
        b['coverage']=[]
        b['coverageBindingRequired']={'owner':'self_conformance.ts tenant_realization_assessment_required','role':'qualification-role://abiogenesis/tenant@5','evidenceRole':'tenant_realization','surface':'actual completed basis.tenantManifest.ref','ruleRef':'qualification-role://abiogenesis/tenant@5','reason':'No actual tenant manifest was supplied; no placeholder criterion is constructed.'}
        b['requiredLaterMaterial'].append('exact actual tenant manifest body in the existing typedMaterial canonical form')
    else:
        b['coverage']=[criterion(c['coverageRef'],behavior,'behavioral_coverage') for c in coverage['claims'] for behavior in c['behaviors']]
        b['materialRefs']+=list(dict.fromkeys(ref.split('#')[0] for c in coverage['claims'] for ref in c['requirementRefs']))
        b['requiredLaterMaterial'].append('actual resolved execution evidence bodies cited by each applicable behavior criterion; no caller summary substitutes')
    b['materialRefs']=list(dict.fromkeys(b['materialRefs']))
    b['contextMembers']=[{'memberRef':r,'path':byref[r]['path'],'digest':byref[r]['digest'],'byteCount':byref[r]['byteCount']} for r in b['materialRefs']]
    row.update(criteria=len(b['coverage']),providedBodies=len(b['materialRefs']),providedBodyBytes=sum(m['byteCount'] for m in b['contextMembers']),
        contextDeclarationBytesWithoutIdentity=len(json.dumps(b['contextMembers'],separators=(',',':')).encode()),remaining=b['requiredLaterMaterial'])
    write(p,b)
index['byRole']={r:{'packets':len(v),'minimumBodyBytes':min(x['providedBodyBytes'] for x in v),'maximumBodyBytes':max(x['providedBodyBytes'] for x in v),'sumSelectedBodyBytes':sum(x['providedBodyBytes'] for x in v)} for r in ['catalog','inventory','rule','tenant','coverage'] if (v:=[x for x in index['packets'] if x['role']==r])}
write(D/'material-index.json',bank);write(D/'body-input-index.json',index)
write(D/'consumer-binding-check.json',{
 'status':'current existing F11 selector correspondence; native bindings unconstructed',
 'ownerSource':'final-candidate-construction-01/source-freeze/repo/build_tenants/abiogenesis/typescript/code/src/validator/self_conformance.ts',
 'tenant':{'evidenceRole':'tenant_realization','surfaceRef':'not constructed; requires actual tenant manifest','material':'exact actual typed manifest required'},
 'coverage':{'evidenceRole':'behavioral_coverage','claims':len(coverage['claims']),'behaviors':sum(len(c['behaviors']) for c in coverage['claims']),'exactClaimBehaviorPairs':True,'catalogRef':coverage['catalogRef'],'requiredSourcesIncluded':True,'actualExecutionMaterial':'pending'},
 'supplementalSelectionMaterial':'Authored classification/domain/rationale material is external evaluation data. Existing self-conformance accepts it only when exact bytes are included in the genuine external construction record set; this does not attribute inherited candidate members to this scope Worker.',
 'firstNativeBasisCounterexample':{'QTemplateToolchainDigest':'sha256:a81c04f4613d8326bd1209bf9f65016c0c7cbc2a3e51a963f54aec3973589b1d','nativeOwnerManifestDigest':'sha256:11e22a986898a4d91a75162f12f45452d6a1dc631b08bdad975dea657c72db1f','consumer':'self_conformance.ts installed_candidate_basis_mismatch condition requires basis.toolchain.digest === owner.manifestDigest','meaning':'Q nullable preview cannot be promoted unchanged. Actual completed native basis/caller join is pending; no Product or candidate failure was executed here.'},
 'superseded':'Initial tenant_readiness and coverage_assessment draft selectors did not match actual F11 consumers. Original body/index files are retained in superseded-inputs. Current body selectors above conserve published owner roles and all 66 behavior rows.',
 'reentry':'This Worker external-input realization only; existing Product/owner source unchanged. No launch binding or native effect.'})
print(json.dumps({'tenantCriterion':'deferred actual manifest','coverageCriteria':sum(len(c['behaviors']) for c in coverage['claims']),'materialRecords':len(bank['materials'])+len(bank['authorityMaterials'])}))
