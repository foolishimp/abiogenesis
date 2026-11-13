"""Source/control-only readiness. No ABI imports, runtime, provider, build or tests."""
from pathlib import Path
import ast, hashlib, json, subprocess
from datetime import datetime, timezone

Q = Path(__file__).resolve().parent
C = Path('/Users/jim/src/apps/abiogenesis-rc6-local-cut')
REL = 'qualification-inputs/rc7-overhead-author-01'
SCRATCH = 'qualification-scratch/rc7-overhead-author-01'
def load(p): return json.loads(Path(p).read_text())
def pin(p):
    p=Path(p);h=hashlib.sha256();size=0
    with p.open('rb') as f:
        while b:=f.read(1024*1024): size+=len(b);h.update(b)
    return {'path':str(p),'bytes':size,'sha256':h.hexdigest()}
def equalpin(p): assert pin(p['path'])=={k:p[k] for k in ['path','bytes','sha256']},p['path']
def git(*args): return subprocess.check_output(['/usr/bin/git','-C',str(C),*args]).decode().strip()

grant=load(Q/'NATIVE_GRANT.json');w=load(Q/'workload.json');before=load(Q/'SOURCE_BEFORE.json')
staging=load(Q/'STAGING_MANIFEST.json');profile=load(Q/'PROVIDER_PROFILE.json');runtime=load(Q/'RUNTIME_BINDINGS.json')
c2=load(Q/'inputs/C2_INPUTS.json');bounds=load(Q/'inputs/COMMAND_BOUNDS.json')
assert git('rev-parse','HEAD')==grant['sourceCommit']==before['sourceCommit']
assert sorted(git('diff','--name-only',grant['sourceCommit']).splitlines())==sorted(before['inheritedTrackedChangedPaths'])
assert len(before['inheritedTrackedChangedPaths'])==20 and len(before['inheritedNewProductPaths'])==2
assert not git('diff','--cached','--name-only')
assert before['inheritedUntrackedPaths']==before['inheritedNewProductPaths']
for f in before['files']:
    actual=pin(C/f['relativePath']);assert actual['bytes']==f['bytes'] and actual['sha256']==f['sha256'],f['relativePath']
    held=pin(f['sourceSnapshot']);assert held['bytes']==f['bytes'] and held['sha256']==f['sha256'],f['sourceSnapshot']
assert len(before['files'])==len({f['relativePath'] for f in before['files']})
equalpin(load(Q/'inputs/SOURCE_CUSTODY.json')['sourceBefore'])
for f in staging['files']:
    a=pin(f['source']);assert a['bytes']==f['bytes'] and a['sha256']==f['sha256'],f['source']
    assert f['relativePath']==REL+'/'+Path(f['source']).name
    assert f['path']==str(C/f['relativePath'])
    assert not Path(f['path']).exists(),'Control unexpectedly staged during source-only preparation'
assert not (C/SCRATCH).exists(),'Native scratch/handoffs must remain absent before Root activation'
assert not (Q/'execution').exists(),'No native preflight/dispatch authorized in this check'
assert (Q/'NATIVE_GRANT.json').read_bytes()==(Q/'inputs/NATIVE_GRANT.json').read_bytes()
paths=[f['relativePath'] for f in before['files']]+[f['relativePath'] for f in staging['files']]+grant['handoffFiles']
assert sorted(paths)==sorted(w['readRoots'])==sorted(grant['sourceAcquisitionPaths'])
assert len(paths)==len(set(paths)) and len(paths)<=w['maxContextFiles']
assert list(w['workOrders'])==['construction']
order=w['workOrders']['construction'];assert isinstance(order['instructions'],list) and all(isinstance(x,str) and x for x in order['instructions'])
assert order['writeRoots']==grant['nativeWriteRoots']==grant['productWritePaths']+grant['handoffFiles']+[SCRATCH+'/tmp']
assert len(grant['productWritePaths'])==len(set(grant['productWritePaths']))
assert set(grant['productWritePaths'])<={f['relativePath'] for f in before['files']}
assert not any(p.startswith('specification/') for p in grant['productWritePaths'])
assert not grant['newFilesExpectedAfterConstruction']
assert set(order['readFirst'])<=set(paths) and len(order['readFirst'])==len(set(order['readFirst']))
assert sorted(c2['protectedSourcePaths'])==sorted(f['relativePath'] for f in before['files'])
assert c2['mutableProductPaths']==grant['productWritePaths']
for s in w['sources']:
    p=next((Path(f['source']) for f in staging['files'] if f['relativePath']==s['path']),C/s['path'])
    assert 'sha256:'+pin(p)['sha256']==s['digest'],s['path']

equalpin(grant['authority']);equalpin(grant['selection'])
equalpin(runtime['actualClose']);equalpin(runtime['resume'])
assert load(runtime['actualClose']['path'])['prefix']==runtime['actualClosePrefix']
assert runtime['actualClosePrefix']['prefixLength']==1057950101
assert runtime['rootControlAdmission'] is None and runtime['status']=='ACTUAL_RECOVERED_PREDECESSOR_BOUND_ROOT_ADMISSION_PENDING'
assert runtime['bindingOverlayFields']==['binding','catalog','catalogView']
assert profile['provider']['maxTurns']==bounds['ceilings']['providerTurns']==320
assert profile['provider']['absoluteTimeoutMs']==bounds['ceilings']['providerAbsoluteTimeoutMs']==5400000
assert profile['provider']['inactivityTimeoutMs']==bounds['ceilings']['providerInactivityTimeoutMs']==1800000
assert profile['outerTimeoutMs']==bounds['ceilings']['outerHostTimeoutMs']==10800000
assert profile['provider']['appendArgs']==['--effort','xhigh']
assert profile['runtimeEnvironment']['NODE_OPTIONS']=='--max-old-space-size=8192'
assert all(x['timeoutMs']==300000 for x in c2['lanes'])
assert (Q/'prepare-r1.mjs').read_text().count('const env=caller.refresh();')==1
assert 'freshReadbacks' not in (Q/'dispatch.mjs').read_text()
assert 'READBACKS_PENDING.json' in (Q/'dispatch.mjs').read_text()
assert (Q/'dispatch.mjs').read_text().index("await record('after-run-resume.json'")<(Q/'dispatch.mjs').read_text().index("await record('outcome-summary.json'")
deps=load(Q/'inputs/DEPENDENCY_SOURCE_SELECTION.json')
for p in deps['toolchainEntryPins']+deps['contractSeedPins']: equalpin(p)

syntax=[]
for rel in ['prepare-r1.mjs','dispatch.mjs','inputs/prior-author-stage.mjs','inputs/prior-author-lanes.mjs']:
    r=subprocess.run(['/opt/homebrew/Cellar/node/24.7.0/bin/node','--check',str(Q/rel)],capture_output=True,text=True)
    assert r.returncode==0,(rel,r.stderr);syntax.append({'path':rel,'operation':'node --check','exitCode':r.returncode})
for rel in ['check-controls.py','launch-owner-script.py']:
    ast.parse((Q/rel).read_text());syntax.append({'path':rel,'operation':'Python ast.parse only','valid':True})
r=subprocess.run(['/bin/sh','-n',str(Q/'claude-provider.sh')],capture_output=True,text=True)
assert r.returncode==0,r.stderr;syntax.append({'path':'claude-provider.sh','operation':'sh -n only','exitCode':0})

control_bytes=sum(f['bytes'] for f in staging['files']);physical_bytes=before['sourceBytes']+control_bytes
enc=lambda v:len(json.dumps(v,separators=(',',':'),ensure_ascii=False).encode())
order_bound=enc(order)+enc(w['readRoots'])+len(grant['worksiteRoot'].encode())+4096
assert physical_bytes<w['maxContextBytes']
assert order_bound+131072<w['maxPromptBytes']
assert not any(p.endswith('/SOURCE_BEFORE.json') for p in paths)
report={'kind':'source_only_operator_control_readiness','status':'PASS_SOURCE_ONLY_PREPARED_NOT_DISPATCHED','at':datetime.now(timezone.utc).isoformat(),'sourceCommit':grant['sourceCommit'],'sourceBefore':pin(Q/'SOURCE_BEFORE.json'),'counts':{'selectedContextPaths':len(paths),'existingFileBodies':len(before['files'])+len(staging['files']),'absentHandoffs':len(grant['handoffFiles']),'sourceInventory':len(before['files']),'freshCurrentPins':sum(f['sourceStanding'].startswith('fresh') for f in before['files']),'compileCodeFiles':before['compileInputFiles'],'stagedClosure':len(c2['protectedSourcePaths']),'permittedProductWritePaths':len(grant['productWritePaths']),'nativeWriteRoots':len(grant['nativeWriteRoots']),'inheritedModifiedProduct':20,'inheritedNewProduct':2},'bytes':{'sourceBodies':before['sourceBytes'],'controlBodies':control_bytes,'selectedPhysicalBodies':physical_bytes,'maxContextBytes':w['maxContextBytes'],'sourceBeforeMetadata':(Q/'SOURCE_BEFORE.json').stat().st_size,'sourceBeforeInNativeContext':False,'renderedOrderConservativeEstimate':order_bound,'promptReserve':131072,'maxPromptBytes':w['maxPromptBytes']},'orderEstimateBasis':'Static upper estimate from complete order JSON plus readable paths, worksite root and 4096 fixed-text allowance against the acquired renderNativeWorkspaceWorkOrder source. Actual installed owner render remains Root preflight; no owner/runtime call made here.','lanes':[{'id':l['id'],'modules':len(l['files']),'minimumTests':l['minimumTests'],'namedInactiveHistoricalCases':len(l['allowedHistoricalSkippedTests']),'requiredActivePrefixes':l['requiredActivePrefixes'],'timeoutMs':l['timeoutMs']} for l in c2['lanes']],'syntax':syntax,'runtime':{'actualClose':runtime['actualClose'],'actualResume':runtime['resume'],'prefixLength':runtime['actualClosePrefix']['prefixLength'],'rootControlAdmission':None,'preflightCalls':0,'providerCalls':0,'nativeDispatches':0,'ProductBuildsOrTests':0,'credentialsAccessed':False},'limits':['Mechanical source/control readiness only. No independent semantic assessment, Product test pass, actual native capacity receipt, installed proof, qualification or release.','The 85 permitted files are the complete bounded causal cone, not an instruction to edit all or repeat unaffected proof.','Actual owner preflight and Root subsequent post-host full terminal readbacks remain pending.','No mutable control/source changed after this check may use this exact report without a refreshed concrete binding.']}
out=Q/'STATIC_CHECKS.json';assert not out.exists(),'One frozen readiness report; do not overwrite a prior check'
out.write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'status':report['status'],'counts':report['counts'],'bytes':report['bytes'],'nativeDispatches':0}))
