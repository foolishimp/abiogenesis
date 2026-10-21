"""Bind actual producers and apply the already declared passive coverage boundary."""
from pathlib import Path
import hashlib, json, os, stat, sys, tarfile, traceback

L = Path(sys.argv[1]).resolve()
sha = lambda b: hashlib.sha256(b).hexdigest()
obj = lambda p: json.loads(Path(p).read_text())
def pin(p):
    p = Path(p); b = p.read_bytes()
    return dict(path=str(p),sha256=sha(b),bytes=len(b),mode=oct(stat.S_IMODE(p.stat().st_mode)))
def write(p,x):
    with Path(p).open('x') as f: json.dump(x,f,indent=2);f.write('\n')
def checked(p):
    assert pin(p['path'])['sha256']==p['sha256'],p['path']
    return obj(p['path'])

c=obj(L/'diagnostic-configuration.json');runtime=checked(c['originalConfiguration'])
root=Path(c['diagnosticRoot']);evidence=Path(runtime['lanes'][c['lane']]['roots']['evidence'])
contract=obj(L/'coverage-contract.json');reference=obj(L/'reference-endpoint.json')
try:
    result=obj(evidence/'result.json');summary=obj(root/'diagnostic-summary.json')
    assert result['status']=='satisfied' and result['subjectId']=='candidate' and result['lane']==c['lane'] and result['nativeCalls']==0
    assert result['oracle']['satisfied']
    assert summary['status']=='observations_only' and not summary['failures']
    checked(reference['endpointResult']);checked(reference['endpointConfiguration']);checked(reference['endpointGrant'])
    archive=runtime['subject']['archive'];assert pin(archive['path'])['sha256']==archive['sha256']
    mainInventory=checked(runtime['subject']['packageInventory'])
    mainNames={'package/'+x['path'] for x in mainInventory['files']}
    assert set(contract['members'])<=mainNames
    if c['lane']=='public-preparation':
        state=obj(evidence/'p1-owner-state.json');before=checked(reference['ownerState'])
        projection=lambda s:[{k:x[k] for k in ['label','definitionKey','exitCode','outcomeKind']} for x in s['calls']]
        assert state['selectedProgram']==before['selectedProgram']
        assert projection(state)==projection(before) and len(state['calls'])==10
        source=evidence/'setup/consumer-source'
        archives=list((evidence/'setup/consumer-artifacts').glob('*.tgz'));assert len(archives)==1
        fixture=pin(archives[0]);owner=state['fixture']
        assert owner['artifactDigest']=='sha256:'+fixture['sha256']
        assert owner['productId']=='product://abi5-tests/sandbox-uat@5.0.0'
        correspondence=dict(exactFullProgram=True,exactTenOperationOutcomes=True,referenceOwnerState=reference['ownerState'],diagnosticOwnerState=pin(evidence/'p1-owner-state.json'))
    else:
        start=obj(evidence/'start.json')
        expected={'kind':'hello_world_output','schemaVersion':'5.0.0','message':'Hello World'}
        assert start['receipt']['ownerOutput']['value']['terminalResult']['value']==expected
        env=obj(evidence/'installed-environment.json');assert len(env['additionalProducts'])==1
        prepared=env['additionalProducts'][0];source=Path(prepared['sourceRoot']);fixture=pin(prepared['artifactPath']);owner=env['verifiedProducts'][1]
        assert source.is_relative_to(Path(runtime['lanes'][c['lane']]['roots']['scratchParent']))
        assert source.name=='language-smoke-fixture'
        assert owner['artifactDigest']==prepared['basis']['artifactDigest']=='sha256:'+fixture['sha256']
        assert owner['productId']=='product://abi5-tests/language-fixtures@5.0.0'
        receipt=obj(evidence/'artifact-1.json');assert all(receipt[k]==fixture[k] for k in ['path','sha256','bytes'])
        assert env['artifactPaths']==[archive['path'],fixture['path']]
        correspondence=dict(literalHelloWorld=expected,start=pin(evidence/'start.json'),freshReadOracle=result['oracle'])
    assert str(source.resolve())==str(source)
    package=obj(source/'package.json')
    assert package['name']==owner['packageName'] and package['version']==owner['packageVersion']
    assert package['dependencies']['@abiogenesis/typescript-tenant']=='file:'+archive['path']
    rows=[]
    with tarfile.open(fixture['path'],'r:gz') as t:
        for member in t.getmembers():
            assert member.isfile() and member.name.startswith('package/')
            relative=member.name[len('package/'):];data=t.extractfile(member).read();original=source/relative
            assert original.is_relative_to(source) and data==original.read_bytes(),member.name
            assert member.mode==stat.S_IMODE(original.stat().st_mode)
            rows.append(dict(path=relative,sha256=sha(data),bytes=len(data),mode=oct(member.mode)))
    assert set(contract['members'])<={'package/'+x['path'] for x in rows}
    write(L/'fixture-package-inventory.json',dict(archive=fixture,sourceRoot=str(source),files=rows,owner=owner,producerReceipt=correspondence))
    bindings=[archive,fixture]
    def externalAllowed(edge):
        assert edge['classification']=='external-uninstrumented'
        assert edge['effectiveFile']==edge['file'] and edge['effectiveArgs']==edge['args']
        args=edge['args']
        if edge['file']=='/usr/bin/du':
            return len(args)==3 and args[:2]==['/usr/bin/du','-sk'] and args[2] in contract['allowedDuRoots']
        if edge['file']!='tar' or len(args) not in [3,4] or args[0]!='tar':return False
        if len([x for x in bindings if x['path']==args[2]])!=1:return False
        return (len(args)==3 and args[1]=='-tzf') or (len(args)==4 and args[1]=='-xOzf' and args[3] in contract['members'])
    processes=summary['processes'];byPid={p['pid']:p for p in processes};assert len(byPid)==len(processes)
    traces={int(t['name'].split('-')[1]) for t in summary['traces']}
    expectedModules={m['member']:m['sha256'] for m in c['emittedModules']};loaded=set();edges=[];counterNames=set();histories=0
    for p in processes:
        assert p['configurationSha256']==pin(L/'diagnostic-configuration.json')['sha256']
        assert p['exitCode']==0 and p['probeErrors']==[],p['pid']
        assert p['pid'] in traces,p['pid']
        counterNames.update(p['counters']);histories+=len(p['historyOwners'])
        for m in p['loaded']:
            assert m['sha256']==expectedModules[m['member']] and m['originalPrefixUnchanged']
            actual=Path(m['path']);assert str(actual.resolve())==str(actual)
            assert any(actual.is_relative_to(Path(r)) for r in c['moduleRoots'])
            assert pin(actual)['sha256']==m['sha256'];loaded.add(m['member'])
        for edge in p['launches']:
            if edge['classification'] in ['node-preloaded','npm-explicit-node-preloaded']:
                assert edge['pid'] in byPid and edge['pid'] in traces,edge
            else:assert externalAllowed(edge),edge
            edges.append(dict(parentPid=p['pid'],**edge))
    assert loaded==set(expectedModules)
    assert histories>0 and {'hash.update.inputBytes','JSON.stringify.outputUtf8Bytes','writeCanonicalJson.deliveredUtf8Bytes'}<=counterNames
    handoff=result['closeHandoff'];prefix=handoff['prefix'];authority=handoff['reopenAuthority'];log=Path(authority['eventLogPath']);identity=pin(log);s=log.stat()
    assert identity['bytes']==prefix['prefixLength']==authority['durableByteLength']
    assert 'sha256:'+identity['sha256']==prefix['prefixDigest']==authority['eventLogDigest']
    assert s.st_dev==prefix['storeIdentity']['device']==authority['device'] and s.st_ino==prefix['storeIdentity']['inode']==authority['inode']
    write(L/'owner-handoff.json',dict(closeHandoff=handoff,actualEventFile=identity,device=s.st_dev,inode=s.st_ino,sourceResult=pin(evidence/'result.json'),scope='Actual unchanged closed log identity and bytes after original fresh-read oracle; no new runtime acquisition'))
    external=[x for x in edges if x['classification']=='external-uninstrumented']
    write(L/'non-node-child-edges.json',dict(edges=external,limits=contract['limits']))
    write(L/'observed-output-correspondence.json',dict(policy=pin(L.parent.parent/'final-proof-preparation-01/output-correspondence.json'),reference=reference,diagnosticResult=pin(evidence/'result.json'),actualProducer=pin(L/'fixture-package-inventory.json'),relation=correspondence,identityRule='All exact identities retained; no cross-resource prefix/install/artifact equivalence asserted'))
    answer=dict(status='satisfied',subjectId='candidate',lane=c['lane'],configuration=pin(L/'diagnostic-configuration.json'),workloadResult=pin(evidence/'result.json'),summary=pin(root/'diagnostic-summary.json'),processCount=len(processes),traceFileCount=len(summary['traces']),observedHistoryOwners=histories,loadedMembers=sorted(loaded),observedCounterNames=sorted(counterNames),instrumentedChildEdges=len(edges)-len(external),externalChildEdges=len(external),outputCorrespondence=pin(L/'observed-output-correspondence.json'),nativeCalls=0,limits=contract['limits'],scope='Original exact workload oracle plus bounded passive observation coverage; no acceptance or inferred missing counters')
except Exception as error:
    answer=dict(status='stopped',subjectId='candidate',lane=c['lane'],firstCause=repr(error),traceback=traceback.format_exc(),stop='No repair/retry/next lane; preserve outputs and return Root')
write(L/'coverage-result.json',answer)
print(json.dumps({k:v for k,v in answer.items() if k in ['status','lane','firstCause','processCount','traceFileCount','observedHistoryOwners','externalChildEdges']}))
if answer['status']!='satisfied':sys.exit(1)
