"""Read-only comparison of the accepted artifact with its current source basis.

The caller consumes inventory through the existing published digest owner.
This script neither builds nor extracts the package to disk.
"""
import hashlib
import json
import pathlib
import tarfile

root=pathlib.Path(__file__).resolve().parents[4]
base=root/'.ai-workspace/work/T287_HELLO_EXPUNCTION_01'
tenant=root/'build_tenants/abiogenesis/typescript'
hash_bytes=lambda value: hashlib.sha256(value).hexdigest()
read_json=lambda path: json.loads(path.read_text())
acceptance=read_json(base/'acceptance.json')
freeze_bytes=(base/'successor-freeze.json').read_bytes()
assert hash_bytes(freeze_bytes)==acceptance['sourceFreeze']['sha256']
freeze=json.loads(freeze_bytes)
drift=[]
for pin in freeze['sourceMembers']:
 path=root/pin['path']
 if pin.get('absent'):
  assert not path.exists(),str(path)
  continue
 value=path.read_bytes()
 if hash_bytes(value)!=pin['sha256'] or len(value)!=pin['bytes']:
  drift.append({'path':pin['path'],'expectedSHA256':pin['sha256'],'currentSHA256':hash_bytes(value)})
assert {row['path'] for row in drift}=={'specification/GOALS.md','.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md'}

pre=read_json(base/'preimages.json')
expected={pin['path']:pin for pin in pre['members'] if pin['path'].startswith('build_tenants/abiogenesis/typescript/code/src/')}
for change in read_json(base/'code-changes.json')['changes']:
 if change['path'].startswith('build_tenants/abiogenesis/typescript/code/src/'):
  if change['operation']=='delete':expected.pop(change['path'],None)
  else:expected[change['path']]={'path':change['path'],**change['successor']}
actual={str(path.relative_to(root)) for path in (tenant/'code/src').rglob('*') if path.is_file()}
assert actual==set(expected)
for path,pin in expected.items():
 value=(root/path).read_bytes()
 assert hash_bytes(value)==pin['sha256'] and len(value)==pin['bytes'],path

authority={pin['path']:pin for pin in pre['members'] if pin['path']=='specification/PRODUCT.md' or pin['path']=='specification/INTENT.md' or pin['path'].startswith('specification/requirements/')}
for name in ['spec-core-freeze.json','spec-design-freeze.json']:
 for pin in read_json(base/name)['members']:
  if pin['path'] in authority:authority[pin['path']]=pin
for pin in freeze['sourceMembers']:
 if pin['path'] in authority:authority[pin['path']]=pin
for path,pin in authority.items():
 value=(root/path).read_bytes()
 assert hash_bytes(value)==pin['sha256'] and len(value)==pin['bytes'],path

archive=root/freeze['package']['path']
assert hash_bytes(archive.read_bytes())==freeze['package']['sha256']
assert archive.stat().st_size==freeze['package']['bytes']
with tarfile.open(archive) as tar:
 files={}
 digests={}
 special={}
 comparisons=0
 for member in tar:
  if not member.isfile():continue
  path=member.name.removeprefix('package/')
  value=tar.extractfile(member).read()
  files[path]=member
  digests[path]=hash_bytes(value)
  if path in ['product-toolchain-manifest.json','package.json']:special[path]=value
  if path.startswith('build/code/src/') or path.startswith('contracts/'):
   assert value==(tenant/path).read_bytes(),path
   comparisons+=1
 manifest_bytes=special['product-toolchain-manifest.json']
 manifest=json.loads(manifest_bytes)
 assert manifest_bytes==(tenant/'product-toolchain-manifest.json').read_bytes()
 assert manifest['productContentDigest']==freeze['package']['productContentDigest']
 inventory=[]
 for path in manifest['productRelativeLocators']:
  inventory.append({'path':path,'sha256':'sha256:'+digests[path]})
 packed_package=json.loads(special['package.json'])
 source_package=read_json(tenant/'package.json')
 package_diffs=[key for key in sorted(set(packed_package)|set(source_package)) if packed_package.get(key)!=source_package.get(key)]
 assert package_diffs==['scripts']
 scripts_diffs=[key for key in sorted(set(packed_package['scripts'])|set(source_package['scripts'])) if packed_package['scripts'].get(key)!=source_package['scripts'].get(key)]
 assert not any(path.startswith('test_env/') for path in files)
 print(json.dumps({'acceptanceSHA256':hash_bytes((base/'acceptance.json').read_bytes()),'successorFreezeSHA256':hash_bytes(freeze_bytes),
  'package':freeze['package'],'sourceMemberCount':len(freeze['sourceMembers']),'documentaryDrift':drift,
  'productionSourceCount':len(expected),'productionSourceDrift':[],'governingProductIntentRequirementPins':len(authority),
  'governingAuthorityDrift':[],'compiledAndContractComparisons':comparisons,'compiledAndContractDrift':[],
  'archiveFileCount':len(files),'payloadCount':len(inventory),'manifestByteSHA256':hash_bytes(manifest_bytes),
  'manifestMatchesCurrent':True,'packageTopLevelDiffFields':package_diffs,'changedTestScriptKeys':scripts_diffs,
  'publicRuntimePackageFieldsUnchanged':True,'testFixturesPacked':False,
  '_inventory':inventory,'_manifest':manifest}))
