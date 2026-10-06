from pathlib import Path
import json, hashlib, time, signal, sys, subprocess, traceback
started=time.monotonic()
R=Path('/Users/jim/src/apps/abiogenesis');G=R/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE'
O=G/'final-s01-retained-output-review-01';C=G/'final-candidate-construction-02';N=G/'final-native-continuation-04';N3=G/'final-native-setup-03'
S=C/'source-freeze/repo/build_tenants/abiogenesis/typescript/code/src'
def sha(b):return hashlib.sha256(b).hexdigest()
def j(p):return json.loads(p.read_bytes())
def save(n,v):(O/n).write_text(json.dumps(v,indent=2)+'\n')
def show(k,v):print(k,json.dumps(v,ensure_ascii=False,separators=(',',':')),flush=True)
def lines(p,a,z):return '\n'.join(f'{i+1}:{l}' for i,l in enumerate(p.read_text().splitlines()) if a<=i+1<=z)
def walk(x,path='$'):
 if isinstance(x,dict):
  yield path,x
  for k,v in x.items():yield from walk(v,path+'.'+k)
 elif isinstance(x,list):
  for i,v in enumerate(x):yield from walk(v,path+f'[{i}]')
def stop(*_):raise TimeoutError('Reviewer group3 reached its 120000ms process bound')
signal.signal(signal.SIGALRM,stop);signal.setitimer(signal.ITIMER_REAL,120)
try:
 show('SELECTED_CORE',j(C/'selected-core.json'))
 for name in ['continue-hello-root-stdout.json','continue-hello-root-run_result-stdout.json','continue-hello-root-run_replay-stdout.json']:
  raw=j(N/name)
  show(name,raw)
 show('TERMINAL_OWNER',lines(S/'abg/terminal_result_contracts.ts',1,90))
 show('READ_OWNER',lines(S/'abg/project_read_ports.ts',445,512))
 for name in ['observe-retained.mjs','driver.mjs']:
  ls=(N/name).read_text().splitlines();selected=set()
  for i,l in enumerate(ls):
   if (name=='observe-retained.mjs' and (i<25 or any(t in l for t in ['decode','histor','snapshot','events','project','replay']))) or (name=='driver.mjs' and any(t in l for t in ['assert','terminalResult','expected','provenance','helloInput','Hello prospective'])):
    selected.update(range(max(0,i-1),min(len(ls),i+2)))
  show(name,[{'line':i+1,'text':ls[i][:1400]} for i in sorted(selected)])
 rawlog=[json.loads(x) for x in (N/'failure-native-prefix.jsonl').read_bytes().splitlines() if x.strip()]
 show('SNAPSHOT_SHAPES',[{'line':i+1,'keys':list(x),'kind':x.get('kind'),'nested':{k:list(v)[:25] for k,v in x.items() if isinstance(v,dict)},'arrays':{k:len(v) for k,v in x.items() if isinstance(v,list)}} for i,x in enumerate(rawlog)])
 show('REVIEWER_METHOD',j(O/'frozen-native-source-observations.json')['method'])
 print('READY_FOR_BOUNDED_CHECKS',flush=True)
 for message in sys.stdin:
  m=json.loads(message)
  if m.get('action')=='finish':break
  try:exec(m['code'],globals())
  except Exception as e:
   error={'kind':'Reviewer check harness exception','type':type(e).__name__,'message':str(e),'stack':traceback.format_exc()}
   save('group3-harness-error.json',error);show('CHECK_ERROR',error)
  print('CHECK_SEGMENT_COMPLETE',flush=True)
except Exception as e:
 save('group3-process-error.json',{'type':type(e).__name__,'message':str(e),'stack':traceback.format_exc()});show('GROUP3_ERROR',{'type':type(e).__name__,'message':str(e)})
finally:
 signal.setitimer(signal.ITIMER_REAL,0)
 save('review-group-3.json',{'group':3,'elapsedSeconds':time.monotonic()-started,'nativeCalls':0,'movingResourceReads':0,'mode':'single bounded pure read/check process with explicit staged stdin','capMs':120000,'graceMs':1000})
 show('GROUP3_CLOSED',{'elapsedSeconds':time.monotonic()-started})
