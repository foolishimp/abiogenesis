import datetime, hashlib, json, os, subprocess, tarfile
from pathlib import Path

CUT = Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc8-local-cut-01')
OUT = CUT / 'reviews/packaging-001'
ACT = CUT / 'actual-001'
W = Path('/Users/jim/src/apps/abiogenesis-rc8-reference-preservation')
COMMIT = '2019d62e4bb5d28183cc720b904d7901f19dc44a'
TREE = '4c8a9240aba29eb2858ddfd719a92337a033128c'
TENANT = 'build_tenants/abiogenesis/typescript'
failures = []
def check(ok, label, detail=None):
    if not ok: failures.append({'relation':label,'detail':detail})
def sha(b): return hashlib.sha256(b).hexdigest()
def read(p): return json.loads(Path(p).read_bytes())
def pin(p):
    p=Path(p); b=p.read_bytes()
    return {'path':str(p),'bytes':len(b),'sha256':sha(b)}
def git(*args):
    return subprocess.check_output(['git','--no-optional-locks','-C',str(W),*args], env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'})
def walk_pins(x, out):
    if isinstance(x,dict):
        if {'path','bytes','sha256'} <= x.keys() and str(x['path']).startswith('/'):
            out[(x['path'],x['sha256'])]={k:x[k] for k in ('path','bytes','sha256')}
        for v in x.values(): walk_pins(v,out)
    elif isinstance(x,list):
        for v in x: walk_pins(v,out)

b=read(CUT/'final-bindings-001/ROOT_BUILD_BINDINGS.json')
cp=read(ACT/'SOURCE_CHECKPOINT.json')
rp=read(ACT/'reproduction/RESULT.json')
candidate=read(ACT/'candidate/RESULT.json')
pending=read(ACT/'INSTALL_INPUTS_PENDING.json')
inv=read(b['source']['inventory']['path'])
freeze=read(b['source']['subject']['path'])
pins={}
for d in [b,cp,rp,candidate,pending,read(ACT/'BUILD_RESULT.json'),read(ACT/'EXACT_TESTED_ARTIFACT.json')]:walk_pins(d,pins)
for p in pins.values():
    try: check(pin(p['path'])==p,'pinned input',p)
    except Exception as e: check(False,'pinned input unavailable',{'pin':p,'error':str(e)})

check(git('rev-parse',COMMIT+'^{tree}').decode().strip()==TREE,'commit tree')
check(git('rev-parse',COMMIT+'^').decode().strip()==b['source']['baseCommit'],'checkpoint sole predecessor')
check(git('rev-parse','HEAD').decode().strip()==COMMIT,'current checkpoint head')
check(not git('diff','--name-only',COMMIT).strip(),'tracked worktree unchanged')
check(not git('diff','--cached','--name-only').strip(),'index unchanged')
tree={}
for r in git('ls-tree','-rz',COMMIT).split(b'\0'):
    if r:
        meta,name=r.split(b'\t',1); mode,kind,oid=meta.decode().split();tree[name.decode()]={'mode':mode,'kind':kind,'oid':oid}
changed=git('diff-tree','--no-commit-id','--name-only','-r',COMMIT).decode().splitlines()
check(sorted(changed)==sorted(b['source']['expectedChangedPaths']),'exact selected checkpoint paths',changed)
for path,mode in b['source']['fileModes'].items():check(tree.get(path,{}).get('mode')==mode,'selected mode',path)
rows={x['relativePath']:x for x in inv['files']}
check(len(rows)==1339,'source row count')
check({x['path']:(x['bytes'],x['sha256']) for x in freeze['rows']}=={k:(v['bytes'],v['sha256']) for k,v in rows.items()},'accepted freeze inventory equality')
proc=subprocess.Popen(['git','--no-optional-locks','-C',str(W),'cat-file','--batch'],stdin=subprocess.PIPE,stdout=subprocess.PIPE,env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'})
def blob(path):
    proc.stdin.write((COMMIT+':'+path+'\n').encode());proc.stdin.flush()
    header=proc.stdout.readline().decode().split()
    if header[-1]=='missing':return None
    data=proc.stdout.read(int(header[-1]));proc.stdout.read(1);return data
for name,row in rows.items():
    data=blob(name)
    check(data is not None and (len(data),sha(data))==(row['bytes'],row['sha256']),'Git accepted source row',name)
    data=Path(row['sourceSnapshot']).read_bytes()
    check((len(data),sha(data))==(row['bytes'],row['sha256']),'frozen source snapshot',name)

selected_prefixes=[TENANT+'/', 'specification/']
source_expected={name for name in tree if any(name.startswith(p) for p in selected_prefixes) or name in ['stdo_abiogenesis.json','AGENTS.md','CLAUDE.md']}
source_actual=set()
with tarfile.open(rp['sourceArchive']['path']) as tar:
    for member in tar.getmembers():
        if member.isdir():continue
        source_actual.add(member.name)
        data=tar.extractfile(member).read() if member.isfile() else member.linkname.encode()
        check(data==blob(member.name),'source tar Git object relation',member.name)
        check(member.mode & 0o111 == (0o111 if tree.get(member.name,{}).get('mode')=='100755' else 0),'source tar mode',member.name)
check(source_actual==source_expected,'source tar selected member set',{'missing':sorted(source_expected-source_actual),'extra':sorted(source_actual-source_expected)})
proc.stdin.close();proc.wait()

def archive_map(path):
    answer={}; duplicate=[]
    with tarfile.open(path) as tar:
        for m in tar.getmembers():
            if m.name in answer:duplicate.append(m.name)
            check(m.isfile(),'package regular member',m.name)
            check(m.name.startswith('package/') and '..' not in m.name.split('/'),'package safe member',m.name)
            data=tar.extractfile(m).read() if m.isfile() else b''
            answer[m.name]={'bytes':len(data),'sha256':sha(data),'mode':m.mode,'type':m.type.decode()}
    check(not duplicate,'unique archive names',duplicate)
    return answer
a1=archive_map(candidate['archive']['path']);a2=archive_map(rp['archive']['path'])
check(a1==a2,'all package members equal')
check(len(a1)==5325,'5325 archive members')
check(Path(candidate['archive']['path']).read_bytes()==Path(rp['archive']['path']).read_bytes(),'archive byte equality')
with tarfile.open(candidate['archive']['path']) as t:
    manifest_bytes=t.extractfile('package/product-toolchain-manifest.json').read()
    manifest=json.loads(manifest_bytes);package=json.load(t.extractfile('package/package.json'))
check(manifest_bytes==Path(candidate['manifest']['path']).read_bytes()==Path(rp['manifest']['path']).read_bytes(),'manifest exact bytes')
check(set('package/'+p for p in manifest['productRelativeLocators'])|{'package/package.json','package/product-toolchain-manifest.json'}==set(a1),'manifest locators complete package set')
for k in ['packageName','packageVersion','productId','productContentDigest']:check(manifest[k]==pending['expected'][k],'install expected identity '+k)
check(package['name']==pending['expected']['packageName'] and package['version']==pending['expected']['packageVersion'],'package metadata identity')
canonical=json.dumps(manifest,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
check('sha256:'+sha(canonical)==pending['expected']['manifestDigest'],'canonical manifest identity')
exports=[]
for name,targets in package['exports'].items():
    for role,target in targets.items():
        check('package/'+target.removeprefix('./') in a1,'export member',{'export':name,'role':role,'target':target});exports.append(target)
unshipped=inv['composition']['cumulativeUnshippedChangedPaths']
for path in unshipped:check('package/'+path.removeprefix(TENANT+'/') not in a1,'test successor remains unshipped',path)
command_receipts=[]
for p in sorted((ACT/'commands').glob('*.result.json')):
    d=read(p);check(d['exitCode']==0 and d['signal'] is None and not d['timedOut'] and not d['truncated'] and not d['failure'],'successful retained command',p.name)
    for stream in ['stdout','stderr']:
        x=d[stream]; data=(ACT/x['path']).read_bytes();check(len(data)==x['byteCount'] and 'sha256:'+sha(data)==x['digest'],'command output custody',str(p)+':'+stream)
    command_receipts.append(pin(p))
result={'kind':'independent_packaging_mechanical_reacquisition','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceCommit':COMMIT,'sourceTree':TREE,'pinnedInputsVerified':len(pins),'sourceRowsComparedToGitAndFrozenSnapshots':len(rows),'selectedCheckpointPaths':len(changed),'sourceArchiveMembersComparedToGit':len(source_actual),'archiveMemberCount':len(a1),'equalArchiveMembers':len(a1) if a1==a2 else None,'packageExportTargetsPresent':len(exports),'unshippedSuccessorPaths':unshipped,'retainedCommandReceipts':command_receipts,'archive':candidate['archive'],'reproductionArchive':rp['archive'],'manifest':candidate['manifest'],'installInputs':pin(ACT/'INSTALL_INPUTS_PENDING.json'),'failures':failures,'effects':'Only this script and evidence records under reviews/packaging-001; read-only Git object/hash/archive inspection; no tests, build, repack, install, SDK, providers or candidate changes.'}
(OUT/'MECHANICAL_REACQUISITION.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k!='retainedCommandReceipts'},indent=2))
