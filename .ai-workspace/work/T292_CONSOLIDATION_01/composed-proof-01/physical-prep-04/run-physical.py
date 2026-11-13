"""One selected four-path witness run under the existing T292 shared clock."""
import importlib.util,json,sys
from pathlib import Path
ROOT=Path('/Users/jim/src/apps/abiogenesis')
RUNNER=ROOT/'.ai-workspace/work/T292_CONSOLIDATION_01/composed-proof-01/final-runner/run-composed.py'
CONFIG=Path('/private/tmp/abg-rc13-composed-proof-20261113/reentry-04/HISTORY_CONFIG.json')
CONFIG_SHA='0fa21e6a4a2c27183c0d1a201810a8515728247de0ec4002ae142f58ebe7d3ef'
spec=importlib.util.spec_from_file_location('t292_recorder',RUNNER);r=importlib.util.module_from_spec(spec);spec.loader.exec_module(r)
r.demand(r.digest(CONFIG)==CONFIG_SHA,'physical witness configuration changed');c=json.loads(CONFIG.read_text())
r.demand(r.digest(RUNNER)==c['runnerSha256'],'runner changed');clock=r.read_campaign(c);r.source_check(c)
history=Path(c['outputRoot']);r.demand((history/'FINAL.json').is_file(),'selected history phase must complete first')
r.demand(json.loads((history/'FINAL.json').read_text())['status']=='MECHANICAL_POPULATION_COMPLETED','history incomplete')
tenant=Path(c['subject']['worktree'])/r.TENANT
baseline=json.loads(r.checked(c['history']['baseline']).read_text());base=baseline['baseTenant']
for p in baseline['pins']+c['subject']['buildPins']:r.checked(p)
r.checked(c['node']);r.checked(c['subject']['artifact']);r.checked(c['subject']['artifactSourceReceipt'])
r.inventory_check(tenant/'node_modules',json.loads(r.checked(c['dependencyInventory']).read_text())['rows'])
route=json.loads(Path('/private/tmp/abg-t292-composed-proof-prep/route-pins.json').read_text())
pair=next(p for p in route if p['path'].endswith('/codex-resume/kept-reads-pair.mjs'))
selection=next(p for p in route if p['path'].endswith('/codex-resume/bounded-logs.txt'))
r.checked(pair);logs=r.checked(selection).read_text().splitlines();r.demand(len(logs)==4,'physical population differs')
manifest=json.loads(r.checked(c['history']['population']).read_text());inputs=[]
for log in logs:
 found=[x for x in manifest['subjects'] if x['path']==log];r.demand(len(found)==1,'selected physical input is not unique');r.checked(found[0]);inputs+=found
r.demand(not inputs[0]['actualRetiredEventRealizations'] and not inputs[1]['actualRetiredEventRealizations'],'kept inputs changed classification')
r.demand(all(x['actualRetiredEventRealizations'] for x in inputs[2:]),'retirement needs actual event realization')
values={'path':'/private/tmp/abg-td26p5-work/codex-resume/read-pair-values.mjs','bytes':3521,
 'sha256':'0264bf167a1742203afcb596f449e166219479155aa4d12364e7ec39be6800ee'}
r.checked(values);r.demand(Path(values['path']).read_text().replace(', value: plain(r)','')==Path(pair['path']).read_text(),'value probe has other changes')
out=Path('/private/tmp/abg-rc13-composed-proof-20261113/physical-04');tmp=Path('/private/tmp/abg-rc13-composed-proof-20261113/physical-tmp-04')
r.demand(not out.exists() and not tmp.exists(),'physical evidence paths must be new');out.mkdir();tmp.mkdir()
for name in ['npm-user.npmrc','npm-global.npmrc']:(tmp/name).write_text('')
checker=Path(__file__).with_name('check-blocked-values.mjs');pins=[r.pin(__file__),r.pin(checker),pair,selection,values]+inputs
r.save(out/'BINDING.json',{'activation':'T292-PHYSICAL-READ-04','configuration':r.pin(CONFIG),'source':c['subject'],
 'baseline':c['history']['baseline'],'historyResult':r.pin(history/'FINAL.json'),'campaign':c['campaign'],'pins':pins,
 'perCommandMs':600000,'standing':'Four physical same-path/device/inode base/final read witnesses; two kept and two realized-retired stores. No byte deduplication, provider or qualification.'})
def run(label,argv):
 r.read_campaign(c);r.source_check(c)
 for pin in pins:r.checked(pin)
 return r.command(c,out,label,argv,600000,r.environment(c,tmp),clock['deadlineMonotonicNs']/1e9,tenant)
try:
 p,_=run('01-four-physical-pairs',[c['node']['path'],'--max-old-space-size=8192',pair['path'],base,str(tenant),*logs])
 rows=[json.loads(x) for x in (p/'stdout.raw').read_text().splitlines() if x.strip()]
 r.demand([x['log'] for x in rows]==logs,'physical outputs differ from selected path population')
 ports=['run_status','run_result','run_replay','run_evidence']
 for i,row in enumerate(rows):
  a,b=row['base'],row['final'];r.demand(a['reopen']==b['reopen']=='reopened','physical store did not reopen')
  ids=[x['runId'] for x in a['runs']];r.demand(ids and ids==[x['runId'] for x in b['runs']],'physical Run population changed')
  if i==0:r.demand(row['identical'] and all(x[p].get('kind')=='abg_project_read_projection' for x in b['runs'] for p in ports),'kept current read was not equal positive')
  elif i==1:
   r.demand(not row['identical'] and len(ids)==1,'blocked-RC7 declared delta not discriminated')
   for x,y in zip(a['runs'],b['runs']):
    for port in ports[1:]:r.demand(x[port]==y[port],'unexpected blocked-RC7 non-status difference')
  else:
   r.demand(all(x[p].get('kind')=='abg_project_read_refusal' and x[p].get('code')=='invalid_history' for x in b['runs'] for p in ports),'realized retired history did not explicitly refuse')
 v,_=run('02-blocked-owner-values',[c['node']['path'],'--max-old-space-size=8192',values['path'],base,str(tenant),logs[1]])
 check,_=run('03-blocked-field-comparison',[c['node']['path'],'--max-old-space-size=8192',str(checker),str(v/'stdout.raw'),logs[1],str(tenant),str(out/'BLOCKED_DELTA.json')])
 for pin in pins+baseline['pins']+c['subject']['buildPins']:r.checked(pin)
 r.source_check(c);r.read_campaign(c)
 r.save(out/'FINAL.json',{'status':'FOUR_PHYSICAL_WITNESSES_COMPLETED','pairs':rows,'blockedFieldComparison':r.pin(out/'BLOCKED_DELTA.json'),
  'campaign':c['campaign'],'standing':'Bounded physical owner reads only: one equal positive store, one exact stop-field delta, two explicit realized-retirement refusals; no qualification'})
 print(json.dumps({'status':'FOUR_PHYSICAL_WITNESSES_COMPLETED','output':str(out)}),flush=True)
except BaseException as e:
 r.save(out/'HALT.json',{'error':repr(e),'standing':'No retry or repair; Root triage required'});raise
