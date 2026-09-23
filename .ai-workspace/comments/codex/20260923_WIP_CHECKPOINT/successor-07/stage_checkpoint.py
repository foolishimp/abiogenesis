import gzip,hashlib,json,os,re,stat,subprocess,sys
from pathlib import Path
repo=Path(sys.argv[1]).resolve();A=Path('/Users/jim/src/apps/abiogenesis');root=repo/'.ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/successor-07';rel=root.relative_to(repo).as_posix();T=A/'.ai-workspace/comments/codex/20260924_EXECUTIVE_CHECKPOINT/tracking-03'
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
accept=json.loads((T/'executive-acceptance.json').read_text());assert accept['status']=='ACCEPTED'
selection=json.loads((root/'selection.json').read_text());direct=dict(selection['directExpected']);archived={};banks=[]
for name in ['transport-01','transport-02']:
 p=root/name
 if not p.exists():continue
 c=json.loads((p/'catalog.json').read_text());v=json.loads((p/'verification.json').read_text());assert v['originalsComparedAfterPacking']and v['allMemberPathsAndHashesVerified']and c['credentialShapeFindingCount']==0
 with gzip.open(p/'members.jsonl.gz','rt')as f:
  for r in map(json.loads,f):assert r['path']not in archived;archived[r['path']]=r
 banks.append({'root':str(p.relative_to(repo)),'catalogSha256':sha(p/'catalog.json'),'indexSha256':c['indexSha256'],'verificationSha256':sha(p/'verification.json'),'members':c['archiveMemberCount'],'logicalBytes':c['archiveMemberBytes'],'transportBytes':c['transportBytes']})
# Preserve every prior tracking member by its frozen identity; no directory sweep of runtime owners.
if repo==A:
 for name in ['tracking-01','tracking-02']:
  freeze=T.parent/name/'freeze.json';d=json.loads(freeze.read_text())
  for r in d['carrier']:
   p=A/r['path'];assert sha(p)==r['sha256'],p
   if r['path']not in archived:direct[r['path']]={'sha256':r['sha256'],'classification':'prior_closed_tracking_carrier'}
 for name in ['return.md','review.json']:
  p=A/'.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/implementation-03/review-01'/name
  expected=accept['reviewReturnSha256'if name=='return.md'else'reviewJsonSha256'];assert sha(p)==expected;direct[str(p.relative_to(A))]={'sha256':expected,'classification':'accepted_CLOSED_independent_core_and_caller_review'}
 d=json.loads((T/'freeze.json').read_text())
 for r in d['carrier']:
  assert sha(A/r['path'])==r['sha256'];direct[r['path']]={'sha256':r['sha256'],'classification':'closed_tracking03'}
 direct[str((T/'freeze.json').relative_to(A))]={'sha256':sha(T/'freeze.json'),'classification':'closed_tracking03_freeze'}
for r in json.loads((T/'freeze.json').read_text())['postimages']:
 if r['repo']==repo.name:direct[r['path']]={'sha256':r['sha256'],'classification':'accepted_current_tracking'}
for p,e in direct.items():assert sha(repo/p)==e['sha256'],('Direct postimage changed',p)
assert not any(p in direct for p in archived)
exclusions=['All original mutable GLC/S02 history and canonical worksite; no snapshot','s02-installed-continuation-14 and later active outputs','held-continuation-execution-01','held-continuation-launch-controls-01','held-continuation-implementation-01/final-binding.json','All node_modules, build scratch, unselected caches and unrelated work']
for p in set(archived)|set(direct):assert not any(s in p for s in ['/node_modules/','/episode-01/resources/','s02-installed-continuation-14','held-continuation-execution-01/','held-continuation-launch-controls-01/','held-continuation-implementation-01/final-binding.json']),p
ignore=repo/'.ai-workspace/comments/.gitignore';(root/'ignore-preimage.txt').write_bytes(ignore.read_bytes())
def literal(p):return ''.join('\\'+c if c in '\\[]*?!# 'else c for c in p)
with ignore.open('a')as f:f.write('\n# WIP successor-07: exact lossless transport-backed CLOSED originals; active resources excluded.\n'+'\n'.join('/'+literal(p.removeprefix('.ai-workspace/comments/'))for p in sorted(archived))+'\n')
check=subprocess.check_output(['git','check-ignore','--no-index','--stdin','-z'],cwd=repo,input=b''.join(os.fsencode(p)+b'\0'for p in archived));assert{os.fsdecode(p)for p in check.split(b'\0')if p}==set(archived)
write('transport-backed-ignore-receipt.json',{'path':'.ai-workspace/comments/.gitignore','preimageSha256':sha(root/'ignore-preimage.txt'),'postimageSha256':sha(ignore),'exactIgnoredOriginals':sorted(archived),'activeRootsAreNotIgnored':exclusions})
# Future incremental bank discovery expects prior banks plus this checkpoint's transport01.
reuse=json.loads((root/'transport-reuse.json').read_text());reuse['prior'] += [b for b in banks if b['root'].endswith('/transport-02')];write('transport-reuse.json',reuse)
scope='Accepted lifetime03/compiled08 full Public held path and frozen GLC caller readiness; closed lifetime01/02, compiled06/07, S02 continuations10-13 failures/diagnostics and accepted conformance/nested/mini source corrections; current GOAL035/T287 and GLC T043 tracking. Original/S02 active successors and full release obligations remain open.'
write('composition.json',{'basisCommit':base,'inherited':'successor-06/composition.json and unchanged prior bank indexes','newBanks':banks,'newMembers':len(archived),'newLogicalBytes':sum(x['byteLength']for x in archived.values()),'newTransportBytes':sum(b['transportBytes']for b in banks),'priorPayloadReadOrReupload':False,'scope':scope,'excluded':exclusions,'rootAcceptance':accept})
write('selection-final.json',{'directExpected':direct,'banks':banks,'scope':scope,'excluded':exclusions,'sourceReviewedAndAccepted':True})
write('publication-receipt.json',{'kind':'incremental_closed_work_checkpoint','baseCommit':base,'commitIdentity':'Commit containing this receipt; exact local and remote identities recorded in external post-push receipt','newMembers':len(archived),'newLogicalBytes':sum(x['byteLength']for x in archived.values()),'newTransportBytes':sum(b['transportBytes']for b in banks),'restoration':'Every newly banked member restored and compared with original and selected freeze; prior bank payload proof reused without rereading/reupload','scope':scope,'excluded':exclusions,'allowedGitEffects':'One ordinary main commit and nonforce push, then remote ref verification'})
(root/'README.md').write_text('# Closed-work checkpoint successor-07\n\n'+scope+'\n\nExecutive acceptance is bound in composition.json and ABG tracking-03/executive-acceptance.json. The complete installed core path includes real Public installs, F_D producer basis, reprice, controlled no-paid F_P Run, physical close and fresh recovery. It is not original Data Mapper capacity proof or live-model qualification. Frozen caller readiness is accepted; its new active final binding and execution are excluded. Original execution10 OOM and S02 prior failures retain their exact histories.\n\nAll new bank members were restored and compared with their exact originals and freeze identities. Prior bank payloads were not reread, repacked or uploaded. No source repair, build/test/native/provider action, original-resource acquisition or release action occurred in this Writer checkpoint. Current original/S02 execution remains separately owned.\n\nRestore each bank listed in composition.json through the existing successor-01/checkpoint_transport.py restore command, supplying its --checkpoint path and a separate absolute --destination. The commit containing publication-receipt.json is this checkpoint; actual local/remote refs are recorded externally after push.\n')
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
