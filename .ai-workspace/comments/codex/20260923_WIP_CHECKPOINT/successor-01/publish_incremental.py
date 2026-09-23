#!/usr/bin/env python3
"""Root-authorized incremental WIP publication; ordinary Git effects only."""
import collections,gzip,hashlib,json,os,re,stat,subprocess,sys
from pathlib import Path
repo=Path(sys.argv[1]).resolve();root=repo/'.ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/successor-01';rootRel=root.relative_to(repo).as_posix()
def git(*args):return subprocess.check_output(['git',*args],cwd=repo)
def effect(*args):subprocess.run(['git',*args],cwd=repo,check=True)
def paths(*args):return {os.fsdecode(x)for x in git(*args,'-z').split(b'\0')if x}
def sha(path):
 h=hashlib.sha256()
 with path.open('rb')as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
def write(name,value):(root/name).write_text(json.dumps(value,indent=2)+'\n')
def remote():
 rows=git('ls-remote','origin','refs/heads/main').decode().splitlines();assert len(rows)==1;return rows[0].split()[0]
selection=json.loads((root/'final-effect-selection.json').read_text());base=json.loads((root/'activation.json').read_text())['basisCommit'];assert git('rev-parse','HEAD').decode().strip()==base;assert git('symbolic-ref','--short','HEAD').decode().strip()=='main';assert remote()==base;assert not paths('diff','--cached','--name-only')
transports=[];archived={}
for directory in sorted(root.glob('transport-*')):
 if not directory.is_dir():continue
 c=json.loads((directory/'catalog.json').read_text());v=json.loads((directory/'verification.json').read_text());assert v['originalsComparedAfterPacking']and v['allMemberPathsAndHashesVerified'];assert c['credentialShapeFindingCount']==0
 with gzip.open(directory/'members.jsonl.gz','rt')as f:
  for line in f:
   row=json.loads(line);assert row['path']not in archived;archived[row['path']]=row
 transports.append({'path':directory.relative_to(repo).as_posix(),'catalogSha256':sha(directory/'catalog.json'),'verificationSha256':sha(directory/'verification.json'),'memberCount':c['archiveMemberCount'],'memberBytes':c['archiveMemberBytes'],'transportBytes':c['transportBytes'],'parts':sum(len(a['parts'])for a in c['assets'])})
assert transports
write('composition.json',{'kind':'incremental_checkpoint_composition','baseCommit':base,'baseCheckpoint':root.parent.relative_to(repo).as_posix(),'inheritedArchiveMembers':json.loads((root/'classification.json').read_text())['counts']['inherited_archive'],'inheritedProof':'Prior publication/archive/member/restoration receipts reused without rehashing or reuploading old payloads.','transports':transports,'appendRecord':'append-record.json'if repo.name=='odd_glc'else None,'wholeAppendRecompositionDuringPreparation':False if repo.name=='odd_glc'else None,'currentClaims':'WIP only; source/component and installed scoped acceptances remain bounded. F11 HOW direction adopted, implementation selected but held until this verified checkpoint; current F11 unchanged/unqualified. RC recipe successor02 partial, first mini refusal and both mini archives preserved.'})
# Reuse the prior checkpoint's exact transport-backed ignore approach. Only
# captured originals and individually declared reproducible caches are hidden.
exclusions=json.loads((root/'exclusions.json').read_text())['prefixesAndFiles'];visible=paths('ls-files','--others','--exclude-standard');cache={}
for p in visible:
 for e,reason in exclusions.items():
  if p==e or e.endswith('/')and p.startswith(e):cache[e]=reason;break
cache[rootRel+'/__pycache__/']='Python bytecode for retained checkpoint scripts'
ignored={p:'lossless transport-backed original'for p in archived};ignored.update(cache)
assert all(p.startswith('.ai-workspace/comments/')for p in ignored),'Unexpected archive territory needs its owning ignore file'
ignoreFile=repo/'.ai-workspace/comments/.gitignore';preimage=root/'ignore-preimage.txt';preimage.write_bytes(ignoreFile.read_bytes()if ignoreFile.exists()else b'')
def literal(p):return ''.join('\\'+c if c in '\\[]*?!# 'else c for c in p)
patterns=['/'+literal(p.removeprefix('.ai-workspace/comments/'))for p in sorted(ignored)]
with ignoreFile.open('a')as f:
 f.write('\n# Incremental WIP transport successor-01: exact preserved originals / reproducible caches.\n'+'\n'.join(patterns)+'\n')
check=subprocess.check_output(['git','check-ignore','--no-index','--stdin','-z'],cwd=repo,input=b''.join(os.fsencode(p)+b'\0'for p in archived))
assert {os.fsdecode(p)for p in check.split(b'\0')if p}==set(archived)
write('transport-backed-ignore-receipt.json',{'ignorePath':str(ignoreFile.relative_to(repo)),'preimageSha256':sha(preimage),'postimageSha256':sha(ignoreFile),'files':[{'path':p,'reason':reason}for p,reason in sorted(ignored.items())],'scope':'Exact losslessly archived original files and recorded reproducible caches only; no original file deleted or truncated. New authored names remain visible.'})
write('publication-receipt.json',{'kind':'incremental_wip_checkpoint_publication','repository':repo.name,'previousActualRemoteMain':base,'finalSourceCommit':'The commit containing this receipt.','actualFinalRemoteVerification':'Performed after the ordinary push and returned in the Executive handoff; no self-referential commit id is invented.','transportBytes':sum(x['transportBytes']for x in transports),'newLogicalArchiveMembers':len(archived),'priorBankedTransportReuploaded':False,'restoration':'All new complete members and new log suffix were actually restored and compared with captured originals. Prior prefix/archive proof is inherited; full current log digest is the accepted Public owner coordinate.','sourceScope':'All closed completed source/docs/proofs; consumer56f9d4c5 accepted under79455fdb; ABG accepted repairs and exact882199e7 installed read; S02 carrier02 and closure review; F11 adopted proposal, current source unchanged/unqualified.','preservedFailures':'Earlier native failures and first mini archive/refusal remain exact; no outcome relabeling.','gitEffects':'Ordinary main commit/push only. No force, amend, reset, tag/default/selector changes.'})
write('final-staged-check.json',{});(root/'final-staged-whitespace-check.txt').write_text('')
selected=paths('diff','HEAD','--name-only')|paths('ls-files','--others','--exclude-standard')
# New carrier files can be globally ignored by extension. Enumerate only this
# bounded metadata/payload carrier, excluding its already transported raw suffix.
for here,dirs,files in os.walk(root,followlinks=False):
 dirs[:]=[d for d in dirs if d not in ['__pycache__','append-staging']]
 for name in files:selected.add((Path(here)/name).relative_to(repo).as_posix())
for name in ['final-stage-paths.nul','final-path-reconciliation.json','direct-file-identities.json']:selected.add(rootRel+'/'+name)
write('final-path-reconciliation.json',{'kind':'closed_incremental_publication_inventory','baseCommit':base,'directPaths':sorted(selected),'archiveOriginalPaths':sorted(archived),'reproducibleCacheExclusions':cache,'pending':[],'sourceWriteBoundary':'Root closed consumer review, qualification author stopped, S02 single closure post included if present at final collection; no Product/native mutations selected.','inheritedArchives':'classification.json and preceding accepted checkpoint receipts','originalChangedLog':'append-record.json'if repo.name=='odd_glc'else None})
listing=root/'final-stage-paths.nul';listing.write_bytes(b''.join(os.fsencode(p)+b'\0'for p in sorted(selected)))
identities=[]
for p in sorted(selected):
 f=repo/p
 if p in [rootRel+'/direct-file-identities.json',rootRel+'/final-staged-check.json',rootRel+'/final-staged-whitespace-check.txt']:continue
 if not f.exists()and not f.is_symlink():identities.append({'path':p,'kind':'deleted'});continue
 st=f.lstat();h=hashlib.sha256(os.fsencode(os.readlink(f))).hexdigest()if f.is_symlink()else sha(f)
 identities.append({'path':p,'kind':'symlink'if f.is_symlink()else'file','byteLength':st.st_size,'sha256':h,'mode':stat.S_IMODE(st.st_mode)})
write('direct-file-identities.json',{'files':identities,'scope':'Frozen directly staged bytes; validation receipt files excluded from self-referential hashes.'})
effect('--literal-pathspecs','add','--all','--force','--pathspec-from-file='+str(listing),'--pathspec-file-nul')
staged=paths('diff','--cached','--name-only');assert staged==selected,{'missing':sorted(selected-staged),'extra':sorted(staged-selected)}
entries={}
for row in git('ls-files','--stage','-z').split(b'\0'):
 if row:
  meta,path=row.split(b'\t',1);p=os.fsdecode(path)
  if p in staged:entries[p]=meta.split()[1].decode()
pattern=re.compile(rb'(?<![A-Za-z0-9_])(?:gh[pousr]_[A-Za-z0-9]{30,}|sk-(?:proj-|ant-api03-)?[A-Za-z0-9_-]{40,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)')
findings=[];largest=0;verified=0
for p,oid in entries.items():
 process=subprocess.Popen(['git','cat-file','blob',oid],cwd=repo,stdout=subprocess.PIPE);h=hashlib.sha256();size=0;tail=b'';scan=Path(p).suffix not in ['.gz','.tgz']and'.part'not in Path(p).name
 for b in iter(lambda:process.stdout.read(1024*1024),b''):
  h.update(b);size+=len(b)
  if scan and pattern.search(tail+b):findings.append(p);scan=False
  tail=b[-160:]
 process.stdout.close();assert process.wait()==0;largest=max(largest,size);assert size<=100*1024*1024,p
 f=repo/p;expected=hashlib.sha256(os.fsencode(os.readlink(f))).hexdigest()if f.is_symlink()else sha(f)
 assert h.hexdigest()==expected,'Git byte transformation: '+p;verified+=1
assert not findings,('Credential-shaped staged paths require protected disposition',findings)
check=subprocess.run(['git','diff','--cached','--check'],cwd=repo,stdout=subprocess.PIPE,stderr=subprocess.STDOUT);(root/'final-staged-whitespace-check.txt').write_bytes(check.stdout)
write('final-staged-check.json',{'stagedPaths':len(staged),'stagedBlobComparisons':verified,'largestBlobBytes':largest,'credentialShapeFindings':findings,'whitespaceExitCode':check.returncode,'whitespaceDisposition':'Pass'if check.returncode==0 else'Historical/frozen bytes preserved unchanged; report retained.','transportBytes':sum(x['transportBytes']for x in transports),'prior8GBPayloadsRehashed':False,'prior8GBPayloadsReuploaded':False})
effect('add','--',rootRel+'/final-staged-check.json',rootRel+'/final-staged-whitespace-check.txt')
assert remote()==base;assert git('rev-parse','HEAD').decode().strip()==base
print(json.dumps({'stage':'staged_verified','repository':repo.name,'paths':len(staged),'transportBytes':sum(x['transportBytes']for x in transports),'largestBlobBytes':largest}),flush=True)
message='checkpoint: preserve accepted RC1 repairs and qualification readiness'if repo.name=='abiogenesis'else'checkpoint: preserve generic correction and installed read evidence'
effect('commit','--quiet','-m',message);commit=git('rev-parse','HEAD').decode().strip();print(json.dumps({'stage':'committed','repository':repo.name,'commit':commit}),flush=True)
effect('push','origin','HEAD:refs/heads/main');actual=remote();assert actual==commit;dirty=[os.fsdecode(x)for x in git('status','--porcelain=v1','--untracked-files=all','-z').split(b'\0')if x]
result={'status':'CLOSED'if not dirty else'REMOTE_EQUAL_WITH_RESIDUAL','repository':repo.name,'localHead':commit,'actualRemoteMain':actual,'remoteEquality':True,'dirtyOrUntracked':dirty,'transportBytes':sum(x['transportBytes']for x in transports),'newArchivedMembers':len(archived),'stagedPaths':len(staged),'commitLink':'https://github.com/foolishimp/'+repo.name+'/commit/'+commit,'scope':'WIP checkpoint; accepted/source/native/proposal/qualification distinctions retained.'}
receipt=Path('/private/tmp')/(repo.name+'-20260923-checkpoint-successor-01-publication.json');receipt.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result),flush=True)
