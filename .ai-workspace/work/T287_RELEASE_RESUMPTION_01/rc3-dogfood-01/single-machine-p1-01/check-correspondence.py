#!/usr/bin/env python3
"""Check compact C2 correspondence against an exact grant and snapshot; no writes."""
import hashlib,json,pathlib,sys
PREFIX='build_tenants/abiogenesis/typescript/'
def fail(msg):raise ValueError(msg)
def check(raw,grant,root):
 lines=raw.splitlines()
 if not lines or json.loads(lines[0])!={'prefix':PREFIX}:fail('exact common prefix header required')
 expected=grant['Construction']['writePaths'];
 if len(set(expected))!=len(expected) or any(not p.startswith(PREFIX) for p in expected):fail('invalid grant paths')
 rows=[json.loads(x) for x in lines[1:]]
 if len(rows)!=len(expected):fail('missing or excess paths')
 paths=[PREFIX+r['p'] for r in rows]
 if paths!=sorted(expected):fail('missing, changed, duplicate or reordered path')
 for path,row in zip(paths,rows):
  if set(row)!={'p','b','h'}:fail('unexpected row fields')
  p=root/path
  if not p.is_file() or p.is_symlink():fail('snapshot member missing or not regular')
  b=p.read_bytes()
  if row['b']!=len(b) or row['h']!=hashlib.sha256(b).hexdigest():fail('snapshot member length/digest mismatch: '+path)
 return {'status':'match','paths':len(rows),'bytes':len(raw)}
if __name__=='__main__':
 try:
  if len(sys.argv)!=4:fail('usage: check-correspondence.py OUTPUT GRANT SNAPSHOT_ROOT')
  print(json.dumps(check(pathlib.Path(sys.argv[1]).read_bytes(),json.loads(pathlib.Path(sys.argv[2]).read_text()),pathlib.Path(sys.argv[3]))))
 except (ValueError,KeyError,TypeError,OSError,json.JSONDecodeError) as e:print(json.dumps({'status':'refused','reason':str(e)}),file=sys.stderr);sys.exit(2)
