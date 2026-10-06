from pathlib import Path
import hashlib,json,subprocess,time
B=Path('/Users/jim/src/apps/abiogenesis');T=B/'build_tenants/abiogenesis/typescript';C=B/'.ai-workspace/comments/codex/20260923_COMPOSITE_READINESS';D=C/'compiled-29';P=C/'compiled-28'
S=D/'accepted-source.json'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
save=lambda name,data:(D/name).write_text(json.dumps(data,indent=2)+'\n')
def inventory(paths):return [{'path':str(p.relative_to(T)),'bytes':p.stat().st_size,'sha256':sha(p)} for p in sorted(set(paths)) if p.is_file()]
frozen=json.loads(S.read_text())
subject={'members':[{'repo':Path(r['path']).relative_to(B.parent).parts[0],'path':str(Path(r['path']).relative_to(B.parent/Path(r['path']).relative_to(B.parent).parts[0])),'sha256':r['sha256']} for r in frozen['members']]}
for r in subject['members']:assert sha(B.parent/r['repo']/r['path'])==r['sha256'],r['path']
allowed={str((B/r['path']).relative_to(T)):r for r in subject['members'] if r['repo']=='abiogenesis'}
priorMap={r['path']:r for r in json.loads((P/'source-freeze-before-build.json').read_text())['members']}
priorMap.update({r['path']:r for r in json.loads((P/'generated-after.json').read_text())})
priorMap={k:v for k,v in priorMap.items() if not (k.startswith('build/') or k.startswith('contracts/') or k=='product-toolchain-manifest.json')}
generatedAllowed={str(Path(r['path']).relative_to(T)):r for r in frozen['members'] if str(Path(r['path']).relative_to(T)).startswith('build/')}
for rel,r in generatedAllowed.items():assert sha(T/rel)==r['sha256'],rel
currentInventory=inventory([T/p for p in priorMap.keys()|allowed.keys()]);currentMap={r['path']:r for r in currentInventory}
changes=[{'before':priorMap.get(k),'after':currentMap.get(k)} for k in sorted(priorMap.keys()|currentMap.keys()) if priorMap.get(k)!=currentMap.get(k)]
assert {r['after']['path'] for r in changes}<=set(allowed)|set(generatedAllowed),changes
save('source-freeze-before-build.json',{'sourceSubject':sha(S),'members':currentInventory,'exactChangedMembers':changes,'status':'exact_frozen_design_presentation_operational_continuation_source'})
paths=[*T.glob('code/src/**/*.ts'),*T.glob('scripts/*.mjs'),T/'package.json',T/'package-lock.json',T/'tsconfig.json'];inputs=inventory(paths)
old={r['path']:r for r in json.loads((P/'build-inputs.json').read_text())};new={r['path']:r for r in inputs}
delta=[{'before':old.get(k),'after':new.get(k)} for k in sorted(old.keys()|new.keys()) if old.get(k)!=new.get(k)]
assert {r['after']['path'] for r in delta}<=set(allowed),delta
save('build-inputs.json',inputs);save('source-delta.json',delta)
oldGoverning=json.loads((P/'governing-inputs.json').read_text());governing=inventory([T/r['path'] for r in oldGoverning]);governingDelta=[{'before':o,'after':n} for o,n in zip(oldGoverning,governing) if o!=n]
assert {r['after']['path'] for r in governingDelta}<=set(allowed),governingDelta
save('governing-inputs.json',governing)
def generated():return inventory([*T.glob('build/**/*'),*T.glob('contracts/**/*'),T/'product-toolchain-manifest.json'])
before=generated();save('generated-before.json',before)
assert not (T/'artifacts').exists() and not (T/'test_env/evidence').exists(),'preserve unrelated clean targets before build'
start=time.monotonic()
with (D/'build.stdout').open('w') as out,(D/'build.stderr').open('w') as err:p=subprocess.run(['npm','run','build'],cwd=T,stdout=out,stderr=err)
record={'command':['npm','run','build'],'cwd':str(T),'elapsedSeconds':time.monotonic()-start,'exitCode':p.returncode,'stdoutSha256':sha(D/'build.stdout'),'stderrSha256':sha(D/'build.stderr')};save('build.json',record);print(json.dumps(record),flush=True)
if p.returncode:raise SystemExit(p.returncode)
assert inventory(paths)==inputs;assert inventory([T/r['path'] for r in governing])==governing
for r in subject['members']:assert sha(B.parent/r['repo']/r['path'])==r['sha256'],r['path']
after=generated();save('generated-after.json',after);beforeMap={r['path']:r for r in before};afterMap={r['path']:r for r in after}
save('generated-delta.json',[{'path':k,'before':beforeMap.get(k),'after':afterMap.get(k)} for k in sorted(beforeMap.keys()|afterMap.keys()) if beforeMap.get(k)!=afterMap.get(k)])
print(json.dumps({'preservedBuildInputs':len(inputs),'preservedGoverningInputs':len(governing),'generatedMembers':len(after)}),flush=True)
