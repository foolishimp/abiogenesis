"""Read only CLOSED inputs; emit bounded review evidence in this directory."""
import base64
import collections
import hashlib
import json
import pathlib

D = pathlib.Path(__file__).resolve().parent
G = D.parent
R = G.parents[3]
A = G / 'final-f11-attribution-inputs-01'
C = G / 'final-candidate-construction-01'
Q = G / 'final-qualification-inputs-01'
read = lambda p: json.loads(p.read_text())
digest = lambda b: hashlib.sha256(b).hexdigest()
checks = []

def check_file(p, n, sha):
    assert not p.is_symlink(), str(p)
    b = p.read_bytes()
    assert len(b) == n and digest(b) == sha.removeprefix('sha256:'), str(p)
    return b

def coordinate(p):
    b = p.read_bytes()
    return {'path': str(p), 'bytes': len(b), 'sha256': digest(b)}

expected = {
    A / 'freeze.json': '54aa8df9e8b68c0ec35e00d4bc76535deb52698ec925b28e7444e28a23e0c845',
    A / 'return.md': '6a9d4a88665966376b9075baab2b984c32414f0c3932880c2772ee883bf0e9c4',
    C / 'freeze.json': 'f6199e3f9ce72f99ecd16307eabc9ca92cc2ecdbc320c70bdd075962eb09650f',
    Q / 'freeze.json': '0a386fd10e1067abb3f09ba4d7f115b56593045ca0d0d1aa272fb7fcc0a46bbe',
    G / 'final-f11-attribution-review-controls-01/request.txt': 'cfd5bcc6275def7c61f6586c2990dea2de98495143ce9e26b1b5b21273aeb437',
}
for p, sha in expected.items():
    assert digest(p.read_bytes()) == sha
    checks.append(coordinate(p))

local = read(A / 'freeze.json')['records']
for row in local:
    check_file(A / row['path'], row['bytes'], row['sha256'])
joins = read(A / 'input-joins.json')['records']
for row in joins:
    check_file(pathlib.Path(row['path']), row['bytes'], row['sha256'])

inventory = read(Q / 'qualification-inventory.json')
coverage = read(A / 'inventory-attribution-coverage.json')
actual = {m['ref']: m for m in inventory['members']}
assert len(actual) == 1950
seen = set()
counts = collections.Counter()
class_bytes = collections.Counter()
utf8_count = 0
source_by_path = {s['path']: s for s in read(C / 'source-members.json')}
generated = {s['path']: s for s in read(C / 'generated-after.json')}
generated_before = {s['path']: s for s in read(C / 'generated-before.json')}
prefix = 'build_tenants/abiogenesis/typescript/'
for row in coverage['members']:
    m = row['member']
    assert m['ref'] not in seen
    seen.add(m['ref'])
    assert all(actual[m['ref']][k] == m[k] for k in ['ref', 'path', 'digest', 'byteCount'])
    b = check_file(pathlib.Path(row['physicalOrigin']), m['byteCount'], m['digest'])
    assert b.decode('utf8').encode('utf8') == b
    utf8_count += 1
    counts[row['classification']] += 1
    class_bytes[row['classification']] += len(b)
    p = m['path']
    if row['classification'] == 'deterministic_generated_output':
        entry = generated[p.removeprefix(prefix)]
        assert entry['bytes'] == len(b) and entry['sha256'] == digest(b)
    elif row['classification'] in ['inherited_selected_source', 'retained_actual_source_transition', 'changed_selected_source_without_complete_routed_chain']:
        entry = source_by_path[p]
        assert entry['bytes'] == len(b) and entry['sha256'] == digest(b)
    if row['classification'] == 'inherited_selected_source':
        ge = row['gitEvidence']
        assert ge['sameBytesAtHead'] and ge['blobBytes']['sha256'] == digest(b)
        blob_id = hashlib.sha1(b'blob ' + str(len(b)).encode() + b'\0' + b).hexdigest()
        assert ge['git']['blob'] == blob_id
assert seen == set(actual) and dict(counts) == coverage['counts']

materials = read(A / 'external-record-materials.json')
by_ref = {}
physical = {r['member']['path']: pathlib.Path(r['physicalOrigin']) for r in coverage['members']}
for m in materials['records']:
    assert m['ref'] not in by_ref
    b = base64.b64decode(m['contentBase64'], validate=True)
    assert base64.b64encode(b).decode() == m['contentBase64']
    assert len(b) == m['byteCount'] and digest(b) == m['digest'].removeprefix('sha256:')
    # Candidate source records join immutable C bytes, never the moving source.
    p = physical.get(m['path'], R / m['path'])
    assert p.read_bytes() == b
    by_ref[m['ref']] = b
spans = 0
for entry in read(A / 'source-chain-inputs.json')['chains']:
    chain = entry['candidateChain']
    assert chain['actorIdentityRef'] is None and chain['authorityRef'] is None
    for s in chain['attributionSources']:
        b = by_ref[s['sourceRef']]
        assert 0 <= s['startByte'] < s['endByte'] <= len(b)
        assert digest(b[s['startByte']:s['endByte']]) == s['spanDigest'].removeprefix('sha256:')
        spans += 1

probe = read(D / 'carrier-probe-results.json')
for row in probe['sourceInputs']:
    check_file(R / row['path'], row['bytes'], row['sha256'])
source_root = C / 'source-freeze/repo'
source_paths = [
    'README.md', 'AGENTS.md', 'specification/GOALS.md', 'specification/INTENT.md',
    'specification/PRODUCT.md', 'specification/requirements/product/REQ-P-SELF-CONFORMANCE.md',
    'specification/requirements/product/REQ-P-QUAL.md',
    prefix+'design/T287_D4_SELF_CONFORMANCE_DESIGN.md',
    prefix+'design/T287_D4_D5_NATIVE_QUALIFICATION_DESIGN.md',
    prefix+'design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md',
    prefix+'code/src/validator/qualification_contracts.ts',
    prefix+'code/src/validator/qualification.ts',
    prefix+'code/src/abg/qualification_proof.ts',
]
source_records = []
for p in source_paths:
    entry = source_by_path[p]
    full = source_root / p
    check_file(full, entry['bytes'], entry['sha256'])
    source_records.append(coordinate(full))
for p in ['build/code/src/validator/qualification.js', 'build/code/src/shared/digests.js']:
    full = C / 'install/node_modules/@abiogenesis/typescript-tenant' / p
    entry = generated[p]
    check_file(full, entry['bytes'], entry['sha256'])
    source_records.append(coordinate(full))

output = {
    'status': 'CLOSED_INPUT_BYTES_AND_MAPPINGS_VERIFIED_NOT_SEMANTIC_ASSURANCE',
    'exactCutsAndRequest': checks,
    'attributionLocalRecords': len(local), 'attributionInputJoinRecords': len(joins),
    'inventoryMembers': len(seen), 'classCounts': dict(counts), 'classByteCounts': dict(class_bytes),
    'currentMemberUtf8RoundTrips': utf8_count,
    'inheritedSourceGitBlobIdsRecomputed': counts['inherited_selected_source'],
    'originalMaterialRecordsAndPhysicalCorrespondence': len(by_ref),
    'originalMaterialBytes': sum(map(len, by_ref.values())), 'originalAttributionSpans': spans,
    'generatedChanged': sum(s['sha256'] != generated_before[p]['sha256'] for p, s in generated.items()),
    'generatedUnchanged': sum(s['sha256'] == generated_before[p]['sha256'] for p, s in generated.items()),
    'probeSourceInputRecordsRechecked': len(probe['sourceInputs']), 'sourceRecords': source_records,
    'actualJudgments': 0, 'nativeEffects': 0,
    'limits': [
        'Identity, authority, relevant semantic authorship, scope adequacy and actual assessor independence remain unevaluated native or source-grounded inputs.',
        'UTF8 round trips establish only current byte representability, not meaningful construction or attribution.',
        'No own prior scope material or grouping adequacy was assessed; no moving publication repair/native output was read.',
        'Full C/Q record sets were previously verified; this review rechecks their frozen identities, all routed A inputs and the explicitly used source/owner joins.',
    ],
}
with (D / 'input-verification.json').open('x') as f:
    json.dump(output, f, indent=2)
    f.write('\n')
print(json.dumps({k:output[k] for k in ['status','attributionLocalRecords','attributionInputJoinRecords','inventoryMembers','currentMemberUtf8RoundTrips','originalMaterialRecordsAndPhysicalCorrespondence','originalAttributionSpans','generatedChanged','generatedUnchanged']}))
