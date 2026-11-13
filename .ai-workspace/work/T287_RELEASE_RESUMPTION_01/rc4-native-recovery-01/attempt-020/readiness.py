#!/usr/bin/env python3
"""File-only readiness evidence. No ABI import/admission; never follows links."""
from pathlib import Path
import hashlib,json,os,stat,sys

def inspect(config):
 root=Path(config['worksiteRoot']);seen={};issues=[]
 def issue(path,kind):issues.append({'path':path,'issue':kind})
 def visit(rel):
  if rel in seen:return
  parts=Path(rel).parts
  if Path(rel).is_absolute() or '..' in parts:issue(rel,'invalid relative root');return
  p=root
  for part in parts[:-1]:
   p=p/part
   try:s=p.lstat()
   except FileNotFoundError:issue(rel,'absent parent');return
   if not stat.S_ISDIR(s.st_mode) or stat.S_ISLNK(s.st_mode):issue(rel,'non-directory or symlink parent');return
  p=root/rel
  try:s=p.lstat()
  except FileNotFoundError:
   seen[rel]=('absent',0)
   if rel not in config.get('allowedAbsentRoots',[]):issue(rel,'absent')
   return
  if stat.S_ISLNK(s.st_mode):seen[rel]=('symlink',0);issue(rel,'symlink');return
  if stat.S_ISDIR(s.st_mode):
   seen[rel]=('directory',0)
   for name in sorted(os.listdir(p)):visit(rel+'/'+name)
  elif stat.S_ISREG(s.st_mode):
   seen[rel]=('file',s.st_size)
   if s.st_nlink!=1:issue(rel,'hardlink')
  else:seen[rel]=('nonregular',0);issue(rel,'nonregular')
 if root.is_symlink() or root.resolve()!=root:raise ValueError('worksite root is not canonical')
 for rel in config['readRoots']:visit(rel)
 total=sum(v[1] for v in seen.values());count=len(seen)+1
 if count>config['maxContextFiles']:issue('.','entry bound exceeded')
 if total>config['maxContextBytes']:issue('.','byte bound exceeded')
 verified=[]
 for row in config['sourceFiles']:
  rel=row['path'];visit(rel)
  if seen.get(rel,('invalid',))[0]!='file':issue(rel,'source not regular');continue
  b=(root/rel).read_bytes();digest=hashlib.sha256(b).hexdigest()
  if len(b)!=row['bytes'] or digest!=row['sha256']:issue(rel,'source hash/size mismatch')
  else:verified.append(rel)
 return {'status':'FILE_ONLY_READY' if not issues else 'FILE_ONLY_NOT_READY','sourceCommit':config['sourceCommit'],'selectedEntriesIncludingRoot':count,'selectedRawBytes':total,'maxContextFiles':config['maxContextFiles'],'maxContextBytes':config['maxContextBytes'],'sourceHashesMatched':len(verified),'issues':issues,'meaning':'Readiness evidence only; no ABI admission, runtime/test/build/provider call. Actual Runtime observation remains authoritative.'}
if __name__=='__main__':
 if len(sys.argv)!=2:raise SystemExit('usage: readiness.py readiness-inputs.json')
 result=inspect(json.loads(Path(sys.argv[1]).read_text()));print(json.dumps(result,indent=2));raise SystemExit(0 if result['status']=='FILE_ONLY_READY' else 1)
