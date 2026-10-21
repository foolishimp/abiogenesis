from pathlib import Path
import json,hashlib,stat,os,collections
R=Path('/Users/jim/src/apps/abiogenesis');W=Path(__file__).resolve().parent;O=W.parent/'c0-potential-effect-successor-03';F=W.parent/'c0-potential-effect-successor-04';P=Path('/private/tmp/abg-c0-potential-25ac62e990e141ce/successor-05');T=Path('build_tenants/abiogenesis/typescript')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(n,x):
 with (W/n).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
def row(p,name):
 s=p.lstat();x={'path':str(name),'kind':'symlink' if p.is_symlink() else 'file','mode':oct(stat.S_IMODE(s.st_mode))}
 if p.is_symlink():x['target']=os.readlink(p)
 else:x.update(bytes=s.st_size,sha256=sha(p))
 return x
def inventory(root):return [row(p,p.relative_to(root)) for p in sorted(root.rglob('*')) if p.is_file() or p.is_symlink()]
def verify(p,x):
 a=row(p,x['path'])
 for k in ['kind','mode','bytes','sha256','target']:
  if k in x:assert a[k]==x[k],(str(p),k)
assert not (W/'freeze.json').exists();stop=json.loads((W/'STOP.json').read_text());assert stop['command']=='unavailable-owner'
assert json.loads((W/'commands/sunny-owner.result.json').read_text())['exitCode']==0
assert len(list((W/'commands').glob('*.request.json')))==5
assert not (W/'commands/append-install.request.json').exists()
preserved=[]
for root,expected in [(O,'cfed5ef7e736ec6ff24005290c23cb0e30a39e64266ca8a2e2806f4493ae20f9'),(F,'e5f71d9556cece8fb43eff69ad2f069de861fe90ac3de62b2f5060e1b3223bce')]:
 assert sha(root/'freeze.json')==expected;f=json.loads((root/'freeze.json').read_text())
 for x in f['files']:verify(root/x['path'],x)
 phys=json.loads((root/'physical-stopped-inventory.json').read_text())
 for x in phys['files']:verify(Path(x['path']),x)
 preserved.append({'freezePath':str(root/'freeze.json'),'freezeSha256':expected,'recordsVerified':len(f['files']),'physicalInventorySha256':sha(root/'physical-stopped-inventory.json'),'physicalRecordsVerified':len(phys['files'])})
activation=json.loads((W/'activation.json').read_text());edited=activation['sourceEdit'];after=activation['sourceAfterSha256'];assert sha(R/edited)==after
for x in json.loads((O/'main-selected-source-preservation.json').read_text())['files']:
 if x['path']!=edited:verify(R/x['path'],x)
for x in json.loads((O/'main-generated-preservation.json').read_text())['files']:
 p=R/x['path'];assert sha(p)==x['sha256'] and p.stat().st_size==x['bytes']
overlay=json.loads((W/'overlay-inputs.json').read_text());assert sha(W/'overlay'/overlay['test']['path'])==after
for x in overlay['supportFiles']:
 assert sha(Path(x['source']))==x['sha256'];assert sha(W/'overlay'/x['path'])==x['sha256']
for x in overlay['links']:assert os.readlink(W/'overlay'/x['path'])==x['target'] and (W/'overlay'/x['path']).resolve()==Path(x['target'])
write('preservation-after.json',{'priorCuts':preserved,'mainSelectedSourceDelta':[{'path':edited,'beforeSha256':activation['sourcePreimageSha256'],'afterSha256':after}],'other11SelectedFilesUnchanged':True,'main936GeneratedUnchanged':True,'allOverlaySupportBytesUnchanged':True,'linkedBuildDependencyInputsUnchanged':True,'wholeCandidateCopies':0,'reusedArchiveSha256':'6c577a2f0ad90f89c35dd989040c6787892bbdb4e6a0bba6f3bbd6cc0fa0c3b5'})
files=[];dirs=[]
for p in [P]+sorted(P.rglob('*')):
 s=p.lstat();m={'path':str(p),'mode':oct(stat.S_IMODE(s.st_mode)),'dev':s.st_dev,'inode':s.st_ino,'mtime_ns':s.st_mtime_ns}
 if p.is_dir() and not p.is_symlink():dirs.append(m)
 else:x=row(p,p);x.update(dev=s.st_dev,inode=s.st_ino,mtime_ns=s.st_mtime_ns);files.append(x)
write('physical-stopped-inventory.json',{'root':str(P),'files':files,'directories':dirs,'logicalFileBytes':sum(x.get('bytes',0) for x in files),'retention':'Original resources retained; no cleanup, no append owner reacquisition. Copy/manifest identity is not runtime authority.'})
sp=P/'sunny/evidence/B04-06-replace.json';sunny=json.loads(sp.read_text());up=P/'unavailable/evidence/B04-02-rename-successor-read-owner.json';unavailable=json.loads(up.read_text());ur=P/'unavailable/evidence/B04-02-rename-successor-read-potential-retained.json';retained=json.loads(ur.read_text())
logs=[]
for p in sorted(P.rglob('events.jsonl')):
 rows=[json.loads(s) for s in p.read_bytes().splitlines() if s];logs.append({'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size,'rows':len(rows),'kinds':dict(collections.Counter(x['kind'] for x in rows)),'lastEnvelope':{k:v for k,v in rows[-1].items() if k!='payload'}})
write('actual-outcomes.json',{'sunny':{'receiptPath':str(sp),'receiptSha256':sha(sp),'commandExit':0,'ownerKind':sunny['ownerOutcome']['kind'],'completionKind':sunny['completion']['kind'],'eventCount':sunny['eventCount'],'freshProcessIds':sunny['freshProcessIds'],'currentObservationCount':len(sunny['currentObservations']),'targetBefore':sunny['targetBefore'],'targetAfter':sunny['targetAfter'],'actualPublication':sunny['state']['published'],'actualOwnerAdmission':'Genuine HoG/leaf/Product/admitOwnedCCallResult successful path; selected full/index/cold/currentness/origin/historical/fresh checks passed'},'unavailable':{'receiptPath':str(up),'receiptSha256':sha(up),'retainedFactsPath':str(ur),'retainedFactsSha256':sha(ur),'commandExit':1,'expectedFault':['successor_read'],'actualInjected':unavailable['state']['injected'],'ownerOutcome':unavailable['ownerOutcome'],'completionResultKind':unavailable['completion']['resultValue']['kind'],'completionResult':unavailable['completion']['resultValue'],'completionSuccessorPrefix':unavailable['completion']['successorPrefix'],'beforeAdmissionPrefix':unavailable['state']['beforeAdmissionPrefix'],'targetBefore':unavailable['targetBefore'],'targetAfter':unavailable['targetAfter'],'stagingAfter':unavailable['stagingAfter'],'firstFailure':'test line 588 completion.resultValue deepStrictEqual ownerOutcome','scope':'Unexpected failure of selected genuine admitted post-publication outcome proof. Actual mutation plus unadmitted completion is retained, never relabelled as the selected append-fault pass. No fresh reopen in this case.'},'logs':logs,'actualPrincipalC0PhysicalAttempts':2,'freshReadonlyChildren':2,'nativeOrProviderActors':0,'remainingCasesNotRun':['append','prepublication','component-currentness']})
work=[]
for case,facts in [('sunny',sunny['potentialFacts']),('unavailable',retained['potentialFacts'])]:
 for x in facts:
  if x.get('dependencyExtent') is not None:work.append({'case':case,'rows':x['rows'],'strictOccurrenceDependencyRows':x['dependencyExtent'],'selectedObservationDependencyPopulation':x['dependencyPopulation'],'firstHistoricalEligibilityMs':x['firstHistoricalEligibilityMs'],'reportedRepeatedIntervalMs':x['repeatedHistoricalEligibilityMs']})
write('dependency-work.json',{'observations':work,'extent':'Shared occurrence authenticator consumed 10 selected strict predecessor dependencies at the 29-row cut; EC target-population and other projections separately consume their selected relation. Source collector cost remains as frozen HOW.','timingLimit':'firstHistoricalEligibilityMs is the first explicit eligibility call in this fixture, not guaranteed process-cold; repeatedHistoricalEligibilityMs includes subsequent full/index/cold projection work before capture and is NOT isolated hot-gate latency. No CPU or general performance acceptance claim.'})
commands=[{'path':str(p.relative_to(W)),**json.loads(p.read_text())} for p in sorted((W/'commands').glob('*.result.json'))]
write('closed-execution-state.json',{'commands':commands,'newCompileGeneratorPackSunnyHostInstall':0,'newOtherCaseHostInstalls':1,'actualProductFixtureInstalls':2,'principalOwnerTests':2,'principalC0PhysicalAttempts':2,'principalPassed':1,'principalFailed':1,'freshReadonlyChildren':2,'newNativeProviderActors':0,'componentTestExecuted':False,'status':'stopped at first unexpected post-publication owner-admission/oracle failure','noRetryOrCleanup':True})
roots=[W.parent/'c0-potential-effect-realization-01',W.parent/'c0-potential-effect-successor-02',O,F,W,P.parent]
cost=[{'root':str(root),'logicalFileBytes':sum(p.lstat().st_size for p in root.rglob('*') if p.is_file() and not p.is_symlink())} for root in roots]
assert sum(x['logicalFileBytes'] for x in cost)<10737418240
write('logical-resource-cost.json',{'roots':cost,'totalBeforeFinalClosureRecords':sum(x['logicalFileBytes'] for x in cost),'maximum':10737418240,'scope':'Potential-effect realization and successors plus granted physical parent, excluding followed read-only links','noCleanup':True})
report=f'''# Closed semantic-prefix successor — sunny passed, unavailable owner admission stopped

C0-SEMANTIC-PREFIX-05 changed only retainedInputOrigin in the main post-publication test: select the actual held prefix, project its existing ABG workspace environment for the unchanged alias binding, assert binding equality, and supply the returned artifact truth. Test SHA-256 `{after}`. The raw semantic input, publication/catalog/authority and all owner/currentness/failure oracles remain unchanged. The source diff and preimage are retained.

The small overlay uses nine unchanged support/input files and read-only links to the frozen build/dependencies. Its existing read-only reopen worker was copied unchanged from main and separately pinned because the earlier stage omitted that transitive support. No production/support-source edit, compile, generator, pack or sunny reinstall occurred. Archive `6c577a2f0ad90f89c35dd989040c6787892bbdb4e6a0bba6f3bbd6cc0fa0c3b5` and successor03 inventories remain exact and reusable independently of this updated test.

The first genuine sunny owner case PASSED once in 48.91 s through HoG, leaf port, actual Product replacement and admitOwnedCCallResult. Actual rename changed the target digest/inode. The 46-row admitted log replayed in two real read-only Node children (89362 and 89363). Both distinct old binding observations withdrew at the selected fibre; the successful after alone stayed current. Full/index/cold gate/projection equality, strict historical-prefix preservation, distinct authority and observation refs, separate Run population and genuine semantic admitted-input/retained-origin refusal after Result passed. The semantic source-handoff candidate remained a supplied raw input premise; no semantic actor or historical source handoff occurred.

The next selected post-publication successor-read fault FAILED unexpectedly in 45.35 s at overlay test line 588. The actual authorized rename published 33 bytes, then the exact target observation fault produced EIO and a post_publication worksite_effect_refusal. HoG returned unadmitted_physical_commit instead of the expected admitted owner failure. The original durable log remains at 29 rows, with no evidence/Result admitted; its bytes match beforeAdmissionPrefix and completion.successorPrefix. Target digest is 088ac3e1e973545f57ad2b0a2029cec0f31beae0854b6f874925c3405db7e543; staging was consumed by rename and is absent. This was not the append-fault case and is not relabelled as its success. The actual admission reason is not exposed in this captured diagnostic; Root must triage the owner boundary.

The failure receipt, full completion, original prefix/log, target, installed bytes, mode correspondence, request/environment/PID/exit/stdout and first STOP are retained. The failed case recorded pre-selection and selected-fibre full/index/cold facts before the physical owner, but stopped before its later failure/origin/reentry/fresh-reopen assertions. Its context cleanup hook closed the available store after writing retained evidence; no append ownership was reacquired and no physical cleanup occurred.

Actual population: two principal C0 attempts, one passed/one failed; two fresh readonly children total; zero native/provider actors. Append, prepublication, deep-negative and component-regression commands did not run. Shared occurrence authentication used 10 strict dependency rows at the 29-row boundary. The reported repeated timing includes later projection work and cannot be claimed as isolated hot-gate latency; no performance acceptance is inferred.

All prior03/04 records and physical resources, the other 11 selected source/test/support files and 936 main generated files remain unchanged. The precise test delta and support correspondence are frozen separately. Logical retention stays below 10 GiB. No repair, retry, next case, broad review or final campaign was performed. Genuine admitted post-publication failure and remaining selected proofs, final combined campaign, independent L5 and Executive acceptance remain pending.
'''
(W/'REPORT.md').write_text(report)
own=inventory(W);freeze={'kind':'closed_stopped_writer_test_successor','activation':'C0-SEMANTIC-PREFIX-05','status':'sunny_passed_then_stopped_post_publication_unadmitted_owner_completion','predecessorFreezeSha256':sha(F/'freeze.json'),'reusedArtifactFreezeSha256':sha(O/'freeze.json'),'proofFreezeSha256':sha(W/'proof-freeze.json'),'stopSha256':sha(W/'STOP.json'),'reportSha256':sha(W/'REPORT.md'),'testSourceAfterSha256':after,'files':own,'recordCount':len(own),'logicalBytes':sum(x.get('bytes',0) for x in own),'physicalInventorySha256':sha(W/'physical-stopped-inventory.json'),'physicalLogicalBytes':sum(x.get('bytes',0) for x in files),'archiveSha256':'6c577a2f0ad90f89c35dd989040c6787892bbdb4e6a0bba6f3bbd6cc0fa0c3b5','newCompileGeneratorPack':0,'principalC0PhysicalAttempts':2,'principalPasses':1,'principalFailures':1}
write('freeze.json',freeze)
for x in own:verify(W/x['path'],x)
print(json.dumps({'freezeSha256':sha(W/'freeze.json'),'records':len(own),'logicalBytes':freeze['logicalBytes'],'physicalFiles':len(files),'physicalLogicalBytes':freeze['physicalLogicalBytes'],'stopSha256':freeze['stopSha256'],'reportSha256':freeze['reportSha256'],'actualC0Attempts':2,'sunnyPasses':1,'selectedUnexpectedFailures':1}))
