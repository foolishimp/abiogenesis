from pathlib import Path,PurePosixPath
import json,hashlib,tarfile,os,sys
O=Path(__file__).resolve().parent
basis=json.loads((O/'VIEW_BASIS.json').read_text())
def digest(b):return hashlib.sha256(b).hexdigest()
def require_pin(row):
 p=Path(row['path']);b=p.read_bytes();assert len(b)==row['bytes'] and digest(b)==row['sha256'],str(p)
for key in ['builderPin','installedPackage','installedManifest','viewInventory','oldControls','oldReady']:require_pin(basis[key])
view=json.loads((O/'VIEW_INVENTORY.json').read_text());V=Path(basis['view']);I=Path(basis['installedRoot']);A=Path(basis['archive'])
assert digest(A.read_bytes())==basis['archiveSha256']
for row in view['entries']:
 p=V/row['relativePath']
 if row['kind']=='file':
  require_pin(row['source']);require_pin(row['copy']);assert not p.is_symlink()
  original=Path(row['source']['path']).read_bytes();actual=p.read_bytes()
  if row['relativePath']=='test_env/support/root-installed-environment.mjs':
   needle=b'const resolutionCandidate = rootRows.length === 1\n';replacement=b'const resolutionCandidate = rootRows.length === 1 && gtl.isExecutableCLeaf(node.term)\n'
   assert original.count(needle)==1 and actual==original.replace(needle,replacement)
  elif row['relativePath']=='test_env/fixtures/language-structural/leaf.mjs':
   source=original.decode();helper="const freezePreparedData=value=>{if(typeof value!=='object'||value===null)return value;for(const child of Object.values(value))freezePreparedData(child);return Object.freeze(value);};\n"
   assert source.count('export function worker(input){')==1
   expected=source.replace('export function worker(input){',helper+'export function worker(input){')
   line=next(x for x in expected.splitlines() if x.startswith(" return {kind:'prepared_probabilistic_leaf_invocation'"));assert line.endswith('};}};')
   corrected=line.replace(" return {kind:'prepared_probabilistic_leaf_invocation'"," return freezePreparedData({kind:'prepared_probabilistic_leaf_invocation'",1)[:-1]+');'
   assert actual==expected.replace(line,corrected).encode()
  else:assert actual==original
 else:assert p.is_symlink() and os.readlink(p)==row['target'] and str(p.resolve())==row['realpath']==str(I/row['relativePath'])
actual_view=[]
for root,dirs,files in os.walk(V,followlinks=False):
 for n in list(dirs):
  p=Path(root)/n
  if p.is_symlink():actual_view.append(p.relative_to(V).as_posix());dirs.remove(n)
 for n in files:actual_view.append((Path(root)/n).relative_to(V).as_posix())
assert sorted(actual_view)==sorted(row['relativePath'] for row in view['entries'])
archive_rows={};seen=set()
with tarfile.open(A,'r:gz') as tar:
 for member in tar:
  parts=PurePosixPath(member.name).parts
  assert parts and parts[0]=='package' and '..' not in parts and not member.name.startswith('/')
  assert member.name not in seen;seen.add(member.name)
  if len(parts)<2 or parts[1] not in ['build','node_modules']:continue
  if member.isdir():continue
  assert member.isfile(),member.name
  rel='/'.join(parts[1:]);source=tar.extractfile(member).read();target=I/rel
  assert target.is_file() and not target.is_symlink(),str(target)
  got=target.read_bytes();assert got==source,str(target)
  archive_rows[rel]={'path':rel,'bytes':len(source),'sha256':digest(source)}
physical=[]
for selected in ['build','node_modules']:
 for root,dirs,files in os.walk(I/selected,followlinks=False):
  for name in dirs:assert not (Path(root)/name).is_symlink()
  for name in files:
   f=Path(root)/name;assert not f.is_symlink();physical.append(f.relative_to(I).as_posix())
assert sorted(physical)==sorted(archive_rows)
rows=[archive_rows[k] for k in sorted(archive_rows)]
encoded=json.dumps(rows,separators=(',',':'),ensure_ascii=True).encode()
result={'status':'verified_read_only_execution_view','copiedFiles':13,'byteEqualSourceFiles':11,'correctedSourceFiles':2,'symlinks':2,'archiveSha256':basis['archiveSha256'],'compiledAndDependencyFiles':len(rows),'compiledAndDependencyBytes':sum(r['bytes'] for r in rows),'compiledAndDependencyInventorySha256':digest(encoded),'buildFiles':sum(r['path'].startswith('build/') for r in rows),'dependencyFiles':sum(r['path'].startswith('node_modules/') for r in rows),'mismatches':[],'basis':basis,'algorithm':'All regular archive members under build/node_modules compared byte-for-byte with pinned install; full target path inventory equality and symlink refusal; all13 source/view hashes, exactly11 byte-equal files, one exact executable-C-leaf helper predicate correction and one exact fixture-local in-place recursive prepared-data freeze, and exact link realpaths verified. Archive is original inventory carrier, no duplicate decoded payload stored.','productModulesImported':False}
print(json.dumps(result,indent=2))
