#!/usr/bin/env python3
"""Write a source-backed template; nulls are mandatory native-owner facts."""
import json,hashlib,sys
from pathlib import Path
base=Path(__file__).resolve().parent
if len(sys.argv)!=2:raise SystemExit('usage: make-activation-template.py ABSOLUTE_POLICY_DIRECTORY')
dir=Path(sys.argv[1]);assert dir.is_absolute() and dir==base/'runtime-b09-001/gc03-policy'
policy=json.loads((dir/'gc03-policy.json').read_bytes());h=lambda x:hashlib.sha256(x.read_bytes()).hexdigest()
def r(root,rel):return {'engine':'workspace-regular-file','root':root,'path':rel,'object':None,'sha256':h(base/'governed-context-sources'/root/rel),'selector':None}
def retained(path):return {'engine':'retained-evidence','root':'evidence','path':path,'object':None,'sha256':h(base/path),'selector':None}
role=r('method','ACTIVATION.md');evaluation=r('method','EVALUATION.md');algebra=r('method','AXIOMATIC_CALCULUS.md');delegation=r('authority','GC03_DELEGATION.md');owner=r('abg','specification/PRODUCT.md');definition=r('abg','stdo_abiogenesis.json');task=retained('task.md');rubric=retained('rubric.json')
profile={'id':policy['method_profile']['id'],'sha256':policy['method_profile']['sha256']}
packet={'activation':{'id':None,'revision':'1','configuration':delegation},'frame':{'id':None,'revision':'1','declaration':role,'evaluation':evaluation,'result_algebra':algebra},
 'subject_basis':{'subject':None,'method_profile':profile,'product':{'id':policy['product']['definition_id'],'definition':definition},'observations':None,'dependencies':[definition,delegation],'time_basis':'actual current native occurrence supplied by trusted host'},
 'attention':{'material_relations':[task,rubric],'invariants':[delegation],'semantic_sources':[task,rubric],'exclusions':[],'prohibited_assumptions':['do not replace original task or rubric criteria']},
 'actor_authority':{'actor_id':policy['principals']['constructor']['actor_id'],'role':'Worker','capability':delegation,'semantic':None,'evaluation':evaluation,'operation':delegation,'decision':None,'acceptance':None,'publication':None,'territory':[],'tools':['context.read']},
 'evidence_relations':{'admissible_evidence':[task,rubric],'acquisition':[delegation],'dependencies':[definition,owner,role],'conjunction':None,'translation':None,'consumer':'native-abg-owner','return_contract':task},
 'stop_change':{'invalidators':[],'stop_conditions':[],'residuals':[],'re_entry':[],'reconfiguration':[]},'profile_additions':{'worker':{'operation_grant_id':'witness-context-read','mutation_subject':None,'territory':[]}}}
request={'schema':'a_c.fd-support.request/1','id':None,'operation':'context.assemble','arguments':{'packet':packet,'models':[],'sources':[],'late_acquisition':[task,rubric,None],
 'envelope':{'capacity_bytes':None,'boundary':'executor-stdin-utf8','host_context':{'state':'unknown','bytes':None,'evidence':None}}}}
body={'kind':'abiogenesis_gc03_host_activation_request_template','status':'INCOMPLETE_NOT_ADMITTED','policySha256':h(dir/'gc03-policy.json'),'request':request,
 'requiredCurrentBindings':{'request.id':'fresh correlation label; not a receipt','packet.activation.id':'current host-admitted activation identifier','packet.frame.id':'current host-selected frame identifier',
 'packet.subject_basis.subject':'exact Identity of current native task; same Identity also fills packet.profile_additions.worker.mutation_subject',
 'packet.subject_basis.observations':'supported a_c Observation ArtifactRefs only; explicit empty list if none selected; keep native ABG event and Result provenance in owner_coordinates and authenticated source joins',
 'arguments.late_acquisition[2]':'retained-evidence SourceRef for unique current same-Run admitted Testing Result commandResults[0].stdout, with actual Result-derived id and stream digest'},
 'requiredOwnerFacts':['authenticate actual principal/actor/native capability and current occurrence independently before deriving the Context','reacquire original task, original rubric, selected Testing producer and exact byte identities','bind exact executor and policy, and project currentness before actual host publication'],
 'limits':['No a_c provider preflight, native Result, observation, receipt, delivery or admission is supplied','Source labels and original criteria preserve user text; no semantic judgment is automated','Future installed adapter and GC03 policy path require a fresh candidate with exact installed bytes']}
out=dir/'activation-request.template.json'
with out.open('x') as f:json.dump(body,f,indent=2);f.write('\n')
print(json.dumps({'template':str(out),'sha256':h(out)}))
