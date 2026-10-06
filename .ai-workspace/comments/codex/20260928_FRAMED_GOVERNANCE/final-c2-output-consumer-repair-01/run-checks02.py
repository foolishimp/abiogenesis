from pathlib import Path
import json,subprocess,time,os,signal
N=Path(__file__).resolve().parent;node='/opt/homebrew/Cellar/node/24.7.0/bin/node';total=json.loads((N/'pure-processes.json').read_text())['aggregateElapsedMs'];results=[]
for label,args in [('syntax02',['--check',str(N/'output-checks.mjs')]),('relation02',[str(N/'check.mjs')])]:
 assert total<300000;cap=min(120000,300000-total-1000);start=time.monotonic();timedout=False;signals=[]
 with(N/(label+'.stdout')).open('x')as out,(N/(label+'.stderr')).open('x')as err:
  p=subprocess.Popen([node,*args],cwd=N,stdout=out,stderr=err,start_new_session=True)
  try:code=p.wait(timeout=cap/1000)
  except subprocess.TimeoutExpired:
   timedout=True;os.killpg(p.pid,signal.SIGTERM);signals.append('SIGTERM')
   try:code=p.wait(timeout=1)
   except subprocess.TimeoutExpired:os.killpg(p.pid,signal.SIGKILL);signals.append('SIGKILL');code=p.wait()
 elapsed=(time.monotonic()-start)*1000;total+=elapsed;row={'label':label,'command':[node,*args],'pid':p.pid,'exitCode':code,'elapsedMs':elapsed,'capMs':cap,'timedOut':timedout,'signals':signals,'exitObserved':True};results.append(row)
 with(N/(label+'-process.json')).open('x')as f:json.dump(row,f,indent=2);f.write('\n')
 if code!=0 or timedout:break
with(N/'pure-processes02.json').open('x')as f:json.dump({'aggregateBudgetMs':300000,'aggregateElapsedMs':total,'processes':results,'status':'passed'if len(results)==2 and all(x['exitCode']==0 and not x['timedOut']for x in results)else 'failed'},f,indent=2);f.write('\n')
print(json.dumps({'aggregateElapsedMs':total,'processes':results}));raise SystemExit(0 if len(results)==2 and all(x['exitCode']==0 and not x['timedOut']for x in results)else 1)
