from pathlib import Path
import sys,subprocess,time,datetime,json,hashlib,os
base=Path(__file__).resolve().parent
stage=base/'stage/build_tenants/abiogenesis/typescript'
label=sys.argv[1];command=sys.argv[2:]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert not (base/(label+'.json')).exists(), 'one receipt only; no retry'
env={k:v for k,v in os.environ.items() if k not in ['NODE_OPTIONS','NODE_COMPILE_CACHE']}
start=time.monotonic();started=datetime.datetime.now(datetime.timezone.utc).isoformat()
result=subprocess.run(command,cwd=stage,env=env,capture_output=True)
(base/(label+'.stdout')).write_bytes(result.stdout);(base/(label+'.stderr')).write_bytes(result.stderr)
receipt={'command':command,'cwd':str(stage),'startedAt':started,'elapsedSeconds':time.monotonic()-start,'exitCode':result.returncode,'sourceInventorySha256':sha(base/'stage-inputs.json'),'stdoutSha256':sha(base/(label+'.stdout')),'stderrSha256':sha(base/(label+'.stderr'))}
(base/(label+'.json')).write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt));sys.exit(result.returncode)
