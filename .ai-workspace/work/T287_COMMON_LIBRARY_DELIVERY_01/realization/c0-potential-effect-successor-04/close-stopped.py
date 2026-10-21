from pathlib import Path
import json,hashlib,stat,os,collections,base64
R=Path('/Users/jim/src/apps/abiogenesis');W=Path(__file__).resolve().parent;O=W.parent/'c0-potential-effect-successor-03';P=Path('/private/tmp/abg-c0-potential-25ac62e990e141ce/successor-04')
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
 actual=row(p,x['path'])
 for k in ['kind','mode','bytes','sha256','target']:
  if k in x:assert actual[k]==x[k],(str(p),k)
assert not (W/'freeze.json').exists()
stop=json.loads((W/'STOP.json').read_text());assert stop['command']=='sunny-owner'
assert json.loads((W/'commands/sunny-host-check.result.json').read_text())['exitCode']==0
assert len(list((W/'commands').glob('*.request.json')))==2
# Existing immutable cuts are read back only; no candidate inventories are copied.
oldf=json.loads((O/'freeze.json').read_text());assert sha(O/'freeze.json')=='cfed5ef7e736ec6ff24005290c23cb0e30a39e64266ca8a2e2806f4493ae20f9'
for x in oldf['files']:verify(O/x['path'],x)
oldp=json.loads((O/'physical-stopped-inventory.json').read_text())
for x in oldp['files']:verify(Path(x['path']),x)
main=json.loads((O/'main-selected-source-preservation.json').read_text())
for x in main['files']:verify(R/x['path'],x)
generated=json.loads((O/'main-generated-preservation.json').read_text())
for x in generated['files']:
 p=R/x['path'];assert sha(p)==x['sha256'] and p.stat().st_size==x['bytes'],str(p)
write('preservation-after.json',{'predecessorFreezeSha256':sha(O/'freeze.json'),'predecessorRecordsVerified':len(oldf['files']),'predecessorPhysicalInventorySha256':sha(O/'physical-stopped-inventory.json'),'predecessorPhysicalFilesVerified':len(oldp['files']),'mainSelectedSourceReferenceSha256':sha(O/'main-selected-source-preservation.json'),'mainSelectedSourceFilesUnchanged':len(main['files']),'mainGeneratedReferenceSha256':sha(O/'main-generated-preservation.json'),'mainGeneratedFilesUnchanged':len(generated['files']),'newWholeCandidateCopies':0,'sourceChanges':[],'noOldHostOrStageWriteObserved':True})
files=[];directories=[]
for p in [P]+sorted(P.rglob('*')):
 s=p.lstat();meta={'path':str(p),'mode':oct(stat.S_IMODE(s.st_mode)),'dev':s.st_dev,'inode':s.st_ino,'mtime_ns':s.st_mtime_ns}
 if p.is_dir() and not p.is_symlink():directories.append(meta)
 else:x=row(p,p);x.update(dev=s.st_dev,inode=s.st_ino,mtime_ns=s.st_mtime_ns);files.append(x)
write('physical-stopped-inventory.json',{'root':str(P),'files':files,'directories':directories,'logicalFileBytes':sum(x.get('bytes',0) for x in files),'scope':'Original retained physical resources after test process exit; inventory is read-only and does not reopen EventStore ownership'})
logs=[]
for p in sorted(P.rglob('events.jsonl')):
 data=p.read_bytes();rows=[json.loads(s) for s in data.splitlines() if s.strip()]
 logs.append({'path':str(p),'bytes':len(data),'sha256':sha(p),'rows':len(rows),'kinds':dict(collections.Counter(x.get('kind') for x in rows)),'lastEnvelope':{k:v for k,v in rows[-1].items() if k!='payload'},'claim':'Raw content and last recorded envelope, not a newly selected held durable-prefix authority'})
targets=[]
for p in sorted(P.rglob('target.txt')):
 data=p.read_bytes();targets.append({'path':str(p),'bytes':len(data),'sha256':sha(p),'base64':base64.b64encode(data).decode()})
write('first-cause-observation.json',{'refusal':{'kind':'invocation_admission_refusal','code':'authority_mismatch','message':'invocation admission requires the exact held artifact-truth predecessor prefix'},'originatingAssertion':'unchanged test support root-installed-environment.mjs:805','handoff':'retainedInputOrigin at t287-c0-post-publication-failure.test.mjs:233, called at runCase:398','stdoutSha256':sha(W/'commands/sunny-owner.stdout'),'logs':logs,'targets':targets,'actualBoundary':'Product fixture install and primary/alias invocation and basis admissions completed; semantic invocation refused before C0 scope/occurrence/physical owner dispatch','principalTestCommands':1,'C0PhysicalAttempts':0,'C0EvidenceOrResultAdmitted':0,'freshReadonlyChildren':0,'nativeProviderActors':0,'ownerClose':'No ownership reacquired. Process exited; the test close callback occurs after retainedInputOrigin and was not registered when admission refused. OS process exit closes its descriptors; no explicit EventStore close receipt is claimed.','noCleanup':True})
write('read-routing-note.json',{'scope':'Post-stop read-only route discovery, no runtime or precondition execution','publicToolOutput':'859fce','error':'sed attempted repository-relative STOP.json while cwd was the tenant stage; no such file','disposition':'Original command error retained here; no source effect or proof credit. Exact STOP already preserved by supervisor and read using its absolute path for closure.'})
commands=[]
for p in sorted((W/'commands').glob('*.result.json')):commands.append({'path':str(p.relative_to(W)),**json.loads(p.read_text())})
write('closed-execution-state.json',{'commands':commands,'newCompiles':0,'newGenerators':0,'newPackages':0,'newSunnyHostInstalls':0,'otherCaseHostInstalls':0,'actualProductFixtureInstalls':1,'principalTestCommands':1,'principalC0PhysicalAttempts':0,'freshReadonlyChildren':0,'nativeProviderActors':0,'remainingCaseCommandsExecuted':0,'status':'stopped_first_semantic_input_invocation_admission_refusal'})
roots=[W.parent/'c0-potential-effect-realization-01',W.parent/'c0-potential-effect-successor-02',O,W,P.parent]
cost=[{'root':str(root),'logicalFileBytes':sum(p.lstat().st_size for p in root.rglob('*') if p.is_file() and not p.is_symlink())} for root in roots]
assert sum(x['logicalFileBytes'] for x in cost)<10737418240
write('logical-resource-cost.json',{'roots':cost,'totalBeforeFinalClosureRecords':sum(x['logicalFileBytes'] for x in cost),'limit':10737418240,'scope':'All potential-effect realization01/successor02/03/04 work carriers and their shared granted physical parent, no duplicate reference counting','noCleanup':True})
report='''# Closed proof successor — semantic input admission stopped

C0-HOST-BIN-MODE-04 preserved the exact successor03 source, successful compile, emitted stage, archive and already-installed sunny host. It performed no compile, generator, pack, source/test/support edit, whole-candidate copy or sunny reinstall. All prior package/source/member inventories are reused by exact hash.

The corrected preservation check passed once. All 5,271 member bytes and paths match the archive, no symlink was present, every non-bin mode was exact, and only the two declared package bins followed the pinned pacote execute-bit rule (0644 to 0755). This is new successor evidence. The predecessor's unconditional equality assertion remains failed. The actual command used --bin-links=false; pacote extraction is the source-backed normalization mechanism.

The unchanged first sunny test then ran once and failed after 38.49 seconds with invocation_admission_refusal / authority_mismatch: “invocation admission requires the exact held artifact-truth predecessor prefix.” The stack identifies setupInstalledRootInvocation at support line 805, from retainedInputOrigin test line 233, runCase line 398. The exact command/environment, PID 82263, stdout, empty stderr, exit 1 and STOP are retained. No repair, retry or subsequent case was performed.

The actual Product fixture install and earlier primary/alias invocation and basis admissions completed. The retained original log has 11 rows ending at alias basis ordinal 11: three artifact, two public-operation, two invocation, two implementation and two basis admissions. No traversal/CCall/evidence/Result row was admitted. target.txt remains the initial nine bytes “original\\n”. Semantic invocation/basis setup and the C0 owner body did not complete. This is a failed owner-test setup boundary, not an executed C0 failure or currentness result.

Zero principal physical C0 attempts, fresh readonly reopen children or native/provider actors. The process exited before the test's later close callback was registered; no append owner was reacquired and no explicit EventStore close receipt is claimed. Original log, target, installed consumer, cache and unused case roots are retained. No cleanup. A post-stop read-routing error is preserved separately without proof credit.

Readback verified all 8,623 successor03 records, 5,866 original physical records, 12 selected source/test/support files and 936 main generated files unchanged. The original archive remains 6c577a2f0ad90f89c35dd989040c6787892bbdb4e6a0bba6f3bbd6cc0fa0c3b5. The stopped successor is compact and references the immutable package inventories rather than copying them.

The exact artifact-truth predecessor handoff requires Executive triage and a separately selected fixture successor before any owner retry. No production repair is inferred here. Genuine sunny/admitted-unavailable/unadmitted-effect/refusal proof, F5, anti-revival, deep negatives, cold/hot measurements and component regressions remain unexecuted. Final combined campaign, independent review and Executive acceptance remain pending.
'''
(W/'REPORT.md').write_text(report)
own=inventory(W);freeze={'kind':'closed_stopped_writer_proof_successor','activation':'C0-HOST-BIN-MODE-04','status':'stopped_first_semantic_input_invocation_admission_refusal','predecessorFreezeSha256':sha(O/'freeze.json'),'proofFreezeSha256':sha(W/'proof-freeze.json'),'stopSha256':sha(W/'STOP.json'),'reportSha256':sha(W/'REPORT.md'),'files':own,'recordCount':len(own),'logicalBytes':sum(x.get('bytes',0) for x in own),'physicalInventorySha256':sha(W/'physical-stopped-inventory.json'),'physicalLogicalBytes':sum(x.get('bytes',0) for x in files),'archiveSha256':'6c577a2f0ad90f89c35dd989040c6787892bbdb4e6a0bba6f3bbd6cc0fa0c3b5','sourceMutationCount':0,'newCompileCount':0,'principalC0PhysicalAttempts':0}
write('freeze.json',freeze)
for x in own:verify(W/x['path'],x)
print(json.dumps({'freezeSha256':sha(W/'freeze.json'),'records':len(own),'logicalBytes':freeze['logicalBytes'],'physicalFiles':len(files),'physicalLogicalBytes':freeze['physicalLogicalBytes'],'stopSha256':freeze['stopSha256'],'reportSha256':freeze['reportSha256'],'principalC0PhysicalAttempts':0}))
