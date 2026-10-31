#!/usr/bin/env python3
"""Selected one-time local GC-03 supplement installation; no runtime admission."""
import datetime,hashlib,io,json,os,shutil,tarfile
from pathlib import Path,PurePosixPath

source=Path('/Users/jim/src/apps/specification_methodology-context/a_c/.ai-workspace/work/GOVERNED_CONTEXT_01/release-candidate/ac-governed-context-gc03-adb3d8ee-draft.tar.gz')
carrier=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01')
destination=Path('/Users/jim/.local/share/a_c/development-supplements/gc03-adb3d8ee-1')
expected='cf6b1fcdebda5c6c90a644f17f7d1d01b298f53e6e0b17051b38971b14703a35'
release_id='urn:a-c:development-supplement:governed-context:gc03-adb3d8ee:1'
def sha(raw):return hashlib.sha256(raw).hexdigest()
def safe_write(path,raw):
    path.parent.mkdir(parents=True,exist_ok=True)
    with path.open('xb') as stream:stream.write(raw)
raw=source.read_bytes()
assert len(raw)==309431 and sha(raw)==expected
reverify=(carrier/'gc03-reverify.log').read_bytes()
assert b'Ran 12 tests' in reverify and b'OK\n' in reverify and expected.encode() in reverify
assert not destination.exists() and not destination.is_symlink()
files={}
with tarfile.open(fileobj=io.BytesIO(raw),mode='r:gz') as archive:
    for member in archive:
        path=PurePosixPath(member.name)
        if not member.isfile() or path.is_absolute() or '..' in path.parts or member.name in files:
            raise ValueError('invalid archive member: '+member.name)
        stream=archive.extractfile(member)
        if stream is None:raise ValueError('unreadable member')
        files[member.name]=stream.read()
assert len(files)==38
inventory=json.loads(files['INVENTORY.json']);assert set(files)==set(inventory['files'])|{'INVENTORY.json'}
for name,entry in inventory['files'].items():
    assert len(files[name])==entry['bytes'] and sha(files[name])==entry['sha256'],name
packet=json.loads(files['PACKET.json']);assert packet['proposed_identity']==release_id
assert packet['source_git_commit']=='adb3d8ee18ecd307162cad098a8ff5f03cbcc77f'
# Exclusive new destination. A failed partial installation is left for inspection.
destination.parent.mkdir(parents=True,exist_ok=True)
destination.mkdir(exist_ok=False)
safe_write(destination/'archive.tgz',raw)
for name,data in files.items():safe_write(destination/'contents'/PurePosixPath(name),data)
for name,data in files.items():assert (destination/'contents'/PurePosixPath(name)).read_bytes()==data
assert sha((destination/'archive.tgz').read_bytes())==expected
at=datetime.datetime.now(datetime.timezone.utc).isoformat()
record={'kind':'a_c_local_development_supplement_release_and_installation','status':'RELEASED',
 'identity':release_id,'scope':'governed context shared lookup, trusted-host library seam and lossless presentation',
 'sourceCommit':'adb3d8ee18ecd307162cad098a8ff5f03cbcc77f','archiveSha256':expected,'archiveBytes':len(raw),
 'archiveSource':str(source),'installedRoot':str(destination),'installedArchive':str(destination/'archive.tgz'),
 'installedMembers':len(files),'inventorySha256':sha(files['INVENTORY.json']),
 'sourceReview':'/Users/jim/src/apps/specification_methodology-context/a_c/.ai-workspace/work/GOVERNED_CONTEXT_01/GC03_EXECUTIVE_DISPOSITION.md',
 'freshVerification':{'logSha256':sha(reverify),'tests':12,'sourceChecked':True},
 'authority':{'ownerInstruction':'review, fix, and continue on using rc2 being used to build rc3',
   'executiveInterpretation':'Root selects this exact reviewed GC-03 local development release and installation as necessary dependency under the owner continuation and previously approved shared capability plan.',
   'executiveSelectionActor':'/root','installationActor':'/root/context_capability (delegated Writer)','timestampUtc':at},
 'limits':['Local development supplement only; no tag or external publication',
  'Not an STDO method release or whole-a_c Product release',
  'No ABG runtime admission, Product integration, host confinement or atomic publication claim',
  'GC-02 Skills and native witnesses remain bound to provider 03245674',
  'Archive embedded draft status is historical; this later local release record does not alter archive bytes',
  'Selected formal gates and unqualified composition evidence remain unsupported as described in the archived design']}
encoded=(json.dumps(record,sort_keys=True,indent=2)+'\n').encode()
safe_write(destination/'release-installation.json',encoded)
safe_write(carrier/'gc03-local-release-installation.json',encoded)
print(json.dumps({'status':record['status'],'identity':release_id,'installedRoot':str(destination),'archiveSha256':expected,'installedMembers':len(files),'recordSha256':sha(encoded),'providerCalls':0}))
