import json,pathlib,collections
w=pathlib.Path('.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization')
for name in ['u1-c0-physical-currentness-01','u1-c0-physical-currentness-successor-02']:
 p=w/name
 for n in ['stage-execution-freeze.json','source-inputs.json','focused-01.json' if name.endswith('-01') else 'focused-02.json']:
  o=json.loads((p/n).read_text());print(name,n,'KEYS',list(o) if isinstance(o,dict) else 'list'+str(len(o)));print(str(o)[:1500])
for name in ['lifetime-stream-repair-01','e04-retained-owner-execution-01']:
 p=w/name
 for n in (['stage-post-generation-inventory.json','emitted-inventory.json','case-results.json','physical-summary.json'] if name.startswith('lifetime') else ['scratch-retained.json','evidence-archive.json']):
  o=json.loads((p/n).read_text());print(name,n,str(o)[:2000])
for name in ['l4-p1-baseline-01','l4-p1-candidate-01','l4-p3-baseline-01','l4-p3-baseline-successor-01']:
 p=w/name;o=json.loads((p/'configuration.json').read_text());print('\nCONFIG',name,'subject',o['subject']);print('env',o['environment']);print('lanes',o['lanes'])
 inv=json.loads((p/'retained-resource-inventory.json').read_text());groups=collections.defaultdict(lambda:[0,0]);
 for f in inv['files']:
  s=f['path']; root=next((x for x in inv['rootFootprints'] if s.startswith(x['root']+'/')),None)
  rel=s[len(root['root'])+1:] if root else s
  label=(root['rootLabel'] if root else '?')+'/'+('/'.join(rel.split('/')[:2]));groups[label][0]+=1;groups[label][1]+=f.get('bytes',0)
 print('GROUPS',dict(groups)); print('PREFIX',inv.get('immutablePrefixCopy')); print('LIVE',inv.get('liveEventStore'))
