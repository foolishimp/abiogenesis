#!/usr/bin/env python3
"""Census Root-selected frozen source and already materialized assessment docs; no canonical writes."""
import hashlib,json,pathlib,subprocess,sys
P=pathlib.Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/single-machine-p1-03/budget-retest-01');W=pathlib.Path('/Users/jim/src/apps/abiogenesis-single-machine-p1')
sraw=(P/'ROOT_CALL_SELECTION.json').read_bytes();assert len(sys.argv)==2 and hashlib.sha256(sraw).hexdigest()==sys.argv[1];s=json.loads(sraw);assert s['status']=='ROOT_SELECTED_FRESH_TESTING_UAT_CALL' and s['rootAuthority'] and s['sourceCommit']
assert subprocess.check_output(['/usr/bin/git','-C',str(W),'rev-parse','HEAD'],text=True).strip()==s['sourceCommit'];subprocess.run(['/usr/bin/git','-C',str(W),'diff','--quiet'],check=True);subprocess.run(['/usr/bin/git','-C',str(W),'diff','--cached','--quiet'],check=True)
wraw=(P/'workload.json').read_bytes();w=json.loads(wraw);rows={}
for path in w['readRoots']:
 p=W/path;assert p.is_file() and not p.is_symlink(),path;b=p.read_bytes();rows[path]={'state':'file','bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
total=sum(r['bytes'] for r in rows.values());assert total<=w['maxContextBytes'];assert len(w['testing']['selectedPaths'])==963 and set(w['workOrders'])=={'testing','uat'} and all(not o['writeRoots'] for o in w['workOrders'].values())
result={'kind':'single_machine_p1_exact_initial_source_census','sourceCommit':s['sourceCommit'],'rows':rows,'presentFiles':len(rows),'absentFiles':0,'readRoots':len(rows),'selectedC2Paths':963,'totalBytes':total,'maxContextBytes':w['maxContextBytes']}
q=P/'snapshot-census.json'
with q.open('x') as f:json.dump(result,f,indent=2,sort_keys=True);f.write('\n')
print(json.dumps({'workloadSha256':hashlib.sha256(wraw).hexdigest(),'sourceCensusSha256':hashlib.sha256(q.read_bytes()).hexdigest(),'readRootCount':len(rows),'totalBytes':total,'next':'bind these actual fields in Root selection before final freeze; do not infer authority'}))
