"""Root custody only, gated on exact bounded acceptance. Never edits Product code."""
from pathlib import Path
import json,hashlib,tarfile,gzip,io,os,subprocess,datetime,re
C=Path(__file__).resolve().parent
F=C/'f4-03-r1'
S=Path('/Users/jim/src/apps/abiogenesis-rc5-performance')
E=S/'.ai-workspace/work/T287_RC5_LOCAL_EVIDENCE_01'
def read(p):return json.loads(p.read_text())
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  while b:=f.read(1048576):h.update(b)
 return h.hexdigest()
def write(p,v):
 with p.open('x') as f:json.dump(v,f,indent=2);f.write('\n')
accept=read(F/'ROOT_FINAL_ACCEPTANCE.json')
assert accept['status']=='BOUNDED_RC5_CANDIDATE_ACCEPTED_NOT_QUALIFIED'
proof=read(F/'GENERATED_ADOPTION.PREPARED.json')
assert accept['c2ResultRef']==proof['c2ResultRef']
assert accept['artifactDigest']=='sha256:'+proof['archive']['sha256']
resume=read(F/'execution/after-run-resume.json')
log=C/'runtime-001/resources/events/runtime.events.jsonl'
assert log.stat().st_size==resume['state']['closeHandoff']['prefix']['prefixLength']
assert not E.exists()
write(F/'ROOT_EVIDENCE_CUSTODY_AUTHORITY.json',{'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'roleTransition':'Executive bounded conjunction -> Root evidence custody Writer',
 'grant':'Exact copies and content-checked archives of operator inputs, acceptance and failed/green evidence; closed event log byte copy; local source checkpoint follows separately',
 'exclusions':['No Product source authoring','No old evidence mutation','No portable reopen-authority claim','No publication/global selector or qualification']})
E.mkdir(parents=True)
secret=re.compile(rb'sk-(?:ant-(?:api|oat)\d+|proj)-[A-Za-z0-9_-]{20,}')
def archive(name,rows):
 dest=E/name;index=[]
 with dest.open('xb') as raw,gzip.GzipFile(filename='',fileobj=raw,mode='wb',mtime=0,compresslevel=6) as gz,tarfile.open(fileobj=gz,mode='w|') as tar:
  for logical,p in sorted(rows.items()):
   assert not p.is_symlink() and p.is_file()
   before=p.stat();b=p.read_bytes();assert not secret.search(b),'Possible credential in selected evidence: '+str(p)
   after=p.stat();assert (before.st_dev,before.st_ino,before.st_size,before.st_mtime_ns)==(after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns)
   h=hashlib.sha256(b).hexdigest();item=tarfile.TarInfo(logical);item.size=len(b);item.mode=before.st_mode&0o777;item.mtime=0;item.uid=item.gid=0
   tar.addfile(item,io.BytesIO(b));index.append({'member':logical,'originalPath':str(p),'bytes':len(b),'sha256':h})
 expected={r['member']:r for r in index};seen=[]
 with tarfile.open(dest,'r:gz') as tar:
  for m in tar:
   b=tar.extractfile(m).read();r=expected[m.name];assert len(b)==r['bytes'] and hashlib.sha256(b).hexdigest()==r['sha256'];seen.append(m.name)
 assert len(seen)==len(expected)==len(set(seen))
 return {'path':str(dest.relative_to(S)),'bytes':dest.stat().st_size,'sha256':sha(dest),'members':index}
inputs={str(p.relative_to(S)):p for p in (S/'rc5-operator-inputs').rglob('*') if p.is_file()}
# The selected C2 snapshot also consumes direct copies of the exact installed
# STDO native skills. Preserve those declared text inputs, not host settings.
workload=read(F/'workload.json')
nativeSkillInputs=[p for p in workload['testing']['selectedPaths']
 if p.startswith(('.claude/skills/','.claude/references/','.claude/scripts/'))]
for relative in nativeSkillInputs:
 p=S/relative;assert p.is_file() and not p.is_symlink();inputs[relative]=p
inputArchive=archive('operator-inputs.tar.gz',inputs)
records={}
for p in C.iterdir():
 if p.is_file():records['campaign/'+p.name]=p
for name in ['operator-client','method-01','method-01-r2','f4-01','f4-02','f4-03','f4-03-r1']:
 for p in (C/name).rglob('*'):
  if not p.is_file():continue
  rel=p.relative_to(C)
  if p.name in ['resume.json','after-run-resume.json','OBSERVED_FAILED_SELECTOR_TASK.json']:continue
  records['campaign/'+str(rel)]=p
helpers=C/'runtime-001/resources/archives/worksite-command-execution'
for p in helpers.glob('*/*/result.json'):
 records['producer-helpers/'+str(p.relative_to(helpers))]=p
for p in (C/'runtime-001/resources/archives').glob('fp-*'):
 if p.is_file():records['actor-archives/'+p.name]=p
for p in [Path(proof['proofArtifact']['path']),Path(proof['helperPath'])]:records['selected-producer/'+p.name]=p
records['selected-producer/ROOT_FINAL_ACCEPTANCE.json']=F/'ROOT_FINAL_ACCEPTANCE.json'
evidenceArchive=archive('campaign-evidence.tar.gz',records)
before=log.stat();logCopy=E/'runtime.events.jsonl.gz'
with log.open('rb') as src,logCopy.open('xb') as raw,gzip.GzipFile(filename='',fileobj=raw,mode='wb',mtime=0,compresslevel=6) as dest:
 h=hashlib.sha256();n=0
 while b:=src.read(1048576):dest.write(b);h.update(b);n+=len(b)
after=log.stat();assert (before.st_dev,before.st_ino,before.st_size,before.st_mtime_ns)==(after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns)
with gzip.open(logCopy,'rb') as src:
 check=hashlib.sha256();count=0
 while b:=src.read(1048576):check.update(b);count+=len(b)
assert count==n==before.st_size and check.hexdigest()==h.hexdigest()
for source,name in [(F/'ROOT_FINAL_ACCEPTANCE.json','ACCEPTANCE.json'),(F/'INDEPENDENT_SOURCE_REVIEW.json','FINAL_SOURCE_REVIEW.json'),(Path(proof['proofArtifact']['path']),'FINAL_PROOF.json')]:
 with (E/name).open('xb') as out:out.write(source.read_bytes())
index={'kind':'rc5_source_evidence_custody','status':'PREPARED_FOR_LOCAL_SOURCE_CHECKPOINT','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'nativeSourceResultRef':proof['nativeSourceResultRef'],'priorNativeSourceResultRef':proof.get('priorNativeSourceResultRef'),
 'c2ResultRef':proof['c2ResultRef'],'archive':proof['archive'],'operatorInputs':inputArchive,'nativeSkillInputs':nativeSkillInputs,'campaignEvidence':evidenceArchive,
 'eventLogCopy':{'path':str(logCopy.relative_to(S)),'bytes':logCopy.stat().st_size,'sha256':sha(logCopy),'originalPath':str(log),'originalDevice':before.st_dev,'originalInode':before.st_ino,'originalBytes':n,'originalSha256':h.hexdigest()},
 'sourcePreimageCommit':subprocess.check_output(['git','-C',str(S),'rev-parse','HEAD'],text=True).strip(),
 'limits':['This preimage is not the later adoption commit. Local cut record names the final source checkpoint.',
 'Copied log preserves inspection bytes only; original machine-bound reopen authority is not portable.',
 'Original files, dirty main work, failed Runs and immutable releases remain in place.',
 'No full qualification, stable release, publication, push or global selector change.']}
write(E/'INDEX.json',index)
(E/'README.md').write_text('''# RC5 local candidate evidence

This directory retains the bounded acceptance, final selected proof and review,
exact operator inputs, historical failures, and the closed campaign event log.
The local cut record separately binds the final source commit and installed
payload inventory. This is not whole-Product qualification or a stable release.

`INDEX.json` checksums every archived member and records its original path.
`operator-inputs.tar.gz` uses repository-relative paths; extract into a separate
checkout to reconstruct the selected seeds/recipes and the exact installed STDO
skill/reference/script text consumed by C2. It contains no host settings. Native campaign records
retain their original machine coordinates and do not promise portable reopen.

The source tree contains the exact native changes and adopted generated files.
An isolated source build/pack compares its archive bytes with the actual C2
archive. The later local cut directory owns that reproduction and installation
receipt; those operations do not repeat qualification.
''')
write(F/'EVIDENCE_CUSTODY_PREPARED.json',{'status':index['status'],'directory':str(E),'indexSha256':sha(E/'INDEX.json'),
 'operatorInputFiles':len(inputs),'campaignFiles':len(records),'originalEventLogSha256':h.hexdigest(),'originalEventLogBytes':n,
 'archiveBytes':inputArchive['bytes']+evidenceArchive['bytes']+logCopy.stat().st_size})
print(json.dumps({'status':index['status'],'directory':str(E),'inputFiles':len(inputs),'evidenceFiles':len(records),'eventLogBytes':n,'archiveBytes':inputArchive['bytes']+evidenceArchive['bytes']+logCopy.stat().st_size}))
