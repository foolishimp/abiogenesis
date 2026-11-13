from pathlib import Path
import json,sys,time,gc
z=json.loads(Path('/private/tmp/b11_event_analysis.json').read_text());o=int(sys.argv[1]);r=next(x for x in z['large'] if x['ordinal']==o);p=Path(z['path']);t=__import__('time').monotonic()
with p.open('rb')as f:f.seek(r['offset']);x=json.loads(f.read(r['bytes']))
print('event',o,'kind',x['kind'],'bytes',r['bytes'],'payload keys',list(x.get('payload',{})))
def size(y):return len(json.dumps(y,ensure_ascii=False,separators=(',',':')).encode())
def walk(v,path,depth):
 if depth>4:return
 if isinstance(v,dict):
  for k,q in v.items():
   if not isinstance(q,(dict,list)):continue
   n=size(q)
   if n>=500000:print(path+'/'+str(k),'bytes',n,'type',type(q).__name__,'count',len(q),'keys',list(q)[:14] if isinstance(q,dict)else '')
   if n>=5000000 and depth<4:walk(q,path+'/'+str(k),depth+1)
 elif isinstance(v,list) and len(v)<=12:
  for i,q in enumerate(v):
   if isinstance(q,(dict,list)):
    n=size(q)
    if n>=500000:print(path+'/'+str(i),'bytes',n,'type',type(q).__name__,'count',len(q))
    if n>=5000000:walk(q,path+'/'+str(i),depth+1)
walk(x,'',0);print('elapsed',round(time.monotonic()-t,2))
