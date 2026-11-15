"""Thin stdin bridge to the exact retained finite process owner; no Product imports."""
import datetime as dt,json,os,pathlib,sys
sys.dont_write_bytecode=True
from run import owner,owned,save
job=json.load(sys.stdin)
folder=pathlib.Path(job['folder']);folder.parent.mkdir(parents=True,exist_ok=True)
save(folder.parent/(folder.name+'.bridge.json'),{'pid':os.getpid(),'processGroup':os.getpgrp(),'argv':sys.argv,'scope':'Bridge belongs to enclosing basic host group; command has its separately recorded owned group.'})
try:
    owned(owner(),folder,job['argv'],job['cwd'],job['environment'],dt.datetime.fromisoformat(job['deadlineUtc']),job['capMs'],job['maxBytes'])
except Exception as error:
    print(json.dumps({'status':'failed','reason':str(error)}));sys.exit(1)
print(json.dumps({'status':'passed'}))
