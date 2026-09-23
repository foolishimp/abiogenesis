import gzip,hashlib,json,os,re,stat,subprocess,sys
from pathlib import Path
repo=Path(sys.argv[1]).resolve();A=Path('/Users/jim/src/apps/abiogenesis');root=repo/'.ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/successor-08';rel=root.relative_to(repo).as_posix();T=A/'.ai-workspace/comments/codex/20260924_EXECUTIVE_CHECKPOINT/tracking-04'
def git(*a):return subprocess.check_output(['git',*a],cwd=repo)
def effect(*a):subprocess.run(['git',*a],cwd=repo,check=True)
def paths(*a):return {os.fsdecode(p)for p in git(*a,'-z').split(b'\0')if p}
def sha(p):
 h=hashlib.sha256()
 with p.open('rb')as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
def write(n,v):(root/n).write_text(json.dumps(v,indent=2)+'\n')
base=json.loads((root/'activation.json').read_text())['basisCommit'];assert git('rev-parse','HEAD').decode().strip()==base;remote=git('ls-remote','origin','refs/heads/main').decode().split();assert remote[0]==base;assert git('symbolic-ref','--short','HEAD').decode().strip()=='main';assert not paths('diff','--cached','--name-only')
accept=json.loads((T/'executive-disposition.json').read_text());assert accept['status']=='accepted_factual_process_failure_and_bounded_nested_compose'
selection=json.loads((root/'selection.json').read_text());direct=dict(selection['directExpected']);archived={};banks=[]
for name in ['transport-01','transport-02']:
 p=root/name
 if not p.exists():continue
 c=json.loads((p/'catalog.json').read_text());v=json.loads((p/'verification.json').read_text());assert v['originalsComparedAfterPacking']and v['allMemberPathsAndHashesVerified']and c['credentialShapeFindingCount']==0
 with gzip.open(p/'members.jsonl.gz','rt')as f:
  for r in map(json.loads,f):assert r['path']not in archived;archived[r['path']]=r
 banks.append({'root':str(p.relative_to(repo)),'catalogSha256':sha(p/'catalog.json'),'indexSha256':c['indexSha256'],'verificationSha256':sha(p/'verification.json'),'members':c['archiveMemberCount'],'logicalBytes':c['archiveMemberBytes'],'transportBytes':c['transportBytes']})
# Freeze-bound tracking04 only; prior bank/source bytes are reused unchanged.
if repo==A:
 d=json.loads((T/'freeze.json').read_text())
 for r in d['carrier']:
  assert sha(A/r['path'])==r['sha256'];direct[r['path']]={'sha256':r['sha256'],'classification':'closed_tracking03'}
 direct[str((T/'freeze.json').relative_to(A))]={'sha256':sha(T/'freeze.json'),'classification':'closed_tracking03_freeze'}
for r in json.loads((T/'freeze.json').read_text())['postimages']:
 if r['repo']==repo.name:direct[r['path']]={'sha256':r['sha256'],'classification':'accepted_current_tracking'}
for p,e in direct.items():assert sha(repo/p)==e['sha256'],('Direct postimage changed',p)
assert not any(p in direct for p in archived)
exclusions=['All original mutable GLC/S02 journals and canonical worksites; no read/hash/copy','original-run-allocation-diagnosis-01 and successors','s02-installed-continuation-16 and later active readiness/execution','All node_modules, installed dependency trees, build scratch and unselected caches']
for p in set(archived)|set(direct):assert not any(s in p for s in ['/node_modules/','/episode-01/resources/','s02-installed-continuation-16','original-run-allocation-diagnosis-01/']),p
ignore=repo/'.ai-workspace/comments/.gitignore';(root/'ignore-preimage.txt').write_bytes(ignore.read_bytes())
def literal(p):return ''.join('\\'+c if c in '\\[]*?!# 'else c for c in p)
with ignore.open('a')as f:f.write('\n# WIP successor-08: exact lossless transport-backed CLOSED originals; active resources excluded.\n'+'\n'.join('/'+literal(p.removeprefix('.ai-workspace/comments/'))for p in sorted(archived))+'\n')
check=subprocess.check_output(['git','check-ignore','--no-index','--stdin','-z'],cwd=repo,input=b''.join(os.fsencode(p)+b'\0'for p in archived));assert{os.fsdecode(p)for p in check.split(b'\0')if p}==set(archived)
write('transport-backed-ignore-receipt.json',{'path':'.ai-workspace/comments/.gitignore','preimageSha256':sha(root/'ignore-preimage.txt'),'postimageSha256':sha(ignore),'exactIgnoredOriginals':sorted(archived),'activeRootsAreNotIgnored':exclusions})
# Future incremental bank discovery expects prior banks plus this checkpoint's transport01.
reuse=json.loads((root/'transport-reuse.json').read_text());reuse['prior'] += [b for b in banks if b['root'].endswith('/transport-02')];write('transport-reuse.json',reuse)
scope=selection['scope']
write('composition.json',{'basisCommit':base,'inherited':'successor-07/composition.json and unchanged prior bank indexes','newBanks':banks,'newMembers':len(archived),'newLogicalBytes':sum(x['byteLength']for x in archived.values()),'newTransportBytes':sum(b['transportBytes']for b in banks),'priorPayloadReadOrReupload':False,'scope':scope,'excluded':exclusions,'rootAcceptance':accept})
write('selection-final.json',{'directExpected':direct,'banks':banks,'scope':scope,'excluded':exclusions,'canonicalSourceUnchanged':True})
write('publication-receipt.json',{'kind':'incremental_closed_work_checkpoint','baseCommit':base,'commitIdentity':'Commit containing this receipt; exact local and remote identities recorded in external post-push receipt','newMembers':len(archived),'newLogicalBytes':sum(x['byteLength']for x in archived.values()),'newTransportBytes':sum(b['transportBytes']for b in banks),'restoration':'Every newly banked member restored and compared with original and selected freeze; prior bank payload proof reused without rereading/reupload','scope':scope,'excluded':exclusions,'allowedGitEffects':'One ordinary main commit and nonforce push, then remote ref verification'})
(root/'README.md').write_text('# Closed-work checkpoint successor-08\n\n'+scope+'\n\nRoot accepts the factual original process-failure report and the bounded native nested-compose result. Core03/compiled08 acceptance remains unchanged. Nine setup calls passed before original SIGABRT/default-heap OOM; no ABG terminal, genuine final close/current handoff, current Public readback or provider cost is established. Existing capacity debt records measured request/basis/RSS and unknown allocation attribution.\n\nEvery newly banked finite member was restored and compared with its original and freeze. Original mutable journals/worksites/dependency trees were not read, hashed or copied. Prior banks/source uploads were reused unchanged. Active allocation diagnosis and continuation16 readiness remain excluded. No source/law/build/test/native/provider/recovery/retry/heap/release/pin effect occurred in this Writer activation.\n\nRestore transport-01 with the existing successor-01/checkpoint_transport.py restore command. The commit containing publication-receipt.json is this checkpoint; exact local and remote refs are recorded externally after push.\n')
selected=set(direct)|{'.ai-workspace/comments/.gitignore'}
# Only this Writer-owned checkpoint directory is walked.
for p in root.rglob('*'):
 if p.is_file()and'__pycache__'not in p.parts:selected.add(str(p.relative_to(repo)))
for n in ['final-stage-paths.nul','direct-file-identities.json','final-path-reconciliation.json','final-staged-check.json','final-staged-whitespace-check.txt']:selected.add(rel+'/'+n)
write('final-staged-check.json',{});(root/'final-staged-whitespace-check.txt').write_text('')
write('final-path-reconciliation.json',{'directPaths':sorted(selected),'archiveOriginalPaths':sorted(archived),'excluded':exclusions,'scope':'Finite explicit closed set; no stage-all of shared/active territory'})
listing=root/'final-stage-paths.nul';listing.write_bytes(b''.join(os.fsencode(p)+b'\0'for p in sorted(selected)))
identities=[]
for p in sorted(selected):
 if p in [rel+'/'+n for n in ['direct-file-identities.json','final-staged-check.json','final-staged-whitespace-check.txt']]:continue
 f=repo/p;identities.append({'path':p,'bytes':f.stat().st_size,'sha256':sha(f),'mode':stat.S_IMODE(f.stat().st_mode)})
write('direct-file-identities.json',{'files':identities,'selfReferenceExclusions':['direct-file-identities.json','final-staged-check.json','final-staged-whitespace-check.txt']})
effect('--literal-pathspecs','add','--all','--force','--pathspec-from-file='+str(listing),'--pathspec-file-nul');assert paths('diff','--cached','--name-only')==selected
entries={}
for row in git('ls-files','--stage','-z').split(b'\0'):
 if row:
  meta,p=row.split(b'\t',1);p=os.fsdecode(p)
  if p in selected:entries[p]=meta.split()[1].decode()
pattern=re.compile(rb'(?<![A-Za-z0-9_])(?:gh[pousr]_[A-Za-z0-9]{30,}|sk-(?:proj-|ant-api03-)?[A-Za-z0-9_-]{40,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)');findings=[];largest=0
for p,oid in entries.items():
 b=git('cat-file','blob',oid);assert hashlib.sha256(b).hexdigest()==sha(repo/p),p;largest=max(largest,len(b));assert len(b)<=100*1024*1024,p
 if Path(p).suffix not in['.gz','.tgz']and'.part'not in Path(p).name and pattern.search(b):findings.append(p)
assert not findings,('Credential-shaped paths, values not printed',findings)
check=subprocess.run(['git','diff','--cached','--check'],cwd=repo,stdout=subprocess.PIPE,stderr=subprocess.STDOUT);(root/'final-staged-whitespace-check.txt').write_bytes(check.stdout)
write('final-staged-check.json',{'paths':len(selected),'stagedBlobComparisons':len(entries),'largestBlobBytes':largest,'credentialShapeFindings':findings,'whitespaceExitCode':check.returncode,'whitespaceDisposition':'Pass'if not check.returncode else'Frozen literal diff-context whitespace retained; diagnostics recorded; current added-line check separately passed','allAcceptedCanonicalPostimagesExact':True,'priorPayloadReadOrReupload':False,'activeResourcesExcluded':True})
effect('add','--',rel+'/final-staged-check.json',rel+'/final-staged-whitespace-check.txt');assert paths('diff','--cached','--name-only')==selected
print(json.dumps({'status':'STAGED_VERIFIED','repo':repo.name,'paths':len(selected),'tree':git('write-tree').decode().strip(),'newBankMembers':len(archived),'newBankLogicalBytes':sum(x['byteLength']for x in archived.values()),'transportBytes':sum(b['transportBytes']for b in banks),'whitespaceExit':check.returncode,'largestBlob':largest}),flush=True)
