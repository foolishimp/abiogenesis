import hashlib,json,os,pathlib,signal,subprocess,time
here=pathlib.Path(__file__).resolve().parent
host=pathlib.Path('/Users/jim/.local/share/claude/versions/2.1.280')
host_hash=hashlib.sha256(host.read_bytes()).hexdigest()
assert host_hash=='387a5c5dcdbb815085edf0baf79591f9d8894efe922bceaf3d75b1b08055229d'
env={k:os.environ[k] for k in ['PATH','HOME','USER','LOGNAME','LANG','TMPDIR'] if k in os.environ}
env.update({'CLAUDE_CONFIG_DIR':str(here/'host-config'),'ANTHROPIC_BASE_URL':'http://127.0.0.1:1','DISABLE_TELEMETRY':'1','DISABLE_ERROR_REPORTING':'1','CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC':'1'})
rows=[]
for label in ['old','authored']:
 schema_file=here/(label+'-schema.json'); raw=json.dumps(json.loads(schema_file.read_text()),separators=(',',':'),ensure_ascii=False)
 args=['--print','--no-session-persistence','--json-schema',raw]
 started=time.monotonic(); process=subprocess.Popen([str(host),*args],cwd=here,env=env,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,start_new_session=True)
 timed_out=False
 try: stdout,stderr=process.communicate(input=b'',timeout=5)
 except subprocess.TimeoutExpired:
  timed_out=True; os.killpg(process.pid,signal.SIGKILL);stdout,stderr=process.communicate()
 row={'label':label,'schemaFile':str(schema_file),'schemaArgumentSha256':hashlib.sha256(raw.encode()).hexdigest(),'flags':args[:3],'stdinBytes':0,'promptArgument':False,'elapsedSeconds':time.monotonic()-started,'status':process.returncode,'timedOut':timed_out,'stdout':stdout.decode(errors='replace'),'stderr':stderr.decode(errors='replace')};rows.append(row)
 report={'host':str(host),'hostSha256':host_hash,'boundSeconds':5,'scope':'Local print-mode argument/input preflight only; empty stdin, no prompt, isolated config, no credentials, provider URL restricted to loopback port 1, no session persistence','rows':rows}
 (here/'host-preflight.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(row))
 assert not timed_out,'Stop: local compiler did not reach a safe closed boundary within five seconds'
 assert process.returncode!=0 and not stdout,'Stop: unexpected successful execution or stdout'
 if label=='old':assert 'no schema with key or ref "https://json-schema.org/draft/2020-12/schema"' in row['stderr'],'Stop: old schema did not reproduce its local meta-schema refusal'
 else:assert 'Input must be provided' in row['stderr'] and '--print' in row['stderr'],'Stop: authored schema did not stop at the expected missing-input boundary'
