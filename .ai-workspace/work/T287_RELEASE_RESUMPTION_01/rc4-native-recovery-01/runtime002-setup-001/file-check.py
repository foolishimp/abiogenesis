#!/usr/bin/env python3
"""File-only setup packet readiness; no Product imports or execution."""
from pathlib import Path
import json,hashlib,subprocess,sys
P=Path(__file__).resolve().parent

def load(p):return json.loads(p.read_text())
def pin(p):
 h=hashlib.sha256();size=0
 with p.open('rb') as f:
  while b:=f.read(1048576):h.update(b);size+=len(b)
 return {'path':str(p),'bytes':size,'sha256':h.hexdigest()}
c=load(P/'setup-config.json');s=load(P/'SOURCE_BINDINGS.json');w=Path(c['worksiteRoot'])
assert not Path(c['runtimeRoot']).exists()
assert subprocess.check_output(['git','-C',str(w),'rev-parse','HEAD'],text=True).strip()==c['sourceCommit']
assert subprocess.check_output(['git','-C',str(w),'rev-parse','HEAD^{tree}'],text=True).strip()==c['sourceTree']
assert not subprocess.check_output(['git','-C',str(w),'status','--short','--untracked-files=no'])
for key in ['builderRecord','builderArchive','installedManifest','installedCli','payloadCorrespondence','installation','workspaceManifest','originalSetupHelper','originalSetupRecipe','partialCustody','nativeSourcePreimage']:
 assert pin(Path(s[key]['path']))==s[key],key
for r in s['operatorReferences']:assert pin(Path(r['path']))==r
m=load(Path(s['workspaceManifest']['path']));assert m['canonicalRoot']==str(w);assert c['workspaceAcquisition']=={'kind':'open','expectedAuthority':{'ref':m['authorityBasis']['authorityRef'],'digest':m['authorityBasis']['authorityDigest']}}
assert c['toolchainEnvironment']['TMPDIR']=='/private/tmp/abiogenesis-rc4-runtime-01' and 'NPM_CONFIG_CACHE' not in c['toolchainEnvironment'];assert not c['provider']['enabled'];assert c['provider']['maxTurns']==256 and c['provider']['maxBudgetUsd'] is None
inventory=load(Path(s['payloadCorrespondence']['path']));assert inventory['members']==5321
for r in inventory['inventory']:
 p=Path(c['bootstrapRoot'])/r['path'];assert not p.is_symlink();row=pin(p);assert row['bytes']==r['bytes'] and row['sha256']==r['digest'].removeprefix('sha256:'),str(p)
for name in ['public-setup.mjs','prepare-runtime.mjs']:
 result=subprocess.run([c['nodePath'],'--check',str(P/name)],capture_output=True,text=True);assert result.returncode==0,result.stderr
b=P/'SETUP_BINDING.json'
if b.exists():
 for r in load(b)['files']:assert pin(Path(r['path']))==r,r['path']
print(json.dumps({'status':'FILE_ONLY_SETUP_READY','sourceCommit':c['sourceCommit'],'sourceStanding':'unfinished partial6937, not fixed candidate','runtimeRootAbsent':True,'workspaceAcquisition':'existing owner.open; manifest preserved','workspaceManifest':s['workspaceManifest'],'payloadMembersVerified':5321,'syntaxChecked':['public-setup.mjs','prepare-runtime.mjs'],'PublicRuntimeProviderInstallBuildCalls':0,'limit':'Actual owner open/install/bind/catalog/conformance and returned handoff remain unexecuted; Root setup selection required.'}))
