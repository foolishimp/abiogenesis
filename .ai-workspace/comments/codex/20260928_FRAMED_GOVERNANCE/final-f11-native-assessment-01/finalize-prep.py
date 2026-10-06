from pathlib import Path
import json, hashlib, difflib

D = Path(__file__).resolve().parent
G = D.parent
B = G / 'final-f11-bound-assessment-01'
X = G / 'final-f11-native-assessment-execution-01'
def sha(b): return hashlib.sha256(b).hexdigest()
def read(p): return json.loads(p.read_bytes())
def record(p):
    b=p.read_bytes()
    return {'path':str(p),'bytes':len(b),'sha256':sha(b)}
def put(name,value):
    p=D/name
    with p.open('x') as f: json.dump(value,f,indent=2);f.write('\n')
freeze_record=record(B/'freeze.json')
assert freeze_record['bytes']==13795 and freeze_record['sha256']=='f32d6de072d65f922c15e388b5827f605469ed0ace0e5cbc4b3edfc3b5c6477e'
bound=read(B/'freeze.json')
for r in bound['records']:
    actual=record(B/r['path'])
    assert actual['bytes']==r['bytes'] and actual['sha256']==r['sha256'],r['path']
pin={'root':str(B),'freeze':freeze_record,'assessmentInput':record(B/'assessment-input.json'),
     'workerRequest':record(B/'worker-request.json'),'prompt':record(B/'prompt.txt'),
     'measurement':record(B/'prompt-measurement.json'),
     'candidateLaw':'Immutable C02/Q02 RC1','controlBasis':'stdo://releases/v2.5.1-rc.2/'}
assert pin['assessmentInput']['sha256']=='10ebbf15a389ca5d15c7d84ed4feb1cafe63dc2b5be1c3f717229c65c5a29901'
assert pin['workerRequest']['sha256']=='0d21b292dc1944eac9c8fbf01475a68e72ca27e17c083af2929c4402818e7401'
measurement=read(B/'prompt-measurement.json')
assert measurement['promptUTF8Bytes']==1021244
put('bound-input-pin.json',pin)
budgets={'selection':'prospective finite workload envelope; Root grant required',
 'actualPromptUtf8Bytes':measurement['promptUTF8Bytes'],'actualInputFileBytes':pin['assessmentInput']['bytes'],
 'actualInputCanonicalBytes':67784040,'sourceBodies':39,'hosts':10,
 'nodeOldSpaceMiB':4096,'purePreflightAllowanceMs':180000,
 'actorInactivityMs':900000,'actorAbsoluteMs':1200000,'terminationGraceMs':1000,
 'stages':{'setup':180000,'assessment':1440000,'read':180000},
 'totalCeilingMs':2400000,'outerTerminationGraceMs':1000,
 'operationPlan':['assessment-view','conformance-assess','assess-rule','assess-rule-run_result','assess-rule-run_replay'],
 'rationale':'Accommodates complete 67,784,040-byte admission input, two catalog-bearing setup calls, one unchanged 1,021,244-byte prompt, native result/event JSON and two cold reads. A finite envelope is not a prediction or capacity acceptance.',
 'memory':'Existing Node old-space setting bounds driver and CLI managed heaps to 4096 MiB each. No installed OS RSS or Claude resident-memory cap; wait4 actual peakRSS retained.',
 'capacity':'Actual provider token/context capacity and account access remain unknown. No clipping, partitioning, model substitution, automatic retry or second assessment.'}
put('budgets.json',budgets)
env=read(D/'runtime-environment.json')
for k,v in list(env.items()):
    if str(D) in v: env[k]=v.replace(str(D),str(X))
env.update({'NODE_OPTIONS':'--max-old-space-size=4096','ABG_TS_FP_TIMEOUT_MS':'900000',
 'ABG_TS_FP_ABSOLUTE_TIMEOUT_MS':'1200000','ABG_TS_FP_TERMINATION_GRACE_MS':'1000'})
(D/'runtime-environment.json').write_text(json.dumps(env,indent=2)+'\n')
resource=read(D/'resource-plan.json')
resource['ownedReports']=str(X)
resource['frozenCallerRoot']=str(D)
resource['frozenBindingRoot']=str(B)
resource['executionArgv']=['python3',str(D/'observe-process.py'),str(X/'driver-process.json'),
 'node','--max-old-space-size=4096',str(D/'driver.mjs'),str(X)]
resource['contextWrites']='No assessment worksite/context writes declared; closed_prompt_proof has no tools. Native Claude executable runs with original inherited HOME/auth context; any transport-maintained user state is not falsely described as event-only.'
resource['actorCwd']=str(G/'final-native-setup-03')
(D/'resource-plan.json').write_text(json.dumps(resource,indent=2)+'\n')
donor=G/'final-observed-c2-01'
bootstrap=record(donor/'bootstrap-core.json')
row=next(r for r in read(donor/'freeze.json')['records'] if r['path']=='bootstrap-core.json')
assert bootstrap['bytes']==row['bytes'] and bootstrap['sha256']==row['sha256']
with (D/'retained-bootstrap-core.json').open('xb') as f: f.write((donor/'bootstrap-core.json').read_bytes())
consumed=read(D/'consumed-inputs.json')
consumed += [bootstrap,freeze_record,pin['assessmentInput'],pin['workerRequest'],pin['prompt'],pin['measurement']]
(D/'consumed-inputs.json').write_text(json.dumps(consumed,indent=2)+'\n')
effect={'status':'prepared_only_requires_exact_Root_native_activation','activation':'T287_F11_NATIVE_ASSESSMENT_01',
 'entry':resource['executionArgv'],'workingDirectory':str(D),'outputRoot':str(X),
 'readOnly':[str(D),str(B),'all C02/Q02/Material02 cuts and source/installed Product bytes'],
 'ordinaryPublicEntry':'constructInstalledPublicDefinitionCall -> package-declared abg.cli --jsonl -> installed Public admission',
 'calls':[{'label':'assessment-view','operation':'product.operation.catalog.view','member':'allowlist','effect':'ordinary selected CatalogView operation; no assessment'},
 {'label':'conformance-assess','operation':'conformance.operation.evaluate','member':'gtl_program','effect':'ordinary exact existing assessment Program conformance'},
 {'label':'assess-rule','operation':'abg.operation.run.invoke','member':'start','effect':'one actual assessment occurrence and Claude closed_prompt_proof transport'},
 {'label':'assess-rule-run_result','operation':'abg.operation.project.read','member':'run_result','effect':'fresh result read on actual returned handoff'},
 {'label':'assess-rule-run_replay','operation':'abg.operation.project.read','member':'run_replay','effect':'fresh replay read on same returned handoff'}],
 'rootActorRef':resource['rootActorRef'],'programRef':'program://abiogenesis/qualification/assess@5',
 'graphFunctionRef':'graph-function://abiogenesis/qualification/assess@5','programLocusRef':'node://abiogenesis/qualification/assess@5',
 'inputContractRef':'contract://abiogenesis/qualification/assessment-input@5',
 'rawContractRef':'contract://abiogenesis/qualification/assessment-raw@5',
 'terminalContractRef':'contract://abiogenesis/qualification/judgment@5',
 'initialPrefix':resource['initialCloseHandoff']['prefix'],'originalStoreIdentity':resource['storeIdentity'],
 'writes':[{'territory':str(X),'owner':'Root-selected external caller/observer','operations':'exclusive reports/requests/stdout/stderr/timings/process receipts/readbacks/handoffs/proof and byte-prefix snapshots; optional npm cache/config beneath this territory'},
 {'territory':resource['eventLogPath'],'owner':'existing Runtime event owner only','operations':'append from exact original 84-event prefix, same device/inode; no overwrite/truncate/rebase'},
 {'territory':resource['lockDirectory'],'owner':'existing Runtime lock owner','operations':'original device-inode lock acquisition/release; preserve namespace'},
 {'territory':resource['archiveRoot'],'owner':'existing actor/transport owner','operations':'exclusive fp-<attemptDigest16>-prompt.txt, -output.txt, -stdout.log, -stderr.log, -transport.json for this occurrence; filenames use actual prepared attempt identity'},
 {'territory':env['TMPDIR'],'owner':'existing ProductVerification/transport/runtime owners','operations':'native verification temporary unpack/read/remove and existing runtime temporaries; no redirected lock namespace'}],
 'worksiteWrites':False,'sourceWrites':False,'GitEffects':False,'restartHello':False,'C2Calls':0,
 'transport':{'provider':'claude','command':env['ABG_TS_CLAUDE_COMMAND'],'appendArgs':json.loads(env['ABG_TS_CLAUDE_APPEND_ARGS']),
 'lane':'closed_prompt_proof','tools':'none','cwd':resource['actorCwd'],'prompt':'complete unchanged qualificationWorkerRequest.prompt via stdin',
 'response':'actual installed raw JSON schema, Claude stream-json parser','environment':env,
 'inheritedEnvironment':'Root process environment including original HOME/auth configuration; no secret values retained in effect plan. Native CLI user-state effects depend on installed transport; no invented redirected auth/cache guarantee.'},
 'payload':{'inputFileBytes':82175295,'inputCanonicalBytes':67784040,'scopeCanonicalBytes':43152263,
 'declarationsCanonicalBytes':18157167,'provenanceCanonicalBytes':5330633,'materialCanonicalBytes':1121677,
 'promptUtf8Bytes':1021244,'workerRequestFileBytes':pin['workerRequest']['bytes'],'bodies':39,'hosts':10,
 'retainedScope':'complete 1950 inventory/2137 rules/95 source correspondence; no silent trimming',
 'costObservation':'retain actual admission/serialization process timings and wait4 peakRSS; retain final event bytes and growth'},
 'budgets':budgets,'providerCapacity':'unknown until actual native transport; shell DNS observation is not a native cause or dispatch prohibition',
 'closedFailure':'If a genuine start returns a legal closed handoff/Run, perform both fresh reads before semantic assertions even if no J; typed result notfound is truthful. Stop on absent legal handoff/process closure; never synthesize closure or dispatch again.',
 'proof':'Construct subordinate qualification_proof_resource only from actual typed native J and producer slot/task/Program/invocation/Result; public projectQualificationJudgment must reproduce it. No new consumer CCall or fabricated final F11 authority.',
 'acceptance':'Source-grounded falsified is useful mechanism evidence and a Product issue. Indeterminate/unknown/insufficient attribution remain open; no forced green/full F11/AF22 verdict.',
 'activationFields':{'kind':'root_native_execution_activation','operation':'T287_F11_NATIVE_ASSESSMENT_01','ordinaryCalls':5,
 'assessmentDispatches':1,'executionOutputRoot':str(X),'nodeOldSpaceMiB':4096,
 'grant':'exact later Root request file record {path,bytes,sha256}',
 'callerFreeze':'exact CLOSED prep freeze record {path,bytes,sha256}','boundFreeze':freeze_record,'budgets':budgets}}
put('effect-plan.json',effect)
print(json.dumps({'status':'PINNED_CLOSED_BOUND_INPUTS','boundRecords':len(bound['records']),'promptBytes':1021244,'outputRoot':str(X)}))
