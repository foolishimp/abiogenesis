import base64, hashlib, json, stat, tarfile, time, traceback
from pathlib import PurePosixPath
from common import ROOT, WORK, TENANT, digest, inventory, row, write

started = time.monotonic()
assert not (WORK / 'first-cause.json').exists()
write('commands/archive-correspondence.request.json', {'scriptSha256':digest(WORK/'verify-archive.py'),
      'scope':'Read actual tar members and staged bytes; no extraction, installation or workload'})
try:
    assert json.loads((WORK/'commands/pack.result.json').read_text())['exitCode'] == 0
    packs = json.loads((WORK/'commands/pack.stdout').read_text())
    assert len(packs)==1
    packed = packs[0]
    archive_path = WORK/'artifacts'/packed['filename']
    raw=archive_path.read_bytes()
    assert len(raw)==packed['size']
    assert hashlib.sha1(raw).hexdigest()==packed['shasum']
    assert 'sha512-'+base64.b64encode(hashlib.sha512(raw).digest()).decode()==packed['integrity']
    stage=WORK/'stage'/TENANT
    npm_members={r['path']:r for r in packed['files']}
    members=[]; contents={}
    with tarfile.open(archive_path,'r:gz') as tar:
        for entry in tar.getmembers():
            assert entry.isfile() and entry.name.startswith('package/')
            path=entry.name[len('package/'):]
            assert path and not PurePosixPath(path).is_absolute() and '..' not in PurePosixPath(path).parts
            assert path not in contents
            data=tar.extractfile(entry).read()
            contents[path]=data
            actual=stage/path
            assert data==actual.read_bytes(),path
            mode=stat.S_IMODE(actual.stat().st_mode)
            assert entry.mode==mode==npm_members[path]['mode'],path
            assert len(data)==entry.size==npm_members[path]['size']
            members.append({'path':path,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),
                            'mode':oct(entry.mode),'stage_mode':oct(mode)})
    assert set(contents)==set(npm_members)
    assert len(members)==packed['entryCount'] and sum(r['bytes'] for r in members)==packed['unpackedSize']
    manifest=json.loads(contents['product-toolchain-manifest.json'])
    graph='contracts/capabilities/capability-definition-graph.json'
    assert set(contents)==set(manifest['productRelativeLocators'])|{'product-toolchain-manifest.json',graph}
    assert not any(p.startswith('test_env/') for p in contents)
    assert inventory(WORK/'stage')==json.loads((WORK/'stage-post-generation-inventory.json').read_text())['files']
    archive_row=row(archive_path,archive_path.relative_to(ROOT))
    write('archive-members.json', {'archive':archive_row,'npm_integrity':packed['integrity'],'npm_shasum':packed['shasum'],
          'files':members,'mode_normalizations':[],'all_bytes_match_stage':True})
    rows=[{'path':p,'sha256':'sha256:'+hashlib.sha256(contents[p]).hexdigest()} for p in manifest['productRelativeLocators']]
    write('archive-payload-owner-input.json', {'kind':'evidence_input_for_existing_Product_payloadInventoryDigest',
          'rows':rows,'expectedProductContentDigest':manifest['productContentDigest'],
          'graphByteDigest':manifest['capabilityDefinitionGraph']['assetLocator']['contentDigest'],
          'actualGraphByteDigest':'sha256:'+hashlib.sha256(contents[graph]).hexdigest(),
          'manifestByteSha256':hashlib.sha256(contents['product-toolchain-manifest.json']).hexdigest()})
    write('package-source-correspondence.json', {'archive':archive_row,'package_name':packed['name'],'package_version':packed['version'],
          'entry_count':len(members),'unpacked_bytes':packed['unpackedSize'],'npm_integrity':packed['integrity'],'npm_shasum':packed['shasum'],
          'all_archive_member_bytes_match_stage':True,'all_archive_modes_match_npm_projection':True,'mode_normalizations':[],
          'stage_unchanged_by_pack':True,'proof_support_excluded_from_payload':True,'payload_rows':len(rows),
          'payload_owner_check':'pending commands/payload.result.json',
          'manifest':row(stage/'product-toolchain-manifest.json',TENANT/'product-toolchain-manifest.json')})
    write('commands/archive-correspondence.result.json', {'exitCode':0,'wallMs':(time.monotonic()-started)*1000,
          'archive':archive_row,'members':len(members),'payloadRows':len(rows)})
    print(json.dumps({'status':'satisfied','archive':archive_row,'members':len(members),'payloadRows':len(rows)}),flush=True)
except BaseException:
    write('first-cause.json',{'kind':'archive_correspondence_failure','traceback':traceback.format_exc(),'disposition':'Stopped without repair/retry'})
    raise
