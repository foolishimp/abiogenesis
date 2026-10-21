from pathlib import Path
import json,hashlib,os,sys,datetime
lane=Path(sys.argv[1]).resolve();output=Path(sys.argv[2]).resolve();config=json.loads((lane/'diagnostic-configuration.json').read_text());root=Path(config['diagnosticRoot']);sha=lambda b:hashlib.sha256(b).hexdigest()
def obj(p):return json.loads(Path(p).read_text())
def pin(p):p=Path(p);return {'path':str(p),'sha256':sha(p.read_bytes()),'bytes':p.stat().st_size}
summary=obj(root/'diagnostic-summary.json');contract=obj(output/'coverage-contract.json');runtime=obj(config['originalConfiguration']['path']);evidence=Path(runtime['lanes'][config['lane']]['roots']['evidence']);result=obj(evidence/'result.json')
def external_allowed(edge):
 assert edge['classification']=='external-uninstrumented'
 assert edge['effectiveFile']==edge['file'] and edge['effectiveArgs']==edge['args']
 args=edge['args']
 if edge['file']=='/usr/bin/du':
  return len(args)==3 and args[:2]==['/usr/bin/du','-sk'] and args[2] in contract['allowedDuRoots']
 if edge['file']!='tar' or len(args) not in [3,4] or args[0]!='tar':return False
 matches=[x for x in contract['archiveBindings'] if x['archive']['path']==args[2]]
 if len(matches)!=1:return False
 return (len(args)==3 and args[1]=='-tzf') or (len(args)==4 and args[1]=='-xOzf' and args[3] in matches[0]['members'])
try:
 for binding in contract['archiveBindings']:
  for field in ['archive','inventory']:
   item=binding[field];assert sha(Path(item['path']).read_bytes())==item['sha256'],item['path']
  inventory=obj(binding['inventory']['path']);names={'package/'+x['path'] for x in inventory['files']}
  assert set(binding['members'])<=names
 assert result['status']=='satisfied' and result['subjectId']=='baseline' and result['lane']==config['lane'] and result['nativeCalls']==0
 assert summary['status']=='observations_only' and not summary['failures']
 processes=summary['processes'];by_pid={p['pid']:p for p in processes};assert len(by_pid)==len(processes)
 traces={int(x['name'].split('-')[1]) for x in summary['traces']}
 expected={x['member']:x['sha256'] for x in config['emittedModules']};loaded=set();edges=[];counterNames=set();histories=0
 for p in processes:
  assert p['configurationSha256']==sha((lane/'diagnostic-configuration.json').read_bytes());assert p['exitCode']==0 and p['probeErrors']==[],p['pid'];assert p['pid'] in traces,p['pid']
  counterNames.update(p['counters']);histories+=len(p['historyOwners'])
  for module in p['loaded']:
   assert module['sha256']==expected[module['member']] and module['originalPrefixUnchanged']
   actual=Path(module['path']);assert str(actual.resolve())==str(actual);assert any(actual.is_relative_to(Path(x)) for x in config['moduleRoots']);assert sha(actual.read_bytes())==module['sha256'];loaded.add(module['member'])
  for edge in p['launches']:
   if edge['classification'] in ['node-preloaded','npm-explicit-node-preloaded']:
    assert edge['pid'] in by_pid and edge['pid'] in traces,edge
   else:assert external_allowed(edge),edge
   edges.append({'parentPid':p['pid'],**edge})
 assert loaded==set(expected),(loaded,expected)
 assert histories>0 and 'hash.update.inputBytes' in counterNames and 'JSON.stringify.outputUtf8Bytes' in counterNames and 'writeCanonicalJson.deliveredUtf8Bytes' in counterNames
 reference=obj(config['referenceEndpoint']['path']);referenceOutput={'referenceEndpoint':config['referenceEndpoint']}
 if config['lane']=='public-preparation':
  state=obj(evidence/'p1-owner-state.json');old=reference['ownerState'];assert sha(Path(old['path']).read_bytes())==old['sha256'];before=obj(old['path'])
  projection=lambda s:[{k:x[k] for k in ['label','definitionKey','exitCode','outcomeKind']} for x in s['calls']]
  assert state['selectedProgram']==before['selectedProgram'] and projection(state)==projection(before)
  referenceOutput.update(exactFullProgram=True,exactTenOperationOutcomes=True,referenceOwnerState=old,diagnosticOwnerState=pin(evidence/'p1-owner-state.json'))
 else:
  start=obj(evidence/'start.json');assert start['receipt']['ownerOutput']['value']['terminalResult']['value']=={'kind':'hello_world_output','schemaVersion':'5.0.0','message':'Hello World'}
  referenceOutput.update(literalHelloWorld=True,diagnosticStart=pin(evidence/'start.json'))
 answer={'status':'satisfied','subjectId':'baseline','lane':config['lane'],'configuration':pin(lane/'diagnostic-configuration.json'),'workloadResult':pin(evidence/'result.json'),'summary':pin(root/'diagnostic-summary.json'),'processCount':len(processes),'traceFileCount':len(summary['traces']),'observedHistoryOwners':histories,'loadedMembers':sorted(loaded),'childEdges':edges,'observedCounterNames':sorted(counterNames),'outputCorrespondence':referenceOutput,'limits':contract['sampling'],'nativeCalls':0,'scope':'Passive-observer coverage plus original frozen workload oracle; no semantic acceptance or inferred missing counters.'}
except Exception as error:
 answer={'status':'stopped','subjectId':'baseline','lane':config['lane'],'firstCause':repr(error),'summary':pin(root/'diagnostic-summary.json'),'workloadResult':pin(evidence/'result.json'),'stop':'No repair/retry/next lane; return Root.'}
with (output/'coverage-result.json').open('x') as f:json.dump(answer,f,indent=2);f.write('\n')
print(json.dumps({k:v for k,v in answer.items() if k in ['status','firstCause','processCount','traceFileCount','observedHistoryOwners','loadedMembers']}))
if answer['status']!='satisfied':sys.exit(1)
