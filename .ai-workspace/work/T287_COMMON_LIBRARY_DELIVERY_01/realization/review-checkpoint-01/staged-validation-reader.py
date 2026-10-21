from pathlib import Path
import collections,hashlib,json,re,subprocess,time,traceback
R=Path.cwd();C=R/'.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/review-checkpoint-01';E=C.parent/'closed-evidence-portability-03/successor-03';start=time.monotonic()
def write(n,v):
 with (C/n).open('x') as f:json.dump(v,f,indent=2);f.write('\n')
def digest(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1024**2),b''):h.update(b)
 return h.hexdigest()
try:
 raw=(C/'staged-name-status.z').read_bytes();bits=raw.decode().split('\0');assert bits.pop()=='';assert len(bits)%2==0;changed=[dict(status=bits[i],path=bits[i+1]) for i in range(0,len(bits),2)];paths={r['path'] for r in changed}
 assert all('continuation-17' not in Path(p).parts for p in paths)
 initial=json.loads((C/'initial-inventory.json').read_text());wanted={r['path'] for r in initial['rows']};missing=sorted(wanted-paths);assert not missing,('Initial visible rows not staged',missing[:10])
 added=sorted(paths-wanted);cp=str(C.relative_to(R))+'/';tp=str(E.parent.relative_to(R))+'/'
 unexpected=[p for p in added if p!='.gitattributes' and not p.startswith((cp,tp))];assert not unexpected,('Unexplained new source drift',unexpected[:10])
 expected={r['path']:r for r in json.loads((E/'repository-dependencies.json').read_text())['files']}
 for p in [E/'freeze.json',E/'manifest.json']:
  rel=str(p.relative_to(R));expected[rel]=dict(path=rel,sha256=digest(p),bytes=p.stat().st_size)
 first=json.loads((C/'lfs-selection.json').read_text());second=json.loads((C/'lfs-selection-02.json').read_text())['content']
 for native in [first,second]:
  row={key:native[key] for key in ['path','sha256','bytes']};expected[row['path']]=row
 index={};requested=sorted(expected)
 for at in range(0,len(requested),100):
  data=subprocess.check_output(['git','ls-files','--stage','-z','--',*requested[at:at+100]],cwd=R)
  for entry in data.decode().split('\0'):
   if not entry:continue
   head,path=entry.split('\t',1);mode,oid,stage=head.split();assert stage=='0';index[path]=dict(mode=mode,oid=oid)
 assert set(index)==set(expected),('Missing staged dependency',sorted(set(expected)-set(index))[:10])
 by_oid=collections.defaultdict(list)
 for path,item in index.items():by_oid[item['oid']].append(path)
 cat=subprocess.Popen(['git','cat-file','--batch'],cwd=R,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE);verified=[];lfs=[]
 for oid,group in by_oid.items():
  cat.stdin.write((oid+'\n').encode());cat.stdin.flush();header=cat.stdout.readline().decode().strip().split();assert header[0]==oid and header[1]=='blob';n=int(header[2]);remaining=n;h=hashlib.sha256();prefix=b''
  while remaining:
   b=cat.stdout.read(min(remaining,1024**2));assert b;h.update(b);remaining-=len(b)
   if len(prefix)<1024:prefix+=(b[:1024-len(prefix)])
  assert cat.stdout.read(1)==b'\n';actual=h.hexdigest();match=re.fullmatch(rb'version https://git-lfs.github.com/spec/v1\noid sha256:([0-9a-f]{64})\nsize ([0-9]+)\n',prefix) if n<=1024 else None
  for path in group:
   want=expected[path]
   if match:
    content_h=match[1].decode();content_n=int(match[2]);assert (content_h,content_n)==(want['sha256'],want['bytes']),path
    object_path=R/'.git/lfs/objects'/content_h[:2]/content_h[2:4]/content_h;assert object_path.stat().st_size==content_n and digest(object_path)==content_h,path
    lfs.append(dict(path=path,pointerBlob=oid,pointerBytes=n,oidSha256=content_h,contentBytes=content_n,localLfsObjectVerified=True))
   else:assert (actual,n)==(want['sha256'],want['bytes']),('Staged byte mismatch',path)
   verified.append(dict(path=path,indexMode=index[path]['mode'],blob=oid,sha256=want['sha256'],bytes=want['bytes'],storage='lfs' if match else 'git_blob'))
 cat.stdin.close();assert cat.wait()==0
 package_routes=json.loads((E/'activation.json').read_text())['authorizedRepositoryPackages'];assert all(p['transport']['path'] in index for p in package_routes)
 groups=collections.Counter('/'.join(r['path'].split('/')[:6]) for r in changed)
 write('staged-inventory.json',dict(changes=changed,initialVisibleEntries=len(wanted),initialVisibleEntriesPreserved=len(wanted),newCheckpointEntries=len(added),newCheckpointPaths=added,statusCounts=dict(collections.Counter(r['status'] for r in changed)),largestGroups=groups.most_common(20)))
 write('staged-dependencies.json',dict(verified=verified,uniqueGitBlobs=len(by_oid),lfs=lfs,packageRepositoryRoutes=package_routes))
 write('staged-validation.json',dict(status='satisfied',changedEntries=len(changed),initialVisibleEntriesPreserved=len(wanted),newCheckpointEntries=len(added),stagedDependenciesVerified=len(verified),uniqueGitBlobs=len(by_oid),lfsPayloadsVerified=len(lfs),bothExactPackageRoutesStaged=True,sourceDrift=0,mismatches=0,wallSeconds=time.monotonic()-start))
 print(json.dumps(json.loads((C/'staged-validation.json').read_text())))
except Exception as error:
 write('STOP-staged-validation-successor.json',dict(firstCause=repr(error),traceback=traceback.format_exc(),stop='Return Root before repair or commit'))
 raise
