from pathlib import Path
import datetime,hashlib,json,os,shutil,subprocess,sys,time
p=Path(__file__).resolve().parent
name,*argv=sys.argv[1:]
cwd=p/'stage/build_tenants/abiogenesis/typescript'
commands=p/'commands'; commands.mkdir(exist_ok=True)
receipt=commands/(name+'.json'); assert not receipt.exists(), 'immutable command receipt already exists'
request={'argv':argv,'cwd':str(cwd),'resolved_executable':shutil.which(argv[0]),'started_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'environment_overrides':{}}
start=time.monotonic()
with (commands/(name+'.stdout')).open('wb') as out,(commands/(name+'.stderr')).open('wb') as err:
 result=subprocess.run(argv,cwd=cwd,stdout=out,stderr=err)
request.update(returncode=result.returncode,wall_seconds=time.monotonic()-start,completed_utc=datetime.datetime.now(datetime.timezone.utc).isoformat())
for stream in ['stdout','stderr']:
 data=(commands/(name+'.'+stream)).read_bytes(); request[stream]={'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
receipt.write_text(json.dumps(request,indent=2)+'\n')
print(json.dumps(request,indent=2))
if result.returncode:
 print((commands/(name+'.stdout')).read_text()[-12000:]);print((commands/(name+'.stderr')).read_text()[-8000:])
 sys.exit(result.returncode)
