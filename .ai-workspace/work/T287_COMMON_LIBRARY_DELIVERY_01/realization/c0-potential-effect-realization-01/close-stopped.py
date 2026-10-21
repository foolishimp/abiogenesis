from pathlib import Path
import hashlib,json,os,stat,difflib
R=Path('/Users/jim/src/apps/abiogenesis');W=Path(__file__).resolve().parent;T=Path('build_tenants/abiogenesis/typescript')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def row(p,n):
 s=p.lstat();d={'path':str(n),'mode':oct(stat.S_IMODE(s.st_mode))}
 if p.is_symlink():d.update(kind='symlink',target=os.readlink(p))
 else:d.update(kind='file',bytes=s.st_size,sha256=sha(p))
 return d
def inv(base):
 return [row(p,p.relative_to(base)) for p in sorted(base.rglob('*')) if p.is_symlink() or p.is_file()]
def write(n,x):
 p=W/n
 with p.open('x') as f:json.dump(x,f,indent=2);f.write('\n')
stop=json.loads((W/'STOP.json').read_text());assert stop['command']=='tsc'
source=json.loads((W/'source-inputs.json').read_text())['files'];deps=json.loads((W/'dependency-inputs.json').read_text())['files']
expected={x['path']:x for x in source}
for x in deps:expected[str(T/'node_modules'/x['path'])]={**x,'path':str(T/'node_modules'/x['path'])}
actual=inv(W/'stage');assert len(actual)==len(expected)
for x in actual:
 e=expected[x['path']]
 for k in ['sha256','bytes','mode','target']:
  if k in e:assert x.get(k)==e[k],(x['path'],k)
assert not (W/'stage'/T/'build').exists(),'noEmitOnError must leave no isolated emitted tree'
for x in source:
 assert sha(W/'source'/x['path'])==x['sha256']
main=json.loads((W.parent/'u1-c0-physical-currentness-01/main-generated-preimage.json').read_text());assert len(main)==936
for x in main:assert sha(R/x['path'])==x['sha256']
owned=json.loads((W/'activation.json').read_text())['source_paths']
source_after=[]
for p in owned:
 a=row(R/p,p);assert a['sha256']==expected[p]['sha256'];source_after.append({'before':row(W/'preimages'/p,p),'after':a})
write('source-afterimages.json',{'files':source_after,'sourceScope':'nine production sources, two tests, one conditional existing fixture support'})
write('stage-stopped-inventory.json',{'root':str(W/'stage'),'files':actual,'sourceRows':len(source),'dependencyRows':len(deps),'noEmissions':True,'allStageBytesPreservedAtFailedCompile':True})
write('main-generated-preservation-after.json',{'count':936,'files':main,'allBytesUnchanged':True})
physical=Path(json.loads((W/'activation.json').read_text())['physical_root']);status=physical.stat();assert list(physical.iterdir())==[]
write('physical-residue.json',{'root':str(physical),'device':status.st_dev,'inode':status.st_ino,'children':[],'principalC0Attempts':0,'installedOwnerRuns':0,'freshReopenChildren':0,'nativeActors':0,'retained':'empty granted parent; no fixture install or workload began'})
write('closed-build-state.json',{'status':'stopped at first isolated compile','compileAttempts':1,'compileExitCode':1,'syntaxChecksPassed':3,'generatorAttempts':0,'packageAttempts':0,'archive':None,'installedProofAttempts':0,'prebuildFreezeSha256':sha(W/'prebuild-freeze.json'),'stopSha256':sha(W/'STOP.json'),'sourceInputSha256':sha(W/'source-inputs.json'),'dependencyInputSha256':sha(W/'dependency-inputs.json'),'stageInventorySha256':sha(W/'stage-stopped-inventory.json'),'closedFinal02FreezeUnchanged':sha(W.parent/'combined-final-02/freeze.json')=='245a11505b2c3f372da001fa0f3202d4554fea30d9d593e2fe3b5ede61906fe2'})
report='''# Stopped C0 potential-effect realization

The single authorized isolated TypeScript compile failed, and work stopped before repair or retry. No generator, package, install, physical C0 attempt, fresh reopen child or native/provider actor ran. The first genuine owner sunny-day result is unavailable.

The first cause is `code/src/abg/worksite_revision.ts(336,50): TS2339`. The existing artifact projection exposes `workspaceAuthorityBasis` as JSON; the new physical-origin gate accesses `canonicalRoot` without the required TypeScript narrowing. This is a local typed handoff defect in the selected realization, not evidence of an executed Product or physical-currentness failure. Root must triage any successor. The selected F1 Product blocker remains open.

Exact command: `/opt/homebrew/Cellar/node/24.7.0/bin/node node_modules/typescript/bin/tsc -p tsconfig.json` in this carrier's `stage/build_tenants/abiogenesis/typescript`. The command exited 1 after 5066.732 ms; PID 33030. `commands/tsc.request.json`, `commands/tsc.result.json`, stdout/stderr and `STOP.json` preserve actual environment, pins and causal first failure. No automatic repair, retry, hash refresh or later command occurred.

The complete copied input contains 1,319 source records and 4,576 independently inventoried dependency entries. Every copied regular file has a distinct inode from its source; symlinks remain within the copied dependency tree. Three syntax preflights passed. `noEmitOnError` left no isolated build tree; all 5,895 staged source/dependency entries match their precompile bytes. No candidate archive exists. Root cannot adopt this stage as a built combined candidate.

The nine production edits implement one selected-occurrence authentication/dependency relation; prospective withdrawal and anti-revival in EC; the broad history selector; shared historical eligibility in HoG, leaf port and physical owner; global physical currentness intersected with Run-owned population; and root/path invalidation in retained origins while conserving provenance authority equality. Exact changes are in the source diffs and afterimages. Two selected tests and the bounded existingEnvironment/publicInvocationRef support hook are included, but no runtime claim is made for them.

The prospective proof includes the actual second binding/Run with a distinct authority and observation ref, a reconstructed binding-specific Catalog, and ordinary installed semantic invocation/basis admission without F_P execution. Product-constructed handoff coordinates are explicitly supplied raw input, not historical semantic evidence. Root's closed Proof/F5 assessment is attributed in HOW-binding.md; it is not a full independent report or acceptance. This entire route remains unexecuted at this stopped cut.

Anti-revival uses the indexed physical cause population plus strict dependencies, currently filtering that selected population per candidate; O(causes × selected support) is an implementation bound, not a measured runtime result. Historical dispatch reuses existing exact-prefix EC derivation; cold/hot runtime measurements were prepared but not obtained.

All 936 main generated files remain exact. The prior combined-final-02 freeze remains exact. The granted physical parent `/private/tmp/abg-c0-potential-25ac62e990e141ce` is retained empty. No old cut, Git or continuation17 was mutated or opened by this activation. The source worktree intentionally retains the selected uncompiled edits; the afterimage relation is exact at this freeze, not an immutable whole-worktree claim.

F1/F2/F3/F4/F5 execution/review closure, final combined package adoption, P1/P2/P3/P5/U1/P4, HoG/E04, passive diagnostics, independent L5 and Executive acceptance/checkpoint remain separate outstanding work. This is not a completed refactor or release.
'''
(W/'report.md').write_text(report)
files=inv(W);total=sum(x.get('bytes',0) for x in files);assert total<=10737418240
write('freeze.json',{'kind':'closed_stopped_writer_realization','activation':'C0-POTENTIAL-EFFECT-REALIZATION-01','status':'stopped_first_unexpected_compile_failure','root':str(W),'prebuildFreezeSha256':sha(W/'prebuild-freeze.json'),'stopSha256':sha(W/'STOP.json'),'reportSha256':sha(W/'report.md'),'files':files,'fileCount':len(files),'logicalBytes':total,'physicalEvidence':'physical-residue.json','noArchiveOrOwnerExecution':True,'acceptance':False,'return':'Root Executive triage; no repair/retry authorized by this freeze'})
print(json.dumps({'freezeSha256':sha(W/'freeze.json'),'stopSha256':sha(W/'STOP.json'),'reportSha256':sha(W/'report.md'),'records':len(files),'logicalBytes':total,'stageEntries':len(actual)}))
