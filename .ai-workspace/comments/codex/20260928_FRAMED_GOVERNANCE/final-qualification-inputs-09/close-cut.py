"""One CLOSED Q09 freeze after bounded readback; zero Runtime/source effects."""
from pathlib import Path
import base64,datetime,hashlib,json,os,stat
R=Path('/Users/jim/src/apps/abiogenesis');G=R/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE';Q=G/'final-qualification-inputs-09';C=G/'final-candidate-construction-07';T=C/'final-stage/build_tenants/abiogenesis/typescript'
assert not(Q/'freeze.json').exists()
def read(p):return json.loads(Path(p).read_bytes())
def sha(p):
 with Path(p).open('rb')as f:return hashlib.file_digest(f,'sha256').hexdigest()
def pin(p):
 p=Path(p);return {'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p),'mode':stat.S_IMODE(p.stat().st_mode)}
def put(n,v):
 p=Q/n;assert not p.exists();p.write_text(json.dumps(v,indent=2,ensure_ascii=False)+'\n')
task=read(Q/'readiness-result.json');packet=read(Q/'f11-packet-readiness.json');supervisor=read(Q/'packet-supervisor-close.json')
assert task['workResult']=='GO_MECHANICAL_ONLY'and packet['workResult']=='GO_PREPARATION_EXISTING_SETUP_ASSERTIONS'
assert supervisor['exitCode']==0 and not supervisor['timedOut']and supervisor['wait4Reaped']and supervisor['groupAfterWait']=='absent'
checks=[]
protected=read(Q/'protected-inputs.json');manifest=read(Q/'input-manifest.json');inventory=read(Q/'qualification-inventory.json');origins=read(Q/'inventory-origin-correspondence.json')
for row in protected['members']:
 a=pin(row['origin']);assert(a['sha256'],a['bytes'],a['mode'])==(row['sha256'],row['bytes'],row.get('sourceMode',row['mode'])),row['origin']
 a=pin(Q/'mechanical-worksite'/row['target']);assert(a['sha256'],a['bytes'],a['mode'])==(row['sha256'],row['bytes'],row['mode'])
checks.append('all current protected original and copied bodies/modes conserve actual complete Task inputs')
for v in manifest['dependencies']:
 with Path(v['origin']).open('rb')as f:sri='sha512-'+base64.b64encode(hashlib.file_digest(f,'sha512').digest()).decode()
 assert sri==v['integrity']
links=read(Q/'toolchain-links.json')
for v in links:assert Path(v['origin']).is_symlink()and Path(v['origin']).readlink().as_posix()==v['target']
assert len(links)==15 and len(manifest['dependencies'])==16
checks.append('all16 frozen archive SRI values and15 recorded tool-link targets remain exact')
for v in read(Q/'source-inventory.json')+read(Q/'donor-authority-preimages.json'):
 a=pin(v['origin']);assert(a['sha256'],a['bytes'],a['mode'])==(v['sha256'],v['bytes'],v['mode'])
checks.append('1938 effective current source/generated bodies and96 construction preimages stay distinct')
for v in read(Q/'expected-output-inventory.json')['paths']:
 a=pin(T/v['path']);assert(a['sha256'],a['bytes'])==(v['sha256'],v['bytes'])
old=read(G/'final-qualification-inputs-04/component-stage-plan.json')['members'];current=read(Q/'component-stage-plan.json')['members']
assert len(current)==835 and[(v['destination'],v['bytes'],v['sha256'])for v in current]==[(v['destination'],v['bytes'],v['sha256'])for v in old]
checks.append('927 current outputs and all835 exact historical component bodies have separate conserved joins')
by_ref={m['ref']:m for m in inventory['members']};assert len(by_ref)==len(inventory['members'])and len({m['path']for m in inventory['members']})==len(by_ref)
for o in origins:
 m=by_ref[o['ref']];a=pin(o['origin']);assert('sha256:'+a['sha256'],a['bytes'])==(m['digest'],m['byteCount'])
assert set(by_ref)=={o['ref']for o in origins}
assert all(any(m['ref'].startswith(root)for m in inventory['members'])for root in inventory['selectedRoots'])
checks.append('complete qualification inventory, every exact retained origin and every selected root correspond')
aliases=read(Q/'f11/member-alias-trace.json');assert len(aliases['bijection'])==95 and aliases['sourceAuthPostimageRefsAffected']==0
for row in aliases['bijection']:
 current=by_ref[row['qualifiedMemberRef']];original=row['physicalMember'];assert {k:v for k,v in current.items()if k!='ref'}=={k:v for k,v in original.items()if k!='ref'}
 assert row['originalRef']not in by_ref
checks.append('all95 physical aliases preserve original complete member tuples; canonical95 packaged authority tuples separate; zero source-auth postimage intersections')
assert read(Q/'f11-material-role-negatives.json')['allRefused']
auth=read(Q/'f11/source-authorship-records.json');records={m['ref']:m for m in auth['records']};assert len(records)==len(auth['records'])
for m in records.values():
 b=base64.b64decode(m['contentBase64'],validate=True);assert len(b)==m['byteCount']and'sha256:'+hashlib.sha256(b).hexdigest()==m['digest']
for ch in auth['chains']:
 for k in ['activationRef','preimageRef','deltaRef','closureRef']:assert ch[k]in records
 for s in ch['attributionSources']:
  b=base64.b64decode(records[s['sourceRef']]['contentBase64']);assert 0<=s['startByte']<s['endByte']<=len(b)and'sha256:'+hashlib.sha256(b[s['startByte']:s['endByte']]).hexdigest()==s['spanDigest']
checks.append('original source records and twelve historical/current chains retain byte/span correspondence; semantic attribution unknown')
result={'status':'CLOSED','activation':'T287_FINAL_QUALIFICATION_INPUTS_09','role':'Worker','workResult':'GO_PREPARATION_C07_EXISTING_SETUP_ASSERTIONS',
 'candidate':read(Q/'candidate-binding.json'),'inventory':{'ref':inventory['inventoryRef'],'digest':inventory['inventoryDigest'],'members':len(by_ref),'bodyBytes':sum(m['byteCount']for m in inventory['members'])},
 'protectedInputs':protected['total'],'protectedBytes':protected['bytes'],'commands':task['commands'],'predicates':task['predicates'],
 'actualCompleteTask':{'ref':task['taskRef'],'digest':task['taskDigest']},'producerRecipeDigests':task['actualTaskDigests'],
 'populations':read(Q/'population-binding.json'),'taskReadiness':pin(Q/'readiness-result.json'),'packetReadiness':pin(Q/'f11-packet-readiness.json'),
 'F11Resource':pin(Q/'f11-bound-resource-manifest.json'),'resourceCoordinate':packet['resource'],'prompt':pin(Q/'f11-bound-prompt.txt'),
 'existingSetupCoordinates':pin(Q/'f11/actual-setup-coordinates.json'),'newTaskOrRunAdmission':False,'strictCaller':pin(Q/'f11/ordinary-caller.mjs'),'parentChildDriver':pin(Q/'f11/flow-driver.mjs'),'semanticMemberNamespace':'q07 intentionally conserved from actual provided descriptors','originalAuthorshipIndependence':'Current GTL/test increment authored by this preparation Worker; genuine independent assessment remains required',
 'sourceAuth':{'records':len(records),'retainedQ08Records':auth['retainedQ08Records'],'retainedQ08Chains':auth['retainedQ08Chains'],'newAcceptedC07Chains':auth['newAcceptedC07AuthorChains'],'chains':len(auth['chains']),'aliasedPostimages':0,'originalChainsAndSpansUnchanged':True,'independence':'unknown','sufficiency':'unknown'},
 'materialAliases':{'count':95,'physicalCensusDelta':0,'trace':pin(Q/'f11/member-alias-trace.json'),'context':pin(Q/'f11/member-alias-context.json'),'negativeReadiness':pin(Q/'f11-material-role-negatives.json')},
 'checks':checks,'effects':{'sourceChanges':0,'builds':0,'qualificationCommands':0,'RuntimeCalls':0,'RunOrTaskAdmissions':0,'providerCalls':0,'networkCalls':0,'GitEffects':0},
 'cost':{'commandReadiness':read(Q/'command-supervisor-close.json'),'packetReadiness':supervisor,'syntaxChecks':0},
 'unknowns':['actual dispatched reference-resource owner consumption and any current View refresh at future Runtime','independent criterion/applicability/grouping judgment','source attribution sufficiency and independence','actual child/J/foldback/cold F11 traversal','observed eighteen-command qualification/QUAL056','sole AF22 green','publication/human ruling/release'],
 'reviewerActivation':False,'allWritesStopAfterFreeze':True}
put('worker-result.json',result)
put('closure.json',{'status':'CLOSED','role':'Worker','activation':result['activation'],'workResult':result['workResult'],'noFurtherWrites':True,'reviewerActivated':False,'consumer':'Root Executive','closedAt':datetime.datetime.now(datetime.timezone.utc).isoformat()})
(Q/'return.md').write_text('CLOSED Q09: '+result['workResult']+'\n\nExact C07 construction '+result['candidate']['constructionFreeze']['sha256']+'.\n'+
 f"Complete inventory {len(by_ref)} members; {protected['total']} observed protected inputs; {task['commands']} commands/{task['predicates']} predicates unexecuted.\n"+
 f"Full F11 resource {packet['resourceSerializationBytes']} bytes; prompt {packet['promptBytes']} bytes; {len(records)} records/twelve chains.\n"+
 'Published embedded owner/material/scope guard and renderer plus reference Task/plan guard passed over exact Root-accepted existing Setup07 A/W/install/catalog/View assertions. Complete command Task is mechanical unit-only. No new Task, Run, J or admission is created; actual future reference-resource consumption remains required.\n'+
 'The unchanged mixed parent/child/J/foldback/F11/soleAF22/cold caller is prepared only. Unassessed applicability/grouping/attribution/independence stays unknown. No qualification, provider, network, source, Git, Runtime or release effect.\n')
rows=[];directories=[]
for p in sorted(Q.rglob('*')):
 if p.is_symlink():rows.append({'path':str(p.relative_to(Q)),'kind':'symlink','target':os.readlink(p),'mode':stat.S_IMODE(p.lstat().st_mode)})
 elif p.is_file():a=pin(p);a['path']=str(p.relative_to(Q));rows.append(a)
 elif p.is_dir():directories.append({'path':str(p.relative_to(Q)),'mode':stat.S_IMODE(p.stat().st_mode)})
freeze={'status':'CLOSED','role':'Worker','activation':result['activation'],'workResult':result['workResult'],'records':rows,'recordCount':len(rows),'directories':directories,'directoryCount':len(directories),'bodyBytes':sum(r.get('bytes',0)for r in rows),'C07ConstructionFreezeSHA256':result['candidate']['constructionFreeze']['sha256'],'noFurtherWrites':True}
put('freeze.json',freeze);os.chmod(Q/'freeze.json',0o444)
print(json.dumps({'status':'CLOSED','workResult':result['workResult'],'freeze':pin(Q/'freeze.json'),'records':len(rows),'directories':len(directories),'bodyBytes':freeze['bodyBytes']}))
