from pathlib import Path
import os,sys,json,time,datetime,subprocess
phase=Path(__file__).parent
name=sys.argv[1];argv=sys.argv[2:]
cwd='/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript'
env=os.environ.copy();env.pop('NODE_OPTIONS',None)
selected={k:v for k,v in env.items() if k.startswith('ABG_GOVERNANCE_COVERED_')}
request={'argv':argv,'cwd':cwd,'started':datetime.datetime.now(datetime.timezone.utc).isoformat(),'environment':selected,'NODE_OPTIONS':'unset','scope':'Source179 bounded pure comparator, strict isolated compilation or affected owner units; no campaign runtime'}
with (phase/f'commands/{name}.request.json').open('x') as f:json.dump(request,f,indent=2);f.write('\n')
start=time.monotonic_ns()
with (phase/f'commands/{name}.stdout').open('xb') as out,(phase/f'commands/{name}.stderr').open('xb') as err:
    process=subprocess.run(argv,cwd=cwd,env=env,stdout=out,stderr=err)
result={'exitCode':process.returncode if process.returncode>=0 else None,'signal':-process.returncode if process.returncode<0 else None,'wallMs':(time.monotonic_ns()-start)/1e6,'timedOut':False,'truncated':False,'finished':datetime.datetime.now(datetime.timezone.utc).isoformat()}
with (phase/f'commands/{name}.result.json').open('x') as f:json.dump(result,f,indent=2);f.write('\n')
print(json.dumps(result));print((phase/f'commands/{name}.stdout').read_text());print((phase/f'commands/{name}.stderr').read_text())
sys.exit(process.returncode if process.returncode>=0 else 128-process.returncode)
