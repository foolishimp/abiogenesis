from pathlib import Path
import json,hashlib,subprocess,time,tempfile,tarfile
B=Path('/Users/jim/src/apps/abiogenesis');T=B/'build_tenants/abiogenesis/typescript';D=B/'.ai-workspace/comments/codex/20260923_COMPOSITE_READINESS/compiled-18';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();save=lambda name,data:(D/name).write_text(json.dumps(data,indent=2)+'\n')
assert json.loads((D/'build.json').read_text())['exitCode']==0
(D/'artifacts').mkdir()
def run(label,command,cwd):
 start=time.monotonic()
 with (D/(label+'.stdout')).open('w') as out,(D/(label+'.stderr')).open('w') as err:p=subprocess.run(command,cwd=cwd,stdout=out,stderr=err)
 row={'command':command,'cwd':str(cwd),'elapsedSeconds':time.monotonic()-start,'exitCode':p.returncode,'stdoutSha256':sha(D/(label+'.stdout')),'stderrSha256':sha(D/(label+'.stderr'))};save(label+'.json',row);print(json.dumps(row),flush=True)
 if p.returncode:raise SystemExit(p.returncode)
run('pack',['npm','pack','--ignore-scripts','--json','--pack-destination',str(D/'artifacts')],T)
packed=json.loads((D/'pack.stdout').read_text());assert len(packed)==1
archive=D/'artifacts'/packed[0]['filename'];assert archive.is_file()
bootstrap=Path(tempfile.mkdtemp(prefix='abi5-composite18-install-'));(bootstrap/'package.json').write_text(json.dumps({'name':'abi5-composite18-bootstrap','private':True,'version':'1.0.0'})+'\n')
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
