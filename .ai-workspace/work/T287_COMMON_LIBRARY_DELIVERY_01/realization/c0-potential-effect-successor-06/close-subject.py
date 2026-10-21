from pathlib import Path
import json,hashlib,stat,os,traceback
R=Path('/Users/jim/src/apps/abiogenesis');W=Path(__file__).resolve().parent;O=W.parent/'c0-potential-effect-successor-03';F=W.parent/'c0-potential-effect-successor-05';T=Path('build_tenants/abiogenesis/typescript');P=Path('/private/tmp/abg-c0-potential-25ac62e990e141ce/successor-06')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def wr(n,x):
 with (W/n).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
def row(p,rel,physical=False):
 s=p.lstat();r={'path':str(rel),'kind':'symlink' if p.is_symlink() else 'file','mode':oct(stat.S_IMODE(s.st_mode))}
 if p.is_symlink():r['target']=os.readlink(p)
 else:r.update(bytes=s.st_size,sha256=sha(p))
 if physical:r.update(dev=s.st_dev,inode=s.st_ino,nlink=s.st_nlink,mtime_ns=s.st_mtime_ns)
 return r
def inv(root,physical=False):return [row(p,p.relative_to(root),physical) for p in sorted(root.rglob('*')) if p.is_file() or p.is_symlink()]
def verify(p,x):
 r=row(p,x['path'])
 for k in ['sha256','bytes','mode','target']:
  if k in x:assert r[k]==x[k],(str(p),k)
assert not (W/'freeze.json').exists()
commands={p.name.removesuffix('.result.json'):json.loads(p.read_text()) for p in sorted((W/'commands').glob('*.result.json'))}
stopped=(W/'STOP.json').exists()
required=['syntax','tsc','detached','generate','material','generation-correspondence','pack','archive-check','payload']+[c+'-'+s for c in ['unavailable','sunny','append','prepublication'] for s in ['install','host-check','owner']]+['component-currentness']
if not stopped:
 for n in required:assert n in commands and commands[n]['exitCode']==0,n
try:
 expected=json.loads((W/'stage-post-generation-inventory.json').read_text())['files'];actual=inv(W/'stage');assert actual==expected,'new stage changed after package'
 selected=json.loads((W/'activation.json').read_text())['source_paths'];main=[]
 for rel in selected:
  assert (R/rel).read_bytes()==(W/'stage'/rel).read_bytes();main.append(row(R/rel,rel))
 base=W.parent/'u1-c0-physical-currentness-01/main-generated-preimage.json';x=json.loads(base.read_text());x=x if isinstance(x,list) else x['files']
 for r in x:verify(R/r['path'],r)
 for r in json.loads((W/'input-pins.json').read_text())['files']:
  if r['path'] not in [str(R/p) for p in selected]:assert sha(Path(r['path']))==r['sha256'],r['path']
 detached=json.loads((W/'detached-correspondence.json').read_text())
 for k in ['log','receipt']:assert sha(Path(detached[k]))==detached[k+'Sha256']
 archive=json.loads((W/'archive-members.json').read_text())['archive'];verify(R/archive['path'],archive)
 wr('preservation-after.json',{'stageRows':len(actual),'stageInventorySha256':sha(W/'stage-post-generation-inventory.json'),'allStageBytesModesLinksUnchangedAfterPackage':True,'selectedMainSources':main,'mainGeneratedCount':len(x),'mainGeneratedAllExact':True,'mainGeneratedBaselineSha256':sha(base),'prior03and05FreezeAndArchivePinsUnchanged':True,'original05LogAndOwnerReceiptUnchanged':True,'archive':archive})
except BaseException:
 if not stopped:wr('STOP.json',{'kind':'final preservation failure','traceback':traceback.format_exc(),'disposition':'stopped before repair/retry'});stopped=True
 else:wr('closure-preservation-error.json',{'traceback':traceback.format_exc(),'originalStopPreserved':True})
resources=json.loads((W/'proof-resources.json').read_text());outcomes=[]
for c in resources['cases']:
 e=Path(c['evidence']);full=sorted(e.glob('B04-*.json'));case=next((p for p in full if not p.name.endswith('-owner.json') and not p.name.endswith('-potential-retained.json')),None)
 owners=sorted(e.glob('*-owner.json'));o=json.loads(owners[0].read_text()) if owners else None;a=json.loads(case.read_text()) if case else None
 r={'case':c['id'],'ownerCommand':commands.get(c['id']+'-owner'),'caseRecord':None if case is None else row(case,str(case)),'ownerRecord':None if not owners else row(owners[0],str(owners[0]))}
 if o:
  co=o['completion'];ow=o['ownerOutcome'];r.update(ownerKind=ow.get('kind'),phase=ow.get('phase'),physicalOutcomeKind=ow.get('physicalOutcome',{}).get('kind'),completionKind=co['kind'],completionDisposition=co['disposition'],resultRef=co['resultRef'],resultValueKind=co['resultValue']['kind'],faults=o['state']['injected'],targetBefore=o['targetBefore'],targetAfter=o['targetAfter'],stagingAfter=o['stagingAfter'])
 if a:
  r.update(eventCount=a['eventCount'],freshProcessIds=a['freshProcessIds'],currentObservationCount=len(a['currentObservations']),reopenClaim=a['reopenClaim'],potentialFacts=[{k:v for k,v in f.items() if k in ['label','rows','dependencyPopulation','dependencyExtent','firstHistoricalEligibilityMs','repeatedHistoricalEligibilityMs','facts','retainedOriginViews','rawBasisRef','rawBinding','premise']} for f in a['potentialFacts']])
 outcomes.append(r)
wr('actual-outcomes.json',{'cases':outcomes,'componentCommand':commands.get('component-currentness'),'claims':'Actual installed owner/admission paths for principal cases; component native/scope rows carry supplied lower premises and no native actor execution; original05 failed admission is not reclassified.'})
physical=inv(P,True);wr('physical-inventory.json',{'root':str(P),'files':physical,'rows':len(physical),'logicalBytes':sum(x.get('bytes',0) for x in physical),'metadataClaim':'Original retained physical file identities; archive/copied bytes are not live eventLog authority. No cleanup or reopened append owners.'})
measure=[{'case':r['case'],'selected':f} for r in outcomes for f in r.get('potentialFacts',[]) if f.get('label')=='selected potential before physical owner']
wr('dependency-work.json',{'detachedStrictDependencies':json.loads((W/'detached-correspondence.json').read_text())['dependencyRows'],'cases':measure,'costScope':'Pure occurrence authentication uses strict aggregate/basis/invocation/artifact/implementation dependencies, no EC fold. Historical eligibility uses existing exact-prefix EC. firstHistoricalEligibilityMs is the first explicit test measurement, not guaranteed process-cold. repeatedHistoricalEligibilityMs includes subsequent full/index/cold potentialViews work and is not isolated hot latency.'})
wr('commands-summary.json',{'commands':commands,'required':required,'notExecuted':[n for n in required if n not in commands],'actualSelectedFailure':json.loads((W/'STOP.json').read_text()) if stopped else None,'timeoutMs':600000,'nativeProviderCalls':0})
newfiles=inv(W);additional=sum(x.get('bytes',0) for x in newfiles)+sum(x.get('bytes',0) for x in physical);prior=resources['priorRetainedLogicalBytes'];assert additional<2147483648 and additional+prior+1048576<10737418240
wr('logical-resource-cost.json',{'newRecordAndStageBytesBeforeClosure':sum(x.get('bytes',0) for x in newfiles),'newPhysicalBytes':sum(x.get('bytes',0) for x in physical),'additionalLogicalBytesBeforeClosure':additional,'additionalBound':2147483648,'priorClosed05MeasuredAggregateBytes':prior,'aggregateWith1MiBClosureAllowance':prior+additional+1048576,'aggregateBound':10737418240,'noCleanup':True})
status='incomplete' if stopped else 'candidate_ready'
report=f'''# C0 dependency conservation successor 06\n\n{status}. Root selected only the indexed failure-wrapper dependency repair, canonical C0 four-contract join, and existing owner-test proof extension. [HOW](HOW-binding.md), [independent review attribution](review-attribution.json), [prebuild freeze](prebuild-freeze.json), [proof freeze](proof-freeze.json) and the two source diffs bind this exact increment. No WHAT/schema/Public surface or deferred F6 Result-history change.\n\nOne isolated compile, generator, material validation and ignore-scripts pack completed. Archive SHA256 `{archive['sha256']}`; all 5,271 member bytes match the stage and 5,269 payload locators satisfy the existing Product digest. All75 public catalog rows and declarations unchanged, zero locator delta; finite source/emission/package correspondence is retained. Exact03 dependency files, typed links and499 material directory modes/mtimes conserved; no shared writable inodes. Main936 generated files preserved.\n\nThe detached exact05 29-row proof passes full/index/cold failure equality with10 strict pre-fibre dependencies; missing invocation refuses. The same fully re-digested alternate-output fixture passes frozen03 pure authentication and fails corrected authentication; the authentic original stays positive. This is a controlled malformed-history vector, never a runtime admission claim.\n\nActual outcomes and exact command/PID/timing/log identities: [outcomes](actual-outcomes.json), [commands](commands-summary.json). Every executed physical case and original failed cut remains retained. Physical original identities and bytes: [inventory](physical-inventory.json). Copied/package bytes are not original eventLog identity. Computational extent/timing limits: [dependency work](dependency-work.json); retained byte cost: [cost](logical-resource-cost.json).\n\nGenuine semantic input origin comes from actual ordinary invocation/basis admission without semantic/provider dispatch; source-handoff candidate remains supplied raw input. Principal owner cases and fixture-supplied component controls retain distinct claims. No new native/provider calls, no old append-store reopening, no cleanup, Git or continuation-17 access.\n\n{'The first unexpected selected failure is preserved in STOP.json; no repair/retry or subsequent case was executed.' if stopped else 'All selected principal and component commands passed; this is bounded Writer evidence, not independent acceptance.'}\n\nFull combined-candidate correspondence/adoption, final P1/P2/P3/P5/U1/P4, HoG/E04/passive diagnostics, independent L5 and Executive acceptance/checkpoint remain separate. Root may run separately authorized proofs against this immutable archive; they are not claimed here.\n'''
(W/'REPORT.md').write_text(report)
files=inv(W);freeze={'kind':'closed_writer_subject','activation':'C0-DEPENDENCY-CONSERVATION-06','status':status,'predecessor03FreezeSha256':sha(O/'freeze.json'),'predecessor05FreezeSha256':sha(F/'freeze.json'),'prebuildFreezeSha256':sha(W/'prebuild-freeze.json'),'proofFreezeSha256':sha(W/'proof-freeze.json'),'reportSha256':sha(W/'REPORT.md'),'stopSha256':sha(W/'STOP.json') if stopped else None,'files':files,'recordCount':len(files),'logicalBytes':sum(x.get('bytes',0) for x in files),'physicalInventorySha256':sha(W/'physical-inventory.json'),'physicalRows':len(physical),'physicalLogicalBytes':sum(x.get('bytes',0) for x in physical),'archive':archive,'newCompileGeneratorPack':[1,1,1],'sourceMutationCount':2,'principalCasesCompleted':sum((r.get('ownerCommand') or {}).get('exitCode')==0 for r in outcomes),'nativeProviderCalls':0}
wr('freeze.json',freeze)
for x in files:verify(W/x['path'],x)
print(json.dumps({'status':status,'freezeSha256':sha(W/'freeze.json'),'records':len(files),'physicalRows':len(physical),'additionalLogicalBytes':additional,'archiveSha256':archive['sha256'],'principalPasses':freeze['principalCasesCompleted']}))
