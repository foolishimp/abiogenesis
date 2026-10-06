from pathlib import Path
import datetime,hashlib,json,os,shutil,stat
D=Path(__file__).resolve().parent;G=D.parent;O=G/'rc1-s03-installed-execution-03';F=G/'rc1-s03-installed-execution-04';C=G/'final-candidate-construction-03';P=G/'rc1-s03-input-preparation-01'
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
grant=G/'rc1-s03-cold-read-controls-05/request.txt';assert sha(grant)=='0582902ec690d3a5cb9ff873a69e33f84f0bc9d229d5446204e556780d709492'
assert sha(C/'final-freeze.json')=='a4095d2a472f234d32bf063c5433b59003c536d66455ebed011ef7f7472f8d8a'
assert sha(O/'freeze.json')=='ba1fcefd7259d3641f187fcefb1e545f45dfecb321fb273b2ab5d1e04e7f59bd'
assert sha(F/'freeze.json')=='0a6d8fc532c846bc694c68da16d097ab16182247f4993e041a2dff93ce2f2b97'
assert sha(F/'failure-final-handoff.json')=='b8800176a0e7b64e5156f1a6f7cf817f353f83da67d023b07144ce514419fe8d'
static=[r for r in read(O/'freeze.json')['records'] if r['path']!='resources/events/runtime.events.jsonl']
for r in static:
 p=O/r['path'];assert stat.S_IMODE(p.lstat().st_mode)==r['mode']
 if r['kind']=='symlink':assert p.is_symlink() and os.readlink(p)==r['target'] and str(p.resolve())==r['targetResolved']
 else:assert p.stat().st_size==r['bytes'] and sha(p)==r['sha256'],str(p)
fcount=verify(F,read(F/'freeze.json')['records'])
physical=read(F/'failure-final-physical.json');store=Path(physical['path']);st=store.stat();raw=store.read_bytes()
assert (st.st_dev,st.st_ino,len(raw))==(16777230,464429281,4709556)
assert hashlib.sha256(raw).hexdigest()=='26339994e902ccafa5c1f6da9d8df471d77a1a3e144843f7472e5f1558f989df'
assert raw==(F/'failure-final-prefix.jsonl').read_bytes() and raw[:2490961]==(O/'failure-final-prefix.jsonl').read_bytes()
assert len(raw.splitlines())==566
assert not Path(physical['lockPath']).exists() and not Path(read(O/'failure-final-physical.json')['lockPath']).exists()
sourcecount=verify(C,read(C/'final-source-freeze-manifest.json')['members'])
members=read(C/'final-archive-members.json');identity=read(C/'final-package-identity.json');bootstrapcount=verify(Path(identity['packageRoot']),members)
runtimecount=verify(O/'resources/installed/core/node_modules/@abiogenesis/typescript-tenant',members)
assert sha(Path(identity['artifactPath']))=='f779058d1cc3c1867f8d53c1dda9100a136d7fa460772b6084e2f67c0cd982c6'
prepcount=verify(P,read(P/'freeze.json')['records']);pincount=verify(Path('/'),read(P/'source-pins.json')['records'])
save('runtime-activation.json',{'kind':'root_runtime_execution_activation','operation':'T287_RC1_S03_INSTALLED_COLD_READS_05','executionRoot':str(D),
 'role':'Runtime/read Worker','actor':'/root/rc1_successor_builder','realProviderCalls':0,'startedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'request':str(grant),'requestSHA256':sha(grant),'C03FreezeSHA256':sha(C/'final-freeze.json'),'previousExecutionFreezeSHA256':sha(F/'freeze.json'),
 'existingStoreMode':'strictly read-only; no owner append exception','nativeCallGrant':['run_result','run_replay','run_status','run_gaps']})
(D/'tmp').mkdir();(D/'no-action').mkdir()
env={'TMPDIR':str(D/'tmp'),'PATH':str(C/'source-freeze/toolchain/bin')+':/usr/bin:/bin:/usr/sbin:/sbin','GIT_OPTIONAL_LOCKS':'0',
 'npm_config_offline':'true','npm_config_audit':'false','npm_config_fund':'false','npm_config_update_notifier':'false'}
save('runtime-environment.json',env)
save('budgets.json',{'driverBudgetMs':600000,'stages':{'read':180000},'terminationGraceMs':1000,'heapChanges':False,'timerChanges':False})
save('resource-plan.json',{'eventLogPath':str(store),'oldStoresStrictlyReadOnly':True,'before':physical,'oldStaticCount':len(static),
 'newTerritory':str(D),'oldClosedPositiveProof':str(F/'positive/oracle-result.json')})
origins=[]
for n in ['selected-core.json','prospective-cases.json','caller-draft.mjs','original-consumers.mjs','sole-output-renderer.mjs',
 'original-oracle.json','pair-inputs.json','readback-contract.json','public-support.mjs','observe-process.py']:
 src=F/n;shutil.copy2(src,D/n);origins.append({'path':n,'origin':str(src),'sha256':sha(src),'copiedByteExact':True})
s=(F/'ordinary-caller.mjs').read_text();s=s.replace("import {declaredInventoryConformanceResources} from './conformance-resources.mjs';\n",'')
s=s.replace('T287_RC1_S03_INSTALLED_PAIR_04','T287_RC1_S03_INSTALLED_COLD_READS_05').replace("base='abiogenesis/t287/rc1-s03-installed-execution-04'","base='abiogenesis/t287/rc1-s03-installed-execution-05'")
a=s.index(' async function authorized(');b=s.index(' async function invoke(',a);s=s[:a]+s[b:]
a=s.index(' async function conformance(');b=s.index(' return {...r,',a);s=s[:a]+s[b:]
s=s.replace('authorized,invoke,conformance,','invoke,')
s=s.replace("stage='setup'","stage='read'")
bad="const expectedExitCode=definition.adapterExitMap[expected.outcomeKind==='refusal'?'refused':'acceptedTerminal'];"
good="const exitSlot={result:'acceptedTerminal',refusal:'refused',nonterminal:'acceptedNonTerminal'}[expected.outcomeKind];assert.ok(exitSlot,'explicit published semantic outcome');const expectedExitCode=definition.adapterExitMap[exitSlot];"
assert s.count(bad)==1;s=s.replace(bad,good)
with (D/'ordinary-caller.mjs').open('x') as f:f.write(s)
origins.append({'path':'ordinary-caller.mjs','origin':str(F/'ordinary-caller.mjs'),'originSHA256':sha(F/'ordinary-caller.mjs'),'copySHA256':sha(D/'ordinary-caller.mjs'),
 'adaptation':'read-only caller; explicit result/refusal/nonterminal maps through actual selected adapterExitMap; remove unused authorization/conformance; new05 namespace'})
save('input-correspondence.json',{'C03SourceMembersVerified':sourcecount,'bootstrapPayloadMembersVerified':bootstrapcount,'runtimePayloadMembersVerified':runtimecount,
 'old03StaticRecordsVerified':len(static),'old04ClosedRecordsVerified':fcount,'S03PreparationRecordsVerified':prepcount,'externalPinsVerified':pincount,
 'oldPhysicalStoreBefore':physical,'oldSnapshotPrefixesConserved':True,'originalCopiesAndCallerOrigins':origins,
 'setupConformanceStartCallsToRepeat':0,'nativeColdReadsSelected':4,'allOldTerritoriesReadOnly':True})
print(json.dumps({'status':'four_read_inputs_ready','old03StaticRecords':len(static),'old04Records':fcount,'storeBytes':len(raw),'storeEvents':566}))
