import subprocess,time,json,os,signal,ast
from pathlib import Path
N=Path(__file__).resolve().parent;node='/opt/homebrew/Cellar/node/24.7.0/bin/node';started=time.monotonic();results=[]
def run(name,args):
 elapsed=(time.monotonic()-started)*1000;remaining=180000-elapsed;assert remaining>1000
 cap=min(60000,remaining-1000);t=time.monotonic()
 with (N/(name+'.stdout')).open('x') as out,(N/(name+'.stderr')).open('x') as err:
  child=subprocess.Popen(args,cwd=N,stdout=out,stderr=err,start_new_session=True,env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1'});timeout=False
  try:code=child.wait(cap/1000)
  except subprocess.TimeoutExpired:
   timeout=True;os.killpg(child.pid,signal.SIGTERM)
   try:code=child.wait(1)
   except subprocess.TimeoutExpired:os.killpg(child.pid,signal.SIGKILL);code=child.wait()
 result={'name':name,'args':args,'pid':child.pid,'code':code,'timedOut':timeout,'budgetMs':cap,'elapsedMs':(time.monotonic()-t)*1000};results.append(result)
 with (N/(name+'.process.json')).open('x') as f:json.dump(result,f,indent=2);f.write('\n')
 assert code==0 and not timeout,result
try:
 for name in ['driver.mjs','ordinary-caller.mjs','public-support.mjs','owner-checks.mjs','current-inputs.mjs','offline-check.mjs']:run('syntax-'+name,[node,'--check',str(N/name)])
 for name in ['launch-once.py','observe-process.py','prepare.py']:ast.parse((N/name).read_text(),filename=name)
 run('offline-check',[node,str(N/'offline-check.mjs')])
finally:
 with (N/'offline-processes.json').open('x') as f:json.dump({'results':results,'elapsedMs':(time.monotonic()-started)*1000,'aggregateBudgetMs':180000,'futureDriverExecutedOrImported':False,'pythonCheck':'ast.parse only; no execution of launcher/observer'},f,indent=2);f.write('\n')
print(json.dumps(results))
