from pathlib import Path
import mmap,re,json,collections,hashlib,time
p=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/setup-006/resources/events/runtime.events.jsonl')
patterns={k:re.compile(rb'"'+k.encode()+rb'":"([^"\\]*)"') for k in ('kind','eventTime','eventId','graphFunctionRef','aggregateType','runId')};ordinal=re.compile(rb'"admissionOrdinal":(\d+)'); counts=collections.Counter();sizes=collections.Counter();large=[];timeline=[]; missing=0;t0=time.monotonic()
with p.open('rb')as f,mmap.mmap(f.fileno(),0,access=mmap.ACCESS_READ)as m:
 n=len(m);pos=0
 while pos<n:
  e=m.find(b'\n',pos)
  if e<0:break
  end=e+1;h=m[pos:min(pos+6000,e)];v={k:(z.group(1).decode() if (z:=rx.search(h)) else None)for k,rx in patterns.items()};q=ordinal.search(h);v['ordinal']=int(q.group(1))if q else None;v['bytes']=end-pos;v['offset']=pos;k=v['kind']
  if not k:missing+=1
  else:counts[k]+=1;sizes[k]+=end-pos
  if end-pos>1_000_000:large.append(v)
  if k and k not in ('runtime_activity_probe_observed','actor_process_stdout_observed','actor_process_stderr_observed'):timeline.append(v)
  pos=end
z={'path':str(p),'bytes':n,'records':sum(counts.values()),'missingKind':missing,'trailingBytes':n-pos,'scanSeconds':time.monotonic()-t0,'counts':counts,'sizes':sizes,'large':large,'timeline':timeline}
Path('/private/tmp/b11_event_analysis.json').write_text(json.dumps(z,separators=(',',':')))
print('bytes',n,'records',z['records'],'missing',missing,'scanSeconds',round(z['scanSeconds'],3))
print('top kinds by bytes',sizes.most_common(12));print('largest',[(x['ordinal'],x['kind'],x['bytes'],x['eventTime'],x['graphFunctionRef'])for x in sorted(large,key=lambda x:x['bytes'],reverse=True)[:14]])
print('actor/closure kinds',[(k,v)for k,v in counts.items()if any(q in k for q in ('actor_process','actor_invocation','graph_call','c_call_result','run_closed'))])
