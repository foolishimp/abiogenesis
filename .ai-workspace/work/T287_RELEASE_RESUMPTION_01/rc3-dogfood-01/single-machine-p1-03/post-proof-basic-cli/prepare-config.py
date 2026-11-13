#!/usr/bin/env python3
"""Thin frozen-scenario config retarget only; no import/install/Public/provider/run."""
import hashlib,json,pathlib,sys,os
P=pathlib.Path(__file__).resolve().parent
if len(sys.argv)!=3:raise SystemExit('usage: prepare-config.py ROOT_SELECTION_JSON SHA256_HEX')
raw=pathlib.Path(sys.argv[1]).read_bytes();assert hashlib.sha256(raw).hexdigest()==sys.argv[2];s=json.loads(raw);assert s['kind']=='p1_03_root_selected_new_basic_cli_artifact' and s['status']=='ROOT_SELECTED_ONE_NEW_BASIC_CLI_RUN';assert s['sourceSubject'] and s['actualTestingProducer'] and s['rootAuthority']
def check(r):
 p=pathlib.Path(r['path']);assert p.is_file() and not p.is_symlink(),str(p);b=p.read_bytes();assert len(b)==r['bytes'] and hashlib.sha256(b).hexdigest()==r['sha256'],str(p);return b
for r in s['originalBasis']+s['fixturePins']+s['runnerPins']:check(r)
check(s['rootAuthority']);check(s['artifact'])
for r in s['executables'].values():assert os.path.realpath(r['configuredPath'])==r['realPath'];check({'path':r['realPath'],'bytes':r['bytes'],'sha256':r['sha256']})
old=json.loads(check(s['originalBasis'][1]));assert pathlib.Path(s['outputRoot']).resolve()==P;assert s['archiveRoot']==str(P/'runs');assert not pathlib.Path(s['archiveRoot']).exists();old['package']={'archivePath':s['artifact']['path'],'sha256':'sha256:'+s['artifact']['sha256']};old['sourceCommit']=s['sourceSubject'];old['archiveRoot']=s['archiveRoot']
# Retain exact accepted fixture/profile/Program/bound/tool environment; only candidate+fresh output identity changes.
out=P/'config.json'
with out.open('x') as f:json.dump(old,f,indent=2);f.write('\n')
print(json.dumps({'status':'config_prepared_not_run','path':str(out),'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'publicCalls':0,'providerCalls':0,'next':'Root reviews exact config/selection and runs the existing sandbox-uat harness once'}))
