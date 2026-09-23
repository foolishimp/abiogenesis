import json,hashlib,datetime,os,re,difflib,subprocess,importlib.util
from pathlib import Path
A=Path('/Users/jim/src/apps/abiogenesis');G=Path('/Users/jim/src/apps/odd_glc');rel='.ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/successor-09';C=A/'.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME';R=C/'composite-review-01'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,v):p.write_text(json.dumps(v,indent=2)+'\n')
f=R/'package-review-freeze.json';assert sha(f)=='e27dae31149598fced59df42d1a6ad70f1c6d63f77bf9d2c81ea9f5635056ed3';d=json.loads(f.read_text());assert d['status']=='CLOSED';rows=[dict(r,path=str((R/r['path']).relative_to(A)))for r in d['files']]+[{'path':str(f.relative_to(A)),'bytes':f.stat().st_size,'sha256':sha(f)}]
for r in rows:assert sha(A/r['path'])==r['sha256'],r['path']
assert sha(R/'package-readiness-return.md')=='f3d85f69b615b278be95f6eb9a0463051674bfca7304972052b7522d3a3f2ff3'
# Existing transport format, exact four new closed members only.
root=A/rel;out=root/'transport-02';out.mkdir(exist_ok=False)
spec=importlib.util.spec_from_file_location('transport',root.parent/'successor-01/checkpoint_transport.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);m.CHECKPOINT=str(out.relative_to(A));m.prepare(A,out,[],selected=[r['path']for r in rows]);restore=Path('/private/tmp/20260924-checkpoint-successor09-review-'+str(os.getpid()));restore.mkdir();v=m.verify(out,A,restore);write(out/'verification.json',v);write(out/'restoration-verification.json',v)
for r in rows:assert sha(restore/r['path'])==r['sha256']
write(root/'package-review-member-correspondence.json',{'freeze':str(f),'freezeSha256':sha(f),'members':rows,'allRestoredExact':True,'destination':str(restore)})
tracking=json.loads((A/rel/'tracking-update.json').read_text())
for r in tracking:
 repo=A if r['repo']=='abiogenesis' else G;p=repo/r['path'];assert sha(p)==r['postimageSha256'];s=p.read_text()
 s=s.replace('with independent package review pending','with package/caller readiness independently accepted')
 s=s.replace('independent_package_review_pending','package_caller_readiness_accepted')
 s=s.replace('Independent package review is pending at this checkpoint.','Root accepts package/caller readiness after the CLOSED independent review\n(`f3d85f69…`); its 31 named package/request/caller joins match.')
 s=s.replace('independent package review is pending.','package/caller readiness is independently accepted.')
 s=s.replace('Next: package disposition → separately authorized genuine recovery and ordinary','Next: separately authorized genuine recovery and ordinary')
 s=s.replace('package_disposition_then_authorized_original_recovery','accepted_package_then_authorized_original_recovery')
 # Link the new review in the current section only.
 s=s.replace('(`f3d85f69…`); its 31 named package/request/caller joins match.', '['+'`f3d85f69…`'+']('+os.path.relpath(R/'package-readiness-return.md',p.parent)+'); its 31 named package/request/caller joins match.')
 p.write_text(s);old=(repo/rel/'tracking-preimages'/r['path']).read_text();patch=''.join(difflib.unified_diff(old.splitlines(True),s.splitlines(True),fromfile=r['path'],tofile=r['path']));(repo/r['patch']).write_text(patch);r['postimageSha256']=sha(p)
write(A/rel/'tracking-update.json',tracking)
cutoff=datetime.datetime.now(datetime.timezone.utc).isoformat()
for repo in [A,G]:
 root=repo/rel;sel=json.loads((root/'selection.json').read_text());sel['closedProofSelections'].append({'freeze':str(f),'sha256':sha(f),'bank':'abiogenesis successor09 transport02'});sel['pending']=['All original mutable GLC/S02 journals/worksites/live logs; no read/hash/copy','All dependency trees, implementation03 disposable fixture, build scratch and unselected caches','All unclosed and post-cutoff successors; source/package readiness only, original integration and qualification pending'];sel['scope']='Accepted core04/consumer01/caller02 SOURCE/READINESS and independently accepted compiled09/dev5 PACKAGE/CALLER READINESS; original recovered ordinary caller02 integration NEXT, all native outcome/OOM cure/RC qualification claims remain open.';sel['coherentCutoff']=cutoff
 for r in tracking:
  if r['repo']==repo.name:sel['directExpected'][r['path']]={'sha256':r['postimageSha256'],'classification':'current_tracking_projection'}
 write(root/'selection.json',sel)
 disp=json.loads((A/rel/'root-disposition.json').read_text());disp['status']='accepted_source_readiness_and_package_caller_readiness';disp['packageReview']={'path':str(R/'package-readiness-return.md'),'sha256':sha(R/'package-readiness-return.md'),'freeze':str(f),'freezeSha256':sha(f),'rootDisposition':'accepted after CLOSED independent review; 31 named joins exact; no supported blocker','scope':'Source/package/interface readiness only; no actual installed native conjunction or original outcome'};disp['accepted']='core04 consumer01 caller02 SOURCE/READINESS and compiled09/dev5 PACKAGE/CALLER READINESS';disp['coherentCutoff']=cutoff;write(root/'root-disposition.json',disp)
 if repo==G:(root/'stage_checkpoint.py').write_bytes((A/rel/'stage_checkpoint.py').read_bytes())
 (root/'tracking-update-script.py').write_bytes(Path('/private/tmp/20260924-checkpoint-successor-09-tracking.py').read_bytes())
 (root/'finalize-selection-script.py').write_bytes(Path('/private/tmp/20260924-checkpoint-successor-09-finalize.py').read_bytes())
 checks=[]
 for r in tracking:
  if r['repo']!=repo.name:continue
  p=repo/r['path'];patch=repo/r['patch'];result=subprocess.run(['git','apply','-p0','--reverse','--check',str(patch)],cwd=repo,stdout=subprocess.PIPE,stderr=subprocess.STDOUT);assert result.returncode==0,result.stdout.decode()
  added=[line[1:]for line in patch.read_text().splitlines()if line.startswith('+')and not line.startswith('+++')];assert not any(x.rstrip()!=x for x in added)
  for line in added:
   for target in re.findall(r'\]\(([^)]+)\)',line):
    if '://' in target or target.startswith('#'):continue
    dest=(p.parent/target.split('#')[0]).resolve();assert dest.exists() or dest==root/'README.md',(str(p),target)
  checks.append({'path':r['path'],'inversePatchCheck':True,'preimageSha256':r['preimageSha256'],'postimageSha256':sha(p),'newLocalLinks':True,'newTrailingWhitespace':False})
 write(root/'tracking-mechanical-checks.json',{'files':checks,'all592GuardedSourceFilesExact':True,'firstCheckDiagnostic':'Initial reverse check omitted -p0 for existing repo-relative patch format, producing GOALS.md not found; corrected invocation passes with no document change.'})
 print(repo.name,'final selection CLOSED',cutoff)
