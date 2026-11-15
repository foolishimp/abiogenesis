"""Thin stdin bridge to the exact retained finite process owner; no Product imports."""
import datetime as dt,json,os,pathlib,sys
sys.dont_write_bytecode=True
from run import owner,owned,save,canonical,sha,need
job=json.load(sys.stdin)
folder=pathlib.Path(job['folder']);folder.parent.mkdir(parents=True,exist_ok=True)
save(folder.parent/(folder.name+'.bridge.json'),{'pid':os.getpid(),'processGroup':os.getpgrp(),'argv':sys.argv,'scope':'Bridge belongs to enclosing amendment host group; command has its separately recorded owned group.'})
try:
    retained=canonical(job['retainedControlRoot'])
    manifest=json.loads((pathlib.Path(__file__).resolve().parent/'CONTROL_MANIFEST.json').read_text())
    rows=[row for row in manifest['controls'] if row['path']=='bounded.py']
    need(len(rows)==1 and sha(retained/'bounded.py')==rows[0]['sha256'],'Retained finite owner differs from authenticated control')
    owned(owner(retained),folder,job['argv'],job['cwd'],job['environment'],dt.datetime.fromisoformat(job['deadlineUtc']),job['capMs'],job['maxBytes'])
except Exception as error:
    print(json.dumps({'status':'failed','reason':str(error)}));sys.exit(1)
print(json.dumps({'status':'passed'}))
