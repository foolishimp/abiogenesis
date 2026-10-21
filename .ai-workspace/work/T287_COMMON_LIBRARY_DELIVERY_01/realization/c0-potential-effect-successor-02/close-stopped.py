from pathlib import Path
import hashlib,json,os,stat
R=Path('/Users/jim/src/apps/abiogenesis');W=Path(__file__).resolve().parent;T=Path('build_tenants/abiogenesis/typescript');O=W.parent/'c0-potential-effect-realization-01';B=W.parent/'combined-final-02'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def row(p,n):
 s=p.lstat();d={'path':str(n),'mode':oct(stat.S_IMODE(s.st_mode))}
 if p.is_symlink():d.update(kind='symlink',target=os.readlink(p))
 else:d.update(kind='file',bytes=s.st_size,sha256=sha(p))
 return d
def inv(base):return [row(p,p.relative_to(base)) for p in sorted(base.rglob('*')) if p.is_symlink() or p.is_file()]
def write(n,x):
 with (W/n).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
stop=json.loads((W/'STOP.json').read_text());assert stop['command']=='material'
assert json.loads((W/'commands/tsc.result.json').read_text())['exitCode']==0
assert json.loads((W/'commands/generate.result.json').read_text())['exitCode']==0
source=json.loads((W/'source-inputs.json').read_text())['files'];deps=json.loads((W/'dependency-inputs.json').read_text())['files']
for x in source:assert sha(W/'source'/x['path'])==x['sha256']
dep_actual=inv(W/'stage'/T/'node_modules');expected={x['path']:x for x in deps};assert len(dep_actual)==len(expected)
for x in dep_actual:
 for k in ['sha256','bytes','mode','target']:
  if k in expected[x['path']]:assert x.get(k)==expected[x['path']][k],(x['path'],k)
main=json.loads((W/'main-generated-preservation-before.json').read_text())['files']
for x in main:assert sha(R/x['path'])==x['sha256'],x['path']
write('main-generated-preservation-after.json',{'count':936,'files':main,'allBytesUnchanged':True})
oldgen=json.loads((B/'generated-inventory.json').read_text())['files'];current=[];missing=[]
for x in oldgen:
 p=W/'stage'/x['path']
 if p.exists():current.append(row(p,x['path']))
 else:missing.append(x['path'])
oldby={x['path']:x for x in oldgen};changed=[{'before':oldby[x['path']],'after':x} for x in current if x!=oldby[x['path']]]
write('emitted-observed-inventory.json',{'files':current,'baselineMissingPaths':missing,'deltaFromClosedFinal02':changed,'claim':'Observed byte inventories only; selected material validation failed before correspondence closure'})
actual=inv(W/'stage');write('stage-stopped-inventory.json',{'root':str(W/'stage'),'files':actual,'sourceRows':len(source),'dependencyRows':len(deps),'dependencyBytesExactAfterGeneration':True,'compileAttempts':1,'compilePassed':True,'generatorAttempts':1,'generatorPassed':True})
oldmanifest=json.loads((B/'stage'/T/'product-toolchain-manifest.json').read_text());newmanifest=json.loads((W/'stage'/T/'product-toolchain-manifest.json').read_text())
added=sorted(set(newmanifest['productRelativeLocators'])-set(oldmanifest['productRelativeLocators']));removed=sorted(set(oldmanifest['productRelativeLocators'])-set(newmanifest['productRelativeLocators']))
write('material-first-cause-observation.json',{'firstFailedAssertion':'verify-metadata.mjs:160 addedLocators == []','addedLocators':added,'removedLocators':removed,'candidateManifest':row(W/'stage'/T/'product-toolchain-manifest.json',T/'product-toolchain-manifest.json'),'baselineManifest':row(B/'stage'/T/'product-toolchain-manifest.json',T/'product-toolchain-manifest.json'),'addedDependencyBytes':[row(W/'stage'/T/p,p) for p in added],'interpretation':'No substitution or refreshed expected locator list; Root triage required. No archive yet exists.'})
a=json.loads((W/'activation.json').read_text());after=[]
for p in a['source_paths']:
 x=row(R/p,p);y=next(r for r in source if r['path']==p);assert x['sha256']==y['sha256'];after.append(x)
write('main-source-afterimages.json',{'files':after,'changedSinceStoppedPredecessor':[a['permittedMainMutation']]})
physical=Path(a['physical_root']);assert list(physical.iterdir())==[];s=physical.stat()
write('physical-residue.json',{'root':str(physical),'device':s.st_dev,'inode':s.st_ino,'children':[],'principalC0Attempts':0,'fixtureInstallAttempts':0,'freshReopenChildren':0,'nativeActors':0})
assert sha(O/'freeze.json')=='8f19f66fa30a969f4cf00352cde8e1d9cf2b0a18c037e8a22baa076982663563'
assert sha(B/'freeze.json')=='245a11505b2c3f372da001fa0f3202d4554fea30d9d593e2fe3b5ede61906fe2'
write('closed-build-state.json',{'status':'stopped_first_unexpected_material_validation_failure','compileAttempts':1,'compileExitCode':0,'generatorAttempts':1,'generatorExitCode':0,'materialAttempts':1,'materialExitCode':1,'archive':None,'packAttempts':0,'installedProofAttempts':0,'sourceInputSha256':sha(W/'source-inputs.json'),'dependencyInputSha256':sha(W/'dependency-inputs.json'),'stageInventorySha256':sha(W/'stage-stopped-inventory.json'),'priorFreezeHashesUnchanged':True,'main936Unchanged':True})
report='''# Stopped typed-root successor

The selected existing-record narrowing compiled successfully once, and the existing generator completed once. The next material-validation command failed; all work stopped before repair, retry, packaging or installed proof. No genuine owner sunny-day case or other physical C0 attempt has run.

First cause: verify-metadata.mjs:160 expected unchanged productRelativeLocators relative to closed combined-final-02. The generated manifest adds exactly node_modules/fast-check/CHANGELOG.md and node_modules/pure-rand/CHANGELOG.md. The original assertion/error remains exact. No expected list was refreshed and no dependency/source was removed. material-first-cause-observation.json records both manifest identities and exact added file bytes; it makes no authority or package-acceptance claim.

Commands and environment are preserved under commands/. The successor compile passed in 6240.928 ms; generator passed in 25019.522 ms; material validation exited 1 in 3627.697 ms. The first-cause stderr SHA256 is 812bbdd50e7e404f08f92fea249e404882756f502abfbd210923563ec925e1c9. No emission/package correspondence success is claimed beyond the explicitly recorded compile and generator exits.

The one main-source delta reads the selected JsonValue authority, narrows it using the existing record predicate, then obtains canonicalRoot. Missing/non-string root remains invalidating; the shared physical query and strict afterOrdinal are unchanged. Main worksite_revision.ts afterimage is 0cd5b66cbef6f430d130f767d9eedd39eb88f6a8b3a9242640ef1d31965fb1fd. All other production/test/support inputs match the prior failed frozen subject.

The fresh copied source has 1319 records and independent dependencies have 4576 entries. Complete generated/stage inventories and observed deltas are retained; all dependency bytes remain exact after generation. All936 main generated files and both prior freeze hashes are unchanged. The stopped predecessor stage/logs are intact. The new physical successor-02 subtree is retained empty; no install, C0 effect, fresh child or native/provider actor ran. No archive exists for Executive adoption.

Root must triage this material correspondence failure before any continuation. The unchanged finite proof, F1 blocker and independent review remain open; so do final combined package selection and P1/P2/P3/P5/U1/P4, HoG/E04, diagnostics, independent L5 and Executive acceptance/checkpoint. This is neither a completed refactor nor a release.
'''
(W/'report.md').write_text(report)
files=inv(W);total=sum(x.get('bytes',0) for x in files);assert total+184816977<=10737418240
write('freeze.json',{'kind':'closed_stopped_writer_successor','activation':'C0-TYPED-ROOT-02','status':'stopped_first_material_validation_failure','predecessorFreezeSha256':sha(O/'freeze.json'),'prebuildFreezeSha256':sha(W/'prebuild-freeze.json'),'stopSha256':sha(W/'STOP.json'),'reportSha256':sha(W/'report.md'),'files':files,'fileCount':len(files),'logicalBytes':total,'combinedNewLogicalBytesWithPredecessor':total+184816977,'noArchiveOrOwnerProof':True,'acceptance':False})
print(json.dumps({'freezeSha256':sha(W/'freeze.json'),'stopSha256':sha(W/'STOP.json'),'reportSha256':sha(W/'report.md'),'records':len(files),'logicalBytes':total,'stageEntries':len(actual),'generatedEntries':len(current),'generatedDeltaEntries':len(changed),'missingGenerated':missing,'addedLocators':added}))
