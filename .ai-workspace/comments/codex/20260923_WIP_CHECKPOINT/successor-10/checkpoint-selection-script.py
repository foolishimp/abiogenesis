from pathlib import Path
import json,hashlib,subprocess,datetime,difflib,re,os
A=Path('/Users/jim/src/apps/abiogenesis');G=Path('/Users/jim/src/apps/odd_glc');rel='.ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/successor-10';L=A/'.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME';N=L/'composite-native-02';C=A/'.ai-workspace/comments/codex/20260923_COMPOSITE_READINESS/compiled-10';P=G/'.ai-workspace/comments/codex/20260924_NATIVE_CONTINUATION_CARRIER_CONTRACTION/implementation-01/package-02';R=G/'.ai-workspace/comments/codex/20260923_GENERIC_DATA_MAPPER_CONTINUATION';H=R/'held-continuation-implementation-03';S=A/'.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-installed-continuation-18';S17=S.parent/'s02-installed-continuation-17'
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1048576),b''):h.update(b)
 return h.hexdigest()
def read(p):return json.loads(p.read_text())
def write(p,v):p.write_text(json.dumps(v,indent=2)+'\n')
def rec(p):return {'path':str(p),'sha256':sha(p),'byteCount':p.stat().st_size}
base={A:'2b9e540db86f2c34cf252f7ddafe9e474cccff82',G:'8fd1de656fed50812ff70fa468e679166439c8f7'}
for repo in [A,G]:
 root=repo/rel;root.mkdir();assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip()==base[repo]
 (root/'initial-status.txt').write_bytes(subprocess.check_output(['git','status','--short'],cwd=repo));(root/'initial-head.txt').write_text(base[repo]+'\n')
 write(root/'activation.json',{'role':'Writer then native verification Worker','worker':'/root/original_owner_continuation','basisCommit':base[repo],'grant':'Root accepts combined package/caller and authorizes ordinary nonforce main checkpoint then both affected prepared native executions automatically after successful paired remote verification.','preparedPackageSubject':'5a0ff92a460e58615239278f2b26330d95912c05c3b025f0af262123ff6c16f4','preparedPackageReturn':'5f0a6ad72b0b87be93d6ecd00a2ee16c4a07fdb696f79e1d7ed1901796a3f688','noNewSemanticSourceWork':True})
decision={'status':'accepted_source_readiness_and_package_caller_readiness_native_verification_selected','authority':'Root explicit two-phase activation 2026-09-24','sourceReview':rec(L/'continuation-repair-review-01/return.md'),'packageReturn':rec(N/'return.md'),'packageSubject':rec(N/'subject.json'),'selectedArtifacts':{'core':read(C/'selected-core.json'),'consumer':read(P/'selected-consumer.json')},'phaseA':'Bank explicit new CLOSED evidence with existing transport, commit ordinary main and nonforce push both, verify actual remote refs.','phaseB':'After phaseA success, execute original03 ordinary until:converged and only S02 mixed18 on original retained resources. Each uses one owned lifetime, actual installed verification and genuine finally close/fresh Public reads. Independent paths may overlap.','original':{'caller':str(H),'closeCoordinate':'sha256:828603bb76e89f865666637c51e32230b0ccf011bfbdb3c5cc71199fc02adc3a','byteLength':1241896147,'recovery':False,'paidPolicy':'unchanged claude-fable-5-1/xhigh; max4actors/$15 each; idle900000/absolute1500000ms; command780000/helper795000/grace1000; native6600000/outer7500000/setup-read600000; default heap'},'mixed':{'caller':str(S),'cases':['mixed-human-boundary'],'closeCoordinate':'sha256:86e496c2402e2bfd8c7ca753e022bbe32985a712a60a3a0012b8a599494ddbcf','byteLength':23360130,'miniArtifactDigest':'sha256:7bb4815da4a187450ca612549c18f32f8f54c9559e7d69203a96659ae6db43cd','policy':'unchanged deterministic F_P/provider0/default heap/selected17 timeouts; truthful human hold, no response/resume; preserve seven passes'},'failureDisposition':'Retain first cause and actual lastprefix/close; finish ordinary fresh-read disposition, stop dependent progression and report; no autonomous repair or unchanged retry.','preserve':'Original jobs/oracle/S1-S5/outside obligations, worksites and old Run identities; frozen prepared records retained; no source/application hand edits or release/RC claim.'}
for repo in [A,G]:write(repo/rel/'root-disposition.json',decision)
# Existing selection fields receive a separate postimage; the prepared config and future command remain exact.
old=S/'configuration.json';selected=read(old);selected['status']='EXECUTIVE_SELECTED_FOR_EXECUTION';selected['acceptedCandidateRecord']=rec(N/'return.md');selected['operatorDecisionRecord']=rec(A/rel/'root-disposition.json');write(S/'configuration.selected.json',selected)
future=read(S/'future-commands.json');commands={k:[str(S/'configuration.selected.json') if x==str(old) else x for x in future[k]] for k in ['held','freshAfterGenuineClose']}
write(S/'execution-selection.json',{'kind':'existing_caller_execution_selection','decision':rec(A/rel/'root-disposition.json'),'preparedConfiguration':rec(old),'selectedConfiguration':rec(S/'configuration.selected.json'),'changedFields':['status','acceptedCandidateRecord','operatorDecisionRecord'],'callerFreeze':rec(S/'caller-freeze.json'),'commands':commands,'releaseCondition':'both checkpoint remote main refs verified','runtimeExecuted':False})
write(H/'execution-selection.json',{'kind':'existing_caller_execution_selection','decision':rec(A/rel/'root-disposition.json'),'callerSubject':rec(H/'subject.json'),'configuration':rec(H/'configuration.json'),'finalBinding':rec(H/'final-binding.json'),'command':read(H/'future-commands.json')['command'],'releaseCondition':'both checkpoint remote main refs verified','runtimeExecuted':False})
# Retain the four exact prior tracking bytes before current fields advance.
tracking=[]
for repo,path in [(A,'specification/GOALS.md'),(A,'.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md'),(G,'specification/GOALS.md'),(G,'.ai-workspace/tickets/active/T-043-deliver-generic-live-llm-scenario-mvp.md')]:
 root=repo/rel;p=repo/path;before=p.read_text();pre=root/'tracking-preimages'/path;pre.parent.mkdir(parents=True,exist_ok=True);pre.write_text(before);s=before
 s=s.replace('CLOSED pending Root decision','CLOSED and Root-accepted; affected original03/mixed18 native verification selected after checkpoint').replace('CLOSED pending Root package/execution decision','CLOSED and Root-accepted; affected native verification selected after checkpoint')
 s=s.replace('Root package acceptance and the\naffected native execution decision remain pending; no repaired native outcome is claimed.','Root accepts that readiness and selects original03 plus mixed18 native verification\nafter the paired checkpoint; no repaired native outcome is yet claimed.')
 s=s.replace('Root package/execution decision remains pending','Root accepts package readiness and selects affected native verification after checkpoint')
 s=s.replace('is CLOSED pending Root package/execution decision.','is CLOSED and Root-accepted; affected native verification is selected after checkpoint.')
 if path.endswith('GOALS.md'):
  marker='Reviewed repair source and generated successor are uncommitted. Package readiness\nis bounded evidence; affected native completion and release remain unclaimed.'
  repl='Reviewed repair source, generated successor and finite evidence are selected for\nthe paired checkpoint. Root accepts package readiness and authorizes the two\naffected native verifications after successful remote checks; execution and release\noutcomes remain unclaimed. [Root selection]('+os.path.relpath(A/rel/'root-disposition.json',p.parent)+').'
  assert marker in s;s=s.replace(marker,repl)
 else:
  updates={'current_activation':'COMPOSITE10_DEV6_ACCEPTED_ORIGINAL03_MIXED18_NATIVE_VERIFICATION_SELECTED_AFTER_CHECKPOINT','current_activation_status':'source_package_caller_accepted_native_verification_authorized_after_paired_push_not_yet_executed','current_activation_record':os.path.relpath(A/rel/'root-disposition.json',repo),'current_candidate_scope':'accepted_compiled10_dev6_original03_mixed18_ready_native_not_yet_executed','current_accepted_candidate_record':os.path.relpath(N/'return.md',repo),'current_accepted_archive_sha256':read(C/'selected-core.json')['basis']['artifactDigest'][7:],'next_bounded_task':'paired_checkpoint_then_original03_and_only_mixed18_native_verification','next_bounded_task_status':'authorized_after_paired_remote_verification_no_additional_permission','current_re_entry':'paired_checkpoint_then_original03_and_only_mixed18_native_verification'}
  for k,v in updates.items():
   s=re.sub(r'^- '+re.escape(k)+r':.*$', '- '+k+': '+v,s,count=1,flags=re.M)
  s=s.replace('Reviewed repair source and generated successor are uncommitted. Package readiness\nis bounded evidence; affected native completion and release remain unclaimed.','Reviewed source/package/evidence checkpoint and affected native verification are\nselected by Root; no native outcome or release is claimed by this projection.')
 assert s!=before;p.write_text(s);patch=root/('tracking-goals.patch' if path.endswith('GOALS.md') else 'tracking-ticket.patch');patch.write_text(''.join(difflib.unified_diff(before.splitlines(True),s.splitlines(True),fromfile=path,tofile=path)))
 tracking.append({'repo':str(repo),'path':path,'preparedProjectionSha256':sha(pre),'retainedPreimage':str(pre),'selectedSha256':sha(p),'patch':str(patch)})
for repo in [A,G]:write(repo/rel/'tracking-postimages.json',[r for r in tracking if r['repo']==str(repo)])
# Normalize only the exact named new closed member sets for the reused selector.
posts={}
def add(p,expected=None):
 p=Path(p).resolve();owner=A if p.is_relative_to(A) else G if p.is_relative_to(G) else None
 if owner is None:return
 relative=p.relative_to(owner).as_posix()
 if not relative.startswith('.ai-workspace/comments/codex/'):return
 assert not any(x in relative for x in ['/node_modules/','/episode-01/resources/','/qualification-01/resources/','/resources/installed/']),relative
 assert p.is_file(),str(p)
 h=expected.removeprefix('sha256:') if expected else sha(p)
 if str(p) in posts:assert posts[str(p)]['sha256']==h
 else:posts[str(p)]={'path':str(p),'sha256':h}
def rows(f,key):
 j=read(f)
 for r in j[key]:
  p=Path(r['path']);p=p if p.is_absolute() else f.parent/p;add(p,r['sha256'])
 add(f)
for f in [L/'fh-hold-repair-01/freeze.json',S17/'freeze.json',C/'freeze.json',P/'freeze.json']:
 rows(f,'members' if 'members' in read(f) else 'files')
for f,key in [(L/'native-preparation-repair-01/subject.json','evidenceMembers'),(L/'continuation09-disposition/subject.json','supportMembers'),(R/'held-continuation-launch-controls-02/subject.json','evidence'),(R/'held-continuation-launch-controls-02/subject.json','callerMembersAndDependenciesUnchanged')]:rows(f,key)
for f in [L/'native-preparation-repair-01/return.md',L/'fh-hold-repair-01/return.md',S17/'return.md',S17/'subject.json',L/'continuation-repair-review-01/return.md',L/'continuation09-disposition/return.md',R/'held-continuation-launch-controls-02/return.md',N/'return.md',N/'freeze.json'] :add(f)
for key in ['records','originalCallerFiles','mixedCallerFiles']:
 for r in read(N/'subject.json')[key]:add(r['path'],r['sha256'])
add(N/'subject.json')
for f in [H/'execution-selection.json',S/'configuration.selected.json',S/'execution-selection.json']:add(f)
# The closed launch02 subject names recovery02; add its finite launcher/return members omitted from that subset.
for p in (R/'held-continuation-recovery-02').iterdir():
 if p.is_file():add(p)
for repo in [A,G]:
 root=repo/rel;oldroot=root.parent/'successor-09';direct={}
 for r in read(N/'activation.json')['sourceMembers']:
  p=Path(r['path'])
  if p.is_relative_to(repo):assert sha(p)==r['sha256'];direct[str(p.relative_to(repo))]={'sha256':r['sha256'],'classification':'accepted_frozen_source_test_HOW'}
 for r in tracking:
  if r['repo']==str(repo):direct[r['path']]={'sha256':r['selectedSha256'],'classification':'current_tracking_projection'}
 if repo==A:
  for path in ['build_tenants/abiogenesis/typescript/product-toolchain-manifest.json','build_tenants/abiogenesis/typescript/contracts/capabilities/capability-definition-graph.json']:
   direct[path]={'sha256':sha(repo/path),'classification':'compiled10_generated_package_projection'}
 # No unrelated tracked edits can enter or be hidden by this finite selection.
 changed=set(subprocess.check_output(['git','diff','--name-only'],cwd=repo,text=True).splitlines());assert changed<=set(direct),('unrelated tracked work',repo,changed-set(direct))
 selection={'closedProofSelections':[],'adjoiningClosedPosts':list(posts.values()),'directExpected':direct,'pending':['Original mutable GLC/S02 journals/locks/worksites; no checkpoint read/hash/copy','Installed/node_modules trees, implementation03 fixture and scratch, unselected caches','PhaseB live evidence after checkpoint cutoff; no native outcome at this commit'],'scope':'Root-accepted source9 and compiled10/dev6 package/caller readiness; recovery02/original launch02 and seven S02-17 scopes preserved; original03 and mixed-only18 native verification authorized only after paired checkpoint remote verification. Full S1-S5/oracle/qualification/RC1 open.','coherentCutoff':datetime.datetime.now(datetime.timezone.utc).isoformat()}
 write(root/'selection.json',selection)
 s=(oldroot/'prepare_incremental.py').read_text().replace("successor-09';previous=root.parent/'successor-08'","successor-10';previous=root.parent/'successor-09'")
 (root/'prepare_incremental.py').write_text(s)
 (root/'pack_incremental.py').write_text((oldroot/'pack_incremental.py').read_text().replace("successor-09';previous", "successor-10';previous").replace('checkpoint-successor09-','checkpoint-successor10-'))
 print(repo.name,'selection',len(direct),'direct',len(posts),'cross-repo exact closed candidates')
