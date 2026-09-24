from pathlib import Path
import hashlib,json,subprocess
A=Path('/Users/jim/src/apps/abiogenesis');G=Path('/Users/jim/src/apps/odd_glc');CP=Path('.ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/successor-12');H=G/'.ai-workspace/comments/codex/20260924_HELLO_PROJECT_BASELINE';C=A/'.ai-workspace/comments/codex/20260923_COMPOSITE_READINESS/compiled-14'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,v):p.write_text(json.dumps(v,indent=2)+'\n')
p=G/'.ai-workspace/tickets/active/T-043-deliver-generic-live-llm-scenario-mvp.md';p.write_text(p.read_text().replace('build_tenants/odd_glc/typescript/design/ODD_GLC_NATIVE_INTENT_ASSET_TRANSITION.md','build_tenants/common/design/ODD_GLC_NATIVE_INTENT_ASSET_TRANSITION.md'))
for rel in ['build_tenants/odd_glc/typescript/test/full-sandbox.test.mjs','build_tenants/common/design/ODD_GLC_NATIVE_INTENT_ASSET_TRANSITION.md']:assert (G/rel).is_file(),rel
tr=json.loads((G/CP/'tracking-projection.json').read_text());tr['files'][1]['postimageSha256']=sha(p);write(G/CP/'tracking-projection.json',tr)
subject=json.loads((H/'core13-05/source-subject.json').read_text());retained=json.loads((H/'core13-03/retained-c2-continuation.json').read_text());actorRoot=Path(retained['runRoot'])/'abi-authority/archive'
actors=[]
for prefix,phase,stdoutsha,transportsha,duration,api,cost,tokens,ids in [
 ('fp-ef1a8329e1e71ee1','C1 construction','3e9a89739a5220e0ac18aececaaa39765d21113fa736d0b2511d24628bd89a95','f2d0cc47ddbebdb46bb5b7e881b4398ae9ca35efb4da9f6e1fb3514c9caca15c',19490,17065,0.22266,[2,6822,0,1724],['msg_011CfMNBBbeywVGxwanqQAgK']),
 ('fp-fe11e2cf0995a3c5','C2 execution','9b7abeb2e45ea0bce677bd1802cd19b55d64638395e4a0a4395b68372fb8f587','224482d995358ed73197b37e38e27f72e5023fc81e718cd0cf44bf58aacbe44b',29555,23106,0.69498825,[34,31929,31073,966],['msg_011CfMNxosEgM8FrJa1SzKTX','msg_011CfMNzFnjFM6pLG5CLQbr9'])]:
 actors.append({'phase':phase,'stdoutPath':str(actorRoot/(prefix+'-stdout.log')),'stdoutSha256':stdoutsha,'transportPath':str(actorRoot/(prefix+'-transport.json')),'transportSha256':transportsha,'durationMs':duration,'durationApiMs':api,'reportedCostUsd':cost,'tokens':dict(zip(['input','cacheCreationInput','cacheReadInput','output'],tokens)),'providerMessageIds':ids,'apiRetryCount':0})
write(G/CP/'actor-evidence.json',{'status':'CLOSED read-only provider evidence check','journal':{'path':str(actorRoot.parent/'events/runtime.events.jsonl'),'bytes':5819027,'sha256':'2409e468e608703ef66729cda6c60435de71a5a3eb1114e5ea50025ba0be8b57','events':939,'actorInvocationStarts':2,'actorProcessStarts':2,'actorInvocationCloses':2},'command':'/Users/jim/.local/bin/claude','effort':'medium','modelRecorded':'claude-fable-5-1','providerRecorded':'firstParty','claudeCodeVersion':'2.1.280','controlledSubstitute':False,'actors':actors,'totalReportedCostUsd':0.91764825,'costMeaning':'CLI reported list-cost; actual billing unknown.','providerWork':'C1 StructuredOutput supplies three file bodies. C2 Bash invocation runs installed worksite_command_helper and returns the typed helper artifact.','scope':'Real generic-live ABI C1/C2 supporting proof; not the required complete odd_glc fresh full-source sandbox. Later 1.5s figures measure only Public readback.'})
pending=['All pending NATIVE_FULL_HELLO_FRESH_START_IMPLEMENTATION source/HOW/tests and evidence: excluded, no source acceptance/package/paid launch claim','The five remaining reduced Hello cases: not launched; retention syntax only, new actual setup-record validation pending','Original/S02/Data Mapper resources, active/live journals, locks, worksite files, active installs/node_modules and scratch: excluded','Duplicated setup call+receipt trees and unrelated historical untracked outputs: preserved locally, not staged','Q07 prepared/incomplete; operator-stop installed readback and qualification/RC1 remain open']
scope='Accepted replay source/test, compiled14 construction, helper contract/retention repairs, four current trackers and finite closed basic-cli C1/C2/readback evidence. Full odd_glc fresh-source sandbox remains required; new source implementation is a separate excluded Worker activation.'
for root,ticket,base in [(A,'T-287-deliver-abiogenesis-5-feature-waves.md','c6f6cd257f531843251a3db42971409b4a908d74'),(G,'T-043-deliver-generic-live-llm-scenario-mvp.md','b6cc652e80e4a2efa4ccb2f20107d3cc50fafccc')]:
 assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()==base
 assert not subprocess.check_output(['git','diff','--cached','--name-only'],cwd=root,text=True).strip()
 cp=root/CP;direct={};rels=[Path('specification/GOALS.md'),Path('.ai-workspace/tickets/active')/ticket]
 if root==A:
  for r in subject['source']:
   p=Path(r['path']);assert sha(p)==r['postSha256'];rels.append(p.relative_to(A))
  for r in json.loads((C/'generated-delta.json').read_text()):
   if r['path'].startswith('build/'):continue
   p=A/'build_tenants/abiogenesis/typescript'/r['path'];assert sha(p)==r['after']['sha256'];rels.append(p.relative_to(A))
 else:
  p=G/'build_tenants/odd_glc/typescript/test/generic-live-workflow-support.mjs';assert sha(p)=='8216dd9411235657d98206449611f38673e51323ef1ee2b692afc450e30281d7';rels.append(p.relative_to(G))
 for rel in rels:
  p=root/rel;direct[str(rel)]={'sha256':sha(p),'byteLength':p.stat().st_size,'proof':'Root accepted finite source/generated selection or current Writer tracking projection'}
 evidence=set()
 if root==A:
  evidence.update(p for p in C.iterdir() if p.is_file());evidence.update((C/'artifacts').iterdir())
 else:
  for name in ['core13-01','core13-02','core13-03','core13-04','core13-05','core14-readback-01','core14-readback-02','core14-readback-03','core14-remaining-01']:
   evidence.update(p for p in (H/name).iterdir() if p.is_file())
  evidence.update(Path(retained[k]) for k in ['successfulC1Call','successfulC1Receipt','successfulC1ResultReadCall','successfulC1ResultReadReceipt','failedC2Call','failedC2Receipt'])
  evidence.add(H/'core13-04/continuation/c2-execution-definition-call.json');evidence.add(actorRoot.parent/'events/runtime.events.jsonl')
  assert sha(actorRoot.parent/'events/runtime.events.jsonl')=='2409e468e608703ef66729cda6c60435de71a5a3eb1114e5ea50025ba0be8b57'
  for prefix in ['fp-ef1a8329e1e71ee1','fp-fe11e2cf0995a3c5']:
   for suffix in ['transport.json','stdout.log','stderr.log','prompt.txt','output.txt']:evidence.add(actorRoot/(prefix+'-'+suffix))
  for name in ['core13-01','core13-02','core13-03','core14-remaining-01']:
   frozen=H/name/'frozen-test'
   if frozen.is_dir():
    for p in frozen.rglob('*'):
     if p.is_file():assert 'node_modules' not in p.parts;evidence.add(p)
 for name in ['successor-11-return.md','successor-11-paired-post-push.json']:
  p=root/CP.parent/name
  if p.is_file():evidence.add(p)
 adjoining=[]
 for p in sorted(evidence):
  assert p.is_file(),p;assert 'node_modules' not in p.parts;adjoining.append({'path':str(p),'sha256':sha(p)})
 write(cp/'activation.json',{'role':'Writer','model':'gpt-6-astra','effort':'max','basisCommit':base,'authority':'Root authorized bounded current-tracking and paired checkpoint/push; no implementation or execution grant here.','currentDeliveryActivation':'NATIVE_FULL_HELLO_FRESH_START_IMPLEMENTATION','sourceSubject':subject['subjectSha256'],'scope':scope})
 write(cp/'root-disposition.json',{'status':'accepted_source_readiness_and_bounded_installed_basic_cli_proof','replaySourceSubject':subject['subjectSha256'],'compiled14ReturnSha256':sha(C/'return.md'),'basicCliReadbackReturnSha256':sha(H/'core14-readback-03/return.md'),'retentionPostimage':'8216dd9411235657d98206449611f38673e51323ef1ee2b692afc450e30281d7','retentionActualNewRecordValidation':'pending; no remaining case launched','fullSandbox':'required; separate source/HOW implementation only, not accepted or packaged or launched','scope':scope,'exclusions':pending})
 write(cp/'selection.json',{'closedProofSelections':[],'adjoiningClosedPosts':adjoining,'directExpected':direct,'pending':pending,'scope':scope})
 for name in ['prepare_incremental.py','pack_incremental.py','stage_checkpoint.py']:
  script=(A/CP.parent/'successor-11'/name).read_text().replace("successor-11'","successor-12'").replace("previous=root.parent/'successor-10'","previous=root.parent/'successor-11'").replace('successor11-','successor12-')
  if name=='stage_checkpoint.py':
   script=script.replace('successor-10/composition.json','successor-11/composition.json').replace('WIP successor-11:','WIP successor-12:')
   start=script.index("(root/'README.md').write_text(");end=script.index('\nselected=set(direct)',start)
   doc='# Accepted supporting proof checkpoint successor-12\n\n'+scope+'\n\nPrior successor-11 banks are reused unchanged. New transport-01 retains only the exact selected closed evidence members; its verification restores and hash-compares each member. Only exact transport-backed original paths receive ignore entries. No full active directory is staged.\n\nThe closed basic-cli journal and provider artifacts are historical proof carried once in the GLC bank, not a live resource grant. C1/C2 executed on core13; core14 supplies corrected fresh Public readback. Two real Claude calls are documented in the GLC actor-evidence.json. This does not close the actual full odd_glc sandbox or RC1.\n\nRestoration uses the existing successor-01/checkpoint_transport.py restore command with this checkpoint transport-01 and an empty destination. selection-final.json records direct canonical files and bank identities; publication-receipt.json identifies this one nonforce main checkpoint. Exact pushed commit IDs are retained in the paired external post-push receipt.\n'
   script=script[:start]+"(root/'README.md').write_text("+repr(doc)+")"+script[end:]
  (cp/name).write_text(script)
 print(json.dumps({'repo':root.name,'direct':len(direct),'finiteEvidence':len(adjoining)}))
