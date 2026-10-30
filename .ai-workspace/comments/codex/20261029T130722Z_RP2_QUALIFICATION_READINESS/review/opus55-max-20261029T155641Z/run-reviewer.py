from pathlib import Path
import subprocess,json,datetime,time,os,signal,hashlib
p=Path(__file__).parent
root=Path('/Users/jim/src/apps/abiogenesis')
m=json.loads((p/'metadata.json').read_text())
cmd=['claude','--print','--model','claude-opus-5-5','--effort','max','--max-budget-usd','5','--output-format','stream-json','--verbose','--permission-mode','plan','--permission-prompts','none','--tools','Read,Glob,Grep','--allowedTools','Read,Glob,Grep','--restricted','--safe-mode','--strict-mcp-config','--mcp-config','{"mcpServers":{}}','--disable-slash-commands','--no-session-persistence','--no-chrome','--add-dir','/Users/jim/Library/Application Support/STDO/releases/v3.0.2']
assert '--allowedTools' in (p/'cli-help.txt').read_text()
m.update(state='running',command=cmd,started_at=datetime.datetime.now(datetime.timezone.utc).isoformat())
(p/'metadata.json').write_text(json.dumps(m,indent=2))
start=time.monotonic(); timed_out=False
with (p/'reviewer-prompt.txt').open('rb') as inp,(p/'raw.jsonl').open('wb') as out,(p/'stderr.log').open('wb') as err:
 proc=subprocess.Popen(cmd,cwd=root,stdin=inp,stdout=out,stderr=err,start_new_session=True)
 m['pid']=proc.pid;(p/'metadata.json').write_text(json.dumps(m,indent=2));print(json.dumps({'launched_pid':proc.pid,'packet':str(p)}),flush=True)
 try: rc=proc.wait(timeout=1500)
 except subprocess.TimeoutExpired:
  timed_out=True;os.killpg(proc.pid,signal.SIGTERM)
  try: rc=proc.wait(timeout=10)
  except subprocess.TimeoutExpired: os.killpg(proc.pid,signal.SIGKILL);rc=proc.wait()
m.update(state='timed_out' if timed_out else 'completed',ended_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),elapsed_seconds=round(time.monotonic()-start,3),exit_status=rc,timed_out=timed_out)
records=[]
for line in (p/'raw.jsonl').read_text().splitlines():
 try: records.append(json.loads(line))
 except json.JSONDecodeError: pass
models=set(); results=[]; last_text=[]
for rec in records:
 if rec.get('type')=='system' and rec.get('subtype')=='init':
  m['model_reported']=rec.get('model');m['tools_reported']=rec.get('tools');m['permission_mode_reported']=rec.get('permissionMode')
 if rec.get('type')=='assistant':
  msg=rec.get('message',{}); models.add(msg.get('model','unknown'))
  texts=[c['text'] for c in msg.get('content',[]) if c.get('type')=='text']
  if texts:last_text=texts
 if rec.get('type')=='result': results.append(rec)
m['response_models']=sorted(models)
if results:
 result=results[-1];(p/'result.json').write_text(json.dumps(result,indent=2));m['result_subtype']=result.get('subtype');m['is_error']=result.get('is_error');m['cost_usd_reported']=result.get('total_cost_usd');m['usage_reported']=result.get('usage');m['model_usage_reported']=result.get('modelUsage');m['permission_denials']=result.get('permission_denials',[])
 text=result.get('result') or '\n\n'.join(last_text)
else:text='\n\n'.join(last_text)
if text:(p/'reviewer.md').write_text(text+'\n')
before=json.loads((p/'before-status.json').read_text());diff=[]
for rel,digest in before['product_implementation_sha256'].items():
 f=root/rel; actual=hashlib.sha256(f.read_bytes()).hexdigest() if f.is_file() else None
 if actual!=digest:diff.append({'path':rel,'before':digest,'after':actual})
def git(*args):return subprocess.check_output(['git',*args],cwd=root).decode()
after={'time':datetime.datetime.now(datetime.timezone.utc).isoformat(),'head':git('rev-parse','HEAD').strip(),'tracked_diff':git('diff','--name-status','HEAD'),'untracked':git('ls-files','--others','--exclude-standard').splitlines(),'product_implementation_changes':diff,'checked_file_count':len(before['product_implementation_sha256'])}
(p/'after-status.json').write_text(json.dumps(after,indent=2));m['frozen_product_implementation_unchanged']=not diff and after['head']==before['head'] and after['tracked_diff']==''
(p/'metadata.json').write_text(json.dumps(m,indent=2));print(json.dumps({k:m.get(k) for k in ['state','exit_status','elapsed_seconds','model_reported','response_models','cost_usd_reported','result_subtype','frozen_product_implementation_unchanged']}),flush=True)
