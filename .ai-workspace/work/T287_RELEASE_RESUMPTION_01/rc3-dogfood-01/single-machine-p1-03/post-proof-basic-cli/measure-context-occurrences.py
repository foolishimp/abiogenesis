"""Operator-only adaptation of B11 context measurement to finite structured Context occurrences.
No runtime import/admission; never parses strings as nested JSON. Counts are physical evidence observations.
"""
import pathlib,json,hashlib,collections,base64,urllib.parse
P=pathlib.Path(__file__).resolve().parent
s=json.loads((P/'MEASUREMENT_SELECTION.json').read_text())
POSITIONS={'framed_synthesis_task':[['context']],'native_workspace_work_task':[['context']],'native_workspace_work_observation':[['task','context'],['after']],'native_workspace_work_failure':[['task','context'],['after']]}
def scan(label,prefix):
 path=pathlib.Path(urllib.parse.unquote(urllib.parse.urlparse(prefix['eventLogRef']).path));raw=path.read_bytes();assert len(raw)==prefix['prefixLength'] and 'sha256:'+hashlib.sha256(raw).hexdigest()==prefix['prefixDigest'];before=path.stat();families=collections.Counter();familyBytes=collections.Counter();cohorts={};holders=collections.Counter();memberHolders=collections.Counter();events=0
 def walk(v,loc,event):
  if isinstance(v,dict):
   if v.get('kind')=='worksite_context_observation' and isinstance(v.get('entries'),list):
    key=(v.get('observationDigest'),v.get('workspaceAuthorityBasisRef'),v.get('workspaceAuthorityBasisDigest'),v.get('workspaceBindingIdentity'),v.get('workspaceBindingDigest'));k=json.dumps(key,separators=(',',':'));c=cohorts.setdefault(k,{'contextDigest':v.get('observationDigest'),'occurrences':0,'families':collections.Counter(),'contextJsonBytes':0,'inline':0,'members':0,'inlineEncodedBytes':0,'inlineDecodedBytes':0,'fileVersions':{}});c['occurrences']+=1;c['families'][event['kind']]+=1;c['contextJsonBytes']+=len(json.dumps(v,separators=(',',':'),ensure_ascii=False).encode())
    for e in v['entries']:
     if e.get('state')!='file':continue
     fkey=json.dumps([e.get(k) for k in ['relativePath','fileIdentity','digest','byteLength']],separators=(',',':'));f=c['fileVersions'].setdefault(fkey,{'relativePath':e.get('relativePath'),'digest':e.get('digest'),'byteLength':e.get('byteLength'),'inline':0,'members':0,'families':collections.Counter()});f['families'][event['kind']]+=1
     if e.get('encoding')=='base64' and isinstance(e.get('bytes'),str):
      n=len(e['bytes'].encode());decoded=base64.b64decode(e['bytes'],validate=True);assert len(decoded)==e['byteLength'] and 'sha256:'+hashlib.sha256(decoded).hexdigest()==e['digest'];f['inline']+=1;c['inline']+=1;c['inlineEncodedBytes']+=n;c['inlineDecodedBytes']+=len(decoded)
     elif e.get('encoding')=='admitted_member':f['members']+=1;c['members']+=1
    return
   for k,q in v.items():walk(q,loc+[k],event)
  elif isinstance(v,list):
   for i,q in enumerate(v):walk(q,loc+[i],event)
 for line in raw.splitlines(keepends=True):
  event=json.loads(line);events+=1;families[event['kind']]+=1;familyBytes[event['kind']]+=len(line);walk(event,[],event)
  if event['kind']=='c_call_result_admitted':
   value=event.get('payload',{}).get('value',{});kind=value.get('kind') if isinstance(value,dict) else None
   for position in POSITIONS.get(kind,[]):
    cursor=value
    for part in position:cursor=cursor.get(part,{}) if isinstance(cursor,dict) else {}
    if isinstance(cursor,dict) and cursor.get('kind')=='worksite_context_observation':
     for e in cursor['entries']:
      if e.get('state')=='file':
       target=holders if e.get('encoding')=='base64' else memberHolders;target[(cursor.get('observationDigest'),e.get('relativePath'),e.get('digest'))]+=1
 after=path.stat();assert (before.st_size,before.st_ino,before.st_dev)==(after.st_size,after.st_ino,after.st_dev);assert hashlib.sha256(path.read_bytes()).hexdigest()==prefix['prefixDigest'].removeprefix('sha256:')
 for c in cohorts.values():c['fileVersions']=list(c['fileVersions'].values())
 return {'label':label,'physicalBytes':len(raw),'eventCount':events,'familyCounts':families,'familyBytes':familyBytes,'contextVersionCount':len(cohorts),'contexts':list(cohorts.values()),'declaredResultInlineHolderEntries':sum(holders.values()),'declaredResultMemberEntries':sum(memberHolders.values()),'declaredHolderVersionMultiplicity':sorted(holders.values()),'unchangedPrefix':True}
new=scan('new',json.loads(pathlib.Path(s['new']['prefix']['path']).read_text()));old=scan('historicalSameInput',s['historicalComparator']['verifiedPrefix']);result={'kind':'pure_structured_context_carriage_observation','new':new,'historicalSameInput':old,'limits':['Pure byte/shape analysis, not owner admission authentication; timed owner read separate','Only structured Context objects are counted, not escaped JSON/text/tool bodies','Context cohorts use observationDigest plus authority/binding scope; file versions additionally path/fileIdentity/digest/length','Declared holder counts use exact finite nativeContextBodyHolders positions from accepted current source; legacy old holders are reported under same positions only','Same-input historical observation, not matched model output/CPU/provider causal benchmark; no performance gate']}
with (P/'context-occurrences.json').open('x') as f:json.dump(result,f,indent=2,sort_keys=True);f.write('\n')
for a in [old,new]:print(json.dumps({'label':a['label'],'bytes':a['physicalBytes'],'events':a['eventCount'],'contextVersions':a['contextVersionCount'],'contextOccurrences':sum(c['occurrences'] for c in a['contexts']),'inlineOccurrences':sum(c['inline'] for c in a['contexts']),'memberOccurrences':sum(c['members'] for c in a['contexts']),'inlineDecodedBytes':sum(c['inlineDecodedBytes'] for c in a['contexts']),'declaredResultInlineHolderEntries':a['declaredResultInlineHolderEntries'],'declaredResultMemberEntries':a['declaredResultMemberEntries'],'routeContexts':sum(c['families'].get('traversal_route_admitted',0) for c in a['contexts']),'routeBytes':a['familyBytes'].get('traversal_route_admitted',0)}))
