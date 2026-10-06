"""Freeze this review and recheck its named, already CLOSED inputs only."""
import datetime
import hashlib
import json
import pathlib

D = pathlib.Path(__file__).resolve().parent
G = D.parent
R = G.parents[3]
C = G / 'final-candidate-construction-01'
A = G / 'final-f11-attribution-inputs-01'
F = C / 'source-freeze/repo'
T = 'build_tenants/abiogenesis/typescript/'
sha = lambda b: hashlib.sha256(b).hexdigest()
read = lambda p: json.loads(p.read_text())

def coordinate(p, relative=False):
    b = p.read_bytes()
    return {'path': str(p.relative_to(D) if relative else p), 'bytes': len(b), 'sha256': sha(b)}

sources = [
    (F/'specification/requirements/product/REQ-P-SELF-CONFORMANCE.md', [(25,108)]),
    (F/'specification/requirements/product/REQ-P-QUAL.md', [(219,261),(338,370)]),
    (F/(T+'design/T287_D4_SELF_CONFORMANCE_DESIGN.md'), [(83,97),(121,150)]),
    (F/(T+'design/T287_D4_D5_NATIVE_QUALIFICATION_DESIGN.md'), [(23,63),(77,89)]),
    (F/(T+'code/src/validator/qualification_contracts.ts'), [(124,141)]),
    (F/(T+'code/src/validator/qualification.ts'), [(616,714)]),
    (F/(T+'code/src/abg/qualification_proof.ts'), [(535,619)]),
    (C/'prepare.py', [(6,7),(44,66)]),
    (C/'build.json', None),
    (pathlib.Path('/Users/jim/Library/Application Support/STDO/releases/v2.5.1-rc.1/standards/TICKET_METHOD.md'), [(727,745)]),
]
spans = []
for p, selections in sources:
    b = p.read_bytes()
    lines = b.splitlines(keepends=True)
    selected = []
    for start, end in selections or [(1,len(lines))]:
        assert 1 <= start <= end <= len(lines)
        first = sum(map(len, lines[:start-1]))
        last = sum(map(len, lines[:end]))
        selected.append({'startLine':start,'endLine':end,'startByte':first,'endByte':last,'sha256':sha(b[first:last])})
    spans.append({**coordinate(p),'spans':selected})
with (D/'source-spans.json').open('x') as f:
    json.dump({'source':'exact C and selected installed STDO; commentary source locators only','sources':spans},f,indent=2)
    f.write('\n')

inputs = {}
def add(row, base=None):
    p = pathlib.Path(row['path'])
    if not p.is_absolute():
        assert base is not None
        p = base / p
    b = p.read_bytes()
    assert len(b) == row['bytes'] and sha(b) == row['sha256'], str(p)
    result = {'path':str(p),'bytes':len(b),'sha256':sha(b)}
    if str(p) in inputs:
        assert inputs[str(p)] == result
    inputs[str(p)] = result

for row in read(A/'input-joins.json')['records']:
    add(row)
for row in read(A/'freeze.json')['records']:
    add(row,A)
verification = read(D/'input-verification.json')
for row in verification['exactCutsAndRequest'] + verification['sourceRecords'] + spans:
    add(row)
for row in read(D/'carrier-probe-results.json')['sourceInputs']:
    add(row,R)
records = [coordinate(p,True) for p in sorted(D.rglob('*')) if p.is_file() and p.name != 'freeze.json']
report = next(r for r in records if r['path'] == 'return.md')
freeze = {
    'status':'CLOSED',
    'activation':'T287_F11_EXTERNAL_ATTRIBUTION_REVIEW_01',
    'role':'independent Reviewer; sole bounded review-output Writer grant closed',
    'frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'return':report,
    'records':records,
    'consumedInputs':sorted(inputs.values(),key=lambda r:r['path']),
    'recommendation':'Constructible missing authentic inputs plus source-preserving external representations; no F11 owner change demonstrated. Attribution and final qualification remain unestablished.',
    'actualJudgments':0,'nativeEffects':0,
    'exclusions':['own prior scope/grouping/material adequacy','moving publication repair or successor','native/provider/resource/build/package/install/source/Git effects'],
}
with (D/'freeze.json').open('x') as f:
    json.dump(freeze,f,indent=2)
    f.write('\n')
print(json.dumps({'status':'CLOSED','return':report,'freeze':coordinate(D/'freeze.json',True),'records':len(records),'consumedInputs':len(inputs)},indent=2))
