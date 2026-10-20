from pathlib import Path
import json,os,subprocess,sys,time,datetime
phase=Path(__file__).resolve().parent
label=sys.argv[1]; argv=sys.argv[2:]; base=phase/'commands'/label
if base.with_suffix('.result.json').exists(): raise RuntimeError('Receipt exists; no overwrite')
env=dict(os.environ); env.pop('NODE_OPTIONS',None)
request={'argv':argv,'cwd':'/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript','started':datetime.datetime.now(datetime.timezone.utc).isoformat(),'environment':{'NODE_OPTIONS':'unset'}}
Path(str(base)+'.request.json').write_text(json.dumps(request,indent=2)+'\n')
start=time.monotonic_ns()
with open(str(base)+'.stdout','wb') as out,open(str(base)+'.stderr','wb') as err:
 result=subprocess.run(argv,cwd=request['cwd'],env=env,stdout=out,stderr=err)
value={'exitCode':result.returncode if result.returncode>=0 else None,'signal':-result.returncode if result.returncode<0 else None,'wallMs':(time.monotonic_ns()-start)/1000000,'timedOut':False,'truncated':False}
Path(str(base)+'.result.json').write_text(json.dumps(value,indent=2)+'\n')
print(json.dumps(value)); print(Path(str(base)+'.stdout').read_text()); print(Path(str(base)+'.stderr').read_text());sys.exit(result.returncode if result.returncode>=0 else 1)
