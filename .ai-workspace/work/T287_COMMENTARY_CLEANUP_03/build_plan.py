"""Read one copied downstream tree and originals; write only batch03 planning evidence."""
from pathlib import Path
import collections, datetime, errno, hashlib, json, os, stat, struct, time

R = Path('/Users/jim/src/apps/abiogenesis')
W = R / '.ai-workspace/work/T287_COMMENTARY_CLEANUP_03'
E = R / '.ai-workspace/evidence/T287_COMMENTARY_CLEANUP_03'
C = R / '.ai-workspace/comments/codex/20260909_D1_LIFECYCLE/native-implementation/build-input/test_env/downstream'
O = R / 'build_tenants/abiogenesis/typescript/test_env/downstream'
P = C.parent.parent.parent
START = time.monotonic()
TEXT = {'.md','.markdown','.mdx','.txt','.rst','.adoc','.org','.puml','.mmd','.html','.htm','.pdf','.docx','.png','.jpg','.jpeg','.svg','.webp'}
ARCHIVE_EXT = {'.tgz','.tar','.gz','.zip','.xz','.bz2','.7z','.zst','.rar','.lz4','.lz'}
LOG_EXT = {'.log','.out','.err','.stdout','.stderr','.transcript'}
cost = collections.Counter()

def guard(p):
    for q in (p,*p.parents):
        assert not q.is_symlink(), 'symlink root/context component: '+str(q)

def write(name,obj):
    p=E/name;assert not p.exists()
    p.write_text(json.dumps(obj,sort_keys=True,separators=(',',':'))+'\n')

def row_of(s,path,h):
    return {'path':path,'bytes':s.st_size,'sha256':h,'mode':stat.S_IMODE(s.st_mode),'device':s.st_dev,'inode':s.st_ino}

def hashed_at(parent,name,path):
    fd=os.open(name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=parent)
    try:
        a=os.fstat(fd);assert stat.S_ISREG(a.st_mode),path
        h=hashlib.sha256();header=b''
        while True:
            b=os.read(fd,1024*1024)
            if not b:break
            if not header:header=b[:512]
            h.update(b)
        z=os.fstat(fd);current=os.stat(name,dir_fd=parent,follow_symlinks=False)
        fields=lambda s:(s.st_dev,s.st_ino,s.st_size,s.st_mode,s.st_mtime_ns,s.st_ctime_ns,s.st_nlink)
        assert fields(a)==fields(z)==fields(current),'body moved: '+path
        cost['hashReads']+=1;cost['hashReadBytes']+=a.st_size
        return row_of(a,path,h.hexdigest()),header,a
    finally:os.close(fd)

def directory_fd(rootfd,relative):
    fd=os.dup(rootfd)
    try:
        for part in relative.parts:
            assert part not in ('','..')
            nxt=os.open(part,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=fd)
            os.close(fd);fd=nxt
        return fd
    except BaseException:
        os.close(fd);raise

def archive_magic(b):
    return (b.startswith((b'\x1f\x8b',b'PK\x03\x04',b'PK\x05\x06',b'\xfd7zXZ\x00',b'BZh',
                         b'7z\xbc\xaf\x27\x1c',b'Rar!\x1a\x07',b'\x28\xb5\x2f\xfd',b'\x04\x22\x4d\x18',b'LZIP'))
            or b[257:262]==b'ustar')

def pin(p):
    guard(p);fd=os.open(p.parent,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
    try:return hashed_at(fd,p.name,str(p))[0]
    finally:os.close(fd)

guard(C);guard(O)
assert C.is_dir() and O.is_dir()
assert json.loads((W/'activation.json').read_bytes())['operation']=='T287_COMMENTARY_CLEANUP_DOWNSTREAM_PLAN_03'
contexts=[pin(R/'.git/index')]
ib=(R/'.git/index').read_bytes();signature,version,n=struct.unpack('!4sII',ib[:12])
assert signature==b'DIRC' and version==2 and hashlib.sha1(ib[:-20]).digest()==ib[-20:]
tracked=set();off=12
for _ in range(n):
    start=off;flags=struct.unpack('!H',ib[off+60:off+62])[0];assert not flags&0x4000
    off+=62;end=ib.index(0,off);tracked.add(ib[off:end].decode('utf-8','surrogateescape'))
    off=start+((end+1-start+7)//8)*8
for name in ('activation.md','freeze.py','execution.md','candidate.json','source-subject.json','full-source-build-inventory.json','package-build-binding.json'):
    contexts.append(pin(P/name))
subject=json.loads((P/'candidate.json').read_bytes())
assert len(subject['evidence'])==108
assert not any('build-input/test_env/downstream' in x['path'] for x in subject['evidence'])
sources=json.loads((P/'source-subject.json').read_bytes());assert len(sources['subjects'])==21
batch02=json.loads((R/'.ai-workspace/work/T287_COMMENTARY_CLEANUP_02/named-roots.json').read_bytes())
batch02_roots=[R/'.ai-workspace/comments'/v for v in batch02['cacheRoots']]+[R/'.ai-workspace/comments'/batch02['copiedRoot']]
assert not any(C==p or C in p.parents or p in C.parents for p in batch02_roots),'overlapping active batch02 root'

candidates=[];protected=[];originals=[];excluded=[];dirs=[];nonregular=[];counts=collections.Counter();reasons=collections.Counter()
croot=os.open(C,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
oroot=os.open(O,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
croot_stat=os.fstat(croot);oroot_stat=os.fstat(oroot)
try:
    for base,ds,fs in os.walk(C,topdown=True,followlinks=False):
        ds.sort();fs.sort();relative=Path(base).relative_to(C)
        cf=directory_fd(croot,relative)
        try:
            try:of=directory_fd(oroot,relative);origin_reason=None
            except OSError as error:
                if error.errno not in (errno.ENOENT,errno.ENOTDIR,errno.ELOOP):raise
                of=None;origin_reason='missing_nonregular_or_symlink_original_component'
            s=os.fstat(cf);dirs.append({'path':str(relative),'mode':stat.S_IMODE(s.st_mode),'device':s.st_dev,'inode':s.st_ino})
            for name in list(ds):
                s=os.stat(name,dir_fd=cf,follow_symlinks=False)
                if stat.S_ISLNK(s.st_mode):
                    ds.remove(name);nonregular.append({'path':str(relative/name),'kind':'symlink','target':os.readlink(name,dir_fd=cf),'mode':stat.S_IMODE(s.st_mode),'device':s.st_dev,'inode':s.st_ino});counts['links']+=1
            for name in fs:
                rel=str(relative/name);s=os.stat(name,dir_fd=cf,follow_symlinks=False)
                if not stat.S_ISREG(s.st_mode):
                    x={'path':rel,'kind':'symlink' if stat.S_ISLNK(s.st_mode) else 'nonregular','mode':stat.S_IMODE(s.st_mode),'device':s.st_dev,'inode':s.st_ino}
                    if x['kind']=='symlink':x['target']=os.readlink(name,dir_fd=cf)
                    nonregular.append(x);counts[x['kind']]+=1;continue
                counts['regularFiles']+=1;counts['regularBytes']+=s.st_size
                row,header,s=hashed_at(cf,name,rel)
                why=[]
                if Path(name).suffix.lower() in TEXT:why.append('text_visual')
                if str((C/rel).relative_to(R)) in tracked:why.append('Git_tracked')
                if '.git' in Path(rel).parts:why.append('Git_subtree')
                if s.st_nlink!=1:why.append('hardlink')
                if Path(name).suffix.lower() in LOG_EXT or '_logs' in Path(rel).parts or name.lower().startswith(('stdout','stderr')):why.append('log')
                if Path(name).suffix.lower() in ARCHIVE_EXT or archive_magic(header):why.append('archive_including_extensionless')
                if why:
                    row['reasons']=sorted(set(why));protected.append(row);reasons.update(set(why))
                elif of is None:
                    row['classification']='PROTECTED_UNPROVED_COPY';row['reason']=origin_reason;excluded.append(row)
                else:
                    try:os_=os.stat(name,dir_fd=of,follow_symlinks=False)
                    except FileNotFoundError:os_=None
                    if os_ is None or not stat.S_ISREG(os_.st_mode):
                        row['classification']='PROTECTED_UNPROVED_COPY';row['reason']='missing_or_nonregular_original';excluded.append(row)
                    elif os_.st_size!=row['bytes']:
                        row['classification']='PROTECTED_UNPROVED_COPY';row['reason']='different_original_size';excluded.append(row)
                    else:
                        origin,_,_=hashed_at(of,name,rel)
                        if origin['sha256']==row['sha256']:
                            candidates.append(row);originals.append(origin)
                        else:
                            row['classification']='PROTECTED_UNPROVED_COPY';row['reason']='different_original_body';excluded.append(row)
                if counts['regularFiles']%25000==0:
                    print(json.dumps({'stage':'one_copy_mapper_hash','scannedFiles':counts['regularFiles'],'eligibleFiles':len(candidates),'elapsedSeconds':time.monotonic()-START,'hashReadBytes':cost['hashReadBytes']}),flush=True)
            if of is not None:os.close(of)
        finally:os.close(cf)
finally:os.close(croot);os.close(oroot)
for row in contexts:
    assert pin(Path(row['path']))==row,'context movement: '+row['path']
assert len(candidates)==len(originals) and len({x['path'] for x in candidates})==len(candidates)
assert {x['path'] for x in candidates}.isdisjoint(x['path'] for x in protected+excluded)
assert len(candidates)+len(protected)+len(excluded)==counts['regularFiles']
for a,b in zip(candidates,originals):assert (a['path'],a['bytes'],a['sha256'])==(b['path'],b['bytes'],b['sha256'])
write('candidate-files.json',candidates);write('protected-files.json',protected);write('original-witnesses.json',originals)
write('excluded-unproved-files.json',excluded);write('directories.json',dirs);write('nonregulars.json',nonregular);write('context-pins.json',contexts)
plan={'operation':'T287_COMMENTARY_CLEANUP_DOWNSTREAM_PLAN_03','status':'CLOSED_PLAN_ONLY_NO_DELETION','candidateRoot':str(C),'originalRoot':str(O),'rootTuples':{'copy':row_of(croot_stat,'.',None),'original':row_of(oroot_stat,'.',None)},'copyRole':'old private build input; outside108 selected evidence records and21 frozen Source subjects; canonical originals survive','protectedTextVisualExtensions':sorted(TEXT),'archiveExtensions':sorted(ARCHIVE_EXT),'archiveMagicProtection':True,'GitIndexSHA256':contexts[0]['sha256'],'trackedRepositoryPaths':n,'batch02ActualRootsDisjoint':True,'rules':'regular single-link copied bodies only, canonical original no-follow path and byte equality; every protected/unique/missing/link/nonregular object untouched; no deletion authority','futureGuard':'Root independent exact-list review then separate unlink grant; reacquire all tuples/original/protection/context before unlink and preserve current source/accepted/native evidence','limits':['logical bytes are not disk-space gains','historical proof records remain unchanged; any later removals need an external ledger','no Product/Runtime/qualification or cache-independent reproduction claim']}
write('plan.json',plan)
summary={'operation':plan['operation'],'status':plan['status'],'copyCensus':dict(counts),'directoryCount':len(dirs),'candidateFiles':len(candidates),'candidateBytes':sum(x['bytes'] for x in candidates),'protectedFiles':len(protected),'protectedBytes':sum(x['bytes'] for x in protected),'protectedReasons':dict(reasons),'excludedUnprovedFiles':len(excluded),'excludedUnprovedBytes':sum(x['bytes'] for x in excluded),'originalWitnesses':len(originals),'contextPins':len(contexts),'cost':dict(cost),'elapsedSeconds':time.monotonic()-START,'effects':{'commentsWrites':0,'candidateOriginalWrites':0,'deletion':0,'GitCommands':0,'buildTestProductRuntimeNetwork':0,'writesOnly':[str(W),str(E)]}}
write('summary.json',summary);print(json.dumps(summary),flush=True)
