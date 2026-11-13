import datetime, hashlib, json, os, pathlib, shutil, subprocess, difflib

N = pathlib.Path(__file__).resolve().parent
C = N.parent
F = pathlib.Path('/private/tmp/abg-rc11-foundation-20261110-01')
R = pathlib.Path('/Users/jim/src/apps/abiogenesis')
OLD = pathlib.Path('/private/tmp/abg-rc11-qualification-20261109')
T = 'build_tenants/abiogenesis/typescript/'
native = [T+'test_env/tests/m5-worker-transport.test.mjs']
tracking = []
env = dict(os.environ, GIT_OPTIONAL_LOCKS='0')
def sha(b): return hashlib.sha256(b).hexdigest()
def pin(p):
    p = pathlib.Path(p); b = p.read_bytes()
    return dict(path=str(p), bytes=len(b), sha256=sha(b))
def write(p, value):
    p = pathlib.Path(p)
    with p.open('x') as out: out.write(json.dumps(value, indent=2)+'\n')
    return pin(p)
def git(root, *args):
    return subprocess.check_output(['git','-C',str(root),*args],env=env,text=True)
def checked(p):
    actual = pin(p['path'])
    return dict(expected=p, actual=actual, equal=actual==p)

final = json.loads((N/'runtime-001/FINAL.json').read_text())
pre = json.loads((C/'native-02/source-freeze.json').read_text())
binding = json.loads((N/'BINDING.json').read_text())
baseline = json.loads((N/'PRESERVATION_GUARDS.json').read_text())
running = {'rows':[{'after':r} for r in baseline['mainTracking']]}
before = {r['path']:r for r in pre['rows']}
paths = sorted(set(before)|{p for p in native if (F/p).exists()})
frozen = N/'frozen-source'
frozen.mkdir()
rows=[]; changed=[]; missing=[]
for rel in paths:
    source=F/rel
    if not source.is_file() or source.is_symlink():
        missing.append(rel); continue
    p=pin(source); row=dict(path=rel,bytes=p['bytes'],sha256=p['sha256'])
    dest=frozen/rel; dest.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(source,dest)
    assert pin(dest)['sha256']==row['sha256']
    rows.append(row)
    if before.get(rel)!=row: changed.append(dict(path=rel,before=before.get(rel),after=row))
digest=sha(json.dumps(rows,separators=(',',':')).encode())
freeze=write(N/'source-freeze.json',dict(status='ACTUAL_NATIVE_RETURN_SOURCE_FROZEN_NOT_ACCEPTED',
    utc=datetime.datetime.now(datetime.timezone.utc).isoformat(),sourceRoot=str(F),frozenRoot=str(frozen),
    sourceCommit=pre['sourceCommit'],sourceTree=pre['sourceTree'],sourceDigest=digest,
    predecessor=pin(C/'native-02/source-freeze.json'),rows=rows,missing=missing,
    absentNewTargets=[p for p in native[2:] if not (F/p).exists()]))
for row in rows:
    assert pin(F/row['path'])['sha256']==row['sha256'], 'Source moved during freeze'
rel=native[0]
diff=''.join(difflib.unified_diff((pathlib.Path(pre['frozenRoot'])/rel).read_text().splitlines(keepends=True),(F/rel).read_text().splitlines(keepends=True),fromfile=str(pathlib.Path(pre['frozenRoot'])/rel),tofile=str(F/rel)))
for rel in native[2:]:
    if (F/rel).is_file():
        part=subprocess.run(['git','diff','--no-index','--','/dev/null',str(F/rel)],env=env,text=True,capture_output=True)
        assert part.returncode in (0,1); diff+=part.stdout
with (N/'SOURCE_DELTA.diff').open('x') as out: out.write(diff)
status=git(F,'status','--porcelain=v1','--untracked-files=all')
with (N/'SOURCE_GIT_STATUS.txt').open('x') as out: out.write(status)
guards=[checked(p) for p in baseline['indices']]
guards.extend(checked(row['after']) for row in running['rows'])
guards.extend(checked(p) for p in binding['readOnlyInputPins'])
guards.extend(checked(p) for p in [binding['builderPin'],binding['archive'],binding['workspaceOpenManifest'],*binding['dependencyPins'],*binding['prebuiltPins']])
heads={str(p):git(p,'rev-parse','HEAD').strip() for p in [R,OLD,F]}
custody=write(N/'SOURCE_CUSTODY.json',dict(status='FROZEN_FOR_ROOT_AND_INDEPENDENT_ASSURANCE',
    freeze=freeze,sourceDigest=digest,sourceRows=len(rows),nativeWritePaths=native,
    nativeChanged=[r for r in changed if r['path'] in native],
    operatorTrackingChanged=[r for r in changed if r['path'] in tracking],
    unexpectedChanged=[r for r in changed if r['path'] not in native+tracking],missing=missing,
    guards=guards,allListedGuardsConserved=all(g['equal'] for g in guards),heads=heads,
    final=pin(N/'runtime-001/FINAL.json'),actualPhysicalClose=final.get('actualPhysicalClose'),
    delta=pin(N/'SOURCE_DELTA.diff'),gitStatus=pin(N/'SOURCE_GIT_STATUS.txt'),
    limits='Source inventory and named protection checks; native observation/tool history are separate. No global absence or full read-scope conformance claim. No source acceptance or external proof.'))
print(json.dumps(dict(freeze=freeze,custody=custody,sourceDigest=digest,rows=len(rows),
    nativeChanged=[r['path'] for r in changed if r['path'] in native],
    unexpectedChanged=[r['path'] for r in changed if r['path'] not in native+tracking],
    missing=missing,guardsConserved=all(g['equal'] for g in guards))))
