from pathlib import Path
import json,hashlib,subprocess,time,tempfile,tarfile
B=Path('/Users/jim/src/apps/abiogenesis');T=B/'build_tenants/abiogenesis/typescript';D=B/'.ai-workspace/comments/codex/20260923_COMPOSITE_READINESS/compiled-42';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();save=lambda name,data:(D/name).write_text(json.dumps(data,indent=2)+'\n')
assert json.loads((D/'build-reuse.json').read_text())['status']=='REUSED_EXACT_FROZEN_BUILD'
for r in json.loads((D/'accepted-source.json').read_text())['members']: assert sha(Path(r['path']))==r['sha256'],r['path']
(D/'artifacts').mkdir()
def run(label,command,cwd):
 start=time.monotonic()
 with (D/(label+'.stdout')).open('w') as out,(D/(label+'.stderr')).open('w') as err:p=subprocess.run(command,cwd=cwd,stdout=out,stderr=err)
 row={'command':command,'cwd':str(cwd),'elapsedSeconds':time.monotonic()-start,'exitCode':p.returncode,'stdoutSha256':sha(D/(label+'.stdout')),'stderrSha256':sha(D/(label+'.stderr'))};save(label+'.json',row);print(json.dumps(row),flush=True)
 if p.returncode:raise SystemExit(p.returncode)
run('pack',['npm','pack','--ignore-scripts','--json','--pack-destination',str(D/'artifacts')],T)
packed=json.loads((D/'pack.stdout').read_text());assert len(packed)==1
archive=D/'artifacts'/packed[0]['filename'];assert archive.is_file()
bootstrap=Path(tempfile.mkdtemp(prefix='abi5-composite42-install-'));(bootstrap/'package.json').write_text(json.dumps({'name':'abi5-composite42-bootstrap','private':True,'version':'1.0.0'})+'\n')
run('bootstrap-install',['npm','install','--offline','--ignore-scripts','--no-audit','--no-fund','--package-lock=false',str(archive)],bootstrap)
installed=bootstrap/'node_modules/@abiogenesis/typescript-tenant';records=[]
with tarfile.open(archive,'r:gz') as tgz:
 names=set()
 for member in tgz.getmembers():
  if not member.isfile():
   assert member.isdir(),'unsupported nonregular archive member: '+member.name
   continue
  assert member.name.startswith('package/') and '..' not in Path(member.name).parts
  rel=member.name[len('package/'):];assert rel not in names;names.add(rel)
  body=tgz.extractfile(member).read();digest=hashlib.sha256(body).hexdigest()
  source=T/rel;target=installed/rel
  assert source.is_file() and target.is_file(),rel
  assert sha(source)==digest,('source mismatch',rel)
  assert sha(target)==digest,('installed mismatch',rel)
  records.append({'path':rel,'bytes':len(body),'sha256':digest})
 actual={str(p.relative_to(installed)) for p in installed.rglob('*') if p.is_file()}
 assert actual==names,{'extra':sorted(actual-names),'missing':sorted(names-actual)}
records.sort(key=lambda r:r['path']);save('archive-members.json',records)
identity={'artifactPath':str(archive),'artifactDigest':'sha256:'+sha(archive),'archiveBytes':archive.stat().st_size,'packageRoot':str(installed),'bootstrapRoot':str(bootstrap),'archiveMembers':len(records)}
save('package-identity.json',identity);save('package-correspondence.json',{'status':'exact',**identity,'sourceMatches':len(records),'installedMatches':len(records),'extraInstalledMembers':0,'scripts':'disabled','network':'npm offline','archiveMembersSha256':sha(D/'archive-members.json')});print(json.dumps(identity),flush=True)

prior={r['path']:r for r in json.loads((D.parent/'compiled-41/archive-members.json').read_text())}
current={r['path']:r for r in records}
delta=[{'path':k,'before':prior.get(k),'after':current.get(k)} for k in sorted(prior.keys()|current.keys()) if prior.get(k)!=current.get(k)]
allowed=set(json.loads((D/'accepted-source.json').read_text())['allowedPackageDeltas'])
assert {r['path'] for r in delta}<=allowed, [r['path'] for r in delta if r['path'] not in allowed]
save('generated-delta.json',delta)
for r in json.loads((D/'accepted-source.json').read_text())['members']: assert sha(Path(r['path']))==r['sha256'],r['path']
save('conservation.json',{'predecessor':'compiled-41','unchanged':len(records)-len(delta),'changed':len(delta),'changedPaths':[r['path'] for r in delta],'outsideAcceptedScope':[]})
