"""Allowlisted tool-use/terminal metadata only; no Product admission or raw provider content."""
from pathlib import Path
import json,collections,hashlib
from datetime import datetime,timezone
q=Path(__file__).resolve().parent
p=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/runtime-001/resources/archives/fp-355a0a0e2270c2a4-stdout.log')
counts=collections.Counter();ids=set();recent=[];h=hashlib.sha256();n=0;terminal=None
if p.exists():
 with p.open('rb') as f:
  for b in f:
   if not b.endswith(b'\n'):break
   h.update(b);n+=len(b)
   try:r=json.loads(b)
   except json.JSONDecodeError:continue
   if r.get('type')=='assistant':
    for block in r.get('message',{}).get('content',[]):
     if block.get('type')!='tool_use':continue
     identity=block.get('id');name=block.get('name')
     if identity in ids:continue
     ids.add(identity);counts[name]+=1;item={'name':name}
     if name in ['Read','Edit','Write']:
      inp=block.get('input',{});path=inp.get('file_path',inp.get('path',''))
      item['path']=path if path.startswith('/Users/jim/src/apps/abiogenesis-rc6-local-cut/') else '<outside-selected-worksite-or-relative>'
     recent.append(item)
   if r.get('type')=='result':terminal={k:r.get(k) for k in ['type','subtype','is_error','num_turns','duration_ms','duration_api_ms','total_cost_usd','stop_reason','session_id']}
result={'kind':'allowlisted_native_tool_use_metadata_only','at':datetime.now(timezone.utc).isoformat(),'sourcePath':str(p),'completePrefixBytes':n,'completePrefixSha256':h.hexdigest(),'uniqueToolUses':sum(counts.values()),'toolCounts':dict(counts),'recent':recent[-10:],'terminalMetadata':terminal,'limits':'Only assistant tool_use metadata and explicit terminal counters projected. No private reasoning/narrative or tool_result inspected or output; not Product result/acceptance.'}
(q/'NATIVE_TOOL_METADATA.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'uniqueToolUses':result['uniqueToolUses'],'toolCounts':result['toolCounts'],'recent':result['recent'][-4:],'terminal':terminal}))
