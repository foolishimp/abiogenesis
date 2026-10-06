"""Close only this Worker's granted input territory after exact checks."""
import datetime,hashlib,json
from pathlib import Path
D=Path(__file__).resolve().parent
R=D.parents[4]
G=D.parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def record(p,base):return {'path':str(p.relative_to(base)),'bytes':p.stat().st_size,'sha256':sha(p)}
assert not (D/'freeze.json').exists()
inputs=json.loads((D/'input-freeze.json').read_text())['records']
for row in inputs:
    p=R/row['path']
    assert p.stat().st_size==row['bytes'] and sha(p)==row['sha256'],row['path']
assert json.loads((D/'owner-checks-final.json').read_text())['existingOwnerDiagnostics']==[]
C=G/'final-candidate-construction-01'
cf=json.loads((C/'freeze.json').read_text())
cr={r['path']:r for r in cf['records']}
installedOwners=[]
for rel in ['build/code/src/validator/qualification.js','build/code/src/validator/qualification_contracts.js',
            'build/code/src/validator/self_conformance.js','build/code/src/shared/digests.js','build/code/src/shared/canonical_json.js']:
    rel='install/node_modules/@abiogenesis/typescript-tenant/'+rel
    p=C/rel;r=cr[rel]
    assert p.stat().st_size==r['bytes'] and sha(p)==r['sha256'],rel
    installedOwners.append(record(p,R))
owner_file=D/'installed-owner-bindings.json'
owner_file.write_text(json.dumps({'status':'exact frozen installed owner bytes','records':installedOwners},indent=2)+'\n')
files=sorted(p for p in D.rglob('*') if p.is_file() and p.name!='freeze.json')
records=[record(p,D) for p in files]
returnRecord=record(D/'return.md',D)
value={'status':'CLOSED','work_result':'current_scope_domains_and_role_material_inputs_structurally_checked_native_basis_unready',
    'activation':'T287_FINAL_F11_SCOPE_INPUTS_01','role':'Worker','frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'return':returnRecord,'records':records,'recordCount':len(records),'recordBytes':sum(r['bytes'] for r in records),
    'externalInputs':record(D/'input-freeze.json',D),'externalInputCount':len(inputs),
    'CFreeze':record(C/'freeze.json',R),'QFreeze':record(G/'final-qualification-inputs-01/freeze.json',R),
    'limits':['No final native basis, task, plan, worker request, J, execution or qualification verdict.',
        'Root-reported upstream publication counterexample remains outside this input proof.',
        'Current source identities only; no automatic changed-candidate binding.',
        'This Worker cannot independently assess its own scope/material adequacy.'],
    'effects':{'writeTerritory':str(D.relative_to(R)),'native':0,'provider':0,'resource':0,'seed':0,'source':0,'recipe':0,'build':0,'package':0,'install':0,'testSuite':0,'git':0},
    'stop':'One frozen input return; Worker closes. Root owns further selection and independent review.'}
(D/'freeze.json').write_text(json.dumps(value,indent=2)+'\n')
for row in records:
    p=D/row['path'];assert p.stat().st_size==row['bytes'] and sha(p)==row['sha256']
print(json.dumps({'status':'CLOSED','return':returnRecord,'freeze':record(D/'freeze.json',D),'records':len(records),'bytes':sum(r['bytes'] for r in records),'inputRecords':len(inputs)},indent=2))
