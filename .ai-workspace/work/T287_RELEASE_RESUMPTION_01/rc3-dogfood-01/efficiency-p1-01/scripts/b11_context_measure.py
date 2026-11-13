from pathlib import Path
import json,collections,sys,hashlib,time
z=json.loads(Path('/private/tmp/b11_event_analysis.json').read_text());r=next(x for x in z['large'] if x['ordinal']==2982)
with open(z['path'],'rb')as f:f.seek(r['offset']);x=json.loads(f.read(r['bytes']))
s=x['payload']['value']['task']['sourceNativeWork']; c={'before':s['before'],'after':s['after'],'task':s['task']['context']}
for name,ctx in c.items():
 es=ctx['entries'];fields=collections.Counter();lengths=collections.Counter();types=collections.Counter();examples={}
 for v in es:
  for k,q in v.items():
   fields[k]+=1;types[(k,type(q).__name__)]+=1
   if isinstance(q,str):lengths[k]+=len(q.encode());examples.setdefault(k,q[:90])
 print(name,'entries',len(es),'serializedContextBytes',len(json.dumps(ctx,separators=(',',':'),ensure_ascii=False).encode()),'fields',dict(fields),'stringBytes',dict(lengths),'types',dict(types))
 for v in es:
  if any(isinstance(q,str) and len(q)>300 for q in v.values()):print('large_entry_fields',[(k,type(q).__name__,len(q.encode()) if isinstance(q,str)else '')for k,q in v.items()]);break
for a,b in [('before','task'),('before','after')]:
 aa={e['relativePath']:e for e in c[a]['entries']};bb={e['relativePath']:e for e in c[b]['entries']};same=sum(aa[k]==bb[k] for k in aa.keys()&bb.keys());print(a,b,'common',len(aa.keys()&bb.keys()),'identical_full_entry',same,'changed',len(aa.keys()&bb.keys())-same)
