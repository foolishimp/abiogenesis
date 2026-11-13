import importlib.util,json,sys,time
from pathlib import Path
runner=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T292_CONSOLIDATION_01/composed-proof-01/final-runner/run-composed.py')
spec=importlib.util.spec_from_file_location('bounded_t292',runner);r=importlib.util.module_from_spec(spec);spec.loader.exec_module(r)
c=json.loads(Path('/private/tmp/abg-rc13-composed-proof-20261113/reentry-02/BROAD_CONFIG.json').read_text())
assert r.digest(runner)==c['runnerSha256'];clock=r.read_campaign(c)
work=Path('/private/tmp/abg-t292-b29');tenant=work/r.TENANT
out=Path('/private/tmp/abg-t292-b29-work/proof-01');tmp=Path('/private/tmp/abg-t292-b29-work/tmp-01')
assert not out.exists() and not tmp.exists();out.mkdir();tmp.mkdir()
for name in ['npm-user.npmrc','npm-global.npmrc']:(tmp/name).write_text('')
files=['test_env/support/d2-binding-harness.mjs','test_env/support/d2-evidence-owner-harness.mjs',
 'test_env/tests/d2-binding-transition.test.mjs','test_env/tests/d2-evidence-owner-lookup.test.mjs',
 'test_env/tests/t287-native-semantic-revision.test.mjs']
pins=[r.pin(tenant/f) for f in files]
build=[{**p,'path':str(work/Path(p['path']).relative_to(c['subject']['worktree']))} for p in c['subject']['buildPins']]
for p in build:r.checked(p)
subject={'activation':'T292-B29-VM-FIXTURE-01','baseCommit':r.git(work,'rev-parse','HEAD'),
 'sourcePins':pins,'unchangedBuildPins':build,'runner':r.pin(runner),'authorDriver':r.pin(__file__),
 'campaign':c['campaign'],'standing':'Test-only author proof; actual owner helpers on controlled filesystem premises; no provider or qualification'}
r.save(out/'SUBJECT.json',subject);results=[]
try:
 for i,f in enumerate(['test_env/tests/d2-evidence-owner-lookup.test.mjs','test_env/tests/d2-binding-transition.test.mjs','test_env/tests/t287-native-semantic-revision.test.mjs']):
  for p in pins+build:r.checked(p)
  r.read_campaign(c)
  directory,result=r.command(c,out,str(i+1).zfill(2)+'-'+Path(f).stem,
   [c['node']['path'],'--max-old-space-size=8192','--experimental-vm-modules','--test','--test-concurrency=1','--test-reporter=tap',f],
   600000,r.environment(c,tmp),clock['deadlineMonotonicNs']/1e9,tenant)
  tap=r.tap_result(directory/'stdout.raw');r.save(directory/'tap.json',tap)
  r.demand(tap['status']=='completed' and tap['counts']['skipped']==0,'focused test did not fully pass')
  results.append({'file':f,'process':r.pin(directory/'process.json'),'tap':tap});print(json.dumps(results[-1]),flush=True)
 for p in pins+build:r.checked(p)
 r.checked(c['campaign']);r.save(out/'FINAL.json',{'status':'BOUNDED_AUTHOR_PROOF_COMPLETE','results':results,'subject':r.pin(out/'SUBJECT.json')})
except BaseException as e:
 r.save(out/'HALT.json',{'error':repr(e),'completed':results,'standing':'No retry; return for Root triage'});raise
