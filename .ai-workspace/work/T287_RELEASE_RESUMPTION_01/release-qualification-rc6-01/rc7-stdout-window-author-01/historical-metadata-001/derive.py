# One-shot operator evidence projection. Never a runtime/event authority or replay input.
import pathlib,json,hashlib,os,collections
D=pathlib.Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01')
OUT=pathlib.Path(__file__).resolve().parent
CLOSE=D/'d5-author-03/FINAL_RUNTIME_CLOSE.json'
close_bytes=CLOSE.read_bytes();close_sha=hashlib.sha256(close_bytes).hexdigest()
assert close_sha=='6ca141a406721beb702b64706ba867d8af58488b067f5fbe203b3582f0a20929'
prefix=json.loads(close_bytes)['prefix'];assert prefix['prefixLength']==1016286093
path=pathlib.Path(prefix['eventLogRef'].removeprefix('file://'))
scopes=[];scope_ids={};contracts=[];contract_ids={};stdout=[];probes=[];decisions=[];bindings=[];kinds=collections.Counter();chunk_refs=set();qualifying=set()
def intern(obj,values,index):
 key=json.dumps(obj,sort_keys=True,separators=(',',':'))
 if key not in index:index[key]=len(values);values.append(obj)
 return index[key]
def scope(r,p):
 return {k:v for k,v in {**{k:r[k] for k in ['basisId','runId','frameId','graphCallId','graphFunctionRef','materializationRef','scopeClass'] if k in r},**{k:p[k] for k in ['actorInvocationRef','processRef'] if k in p}}.items()}
h=hashlib.sha256();remaining=prefix['prefixLength'];count=0
with path.open('rb') as source:
 before=os.fstat(source.fileno());assert before.st_dev==prefix['storeIdentity']['device'] and before.st_ino==prefix['storeIdentity']['inode'];assert before.st_size>=remaining
 while remaining:
  raw=source.readline(remaining);assert raw and raw.endswith(b'\n');remaining-=len(raw);h.update(raw);r=json.loads(raw);r=r['event'] if isinstance(r.get('event'),dict) else r;count+=1;k=r['kind'];kinds[k]+=1;p=r.get('payload',{});identity=[r['admissionOrdinal'],r['eventId'],r['eventTime']]
  if k=='actor_process_stdout_observed':
   si=intern(scope(r,p),scopes,scope_ids);stdout.append(identity+[si,p['streamOrdinal'],p['byteLength'],p['chunkDigest']]);chunk_refs.add(r['eventId'])
  elif k in ['runtime_activity_probe_observed','runtime_external_interruption_observed']:
   obs=p.get('observation',{});contract=p.get('probeContract',{})
   allowed_contract={key:contract[key] for key in ['kind','schemaVersion','probeRef','probeDigest','declarationEventRef','clockOriginRef','scope','source','sourceRef','required'] if key in contract}
   ci=intern(allowed_contract,contracts,contract_ids)
   probes.append(identity+[ci,obs.get('elapsedMs'),obs.get('signal'),obs.get('coverage'),obs.get('underlyingEventRef'),obs.get('sourceDigest'),obs.get('sourceRevisionDigest')])
   if contract.get('source')=='stdout' and obs.get('signal')=='activity':qualifying.add(obs.get('underlyingEventRef'))
  elif k=='actor_transport_binding_admitted' and 'livenessBinding' in p:
   bindings.append({'admissionOrdinal':r['admissionOrdinal'],'eventId':r['eventId'],'eventTime':r['eventTime'],'scope':scope(r,p),'parser':p.get('parser'),'livenessBinding':p['livenessBinding']})
  elif k in ['actor_process_started','actor_process_timeout_observed','actor_process_exited','actor_process_spawn_failed','actor_process_signal_requested','actor_invocation_failed','actor_invocation_completed']:
   allowed={key:p[key] for key in ['actorInvocationRef','processRef','processId','cCallRef','timeoutClass','timeoutMs','thresholdObservation','exitCode','signal','terminationConfirmed','terminationReason','diagnosticDigest'] if key in p}
   decisions.append({'admissionOrdinal':r['admissionOrdinal'],'eventId':r['eventId'],'eventTime':r['eventTime'],'kind':k,'scope':scope(r,p),'payload':allowed})
 after=os.fstat(source.fileno());assert after.st_dev==before.st_dev and after.st_ino==before.st_ino and after.st_size>=prefix['prefixLength']
assert count==170487 and len(stdout)==84498
assert 'sha256:'+h.hexdigest()==prefix['prefixDigest']
report={'standing':'Historical physical-prefix metadata projection only; not EventStore input, a second log, native Result or new authority. Original event/contract identities stay historical.','close':{'path':str(CLOSE),'bytes':len(close_bytes),'sha256':close_sha},'prefix':prefix,'physicalRows':count,'eventKindCounts':dict(kinds),'scopes':scopes,'probeContracts':contracts,'livenessBindings':bindings,'stdoutColumns':['admissionOrdinal','eventId','eventTime','scopeIndex','streamOrdinal','byteLength','chunkDigest'],'stdout':stdout,'probeColumns':['admissionOrdinal','eventId','eventTime','probeContractIndex','elapsedMs','signal','coverage','underlyingEventRef','sourceDigest','sourceRevisionDigest'],'probes':probes,'decisions':decisions,'limits':['Only public mechanical metadata is selected. No provider reasoning/text/tool_result/stderr/auth/credentials or raw Result/task/binding bodies are emitted.','No structured turn boundaries are invented. Historical stdout eventTime is its admitted wall-clock stamp; exact actor capture elapsedMs is only supplied by corresponding admitted probes. Noise-only chunk actor-clock instants are not inferred from wall time.','Actual-stream differential may compare recorded qualifying activity and decision points, within supplied clocks/scopes. Synthetic non-private mixed/noise/two-scope/turn-boundary cases separately prove classifier/window scheduling.','Archive byte integrity and original provider chunk content cannot be reconstructed from this metadata; current-owner archive failure/cold-replay discriminators are separate.','No runtime acquisition, provider invocation or log mutation. Only the exact closed historical prefix was read while later bytes may exist.']}
target=OUT/'metadata.json'
with target.open('x') as dest:json.dump(report,dest,separators=(',',':'));dest.write('\n')
metadata_bytes=target.read_bytes();summary={'kind':'bounded_historical_stdout_metadata_projection','close':report['close'],'prefix':prefix,'physicalRows':count,'stdoutRows':len(stdout),'probeRows':len(probes),'decisionRows':len(decisions),'scopeCount':len(scopes),'probeContractCount':len(contracts),'stdoutWithQualifyingActivityProbe':len(chunk_refs&qualifying),'stdoutWithoutQualifyingActivityProbe':len(chunk_refs-qualifying),'metadata':{'path':str(target),'bytes':len(metadata_bytes),'sha256':hashlib.sha256(metadata_bytes).hexdigest()},'derivation':{'path':str(pathlib.Path(__file__).resolve()),'bytes':pathlib.Path(__file__).stat().st_size,'sha256':hashlib.sha256(pathlib.Path(__file__).read_bytes()).hexdigest()},'physicalPrefixSha256':h.hexdigest(),'physicalIdentityBefore':{'device':before.st_dev,'inode':before.st_ino,'size':before.st_size},'physicalIdentityAfter':{'device':after.st_dev,'inode':after.st_ino,'size':after.st_size},'limits':report['limits']}
(OUT/'MANIFEST.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps({k:v for k,v in summary.items() if k not in ['limits','prefix','close']}))
