from pathlib import Path
import json,hashlib,datetime,subprocess,os,re
N=Path(__file__).resolve().parent;D=N/'runtime-001';C=Path('/private/tmp/abg-rc11-qualification-20261109');T='build_tenants/abiogenesis/typescript';F=N/'frozen-source'
def sha(b):return hashlib.sha256(b).hexdigest()
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':sha(b)}
def read(p):return json.loads(Path(p).read_text())
def write(name,obj):
 with (N/name).open('x') as f:json.dump(obj,f,indent=2);f.write('\n')
 return pin(N/name)
streams=list((D/'resources/archives').glob('*stdout.log'));assert len(streams)==1;p=streams[0];calls=[];results={};terminal=[]
for line_no,line in enumerate(p.read_text(errors='replace').splitlines(),1):
 try:x=json.loads(line)
 except:continue
 if x.get('type')=='result':terminal.append({'line':line_no,'type':x.get('type'),'subtype':x.get('subtype'),'is_error':x.get('is_error')})
 for c in x.get('message',{}).get('content',[]):
  if c.get('type')=='tool_use':calls.append({'ordinal':len(calls)+1,'line':line_no,'timestamp':x.get('timestamp'),'request':c})
  if c.get('type')=='tool_result':results[c['tool_use_id']]={'line':line_no,'result':c}
request_rows=[]
for c in calls:
 r=dict(c);req=dict(r['request']);inp=dict(req.get('input',{}))
 for key in ['content','old_string','new_string']:
  if key in inp:
   b=inp[key].encode();inp[key]={'bytes':len(b),'sha256':sha(b),'exactValue':'Original request at retained stdout JSON line'}
 req['input']=inp;r['request']=req;r['resultLine']=results.get(req['id'],{}).get('line');request_rows.append(r)
activity=write('TOOL_ACTIVITY.json',{'status':'ACTUAL_TOOL_REQUESTS_WITH_RETAINED_EXACT_ARCHIVE_LOCATORS','stream':pin(p),'toolCallCount':len(calls),'terminalMessages':terminal,'toolRequests':request_rows,'standing':'Private reasoning omitted. Source write contents remain exact in the retained original stream and source freeze; no read-scope conformance claim.'})
# Known bounded repository read deviations and explicit failed/metadata read attempts.
selected=[8,14,23,24,32,33,40,41,45]
residual=[]
for i in selected:
 c=calls[i-1];residual.append({'ordinal':i,'sourceLine':c['line'],'request':c['request'],'actualResult':results.get(c['request']['id'])})
matched=[T+'/code/src/abg/runtime_derivation.ts',T+'/code/src/shared/immutable.ts',T+'/test_env/support/d5-authentic-preserved-result-fixture.mjs',T+'/test_env/support/evidence-root.mjs',T+'/test_env/support/t287-selected-action-host.mjs',T+'/test_env/support/single-address-space-consolidation.mjs',T+'/test_env/tests/t287-selected-action.test.mjs',T+'/test_env/tests/t287-held-owner-fold-reuse.test.mjs',T+'/test_env/tests/t287-event-calculus-owner-continuation.test.mjs']
old={x['path']:x for x in read(N/'SOURCE_INVENTORY.json')['rows']}; matchedpins=[]
for rel in matched:
 got=pin(F/rel);assert got['sha256']==old[rel]['sha256'];matchedpins.append({'relativePath':rel,'preimage':old[rel],'frozen':got})
process=write('PROCESS_RESIDUAL.json',{'status':'BOUNDED_READ_AND_ORDER_DEVIATIONS_RETAINED_FOR_ROOT','stream':pin(p),'actualReadRequestsAndOutputs':residual,'matchedAdditionalSourcePreimages':matchedpins,'originatingNeed':'Tool descriptions and exact requests record fixture-loader conventions, nominal prefix immutability, existing decoder usage, version precedent and physical test readback. The platform tool-result file is output of an already selected lifetime-test read. Tool 32 broad search matched only the listed event_prefix.ts. Tool 40 recursive grep was rejected by shell glob expansion and absent build files were not read. Directory/listing and Git-history reads are separately visible.','rootDisposition':'Root explicitly allowed remaining admitted source-only call to continue; no grant, task or Run was rewritten. These read-only observations of repository-owned source confer no new Product authority.','writeOrderResidual':{'firstSourceWriteTool':21,'firstMetadataWriteTool':25,'readmeWriteTool':42,'description':'README-first instruction was not literally followed; supplied helper/leaf and metadata writes preceded README.'},'scopeStatement':'All ten final source mutations match allowed paths and native after-observation. This is not a complete read-scope conformance claim or technical filesystem isolation claim.'})
events=[json.loads(l) for l in (D/'resources/events/runtime.events.jsonl').read_text().splitlines()]
actor=[x for x in events if x['kind']=='actor_result_artifact_observed'];assert len(actor)==1;a=actor[0]['payload']
actor_small={k:v for k,v in a.items() if k not in ['toolInvocations','artifactDigests']}
eventfacts=[{'eventId':x['eventId'],'kind':x['kind'],'payload':x['payload']} for x in events if x['kind'] in ['actor_process_timeout_observed','actor_process_signal_requested','actor_process_exited']]
# Mechanical source completeness observations, without executing candidate code.
lf=T+'/test_env/tests/t287-owned-process-lifetime.test.mjs';new=(F/lf).read_bytes(); original=subprocess.check_output(['git','-C',str(C),'show','93a0de75a16c9e4cd29ec561d159b12add4bb3fd:'+lf],env=dict(os.environ,GIT_OPTIONAL_LOCKS='0'))
marker=b'function httpDeclaration';prefix_same=new[:new.index(marker)]==original[:original.index(marker)];assert prefix_same
counts={name:len(re.findall(rb'^test\(', (F/T/'test_env/tests'/name).read_bytes(),re.M)) for name in ['t287-native-assessment-evidence.test.mjs','t287-selected-action-authority.test.mjs','t287-owned-process-lifetime.test.mjs']}
mechanical=write('COMPLETENESS_OBSERVATIONS.json',{'status':'STATIC_FROZEN_SOURCE_OBSERVATIONS_NO_EXECUTION','sourceFreeze':pin(N/'source-freeze.json'),'topLevelCaseCounts':counts,'selectedActionThirdCase':'Still explicitly gated by ABI5_SELECTED_ACTION_OWNER_SUBJECT; default two component cases.','controlledInitialRegionByteExact':prefix_same,'controlledRegionDescription':'Original bytes before function httpDeclaration (through line 443), including the full literal 2 x 3 x 2 handback loop, unchanged.','presentSourceWork':['All ten named source targets changed; new loader and README are present.','Both supplied helper/leaf postimages match exactly.','Physical source includes prospective 5000/10005 setup allowances, derived 62000/51000 top-level caps, five HTTP mode and three capture-leg diagnostics.','Four native cases and eighteen lifetime cases remain declared.'],'gaps':['Native author report is null; finalOutput empty, assessment absent after absolute timeout.','No node --check, build or test command was issued by the native actor; syntax/import and behavioral completeness remain unproved.','Last tool was a read-only lifetime diff-hunk query; source may be complete or partial and requires independent source/proof disposition.','No claim of semantic preservation is inferred from case counts or unchanged controlled region.'],'operatorRepairs':False})
outcome=read(D/'calls/lifecycle-start.outcome.json')['receipt']['ownerOutput']['value'];final=read(D/'FINAL.json');value=read(N/'NATIVE_AFTER_OBSERVATION.json')['value'];fr=read(N/'source-freeze.json')
ret=write('RETURN.json',{'status':'RC11_NATIVE02_CLOSED_ABSOLUTE_LIMIT_PARTIAL_SOURCE_FROZEN','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rootAdmission':pin(N/'ROOT_NATIVE_ADMISSION.json'),'prepared':pin(D/'PREPARED.json'),'binding':pin(N/'BINDING.json'),'task':pin(N/'TASK.json'),'actualSdkOutcome':pin(D/'calls/lifecycle-start.outcome.json'),'hostFinal':pin(D/'FINAL.json'),'physicalClose':pin(D/'resource-close.json'),'freshReadbacks':pin(D/'FRESH_READBACKS.json'),'run':final['run'],'sdkDisposition':outcome['disposition'],'nativeFailure':{'kind':value['kind'],'failureClass':value['failureClass'],'report':value['report'],'observationFailure':value['observationFailure']},'actorArtifact':actor_small,'actualLifecycleEvents':eventfacts,'freshOutcomes':read(D/'FRESH_READBACKS.json')['observations'],'sourceFreeze':pin(N/'source-freeze.json'),'sourceDigest':fr['sourceDigest'],'sourceRows':len(fr['rows']),'sourceCustody':pin(N/'SOURCE_CUSTODY.json'),'toolActivity':activity,'processResidual':process,'completeness':mechanical,'hostStanding':'Host exit 0 and physical close mean custody completed; native workflow failed with no terminal result.','nextOwner':'Root conjoins independent source reviews and external proof. No automatic third author, source repair, proof execution or acceptance.'})
print(json.dumps({'return':ret,'processResidual':process,'activity':activity,'completeness':mechanical,'toolCount':len(calls),'timeout':a.get('timeoutClass'),'actorStatus':a.get('processStatus'),'caseCounts':counts,'controlledPrefixUnchanged':prefix_same}))
