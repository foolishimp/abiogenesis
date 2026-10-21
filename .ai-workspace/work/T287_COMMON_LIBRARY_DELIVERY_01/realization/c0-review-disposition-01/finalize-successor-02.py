from pathlib import Path
import datetime,hashlib,json,stat,traceback
ROOT=Path('/Users/jim/src/apps/abiogenesis')
WORK=Path(__file__).resolve().parent
def read(p): return json.loads(p.read_text())
def record(p):
 return {'path':str(p.relative_to(ROOT)),'mode':oct(stat.S_IMODE(p.stat().st_mode)),'kind':'file','bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
def write(name,obj):
 with (WORK/name).open('x') as f: json.dump(obj,f,indent=2); f.write('\n')
try:
 request=read(WORK/'successor-request-02.json')
 for expected in request['originalRecords']+request['successorRecords']:
  assert record(ROOT/expected['path']) == expected, expected['path']
 receipt=read(WORK/'successor-execution-receipt-02.json')
 assert receipt['command'] == request['command']
 assert receipt['toolResult']['exit_code'] == 0
 validation=read(WORK/'validation.json')
 assert validation['status']=='satisfied' and validation['successor']=='C0-DISPOSITION-ARRAY-02'
 output=json.loads(receipt['toolResult']['output'])
 assert output['status']=='successor_validation_satisfied'
 assert output['validation']==record(WORK/'validation.json')
 assert not (WORK/'first-cause-successor-02.json').exists()
 files=[record(p) for p in sorted(WORK.iterdir()) if p.is_file()]
 freeze={'kind':'C0-REVIEW-DISPOSITION-01_closed_public_record','successor':'C0-DISPOSITION-ARRAY-02',
  'writer':'/root/stdo3_k11_successor_writer','returnTo':'/root',
  'status':'closed_public_record_pending_required_proof_with_separately_selected_realization',
  'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'recordCount':len(files),'files':files,
  'assessment':record(WORK/'public-assessment.md'),'historicalTriage':record(WORK/'root-triage.json'),
  'successorTriage':record(WORK/'root-triage-array-02.json'),'temporalNote':record(WORK/'temporal-note-02.md'),
  'capsule':record(WORK/'F6-capsule.json'),'validation':record(WORK/'validation.json'),
  'request':record(WORK/'successor-request-02.json'),'actualValidationReceipt':record(WORK/'successor-execution-receipt-02.json'),
  'firstFailure':record(WORK/'first-cause.json'),'return':record(WORK/'return-successor-02.md'),
  'method':read(WORK/'source-pins.json')['method'],'composition':[],
  'exclusion':'freeze.json itself; all listed records immutable after return',
  'historicalProductionRepairGranted':False,'subsequentRealizationActivation':'C0-POTENTIAL-EFFECT-REALIZATION-01, Root-attributed temporal note',
  'productionEffectsGrantedToThisRecordWriter':False,'allC0Closure':False,
  'independentWholeCandidateAssurance':False,'L5Acceptance':False,'releaseClaim':False}
 write('freeze.json',freeze)
 print(json.dumps({'status':'frozen','freeze':record(WORK/'freeze.json'),
  'return':record(WORK/'return-successor-02.md'),'records':len(files),
  'assessment':record(WORK/'public-assessment.md'),'capsule':record(WORK/'F6-capsule.json'),
  'validation':record(WORK/'validation.json'),'receipt':record(WORK/'successor-execution-receipt-02.json')}))
except BaseException as failure:
 if not (WORK/'first-cause-finalization-02.json').exists():
  write('first-cause-finalization-02.json',{'activation':'C0-DISPOSITION-ARRAY-02','errorType':type(failure).__name__,
   'message':str(failure),'traceback':traceback.format_exc(),'disposition':'Stopped; no repair or retry'})
 raise
