"""Conjoin exact local installation receipts; preserve prior work and status preimages."""
from pathlib import Path
import datetime,hashlib,json,subprocess,time
D=Path(__file__).resolve().parent;X=D.parent;M=Path('/Users/jim/src/apps/abiogenesis');S=Path('/Users/jim/src/apps/abiogenesis-single-address-space');W=Path('/Users/jim/src/apps/abiogenesis-rc6-local-cut')
R=Path('/Users/jim/Library/Application Support/ABIogenesis/releases/5.0.0-rc.6')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def row(p):return {'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p)}
def save(p,v):
 with p.open('x') as f:f.write(json.dumps(v,indent=2)+'\n')
def git(root,*args):return subprocess.check_output(['git','-C',str(root),*args],text=True).strip()
c=json.loads((D/'SOURCE_CHECKPOINT.json').read_text());m=json.loads((D/'INPUT_MANIFEST.json').read_text());cut=json.loads((R/'LOCAL_CUT_RECORD.json').read_text());install=json.loads((R/'installation.json').read_text());payload=json.loads((R/'payload-correspondence.json').read_text())
assert cut['status']=='local_cut_and_owner_install_completed'
for k in ['published','qualified','tagsCreated','selectorChanged']:assert cut[k] is False,k
assert cut['providerCalls']==cut['nativeRuns']==0
assert cut['source']==m['expected'] and cut['sourceTree']==c['sourceTree']
assert cut['selectedInputManifestSha256']==sha(D/'INPUT_MANIFEST.json')
checks=[]
for line in (R/'SHA256SUMS').read_text().splitlines():
 digest,name=line.split('  ',1);assert sha(R/name)==digest,name;checks.append(row(R/name))
assert len(payload['inventory'])==payload['members']==cut['members']==5325
assert git(W,'rev-parse','HEAD')==c['sourceCommit']
assert not git(W,'diff','--name-only') and not git(W,'diff','--cached','--name-only')
original=json.loads((X/'proof-10/SOURCE_AFTER_FINAL_CLOSE.json').read_text());source=[]
for r in original['files']:
 p=S/r['path'];actual=row(p);assert actual['sha256']==r['sha256'] and actual['bytes']==r['bytes'],r['path'];source.append({'path':r['path'],'sha256':actual['sha256']})
assert git(S,'rev-parse','HEAD')=='f49e7533ebedff0946383cb0c5380a6ecac7889d'
assert git(M,'rev-parse','HEAD')=='228f6b96a3db3cf9376914504aca3b93d14126de'
js="import assert from'node:assert/strict';import{readFile}from'node:fs/promises';import{pathToFileURL}from'node:url';const r=process.argv[1];const i=JSON.parse(await readFile(r+'/installation.json','utf8'));const p=await import(pathToFileURL(i.installedRoot+'/build/code/src/product/index.js'));assert.equal(p.ABI5_PACKAGE_VERSION,'5.0.0-rc.6');assert(await p.installedProductContentMatches(i));console.log(JSON.stringify({status:'installed_owner_content_matches',version:p.ABI5_PACKAGE_VERSION,installedRoot:i.installedRoot}));"
start=time.monotonic();fresh=subprocess.run(['/opt/homebrew/bin/node','--input-type=module','-e',js,str(R)],capture_output=True,text=True);wall=(time.monotonic()-start)*1000
(D/'INSTALLED_OWNER_CHECK.stdout').write_text(fresh.stdout);(D/'INSTALLED_OWNER_CHECK.stderr').write_text(fresh.stderr);assert fresh.returncode==0,fresh.stderr
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
verification={'kind':'rc6_final_local_install_verification','at':now,'status':'LOCAL_RC6_CUT_AND_INSTALL_COMPLETE_UNQUALIFIED','sourceCommit':c['sourceCommit'],'sourceTree':c['sourceTree'],'cutRecord':row(R/'LOCAL_CUT_RECORD.json'),'selectedManifest':row(D/'INPUT_MANIFEST.json'),'checksumEntries':len(checks),'checksums':checks,'installedOwnerRead':json.loads(fresh.stdout),'installedOwnerReadWallMs':round(wall,3),'payloadMembers':payload['members'],'payloadInventoryDigest':payload['inventoryDigest'],'originalSourceAndHandoffsUnchanged':len(source),'originalWorktreeHead':git(S,'rev-parse','HEAD'),'mainHead':git(M,'rev-parse','HEAD'),'newSourceTrackedClean':True,'review':row(D/'INDEPENDENT_LOCAL_CUT_REVIEW.json'),'reproduction':row(D/'reproduction/RESULT.json'),'qualified':False,'published':False,'globalSelectorChanged':False}
save(D/'FINAL_INSTALL_VERIFICATION.json',verification)
activation=json.loads((D/'WRITER_ACTIVATION.json').read_text());first=json.loads((D/'candidate/RESULT.json').read_text());second=json.loads((D/'reproduction/RESULT.json').read_text())
save(D/'LOCAL_DELIVERY_TIMING.json',{'startedUtc':activation['at'],'completedUtc':now,'candidateCommands':first['commands'],'cleanReproductionCommands':second['commands'],'installedOwnerReadWallMs':round(wall,3),'nativeWorkerLaunchMs':None,'nativeBetweenTaskMs':None,'nativeProviderActors':0,'meaning':'Mechanical local delivery timings only. No new SDK setup/native launch/between-task observation; proof10 timings remain on installed RC5. RC6 complete native-workflow performance remains unmeasured.'})

handoff=f'''# RC6 local cut and installation

Completed {now}. Local unqualified development candidate; no stable release.

- Source: `{c['sourceCommit']}`, tree `{c['sourceTree']}`, branch `codex/rc6-local-cut`.
- Worktree: `{W}`. Tracked source and index are clean.
- Archive: `{cut['archive']}`; `{cut['source']['artifactDigest']}`.
- Product content: `{cut['source']['productContentDigest']}`.
- Manifest: `{cut['source']['manifestDigest']}`.
- Installed root: `{cut['installedRoot']}`.
- CLI: `{cut['installedCli']}`.
- STDO: immutable3.0.4, manifest102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b.

The isolated clean rebuild is byte-equal. The existing Product owners verified,
locked and installed the exact archive; all5,325 payloads match. A fresh process
loaded the installed Product owner and confirmed content correspondence. The cut
receipts and all{len(checks)} checksum entries agree. Independent MAX packaging review is
satisfied. See FINAL_INSTALL_VERIFICATION.json and SOURCE_ARTIFACT_EVIDENCE_MAP.json.

Of5,325 archive members,5,319 match the native-tested proof10 artifact exactly.
The six differences are Product/package version constants, their inferred
declaration, package identity, generated capability graph and manifest.
The substantive source157 and original handoffs3 remain unchanged in the original
worktree. The cumulative source/evidence checkpoint is preserved separately.

## Evidence and limits

Proof10 bounded T1-T5 acceptance, actual12/0/0, native UAT and fresh result/replay
retain their original subject and Run. The local packaging step adds no native
qualification result. Actual09 remains77/8/75, revision4/1/2 and consumers59/0/73.
N9-RETAINED-FIXTURE-01 and several direct-arm coverage limits remain open before
dependent qualification. Two operator preparation refusals are retained: an
overly narrow inferred-declaration whitelist and a whitespace checker applied to
raw patch evidence; neither changed Product code or required test reruns.

Broader R1-R7/C1-C5, initial cold authentication and full RC6 native-workflow
performance remain open. Setup, native launch and between-task timings are not
conflated with local packaging. Full fifteen-family and installed S01/S02/S03/S06,
native F11/soleAF22, exact prospective S07 and human release acceptance remain open.
No push, merge, tag, publication or global selector change occurred. Earlier local
cuts, dirty/untracked work and historical failures remain preserved.

The next proposed step toward5.0.0 is a finite qualification gap assessment and
campaign for one frozen candidate, preserving valid evidence and selecting only
demonstrated release blockers. Product S07 requires prospective pre-RC qualification,
an authorized immutable RC, installed-RC qualification, actual human acceptance
of those unchanged bytes and post-publication fresh installation. This local
preview cannot retrospectively supply that authorization. No qualification
campaign or additional functionality was activated by this local delivery.
'''
with (D/'HANDOFF.md').open('x') as f:f.write(handoff)

paragraph=f'Current selection, {now}: **LOCAL_RC6_CUT_INSTALL_COMPLETE_UNQUALIFIED**. Owner-selected RC6 is locally installed from source`{c["sourceCommit"]}`/tree`{c["sourceTree"]}` on `codex/rc6-local-cut`. The source reproduces archive`{cut["source"]["artifactDigest"]}` byte-for-byte; existing Product verification/lock/install, all5,325 payload correspondence, fresh installed-owner content check and independent MAX packaging review passed. The native-tested artifact differs in only six identity/generated members; substantive source and retained proof are conserved. Proof10 acceptance and actual09 failures/N9-RETAINED-FIXTURE-01 retain their exact standing. Full qualification and RC6 native-workflow performance remain open; no publication or global selector change. Handoff: `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/single-address-space-consolidation-01/local-cut-rc6-01/HANDOFF.md`. No further activation selected.'
for rel in ['specification/GOALS.md','.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md']:
 p=M/rel;before=p.read_bytes();backup=D/'coordination-preimages/final'/rel;backup.parent.mkdir(parents=True,exist_ok=True);backup.write_bytes(before)
 text=before.decode();lines=text.splitlines();positions=[i for i,line in enumerate(lines) if line.startswith('Current selection, ') and '**RC6_LOCAL_CUT_INSTALL_SELECTED**' in line];assert len(positions)==1
 lines[positions[0]]=paragraph
 for i,line in enumerate(lines):
  if '**TARGETED_INTERFACE_REFACTOR_ACCEPTED**' in line:
   lines[i]=line.replace('Current selection,','Completed selection,',1).replace('Current Root continuation,','Completed Root continuation,',1)
 p.write_text('\n'.join(lines)+'\n')
status=X/'STATUS.json';backup=D/'coordination-preimages/final/STATUS.json';backup.write_bytes(status.read_bytes());d=json.loads(status.read_text())
d.update(recordedUtc=now,status='LOCAL_RC6_CUT_INSTALL_COMPLETE_UNQUALIFIED',selectedOutcome='Bounded local RC6 cut and installation',selectedOutcomeComplete=True,nextSelectedWork=None)
d['currentActivation']={'role':'bounded operator Writer','status':'closed','activation':str(D/'WRITER_ACTIVATION.json'),'result':row(D/'FINAL_INSTALL_VERIFICATION.json'),'handoff':row(D/'HANDOFF.md')}
d['immutableRC6']={'sourceCommit':c['sourceCommit'],'sourceTree':c['sourceTree'],'artifactDigest':cut['source']['artifactDigest'],'installedRoot':cut['installedRoot'],'releaseRoot':str(R),'qualified':False,'published':False}
d['proposedNextWork']='Finite five-point-zero qualification gap assessment/campaign on one frozen candidate; not activated by this local delivery.'
status.write_text(json.dumps(d,indent=2)+'\n')
print(json.dumps({'status':verification['status'],'sourceCommit':c['sourceCommit'],'artifactDigest':cut['source']['artifactDigest'],'installedRoot':cut['installedRoot'],'payloads':payload['members'],'originalSourceAndHandoffsUnchanged':len(source),'handoff':str(D/'HANDOFF.md')}))
