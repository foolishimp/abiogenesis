from pathlib import Path
import json,hashlib,os,subprocess,difflib,shutil
C=Path(__file__).parent;OLD=C/'native-01';N=C/'native-02';F=Path('/private/tmp/abg-rc11-foundation-20261110-01');T=Path('build_tenants/abiogenesis/typescript');R=Path('/Users/jim/src/apps/abiogenesis');I=F/'qualification-inputs/rc11-effect-phase1-01/native-02';S=F/'qualification-scratch/rc11-effect-phase1-01/native-02'
def pin(p):
 b=Path(p).read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def create(p,b):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('xb') as f:f.write(b)
def record(p,x):create(p,(json.dumps(x,indent=2)+'\n').encode());return pin(p)
assert not N.exists();assert not I.exists();assert not S.exists();N.mkdir();I.mkdir(parents=True)
failure=json.loads((OLD/'runtime-001/FAILURE.json').read_text());final=json.loads((OLD/'runtime-001/FINAL.json').read_text());assert not final['launched'] and final['actualPhysicalClose'] and final['run'] is None
oldb=json.loads((OLD/'BINDING.json').read_text());source=json.loads(Path(oldb['sourceInventory']['path']).read_text())
for r in source['rows']:
 p=pin(F/r['path']);assert p['bytes']==r['bytes'] and p['sha256']==r['sha256']
manifest=pin(F/'.abiogenesis/workspace-manifest.json');m=json.loads(Path(manifest['path']).read_text());assert m['canonicalRoot']==str(F) and m['bindingRef'] is None and m['bindingDigest'] is None
task=json.loads((OLD/'TASK.json').read_text());assert isinstance(task['instructions'],str)
for p in Path(oldb['readOnlyInputPins'][0]['path']).parent.iterdir():
 b=p.read_bytes()
 if p.name=='EXTERNAL_TOOLS.json':b=b.replace(str(F/'qualification-scratch/rc11-effect-phase1-01/native-01').encode(),str(S).encode())
 create(I/p.name,b)
task['id']='t287-effect-phase1-author-02';task['instructions']=[task['instructions']]
def route(s):return s.replace('qualification-inputs/rc11-effect-phase1-01/native-01','qualification-inputs/rc11-effect-phase1-01/native-02').replace('qualification-scratch/rc11-effect-phase1-01/native-01','qualification-scratch/rc11-effect-phase1-01/native-02')
for k in ['readRoots','readFirst','writeRoots']:task[k]=[route(x) for x in task[k]]
assert all(isinstance(x,str) and x and '\0' not in x for x in task['instructions']);taskPin=record(N/'TASK.json',task)
nativeOwner=Path(oldb['bootstrapRoot'])/'build/code/src/product/native_workspace_work.js';text=nativeOwner.read_text();assert 'instructions: v.array(ref)' in text
reentry=record(N/'CONTROL_REENTRY.json',{'status':'ADMITTED_ROUTINE_CONTROL_REENTRY','rootBasis':'PHASE1-IMPLEMENTATION-01 explicitly continues routine control/path fixes without revoking source/setup authority; paid dispatch still held.','failure':pin(OLD/'runtime-001/FAILURE.json'),'final':pin(OLD/'runtime-001/FINAL.json'),'actualClose':pin(OLD/'runtime-001/resource-close.json'),'cause':'TASK.instructions was a string; exact installed constructor requires array of nonempty strings. Fix that carrier only; source outcomes unchanged.','contract':pin(nativeOwner),'taskPredecessor':pin(OLD/'TASK.json'),'task':taskPin,'workspaceManifest':manifest,'expectedAuthority':{'ref':m['authorityBasis']['authorityRef'],'digest':m['authorityBasis']['authorityDigest']},'route':'Actual Public open.open of existing unbound manifest; new runtime/caller/resource, no create.imported repetition or old Run identity.','preservation':'All inventoried source rows unchanged after failed setup; provider0/nativeRun0; physical close recorded.'})
host=(OLD/'host.mjs').read_text();known=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/native-02/host.mjs').read_text()
start=host.index('  // Exact existing imported-workspace adaptation');end=host.index('  const env=caller.refresh()',start)
ks=known.index('  // RC11-AUTHOR02: actual Public open');ke=known.index('  const env=caller.refresh()',ks)
new=host[:start]+known[ks:ke].replace('// RC11-AUTHOR02: actual Public open of the existing original admitted RC11 manifest.','// PHASE1-02: actual Public open of this setup-established unbound manifest.')+host[end:]
needle='const task=JSON.parse(await pinned(binding.task)),free=async()=>'
assert needle in new
new=new.replace(needle,'const task=JSON.parse(await pinned(binding.task));assert(Array.isArray(task.instructions)&&task.instructions.every(x=>typeof x===\'string\'&&x.length>0&&!x.includes(\'\\0\')),\'installed instructions array contract\');const free=async()=>')
create(N/'host.mjs',new.encode());create(N/'HOST_DELTA.diff',''.join(difflib.unified_diff(host.splitlines(keepends=True),new.splitlines(keepends=True),fromfile=str(OLD/'host.mjs'),tofile=str(N/'host.mjs'))).encode())
for name in ['transport-preflight.mjs','claude-provider.sh','npm-user.npmrc','npm-global.npmrc']:create(N/name,(OLD/name).read_bytes())
os.chmod(N/'claude-provider.sh',0o755)
b=oldb;b.update({'id':'t287-effect-phase1-native-author-02','task':taskPin,'runtimeRoot':str(N/'runtime-001'),'scratchRoot':str(N/'host-scratch'),'nativeScratchRoot':str(S),'nativeScratchDirectories':[str(S),str(S/'tmp'),str(S/'npm-cache')],'readOnlyInputPins':[pin(p) for p in sorted(I.iterdir())],'workspaceOpenManifest':manifest,'expectedWorkspaceAuthority':reentry and {'ref':m['authorityBasis']['authorityRef'],'digest':m['authorityBasis']['authorityDigest']},'setupEffectsAwaitingAdmission':['Admitted control re-entry: actual open.open of established workspace; fresh actual owner setup/resource/native call; provider held.']})
for target,scratch in [('environment',N/'host-scratch'),('workerEnvironment',S)]:b[target].update({'TMPDIR':str(scratch/'tmp'),'TMPPREFIX':str(scratch/'tmp/zsh'),'NPM_CONFIG_CACHE':str(scratch/'npm-cache'),'NPM_CONFIG_USERCONFIG':str(N/'npm-user.npmrc'),'NPM_CONFIG_GLOBALCONFIG':str(N/'npm-global.npmrc')})
b['provider']['command']=str(N/'claude-provider.sh');b['providerWrapper']=pin(N/'claude-provider.sh');b['proofControls']=[pin(N/x) for x in ['transport-preflight.mjs','npm-user.npmrc','npm-global.npmrc']]+[reentry]
binding=record(N/'BINDING.json',b);node='/opt/homebrew/Cellar/node/24.7.0/bin/node';syntax=[]
for f in ['host.mjs','transport-preflight.mjs']:
 c=subprocess.run([node,'--check',str(N/f)],capture_output=True);assert c.returncode==0,c.stderr;syntax.append({'file':pin(N/f),'exitCode':0})
js="import{readFileSync}from'node:fs';import{validateTransport}from'"+(N/'transport-preflight.mjs').as_uri()+"';console.log(JSON.stringify(await validateTransport(JSON.parse(readFileSync(process.argv[1]))),null,2))"
c=subprocess.run([node,'--input-type=module','-e',js,str(N/'BINDING.json')],capture_output=True);assert c.returncode==0,c.stderr;create(N/'TRANSPORT_PREFLIGHT.json',c.stdout)
members=[]
for rel in task['readRoots']:
 p=F/rel
 if p.is_file():members.append(p)
 elif p.is_dir():members.extend(x for x in p.rglob('*') if x.is_file())
members=set(members)
ready=record(N/'READY.json',{'status':'PHASE1_EXISTING_WORKSPACE_SETUP_READY_NATIVE_HELD','reentry':reentry,'task':taskPin,'binding':binding,'host':pin(N/'host.mjs'),'hostDelta':pin(N/'HOST_DELTA.diff'),'transportPreflight':pin(N/'TRANSPORT_PREFLIGHT.json'),'syntax':syntax,'context':{'fileMembers':len(members),'sourceMemberBytes':sum(p.stat().st_size for p in members),'instructionUtf8Bytes':sum(len(x.encode()) for x in task['instructions']),'sourceContentsInlined':False,'rendererEvidence':pin(nativeOwner),'rendererRelation':'renderNativeWorkspaceWorkOrder prints paths/readRoots/instructions/checks; no context entry content. Actual renderedBytes awaited from installed renderer in PREPARED.'},'runtimeRoot':b['runtimeRoot'],'workspaceManifest':manifest,'setupBudgetMs':900000,'setupPerCommandMs':300000,'reserveBytes':4*1024**3,'freeBytes':shutil.disk_usage(F).free})
admission=record(N/'ROOT_SETUP_ADMISSION.json',{'id':'PHASE1-SETUP-02','status':'ROOT_ADMITTED_PHASE1_SETUP','basis':'Existing Root PHASE1-IMPLEMENTATION-01 plus routine control/path correction clause; actual constructor shape correction and supported existing-workspace open route preserve scope. No paid actor.','bindingSha256':binding['sha256'],'scopeSha256':b['activation']['sha256'],'grantsFreshPublicSetup':True,'providerDispatch':False,'ready':ready,'files':[pin(N/'host.mjs'),pin(N/'transport-preflight.mjs'),pin(N/'TRANSPORT_PREFLIGHT.json'),pin(Path(node)),b['archive'],manifest,reentry],'setupBudgetMs':900000,'setupPerCommandMs':300000,'reserveBytes':4*1024**3})
argv=[node,str(N/'host.mjs'),binding['path'],binding['sha256'],admission['path'],admission['sha256']]
record(N/'LAUNCH.json',{'argv':argv,'tty':True,'cwd':str(F),'ready':ready,'setupAdmission':admission})
print(json.dumps({'ready':ready,'task':taskPin,'binding':binding,'argv':argv},indent=2))
