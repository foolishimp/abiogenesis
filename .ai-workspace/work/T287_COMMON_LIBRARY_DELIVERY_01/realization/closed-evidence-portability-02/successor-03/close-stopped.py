"""Close the actual first verifier failure; performs no repair, retry or archive write."""
from pathlib import Path
import datetime, hashlib, json, stat
D=Path(__file__).resolve().parent;R=D.parents[5];PRIOR=D.parent.parent/'closed-evidence-portability-01'
def read(p):return json.loads(p.read_text())
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1024**2),b''):h.update(b)
 return h.hexdigest()
def pin(p):return dict(path=str(p),sha256=sha(p),bytes=p.stat().st_size,mode=oct(stat.S_IMODE(p.stat().st_mode)))
def exact(row):
 p=Path(row['path']);assert sha(p)==row['sha256'],str(p)
 if 'bytes' in row:assert p.stat().st_size==row['bytes'],str(p)
 if 'mode' in row:assert stat.S_IMODE(p.stat().st_mode)==int(row['mode'],0),str(p)
def write(name,value):
 with (D/name).open('x') as f:json.dump(value,f,indent=2);f.write('\n')
activation=read(D/'activation.json');ex=read(D/'exclusions.json')['rows']
unrebased={r['source']['path'] for r in ex if isinstance(r.get('source'),dict) and 'path' in r['source'] and 'node-compile-cache' in Path(r['source']['path']).parts}
missing=[]
for chosen in activation['selectedFreezes']:
 f=read(Path(chosen['path']));rows=f['records'] if '/preparation/' in chosen['path'] else f['files']
 for row in rows:
  p=Path(row['path']);address=str(p if p.is_absolute() else R/p)
  if 'node-compile-cache' in Path(address).parts and address not in unrebased:
   matches=[e for e in ex if e['route']==chosen['path'] and e['source']==row]
   missing.append(dict(freeze=chosen,source=row,originalAddress=address,exactMatchingExclusions=matches))
assert missing and all(len(m['exactMatchingExclusions'])>=1 for m in missing)
write('verifier-localization.json',dict(status='localized_read_only',firstMissing=missing[0],sameShapeMissingCount=len(missing),verifier=pin(D/'verify-transport.py'),stderr=pin(D/'verification.stderr'),firstCause='Unrebased repository-relative exclusion source.path compared against absolute original address',scope='Address-domain join in transport verifier; cache bytes were deliberately excluded and exact source row/route is retained. No Product evidence failure or authority change established.',priorChecksReached='Verifier passed archive/object/package-member/source-byte checks before failing first native coverage join; overall verification remains failed',repairOrRetry=False))
for row in [*activation['selectedFreezes'],activation['priorCarrier'],activation['predecessorStop'],activation['predecessorManifest']]:exact(row)
for row in read(D.parent/'stopped-manifest.json')['files']:exact(row)
assert sha(PRIOR/'manifest.json')==read(PRIOR/'freeze.json')['manifest_sha256']
for row in read(PRIOR/'manifest.json')['records']:exact(dict(row,path=str(PRIOR/row['path'])))
main=read(D/'protected-main-before.json')['inventory'];exact(main);main_rows=read(Path(main['path']))['files']
for row in main_rows:exact(dict(row,path=str(Path(row['path']) if Path(row['path']).is_absolute() else R/row['path'])))
for row in read(D/'population-freeze.json')['files']:exact(row)
for row in read(D/'verification-input.json')['records']:exact(dict(row,path=str(D/row['path'])))
write('stop-preservation.json',dict(status='satisfied',selectedFreezePins=activation['selectedFreezes'],priorCarrier=activation['priorCarrier'],originalStoppedCut=activation['predecessorStop'],protectedMain=main,protectedMainCount=len(main_rows),completedPopulationInputsUnchanged=True,archiveAndVerifierInputsUnchanged=True,mismatches=0,sourcePreservationAfterPackaging=pin(D/'preservation-after-packaging.json'),runtimeEffects=0,GitEffects=0,archivesRewritten=0))
archives=read(D/'archives.json');pre=read(D/'population-preflight.json')
text=f'''# Portability successor03 — stopped verification

This transports historical evidence only. It is not a current-candidate, runtime-owner, L5 or release claim.

The one corrected population selection and one archive construction passed: {pre['selectedAddresses']} original file addresses, {pre['metadataRows']} original metadata rows, six original package archives and {pre['packageMembers']} members. Existing carrier bytes were reused. Ten new inert archives contain {archives['newLogicalPayloadBytes']} unique payload bytes and total {archives['totalCompressedBytes']} compressed bytes, all below 90 MiB each. The selected bounds remain below 2 GiB logical and 1 GiB compressed.

The first repository/archive-only verifier run failed at its native coverage join. `exclusions.json` retains repository-relative V8 cache rows with their exact source freeze route. The verifier indexed that relative path without rebasing it, then compared an absolute original address. The first row and all {len(missing)} same-shape mismatches are localized by `verifier-localization.json`; the exact matching exclusion remains. The verifier had completed archive/member/source-byte checks but did not close coverage. Its original source, stderr, receipt and `STOP-verification.json` remain unchanged. No retry, repair or repack occurred.

The previous optional-provider failure remains at `../stopped-freeze.json`. This successor's population preserves provider absence as not applicable for final02 P1, retaining unused baseline provider metadata without copying tools or credentials. Completed population inputs exclude open command streams; command logs were pinned only after process completion.

`population.json` maps each original address to a repository file, prior/new inert archive object, exact original package member, or ordered chunks. `original-metadata.json` retains original mode/device/inode/time/link facts. Copies never obtain original runtime authority. `package-members.json`, `object-plan.json`, and `archives.json` describe bytes without extraction. The prior `closed-evidence-portability-01` carrier is a required dependency; it was not duplicated.

The raw baseline diagnostics, original failed coverage, separate P1 coverage successor, P3 diagnostics, historical combined-final-02/P1 and its closed preparation retain their exact old scopes. V8 byte caches, system executables, credentials and ambient caches are excluded; task-owned cache bytes are retained or exactly reused. External tar per-PID IO/CPU/memory remain unobserved as originally declared. No workload, install, provider, original event owner or Git action occurred. Current C0 work and continuation17 were not acquired.

This is a stopped carrier. Do not advertise the verifier as passing or rerun it as a repair. A separate Executive successor may correct the address-domain join over these immutable bytes. Root receives the stopped freeze, exact failure and retained archives. All six original freeze pins, the prior carrier, the original stopped cut and protected main936 were freshly unchanged at closure.
'''
(D/'README.md').write_text(text)
(D/'return.md').write_text('Stopped at first repository-only verifier coverage failure. Population and packaging passed once; verification failed once. Ten archives retained (55,685,201 compressed bytes). Exact failure: repository-relative V8 exclusion key compared to an absolute original address; 577 exact rows and source routes remain present. No Product effects, original writes, cleanup, retry or Git. See verifier-localization.json and stop-preservation.json. Await separate Executive disposition.\n')
records=[]
for p in sorted(D.iterdir()):
 if p.is_file():records.append(dict(pin(p),path=p.name))
write('stopped-manifest.json',dict(kind='closed_transport_verifier_stop_manifest',records=records,totalFileBytes=sum(x['bytes'] for x in records)))
write('stopped-freeze.json',dict(kind='closed_transport_verifier_stop',status='stopped',activation='PORTABILITY-OPTIONAL-PROVIDER-03',writer='/root/stdo3_proof_writer',returnTo='/root',createdUtc=datetime.datetime.now(datetime.timezone.utc).isoformat(),manifest=pin(D/'stopped-manifest.json'),recordCount=len(records),populationFreeze=pin(D/'population-freeze.json'),archiveInventory=pin(D/'archives.json'),firstFailure=pin(D/'STOP-verification.json'),localization=pin(D/'verifier-localization.json'),selectedAddresses=pre['selectedAddresses'],newArchiveCount=10,newCompressedBytes=archives['totalCompressedBytes'],ProductExecutions=0,sourceEdits=0,GitEffects=0,retries=0,coverageComplete=False))
for row in read(D/'stopped-manifest.json')['records']:exact(dict(row,path=str(D/row['path'])))
print(json.dumps(dict(freeze=pin(D/'stopped-freeze.json'),manifest=pin(D/'stopped-manifest.json'),recordCount=len(records),mismatches=0)))
