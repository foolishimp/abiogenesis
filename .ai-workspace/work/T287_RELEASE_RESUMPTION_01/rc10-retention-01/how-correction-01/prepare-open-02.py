import pathlib,json,hashlib,shutil,datetime,difflib
P=pathlib.Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc10-retention-01');OLD=P/'how-correction-01';H=P/'how-correction-02';W=pathlib.Path('/private/tmp/abg-rc10-retention-20261109');I=W/'qualification-inputs/rc10-retention-01/how-02';H.mkdir(exist_ok=True);I.mkdir(parents=True,exist_ok=True)
def pin(p):
 p=pathlib.Path(p);z=p.read_bytes();return {'path':str(p),'bytes':len(z),'sha256':hashlib.sha256(z).hexdigest()}
def put(p,d):p.write_text(json.dumps(d,indent=2)+'\n');return pin(p)
manifest=W/'.abiogenesis/workspace-manifest.json';mp=pin(manifest);assert mp['sha256']=='fd51501ff604dacb77ae47c7e94defb0793995dc39161240fc6247da95e6031a';m=json.loads(manifest.read_text());expected={'ref':m['authorityBasis']['authorityRef'],'digest':m['authorityBasis']['authorityDigest']};assert m['bindingRef'] is None
root=json.loads((OLD/'ROOT_SCOPE.json').read_text());root.update(id='RC10-HOW-OPEN-02',status='ROOT_ADMITTED_SETUP_REENTRY_NATIVE_HELD',setupDecision='Use actual Public workspace.open.open on the unchanged existing manifest with exact original expectedAuthority and no supplied actor/binding slots. Require actual unbound disposition and receipt manifest locator/digest. All later setup/author/resource paths unchanged. Preserve failed HOW runtime001; no metadata mutation, source copy, Git effect or rebuild.',workspaceManifest=mp,expectedWorkspaceAuthority=expected,previousFailure=pin(OLD/'runtime-001/FAILURE.json'));root['operatorEffectsProposed']=['one fresh existing-workspace Public open setup','new /private/tmp/abg-rc10-how-02 host scratch and this control directory runtime-001','immutable controls '+str(I),'native scratch '+str(W/'qualification-scratch/rc10-retention-01/how-02'),'same exact one-file native correction only after separate actual PREPARED admission'];rp=put(H/'ROOT_SCOPE.json',root)
for p in (W/'qualification-inputs/rc10-retention-01/how-01').iterdir():
 if p.is_file():shutil.copy2(p,I/p.name)
shutil.copy2(H/'ROOT_SCOPE.json',I/'ROOT_SCOPE.json');put(I/'WORKSPACE_OPEN_BASIS.json',{'manifest':mp,'expectedAuthority':expected,'expectedDisposition':'unbound','standing':'Host must call actual installed Public open; no simulated creation or hand-built binding.'})
task=json.loads((OLD/'TASK.json').read_text());task['id']='RC10-HOW-NATIVE-02'
for k in ['readRoots','readFirst','writeRoots']:task[k]=[x.replace('/how-01','/how-02') for x in task[k]]
tp=put(H/'TASK.json',task)
s=(OLD/'host.mjs').read_text();old="""  // Exact existing imported-workspace adaptation from setup-rc6.mjs; setup graph stays maintained.
  const authorize=caller.authorize;let imported=0;
  caller.authorize=(packet,request,resources,slots)=>packet===product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.create.clean
    ?(assert.equal(imported++,0),authorize(product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.create.imported,
      {targetRoot:binding.sourceRoot,createPolicy:'imported',importAuthority:{ref:pathToFileURL(binding.activation.path).href,digest:'sha256:'+binding.activation.sha256},preservationPolicy:'preserve_all_existing'},resources,slots))
    :authorize(packet,request,resources,slots);
  setup=await setupOwner.populateSandbox(caller,{retain:true,program:'library'});assert.equal(imported,1);await checkSource();mark('setupHeld');"""
new="""  // RC10-HOW-OPEN-02: actual Public open of the original admitted manifest.
  const manifestBytes=await pinned(binding.workspaceOpenManifest),existingManifest=JSON.parse(manifestBytes);
  assert.equal(existingManifest.canonicalRoot,binding.sourceRoot);assert.equal(existingManifest.bindingRef,null);
  const expectedAuthority={ref:existingManifest.authorityBasis.authorityRef,digest:existingManifest.authorityBasis.authorityDigest};
  assert.deepEqual(expectedAuthority,binding.expectedWorkspaceAuthority);
  const authorize=caller.authorize,invoke=caller.invoke;let opened=0,openObserved=0;
  caller.authorize=(packet,request,resources,slots)=>packet===product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.create.clean
    ?(assert.equal(opened++,0),authorize(product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.open.open,
      {targetRoot:binding.sourceRoot,expectedAuthority},resources,{}))
    :authorize(packet,request,resources,slots);
  caller.invoke=async(label,call,options)=>{
    const actual=await invoke(label,call,options);
    if(label==='workspace-create'){
      assert.equal(openObserved++,0);assert.equal(actual.call.invocation.definitionKey.operationId,'abg.operation.workspace.open');
      assert.equal(actual.call.invocation.definitionKey.memberKey,'open');assert.equal(actual.receipt.ownerOutput.outcomeKind,'result');
      assert.equal(actual.receipt.ownerOutput.value.disposition,'unbound');assert.deepEqual(actual.receipt.ownerOutput.value.authority,expectedAuthority);
      assert.equal(actual.receipt.resources.manifest.locator,binding.workspaceOpenManifest.path);
      assert.equal(actual.receipt.resources.manifest.valueDigest,product.sha256Canonical(existingManifest));
      await pinned(binding.workspaceOpenManifest);await record('WORKSPACE_OPEN.json',{definitionKey:actual.call.invocation.definitionKey,disposition:actual.receipt.ownerOutput.value.disposition,manifest:binding.workspaceOpenManifest,authority:expectedAuthority,receipt:actual.receipt.resources});
    }
    return actual;
  };
  setup=await setupOwner.populateSandbox(caller,{retain:true,program:'library'});assert.equal(opened,1);assert.equal(openObserved,1);await pinned(binding.workspaceOpenManifest);await checkSource();mark('setupHeld');"""
assert s.count(old)==1;s=s.replace(old,new);s=s.replace("binding.builderPin,binding.scopeInputGrant", "binding.builderPin,binding.workspaceOpenManifest,binding.scopeInputGrant");(H/'host.mjs').write_text(s);(H/'HOST_DELTA.patch').write_text(''.join(difflib.unified_diff((OLD/'host.mjs').read_text().splitlines(True),s.splitlines(True),fromfile='how-correction-01/host.mjs',tofile='how-correction-02/host.mjs')))
for name in ['claude-provider.sh','npm-user.npmrc','npm-global.npmrc']:shutil.copy2(OLD/name,H/name)
b=json.loads((OLD/'BINDING.PREPARATION.json').read_text());b.update(id='RC10-HOW-OPEN-02',activation=rp,task=tp,scopeInputGrant=rp,workspaceOpenManifest=mp,expectedWorkspaceAuthority=expected,runtimeRoot=str(H/'runtime-001'),scratchRoot='/private/tmp/abg-rc10-how-02',readOnlyInputPins=[pin(x) for x in sorted(I.iterdir()) if x.is_file()],providerWrapper=pin(H/'claude-provider.sh'));b['provider']['command']=str(H/'claude-provider.sh');b['nativeScratchRoot']=b['nativeScratchRoot'].replace('/how-01','/how-02');b['nativeScratchDirectories']=[x.replace('/how-01','/how-02') for x in b['nativeScratchDirectories']];b['sourceSelection']={'classification':'P2 evidence correction only','rootScope':rp}
for field in ['environment','workerEnvironment']:
 b[field]={k:(v.replace(str(OLD),str(H)).replace('abg-rc10-how-01','abg-rc10-how-02').replace('/how-01','/how-02') if isinstance(v,str) else v) for k,v in b[field].items()}
bp=put(H/'BINDING.PREPARATION.json',b)
files=[]
for x in task['readRoots']:
 p=W/x;files.extend([p] if p.is_file() else [q for q in p.rglob('*') if q.is_file()])
rd=put(H/'READY.json',{'status':'ROOT_ADMITTED_HOW_OPEN_SETUP_READY_NATIVE_HELD','rootScope':rp,'task':tp,'binding':bp,'host':pin(H/'host.mjs'),'hostDelta':pin(H/'HOST_DELTA.patch'),'manifest':mp,'expectedAuthority':expected,'sourceInventory':b['sourceInventory'],'expectedAfter':root['exactReplacement']['expectedAfter'],'contextFiles':len(files),'contextMemberBytes':sum(x.stat().st_size for x in files),'instructionBytes':len('\n'.join(task['instructions']).encode()),'setupBudgetMs':900000,'nativeBudgetMs':300000,'nativeMaxTurns':60,'nativeModel':'claude-opus-5-5','nativeEffort':'xhigh','runtimeRoot':b['runtimeRoot'],'hostScratch':b['scratchRoot'],'nativeScratch':b['nativeScratchRoot']})
ad=put(H/'ROOT_SETUP_ADMISSION.json',{'id':'RC10-HOW-OPEN-02','status':'ROOT_ADMITTED_RC10_SETUP','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'bindingSha256':bp['sha256'],'scopeSha256':rp['sha256'],'grantsFreshPublicSetup':True,'providerDispatch':False,'ready':rd,'files':[rp,tp,bp,pin(H/'host.mjs'),pin(H/'HOST_DELTA.patch'),mp],'grant':'Root selects supported Public open re-entry. One new setup after exact pin checks; original manifest/source/runtime preserved; native held until actual PREPARED consumed.'})
for p in [rp,tp,bp,mp,b['sourceInventory']]+b['readOnlyInputPins']:assert pin(p['path'])==p
for r in json.loads(pathlib.Path(b['sourceInventory']['path']).read_text())['rows']:
 p=W/r['path'];z=p.read_bytes();assert len(z)==r['bytes'] and hashlib.sha256(z).hexdigest()==r['sha256']
print(json.dumps({'ready':rd,'binding':bp,'admission':ad,'host':pin(H/'host.mjs'),'contextFiles':len(files),'contextBytes':sum(x.stat().st_size for x in files)},indent=2))
