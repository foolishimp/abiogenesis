from pathlib import Path
import json,hashlib,time
O=Path(__file__).resolve().parent
def sha(b):return hashlib.sha256(b).hexdigest()
def read(p):return json.loads(p.read_bytes())
def save(n,v):(O/n).write_text(json.dumps(v,indent=2)+'\n')
assert not (O/'freeze.json').exists()
writer_start=time.monotonic()
proofs={n:read(O/n) for n in ['terminal-checks.json','causal-checks.json','physical-process-checks-02.json','setup-binding-checks-02.json']}
assert all(p['status']=='passed' for p in proofs.values());assert len(proofs['causal-checks.json']['edges'])==17
assert len(proofs['physical-process-checks-02.json']['operations'])==12
save('report-consistency.json',{'scope':'Own completed proof records only; no external acquisition or new subject check during finalization','status':'passed','proofStatus':{n:p['status'] for n,p in proofs.items()},'nativeCalls':0,'movingResourceReads':0})
ledger=[json.loads(s) for s in (O/'process-ledger.jsonl').read_text().splitlines() if s.strip()];total=sum(r['elapsedMs'] for r in ledger);assert total<600000 and all(r['elapsedMs']<120000 for r in ledger)
native_total=sum(r['elapsedMs'] for r in proofs['physical-process-checks-02.json']['operations'])
save('costs-summary.json',{'reviewCheckProcessCount':len(ledger),'reviewCheckElapsedMs':total,'aggregateCapMs':600000,'perProcessCapMs':120000,'ownedGraceMs':1000,'processes':ledger,'historicalOriginalTwelveNativeElapsedSumMs':native_total,'historicalNativeCostIsNotSupplementExecution':True,'supplementNativeCalls':0,'reportFinalization':'separate report-only write/hash; no native, source repair or moving-resource effects','unmeasured':'model reasoning wall time is not represented as process execution time'})
p=O/'return.md';text=p.read_text();assert 'CHECK_PROCESS_ELAPSED_MS' in text and 'CHECK_PROCESS_COUNT' in text;text=text.replace('CHECK_PROCESS_ELAPSED_MS',f'{total:.3f}').replace('CHECK_PROCESS_COUNT',str(len(ledger)));p.write_text(text)
external={}
def add(row):
 if not all(k in row for k in ['path','bytes','sha256']):return
 key=row['path'];assert Path(key).is_absolute()
 if key in external:assert external[key]['bytes']==row['bytes'] and external[key]['sha256']==row['sha256'],key
 else:external[key]={'path':key,'bytes':row['bytes'],'sha256':row['sha256']}
for proof in proofs.values():
 for group in ['inputs','sources']:
  for row in proof.get(group,[]):add(row)
for row in read(O/'process-authority-sources.json'):add(row)
for row in read(O/'function-walk-final-sources.json'):add(row)
add(read(O/'method-definition-observation.json')['definitionFile']);add(read(O/'selected-frame-observation.json'))
save('external-evidence-index.json',{'scope':'Only acquired immutable files, static source and authority records. Historical physical-resource observations are intentionally not file targets.','records':sorted(external.values(),key=lambda r:r['path'])})
save('writer-finalization.json',{'role':'separately granted report Writer','status':'CLOSED after freeze','territory':str(O),'effects':'own report files and hashes only','elapsedMsBeforeFreeze':(time.monotonic()-writer_start)*1000,'nativeCalls':0,'movingResourceReads':0})
records=[]
for p in sorted(O.rglob('*')):
 if p.is_file():
  b=p.read_bytes();records.append({'path':str(p.relative_to(O)),'bytes':len(b),'sha256':sha(b)})
ret=next(r for r in records if r['path']=='return.md')
freeze={'activation':'T287_S01_RETAINED_CAUSAL_SUPPLEMENT_02','actor':'/root/f11_attribution_inputs','status':'CLOSED','verdict':'ACCEPT_RETAINED_ORDINARY_S01_OUTCOME','recordCount':len(records),'records':records,'return':ret,'priorLimitedReviewPreserved':True,'selectedResidualsOpen':[],'candidateCounterexamples':0,'reviewCheckElapsedMs':total,'reviewCheckProcessCount':len(ledger),'externalEvidenceRecordCount':len(external),'nativeCalls':0,'movingResourceReads':0,'rootAdjudication':'Root conjoins and decides S01-OUTPUT-J-01; no Reviewer next activation'}
save('freeze.json',freeze)
for r in records:
 b=(O/r['path']).read_bytes();assert len(b)==r['bytes'] and sha(b)==r['sha256']
b=(O/'freeze.json').read_bytes();assert read(O/'freeze.json')==freeze
print(json.dumps({'status':'CLOSED ACCEPT','records':len(records),'externalEvidenceRecords':len(external),'return':ret,'freeze':{'path':str(O/'freeze.json'),'bytes':len(b),'sha256':sha(b)},'reviewCheckElapsedMs':total,'reviewCheckProcessCount':len(ledger),'reportWriterElapsedMsIncludingFreeze':(time.monotonic()-writer_start)*1000},indent=2))
