#!/usr/bin/env python3
"""Independent external read-only oracle over the actual application files.
No Product/runtime state is authored. Java is launched by the existing bounded
command owner after this returns the exact audited query-only classpath.
"""
import hashlib,json,pathlib,sys,zipfile,re,xml.etree.ElementTree as ET
root=pathlib.Path(sys.argv[1]).resolve();phase=sys.argv[2]
assert phase in ('d1','d2')
report={'phase':phase,'passed':False,'files':{},'facts':{},'limits':{'maxFiles':4096,'maxBytes':134217728,'maxJarMembers':50000}}
def need(ok,why):
 if not ok:raise ValueError(why)
def read(relative):
 p=root/relative;need(p.resolve()==p and p.is_file() and not p.is_symlink(),'unsafe or absent member '+relative)
 b=p.read_bytes();need(len(b)<=16777216,'oversize member '+relative);report['files'][relative]={'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()};return b
def load(name):return json.loads(read('evidence/'+phase+'/run/'+name))
try:
 field='source_key' if phase=='d1' else 'record_id';oracle=json.loads(pathlib.Path(sys.argv[3]).read_text())['boundedApplicationCase']
 ledger=load('ledger.json');status=load('status.json');out=load('output.json');input_keys=load('input-keys.json')
 need(input_keys=={'sourceKeyField':field,'keys':['src-101','src-102','src-103']},'actual original input keys/field')
 need(out==oracle['expectedOutput'],'actual application output')
 need(ledger['sourceKeyField']==field and ledger['inputRecordCount']==3 and ledger['verificationStatus']=='balanced','ledger meaning')
 need(status=={'runId':ledger['runId'],'status':'COMPLETE'},'completed run identity')
 parts={r['partition']:r for r in ledger['partitions']};need(set(parts)=={'processed','filtered','error'},'partition identities')
 data={k:load(r['relativePath']) for k,r in parts.items()};report['facts']['partitions']=data
 need(data['processed']==[{'outputIdentity':'src-101','sourceKeys':['src-101']}],'processed identity')
 need(data['filtered']==[{'sourceKey':'src-102','conditionId':'include-true'}],'filter identity/reason')
 need(len(data['error'])==1 and data['error'][0]['sourceKey']=='src-103','error identity')
 err=data['error'][0];need(dict(err['originalRecord'])=={field:'src-103','amount':'not-an-integer','include':'true'},'exact original error record')
 need(err['failedConstraint']=='cast:integer' and err['offendingValue']=='not-an-integer' and err['reason'],'parse diagnostic')
 need(all(r['count']==1 for r in parts.values()) and ledger['verdict']['balanced'] is True,'partition counts and verdict')
 events=[json.loads(s) for s in read('evidence/'+phase+'/run/events.jsonl').decode().splitlines() if s]
 need(len(events)==1 and events[0]['eventType']=='COMPLETE' and events[0]['runId']==ledger['runId'] and events[0]['ledgerReference']=='ledger.json','lineage completion references durable ledger')
 log=[json.loads(s) for s in read('evidence/'+phase+'/run/run-log.jsonl').decode().splitlines() if s]
 need([r['entry'] for r in log]==['verification','ledger_published','status_set','event_emitted'],'persisted completion ordering');
 report['facts'].update({'ledger':ledger,'status':status,'events':events,'runLog':log})
 need(not (root/'evidence'/phase/'run/ledger.json.tmp').exists(),'torn ledger remains')
 xml=ET.fromstring(read('evidence/'+phase+'/falsifiers.xml'));cases=list(xml.iter('testcase'));report['facts']['falsifiers']=[{'name':r.get('name'),'failures':len(list(r.iter('failure')))+len(list(r.iter('error'))),'skipped':len(list(r.iter('skipped')))} for r in cases]
 for prefix in ['equal-count-wrong-identity','equal-count-cross-partition-duplicate','ledger-publication-interruption']:
  selected=[r for r in report['facts']['falsifiers'] if r['name'] and r['name'].startswith(prefix+':')];need(len(selected)==1 and selected[0]['failures']==0 and selected[0]['skipped']==0,'actual required falsifier absent/failed/skipped: '+prefix)
 classpaths=read('evidence/'+phase+'/query-classpath.txt').decode().splitlines();need(classpaths and len(classpaths)==len(set(classpaths)),'query classpath is explicit and unique')
 allowed=re.compile(r'^(com/cdme/core/[^/]+|com/cdme/accounting/LedgerReader[^/]*|com/cdme/adjoint/(?:AdjointMetadataStore|BackwardAnswer)[^/]*|com/cdme/engine/CdmeEngineRunner[^/]*)\.class$')
 inventory={};total=0;classes=[]
 for name in classpaths:
  q=pathlib.PurePosixPath(name);need(not q.is_absolute() and '..' not in q.parts and name.startswith('evidence/'+phase+'/query-runtime/'),'query member escapes isolated runtime')
  p=root/name;need(p.resolve()==p and not p.is_symlink(),'query symlink or alias')
  files=[p] if p.is_file() else sorted(p.rglob('*'))
  for f in files:
   need(not f.is_symlink(),'query nested symlink');
   if f.is_dir():continue
   b=f.read_bytes();total+=len(b);need(total<=134217728 and len(inventory)<4096,'query inventory bound');rel=f.relative_to(root).as_posix();inventory[rel]={'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
   if f.suffix=='.jar':
    need(hashlib.sha256(b).hexdigest()==sys.argv[4],'query jar is not the exact selected Scala library')
    with zipfile.ZipFile(f) as z:
     members=z.namelist();need(len(members)<=50000,'jar member bound');need(not any(n.startswith(('org/apache/spark/','com/cdme/')) for n in members),'foreign application/transform class in Scala runtime')
   else:
    n=f.relative_to(p).as_posix();need(allowed.fullmatch(n),'non-query class/resource: '+n);classes.append(n)
 need('com/cdme/engine/CdmeEngineRunner.class' in classes,'actual retained reader entry missing')
 report['query']={'classpath':[str(root/n) for n in classpaths],'members':inventory,'runRoot':str(root/'evidence'/phase/'run'),'main':'com.cdme.engine.CdmeEngineRunner','queries':['output:src-101','filtered:src-102','error:src-103'],'scope':'Exact retained transform/Spark classes absent; no universal sandbox or arbitrary-code absence claim'}
 report['passed']=True
except Exception as error:report['failure']=str(error)
print(json.dumps(report,sort_keys=True));sys.exit(0 if report['passed'] else 1)
