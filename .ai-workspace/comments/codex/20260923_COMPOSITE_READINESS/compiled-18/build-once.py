from pathlib import Path
import hashlib,json,subprocess,time
B=Path('/Users/jim/src/apps/abiogenesis');T=B/'build_tenants/abiogenesis/typescript';C=B/'.ai-workspace/comments/codex/20260923_COMPOSITE_READINESS';D=C/'compiled-18';P=C/'compiled-17'
S=B/'.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/event-causation-lookup-01/source-subject.json'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
save=lambda name,data:(D/name).write_text(json.dumps(data,indent=2)+'\n')
def inventory(paths):return [{'path':str(p.relative_to(T)),'bytes':p.stat().st_size,'sha256':sha(p)} for p in sorted(set(paths)) if p.is_file()]
frozen=json.loads(S.read_text());assert sha(S)=='efd9697ba809f8d08a363fc2512a1423972c80c5be6f9f207afef1117d604b62'
subject={'members':[{**r,'repo':('abiogenesis' if Path(r['path']).is_relative_to(B) else 'odd_glc'),'path':str(Path(r['path']).relative_to(B if Path(r['path']).is_relative_to(B) else B.parent/'odd_glc'))} for r in frozen['files']]}
for r in subject['members']:assert sha(B.parent/r['repo']/r['path'])==r['sha256'],r['path']
allowed={str((B/r['path']).relative_to(T)):r for r in subject['members'] if r['repo']=='abiogenesis'}
priorMap={r['path']:r for r in json.loads((P/'source-freeze-before-build.json').read_text())['members']};priorMap.update({r['path']:r for r in json.loads((P/'generated-after.json').read_text())})
currentInventory=inventory([T/p for p in priorMap.keys()|allowed.keys()]);currentMap={r['path']:r for r in currentInventory}
changes=[{'before':priorMap.get(k),'after':currentMap.get(k)} for k in sorted(priorMap.keys()|currentMap.keys()) if priorMap.get(k)!=currentMap.get(k)]
assert {r['after']['path'] for r in changes}==set(allowed),changes
for r in changes:
 row=allowed[r['after']['path']];assert r['after']['sha256']==row['sha256']
 if r['before'] is not None:assert r['before']['sha256']==row['preimageSha256'],r['after']['path']
save('source-freeze-before-build.json',{'sourceSubject':sha(S),'members':currentInventory,'exactChangedMembers':changes,'status':'exact_frozen_lookup_delta_source_review_pending'})
paths=[*T.glob('code/src/**/*.ts'),*T.glob('scripts/*.mjs'),T/'package.json',T/'package-lock.json',T/'tsconfig.json'];inputs=inventory(paths)
old={r['path']:r for r in json.loads((P/'build-inputs.json').read_text())};new={r['path']:r for r in inputs}
delta=[{'before':old.get(k),'after':new.get(k)} for k in sorted(old.keys()|new.keys()) if old.get(k)!=new.get(k)]
assert {r['after']['path'] for r in delta}<=set(allowed),delta
save('build-inputs.json',inputs);save('source-delta.json',delta)
oldGoverning=json.loads((P/'governing-inputs.json').read_text());governing=inventory([T/r['path'] for r in oldGoverning]);governingDelta=[{'before':o,'after':n} for o,n in zip(oldGoverning,governing) if o!=n]
assert {r['after']['path'] for r in governingDelta}<=set(allowed),governingDelta
save('governing-inputs.json',governing)
def generated():return inventory([*T.glob('build/**/*'),*T.glob('contracts/**/*'),T/'product-toolchain-manifest.json'])
before=generated();assert before==json.loads((P/'generated-after.json').read_text());save('generated-before.json',before)
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
