#!/usr/bin/env python3
"""One serial affected-file proof on retained exact compiled payload; no build/retry."""
import datetime,hashlib,importlib.util,json,os,shutil,subprocess,sys,time
from pathlib import Path
sys.dont_write_bytecode=True
HERE=Path('/private/tmp/abg-rc14-regression-repair-20261115-08/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc14-release-gap-01/regression-repair-08')
ACT=json.loads((HERE/'ACTIVATION.json').read_text())
SOURCE=Path(ACT['sourceWorktree']);RAW=Path(ACT['rawRoot']);REL=Path('build_tenants/abiogenesis/typescript')
NODE='/opt/homebrew/bin/node'

def module(name,filename):
 spec=importlib.util.spec_from_file_location(name,HERE/filename); m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
owner=module('finite_process','process-owner.py');deps=module('dependencies','dependency-inputs.py');custody=module('setup_custody','setup-custody.py')
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

def verify_inventory(root,rows):
 root=Path(root);actual=[]
 for p in sorted(root.rglob('*')):
  assert not p.is_symlink(),str(p)
  if p.is_file():actual.append({'path':str(p.relative_to(root)),'bytes':p.stat().st_size,'sha256':digest(p)})
 assert actual==rows,'complete inventory mismatch '+str(root)

def checked_population(events,selection):
 summaries=[x for x in events if x.get('type')=='summary' and x.get('file') is None]
 cases=[x for x in events if x.get('type')=='case' and not x.get('suite')]
 top=[x['name'] for x in cases if x.get('nesting')==0]
 assert len(summaries)==1 and summaries[0]['success'] is True and any(x.get('type')=='end' for x in events),summaries
 assert len(top)>=selection['minimumTopLevelCases'] and all(x in top for x in selection['preservedTitles']),('population conservation',selection['file'],top)
 assert cases and all(x['passed'] and not x.get('todo') for x in cases)
 skips={x['name']:x['skip'] for x in cases if x.get('skip')};expected=selection['optionalSkipReasonIncludes']
 assert set(skips)==set(expected) and all(expected[n] in str(v) for n,v in skips.items()),('required positive skipped or unexpected historical skip',skips)
 return {'file':selection['file'],'summary':summaries[0],'cases':cases,'requiredPositiveCasesExecuted':True}

def retained_proof_relation(postimage,reuse,retained,plan):
 relation=json.loads((HERE/'RETAINED_PROOF.json').read_text())
 assert relation['nativeWriteScope']==ACT['nativeWriteScope'] and len(ACT['nativeWriteScope'])==1
 assert len(relation['groups'])==5 and len(plan['retainedFiles'])==15
 package=json.loads((SOURCE/REL/'package.json').read_text());assert package['files']==['build/**','contracts/**','product-toolchain-manifest.json']
 selections={s['originalOrdinal']:s for s in plan['retainedFiles']};observations=[];groups=[]
 def pinned(row):
  p=Path(row['path']);assert p.is_file() and not p.is_symlink() and p.stat().st_size==row['bytes'] and digest(p)==row['sha256'],row['path']
 def projection(rows,excluded,definitions=False):
  return {x['path']:(x['bytes'],x['sha256'],x['executable']) for x in rows if x['path'] not in excluded and
   (x['path'].startswith(str(REL)+'/') or definitions and (x['path'].startswith('specification/') or x['path'] in ['AGENTS.md','CLAUDE.md','stdo_abiogenesis.json']))}
 for group in relation['groups']:
  for name in ['sourcePostimage','proofReturn','reuseInputs','originalProofRunner','historicalInputs']:pinned(group[name])
  prior=bound_json(group['sourcePostimage']);returned=bound_json(group['proofReturn']);inputs=bound_json(group['reuseInputs']);historical=bound_json(group['historicalInputs'])
  assert historical['sourceRoot']==retained['sourceRoot'] and len(historical['files']) in [7,8]
  assert inputs['requiredInputs']==historical['files'],'historical acquisition packet changed'
  current={r['path']:r for r in retained['files']};old={r['path']:r for r in historical['files']}
  assert len(current)==len(retained['files'])==8 and len(old)==len(historical['files'])
  assert all(current.get(k)==v for k,v in old.items()),'historical input bytes replaced'
  bridge='comments/codex/20260909_D1_LIFECYCLE/native-stage-implementation-01/live-04/bridge-first-cause-01/bridge-input.json'
  assert set(current)-set(old)==({bridge} if len(old)==7 else set()),'undeclared input extension'
  f09='build_tenants/abiogenesis/typescript/test_env/falsifiers/runtime-f09-worker.mjs'
  diagnostic=group['id'] in ['diagnostic01-file011','diagnostic02-files012-016']
  if diagnostic:
   assert group['excludedChangedPaths']==ACT['nativeWriteScope']
   for name in ['sourceExit','mirrorEntry','mirrorExit','inputExit','controlManifest','controlInputs','diagnosticActivation','binding','controlStart','topologyReturn','topologyObservation','originalSetupCustody','originalSourcePostimage']:pinned(group[name])
   binding=bound_json(group['binding']);manifest=bound_json(group['controlManifest']);packet=bound_json(group['controlInputs']);activation=bound_json(group['diagnosticActivation'])
   assert binding['executionAuthorized'] is True and binding['sourceCommit']==activation['sourceCommit']==group['sourceCommitAtRun']
   assert binding['controlManifestSha256']==group['controlManifest']['sha256'] and binding['oldCampaignClockReused'] is False
   for row in manifest['files']:pinned({**row,'path':str(Path(group['controlManifest']['path']).parent/row['path'])})
   for row in [*packet['retainedControls'],*packet['records'].values(),packet['builderPin'],packet['node'],packet['python'],activation['authority']]:pinned(row)
   assert inputs['controls']==bound_json(group['inputExit']) and inputs['controls']['allPinsMatched'] is True
   assert inputs['controls']['manifestSha256']==group['controlManifest']['sha256'] and inputs['controls']['bindingSha256']==group['binding']['sha256']
   assert prior==bound_json(group['sourceExit']) and prior['head']==group['sourceCommitAtRun'] and prior['tree']==group['sourceTreeAtRun']
   assert prior['rows']==bound_json(group['originalSourcePostimage'])['rows']
   assert prior['setup']['verified'] is True and prior['setup']['custodyRecordSha256']==group['originalSetupCustody']['sha256']
   setup=bound_json(group['originalSetupCustody']);assert prior['setup']['bytes']==setup['bytes'] and prior['setup']['sha256']==setup['sha256']
   assert prior['originalAuthorHead']==activation['originalAuthorHead']==setup['sourceHead']
   derived={str(REL/r['path']):r for r in reuse['derivedPayloadOutputs']};expected_mirror=[]
   for row in prior['rows']:
    name=row['path']
    if not (name.startswith(str(REL)+'/') or name.startswith('specification/') or name in ['AGENTS.md','CLAUDE.md','stdo_abiogenesis.json']):continue
    expected_mirror.append({**row,**({k:derived[name][k] for k in ['bytes','sha256']} if name in derived else {})})
   mirror=bound_json(group['mirrorEntry']);assert mirror==bound_json(group['mirrorExit']) and mirror['rows']==expected_mirror
   topology=bound_json(group['topologyObservation']);topology_return=bound_json(group['topologyReturn'])
   assert topology['ok'] is True and topology['disposition']=='separated' and topology_return['exitCode']==0 and topology_return['cleanup']['processGroupAbsent'] is True
   assert returned['sourceCommit']==group['sourceCommitAtRun'] and returned['sourceUnchanged'] is True and returned['mirrorSourceConserved'] is True
   assert returned['expired'] is False and returned['secondaryErrors']==[] and returned['providerCalls']==0 and returned['builds']==0
   assert returned['retry'] is False and returned['qualified'] is False and returned['deadlineUtc']==binding['deadlineUtc']==bound_json(group['controlStart'])['deadlineUtc']
   final=returned['conservation'];assert final['status']=='matched' and len(final['checks'])==8+2*len(historical['files']) and all(x['matched'] for x in final['checks'])
   assert final['secondaryErrors']==[] and final['withinOriginalDeadline'] is True
   assert inputs['dependencies']==json.loads((HERE/'DEPENDENCY_INPUTS.json').read_text())['inventorySha256'] and inputs['derived']==reuse['derivedPayloadOutputs']
   conservation_kind='diagnostic_original_finally';conservation_sha=group['proofReturn']['sha256']
  else:
   if group['id']=='native07-files007-009':
    assert group['excludedChangedPaths']==ACT['nativeWriteScope']
    pinned(group['proofReentry']);pinned(group['proofClosure'])
    reentry=bound_json(group['proofReentry']);closure=bound_json(group['proofClosure'])
    assert reentry['retry'] is False and reentry['qualified'] is False
    assert closure['return']['sha256']==group['proofReturn']['sha256']
    final=returned['conservation']['finalInputConservation']
    assert final['status']=='matched' and len(final['checks'])==22 and all(x['matched'] for x in final['checks'])
    assert final['secondaryErrors']==[] and final['withinOriginalDeadline'] is True
    conservation_kind='original_finally';conservation_sha=group['proofReturn']['sha256']
   else:
    pinned(group['postFailureConservation']);pinned(group['comparisonRunner']);late=bound_json(group['postFailureConservation'])
    if group['id']=='native05-files001-002':
     assert late['originalControls']['runnerSha256']==group['originalProofRunner']['sha256']
     assert late['proofReturn']['sha256']==group['proofReturn']['sha256']
     assert group['excludedChangedPaths']==['build_tenants/abiogenesis/typescript/test_env/tests/t287-single-address-space-consolidation.test.mjs',f09,*ACT['nativeWriteScope']]
    else:
     assert group['id']=='native06-files003-006' and group['excludedChangedPaths']==[f09,*ACT['nativeWriteScope']]
     assert late['originalProofReturn']['sha256']==group['proofReturn']['sha256'] and late['originalProofReturn']['unchanged'] is True
     assert any(r['path']==group['comparisonRunner']['path'] and r['sha256']==group['comparisonRunner']['sha256'] for r in late['pins'])
     pinned(group['proofReentry']);reentry=bound_json(group['proofReentry'])
     assert reentry['retry'] is False and reentry['qualified'] is False
    assert late['status']=='matched' and late['failure'] is None and len(late['checks'])==22 and all(x['matched'] for x in late['checks'])
    conservation_kind='late_read_only_observation';conservation_sha=group['postFailureConservation']['sha256']
   assert returned['status']=='stopped_first_failure' and returned['sourceHead']==group['sourceCommitAtRun']
   assert returned['conservation']['sourceUnchangedThroughProof'] and returned['conservation']['setupCustodyReverified']
   assert returned['finalDeadlineCheck']['expired'] is False and inputs['derivedPayloadOutputs']==reuse['derivedPayloadOutputs']
  assert returned['status']==group['expectedCampaignStatus']
  assert inputs['buildInventorySha256']==reuse['buildInventory']['sha256'] and inputs['sourceInputsSha256']==reuse['sourceInputs']['sha256']
  excluded=set(group['excludedChangedPaths'])
  assert projection(prior['rows'],excluded,diagnostic)==projection(postimage['rows'],excluded,diagnostic),'retained proof causal source/support/input drift '+group['id']
  group_observations=[]
  for row in group['rows']:
   selection=selections[row['originalOrdinal']];assert row['file']==selection['file']
   records={}
   for name,record in row['records'].items():
    pinned(record)
    if name.endswith('.json'):records[name]=json.loads(Path(record['path']).read_text())
   receipt=records['RETURN.json'];assert receipt['exitCode']==0 and receipt['stopReason'] is None and receipt['cleanup']['processGroupAbsent']
   for stream in ['stdout.raw','stderr.raw']:assert receipt[stream]['sha256']==row['records'][stream]['sha256'] and receipt[stream]['bytes']==row['records'][stream]['bytes']
   events=[json.loads(line) for line in Path(row['records']['stdout.raw']['path']).read_text().splitlines()]
   assert records['OBSERVED_CASES.json']['events']==events
   checked=checked_population(events,selection);assert records['COUNTS.json']==checked
   assert records['START.json']['argv']==[NODE,'--experimental-vm-modules','--test','--test-concurrency=1','--test-timeout=1790000','--test-reporter=./scripts/node-test-evidence-reporter.mjs','test_env/tests/'+selection['file']]
   if diagnostic:assert records['START.json']['cwd']==group['proofTenant']
   assert next(x for x in events if x['type']=='begin')['nodeVersion']=='v24.7.0'
   if selection.get('requiredCandidateArtifacts'):
    pinned(row['candidateRecords']);candidates=bound_json(row['candidateRecords'])['records']
    assert all(x['present'] for x in candidates)
    assert [{k:v for k,v in r.items() if k!='present'} for r in candidates]==row['candidates']
    assert [Path(r['path']).name for r in candidates]==selection['requiredCandidateArtifacts']
    for candidate in row['candidates']:pinned(candidate);assert isinstance(json.loads(Path(candidate['path']).read_text()),dict)
   skips=[{'name':x['name'],'reason':x['skip']} for x in checked['cases'] if x.get('skip')]
   group_observations.append({'file':selection['file'],'sourceSha256':selection['preimageSha256'],'originalReturnSha256':row['records']['RETURN.json']['sha256'],'cases':sum(not x.get('skip') for x in checked['cases']),'skips':skips,'declaredCases':len(checked['cases']),'topLevelCases':sum(x.get('nesting')==0 for x in checked['cases']),'disposition':'retained_original_whole_file_not_reexecuted'})
  assert sum(x['cases'] for x in group_observations)==group['expectedPasses']
  assert sum(len(x['skips']) for x in group_observations)==group['expectedSkips']
  assert sum(x['topLevelCases'] for x in group_observations)==group['expectedTopLevelCases']
  groups.append({'id':group['id'],'originalSourceHead':group['sourceCommitAtRun'],'conservationObservation':conservation_kind,'conservationSha256':conservation_sha,'historicalInputCount':len(historical['files']),'originalCampaignPassed':returned['status']=='passed','files':group_observations})
  observations.extend(group_observations)
 assert len(observations)==15 and sum(x['cases'] for x in observations)==83 and sum(len(x['skips']) for x in observations)==1 and sum(x['topLevelCases'] for x in observations)==64
 return {'sourceOutsideDeclaredHistoricalTransitionsMatched':True,'compiledAndDependencyInputs':'verified by enclosing existing input owners','groups':groups,'retainedHistoricalPasses':83,'retainedHistoricalSkips':1,'originalCampaignsAllPassed':all(g['originalCampaignPassed'] for g in groups),'qualified':False}

def final_input_conservation(reuse,build,dependency,retained,tenant,evidence,end_monotonic,end_utc):
 # Same original comparisons, now reached from finally for initialized fixtures.
 # Each retained result is separate; the primary proof error is never replaced.
 checks=[];errors=[]
 def check(kind,path,expected,observe):
  row={'kind':kind,'path':str(path),'expected':expected}
  try:
   assert time.monotonic()<end_monotonic and datetime.datetime.now(datetime.timezone.utc)<end_utc,'original proof deadline reached before final input observation'
   actual=observe();row.update({'actual':actual,'matched':actual==expected});assert row['matched'],'final input conservation mismatch '+str(path)
  except BaseException as error:
   row.update({'matched':False,'error':{'name':type(error).__name__,'message':str(error)}});errors.append(row['error'])
  checks.append(row)
 def build_observation(root):
  verify_inventory(root,build['rows']);return {'files':len(build['rows']),'bytes':sum(r['bytes'] for r in build['rows']),'inventorySha256':reuse['buildInventory']['sha256']}
 expected={'files':len(build['rows']),'bytes':sum(r['bytes'] for r in build['rows']),'inventorySha256':reuse['buildInventory']['sha256']}
 for root in [Path(reuse['buildRoot']),tenant/'build']:check('build',root,expected,lambda root=root:build_observation(root))
 for row in reuse['derivedPayloadOutputs']:
  for path in [Path(row['source']),tenant/row['path']]:check('derived',path,row['sha256'],lambda path=path:digest(path))
 for root in [Path(dependency['path']),tenant/'node_modules']:check('dependencies',root,dependency['inventorySha256'],lambda root=root:deps.inventory(root)['sha256'])
 for row in retained['files']:
  for path in [Path(retained['sourceRoot'])/row['path'],evidence/row['path']]:check('retained_input',path,row['sha256'].removeprefix('sha256:'),lambda path=path:digest(path))
 assert len(retained['files'])==8 and len(checks)==24
 return {'status':'matched' if not errors else 'failed','checks':checks,'secondaryErrors':errors,'observedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'withinOriginalDeadline':time.monotonic()<end_monotonic and datetime.datetime.now(datetime.timezone.utc)<end_utc}

def proof_layout(subject,source,dependency_root,prior_proof_root,installed_root,release_root,raw,proof):
 # Every actual destination is a strict child: authority files, specification,
 # and the whole build_tenants subtree (tenant source/build/dependencies).
 return {'worksite':str(subject),'writePaths':[str(subject/p) for p in ['AGENTS.md','CLAUDE.md','stdo_abiogenesis.json','specification','build_tenants']],
         'protectedRoots':[str(source),str(dependency_root),str(prior_proof_root),str(installed_root),str(release_root),str(raw/'runtime')],
         'archiveRoot':str(proof)}

def require_proof_reentry(launchpath,launch,authoritypath):
 successor=Path(__file__).resolve().parent;authoritypath=Path(authoritypath)
 authority=json.loads(authoritypath.read_text());manifestpath=successor/'CONTROL_MANIFEST.json'
 assert authority['id']=='RC14-NATIVE08-PROOF-REENTRY-01' and authority['executionAuthorized'] is True
 assert digest(manifestpath)==authority['controlManifestSha256']
 manifest=json.loads(manifestpath.read_text())
 for row in manifest['files']:
  p=successor/row['path'];assert p.is_file() and not p.is_symlink() and p.stat().st_size==row['bytes'] and digest(p)==row['sha256'],row['path']
 template=json.loads((successor/'ROOT_AUTHORITY.template.json').read_text())
 assert all(authority.get(k)==v for k,v in template.items() if k not in ['executionAuthorized','controlManifestSha256','note']),'Root authority differs from exact proposed input bindings'
 original=manifest['originalControls']
 assert original['path']==str(HERE) and digest(HERE/'CONTROL_MANIFEST.json')==original['manifestSha256'] and digest(HERE/'prove.py')==original['runnerSha256']
 auditpath=successor/'AUTHOR_AUDIT.json';audit=json.loads(auditpath.read_text())
 assert digest(auditpath)==authority['auditSha256']==digest(RAW/'AUTHOR_AUDIT.json'),'retain exact actual audit'
 assert audit['disposition']=='closed_with_disclosed_read_scope_variances_pending_root'
 variance_ids=['native08-readonly-metadata-outside-declared-files','native08-directory-grep-query-scope']
 assert [v['id'] for v in audit['deviations']]==variance_ids
 assert audit['deviations'][0]['callId']=='toolu_019LRJ3aaFBCDXNhVE8QssWh' and len(audit['deviations'][0]['observedPaths'])==10
 assert audit['deviations'][1]['callIds']==['toolu_01NVpmEv7YcYFAMaSA9cPgHk','toolu_01UV33QKKA47Ec3fFv2mhDKL']
 assert audit['fullMethodAndCommandComplianceClaim'] is False and audit['proofAuthorized'] is False and audit['noRetry'] is True
 assert audit['selectedMethodContentVerified'] is True and audit['allReadFirstHaveActualPreEditContent'] is True and audit['projection002CompleteBeforeEdit'] is True and audit['actualResourceAndGroupsClosed'] is True
 for row in [audit['observation'],audit['authorReport'],audit['capture'],audit['sourceFreeze'],audit['sourcePostimage'],*audit['closePins']]:
  p=Path(row['path']);assert p.is_file() and not p.is_symlink() and p.stat().st_size==row['bytes'] and digest(p)==row['sha256'],row['path']
 observed=json.loads(Path(audit['observation']['path']).read_text())
 assert authority['originalObservationSha256']==audit['observation']['sha256'] and observed['deviations']==audit['deviations']
 assert observed['sourceHead']==audit['sourceHead'] and observed['contentMismatches']==[] and observed['offScopeDirectReads']==[]
 assert len(observed['methodSectionCoverage'])==5 and all(x['missingLines']==[] and x['verifiedRequiredLines']==x['requiredLines'] for x in observed['methodSectionCoverage'])
 frozen=json.loads(Path(audit['sourceFreeze']['path']).read_text())
 assert frozen['sourceHead']==audit['sourceHead'] and frozen['sourcePostimage']==audit['sourcePostimage'] and frozen['sourceDiff']['sha256']==audit['sourceDiffSha256']
 assert frozen['actualTypedCompletionVerified'] is True and frozen['hostProcessGroupAbsent'] is True and frozen['actorProcessGroupAbsent'] is True and frozen['closePins']==audit['closePins']
 assert len(frozen['rows'])==1 and frozen['rows'][0]['path']==ACT['nativeWriteScope'][0] and observed['sourceScope']['sourceRow']==frozen['rows'][0]
 row=frozen['rows'][0];p=SOURCE/row['path'];assert p.is_file() and not p.is_symlink() and p.stat().st_size==row['bytes'] and digest(p)==row['sha256']
 assert authority['acceptedReadScopeVarianceIds']==variance_ids and authority['varianceRemainsDisclosed'] is True and authority['fullLiteralCompliance'] is False
 disposition=authority['auditDisposition'];dispositionpath=Path(disposition['path'])
 assert dispositionpath.is_file() and not dispositionpath.is_symlink() and dispositionpath.stat().st_size==disposition['bytes'] and digest(dispositionpath)==disposition['sha256']
 decided=json.loads(dispositionpath.read_text())
 assert decided['disposition']=='admitted_for_bounded_component_proof' and decided['rootProofPermission'] is True
 assert decided['sourceHead']==audit['sourceHead'] and decided['sourceDiffSha256']==audit['sourceDiffSha256'] and decided['launchSha256']==audit['launchSha256']
 assert decided['audit']['sha256']==digest(auditpath) and decided['observation']==audit['observation'] and decided['authorReport']==audit['authorReport'] and decided['sourcePostimage']==audit['sourcePostimage']
 assert decided['acceptedDeviationIds']==variance_ids and decided['auditDeviationsPreserved'] is True and decided['fullLiteralCompliance'] is False and decided['qualified'] is False
 assert decided['selectedMethodContentVerified'] is True and decided['sourceWriteScopeConserved'] is True
 assert authority['sourceHead']==audit['sourceHead']==launch['sourceHead'] and authority['sourceDiffSha256']==audit['sourceDiffSha256']
 assert authority['sourcePostimageSha256']==audit['sourcePostimage']['sha256'] and authority['launchSha256']==audit['launchSha256']==digest(launchpath)
 review=authority['sourceReview'];assert review==decided['sourceReview']
 reviewpath=Path(review['path']);assert reviewpath.is_file() and not reviewpath.is_symlink() and reviewpath.stat().st_size==review['bytes'] and digest(reviewpath)==review['sha256']
 reviewed=json.loads(reviewpath.read_text())
 assert reviewed['diff']['sha256']==audit['sourceDiffSha256'] and reviewed['sourceHead']==audit['sourceHead'] and reviewed['postimage']['sha256']==audit['sourcePostimage']['sha256']
 assert reviewed['freeze']['sha256']==audit['sourceFreeze']['sha256'] and reviewed['source']=={k:v for k,v in row.items() if k!='executable'}
 assert reviewed['disposition']=='bounded_source_relation_satisfied' and reviewed['findings']==[] and reviewed['qualified'] is False
 control=json.loads((RAW/'CONTROL_START.json').read_text())
 assert authority['originalHostDeadlineUtc']==control['deadlineUtc']==decided['proof']['originalHostDeadlineUtc']=='2026-11-15T16:37:49.211017+00:00'
 assert decided['proof']['freshOrdinals']==[10] and decided['proof']['retainedFiles']==15 and decided['proof']['maximumMs']==ACT['limits']['proofCampaignMs'] and decided['proof']['cleanupReserveMs']==ACT['limits']['cleanupReserveMs']
 assert decided['proof']['clipToOriginalHostDeadline'] is True and decided['proof']['finalInputComparisons']==24 and decided['proof']['firstFailureStop'] is True and decided['proof']['retry'] is False
 assert authority['proofRoot']==str(RAW/'proof-01') and authority['proofSubject']==json.loads((HERE/'LAYOUT.json').read_text())['proofSubject']
 assert authority['retry'] is False and authority['qualified'] is False
 return audit,{'authority':{'path':str(authoritypath),'sha256':digest(authoritypath)},'controlManifestSha256':digest(manifestpath),'auditSha256':digest(auditpath),'sourceReview':review,'auditDisposition':disposition,'disclosedReadScopeVariances':audit['deviations'],'fullLiteralCompliance':False,'originalHostDeadlineUtc':control['deadlineUtc'],'retry':False,'qualified':False}

def main():
 assert len(sys.argv)==3,'original launch and separately accepted Root proof authority required'
 launchpath=Path(sys.argv[1]);launch=json.loads(launchpath.read_text());head=launch['sourceHead']
 assert launch['activationId']==ACT['id'] and launch['dispatchAuthorized'] is True
 for row in launch['controls']:assert digest(HERE/row['path'])==row['sha256'],row['path']
 host=json.loads((RAW/'HOST_RETURN.json').read_text());final=json.loads((RAW/'runtime/FINAL.json').read_text());native=json.loads((RAW/'runtime/NATIVE_RETURN.json').read_text())
 assert host['exitCode']==0 and host['stopReason'] is None and host['cleanup']['hostProcessGroupAbsent']
 assert final['launched'] and final['actualResourceClose'] and final['failure'] is None and final['readbackFailure'] is None
 require_author_completion(native,final)
 audit,reentry=require_proof_reentry(launchpath,launch,sys.argv[2])
 proof=RAW/'proof-01';proof.mkdir()
 write(proof/'PROOF_REENTRY.json',reentry)
 start=time.monotonic();now=datetime.datetime.now(datetime.timezone.utc)
 control=json.loads((RAW/'CONTROL_START.json').read_text());assert control['sourceHead']==head and control['oldCampaignClockReused'] is False
 enclosing=datetime.datetime.fromisoformat(control['deadlineUtc']);requested=now+datetime.timedelta(milliseconds=ACT['limits']['proofCampaignMs']);end=min(enclosing,requested)
 stop=end-datetime.timedelta(milliseconds=ACT['limits']['cleanupReserveMs']);deadline=start+(stop-now).total_seconds()
 commands=[];postimage=None;failure=None;conservation=None;retained_relation=None;inputs_initialized=False;input_conservation=None;secondary_conservation_errors=[]
 try:
  write(proof/'START.json',{'sourceHead':head,'startedUtc':now.isoformat(),'originalHostDeadlineUtc':enclosing.isoformat(),'requestedProofDeadlineUtc':requested.isoformat(),'deadlineUtc':end.isoformat(),'executionStopDeadlineUtc':stop.isoformat(),'cleanupReserveMs':ACT['limits']['cleanupReserveMs'],'noRetry':True,'qualified':False})
  assert time.monotonic()<deadline,'no remaining enclosing proof time'
  postimage=source_inventory(head);write(proof/'SOURCE_POSTIMAGE.json',postimage)
  assert audit['sourceDiffSha256']==hashlib.sha256(subprocess.check_output(['/usr/bin/git','-C',str(SOURCE),'diff','--binary','HEAD','--',*ACT['nativeWriteScope']])).hexdigest()
  dependency=json.loads((HERE/'DEPENDENCY_INPUTS.json').read_text());assert deps.inventory(dependency['path'])['sha256']==dependency['inventorySha256'];assert digest(SOURCE/REL/'package-lock.json')==dependency['lockSha256']
  reuse=json.loads((HERE/'BUILD_REUSE.json').read_text());build=bound_json(reuse['buildInventory']);source_inputs=bound_json(reuse['sourceInputs']);bound_json(reuse['priorSourcePostimage'])
  assert bound_json(reuse['priorBuildReturn'])['exitCode']==0
  bound_json(reuse['priorCampaignReturn'])
  assert reuse['exceptionPaths']==ACT['buildReuseExceptionPaths'] and len(reuse['exceptionPaths'])==17
  assert set(ACT['nativeWriteScope'])<=set(reuse['exceptionPaths'])
  for row in source_inputs['rows']:
   if row['path'] not in reuse['exceptionPaths']:assert digest(SOURCE/row['path'])==row['sha256'],row['path']
  preimage={r['path']:r for r in json.loads((RAW/'SOURCE_PREIMAGE.json').read_text())['rows']}
  for row in json.loads((HERE/'PRIOR_PARTIAL_SOURCE.json').read_text())['rows']:
   assert preimage[row['path']]['sha256']==row['sha256'],'accepted prior input '+row['path']
   if row['path'] not in ACT['nativeWriteScope']:assert digest(SOURCE/row['path'])==row['sha256'],'immutable prior source '+row['path']
  verify_inventory(reuse['buildRoot'],build['rows'])
  for row in reuse['derivedPayloadOutputs']:assert Path(row['source']).stat().st_size==row['bytes'] and digest(row['source'])==row['sha256']
  subject=Path(json.loads((HERE/'LAYOUT.json').read_text())['proofSubject']);assert not subject.exists(),'fresh proof subject only'
  pin=bound_json(ACT['builderPin'])
  layout=proof_layout(subject,SOURCE,Path(dependency['path']),Path(reuse['priorProofRoot']),Path(pin['installedRoot']),Path(pin['releaseRoot']),RAW,proof)
  write(proof/'TOPOLOGY_LAYOUT.json',layout)
  topology=json.loads(subprocess.check_output(['/usr/bin/python3',str(HERE/'physical-topology.py'),'-'],input=json.dumps(layout).encode(),timeout=60))
  write(proof/'TOPOLOGY.json',topology);assert topology['ok'] is True and topology['disposition']=='separated'
  subject.mkdir()
  for name in ['AGENTS.md','CLAUDE.md','stdo_abiogenesis.json']:shutil.copy2(SOURCE/name,subject/name)
  shutil.copytree(SOURCE/'specification',subject/'specification')
  tenant=subject/REL;tenant.parent.mkdir(parents=True);shutil.copytree(SOURCE/REL,tenant,ignore=shutil.ignore_patterns('node_modules','build','artifacts','qualification-scratch'))
  shutil.copytree(dependency['path'],tenant/'node_modules',symlinks=True);assert deps.inventory(tenant/'node_modules')['sha256']==dependency['inventorySha256']
  shutil.copytree(reuse['buildRoot'],tenant/'build');verify_inventory(tenant/'build',build['rows'])
  for row in reuse['derivedPayloadOutputs']:shutil.copy2(row['source'],tenant/row['path']);assert digest(tenant/row['path'])==row['sha256']
  retained=json.loads((HERE/'RETAINED_INPUTS.json').read_text());evidence=proof/'retained-inputs';evidence.mkdir()
  plan=json.loads((HERE/'PROOF_PLAN.json').read_text())
  retained_relation=retained_proof_relation(postimage,reuse,retained,plan);write(proof/'RETAINED_PROOF_RELATION.json',retained_relation)
  for row in retained['files']:
   src=Path(retained['sourceRoot'])/row['path'];dst=evidence/row['path'];assert src.stat().st_size==row['bytes'] and digest(src)==row['sha256'].removeprefix('sha256:')
   dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst);assert digest(dst)==digest(src)
  inputs_initialized=True
  write(proof/'REUSE_AND_INPUTS_VERIFIED.json',{'buildInventorySha256':reuse['buildInventory']['sha256'],'sourceInputsSha256':reuse['sourceInputs']['sha256'],'derivedPayloadOutputs':reuse['derivedPayloadOutputs'],'requiredInputs':retained['files'],'priorProofUnchanged':True,'scope':'same exact compiled Product/native/dependencies with fresh selected test/falsifier source; no rebuild/requalification'})
  scratch=proof/'scratch'
  for suffix in ['tmp','npm-cache','observations','governance','currentness','c0']:(scratch/suffix).mkdir(parents=True)
  (scratch/'user.npmrc').write_text('');(scratch/'global.npmrc').write_text('')
  env={'HOME':'/Users/jim','PATH':'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin','LANG':'en_US.UTF-8','LC_ALL':'en_US.UTF-8','TMPDIR':str(scratch/'tmp'),'NODE_OPTIONS':'','GIT_OPTIONAL_LOCKS':'0','STDO_STORE':'/Users/jim/Library/Application Support/STDO','NPM_CONFIG_OFFLINE':'true','NPM_CONFIG_UPDATE_NOTIFIER':'false','NPM_CONFIG_USERCONFIG':str(scratch/'user.npmrc'),'NPM_CONFIG_GLOBALCONFIG':str(scratch/'global.npmrc'),'NPM_CONFIG_CACHE':str(scratch/'npm-cache'),'ABI5_EVIDENCE_ROOT':str(evidence),'ABG_REGRESSION_PROOF_ROOT':str(scratch/'observations'),'ABG_GOVERNANCE_COVERED_PROOF_ROOT':str(scratch/'governance'),'ABG_U1_EVIDENCE_DIR':str(scratch/'currentness'),'ABG_C0_PROOF_ROOT':str(scratch/'c0'),'ABI5_STEEL03_CLOSURE_PROOF_PATH':str(scratch/'steel-closure.json')}
  def run(name,argv,budget):
   assert shutil.disk_usage(RAW).free>ACT['limits']['reserveBytes']
   try:return owner.run(proof/name,argv,tenant,env,budget/1000,ACT['limits']['outputBytesPerCommand'],deadline)
   finally:
    receipt=proof/name/'RETURN.json'
    if receipt.is_file():
     result=json.loads(receipt.read_text());commands.append({'name':name,**result});print(json.dumps({'phase':'proof-command-return','name':name,'exitCode':result['exitCode'],'elapsedMs':result['elapsedMs']}),flush=True)
  for i,relative in enumerate(postimage['nativeChangedPaths'],1):run(f'syntax-{i:02d}',[NODE,'--check',str(subject/relative)],ACT['limits']['perStaticMs'])
  plan=json.loads((HERE/'PROOF_PLAN.json').read_text())
  assert len(plan['files'])==1 and [x['originalOrdinal'] for x in plan['files']]==[10]
  for selection in plan['files']:
   i=selection['originalOrdinal'];name=f'{i:03d}-'+selection['file'].removesuffix('.test.mjs');directory=proof/name
   try:run(name,[NODE,'--experimental-vm-modules','--test','--test-concurrency=1','--test-timeout=1790000','--test-reporter=./scripts/node-test-evidence-reporter.mjs','test_env/tests/'+selection['file']],ACT['limits']['perTestFileMs'])
   finally:
    events=[]
    if (directory/'stdout.raw').is_file():
     for line in (directory/'stdout.raw').read_text(errors='replace').splitlines():
      try:value=json.loads(line)
      except (ValueError,TypeError):continue
      if isinstance(value,dict):events.append(value)
    if directory.is_dir():write(directory/'OBSERVED_CASES.json',{'file':selection['file'],'events':events,'completionOrSuccessNotAssumed':True})
    if directory.is_dir() and selection.get('requiredCandidateArtifacts'):
     captured=[]
     for relative in selection['requiredCandidateArtifacts']:
      candidate=scratch/'observations'/relative
      captured.append({'path':str(candidate),'present':candidate.is_file(),'bytes':candidate.stat().st_size if candidate.is_file() else None,'sha256':digest(candidate) if candidate.is_file() else None})
     write(directory/'CANDIDATE_RECORDS.json',{'records':captured,'missingIsNotSuccess':True})
   checked=checked_population(events,selection)
   for relative in selection.get('requiredCandidateArtifacts',[]):
    candidate=scratch/'observations'/relative
    assert candidate.is_file() and not candidate.is_symlink() and candidate.stat().st_size>0,'full preassert candidate missing '+relative
    assert isinstance(json.loads(candidate.read_text()),dict),'candidate must retain a complete structured record '+relative
   write(directory/'COUNTS.json',checked)
 except BaseException as error:
  failure={'name':type(error).__name__,'message':str(error)};write(proof/'FIRST_FAILURE.json',failure)
 finally:
  # Fully initialized fixture payload conservation runs even after first red.
  # Leave all prior FIRST_FAILURE bytes untouched; secondary errors are separate.
  if inputs_initialized:
   try:
    input_conservation=final_input_conservation(reuse,build,dependency,retained,tenant,evidence,start+(end-now).total_seconds(),end)
    secondary_conservation_errors.extend(input_conservation['secondaryErrors'])
   except BaseException as error:
    secondary_conservation_errors.append({'name':type(error).__name__,'message':str(error),'stage':'final_input_conservation'})
    input_conservation={'status':'failed','unexpectedError':secondary_conservation_errors[-1]}
  else:input_conservation={'status':'not_initialized','reason':'Complete fixture input copies were not established; no final input conservation claim'}
  try:
   if postimage is not None:assert source_inventory(head)==postimage
   conservation={'sourceUnchangedThroughProof':postimage is not None,'setupCustodyReverified':postimage is not None}
  except BaseException as error:
   conservation={'sourceUnchangedThroughProof':False,'error':str(error)}
   secondary_conservation_errors.append({'name':type(error).__name__,'message':str(error),'stage':'source_setup_custody'})
  conservation['fixtureInputsInitialized']=inputs_initialized
  conservation['finalInputConservation']=input_conservation
  conservation['secondaryConservationErrors']=secondary_conservation_errors
  if secondary_conservation_errors:failure=failure or secondary_conservation_errors[0]
  if failure is not None and not (proof/'FIRST_FAILURE.json').exists():write(proof/'FIRST_FAILURE.json',failure)
  completed=time.monotonic();completed_utc=datetime.datetime.now(datetime.timezone.utc)
  expired=completed>=start+(end-now).total_seconds() or completed_utc>=end
  if expired:
   failure=failure or {'name':'TimeoutError','message':'Original minimum host/proof deadline expired during finalization'}
   if not (proof/'FIRST_FAILURE.json').exists():write(proof/'FIRST_FAILURE.json',failure)
  result={'status':'passed' if failure is None else 'stopped_first_failure','sourceHead':head,'elapsedMs':round((time.monotonic()-start)*1000),'commands':commands,'failure':failure,'conservation':conservation,'originalHostDeadlineUtc':enclosing.isoformat(),'proofDeadlineUtc':end.isoformat(),'qualified':False,'retry':False,'retainedProofRelation':retained_relation,'freshFilePopulation':1,'retainedFilePopulation':15}
  result['finalDeadlineCheck']={'completedUtc':completed_utc.isoformat(),'expired':expired,'wallAndMonotonic':True}
  write(proof/'RETURN.json',result);print(json.dumps({'phase':'proof-return','status':result['status'],'commands':len(commands),'failure':failure}),flush=True)
 return 0 if failure is None else 1
if __name__=='__main__':sys.exit(main())
