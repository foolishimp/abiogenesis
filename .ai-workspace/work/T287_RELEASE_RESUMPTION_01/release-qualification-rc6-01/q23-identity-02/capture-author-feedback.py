"""Freeze explicit native-author reports only after the native source return. No Product edits."""
from pathlib import Path
import json,hashlib,shutil
from datetime import datetime,timezone
q=Path(__file__).resolve().parent
subject=q/'review-subject-001/SUBJECT.json'
assert subject.is_file(),'Exact native source freeze required first'
src=Path('/Users/jim/src/apps/abiogenesis-rc6-local-cut/qualification-scratch/q23-identity-02/tmp')
out=q/'author-feedback-001';assert not out.exists();out.mkdir()
pin=lambda p:{'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
files=list(src.glob('*-stage.json'))+list(src.glob('*-lanes.out'))+list(src.glob('*-stage.out'))
for d in src.glob('*-lanes'):
 if d.is_dir():files += [d/n for n in ['summary.json','transport.stdout.tap','transport.stderr.log','qualification.stdout.tap','qualification.stderr.log'] if (d/n).is_file()]
records=[]
for f in sorted(files):
 assert f.is_file() and not f.is_symlink();rel=f.relative_to(src);dest=out/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(f,dest)
 a=pin(f);b=pin(dest);assert a['sha256']==b['sha256'];records.append({'source':a,'snapshot':b})
v={'kind':'root_preserved_native_author_feedback','at':datetime.now(timezone.utc).isoformat(),'sourceSubject':pin(subject),'reports':records,'standing':'Author readiness feedback only, including failed and successful stages. Not native C2/UAT/qualification acceptance. No dependency trees, native provider history or authentication material acquired.'}
(q/'AUTHOR_FEEDBACK_CUSTODY.json').write_text(json.dumps(v,indent=2)+'\n');print(json.dumps({'status':'AUTHOR_FEEDBACK_PRESERVED','files':len(records),'receipt':str(q/'AUTHOR_FEEDBACK_CUSTODY.json')}))
