"""Root's one-use bounded frozen-source review. No Product writes or automatic retry."""
from pathlib import Path
from datetime import datetime, timezone
import json, hashlib, os, subprocess, time, stat
R=Path(__file__).resolve().parent
Q=R.parent
D=Q.parent
F=Q/'review-subject-001'
SUPPLEMENT=Q/'compatibility-triage-01/frozen-authority'
METHOD=Path('/Users/jim/Library/Application Support/STDO/releases/v3.0.4')
now=lambda:datetime.now(timezone.utc).isoformat()
def obj(p):return json.loads(p.read_text())
def pin(p):
 b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
def put(p,v):
 assert not p.exists(),p
 p.write_text(v if isinstance(v,str) else json.dumps(v,indent=2)+'\n')
assert not (R/'HOST_LAUNCH.json').exists()
subject=obj(F/'SUBJECT.json')
assert subject['status']=='OBSERVED_NATIVE_SOURCE_FROZEN_C2_PENDING'
for f in subject['files']:
 p=Path(f['snapshot']);assert p.is_relative_to(F)
 assert pin(p)['sha256']==f['sha256'] and p.stat().st_size==f['bytes'],p
for n in ['return.json','readiness.json','progress.json']:assert (F/n).is_file()
assert not Path('/Library/Application Support/GeminiCli/policies').exists(),'Fixed system policy now present; rebind before review'
credential=Path('/Users/jim/.gemini/oauth_creds.json');assert stat.S_ISREG(credential.lstat().st_mode),'Expected existing regular OAuth credential file; do not inspect contents'
settings=obj(R/'review-settings.json');assert settings['model']['name']=='gemini-3.1-pro-preview';assert settings['general']['plan']['enabled'] is False
package=Path('/opt/homebrew/lib/node_modules/@google/gemini-cli/package.json');assert obj(package)['version']=='0.42.0'
activation={'kind':'root_frozen_q23_independent_source_review_activation','at':now(),'status':'ADMITTED_ONE_READ_ONLY_REVIEW','role':'Executive -> read-only non-contributing reviewer; Root operator captures final response','ownerInstruction':'go; independent frozen-snapshot review under exact STDO3.0.4','authority':pin(D/'ROOT_ACTIVATION.json'),'exactSubject':pin(F/'SUBJECT.json'),'sourceDiff':pin(F/'source.diff'),'sourceCommit':subject['sourceCommit'],'nativeResultRef':subject['nativeResultRef'],'sourceRoot':str(F),'productFrame':obj(Q/'ROOT_SELECTION.json')['productFrame'],'sourcePolicy':pin(Q/'ROOT_POLICY_HOW_SELECTION.json'),'provider':{'cliPackage':pin(package),'cliVersion':'0.42.0','requestedModel':'gemini-3.1-pro-preview','requestedThinking':'HIGH','reasoningStanding':'Highest installed supported level; no literal max enum','maximumSessionTurns':32,'actualModel':'UNOBSERVED'},'independence':'Gemini has not contributed to these candidate bytes or selected HOW. No author conversation/session supplied. Actual model/tool posture must match; this is source assurance, not Product F11 admission or a new Product profile.','permittedTools':['read_file','list_directory','glob','grep_search'],'readScope':[str(F),str(METHOD),str(SUPPLEMENT)],'writeEffects':[str(R/'gemini-home'),str(R/'tmp'),'Root final response and metadata under this control directory'],'forbidden':['Product/subject changes','tests or shell tool','delegation','private provider logs/auth/session reads','unbound model fallback acceptance','release claims'],'stops':['Unknown/different effective model or auth failure','Unexpected tool access or source mutation','Missing material necessary for a verdict'],'closure':'Exact source-grounded Q1-Q7 result, concrete findings, independence and evidence limits; Root conjoins with actual native proof separately.'}
put(R/'ROOT_REVIEW_ACTIVATION.json',activation)
manifest={'subject':pin(F/'SUBJECT.json'),'diff':pin(F/'source.diff'),'files':[{'path':f['path'],'sha256':f['sha256'],'bytes':f['bytes'],'changed':f['changed']} for f in subject['files'] if f['changed'] or f['path'].startswith('qualification-inputs/q23-author-05/')],'handoffs':[pin(F/n) for n in ['return.json','readiness.json','progress.json']]}
request=(R/'REVIEW_REQUEST_TEMPLATE.md').read_text()+'\n\nRoot exact frozen subject:\n'+json.dumps(manifest,indent=2)+'\n\nRead this exact candidate directory: '+str(F)+'\nRoot activation:\n'+json.dumps(activation,indent=2)+'\n'
request+='\n\nExact supplemental authority for the reported profile finding: '+str(SUPPLEMENT)+'\n'+json.dumps(obj(SUPPLEMENT/'MANIFEST.json'),indent=2)+'\nRoot scope disposition (review against the exact sources; not presumed correct):\n'+json.dumps(obj(SUPPLEMENT/'ROOT_PROFILE_DISPOSITION.json'),indent=2)+'\n'
put(R/'REVIEW_REQUEST.md',request)
for p in [R/'gemini-home',R/'tmp']:p.mkdir(mode=0o700)
env={k:os.environ[k] for k in ['HOME','PATH','LANG','LC_ALL','TERM'] if k in os.environ}
env.update(GEMINI_CLI_HOME=str(R/'gemini-home'),GOOGLE_APPLICATION_CREDENTIALS=str(credential),GEMINI_CLI_SYSTEM_SETTINGS_PATH=str(R/'review-settings.json'),GEMINI_CLI_SYSTEM_DEFAULTS_PATH=str(R/'empty-system-defaults.json'),GEMINI_CLI_TRUSTED_FOLDERS_PATH=str(R/'trusted-folders.json'),GEMINI_CLI_NO_RELAUNCH='1',NO_BROWSER='1',TMPDIR=str(R/'tmp'),NODE_OPTIONS='--max-old-space-size=8192')
argv=['/opt/homebrew/bin/gemini','--model','gemini-3.1-pro-preview','--approval-mode','default','--admin-policy',str(R/'read-only.toml'),'--extensions','none','--allowed-mcp-server-names','__root_frozen_review_no_mcp__','--include-directories',str(METHOD),'--include-directories',str(SUPPLEMENT),'--output-format','json','--prompt','Review only the exact frozen subject and governing request supplied on stdin. Use only the four declared read tools, do not modify or delegate, and return the final source-grounded review with unknowns and limits.']
put(R/'DISPATCH_BINDING.json',{'activation':pin(R/'ROOT_REVIEW_ACTIVATION.json'),'request':pin(R/'REVIEW_REQUEST.md'),'config':[pin(R/n) for n in ['review-settings.json','read-only.toml','empty-system-defaults.json','trusted-folders.json']],'argv':argv,'cwd':str(F),'environmentKeys':sorted(env),'credentialContentsReadByOperator':False,'automaticRetry':False})
start=time.monotonic();started=now();timedout=False
with (R/'REVIEW_REQUEST.md').open('rb') as inp,(R/'REVIEW.stdout.json').open('xb') as out,(R/'REVIEW.stderr').open('xb') as err:
 p=subprocess.Popen(argv,cwd=F,env=env,stdin=inp,stdout=out,stderr=err,start_new_session=True)
 put(R/'HOST_LAUNCH.json',{'at':started,'pid':p.pid,'source':pin(F/'SUBJECT.json'),'request':pin(R/'REVIEW_REQUEST.md'),'automaticRetry':False})
 print(json.dumps({'status':'FROZEN_REVIEW_STARTED','pid':p.pid,'requestedModel':'gemini-3.1-pro-preview','requestedThinking':'HIGH'}),flush=True)
 try:rc=p.wait(timeout=1800)
 except subprocess.TimeoutExpired:
  timedout=True;p.terminate()
  try:rc=p.wait(timeout=10)
  except subprocess.TimeoutExpired:p.kill();rc=p.wait()
unchanged=all(pin(Path(f['snapshot']))['sha256']==f['sha256'] for f in subject['files'])
result={'startedUtc':started,'endedUtc':now(),'wallMs':(time.monotonic()-start)*1000,'exitCode':rc,'timeout':timedout,'frozenSourceUnchanged':unchanged,'stdout':pin(R/'REVIEW.stdout.json'),'stderr':pin(R/'REVIEW.stderr'),'standing':'Actual final response/model/tool metadata and exact review must be inspected before acceptance.'}
put(R/'HOST_RESULT.json',result);print(json.dumps(result),flush=True)
