from pathlib import Path
import os,json,subprocess,time,shutil,datetime
D=Path(__file__).resolve().parent
R=Path('/Users/jim/src/apps/abiogenesis');T=R/'build_tenants/abiogenesis/typescript'
node=shutil.which('node');env=os.environ.copy();env.update({'npm_config_cache':str(D/'npm-cache'),'npm_config_logs_max':'0','npm_config_update_notifier':'false','npm_config_offline':'true'})
commands=[('stage-authorities',[node,'scripts/generate-qualification-rule-catalog.mjs','--stage-authorities',str(R),'/Users/jim/Library/Application Support/STDO/releases/v2.5.1-rc.1']),('generate-manifest',[node,'scripts/generate-product-manifest.mjs'])]
receipts=[]
for name,argv in commands:
 started=time.monotonic();at=datetime.datetime.now(datetime.timezone.utc).isoformat()
 with (D/(name+'.stdout')).open('xb') as out,(D/(name+'.stderr')).open('xb') as err:
  result=subprocess.run(argv,cwd=T,env=env,stdout=out,stderr=err)
 receipt={'name':name,'argv':argv,'cwd':str(T),'startedAt':at,'elapsedSeconds':time.monotonic()-started,'exitCode':result.returncode,'stdout':name+'.stdout','stderr':name+'.stderr','actorCalls':0,'archiveCreated':False,'installPerformed':False}
 receipts.append(receipt)
 (D/'generation-receipts.json').write_text(json.dumps(receipts,indent=2)+'\n')
 print(json.dumps(receipt),flush=True)
 if result.returncode:raise SystemExit(result.returncode)
