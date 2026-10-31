#!/usr/bin/env python3
"""Assert exact event bytes and close coordinates after Root's read-only projections."""
from pathlib import Path
from urllib.parse import urlparse,unquote
import hashlib,json
b=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01');a=b/'attempt-006';out=b/'increment-b-05/POST_READBACK_ASSERTION.json'
sha=lambda p:hashlib.file_digest(p.open('rb'),'sha256').hexdigest()
p=json.loads((b/'increment-b-05/model-free-preflight.json').read_bytes());h=json.loads((a/'after-run-resume.json').read_bytes())['state']['closeHandoff']['prefix'];reads=json.loads((a/'fresh-reads.json').read_bytes());summary=json.loads((a/'outcome-summary.json').read_bytes());assert summary['outcomeKind']=='result' and summary['disposition']=='blocked' and summary['terminal'] is None
assert [x['memberKey'] for x in reads]==['run_result','run_replay']
files=[a/'fresh-reads.json',a/'outcome-summary.json']
for name in ['run_result','run_replay']:
 close=a/'calls'/f'{name}.close.json';result=a/'commands'/f'{name}.result.json';assert json.loads(close.read_bytes())['prefix']==h;files.extend([close,result])
event=Path(unquote(urlparse(h['eventLogRef']).path));s=event.stat();digest=sha(event);assert s.st_size==h['prefixLength']==p['priorEvent']['bytes'] and digest==p['priorEvent']['sha256'] and 'sha256:'+digest==h['prefixDigest'] and h['coordinateDigest']==p['priorEvent']['coordinateDigest']
rows=[{'member':x['memberKey'],'outcome':x['ownerOutput']['outcomeKind'],'projectionStatus':(x.get('projection') or {}).get('status')} for x in reads]
data={'kind':'b04_post_readback_prefix_assertion','status':'actual_full_event_sha_size_and_both_close_coordinates_checked_after_readbacks','eventBytes':s.st_size,'eventSha256':digest,'coordinateDigest':h['coordinateDigest'],'readbacks':rows,'custody':{str(f):sha(f) for f in files},'limits':['No B05 admission or provider call','B04 source remains partial and unqualified']}
with out.open('x') as f:json.dump(data,f,indent=2,sort_keys=True);f.write('\n')
print(json.dumps(data))
