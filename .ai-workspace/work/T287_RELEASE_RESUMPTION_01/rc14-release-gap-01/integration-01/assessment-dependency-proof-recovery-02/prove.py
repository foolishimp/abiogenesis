#!/usr/bin/env python3
"""One fresh build and bounded dependency/assembly proof; separate exact Root grant."""
import datetime,hashlib,importlib.util,json,os,re,shutil,subprocess,sys,time
from pathlib import Path
sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent
ACT=json.loads((HERE/'ACTIVATION.json').read_text())
RECOVERY=json.loads((HERE/'RECOVERY_BINDING.json').read_text())
NATIVE_CONTROL=Path(RECOVERY['nativeControlRoot'])
SOURCE=Path(ACT['sourceWorktree']);RAW=Path(ACT['rawRoot']);REL=Path('build_tenants/abiogenesis/typescript')
NODE='/opt/homebrew/bin/node'

def module(name,filename):
 spec=importlib.util.spec_from_file_location(name,HERE/filename); m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
owner=module('finite_process','process-owner.py');deps=module('dependencies','dependency-inputs.py');custody=module('setup_custody',NATIVE_CONTROL/'setup-custody.py')
write=owner.write

def digest(path):
 h=hashlib.sha256()
 with Path(path).open('rb') as f:
  for chunk in iter(lambda:f.read(8388608),b''):h.update(chunk)
 return h.hexdigest()

def bound_json(row):
 assert digest(row['path'])==row['sha256'],row['path'];return json.loads(Path(row['path']).read_text())

def require_author_completion(native,final):
 assert final['nativeCompleted'] is True,'outer host success is not author completion'
 completion=json.loads((RAW/'runtime/AUTHOR_COMPLETION.json').read_text())
 assert completion['status']=='completed' and completion['actualResourceClose'] and completion['freshResult'] and completion['freshClosedReplay']
 expected={'NATIVE_RETURN.json','FRESH_READBACKS.json','calls/run_result.outcome.json','calls/run_replay.outcome.json'}
 assert len(completion['evidence'])==len(expected) and {r['path'] for r in completion['evidence']}==expected
 for r in completion['evidence']:
  p=RAW/'runtime'/r['path'];assert p.stat().st_size==r['bytes'] and digest(p)==r['sha256'],r['path']
 value=native['ownerOutput']['value'];terminal=value['terminalResult']
 assert native['ownerOutput']['outcomeKind']=='result' and value['disposition']=='completed'
 assert terminal['kind']=='abg_typed_terminal_result' and terminal['valueKind']=='native_workspace_work_observation'
 assert terminal['value']['kind']=='native_workspace_work_observation' and terminal['value']['inputDigest']==completion['taskDigest']
 assert value['run']==native['run']==completion['run'] and value['result']==terminal['result']==completion['result']
 assert terminal['valueDigest']==completion['terminalValueDigest']
 prepared=json.loads((RAW/'runtime/PREPARED.json').read_text());assert prepared['taskDigest']==completion['taskDigest']
 rows=json.loads((RAW/'runtime/FRESH_READBACKS.json').read_text());assert [r['memberKey'] for r in rows]==['run_result','run_replay']
 for r in rows:
  assert r['outcomeKind']=='result' and r['source']==native['run']
  read=json.loads((RAW/'runtime/calls'/f"{r['memberKey']}.outcome.json").read_text())['receipt']['ownerOutput']
  assert read['outcomeKind']=='result' and read['value']['source']==native['run']
  projection=read['value']['projection'];assert projection['subject']==native['run']
  for k in ['result','contract','producer','value','valueDigest']:
   assert projection['terminalResult'][k]==terminal[k],(r['memberKey'],k)
  if r['memberKey']=='run_result':assert projection['result']==terminal['result']
  else:assert projection['status']=='closed' and r['status']=='closed'

def source_inventory(head):
 git=lambda *a:subprocess.check_output(['/usr/bin/git','-C',str(SOURCE),*a])
 assert git('rev-parse','HEAD').decode().strip()==head
 assert git('diff','--cached','--name-only','-z')==b'','native must not stage'
 tracked=[x.decode() for x in git('ls-files','-z').split(b'\0') if x]
 others=[x.decode() for x in git('ls-files','--others','--exclude-standard','-z').split(b'\0') if x]
 changed=sorted(set([x.decode() for x in git('diff','--name-only','HEAD','-z').split(b'\0') if x]+others))
 setup=custody.verify(SOURCE,RAW,head);assert setup['path'] in changed
 native=[p for p in changed if p!=setup['path']]
 assert native and all(p in ACT['nativeWriteScope'] for p in native),native
 rows=[]
 for relative in sorted(set(tracked+others)):
  p=SOURCE/relative
  if not p.exists():continue
  assert p.is_file() and not p.is_symlink(),relative
  rows.append({'path':relative,'bytes':p.stat().st_size,'sha256':digest(p),'executable':bool(p.stat().st_mode&0o111)})
 bypath={r['path']:r for r in rows};pre=json.loads((RAW/'SOURCE_PREIMAGE.json').read_text());assert pre['head']==head
 for row in pre['rows']:
  actual=bypath.get(row['path']);assert actual is not None,'source deletion '+row['path']
  assert actual['executable']==(row['mode']=='100755'),row['path']
  if row['path'] not in native:assert actual['sha256']==row['sha256'],row['path']
 for p in ACT['nativeWriteScope']:assert p in bypath and bypath[p]['bytes']>0,p
 return {'head':head,'changedPaths':changed,'nativeChangedPaths':native,'setupOwnedChanges':[setup],'rows':rows}

def pinned(path,row):
 p=Path(path);assert p.is_file() and not p.is_symlink(),str(p)
 assert p.stat().st_size==row['bytes'] and digest(p)==row['sha256'],str(p)
 return {'path':str(p),'bytes':row['bytes'],'sha256':row['sha256']}

def tree(root,exclude=()):
 rows=[]
 for p in sorted(Path(root).rglob('*')):
  rel=str(p.relative_to(root))
  if any(rel==x or rel.startswith(x+'/') for x in exclude):continue
  assert not p.is_symlink(),str(p)
  if p.is_file():rows.append({'path':rel,'bytes':p.stat().st_size,'sha256':digest(p),'executable':bool(p.stat().st_mode&0o111)})
 return rows

def controls(launch,proofgrant):
 manifest=json.loads((HERE/'CONTROL_MANIFEST.json').read_text())
 assert HERE!=NATIVE_CONTROL,'native and proof controls are distinct subjects'
 assert digest(HERE/'CONTROL_MANIFEST.json')==proofgrant['controlManifestSha256']
 for row in manifest['files']:pinned(HERE/row['path'],row)
 native_manifest=bound_json(RECOVERY['nativeControlManifest'])
 assert digest(NATIVE_CONTROL/'CONTROL_MANIFEST.json')==RECOVERY['nativeControlManifest']['sha256']==launch['controlManifestSha256']==proofgrant['nativeControlManifestSha256']
 assert len(native_manifest['files'])==RECOVERY['nativeControlMembers']==35 and launch['controls']==native_manifest['files']
 for row in native_manifest['files']:pinned(NATIVE_CONTROL/row['path'],row)
 recovery=recovery_inputs()
 require_recovery(recovery,launch,proofgrant)
 for row in ACT['externalReadOnlyInputs']:pinned(row['path'],row)
 for row in ACT['externalEvidenceInputs']:pinned(row['path'],row)
 tools=json.loads((HERE/'TOOL_INPUTS.json').read_text())
 for row in tools['files']:
  assert str(Path(row['invocationPath']).resolve())==row['path'];pinned(row['path'],row)
 assert deps.inventory(tools['npmTree']['path'])['sha256']==tools['npmTree']['inventorySha256']
 candidate=json.loads((HERE/'ORIGINAL_CANDIDATE.json').read_text())
 for name in ['acceptance','archive','freeze','publicIdentity']:pinned(candidate[name]['path'],candidate[name])
 pinned(ACT['builderPin']['path'],ACT['builderPin']);pinned(ACT['authority']['path'],ACT['authority'])
 return {'manifestSha256':digest(HERE/'CONTROL_MANIFEST.json'),'files':manifest['files'],'nativeManifestSha256':RECOVERY['nativeControlManifest']['sha256'],'nativeFiles':native_manifest['files'],'recoveryDecisionSha256':RECOVERY['rootRecovery']['sha256'],'recoveryInputs':recovery['pins']}

def recovery_inputs():
 # Exact external recovery facts, not a rewritten native audit or Product authority.
 keys=['rootRecovery','nativeControlManifest','nativeLaunch','controlStart','sourcePreimage','audit','operatorReturn','freeze','sourcePostimage','sourceDiff','frozenFile','proofSelection']
 pins=[pinned(RECOVERY[k]['path'],RECOVERY[k]) for k in keys]
 root=bound_json(RECOVERY['rootRecovery'])
 pinned(RECOVERY['rootRecovery']['originatingPath'],RECOVERY['rootRecovery'])
 selection=bound_json(RECOVERY['proofSelection'])
 pins.append(pinned(RECOVERY['proofSelection']['originatingPath'],RECOVERY['proofSelection']))
 for key in ['return','difference','start']:
  row=selection['firstAttempt'][key];pins.append(pinned(row['path'],row))
 prior_start=bound_json(selection['firstAttempt']['start'])
 return {'root':root,'audit':bound_json(RECOVERY['audit']),'freeze':bound_json(RECOVERY['freeze']),'postimage':bound_json(RECOVERY['sourcePostimage']),'preimage':bound_json(RECOVERY['sourcePreimage']),'operatorReturn':bound_json(RECOVERY['operatorReturn']),'selection':selection,'priorProofStart':prior_start,'pins':pins}

def require_recovery(facts,launch,grant):
 root=facts['root'];attempt=root['nativeAttempt'];decision=root['recovery'];method=root['methodAndEffectDisposition'];audit=facts['audit'];freeze=facts['freeze']
 assert root['id']=='RC14-B56-NATIVE04-EXACT-SOURCE-RECOVERY-01' and root['proofAuthorized'] is False and root['newNativeAuthorized'] is False
 assert decision['decision']=='accepted_as_independently_reviewed_source_construction_input_only' and decision['nativeAuthorshipCompliant'] is False and method['methodCompliant'] is False
 assert grant['recoveryDecisionSha256']==RECOVERY['rootRecovery']['sha256']
 assert attempt['sourceHead']==RECOVERY['nativeSourceHead']==launch['sourceHead']==grant['sourceHead']==audit['sourceHead']==freeze['sourceHead']
 assert attempt['sourceWorktree']==RECOVERY['nativeSourceRoot']==str(SOURCE) and attempt['rawRoot']==RECOVERY['nativeRawRoot']==str(RAW)
 for key in ['nativeLaunch','sourcePreimage','audit','operatorReturn','freeze','sourcePostimage','sourceDiff']:assert attempt[key]==RECOVERY[key],key
 assert decision['file']==RECOVERY['frozenFile'] and decision['relativePath']==RECOVERY['relativeWritePath']
 assert audit['disposition']==method['originalAuditDisposition']=='held_for_root_method_and_source_disposition'
 assert audit['methodResiduals']==method['preservedMethodResiduals'] and [x['id'] for x in audit['methodResiduals']]==RECOVERY['methodResidualIds']==['M04-01','M04-02','M04-03']
 assert audit['sourceScope']==method['sourceScope'] and audit['observedEffects']==method['observedEffects']
 assert audit['sourceScope']['allowedWritePaths']==audit['sourceScope']['actualChangedTrackedPaths']==ACT['nativeWriteScope']==[RECOVERY['relativeWritePath']]
 assert audit['sourceScope']['recoveredFilesUnchanged']==RECOVERY['immutableFiles']==7 and audit['sourceScope']['sourceHeadAndIndexContentUnchanged'] is True
 assert audit['proofAuthorized'] is False and audit['proofEligibilityDecided'] is False and audit['scopeAndCommandsAdmittedNotAsserted'] is True
 assert audit['launchSha256']==grant['nativeLaunchSha256']==RECOVERY['nativeLaunch']['sha256']
 assert audit['controlsManifestSha256']==launch['controlManifestSha256']==RECOVERY['nativeControlManifest']['sha256']
 assert grant['authorAuditSha256']==RECOVERY['audit']['sha256'] and grant['sourcePostimage']==RECOVERY['sourcePostimage'] and grant['sourceDiffSha256']==RECOVERY['sourceDiff']['sha256']
 assert grant['controlStartSha256']==RECOVERY['controlStart']['sha256']
 assert freeze['sourceHeadAndIndexUnchanged'] is True and freeze['sourcePostimage']==RECOVERY['sourcePostimage'] and freeze['sourceDiff']==RECOVERY['sourceDiff']
 assert freeze['files']==[RECOVERY['frozenFile']] and freeze['changedSourcePaths']==[RECOVERY['relativeWritePath']] and freeze['physicalRows']==RECOVERY['postimageRows']==1572
 assert facts['operatorReturn']['audit']['pin']==RECOVERY['audit'] and facts['operatorReturn']['audit']['methodResiduals']==audit['methodResiduals'] and facts['operatorReturn']['source']==freeze
 assert facts['operatorReturn']['stoppedBeforeProof'] is True and facts['operatorReturn']['qualified'] is False
 selection=facts['selection'];scope=selection['workerActivation'];prior=facts['priorProofStart'];stamp=lambda value:datetime.datetime.fromisoformat(value.replace('Z','+00:00'))
 assert selection['id']=='RC14-B56-PROOF01-DISPOSITION-AND-CONTROL02-SELECTION' and selection['executionAuthorized'] is False
 assert grant['proofSelectionSha256']==RECOVERY['proofSelection']['sha256']
 assert scope['proofRoot']==str(RAW/'proof-02') and scope['proofSubject']==json.loads((HERE/'LAYOUT.json').read_text())['proofSubject']
 assert stamp(prior['deadlineUtc'])==stamp(scope['originalProofDeadlineUtc']) and stamp(prior['executionStopDeadlineUtc'])==stamp(scope['executionStopUtc'])
 assert stamp(prior['originalHostDeadlineUtc'])==stamp(scope['originalEnclosingDeadlineUtc']) and prior['cleanupReserveMs']==scope['cleanupReserveMs']==ACT['limits']['cleanupReserveMs']

def require_frozen_postimage(actual,facts):
 saved=facts['postimage'];pre=facts['preimage'];freeze=facts['freeze'];w=RECOVERY['relativeWritePath']
 assert saved['head']==pre['head']==actual['head']==RECOVERY['nativeSourceHead'] and saved['source']==str(SOURCE)
 assert saved['sourcePreimage']==RECOVERY['sourcePreimage'] and saved['indexContentUnchanged'] is True and saved['headUnchanged'] is True
 assert saved['untrackedSetupOwned']==freeze['setupOwnedUntracked']==['.abiogenesis/workspace-manifest.json']
 assert actual['nativeChangedPaths']==[w] and actual['changedPaths']==sorted([w,*saved['untrackedSetupOwned']])
 assert len(actual['setupOwnedChanges'])==1 and actual['setupOwnedChanges'][0]['path']==saved['untrackedSetupOwned'][0]
 rows=saved['rows'];assert len(rows)==RECOVERY['postimageRows']==1572 and len({x['path'] for x in rows})==len(rows)
 assert hashlib.sha256(json.dumps(rows,sort_keys=True,separators=(',',':')).encode()).hexdigest()==saved['rowsSha256']
 assert all(x['mode'] in ['100644','100755'] for x in rows),'unsupported frozen source mode'
 expected=sorted([{'path':x['path'],'bytes':x['bytes'],'sha256':x['sha256'],'executable':x['mode']=='100755'} for x in rows],key=lambda x:x['path'])
 assert actual['rows']==expected,'complete frozen physical postimage differs'
 bypath={x['path']:x for x in rows};before=next(x for x in pre['rows'] if x['path']==w)
 assert len(saved['changed'])==1 and saved['changed'][0]=={'path':w,'before':before,'after':bypath[w]}
 assert bypath[w]['bytes']==RECOVERY['frozenFile']['bytes'] and bypath[w]['sha256']==RECOVERY['frozenFile']['sha256']

def native_inputs(root):
 packet=json.loads((HERE/'NATIVE_INPUTS.json').read_text());pinned(root/packet['declaration']['path'],packet['declaration'])
 declaration=json.loads((root/packet['declaration']['path']).read_text());rows=declaration['inputFiles']
 assert len(rows)==packet['inputCount']==196
 assert hashlib.sha256(json.dumps(rows,sort_keys=True,separators=(',',':')).encode()).hexdigest()==packet['inputRowsSha256']
 for row in rows:
  p=Path(row['path']);assert p.is_file() and digest(p)==row['sha256'],row['path']
 assert digest(root/REL/packet['nativeSource']['path'])==packet['nativeSource']['sha256']
 return {'count':len(rows),'rowsSha256':packet['inputRowsSha256'],'declarationSha256':packet['declaration']['sha256']}

def fixtures(root,packet):
 return [pinned(Path(root)/r['path'],r) for r in packet['files']]

def checked_population(events,selection):
 summaries=[x for x in events if x.get('type')=='summary' and x.get('file') is None]
 cases=[x for x in events if x.get('type')=='case' and not x.get('suite')]
 assert len(summaries)==1 and summaries[0]['success'] is True and any(x.get('type')=='end' for x in events),summaries
 top=[x for x in cases if x.get('nesting')==0];mode=selection['mode'];names=selection.get('titles',[])
 # Node versions may emit unselected top-level cases as explicit name-filter skips.
 excluded=[x for x in cases if x.get('skip') and 'test name does not match pattern' in str(x['skip'])]
 for x in excluded:
  if x.get('nesting')==0:
   assert mode=='include' and x['name'] not in names,('unexpected filtered top-level case',x)
 executed=[x for x in cases if x not in excluded]
 actual=[x['name'] for x in top if x not in excluded]
 required=names if mode=='include' else selection['preservedTitles']
 assert all(n in actual for n in required),('missing selected case',required,actual)
 assert mode in ['include','whole'],('unsupported population mode',mode)
 assert len(actual)==len(set(actual)),('duplicate top-level name',actual)
 if mode=='include':
  assert len(names)==len(set(names)) and sorted(actual)==sorted(names),('exact selected-name set differs',names,actual)
 optional=selection['optionalSkipReasonIncludes'];skips=[x for x in executed if x.get('skip')]
 assert all(x['name'] in optional and optional[x['name']] in str(x['skip']) for x in skips),('undeclared selected skip',skips)
 assert all(not x.get('skip') for x in top if x['name'] in required),'required top-level positive skipped'
 assert executed and all(x['passed'] and not x.get('todo') for x in executed),executed
 return {'file':selection['file'],'mode':mode,'partitionRole':selection.get('partitionRole'),'summary':summaries[0],'executedCases':executed,'topLevelNames':actual,'excludedNameFilterCases':excluded,'declaredHostPremiseSkips':skips,'actualPasses':sum(not x.get('skip') for x in executed),'qualification':False}

def main():
 assert len(sys.argv)==3,'exact native LAUNCH and separate Root PROOF_LAUNCH required'
 launchpath=Path(sys.argv[1]);grantpath=Path(sys.argv[2]);launch=json.loads(launchpath.read_text());grant=json.loads(grantpath.read_text());head=launch['sourceHead']
 assert launch['activationId']==grant['activationId']==ACT['id'] and launch['dispatchAuthorized'] is True and grant['proofAuthorized'] is True
 assert grant['sourceHead']==head and grant['nativeLaunchSha256']==digest(launchpath) and grant['controlStartSha256']==digest(RAW/'CONTROL_START.json')
 assert grant['rootAcceptance'] and grant['pushedCheckpoint']
 launch_sha=digest(launchpath);grant_sha=digest(grantpath)
 controls_entry=controls(launch,grant)
 host=json.loads((RAW/'HOST_RETURN.json').read_text());final=json.loads((RAW/'runtime/FINAL.json').read_text());native=json.loads((RAW/'runtime/NATIVE_RETURN.json').read_text())
 assert host['exitCode']==0 and host['stopReason'] is None and host['cleanup']['hostProcessGroupAbsent']
 assert final['launched'] and final['actualResourceClose'] and final['failure'] is None and final['readbackFailure'] is None
 require_author_completion(native,final)
 recovery=recovery_inputs();require_recovery(recovery,launch,grant)
 proof=RAW/'proof-02';proof.mkdir()
 start=time.monotonic();now=datetime.datetime.now(datetime.timezone.utc)
 control=json.loads((RAW/'CONTROL_START.json').read_text());assert control['sourceHead']==head and control['oldCampaignClockReused'] is False
 enclosing=datetime.datetime.fromisoformat(control['deadlineUtc']);requested=now+datetime.timedelta(milliseconds=ACT['limits']['proofCampaignMs']);prior_end=datetime.datetime.fromisoformat(recovery['priorProofStart']['deadlineUtc']);end=min(enclosing,requested,prior_end)
 stop=end-datetime.timedelta(milliseconds=ACT['limits']['cleanupReserveMs']);deadline=start+(stop-now).total_seconds();final_deadline=start+(end-now).total_seconds()
 commands=[];postimage=None;failure=None;secondary=[];checks=[];subject=None;tenant=None;built=None;materialized=None;inputs=None;populations=[]
 dependency=json.loads((HERE/'DEPENDENCY_INPUTS.json').read_text());fixture=json.loads((HERE/'FIXTURE_INPUTS.json').read_text());plan=json.loads((HERE/'PROOF_PLAN.json').read_text())
 try:
  write(proof/'START.json',{'sourceHead':head,'startedUtc':now.isoformat(),'originalHostDeadlineUtc':enclosing.isoformat(),'requestedProofDeadlineUtc':requested.isoformat(),'deadlineUtc':end.isoformat(),'executionStopDeadlineUtc':stop.isoformat(),'cleanupReserveMs':ACT['limits']['cleanupReserveMs'],'noRetry':True,'qualified':False,'grantSha256':digest(grantpath)})
  assert time.monotonic()<deadline,'no remaining proof time'
  postimage=source_inventory(head);write(proof/'SOURCE_ENTRY.json',postimage)
  semantic_population=json.loads((HERE/'SEMANTIC_JOB_POPULATION.json').read_text());pinned(SOURCE/semantic_population['source']['path'],semantic_population['source'])
  for row in json.loads((HERE/'IMMUTABLE_RECOVERY.json').read_text())['files']:pinned(SOURCE/row['path'],row)
  focused=next(x for x in plan['files'] if x.get('partitionRole')=='semantic_focus');remainder_plan=next(x for x in plan['files'] if x.get('partitionRole')=='semantic_remainder')
  assert focused['mode']==remainder_plan['mode']=='include' and focused['titles']==semantic_population['focusedTitles'] and remainder_plan['titles']==semantic_population['remainderTitles']
  assert not set(focused['titles'])&set(remainder_plan['titles']) and sorted(focused['titles']+remainder_plan['titles'])==sorted(semantic_population['topLevelTitles'])
  require_frozen_postimage(postimage,recovery)
  diff=subprocess.check_output(['/usr/bin/git','-C',str(SOURCE),'diff','--binary','HEAD','--',*ACT['nativeWriteScope']])
  assert hashlib.sha256(diff).hexdigest()==recovery['freeze']['sourceDiff']['sha256']==RECOVERY['sourceDiff']['sha256']==grant['sourceDiffSha256']
  assert deps.inventory(dependency['path'])['sha256']==dependency['inventorySha256'] and digest(SOURCE/REL/'package-lock.json')==dependency['lockSha256']
  inputs={'controls':controls_entry,'native':native_inputs(SOURCE),'fixtures':fixtures(fixture['sourceRoot'],fixture),'dependencySha256':dependency['inventorySha256'],'nativeLaunchSha256':digest(launchpath),'proofGrantSha256':digest(grantpath)};write(proof/'INPUTS_ENTRY.json',inputs)
  subject=Path(json.loads((HERE/'LAYOUT.json').read_text())['proofSubject']);assert not subject.exists(),'fresh isolated proof subject only'
  pin=bound_json(ACT['builderPin']);candidate=json.loads((HERE/'ORIGINAL_CANDIDATE.json').read_text())
  layout={'worksite':str(subject),'writePaths':[str(subject/p) for p in ['AGENTS.md','CLAUDE.md','stdo_abiogenesis.json','specification','build_tenants','.ai-workspace']],
    'protectedRoots':[str(SOURCE),dependency['path'],str(Path(fixture['sourceRoot'])/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/default-library-witness'),pin['installedRoot'],pin['releaseRoot'],candidate['C1']['sourceRoot'],str(Path(candidate['archive']['path']).parent),candidate['publicInstalledRoot'],str(RAW/'runtime'),*[row['path'] for row in ACT['externalEvidenceInputs']],str(HERE),str(NATIVE_CONTROL),*[row['path'] for row in recovery['pins']],RECOVERY['rootRecovery']['originatingPath']], 'archiveRoot':str(proof)}
  write(proof/'TOPOLOGY_LAYOUT.json',layout)
  scratch=proof/'scratch'
  for suffix in ['tmp','npm-cache','observations']:(scratch/suffix).mkdir(parents=True)
  for name in ['user.npmrc','global.npmrc']:(scratch/name).write_text('')
  env={'HOME':'/Users/jim','PATH':'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin','LANG':'en_US.UTF-8','LC_ALL':'en_US.UTF-8','TMPDIR':str(scratch/'tmp'),'NODE_OPTIONS':'','GIT_OPTIONAL_LOCKS':'0','STDO_STORE':'/Users/jim/Library/Application Support/STDO','NPM_CONFIG_OFFLINE':'true','NPM_CONFIG_UPDATE_NOTIFIER':'false','NPM_CONFIG_USERCONFIG':str(scratch/'user.npmrc'),'NPM_CONFIG_GLOBALCONFIG':str(scratch/'global.npmrc'),'NPM_CONFIG_CACHE':str(scratch/'npm-cache'),'ABG_REGRESSION_PROOF_ROOT':str(scratch/'observations')}
  def run(name,argv,budget,cwd):
   assert time.monotonic()<deadline and shutil.disk_usage(RAW).free>ACT['limits']['reserveBytes']
   try:return owner.run(proof/name,argv,cwd,env,budget/1000,ACT['limits']['outputBytesPerCommand'],deadline)
   finally:
    receipt=proof/name/'RETURN.json'
    if receipt.is_file():
     result=json.loads(receipt.read_text());commands.append({'name':name,**result});print(json.dumps({'phase':'proof-command-return','name':name,'exitCode':result['exitCode'],'elapsedMs':result['elapsedMs']}),flush=True)
  run('000-topology',['/usr/bin/python3',str(HERE/'physical-topology.py'),str(proof/'TOPOLOGY_LAYOUT.json')],60000,SOURCE)
  topology=json.loads((proof/'000-topology/stdout.raw').read_text());assert topology['ok'] is True and topology['disposition']=='separated'
  subject.mkdir()
  for name in ['AGENTS.md','CLAUDE.md','stdo_abiogenesis.json']:shutil.copy2(SOURCE/name,subject/name)
  shutil.copytree(SOURCE/'specification',subject/'specification')
  tenant=subject/REL;tenant.parent.mkdir(parents=True);shutil.copytree(SOURCE/REL,tenant,ignore=shutil.ignore_patterns('node_modules','build','artifacts','qualification-scratch','test_runs'))
  shutil.copytree(dependency['path'],tenant/'node_modules',symlinks=True)
  assert deps.inventory(tenant/'node_modules')['sha256']==dependency['inventorySha256']
  for row in fixture['files']:
   dest=subject/row['path'];dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(Path(fixture['sourceRoot'])/row['path'],dest);pinned(dest,row)
  generated=[str(REL/x) for x in ['build','artifacts','contracts/schemas/operations','contracts/public-functions','contracts/public-operations','contracts/vocabularies','contracts/capabilities/capability-definition-graph.json','product-toolchain-manifest.json','node_modules']]
  materialized=tree(subject,generated);write(proof/'MIRROR_SOURCE_ENTRY.json',{'rows':materialized,'allowedBuildWrites':generated})
  for row in postimage['rows']:
   p=subject/row['path']
   if p.is_file():assert digest(p)==row['sha256'],row['path']
  assert plan['builds']==1
  run('001-build',plan['buildArgv'],plan['buildBudgetMs'],tenant)
  assert tree(subject,generated)==materialized,'build changed non-generated source'
  built=tree(subject,[str(REL/'node_modules')]);write(proof/'BUILD_POSTIMAGE.json',{'rows':built,'dependencySha256':dependency['inventorySha256']})
  native_inputs(subject)
  for selection in plan['files']:
   name=selection['id'];directory=proof/name
   args=[NODE,'--experimental-vm-modules','--test','--test-concurrency=1','--test-timeout='+str(max(1000,selection['budgetMs']-15000)),'--test-reporter=./scripts/node-test-evidence-reporter.mjs']
   if selection['mode']!='whole':
    pattern='(?:'+'|'.join(re.escape(x) for x in selection['titles'])+')'
    assert selection['mode']=='include','only positive exact-title unions are permitted'
    args.append('--test-name-pattern=^'+pattern+'$')
   args.append('test_env/tests/'+selection['file'])
   try:run(name,args,selection['budgetMs'],tenant)
   finally:
    events=[]
    if (directory/'stdout.raw').is_file():
     for line in (directory/'stdout.raw').read_text(errors='replace').splitlines():
      try:value=json.loads(line)
      except (ValueError,TypeError):continue
      if isinstance(value,dict):events.append(value)
    if directory.is_dir():
     write(directory/'OBSERVED_CASES.json',{'file':selection['file'],'events':events,'completionOrSuccessNotAssumed':True})
     records=[]
     for relative in selection['requiredCandidateArtifacts']:
      p=scratch/'observations'/relative;records.append({'path':str(p),'present':p.is_file(),'bytes':p.stat().st_size if p.is_file() else None,'sha256':digest(p) if p.is_file() else None})
     write(directory/'CANDIDATE_RECORDS.json',{'records':records,'missingIsNotSuccess':True})
   population=checked_population(events,selection);populations.append(population)
   for relative in selection['requiredCandidateArtifacts']:
    p=scratch/'observations'/relative;assert p.is_file() and not p.is_symlink() and p.stat().st_size>0,relative
    assert isinstance(json.loads(p.read_text()),dict),'complete structured actual candidate required'
   write(directory/'COUNTS.json',population)
  focus=next(x for x in populations if x['partitionRole']=='semantic_focus')['topLevelNames']
  remainder=next(x for x in populations if x['partitionRole']=='semantic_remainder')['topLevelNames']
  assert not set(focus)&set(remainder),'focus duplicated in whole-file partition'
  assert sorted(focus+remainder)==sorted(semantic_population['topLevelTitles']),'complete immutable semantic-job population differs'
  write(proof/'POPULATION.json',{'commands':populations,'semanticJobWholeFilePartition':focus+remainder,'semanticSource':semantic_population['source'],'positiveNameSetAndDisjointnessVerified':True,'defaultLibraryPartialOnly':True,'historicalCredit':False})
 except BaseException as error:
  failure={'name':type(error).__name__,'message':str(error)};write(proof/'FIRST_FAILURE.json',failure)
 finally:
  def check(name,call):
   try:
    call();checks.append({'name':name,'matched':True})
   except BaseException as error:
    item={'name':type(error).__name__,'message':str(error),'stage':name};secondary.append(item);checks.append({'name':name,'matched':False,'error':item})
  def same(actual,expected):assert actual==expected
  if postimage is not None:
   def source_exit():
    value=source_inventory(head);write(proof/'SOURCE_EXIT.json',value);same(value,postimage)
   check('source_and_setup_custody',source_exit)
  check('controls',lambda:same(controls(launch,grant),controls_entry))
  check('launch_and_grant',lambda:same((digest(launchpath),digest(grantpath)),(launch_sha,grant_sha)))
  if inputs is not None:
   check('native_inputs',lambda:same(native_inputs(SOURCE),inputs['native']))
   check('original_fixture',lambda:same(fixtures(fixture['sourceRoot'],fixture),inputs['fixtures']))
   check('original_dependencies',lambda:same(deps.inventory(dependency['path'])['sha256'],dependency['inventorySha256']))
   check('native_launch',lambda:same(digest(launchpath),inputs['nativeLaunchSha256']))
   check('proof_grant',lambda:same(digest(grantpath),inputs['proofGrantSha256']))
   if tenant and (tenant/'node_modules').is_dir():check('copied_dependencies',lambda:same(deps.inventory(tenant/'node_modules')['sha256'],dependency['inventorySha256']))
   if subject and subject.is_dir():check('copied_fixture',lambda:fixtures(subject,fixture))
  if materialized is not None:check('non_generated_mirror_source',lambda:same(tree(subject,generated),materialized))
  if built is not None:
   def mirror_exit():
    rows=tree(subject,[str(REL/'node_modules')]);write(proof/'BUILD_EXIT.json',{'rows':rows});same(rows,built)
   check('built_mirror_through_tests',mirror_exit)
  if secondary:failure=failure or secondary[0]
  completed=datetime.datetime.now(datetime.timezone.utc);expired=time.monotonic()>=final_deadline or completed>=end
  if expired:failure=failure or {'name':'TimeoutError','message':'Original enclosing/proof deadline expired during finalization'}
  if failure is not None and not (proof/'FIRST_FAILURE.json').exists():write(proof/'FIRST_FAILURE.json',failure)
  result={'status':'passed' if failure is None else 'stopped_first_failure','sourceHead':head,'elapsedMs':round((time.monotonic()-start)*1000),'commands':commands,'failure':failure,'conservation':{'checks':checks,'secondaryErrors':secondary},'originalHostDeadlineUtc':enclosing.isoformat(),'proofDeadlineUtc':end.isoformat(),'finalDeadlineCheck':{'completedUtc':completed.isoformat(),'expired':expired,'wallAndMonotonic':True},'buildsAttempted':sum(x['name']=='001-build' for x in commands),'freshTestCommandsCompleted':len(populations),'qualified':False,'retry':False,'retainedProofCredit':False}
  write(proof/'RETURN.json',result);print(json.dumps({'phase':'proof-return','status':result['status'],'commands':len(commands),'failure':failure}),flush=True)
 return 0 if failure is None else 1
if __name__=='__main__':sys.exit(main())
