from pathlib import Path
import json,hashlib,re,os,sys,subprocess,ast,difflib
R=Path('/Users/jim/src/apps/abiogenesis');W=R/'.ai-workspace/work/T287_RELEASE_RESUMPTION_01';P=W/'rc11-effect-phase2-01';N=P/'native-b01';O=Path(__file__).resolve().parent;T='build_tenants/abiogenesis/typescript';Q='/private/tmp/abg-rc11-effect-phase2-b-proof-20261110-01';tenant=Q+'/work/'+T
pin=lambda p:{'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
def save(n,x):
 with (O/n).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
old=json.loads((W/'rc11-effect-phase1-01/proof-01/CONTROLS.json').read_text());routes=json.loads((P/'proof-intake/b-preparation-01/ROUTES.json').read_text());eco=json.loads((P/'proof-intake/b-preparation-01/M5_ECONOMY_APPENDIX.json').read_text());fr=json.loads((N/'source-freeze.json').read_text());src=N/'frozen-source'/T
c={k:v for k,v in old.items() if k not in ['commands','controlledBaseline','id','status','environment']};c.update(id='PHASE2-B-PROOF-CONTROLS',status='PREPARED_EXECUTION_HELD',proofRoot=Q,campaignMaximumSeconds=5400,cleanupReserveSeconds=15,signalGraceSeconds=2,controlledBaseline=pin(O/'CONTROLLED_BASELINE.json'),expectedAbsentSeeds=[],archiveFilename='abiogenesis-typescript-tenant-5.0.0-rc.11.tgz',m5ExpectedNames=eco['m5ExpectedNamesFromPriorExactSubject'],fileHost=pin(W/'rc8-close-proof-01/file-host.mjs'),dependencyMetadata=pin(O/'DEPENDENCY_METADATA.json'))
names=json.loads((O/'CONTROLLED_BASELINE.json').read_text())['wholeFileNames'];cmds=[]
for r0 in routes['routes']:
 r=dict(r0)
 if r['id'] in ['stage','m5']:continue
 if r['id']=='configured-c2-positive':r['id']='c2-positive'
 x={'id':r['id'],'kind':r.get('kind','testfile'),'args':r.get('args',[]),'timeoutSeconds':r['capSeconds']}
 if r['id']=='lint':x.update(kind='node',args=[str(O/'lint.mjs'),str(O/'LINT_RECIPE.json')])
 if r['id']=='build':x.update(kind='node',args=['--experimental-import-meta-resolve',str(O/'build.mjs'),c['npmCli']['path'],'{Q}/build/EFFECT_MODULE_ORIGINS.json'])
 if r['id']=='pack':x['args']=['pack','--ignore-scripts','--offline','--json','--pack-destination','{Q}/artifacts']
 if r['id']=='bootstrap':x.update(kind='npm',args=['install','--ignore-scripts','--offline','--no-audit','--no-fund','{ACTUAL_ARCHIVE}'])
 if r['id']=='c2-positive':
  x.update(kind='testfile',args=['--experimental-vm-modules','--test','--test-concurrency=1','--test-reporter=tap','--test-reporter-destination=stdout','--test-reporter={TENANT}/scripts/node-test-evidence-reporter.mjs','--test-reporter-destination={Q}/c2-positive/events.jsonl','--test-name-pattern='+r['namePattern'],r['testFile']],expectedNames=[r['namePattern'][1:-1]])
 if x['kind']=='testfile':
  x.update(expectedTests=r.get('expectedTests',r.get('prospectiveTests')),expectedSkipped=r.get('expectedSkipped',0),expectedSkippedNames=r.get('expectedSkippedNames',[]))
  if 'expectedNames' in r:x['expectedNames']=r['expectedNames']
  if r['id']=='owned-lifetime':x['expectedNames']=names
  if r['id']=='unit':x['expectedNames']=next(z['expectedNames'] for z in old['commands'] if z['id']=='unit')
 if 'maxOutputBytes' in r:x['maxOutputBytes']=r['maxOutputBytes']
 cmds.append(x)
assert [x['id'] for x in cmds]==['lint','build','helper-prerequisite','b-selected','pack','bootstrap','c2-positive','owned-lifetime','unit']
c['commands']=cmds;c['m5EvidenceCaseIds']=sorted(json.loads(p.read_text())['caseId'] for p in Path('/private/tmp/abg-rc11-effect-phase1-proof-20261110-01/unit/evidence').glob('*.json'));assert len(c['m5EvidenceCaseIds'])==34
c['c2ConfigurationTemplate']={'effectGrant':'P5_INSTALLED_EXECUTION_GRANTED_BY_EXECUTIVE','proofPackageRoot':tenant,'installHost':Q+'/bootstrap-host','scratchParent':Q+'/c2-tmp','evidenceRoot':Q+'/c2-positive/installed-proof','nodeExecutable':c['node']['path']}
for key,rel in [('testSha256','test_env/tests/t287-worksite-command-execution.test.mjs'),('freshSupportSha256','test_env/support/fresh-process-runtime-proof.mjs'),('setupSupportSha256','test_env/support/root-installed-environment.mjs'),('replayWorkerSha256','test_env/falsifiers/runtime-retained-projections-worker.mjs')]:c['c2ConfigurationTemplate'][key]=pin(src/rel)['sha256']
c['environment']='Minimal inherited HOME/USER/LOGNAME/SHELL/LANG only; pinned Node PATH; empty NODE_OPTIONS/NODE_PATH; offline npm/private caches. Only C2 gets explicit installed config/blocked real-provider paths. Unit has no frozen archive opt-in.'
save('CONTROLS.json',c)
save('MODULE_ORIGIN_RELATION.json',{'test':pin(src/'test_env/tests/t287-owned-process-lifetime.test.mjs'),'helper':pin(src/'code/src/implementation/worksite_command_helper.ts'),'normalPackageRoot':tenant,'relation':'Tests and compiled helper/shared runner resolve within the same staged tenant/node_modules. No ABI5_OWNED_PROCESS_PACKAGE_ROOT override.','actualGate':'build.mjs records Node ESM import-condition resolution and realpath for each declared Effect specifier from every parent; distinct URL/origin stops before helper tests.','executionPerformed':False,'packagedRootLimit':'No private VM adapter is run against bootstrap. Configured C2 uses genuine installed owners.'})
# Compact acceptance record; Root, not this Worker, accepts the bounded source relation.
reviewPins=[pin(N/r) for r in ['source-review/ASSESSMENT.md','source-review/EVIDENCE.json','first-red-triage-01/ASSESSMENT.md','first-red-triage-01/EVIDENCE.json','first-red-triage-01/REVISION_01.json']]
assert reviewPins[0]['sha256']=='aed4625a9ae365ac807a85824078d565598fb12e814c3c3fb8ec5a67fa9f9e77';assert reviewPins[2]['sha256']=='357e86b80a50a0e4abd7d0500af3254b7651ed6b38297bd9dd350f4c7558b8ac'
save('ROOT_SOURCE_ACCEPTANCE.json',{'id':'PHASE2-B-SOURCE-ACCEPTANCE-01','decisionOwner':'Root','status':'BOUNDED_SOURCE_CONTRACT_RELATION_SATISFIED_EXTERNAL_EXECUTION_HELD','sourceDigest':fr['sourceDigest'],'sourceInventory':pin(N/'source-freeze.json'),'reviews':reviewPins,'firstRed':'29/30 retained; one-line captured-owner adapter correction restores actual reachability with unchanged owner/assertions.','limits':['Use/closed Cause seam is bounded availability, not universal persistent diagnosis.','Supported default host/Node child construction; invalid-grace throw is inherited and Product-refused.','No net deletion: B +108 lines, A+B +316; no performance/reliability/installed/fullPhase2 acceptance.','All external proof and both deferred capsules remain open.']})
g=json.loads((O/'PRESERVATION_GUARDS.json').read_text());updates=[]
prefix=('<!-- PHASE2-B-SOURCE-ACCEPTANCE-01 -->\n**Current Phase2 B status — bounded source relation accepted; external proof held.** Root conjoined independent source assurance and the retained first-red adapter triage for frozen `97e05ec3`. The original 29/1 red remains; the captured-owner exposure correction preserves owner and assertion semantics. Normal build, helper/B/installed C2/lifetime proof and the original unit once (including all 39 M5 cases) remain pending. No full Phase2, installed, performance or qualification claim; both deferred capsules remain open. See `rc11-effect-phase2-01/native-b01/proof-01/ROOT_SOURCE_ACCEPTANCE.json` under the T287 work root.\n\n').encode()
for r in g['mainTracking']:
 p=Path(r['path']);assert pin(p)==r;before=p.read_bytes();p.write_bytes(prefix+before);assert p.read_bytes()[len(prefix):]==before;updates.append({'before':r,'after':pin(p),'priorBodyExact':True})
for r in g['indices']:assert pin(Path(r['path']))==r
g['mainTracking']=[r['after'] for r in updates];save('TRACKING_SOURCE_ACCEPTANCE.json',{'updates':updates,'indicesConserved':g['indices']});save('PRESERVATION_GUARDS.FINAL.json',g)
pins=g['indices']+g['mainTracking']+g['candidateTracking']+[g['builderPin'],g['archive'],g['workspaceManifest']]
inputs=[pin(N/p) for p in ['source-freeze.json','RETURN.json','SOURCE_CUSTODY.json','SCRATCH_COMPILE_RELATION.json','COMPILED_SCRATCH_INVENTORY.json','CONTROLLED_CENSUS.json']]+reviewPins+[pin(P/'proof-intake/b-preparation-01'/p) for p in ['PREPARATION.md','ROUTES.json','M5_ECONOMY_APPENDIX.md','M5_ECONOMY_APPENDIX.json']]+[pin(P/'proof-intake'/p) for p in ['CONFIGURED_PROOF_ROUTE.md','CONFIGURED_PROOF_ROUTE.json']]
save('BINDING.json',{'status':'FROZEN_PHASE2_B_PROOF_SUBJECT_EXECUTION_HELD','sourceDigest':fr['sourceDigest'],'sourceInventory':pin(N/'source-freeze.json'),'frozenSourceRoot':fr['frozenRoot'],'liveSourceRoot':fr['sourceRoot'],'proofRoot':Q,'controls':pin(O/'CONTROLS.json'),'rootSourceDisposition':pin(O/'ROOT_SOURCE_ACCEPTANCE.json'),'preservationPins':pins,'heads':g['heads'],'inputs':inputs,'futureIdentities':{'compiled':None,'archive':None,'bootstrap':None,'configuredProof':None},'admissionRequired':True})
print(json.dumps({'binding':pin(O/'BINDING.json'),'controls':pin(O/'CONTROLS.json'),'rootSource':pin(O/'ROOT_SOURCE_ACCEPTANCE.json')}))
