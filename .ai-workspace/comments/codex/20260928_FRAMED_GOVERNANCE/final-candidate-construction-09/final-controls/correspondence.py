from pathlib import Path
import hashlib, json, tarfile, time, sys
D = Path(__file__).resolve().parent.parent
T = D / 'final-stage/build_tenants/abiogenesis/typescript'
I = D / 'final-install/node_modules/@abiogenesis/typescript-tenant'
C = None
TR = 'build_tenants/abiogenesis/typescript/'
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
read = lambda p: json.loads(p.read_text())

def save(name, value):
    with (D / name).open('x') as f:
        json.dump(value, f, indent=2); f.write('\n')

operation_basis_path = D / 'controls/operation-basis.json'
assert sha(operation_basis_path) == 'adc8cb93426b08877e44ea6484acf5e532ba73f182b54365d1ab308b20a2206b'
operation_basis = read(operation_basis_path)
assert operation_basis['effectTerritory'] == str(D)
assert read(D / 'activation.json')['activation'] == operation_basis['operation']
assert read(D / 'activation.json')['actor'] == operation_basis['actor']

configuration_path=D/'builder-inputs.json'
assert sha(configuration_path)=='b93750a282875adc0f792c36d9e8ac221a966143297c4b7e156234db6b3e8f60'
configuration=read(configuration_path)
assert configuration['operationBasisSHA256']==sha(operation_basis_path)
assert configuration['sourceCutSHA256']==operation_basis['sourceCut']['sha256']
C=Path(operation_basis['acceptedBuilder']['path']).parent
assert configuration['priorCandidateRoot']==str(C)
assert read(D / 'construction-execution-grant.json')['activation'] == operation_basis['operation']
assert read(D / 'construction-execution-grant.json')['actor'] == operation_basis['actor']
started = time.monotonic()
if sys.argv[1] == 'generated':
    frozen = read(D / 'final-source-members.json')
    source_by_tenant = {r['path'][len(TR):]: r for r in frozen if r['path'].startswith(TR)}
    rows = []
    for p in sorted(T.rglob('*')):
        if not p.is_file() or p.is_symlink(): continue
        rel = str(p.relative_to(T))
        if not (rel.startswith(('build/','contracts/')) or rel == 'product-toolchain-manifest.json'): continue
        source = source_by_tenant.get(rel)
        if source is not None and not rel.startswith('contracts/qualification/'): continue
        rows.append({'path':rel,'bytes':p.stat().st_size,'sha256':sha(p),
                     'role':'derived_authority_copy' if source else 'generated_output',
                     'frozenInputPreimageSHA256':source['sha256'] if source else None})
    prior = {r['path']:{'sha256':sha(C/'final-stage/build_tenants/abiogenesis/typescript'/r['path'])} for r in rows if (C/'final-stage/build_tenants/abiogenesis/typescript'/r['path']).is_file()}
    delta = [{'path':r['path'],'baselineActualStageSHA256':prior.get(r['path'],{}).get('sha256'),
              'currentGeneratedSHA256':r['sha256'],'currentBytes':r['bytes'],'role':r['role']}
             for r in rows if prior.get(r['path'],{}).get('sha256') != r['sha256']]
    source_deltas = []
    for row in frozen:
        p = D / 'final-stage' / row['path']; digest=sha(p)
        if digest != row['sha256']:
            assert row['path'].startswith(TR+'contracts/qualification/'), row['path']
            source_deltas.append({'path':row['path'],'frozenInputSHA256':row['sha256'],'derivedStageSHA256':digest,
                                  'role':'declared_RC2_authority_output; not an implementation source mutation'})
    inputs = read(T / 'contracts/qualification/authority-inputs.json')
    definition = read(D / 'final-source/stdo_abiogenesis.json')
    assert inputs['method']['releaseRef'] == definition['constitution']['stdo']['basis']['uri']
    assert inputs['definitionDigest'] == 'sha256:'+sha(D / 'final-source/stdo_abiogenesis.json')
    law_manifest = read(D / 'final-law/manifest.json')
    joins = []
    for row in inputs['sources']:
        if row['ref'].startswith('repo://abiogenesis/'):
            original=D/'final-source'/row['ref'][len('repo://abiogenesis/'):]
        else:
            assert row['ref'].startswith(inputs['method']['releaseRef'])
            original=D/'final-law'/row['ref'][len(inputs['method']['releaseRef']):]
        packaged=T/row['path']
        assert packaged.read_bytes()==original.read_bytes()
        assert row['digest']=='sha256:'+sha(original) and row['byteCount']==original.stat().st_size
        joins.append({**row,'originalPath':str(original),'originalSHA256':sha(original),
                      'stagePath':str(packaged),'byteExact':True,'sourceCopyAuthor':operation_basis['actor']+'; original semantic authorship retained'})
    law=read(T/'contracts/qualification/law-basis.json')
    catalog=read(T/'contracts/qualification/rule-catalog.json')
    coverage=read(T/'contracts/qualification/coverage.json')
    assert law['catalog']['digest']=='sha256:'+sha(T/'contracts/qualification/rule-catalog.json')
    assert catalog['method']==inputs['method'] and catalog['sources']==inputs['sources']
    by_ref={r['ref']:r for r in inputs['sources']}
    for rule in catalog['rules']:
        source=by_ref[rule['sourceRef']]; raw=(T/source['path']).read_bytes()
        assert rule['sourceDigest']==source['digest']
        assert 'sha256:'+hashlib.sha256(raw[rule['startByte']:rule['endByte']]).hexdigest()==rule['spanDigest']
    for row in frozen:
        if not row['path'].startswith(TR+'contracts/qualification/'):
            assert sha(D/'final-stage'/row['path'])==row['sha256'], row['path']
    save('final-generated-after.json',rows)
    save('final-generated-delta.json',delta)
    save('final-derived-authority-input-delta.json',source_deltas)
    save('final-authority-joins.json',joins)
    save('final-generated-summary.json',{'generatedMembers':len(rows), 'generatedChangedFromBaseline':len(delta),
         'derivedAuthorityInputPreimages':len([r for r in rows if r['role']=='derived_authority_copy']),
         'derivedAuthorityInputsChanged':len(source_deltas), 'sourceInputsPreserved':len(frozen),
         'actualAuthorityJoins':len(joins),'rules':len(catalog['rules']),
         'lawBasis':{'ref':law['lawBasisRef'],'digest':law['lawBasisDigest']}, 'method':inputs['method'],
         'coverageClaims':len(coverage['claims']),'coverageBehaviors':sum(len(c['behaviors']) for c in coverage['claims']),
         'completeRuleSpanJoins':True,'elapsedMs':(time.monotonic()-started)*1000})
    print(json.dumps(read(D/'final-generated-summary.json')),flush=True)
elif sys.argv[1] == 'package':
    packed=read(D/'final-pack.stdout'); assert len(packed)==1
    archive=D/'final-artifacts'/packed[0]['filename']; rows=[]; names=set(); nonregular=[]
    with tarfile.open(archive,'r:gz') as tar:
        for member in tar.getmembers():
            if not member.isfile():
                assert member.isdir(),'unsupported archive member '+member.name
                nonregular.append({'path':member.name,'kind':'directory'}); continue
            assert member.name.startswith('package/') and '..' not in Path(member.name).parts
            rel=member.name[len('package/'):]; assert rel not in names; names.add(rel)
            body=tar.extractfile(member).read(); digest=hashlib.sha256(body).hexdigest()
            for root in [T,I]:
                assert (root/rel).is_file() and not (root/rel).is_symlink() and sha(root/rel)==digest,(str(root),rel)
            rows.append({'path':rel,'bytes':len(body),'sha256':digest,'archiveMode':member.mode})
    actual={str(p.relative_to(I)) for p in I.rglob('*') if p.is_file()}
    assert actual==names,{'extra':sorted(actual-names),'missing':sorted(names-actual)}
    links=[]
    for root in [T/'node_modules',D/'final-install/node_modules']:
        for p in sorted(root.rglob('*')):
            if p.is_symlink():
                assert p.resolve().is_relative_to(root.resolve()),str(p)
                links.append({'path':str(p.relative_to(D)),'target':str(p.readlink())})
    projected={r['path'] for r in packed[0]['files']}; assert projected==names
    rows.sort(key=lambda r:r['path'])
    save('final-archive-members.json',rows)
    save('final-dependency-and-bin-links.json',links)
    identity={'artifactPath':str(archive),'artifactDigest':'sha256:'+sha(archive),'archiveBytes':archive.stat().st_size,
              'packageRoot':str(I),'bootstrapRoot':str(D/'final-install'),'archiveMembers':len(rows)}
    save('final-package-identity.json',identity)
    save('final-package-correspondence.json',{'status':'exact',**identity,'stagedMatches':len(rows),'installedMatches':len(rows),
         'extraInstalledMembers':0,'missingInstalledMembers':0,'archiveNonregular':nonregular,
         'sourceInputsDigest':sha(D/'final-source-members.json'),'generatedOutputsDigest':sha(D/'final-generated-after.json'),
         'archiveMembersSHA256':sha(D/'final-archive-members.json'),'symlinkHandling':'No archive/installed Product payload links; dependency/bin links confined',
         'scripts':'disabled','network':'offline','elapsedMs':(time.monotonic()-started)*1000})
    print(json.dumps(identity),flush=True)
else: raise ValueError(sys.argv[1])
