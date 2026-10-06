from pathlib import Path
import hashlib,json,shutil,tarfile,datetime
D=Path(__file__).resolve().parent;G=D.parent
P=G/'rc1-s03-input-preparation-01'; C=G/'final-candidate-construction-03'
H=G/'f11-carrier-installed-input-preparation-01'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
read=lambda p:json.loads(p.read_text())
def save(n,v):
 with (D/n).open('x') as f:json.dump(v,f,indent=2);f.write('\n')
def verify(root,rs):
 for r in rs:
  p=root/r['path'];assert p.is_file() and p.stat().st_size==r['bytes'] and sha(p)==r['sha256'],str(p)

grant=G/'rc1-c03-installed-discriminators-controls-01/s03-request.txt'
assert sha(grant)=='58331ab54f4b9da983f627bbd273d332d9554560adae0fc9caa566cd14047651'
assert sha(G/'rc1-c03-acceptance-01/acceptance.json')=='bc9b3004543d2338487cb76f8ab98f44181d1b0a58421a53d2d734a4a0491e5f'
assert sha(P/'freeze.json')=='86992e2d7be5ca6c59d9c049b29fb8f65d11fc68ad7c652ecf82993b5cc087ec'
verify(P,read(P/'freeze.json')['records'])
pins=read(P/'source-pins.json')['records']
for r in pins:
 p=Path(r['path']);assert p.stat().st_size==r['bytes'] and sha(p)==r['sha256'],str(p)
assert sha(C/'final-freeze.json')=='a4095d2a472f234d32bf063c5433b59003c536d66455ebed011ef7f7472f8d8a'
selected=read(C/'final-selected-core.json')
identity=read(C/'final-package-identity.json')
assert sha(Path(identity['artifactPath']))=='f779058d1cc3c1867f8d53c1dda9100a136d7fa460772b6084e2f67c0cd982c6'
verify(Path(identity['packageRoot']),read(C/'final-archive-members.json'))
donor=read(P/'donor-selection.json')
assert sha(Path(donor['archive']['path']))==donor['archive']['sha256']
with tarfile.open(donor['archive']['path'],'r:gz') as tar:
 rs={r['path']:r for r in donor['archiveMembers']}
 assert {m.name for m in tar.getmembers() if m.isfile()}==set(rs)
 for name,r in rs.items():
  b=tar.extractfile(name).read();assert len(b)==r['bytes'] and hashlib.sha256(b).hexdigest()==r['sha256']
save('runtime-activation.json',{'kind':'root_runtime_execution_activation','operation':'T287_RC1_S03_INSTALLED_PAIR_03',
 'executionRoot':str(D),'role':'Runtime-only Worker','actor':'/root/rc1_successor_builder','realProviderCalls':0,
 'request':str(grant),'requestSHA256':sha(grant),'acceptedCandidateFreezeSHA256':sha(C/'final-freeze.json'),
 'rootAcceptanceSHA256':sha(G/'rc1-c03-acceptance-01/acceptance.json'),'startedAt':datetime.datetime.now(datetime.timezone.utc).isoformat()})
save('selected-core.json',{**selected,'installedRoot':selected['packageRoot']})
save('prospective-cases.json',{'core':{'artifactPath':selected['artifactPath'],'artifactRef':selected['artifactRef'],'basis':selected['basis']},
 'fixture':{'artifactPath':donor['archive']['path'],'artifactRef':Path(donor['archive']['path']).as_uri(),
 'basis':{'artifactDigest':'sha256:'+donor['archive']['sha256'],'manifestDigest':donor['canonicalManifestDigest'],
 **{k:donor['productIdentity'][k] for k in ['productContentDigest','productId','packageName','packageVersion']}}},
 'cases':[{'name':'positive','correctionAvailable':True},{'name':'no-action','correctionAvailable':False}],
 'originalFixtureImplementation':donor['fixtureImplementation'],'originalPublicationPreimage':donor['publicationPreimage']})
for n in ['tmp','cache','config','resources/events','positive','no-action']: (D/n).mkdir(parents=True,exist_ok=True)
for n in ['user.npmrc','global.npmrc']:(D/'config'/n).write_text('')
save('runtime-environment.json',{'TMPDIR':str(D/'tmp'),'npm_config_cache':str(D/'cache'),
 'npm_config_userconfig':str(D/'config/user.npmrc'),'npm_config_globalconfig':str(D/'config/global.npmrc'),
 'npm_config_offline':'true','npm_config_audit':'false','npm_config_fund':'false','npm_config_update_notifier':'false',
 'GIT_OPTIONAL_LOCKS':'0','PATH':str(C/'source-freeze/toolchain/bin')+':/usr/bin:/bin:/usr/sbin:/sbin'})
save('resource-plan.json',{'eventLogPath':str(D/'resources/events/runtime.events.jsonl'),'newTerritory':str(D),'oldStoreAcquisition':False})
save('budgets.json',{'driverBudgetMs':1200000,'stages':{'setup':180000,'conformance':180000,'start':600000,'read':180000},
 'terminationGraceMs':1000,'heapChanges':False,'timerChanges':False,'claim':'actual finite total caller deadline, not a Runtime policy override'})
origins=[]
for n in ['caller-draft.mjs','original-consumers.mjs','sole-output-renderer.mjs','original-oracle.json','pair-inputs.json','readback-contract.json']:
 p=P/n;shutil.copy2(p,D/n);origins.append({'path':n,'origin':str(p),'sha256':sha(p),'copiedByteExact':True})
for n in ['ordinary-caller.mjs','public-support.mjs','observe-process.py']:
 p=H/n;s=p.read_text()
 if n=='ordinary-caller.mjs':
  s=s.replace('T287_F11_CARRIER_INSTALLED_DISCRIMINATOR_01','T287_RC1_S03_INSTALLED_PAIR_03')
  s=s.replace('f11-carrier-installed-discriminator-01','rc1-s03-installed-execution-03')
  s=s.replace('loadRuntime,declaredCli,constructStart','loadRuntime,declaredCli')
  a=s.index(' async function prepareStart(');b=s.index(' return {...r,',a)
  s=s[:a]+s[b:]
  s=s.replace('prepareStart,start,freshReads,','')
  s=s.replace("async function invoke(label,call,stage='setup'){","async function invoke(label,call,stage='setup',expected={outcomeKind:'result'}){")
  s=s.replace("const started=performance.now();let processFailure=null,terminal;", "const definition=installedPublic.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(d=>d.definitionKey.operationId===call.invocation.definitionKey.operationId&&d.definitionKey.memberKey===call.invocation.definitionKey.memberKey);assert.ok(definition);const expectedExitCode=definition.adapterExitMap[expected.outcomeKind==='refusal'?'refused':'acceptedTerminal'];assert.equal(typeof expectedExitCode,'number');\n  const started=performance.now();let processFailure=null,terminal;")
  s=s.replace('terminal.code!==0||','terminal.code!==expectedExitCode||')
  s=s.replace("assert.equal(receipt.ownerOutput?.outcomeKind,'result',JSON.stringify(receipt));assert.equal(receipt.exitCode,0,JSON.stringify(receipt));", "assert.equal(receipt.failure,null,JSON.stringify(receipt));assert.equal(receipt.ownerOutput?.outcomeKind,expected.outcomeKind,JSON.stringify(receipt));assert.equal(receipt.exitCode,expectedExitCode,JSON.stringify(receipt));if(expected.code!==undefined)assert.equal(receipt.ownerOutput.value.code,expected.code); ")
 if n=='public-support.mjs':s=s[:s.index('export async function constructStart')]
 with (D/n).open('x') as f:f.write(s)
 origins.append({'path':n,'origin':str(p),'originSHA256':sha(p),'copySHA256':sha(D/n),
 'adaptation':'bounded caller activation/namespace and actual declared expected refusal mapping; unused F11 start/control functions omitted' if n=='ordinary-caller.mjs' else ('loader-only current public exports' if n=='public-support.mjs' else 'byte-exact process observer')})
save('input-correspondence.json',{'preparationRecordsVerified':13,'externalPinsVerified':len(pins),'fixtureArchiveMembersVerified':len(donor['archiveMembers']),
 'C03PayloadMembersVerified':identity['archiveMembers'],'originalCopiesAndCallerOrigins':origins,
 'ProductSourceFixtureCandidateMutations':0,'coreBootstrapReadOnly':True,'effectTerritory':str(D)})
print(json.dumps({'status':'ready_for_bounded_runtime_preflight','inputsVerified':len(pins),'candidatePayloadVerified':identity['archiveMembers']}))
