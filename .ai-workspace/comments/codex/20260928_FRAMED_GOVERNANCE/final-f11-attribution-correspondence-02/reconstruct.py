#!/usr/bin/env python3
"""Independent literal unified-hunk reconstruction; writes only this cut."""
import base64, hashlib, json, pathlib, re, time
O=pathlib.Path(__file__).resolve().parent
read=lambda p:json.loads((O/p).read_text())
records=read('original-record-materials.json')['records']+read('derived-record-materials.json')['records']
byref={m['ref']:m for m in records}
body=lambda m:base64.b64decode(m['contentBase64'],validate=True)
digest=lambda b:'sha256:'+hashlib.sha256(b).hexdigest()
ops=read('operation-inputs.json')['operations']

def reconstruct(patch,path,prior):
    lines=patch.decode().splitlines(keepends=True)
    before=prior.decode().splitlines(keepends=True)
    assert ''.join(before).encode()==prior
    starts=[i for i,l in enumerate(lines) if l.startswith('--- ') and i+1<len(lines) and lines[i+1].startswith('+++ ')]
    found=[]
    for j,i in enumerate(starts):
        target=lines[i+1][4:].split('\t')[0].rstrip('\r\n')
        if target in ['b/'+path,'after/'+path,path]:found.append((i,starts[j+1] if j+1<len(starts) else len(lines)))
    assert len(found)==1,(path,found)
    lo,hi=found[0];out=[];cursor=0;hunks=0;i=lo+2
    while i<hi:
        h=re.match(r'^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@',lines[i])
        if not h:i+=1;continue
        oldstart,oldcount,newstart,newcount=int(h[1]),int(h[2] or 1),int(h[3]),int(h[4] or 1)
        target=oldstart-1 if oldcount else oldstart
        assert target>=cursor;out.extend(before[cursor:target]);cursor=target
        assert len(out)==(newstart-1 if newcount else newstart)
        i+=1;oldseen=newseen=0;hunks+=1
        while i<hi and oldseen<oldcount or (i<hi and newseen<newcount):
            line=lines[i];assert line[:1] in [' ','+','-'],(path,line)
            marker=line[0];value=line[1:];i+=1
            if i<hi and lines[i].startswith('\\ No newline at end of file'):
                assert value.endswith('\n');value=value[:-1];i+=1
            if marker in [' ','-']:
                assert cursor<len(before) and before[cursor]==value,(path,hunks,cursor)
                cursor+=1;oldseen+=1
            if marker in [' ','+']:out.append(value);newseen+=1
        assert oldseen==oldcount and newseen==newcount
    assert hunks>0;out.extend(before[cursor:]);return ''.join(out).encode(),hunks

results=[];started=time.monotonic()
for op in ops:
    old,view=op['originalChain'],op['candidateChain']
    original_patch=body(byref[old['deltaRef']]);view_patch=body(byref[view['deltaRef']])
    for change in view['changes']:
        pre=body(byref[change['preimageMemberRef']]);post=body(byref[change['postimageMemberRef']]);path=change['patchPath']
        from_original,hunks=reconstruct(original_patch,path,pre)
        from_view,view_hunks=reconstruct(view_patch,path,pre)
        assert from_original==post==from_view and hunks==view_hunks
        target=O/'reconstructed'/op['operation']/path
        target.parent.mkdir(parents=True,exist_ok=True)
        with target.open('xb') as f:f.write(from_view)
        results.append({'operation':op['operation'],'memberRef':change['memberRef'],'patchPath':path,
          'preimageRef':change['preimageMemberRef'],'preimageDigest':digest(pre),
          'originalPatchRef':old['deltaRef'],'originalPatchDigest':digest(original_patch),
          'viewPatchRef':view['deltaRef'],'viewPatchDigest':digest(view_patch),
          'postimageRef':change['postimageMemberRef'],'postimageDigest':digest(post),'postimageBytes':len(post),
          'reconstructedPath':str(target.relative_to(O)),'hunks':hunks,
          'originalReconstructsPostimage':True,'viewReconstructsSamePostimage':True})
assert len(results)==11
with (O/'endpoint-reconstruction.json').open('x') as f:json.dump({'status':'all_eleven_endpoints_reconstructed_at_their_separate_operation_cuts','checks':results,'elapsedSeconds':time.monotonic()-started,'limits':'Independent byte reconstruction only; no original source edits, historical event admission, author sufficiency or successor applicability inferred.'},f,indent=2);f.write('\n')
print(json.dumps({'endpointCount':len(results),'equalOriginalAndViewReconstructions':True,'successorBinding':None}))
