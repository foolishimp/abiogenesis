#!/usr/bin/env python3
"""Freeze this selected local acquisition superset, not a dependency resolver."""
import hashlib,json,os,shutil,stat,sys,zipfile
from pathlib import Path
sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent
ACT=json.loads((HERE/'ACTIVATION.json').read_text())
RAW=Path(ACT['rawRoot'])
def sha(path):
 h=hashlib.sha256()
 with Path(path).open('rb') as f:
  for b in iter(lambda:f.read(8388608),b''):h.update(b)
 return h.hexdigest()
def write(path,value):
 with Path(path).open('x') as f:json.dump(value,f,indent=2);f.write('\n')
def inventory(root):
 root=Path(root);rows=[]
 for parent,dirs,files in os.walk(root,followlinks=False):
  for name in sorted(dirs+files):
   p=Path(parent)/name;relative=str(p.relative_to(root));s=p.lstat()
   if p.is_symlink():
    target=os.readlink(p);assert p.resolve().is_relative_to(root.resolve()),relative
    rows.append({'path':relative,'kind':'symlink','target':target})
   elif stat.S_ISREG(s.st_mode):rows.append({'path':relative,'kind':'file','mode':stat.S_IMODE(s.st_mode),'bytes':s.st_size,'sha256':sha(p)})
 return sorted(rows,key=lambda x:x['path'])
def main():
 assert not RAW.exists(),'fresh external root; no freeze retry'
 assert shutil.disk_usage(RAW.parent).free>ACT['limits']['reserveBytes']
 accepted=ACT['acceptedS06'];s06=Path(accepted['sourceWorktree'])/accepted['carrier']
 assert sha(s06/'CONTROL_MANIFEST.json')==accepted['manifestSha256']
 assert sha(s06/'INPUTS.json')==accepted['inputsSha256']
 manifest=json.loads((s06/'CONTROL_MANIFEST.json').read_text())
 for r in manifest['controls']:
  p=s06/r['path'];assert p.stat().st_size==r['bytes'] and sha(p)==r['sha256'],r['path']
 inputs=json.loads((s06/'INPUTS.json').read_text());application=inputs['application']
 assert len(application)==22 and sum(r['bytes'] for r in application)==111575
 for r in application:
  p=Path(r['path']);assert p.stat().st_size==r['bytes'] and sha(p)==r['sha256'],r['path']
 RAW.mkdir();frozen=RAW/'frozen';frozen.mkdir();records=[]
 jdk=Path(ACT['inputs']['jdk']);assert sha(jdk/'bin/java')==ACT['inputs']['javaSha256']
 jdk_before=inventory(jdk);shutil.copytree(jdk,frozen/'jdk',symlinks=True)
 assert inventory(frozen/'jdk')==jdk_before and inventory(jdk)==jdk_before
 write(frozen/'JDK_INVENTORY.json',{'source':str(jdk),'rows':jdk_before})
 records.append({'kind':'jdk','path':str(frozen/'jdk'),'inventory':str(frozen/'JDK_INVENTORY.json'),'sha256':sha(frozen/'JDK_INVENTORY.json'),'rows':len(jdk_before)})
 launcher=Path(ACT['inputs']['launcher']);assert launcher.stat().st_size==3822332 and sha(launcher)==ACT['inputs']['launcherSha256']
 shutil.copy2(launcher,frozen/'sbt-launch.jar');assert sha(frozen/'sbt-launch.jar')==ACT['inputs']['launcherSha256']
 boot=Path(ACT['inputs']['boot']);boot_rows=[]
 for selected in ACT['inputs']['bootSelections']:
  for src in sorted((boot/selected).rglob('*.jar')):
   assert not src.is_symlink();relative=str(src.relative_to(boot));dst=frozen/'boot'/relative;dst.parent.mkdir(parents=True,exist_ok=True)
   row={'path':relative,'kind':'file','mode':stat.S_IMODE(src.stat().st_mode),'bytes':src.stat().st_size,'sha256':sha(src)}
   shutil.copy2(src,dst);assert sha(dst)==row['sha256'] and sha(src)==row['sha256'];boot_rows.append(row)
 assert boot_rows;write(frozen/'BOOT_INVENTORY.json',{'source':str(boot),'rows':sorted(boot_rows,key=lambda x:x['path'])})
 records.append({'kind':'boot','path':str(frozen/'boot'),'inventory':str(frozen/'BOOT_INVENTORY.json'),'sha256':sha(frozen/'BOOT_INVENTORY.json'),'rows':len(boot_rows)})
 maven=Path(ACT['inputs']['maven']);maven_rows=[]
 for src in sorted(maven.rglob('*')):
  if not src.is_file() or src.suffix not in ('.jar','.pom') or 'SNAPSHOT' in str(src.relative_to(maven)):continue
  assert not src.is_symlink();relative=str(src.relative_to(maven));dst=frozen/'maven2'/relative;dst.parent.mkdir(parents=True,exist_ok=True)
  row={'path':relative,'kind':'file','mode':stat.S_IMODE(src.stat().st_mode),'bytes':src.stat().st_size,'sha256':sha(src)}
  shutil.copy2(src,dst);assert sha(dst)==row['sha256'] and sha(src)==row['sha256'];maven_rows.append(row)
 write(frozen/'MAVEN_INVENTORY.json',{'source':str(maven),'selection':'Existing non-SNAPSHOT jars and POMs only; acquisition superset, not selected dependency closure','rows':maven_rows})
 records.append({'kind':'maven','path':str(frozen/'maven2'),'inventory':str(frozen/'MAVEN_INVENTORY.json'),'sha256':sha(frozen/'MAVEN_INVENTORY.json'),'rows':len(maven_rows)})
 for row in application:
  dst=frozen/'source'/row['relativePath'];dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(row['path'],dst);assert sha(dst)==row['sha256']
 write(frozen/'APPLICATION_INPUTS.json',{'source':str(s06/'INPUTS.json'),'rows':application})
 with zipfile.ZipFile(frozen/'sbt-launch.jar') as z:boot_properties=z.read('sbt/sbt.boot.properties').decode()
 before,after=boot_properties.split('[repositories]\n',1);_,tail=after.split('[boot]\n',1)
 selected=before+'[repositories]\n  frozen-maven: '+(frozen/'maven2').as_uri()+'/\n\n[boot]\n'+tail
 (frozen/'sbt.boot.properties').write_text(selected)
 (frozen/'repositories').write_text('[repositories]\n  frozen-maven: '+(frozen/'maven2').as_uri()+'/\n')
 result={'activationId':ACT['id'],'toolInputs':records,'launcher':{'path':str(frozen/'sbt-launch.jar'),'sha256':sha(frozen/'sbt-launch.jar')},
  'repositoryConfig':{'path':str(frozen/'repositories'),'sha256':sha(frozen/'repositories')},'bootConfig':{'path':str(frozen/'sbt.boot.properties'),'sha256':sha(frozen/'sbt.boot.properties')},
  'applicationInputs':{'path':str(frozen/'APPLICATION_INPUTS.json'),'sha256':sha(frozen/'APPLICATION_INPUTS.json')},
  'sourceControlCommit':accepted['sourceCommit'],'sourceCachesWritten':False,'runtimeAuthority':False,'actualResolutionPerformed':False}
 write(RAW/'FREEZE_RETURN.json',result);print(json.dumps({'frozen':str(frozen),'jdkRows':len(jdk_before),'bootJars':len(boot_rows),'mavenRows':len(maven_rows),'mavenBytes':sum(r['bytes'] for r in maven_rows),'applicationFiles':22}))
if __name__=='__main__':main()
