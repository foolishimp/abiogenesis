import importlib.util,json
from pathlib import Path
runner=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T292_CONSOLIDATION_01/composed-proof-01/final-runner/run-composed.py')
spec=importlib.util.spec_from_file_location('t292',runner);r=importlib.util.module_from_spec(spec);spec.loader.exec_module(r)
c=json.loads(Path('/private/tmp/abg-rc13-composed-proof-20261113/reentry-03/BROAD_CONFIG.json').read_text())
assert r.digest(runner)==c['runnerSha256'];clock=r.read_campaign(c)
work=Path('/private/tmp/abg-t292-b30');tenant=work/r.TENANT
out=Path('/private/tmp/abg-t292-b30-work/proof-01');tmp=out.parent/'tmp-01'
assert not out.exists() and not tmp.exists();out.mkdir();tmp.mkdir()
for n in ['npm-user.npmrc','npm-global.npmrc']:(tmp/n).write_text('')
f='test_env/tests/integration-shared-seams.test.mjs';source=[r.pin(tenant/f)]
prior=c['subject'];build=[{**p,'path':str(work/Path(p['path']).relative_to(prior['worktree']))} for p in prior['buildPins']]
commit=r.git(work,'rev-parse','HEAD');tree=r.git(work,'rev-parse','HEAD^{tree}')
assert not r.git(work,'status','--porcelain=v1','--untracked-files=no')
assert r.git(work,'diff','--name-only','38e4404bf','HEAD','--',r.TENANT)==r.TENANT+'/'+f
c['subject']={'worktree':str(work),'commit':commit,'tree':tree,'sourcePins':source,'buildPins':build,'artifact':prior['artifact'],'standing':'Exact author test commit; unchanged runtime build from C_final3, not fresh final packaging/qualification'}
c['activationRef']='T292-B30-CATALOG-QUESTION-01'
r.save(out/'SUBJECT.json',{'activation':c['activationRef'],**c['subject'],'runner':r.pin(runner),'driver':r.pin(__file__),'campaign':c['campaign']})
try:
 for p in source+build:r.checked(p)
 d,result=r.command(c,out,'01-integration-shared-seams.test',[c['node']['path'],'--max-old-space-size=8192','--test','--test-concurrency=1','--test-reporter=tap',f],600000,r.environment(c,tmp),clock['deadlineMonotonicNs']/1e9,tenant)
 tap=r.tap_result(d/'stdout.raw');r.save(d/'tap.json',tap)
 r.demand(tap['status']=='completed' and tap['counts']['tests']==2 and tap['counts']['skipped']==0,'focused proof incomplete')
 for p in source+build:r.checked(p)
 r.checked(c['campaign']);r.save(out/'FINAL.json',{'status':'BOUNDED_AUTHOR_PROOF_COMPLETE','tap':tap,'process':r.pin(d/'process.json'),'subject':r.pin(out/'SUBJECT.json')})
 print(json.dumps({'subject':commit,'tap':tap,'process':result}),flush=True)
except BaseException as e:
 r.save(out/'HALT.json',{'error':repr(e),'standing':'No retry; Root triage required'});raise
