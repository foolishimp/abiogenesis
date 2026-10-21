"""Close the verified inert carrier; all reads are repository transport files only."""
from pathlib import Path, PurePosixPath
import datetime, hashlib, json, stat
E=Path(__file__).resolve().parent;R=E.parents[5];D=E.parent/'successor-03';P=E.parent;A=P.parent/'closed-evidence-portability-01'
def read(p):return json.loads(p.read_text())
def sha(p):
 assert p.is_relative_to(R) and p.resolve().is_relative_to(R)
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1024**2),b''):h.update(b)
 return h.hexdigest()
def pin(p,base=R):return dict(path=str(p.relative_to(base)),sha256=sha(p),bytes=p.stat().st_size,mode=oct(stat.S_IMODE(p.stat().st_mode)))
def exact(p,row):
 assert p.is_file() and not p.is_symlink() and p.resolve().is_relative_to(R)
 assert sha(p)==row['sha256'] and p.stat().st_size==row['bytes'],str(p)
 if 'mode' in row:assert stat.S_IMODE(p.stat().st_mode)==int(row['mode'],0),str(p)
def write(name,value):
 with (E/name).open('x') as f:json.dump(value,f,indent=2);f.write('\n')
receipt=read(E/'verification.receipt.json');result=read(E/'verification.stdout')
assert receipt['exitCode']==0 and result['verified'] and result['archivesCreatedThisSuccessor']==0
assert result['originalAbsoluteSourcePathsOpened']==result['ProductExecutions']==result['originalOwnerAcquisitions']==0
assert result['exactExclusionRowsVerified']==2353
dependencies={}
def include(p,row=None):
 assert p.is_relative_to(R)
 item=pin(p) if row is None else dict(row,path=str(p.relative_to(R)))
 if item['path'] in dependencies:
  old=dependencies[item['path']];assert old['sha256']==item['sha256'] and old['bytes']==item['bytes'];return
 exact(p,item)
 if 'mode' not in item:item['mode']=oct(stat.S_IMODE(p.stat().st_mode))
 dependencies[item['path']]=item
for base,freeze_name,manifest_name,rows_key in [(D,'stopped-freeze.json','stopped-manifest.json','records'),(P,'stopped-freeze.json','stopped-manifest.json','files'),(A,'freeze.json','manifest.json','records')]:
 freeze=read(base/freeze_name);include(base/freeze_name);include(base/manifest_name)
 expected=freeze['manifest_sha256'] if base==A else freeze['manifest']['sha256']
 assert sha(base/manifest_name)==expected
 for row in read(base/manifest_name)[rows_key]:
  # P's native stopped records are absolute old repository coordinates, not runtime sources.
  if base==P:
   p=Path(row['path']);assert p.is_relative_to(R)
  else:
   rel=PurePosixPath(row['path']);assert not rel.is_absolute() and '..' not in rel.parts;p=base/str(rel)
  include(p,row)
population=read(D/'population.json')['rows'];by_path={r['path']:r for r in population}
for row in population:
 t=row['transport']
 if t['kind']=='repository_file':
  rel=PurePosixPath(t['path']);assert not rel.is_absolute() and '..' not in rel.parts
  include(R/str(rel),dict(sha256=row['sha256'],bytes=row['bytes']))
activation=read(D/'activation.json')
labels=['baseline P1 diagnostic original coverage stop','baseline P1 diagnostic coverage successor','baseline P3 diagnostic pass','historical combined-final-02 package','historical final02 P1 pass','historical final02 binding preparation']
write('subject-map.json',dict(scope='Exact historical subjects only; original addresses are metadata',subjects=[dict(label=label,originalFreeze=chosen,transport=by_path[chosen['path']]['transport']) for label,chosen in zip(labels,activation['selectedFreezes'])],baselineArchive='192356a4291696de676128394d355e9a2d371c8828ba17d60d2daead79ac34b5',historicalFinal02Archive='151ad625652dc426d46a210559afde50f40b93acdf216b5ca9d64969e5eb8e54',futureC0OrFinalCandidateSelected=False))
new_arch=read(D/'archives.json');old_arch=read(A/'archives-02.json')['archives']
old_compressed=sum(a['compressed_bytes'] for a in old_arch)
combined_compressed=old_compressed+new_arch['totalCompressedBytes']
data_metadata=sum(r['bytes'] for r in read(D/'stopped-manifest.json')['records'] if not r['path'].endswith('.tar.gz'))+(D/'stopped-manifest.json').stat().st_size+(D/'stopped-freeze.json').stat().st_size
current_successor_bytes=sum(p.stat().st_size for p in E.iterdir() if p.is_file())
reserve=16*1024**2
admitted_new_logical_upper=new_arch['newLogicalPayloadBytes']+data_metadata+current_successor_bytes+reserve
repository_transport_extent=sum(r['bytes'] for r in dependencies.values())+current_successor_bytes+reserve
assert admitted_new_logical_upper<=2*1024**3 and repository_transport_extent<=2*1024**3 and combined_compressed<=1024**3
write('transport-size.json',dict(status='within_selected_bounds',newArchiveCountThisSuccessor=0,successor03ArchiveCount=10,priorArchiveCount=4,successor03CompressedBytes=new_arch['totalCompressedBytes'],priorCompressedBytes=old_compressed,totalCompressedArchiveBytes=combined_compressed,successor03NewUniquePayloadBytes=new_arch['newLogicalPayloadBytes'],successor03AuthoredMetadataBytes=data_metadata,successor04BytesBeforeFinalRecords=current_successor_bytes,finalRecordReserveBytes=reserve,admittedNewLogicalCarrierUpperBound=admitted_new_logical_upper,requiredRepositoryTransportFileExtentUpperBound=repository_transport_extent,requiredRepositoryFileCount=len(dependencies),logicalLimit=2*1024**3,compressedLimit=1024**3,scope='New unique object payload plus authored successor metadata is the original logical-carrier scope. Required repository transport file extent counts existing compressed archives and mapped repository files once per path. Original-address logical bytes include duplicated installs/copies and are not new carrier allocation. No original package or object is extracted.'))
write('preservation.json',dict(status='satisfied',predecessor03=pin(D/'stopped-freeze.json'),predecessor02=pin(P/'stopped-freeze.json'),priorCarrier=pin(A/'freeze.json'),all50PredecessorRecordsUnchanged=True,all15OriginalStopRecordsUnchanged=True,allPriorCarrierRecordsUnchanged=True,requiredRepositoryDependenciesChecked=len(dependencies),originalSourceCoordinatesReacquired=False,priorProtectedMain936Evidence=pin(D/'stop-preservation.json'),mainScope='The fresh main936 preservation check belongs to immutable successor03. Successor04 is repository/archive-only and writes only this new output root.',newArchiveWrites=0,ProductExecutions=0,GitEffects=0,mismatches=0))
readme=f'''# Closed evidence portability02 — verified successor04

This is a repository-plus-archives handoff for reviewing **closed historical evidence** on another machine. It preserves exact byte and source-coordinate relations; copied journals and installations never become original runtime authority. It is not a final C0 candidate, L5 acceptance or release claim.

The corrected verifier passed once: {result['originalSourceAddresses']:,} original file addresses, {result['metadataRows']:,} original metadata rows, six original packages and {result['packageMembers']:,} package members. The map uses 7,736 repository-file relations (1,651 distinct mapped files), 61,340 package-member relations, 351 archive-object relations and one ordered two-chunk file. It checked 389 archive objects and all 2,353 exact V8 exclusions. Finite coverage counts include repeated owning relations; they are not extra tests or Product outcomes.

## Required checkpoint contents

Keep this directory, `../successor-03` unchanged, the original stopped files in `..`, the prior `../../closed-evidence-portability-01` carrier, and every repository dependency in `manifest.json`. This is not a standalone copy of the ten archives. The manifest pins all {len(dependencies):,} existing required repository files and the new local records. The source address map and archive inventories remain in successor03; no payload or map was recopied.

Ten successor03 archives total **55,685,201 compressed bytes**. Four reused prior archives total **136,487,957 bytes**; the combined compressed set is **192,173,158 bytes**. Each archive is below 90 MiB. This successor created no archive. `transport-size.json` gives the admitted logical scope, existing repository-file extent and explicit final-record reserve, all within the selected limits.

## Verify on another machine

1. Compare `freeze.json` SHA-256 against the Executive handoff. Its `manifestSha256` pins `manifest.json`, which pins local records and the required repository dependencies.
2. From the received checkout root, run the filesystem-only verifier:

```sh
python3 .ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/closed-evidence-portability-02/successor-04/verify-transport.py --repo-root .
```

The verifier reads repository-relative files and inert archive members without extraction. Original absolute addresses are lookup keys and historical metadata only; none is opened as a fallback. It runs no Product, test, native provider or EventStore owner. The retained construction run reports `finalFreezePresent: false` because it preceded final manifest closure. The final manifest was checked separately after creation; that later check is not retroactively attributed to the original verifier receipt.

3. Start at `subject-map.json`. Find an original path in `../successor-03/population.json`. A `repository_file` relation names checkpoint bytes; `archive_object` names an inert tar member; `package_member` names a member of an exact original package object; `archive_chunks` orders chunks by offset while retaining the whole-source digest and size. `original-metadata.json` retains original mode, device, inode, timestamps and link targets independently of normalized transport metadata. Do not extract over an original runtime path, append a copied log, or reinterpret copy identity as currentness or admission.

## Subjects, exclusions and preserved failures

The six selected cuts are the baseline P1 diagnostic's original coverage stop; its separate read-only coverage successor; baseline P3 diagnostics with repaired support; historical combined-final-02; its successful P1; and its closed binding preparation. Their exact original freezes, baseline/final02 archive identities and transport routes are in `subject-map.json`. Raw observer traces, requests/results, event-prefix bytes, package/member/source/support correspondence, task-owned cache bytes and original physical observations are retained through the map. Reuse preserves bytes, not original inode or authority.

Recomputable V8 caches retain 2,353 exact source-row/route/reason exclusions; their bytes are not copied. System executable/provider identities remain metadata only. No credentials, ambient caches, continuation17 or active C0 work were acquired. Non-Node tar per-PID IO/CPU/memory remain unobserved under the original diagnostic scopes. Nothing here expands semantic acceptance or measurement scope.

The original provider-reader failure remains at `../stopped-freeze.json`. Successor03's verifier failure remains at `../successor-03/stopped-freeze.json`: 577 repository-relative cache rows were compared with absolute addresses despite exact exclusions being retained. Successor04 changes only that address relation and separates its output root from the immutable data root. Exemptions require the exact original source row, exact route and exact reason under four declared bases; every exclusion is consumed. Neither old failure has been rewritten as a pass. `HOW.md`, `verifier-construction.json`, the one command/receipt and `verification.stdout` retain the successor proof.

Original source/main936 preservation evidence remains at its immutable successor03 cut. This successor rechecked all predecessor/prior carrier records and required repository dependencies without reacquiring original runtime addresses. Future C0, final installed/native proof and final acceptance require their own later transport selection.
'''
(E/'README.md').write_text(readme)
(E/'return.md').write_text(f'Closed historical transport verified once. 69,428 source addresses; 74,736 metadata rows; 15,829 package members; 2,353 exact exclusions. No reselection, repack, original source acquisition, Product/native or Git effects. Ten existing new archives plus four prior archives total 192,173,158 compressed bytes. All prior failed records remain immutable. See README.md for exact dependency acquisition, repository-only verification and authority limits. Independent L5/future C0 evidence is not claimed.\n')
records=[pin(p,E) for p in sorted(E.iterdir()) if p.is_file()]
write('manifest.json',dict(kind='closed_evidence_transport_manifest',activation='PORTABILITY-EXCLUSION-ADDRESS-04',records=records,repositoryDependencies=sorted(dependencies.values(),key=lambda x:x['path']),dependencyIdentity='Repository-relative byte/mode transport identity only; original coordinates remain in predecessor population/metadata',newArchives=0))
write('freeze.json',dict(kind='closed_evidence_transport_freeze',status='closed_transport_verified',activation='PORTABILITY-EXCLUSION-ADDRESS-04',writer='/root/stdo3_proof_writer',returnTo='/root',createdUtc=datetime.datetime.now(datetime.timezone.utc).isoformat(),manifestSha256=sha(E/'manifest.json'),manifestBytes=(E/'manifest.json').stat().st_size,recordCount=len(records),repositoryDependencyCount=len(dependencies),verificationReceipt=pin(E/'verification.receipt.json',E),verificationResult=pin(E/'verification.stdout',E),populationFreeze=pin(D/'population-freeze.json'),immutablePredecessorFreeze=pin(D/'stopped-freeze.json'),sourceAddresses=69428,exactCacheExclusions=2353,archiveCount=14,archivesCreatedThisSuccessor=0,ProductExecutions=0,originalOwnerAcquisitions=0,GitEffects=0,independentL5=False))
for row in read(E/'manifest.json')['records']:exact(E/row['path'],row)
for row in read(E/'manifest.json')['repositoryDependencies']:exact(R/row['path'],row)
actual_new=sum(p.stat().st_size for p in E.iterdir() if p.is_file());assert actual_new<current_successor_bytes+reserve
assert new_arch['newLogicalPayloadBytes']+data_metadata+actual_new<=2*1024**3
assert sum(r['bytes'] for r in dependencies.values())+actual_new<=2*1024**3
print(json.dumps(dict(freeze=pin(E/'freeze.json'),manifest=pin(E/'manifest.json'),localRecords=len(records),repositoryDependencies=len(dependencies),successor04ActualBytes=actual_new,admittedNewLogicalCarrierBytes=new_arch['newLogicalPayloadBytes']+data_metadata+actual_new,requiredRepositoryTransportFileBytes=sum(r['bytes'] for r in dependencies.values())+actual_new,compressedArchiveBytes=combined_compressed,allFinalManifestRecordsVerified=True,mismatches=0)))
