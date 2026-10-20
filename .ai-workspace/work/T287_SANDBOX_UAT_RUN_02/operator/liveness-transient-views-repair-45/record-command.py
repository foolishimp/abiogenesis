import subprocess,json,time,datetime,sys,os
from pathlib import Path
p=Path(__file__).parent
label=sys.argv[1]; argv=sys.argv[2:]
cwd='/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript'
started=datetime.datetime.now(datetime.timezone.utc).isoformat(); begin=time.monotonic()
request={'argv':argv,'cwd':cwd,'started':started,'diagnosticWallBoundMs':180000}
(p/(label+'.request.json')).write_text(json.dumps(request,indent=2)+'\n')
with (p/(label+'.stdout')).open('wb') as out,(p/(label+'.stderr')).open('wb') as err:
 proc=subprocess.Popen(argv,cwd=cwd,stdout=out,stderr=err)
 timed=False
 try:code=proc.wait(timeout=180)
 except subprocess.TimeoutExpired:
  timed=True;proc.terminate()
  try:code=proc.wait(timeout=5)
  except subprocess.TimeoutExpired:proc.kill();code=proc.wait()
result={'exitCode':code,'timedOut':timed,'wallMs':(time.monotonic()-begin)*1000,'started':started,'completed':datetime.datetime.now(datetime.timezone.utc).isoformat(),'stdoutBytes':(p/(label+'.stdout')).stat().st_size,'stderrBytes':(p/(label+'.stderr')).stat().st_size,'truncated':False}
(p/(label+'.result.json')).write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result));sys.exit(0)
