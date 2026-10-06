from pathlib import Path
import datetime, hashlib, json, os, shutil, stat

D=Path(__file__).resolve().parent; G=D.parent
O=G/'rc1-s03-installed-execution-03'; C=G/'final-candidate-construction-03'
P=G/'rc1-s03-input-preparation-01'; H=G/'rc1-c03-conformance-caller-repair-01'
read=lambda p:json.loads(p.read_text())
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1048576),b''):h.update(b)
 return h.hexdigest()
def save(n,v):
 with (D/n).open('x') as f:json.dump(v,f,indent=2);f.write('\n')
def verify(root,rs):
 for r in rs:
  p=root/r['path'];assert p.is_file() and p.stat().st_size==r['bytes'] and sha(p)==r['sha256'],str(p)
 return len(rs)

grant=G/'rc1-c03-installed-discriminator-repair-controls-02/s03-request.txt'
assert sha(grant)=='c1b45835e842986ed1bab29f6ea781747fcb5b8780b9f60e67b6584a160fc164'
assert sha(G/'rc1-c03-acceptance-01/acceptance.json')=='bc9b3004543d2338487cb76f8ab98f44181d1b0a58421a53d2d734a4a0491e5f'
assert sha(C/'final-freeze.json')=='a4095d2a472f234d32bf063c5433b59003c536d66455ebed011ef7f7472f8d8a'
assert sha(O/'freeze.json')=='ba1fcefd7259d3641f187fcefb1e545f45dfecb321fb273b2ab5d1e04e7f59bd'
assert sha(P/'freeze.json')=='86992e2d7be5ca6c59d9c049b29fb8f65d11fc68ad7c652ecf82993b5cc087ec'
assert sha(H/'freeze.json')=='636b261b43337cc4cb42d7faf9e0503e91e80c4ff2c6f64238d19bc4e0580262'
assert sha(H/'conformance-resources.mjs')=='62d160eba67201396730064290fefb1b9262ea20f7f93fa223b6e6c6867a7251'
old=read(O/'freeze.json')
for r in old['records']:
 p=O/r['path'];assert stat.S_IMODE(p.lstat().st_mode)==r['mode']
 if r['kind']=='symlink':assert p.is_symlink() and os.readlink(p)==r['target'] and str(p.resolve())==r['targetResolved']
 else:assert p.is_file() and p.stat().st_size==r['bytes'] and sha(p)==r['sha256'],str(p)
before=read(O/'failure-final-physical.json');store=Path(before['path']);st=store.stat()
assert (st.st_dev,st.st_ino,st.st_size)==(16777230,464429281,2490961)
assert sha(store)==before['sha256']=='3f4f443fe609b278d375e7667137e330fa25efcdc46c2297afc018bda4bc5298'
assert store.read_bytes()==(O/'failure-final-prefix.jsonl').read_bytes()
assert not Path(before['lockPath']).exists()
prepcount=verify(P,read(P/'freeze.json')['records'])
pins=read(P/'source-pins.json')['records'];pincount=verify(Path('/'),pins)
helpercount=verify(H,read(H/'freeze.json')['records'])
sourcecount=verify(C,read(C/'final-source-freeze-manifest.json')['members'])
identity=read(C/'final-package-identity.json');members=read(C/'final-archive-members.json')
payloadcount=verify(Path(identity['packageRoot']),members)
runtimecount=verify(O/'resources/installed/core/node_modules/@abiogenesis/typescript-tenant',members)
assert sha(Path(identity['artifactPath']))=='f779058d1cc3c1867f8d53c1dda9100a136d7fa460772b6084e2f67c0cd982c6'
donor=read(P/'donor-selection.json');assert sha(Path(donor['archive']['path']))==donor['archive']['sha256']

save('runtime-activation.json',{'kind':'root_runtime_execution_activation','operation':'T287_RC1_S03_INSTALLED_PAIR_04',
 'role':'Runtime Worker','actor':'/root/rc1_successor_builder','executionRoot':str(D),'realProviderCalls':0,
 'startedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'request':str(grant),'requestSHA256':sha(grant),
 'a_cControls':str(G/'rc1-c03-installed-discriminator-repair-controls-02/bindings.json'),
 'rootAcceptanceSHA256':sha(G/'rc1-c03-acceptance-01/acceptance.json'),'C03FreezeSHA256':sha(C/'final-freeze.json'),
 'previousFailureFreezeSHA256':sha(O/'freeze.json'),'sharedPureConstructorFreezeSHA256':sha(H/'freeze.json'),
 'exception':'Only existing ABG owners may append to the exact existing physical event store; all other old bytes remain immutable.'})
for n in ['tmp','cache','config','positive','no-action']:(D/n).mkdir()
for n in ['user.npmrc','global.npmrc']:(D/'config'/n).write_text('')
env=read(O/'runtime-environment.json')
env.update({'TMPDIR':str(D/'tmp'),'npm_config_cache':str(D/'cache'),
 'npm_config_userconfig':str(D/'config/user.npmrc'),'npm_config_globalconfig':str(D/'config/global.npmrc')})
save('runtime-environment.json',env)
save('budgets.json',read(O/'budgets.json'))
save('resource-plan.json',{'eventLogPath':str(store),'newTerritory':str(D),'ownerAppendException':before,
 'historicalFailureSnapshot':str(O/'failure-final-prefix.jsonl'),'oldStaticRecordsCount':len(old['records'])-1})
origins=[]
for n in ['selected-core.json','prospective-cases.json','caller-draft.mjs','original-consumers.mjs','sole-output-renderer.mjs',
 'original-oracle.json','pair-inputs.json','readback-contract.json','public-support.mjs','observe-process.py']:
 src=O/n;shutil.copy2(src,D/n);origins.append({'path':n,'origin':str(src),'sha256':sha(src),'copiedByteExact':True})
shutil.copy2(H/'conformance-resources.mjs',D/'conformance-resources.mjs')
origins.append({'path':'conformance-resources.mjs','origin':str(H/'conformance-resources.mjs'),'sha256':sha(H/'conformance-resources.mjs'),'copiedByteExact':True})
s=(O/'ordinary-caller.mjs').read_text()
s=s.replace("import {loadRuntime,declaredCli} from './public-support.mjs';", "import {loadRuntime,declaredCli} from './public-support.mjs';\nimport {declaredInventoryConformanceResources} from './conformance-resources.mjs';")
s=s.replace('caller(mode, nominalVerification, driverDeadline, executionRoot)','caller(mode, nominalVerification, driverDeadline, executionRoot, admittedActorRef)')
s=s.replace('T287_RC1_S03_INSTALLED_PAIR_03','T287_RC1_S03_INSTALLED_PAIR_04')
s=s.replace("base='abiogenesis/t287/rc1-s03-installed-execution-03',actorRef='actor://abiogenesis/t287/rc1-s03-installed-execution-03/operator'", "base='abiogenesis/t287/rc1-s03-installed-execution-04',actorRef=admittedActorRef")
assert "actorRef=admittedActorRef" in s
s=s.replace(" const op={actorRef,", " assert.equal(typeof actorRef,'string');assert.ok(actorRef);\n const op={actorRef,")
bad="{kind:'conformance_evaluation_resource_assertion',schemaVersion,packet:{kind:'conformance_evaluate_packet',schemaVersion,memberKey:'gtl_program',publication,program},conformanceLaw:law,artifactTruth:state.environment.artifactTruth,declaredInventory:state.catalog.boundPublications,declarationCatalog:{catalog:state.catalog,catalogView:state.catalogView}}"
good="declaredInventoryConformanceResources({publication,program,conformanceLaw:law,declaredInventory:state.catalog.boundPublications,catalog:state.catalog,catalogView:state.catalogView})"
assert s.count(bad)==1;s=s.replace(bad,good)
with (D/'ordinary-caller.mjs').open('x') as f:f.write(s)
origins.append({'path':'ordinary-caller.mjs','origin':str(O/'ordinary-caller.mjs'),'originSHA256':sha(O/'ordinary-caller.mjs'),
 'copySHA256':sha(D/'ordinary-caller.mjs'),'adaptation':'shared exact six-key conformance constructor; new activation/request/approval provenance; admitted actor retained from existing binding'})
save('input-correspondence.json',{'previousRecordsVerified':len(old['records']),'previousStaticRecordsToConserve':len(old['records'])-1,
 'S03PreparationRecordsVerified':prepcount,'externalPinsVerified':pincount,'sharedPureHelperRecordsVerified':helpercount,
 'C03SourceMembersVerified':sourcecount,'bootstrapPayloadMembersVerified':payloadcount,'runtimePayloadMembersVerified':runtimecount,
 'oldFrozenPrefixesCopied':False,'oldStoreInitialPhysical':before,'originalCopiesAndCallerOrigins':origins,
 'effects':'new activation territory only, plus sole exact owner append exception','setupCallsToRepeat':0})
print(json.dumps({'status':'new_continuation_inputs_prepared','oldRecordsVerified':len(old['records']),
 'originalPrefixBytes':st.st_size,'sameDevice':st.st_dev,'sameInode':st.st_ino,'setupCallsToRepeat':0}))
