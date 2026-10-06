import pathlib,json,hashlib,tarfile,subprocess,os,datetime
repo=pathlib.Path('/Users/jim/src/apps/abiogenesis');p=pathlib.Path(__file__).resolve().parent;root=p.parent
read=lambda x:json.loads(pathlib.Path(x).read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
def path(x):
 t=pathlib.Path(x);return t if t.is_absolute() else repo/t
def rec(x):
 x=path(x);return {'path':str(x.relative_to(repo)),'bytes':x.stat().st_size,'sha256':sha(x.read_bytes())}
def save(n,d):(p/n).write_text(json.dumps(d,indent=2)+'\n')
pre=read(p/'preimages.json');granted={m['path'] for m in pre['members']}
envs=[read(p/'environment.json'),read(p/'covered/old/environment.json')]
# One inventory per actual archive; verify both distinct installed trees.
archives=[]
for idx in [0,1]:
 a=path(envs[0]['artifactPaths'][idx]);roots=[path(e['installedRoots'][idx]) for e in envs];members=[]
 assert all(path(e['artifactPaths'][idx])==a for e in envs)
 with tarfile.open(a,'r:gz') as tf:
  for member in tf:
   if not member.isfile():continue
   rel=member.name.removeprefix('package/');b=tf.extractfile(member).read()
   for installed in roots:assert (installed/rel).read_bytes()==b, str(installed/rel)
   members.append({'path':rel,'bytes':len(b),'sha256':sha(b)})
 archives.append({'archive':rec(a),'installedRoots':list(map(str,roots)),'regularFileCount':len(members),'unpackedRegularBytes':sum(v['bytes'] for v in members),'allArchiveMembersMatchBothInstalls':True,'members':members})
save('archive-installed.json',{'coreReused':True,'sameFixtureArchiveReusedForCoveredCase':True,'archives':archives})
# Preserve current granted subject separately from same-basis snapshots.
for rel in sorted(granted):
 out=p/'subject'/rel;out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes((repo/rel).read_bytes())
old=read(root/'selected-action-03/source-generated.json');members=[]
for m in old['members']:
 r=rec(m['path']);r['class']='granted_fixture_successor' if m['path'] in granted else 'unchanged_runtime_generated_or_how'
 if m['path'] not in granted:assert r['sha256']==m['sha256']
 if '/build/' in m['path']:
  rel=m['path'].split('/typescript/',1)[1];r['installedCorrespondence']=all(sha((path(e['installedRoot'])/rel).read_bytes())==r['sha256'] for e in envs);assert r['installedCorrespondence']
 elif '/fixtures/' in m['path']:r['installedCorrespondence']=all(sha((path(e['installedRoots'][1])/'build/index.js').read_bytes())==r['sha256'] for e in envs);assert r['installedCorrespondence']
 members.append(r)
save('source-generated.json',{'coreReused':True,'runtimeChanges':[],'generatedChanges':[],'members':members})
changed=[]
for m in pre['members']:
 now=rec(m['path']);changed.append({'path':m['path'],'before':m,'after':now,'changed':m['sha256']!=now['sha256']})
save('changed-paths.json',{'authorizedCanonicalPaths':sorted(granted),'members':changed,'additionalWrites':'selected-action-04 evidence and disposable instances only'})
checks=[]
for attempt in ['selected-action-02','selected-action-03']:
 f=read(root/attempt/'freeze.json');records=f['sourceMembers']+f['evidenceMembers']+[f['return'],f['sourceGenerated'],f['proofManifest']];mutable=[]
 for r in records:
  target=path(r['path'])
  if r['path'] in granted:
   preserved=root/attempt/'subject'/r['path'];assert sha(preserved.read_bytes())==r['sha256'];mutable.append({'path':r['path'],'snapshot':rec(preserved)});continue
  assert sha(target.read_bytes())==r['sha256'],str(target)
 checks.append({'predecessor':attempt,'freeze':rec(root/attempt/'freeze.json'),'checkedRecords':len(records),'unchangedExceptAuthorizedCanonicalFixtureSuccessors':True,'preservedOldSubject':mutable})
cf=read(root/'causation-recurrence-04/freeze.json');cr=cf.get('members',[])+cf.get('evidence',[])+cf.get('evidenceMembers',[])
if not cr:cr=cf.get('sourceMembers',[])+cf.get('evidenceMembers',[])
for r in cr:assert sha(path(r['path']).read_bytes())==r['sha256']
same=read(p/'same-basis-freeze.json')
for r in same['members']:assert sha(path(r['path']).read_bytes())==r['sha256'],r['path']
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip();index=path(subprocess.check_output(['git','rev-parse','--git-path','index'],cwd=repo,text=True).strip());assert head==pre['head'];assert sha(index.read_bytes())==pre['indexSha256']
save('preservation-checks.json',{'priorAttempts':checks,'acceptedCausation':{'freeze':rec(root/'causation-recurrence-04/freeze.json'),'verifiedRecords':len(cr),'unchanged':True},'sameBasis':{'freeze':rec(p/'same-basis-freeze.json'),'verifiedRecords':len(same['members']),'unchanged':True},'head':head,'indexSha256':sha(index.read_bytes()),'mainAndOrdinaryIndexUnchanged':True})
# Exact event history and native resource safe state, with no event/store operation.
observations=[]
for case,e,base in [('same_basis',envs[0],p),('covered',envs[1],p/'covered/old')]:
 log=path(e['scratch'])/'runtime/events.jsonl';raw=log.read_bytes();events=[json.loads(l) for l in raw.splitlines()];origin=read(base/'initial-origin.json');pid=origin['ownerPid']
 try:os.kill(pid,0);dead=False
 except ProcessLookupError:dead=True
 assert dead
 lock=(p if case=='same_basis' else p/'covered')/'disposable/abiogenesis-event-store-locks-v5'/f"{origin['initialOrigin']['device']}-{origin['initialOrigin']['inode']}.lock";assert not lock.exists()
 selected=[x for x in events if x['kind']=='construction_intent_selected'];markers=[x for x in events if x['kind'] in ['construction_intent_selected','construction_delta_observed','graph_call_closed','child_foldback_admitted','run_closed','continuation_superseded'] or (x['kind']=='traversal_route_admitted' and x['payload'].get('routeKind')=='re_enter') or (x['kind']=='public_operation_admitted' and x['payload'].get('continuationKind')=='selected_action')]
 observations.append({'case':case,'log':rec(log),'eventCount':len(events),'interruptedPrefix':rec(base/'interrupted-prefix.jsonl'),'interruption':read(base/'interruption.json'),'selectionIdentities':[{'ordinal':x['admissionOrdinal'],'eventRef':x['eventId'],'runId':x['runId'],'intentRef':x['payload']['constructionIntentRef'],'selectedActionRef':x['payload']['constructionIntent']['selectedActionRef']} for x in selected],'markers':[{'ordinal':x['admissionOrdinal'],'kind':x['kind'],'eventRef':x['eventId'],'runId':x.get('runId')} for x in markers],'hostExited':dead,'appendLockAbsent':True})
result=read(p/'run_result.json')['output']['receipt']['ownerOutput']['value'];replay=read(p/'run_replay.json')['output']['receipt']['ownerOutput']['value'];assert result['source']==replay['source'];assert result['projection']['terminalResult']==replay['projection']['terminalResult'];assert result['projection']['replay']==replay['projection']['replay'];assert replay['projection']['status']=='closed'
save('observations.json',{'cases':observations,'sameBasisColdReads':{'sameRunReplayAndTerminalResult':True,'run':result['source'],'replay':result['projection']['replay'],'terminalResult':result['projection']['terminalResult'],'status':replay['projection']['status']},'coveredLimit':'217 events; old action2 open; actual current WorkspaceBinding admitted event217; no witness/current Run/current selection/covered Public continue'})
sameResult=read(p/'same-basis-result.json');setup=read(p/'setup.json');coverSetup=read(p/'covered/old/setup.json');failure=read(p/'covered/failure.json');interrupted=read(p/'interruption.json');coverInterrupted=read(p/'covered/old/interruption.json')
cold={n:read(p/(n+'.json'))['wallMs'] for n in ['run_result','run_replay']}
save('costs.json',{'sameBasis':{'totalMs':sameResult['totalMs'],'setup':setup,'initialTraversalMs':interrupted['initialTraversalMs'],'continuationAndRefusals':[{'name':r['name'],'wallMs':r['wallMs']} for r in sameResult['results']],'coldReadsMs':cold},'covered':{'totalToFailureMs':failure['totalMs'],'setup':coverSetup,'initialTraversalMs':coverInterrupted['initialTraversalMs'],'otherMs':failure['totalMs']-coverSetup['setupMs']-coverInterrupted['initialTraversalMs'],'coverPublicCalls':0,'currentTraversalMs':None,'selectedContinuationMs':None,'coldReadsMs':None},'coreBuildOrPackCount':0,'fixturePackCount':1,'providerCalls':0,'limits':'Wall intervals include test fsync hook read/parse overhead. Existing unchanged core archive reused. Covered case reused same fixture archive; no predecessor archive copy or retry.'})
cont=read(p/'continue-receipt.json')['output']['receipt'];call=read(p/'continue-call.json')['invocation'];save('identities.json',{'activation':'T287_S7_SELECTED_ACTION_INSTALLED_04','request':rec(p/'request.txt'),'archives':[a['archive'] for a in archives],'sameBasisPublic':{'definitionKey':call['definitionKey'],'requestRef':call['requestRef'],'invocationRef':cont['invocationRef'],'run':cont['ownerOutput']['value']['run'],'admittedIntent':cont['ownerOutput']['value']['admittedIntent'],'continuation':cont['ownerOutput']['value']['successor']},'coveredPublicWitness':None,'coveredCurrentSelection':None,'coveredSelectedActionPublic':None})
print(json.dumps({'archives':[{'files':a['regularFileCount'],'sha256':a['archive']['sha256']} for a in archives],'sourceMembers':len(members),'preservedSameBasisRecords':len(same['members']),'acceptedCausationRecords':len(cr),'cases':[{'case':o['case'],'events':o['eventCount'],'bytes':o['log']['bytes']} for o in observations]},indent=2))
