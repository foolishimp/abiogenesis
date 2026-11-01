#!/usr/bin/env python3
"""Check operator-selected C2 custody and archive; no native admission claim."""
import base64,hashlib,io,json,os,re,stat,sys,tarfile
from pathlib import Path,PurePosixPath

def fail(message): raise ValueError(message)
def sha(data): return 'sha256:'+hashlib.sha256(data).hexdigest()
def digest(s): return isinstance(s,str) and re.fullmatch(r'sha256:[0-9a-f]{64}',s) is not None
def path(s):
 if not isinstance(s,str) or not os.path.isabs(s) or os.path.realpath(s)!=s: fail('canonical absolute path required')
 return Path(s)
def readpin(p,expected):
 if not digest(expected): fail('SHA-256 pin required')
 data=path(p).read_bytes()
 if sha(data)!=expected: fail('pinned bytes changed: '+p)
 return data
def strings(x):
 if isinstance(x,str): yield x
 elif isinstance(x,list):
  for v in x: yield from strings(v)
 elif isinstance(x,dict):
  for v in x.values(): yield from strings(v)
def verify(selection,extract=None):
 if selection.get('kind')!='rc3_b11_c2_selected_producer_v1': fail('selected producer kind required')
 if selection.get('status')!='ROOT_SELECTED_B11_C2_FOR_WITNESS':fail('actual Root B11 artifact selection remains pending')
 p=selection['producer']; a=selection['artifact']; op=selection['operator']
 for key in ('runRef','resultRef','helperArtifactRef'):
  if not isinstance(p.get(key),str) or not p[key]:fail('missing producer coordinate '+key)
 for key in ('resultDigest','helperArtifactDigest','admissionEvidenceSha256','helperResultSha256'):
  if not digest(p.get(key)):fail('missing producer digest '+key)
 evidence=json.loads(readpin(p['admissionEvidencePath'],p['admissionEvidenceSha256']));values=set(strings(evidence))
 if not {p['runRef'],p['resultRef'],p['resultDigest'],p['helperArtifactRef'],p['helperArtifactDigest']}<=values:fail('selected admission evidence omits producer coordinates')
 helper_path=path(p['helperResultPath']);helper=json.loads(readpin(str(helper_path),p['helperResultSha256']))
 if helper.get('disposition')!='success' or helper.get('artifactRef')!=p['helperArtifactRef'] or helper.get('artifactDigest')!=p['helperArtifactDigest']:fail('C2 helper identity or disposition mismatch')
 ids=['fixture-current-measurement','source-correspondence','toolchain','contract-seeds','build','package','focused-owner-chain','affected-owner-tests','artifact-tests']
 commands=helper.get('commandResults');expected=['command://abiogenesis/rc3-dogfood/increment-b-08/'+x for x in ids]
 if not isinstance(commands,list) or [x.get('commandId') for x in commands]!=expected or any(x.get('exitStatus')!=0 or x.get('timedOut') is not False or x.get('processSignal') is not None or x.get('terminationConfirmed') is not True for x in commands):fail('C2 command outcome mismatch')
 named=p.get('namedTestAcceptance')
 if not isinstance(named,dict) or named.get('name')!='GC03 real owner allowed denied cold tamper' or named.get('disposition')!='passed' or named.get('skipped') is not False or named.get('todo') is not False:fail('Root-selected exact named-test acceptance required')
 named_evidence=json.loads(readpin(named['evidencePath'],named['evidenceSha256']))
 if not {p['runRef'],p['resultRef'],p['resultDigest'],'GC03 real owner allowed denied cold tamper'}<=set(strings(named_evidence)):fail('named-test evidence omits actual producer/name')
 focused=commands[6].get('stdout') or {}
 try: focused_bytes=base64.b64decode(focused['payload'],validate=True)
 except Exception:fail('focused stdout unavailable')
 if focused.get('byteLength')!=len(focused_bytes) or focused.get('digest')!=sha(focused_bytes) or named.get('stdoutDigest')!=sha(focused_bytes):fail('named-test stdout differs from full C2 stream')
 line=named.get('passLine')
 if not isinstance(line,str) or line not in focused_bytes.decode('utf8').splitlines() or not re.fullmatch(r'(?:ok [0-9]+ - |✔ )GC03 real owner allowed denied cold tamper(?: \([0-9.]+m?s\))?',line) or '# SKIP' in line or '# TODO' in line:fail('exact observed named pass line required')
 stream=commands[1].get('stdout') or {}
 try: output=base64.b64decode(stream['payload'],validate=True)
 except Exception:fail('source correspondence stdout unavailable')
 if stream.get('encoding')!='base64' or stream.get('byteLength')!=len(output) or stream.get('digest')!=sha(output):fail('source correspondence stream incomplete')
 rows=[json.loads(line) for line in output.splitlines() if line];members={r['relativePath']:r for r in helper.get('snapshotMembers',[])}
 if not rows or len({r.get('path') for r in rows})!=len(rows):fail('source correspondence absent or ambiguous')
 for row in rows:
  member=members.get(row.get('path'));d=row.get('sha256');
  if not isinstance(d,str) or not re.fullmatch(r'[0-9a-f]{64}',d) or not member or member.get('digest')!='sha256:'+d or member.get('byteLength')!=row.get('bytes'):fail('source correspondence differs from C2 snapshot')
 # B11 selection additionally binds the exact three native-authored candidate preimages.
 candidate=selection['candidateSources'];source_custody=json.loads(readpin(candidate['sourceCustodyPath'],candidate['sourceCustodySha256']))
 expected=candidate['rows'];declared=[{'path':r['path'],'bytes':r['postBytes'],'sha256':r['postSha256']}for r in source_custody['paths']]
 if len(expected)!=3 or expected!=declared:fail('selected B11 source custody differs')
 actual={r['path']:r for r in rows}
 for row in expected:
  if actual.get(row['path'])!={'path':row['path'],'bytes':row['bytes'],'sha256':row['sha256']}:fail('B11 candidate source differs from actual C2 correspondence')
 rel=p.get('artifactRelativePath');q=PurePosixPath(rel or '')
 if not rel or q.is_absolute() or any(x in ('','.','..') for x in rel.split('/')) or not rel.endswith('.tgz'):fail('unsafe artifact relative path')
 candidates=[x for x in helper.get('worksiteDelta',[]) if x.get('relativePath')==rel];
 if len(candidates)!=1:fail('C2 artifact delta absent or ambiguous')
 after=candidates[0].get('after') or {};archive_path=path(str(helper_path.parent/'sandbox'/rel));archive=readpin(str(archive_path),a['sha256'])
 if after.get('nodeKind')!='file' or after.get('digest')!=a['sha256'] or after.get('byteLength')!=len(archive) or a.get('bytes')!=len(archive):fail('C2 artifact bytes do not match producer delta')
 if a.get('packageName')!='@abiogenesis/typescript-tenant' or a.get('packageVersion')!='5.0.0-rc.3' or a.get('productId')!='product://abiogenesis/typescript-tenant@5.0.0-rc.3':fail('selected RC3 identity mismatch')
 for key in ('manifestByteSha256','manifestDigest','productContentDigest'):
  if not digest(a.get(key)):fail('missing artifact identity '+key)
 for key in ('authoritySha256','consumerModuleSha256','nodeSha256','npmSha256','taskSha256','rubricSha256'):
  if not digest(op.get(key)):fail('missing operator pin '+key)
 readpin(op['authorityPath'],op['authoritySha256']);readpin(op['consumerModulePath'],op['consumerModuleSha256'])
 if not isinstance(op.get('policyRef'),str) or not op['policyRef']:fail('witness consumer policy reference required')
 for key in ('node','npm'):
  if not path(op[key+'Path']).is_file():fail('tool missing')
  readpin(op[key+'Path'],op[key+'Sha256'])
 seen=set();files=[];manifest=None
 with tarfile.open(fileobj=io.BytesIO(archive),mode='r:gz') as t:
  for m in t:
   name=m.name.rstrip('/');parts=name.split('/')
   if not name or name.startswith('/') or parts[0]!='package' or any(x in ('','.','..') for x in parts) or name in seen:fail('unsafe or duplicate archive member')
   seen.add(name)
   if m.isdir():continue
   if not m.isfile():fail('unsupported archive member type')
   content=t.extractfile(m).read();files.append((name,content,m.mode))
   if name=='package/product-toolchain-manifest.json':manifest=content
 if manifest is None or sha(manifest)!=a['manifestByteSha256']:fail('manifest bytes mismatch')
 m=json.loads(manifest)
 for k in ('productId','packageName','packageVersion','productContentDigest'):
  if m.get(k)!=a[k]:fail('manifest identity mismatch: '+k)
 if extract is not None:
  target=path(extract);target.mkdir(mode=0o700)
  for name,content,mode in files:
   f=target/name;f.parent.mkdir(parents=True,exist_ok=True)
   with f.open('xb') as out:out.write(content)
   os.chmod(f,mode & 0o755)
 return {'kind':'b11_c2_archive_verified_for_bootstrap','artifactPath':str(archive_path),'artifactSha256':a['sha256'],'artifactBytes':len(archive),'manifest':m,'manifestByteSha256':a['manifestByteSha256'],'manifestDigest':a['manifestDigest'],'producer':p,'sourceCorrespondenceCount':len(rows),'members':[{'path':n[len('package/'):],'sha256':sha(c)} for n,c,_ in files],'fileCount':len(files),'nativeAdmission':'operator-selected evidence coordinates checked; authenticated owner admission must be independently established','qualification':False}
if __name__=='__main__':
 try:
  if len(sys.argv) not in (3,5) or (len(sys.argv)==5 and sys.argv[3]!='--extract'):fail('usage: verify-c2.py SELECTION SHA256 [--extract ABSENT_ROOT]')
  config=json.loads(readpin(sys.argv[1],sys.argv[2]));print(json.dumps(verify(config,sys.argv[4] if len(sys.argv)==5 else None),sort_keys=True))
 except (ValueError,KeyError,OSError,TypeError,tarfile.TarError,json.JSONDecodeError) as e:
  print(json.dumps({'kind':'b11_c2_input_refused','reason':str(e)}),file=sys.stderr);sys.exit(2)
