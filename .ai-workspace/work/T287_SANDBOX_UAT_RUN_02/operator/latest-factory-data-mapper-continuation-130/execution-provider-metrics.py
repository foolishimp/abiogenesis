from pathlib import Path
import json,hashlib,datetime
phase=Path(__file__).parent
rows=[json.loads(line) for line in (phase/'execution-milestones.jsonl').read_text().splitlines()]
done={r['actorInvocationRef'] for r in rows if r.get('kind')=='operator_provider_completion'}
starts={r['facts']['actorInvocationRef']:r for r in rows if r.get('kind')=='actor_process_started'}
bindings={r['facts']['cCallRef']:r for r in rows if r.get('kind')=='actor_transport_binding_admitted'}
store=Path('/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/sandbox-uat/data-mapper-full/2026-10-08T17-40-42-399Z-9331fc68-b309-49fb-a8f1-9a544450add9/resources/events/runtime.events.jsonl')
for exitrow in [r for r in rows if r.get('kind')=='actor_process_exited']:
 ref=exitrow['facts']['actorInvocationRef']
 if ref in done:continue
 start=starts.get(ref);binding=bindings.get(start['facts'].get('cCallRef')) if start else None
 if not binding:continue
 with store.open('rb') as f:f.seek(binding['offset']);value=json.loads(f.read(binding['byteCount']))['payload']
 paths=value['paths'];transport=Path(paths['transport'])
 if not transport.exists():continue
 transportbytes=transport.read_bytes();t=json.loads(transportbytes)
 final=None;digest=hashlib.sha256()
 with Path(paths['stdout']).open('rb') as f:
  for line in f:
   digest.update(line)
   try:item=json.loads(line)
   except json.JSONDecodeError:continue
   if item.get('type')=='result':final=item
 result={k:final[k] for k in ['duration_ms','duration_api_ms','num_turns','total_cost_usd','usage','is_error','subtype'] if final and k in final}
 row={'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'kind':'operator_provider_completion','actorInvocationRef':ref,
      'pid':start['facts']['processId'],'graphFunctionRef':binding['graphFunctionRef'],'bindingOrdinal':binding['ordinal'],'exitOrdinal':exitrow['ordinal'],
      'paths':paths,'promptByteCount':Path(paths['prompt']).stat().st_size,'stdoutByteCount':Path(paths['stdout']).stat().st_size,'stdoutSHA256':digest.hexdigest(),
      'transportSHA256':hashlib.sha256(transportbytes).hexdigest(),'transportByteCount':len(transportbytes),
      'transport':{k:t.get(k) for k in ['disposition','status','signal','timedOut','terminationConfirmed','exitObserved','toolCallCount','failureClass']},'provider':result}
 with (phase/'execution-milestones.jsonl').open('a') as f:f.write(json.dumps(row)+'\n')
 print(json.dumps({k:v for k,v in row.items() if k!='paths'}))
