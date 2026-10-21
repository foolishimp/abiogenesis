from pathlib import Path
import os,sys,json,subprocess,time,datetime,hashlib,re
base=Path(__file__).resolve().parent;tenant=base/'stage/build_tenants/abiogenesis/typescript'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
plan=json.loads((base/'selected-cases.json').read_text());inputs={row['path']:row for row in json.loads((base/'stage-inputs-02.json').read_text())}
node=json.loads((base/'toolchain.json').read_text())['nodeExecutable'];receipts=base/'cases';receipts.mkdir(exist_ok=True)
summary=[];group=sys.argv[1]
for ordinal,case in enumerate(plan):
 if case['group']!=group:continue
 path=case['file'];assert sha(tenant/path)==inputs['build_tenants/abiogenesis/typescript/'+path]['sha256']
 label=f'{ordinal+1:02d}';assert not (receipts/(label+'.json')).exists(),'no retry of an executed subject'
 command=[node,'--experimental-vm-modules','--test','--test-concurrency=1','--test-name-pattern','^'+re.escape(case['name'])+'$',path]
 env={k:v for k,v in os.environ.items() if k not in ['NODE_OPTIONS','NODE_COMPILE_CACHE']}
 start=time.monotonic();started=datetime.datetime.now(datetime.timezone.utc).isoformat()
 result=subprocess.run(command,cwd=tenant,capture_output=True,env=env)
 (receipts/(label+'.tap')).write_bytes(result.stdout);(receipts/(label+'.stderr')).write_bytes(result.stderr)
 row={**case,'command':command,'cwd':str(tenant),'startedAt':started,'elapsedSeconds':time.monotonic()-start,'exitCode':result.returncode,'sourceInventorySha256':sha(base/'stage-inputs-02.json'),'postGenerationInventorySha256':sha(base/'stage-post-generation-inventory.json'),'testSha256':sha(tenant/path),'stdoutSha256':sha(receipts/(label+'.tap')),'stderrSha256':sha(receipts/(label+'.stderr'))}
 (receipts/(label+'.json')).write_text(json.dumps(row,indent=2)+'\n');summary.append({'case':ordinal+1,'name':case['name'],'exitCode':result.returncode,'receiptSha256':sha(receipts/(label+'.json'))})
 (base/(group+'-summary.json')).write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary[-1]),flush=True)
 if result.returncode!=0:sys.exit(result.returncode)
