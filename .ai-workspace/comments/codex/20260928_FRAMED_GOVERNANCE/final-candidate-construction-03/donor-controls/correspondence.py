from pathlib import Path
import json,hashlib,tarfile,time
D=Path(__file__).resolve().parent;T=D/'staged-repo/build_tenants/abiogenesis/typescript';I=D/'install/node_modules/@abiogenesis/typescript-tenant';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();save=lambda n,v:(D/n).write_text(json.dumps(v,indent=2)+'\n');start=time.monotonic()
packed=json.loads((D/'pack.stdout').read_text());assert len(packed)==1;A=D/'artifacts'/packed[0]['filename'];rows=[];names=set();nonregular=[]
with tarfile.open(A,'r:gz') as tar:
 for m in tar.getmembers():
  if not m.isfile():assert m.isdir(),'unsupported archive member '+m.name;nonregular.append({'path':m.name,'kind':'directory'});continue
  assert m.name.startswith('package/') and '..' not in Path(m.name).parts,m.name
  rel=m.name[len('package/'):];assert rel not in names;names.add(rel);body=tar.extractfile(m).read();digest=hashlib.sha256(body).hexdigest()
  for root in [T,I]:assert (root/rel).is_file() and not (root/rel).is_symlink() and sha(root/rel)==digest,(str(root),rel)
  rows.append({'path':rel,'bytes':len(body),'sha256':digest,'archiveMode':m.mode})
actual={str(p.relative_to(I)) for p in I.rglob('*') if p.is_file()};assert actual==names,{'extra':sorted(actual-names),'missing':sorted(names-actual)}
links=[]
for root in [T/'node_modules',D/'install/node_modules']:
 for p in sorted(root.rglob('*')):
  if p.is_symlink():assert p.resolve().is_relative_to(root.resolve()),str(p);links.append({'path':str(p.relative_to(D)),'target':str(p.readlink())})
rows.sort(key=lambda r:r['path']);save('archive-members.json',rows);save('dependency-and-bin-links.json',links)
identity={'artifactPath':str(A),'artifactDigest':'sha256:'+sha(A),'archiveBytes':A.stat().st_size,'packageRoot':str(I),'bootstrapRoot':str(D/'install'),'archiveMembers':len(rows)};save('package-identity.json',identity)
projected={r['path'] for r in packed[0]['files']};assert projected==names,{'packProjectionMissing':sorted(names-projected),'packProjectionExtra':sorted(projected-names)}
save('package-correspondence.json',{'status':'exact',**identity,'stagedMatches':len(rows),'installedMatches':len(rows),'extraInstalledMembers':0,'missingInstalledMembers':0,'archiveNonregular':nonregular,'symlinkHandling':'No archive or installed Product payload symlinks; npm bin links explicitly confined to each node_modules root. Source staging never links canonical source or dependencies.','scripts':'disabled in dependency realization, pack and install','network':'offline','archiveMembersSha256':sha(D/'archive-members.json'),'elapsedSeconds':time.monotonic()-start});print(json.dumps(identity),flush=True)
