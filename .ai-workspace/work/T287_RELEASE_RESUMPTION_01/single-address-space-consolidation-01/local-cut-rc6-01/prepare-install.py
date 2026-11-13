"""Bind the reviewed source and byte-equal archive to existing local install owners."""
from pathlib import Path
import datetime,hashlib,json,subprocess
D=Path(__file__).resolve().parent;X=D.parent;W=Path('/Users/jim/src/apps/abiogenesis-rc6-local-cut');T='build_tenants/abiogenesis/typescript'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def row(p):return {'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p)}
def save(p,v):
 with p.open('x') as f:f.write(json.dumps(v,indent=2)+'\n')
def text(p,s):
 with p.open('x') as f:f.write(s)
c=json.loads((D/'SOURCE_CHECKPOINT.json').read_text());repro=json.loads((D/'reproduction/RESULT.json').read_text());review=json.loads((D/'INDEPENDENT_LOCAL_CUT_REVIEW.json').read_text())
assert repro['status']=='BYTE_EQUAL' and repro['sourceCommit']==c['sourceCommit']
assert review['verdict']=='satisfied' and review['sourceCommit']==c['sourceCommit']
archive=Path(c['archive']['path']);assert row(archive)==c['archive'];assert repro['archive']['sha256']==sha(archive)
release=Path('/Users/jim/Library/Application Support/ABIogenesis/releases/5.0.0-rc.6');install=Path('/Users/jim/Library/Application Support/ABIogenesis/installs/5.0.0-rc.6')
assert not release.exists() and not install.exists()
assert subprocess.check_output(['git','-C',str(W),'rev-parse','HEAD'],text=True).strip()==c['sourceCommit']
for args in [['diff','--quiet'],['diff','--cached','--quiet']]:subprocess.run(['git','-C',str(W),*args],check=True)
js="import{readFile}from'node:fs/promises';import{pathToFileURL}from'node:url';const t=process.argv[1];const p=await import(pathToFileURL(t+'/build/code/src/product/index.js'));const m=JSON.parse(await readFile(t+'/product-toolchain-manifest.json','utf8'));console.log(JSON.stringify({packageName:m.packageName,packageVersion:m.packageVersion,productId:m.productId,manifestDigest:p.sha256Canonical(m),productContentDigest:m.productContentDigest}));"
expected=json.loads(subprocess.check_output(['/opt/homebrew/bin/node','--input-type=module','-e',js,str(W/T)],text=True));expected.update(artifactDigest='sha256:'+sha(archive),sourceCommit=c['sourceCommit'])
assert expected['packageVersion']=='5.0.0-rc.6'
bridge=json.loads((D/'ARTIFACT_IDENTITY_BRIDGE.json').read_text())
claim='Local unqualified RC6 development candidate: frozen single-address-space successor, bounded accepted IR01/IR02 refactor, mechanical release identity and reproducible Product-owner installation. No stable release or complete workflow performance claim.'
limits=[
 'Bounded IR01/IR02 T1-T5 acceptance is retained from proof10; no native Run or RC5-labelled proof artifact is relabelled as an RC6 qualification result.',
 'Actual09 remains77pass/8fail/75skip. Proof10 actual12/0/0 closes only its whole-path missing-baseline gap; revision4/1/2 and consumer59/0/73, old floor and excluded arms retain their standing.',
 'N9-RETAINED-FIXTURE-01 remains open before dependent D2 or qualification claims; broader R1-R7/C1-C5 and full new-source workflow performance are open.',
 'Initial cold authentication, launch and between-task latency are not declared eliminated. Proof10 timings describe installed RC5 orchestration.',
 'Same-family independent review; no clean-family, fifteen-family, F11/sole AF22, GC03 or complete S01/S02/S03/S06 qualification.',
 'Local source branch remains unmerged/unpushed. No tag, publication, global selector or stable-release acceptance.',
 'Product S07 qualification/release remains prospective; this local preview cannot retroactively authorize a published cut. All earlier cuts and failures remain preserved.'
]
text(D/'BOUNDED_CANDIDATE_CLAIM.md','# Local unqualified RC6 candidate\n\n'+claim+'\n\nSource: `'+c['sourceCommit']+'`. Archive: `'+expected['artifactDigest']+'`.\n\nThe immutable source claim and separate source/artifact evidence map define the exact limits.\n')
text(D/'RESIDUALS.md','# Retained limits and failures\n\n'+'\n'.join('- '+v for v in limits)+'\n')
text(D/'ROOT_AUTHORITY.md','# Exact local RC6 installation authority\n\nThe owner instructed "lets move to RC6" after targeted-refactor acceptance. The separately bound operator Writer prepared the exact source checkpoint, byte-equal clean reproduction and independent packaging review. Root conjoins these bounded results and selects this exact archive for local custody and installation through the existing Product owners.\n\nExisting release/install roots refuse. No additional implementation, provider/native Run, qualification rerun, old-cut mutation, publication, tag, push, merge or global selector change is granted.\n')
evidence=[D/'WRITER_ACTIVATION.json',D/'SOURCE_PREPARED.json',D/'SOURCE_CHECKPOINT.json',D/'ARTIFACT_IDENTITY_BRIDGE.json',D/'candidate/RESULT.json',D/'reproduction/RESULT.json',D/'INDEPENDENT_LOCAL_CUT_REVIEW.json',W/'.ai-workspace/work/T287_RC6_LOCAL_EVIDENCE_01/INDEX.json',W/'.ai-workspace/work/T287_RC6_LOCAL_EVIDENCE_01/proof-10/ROOT_CONJUNCTION.json']
mapping={'kind':'rc6_source_artifact_evidence_map','sourceCommit':c['sourceCommit'],'sourceTree':c['sourceTree'],'expected':expected,'archive':row(archive),'archiveMembers':bridge['members'],'artifactIdentityBridge':bridge,'evidence':[row(p) for p in evidence],'limits':limits,'qualification':False}
save(D/'SOURCE_ARTIFACT_EVIDENCE_MAP.json',mapping)
tools=[]
for name,path in [('node','/opt/homebrew/bin/node'),('npm','/opt/homebrew/bin/npm'),('tar','/usr/bin/tar')]:
 real=Path(path).resolve();r=row(real);r.pop('path');tools.append({'name':name,'configuredPath':path,'realPath':str(real),**r})
files=evidence+[D/p for p in ['install-local-rc6.mjs','BOUNDED_CANDIDATE_CLAIM.md','RESIDUALS.md','ROOT_AUTHORITY.md','SOURCE_ARTIFACT_EVIDENCE_MAP.json']]
m={'status':'ROOT_SELECTED_LOCAL_CANDIDATE_INSTALL_ONLY','selectedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'worksiteRoot':str(W),'sourceTree':c['sourceTree'],'expected':expected,'archive':row(archive),'archiveMembers':bridge['members'],'releaseRoot':str(release),'installHost':str(install),'installPath':'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin','tools':tools,'files':[row(p) for p in files],'claim':claim,'limits':limits,'effectGrant':['Fresh local release custody and actual Product-owner installation','Exact all-member byte comparison and receipts'],'failurePolicy':'Preserve partial allocation and receipts; refuse existing roots; no automatic overwrite/removal/retry.'}
save(D/'INPUT_MANIFEST.json',m)
print(json.dumps({'status':m['status'],'manifestSha256':sha(D/'INPUT_MANIFEST.json'),'sourceCommit':c['sourceCommit'],'expected':expected,'archiveMembers':bridge['members']}))
