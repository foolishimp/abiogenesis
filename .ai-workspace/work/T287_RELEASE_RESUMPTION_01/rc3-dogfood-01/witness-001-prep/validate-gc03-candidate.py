#!/usr/bin/env python3
"""Controlled local provider computation only; no native facts or receipts."""
import copy,hashlib,json,sys
from pathlib import Path
sys.path.insert(0,'/Users/jim/.local/share/a_c/development-supplements/gc03-adb3d8ee-1/contents/a_c/build_tenants/graphify/code')
import ac_support_core as c
b=Path(__file__).resolve().parent;folder=b/'gc03-candidate-b04-source-001';policy=folder/'gc03-policy.json';digest=hashlib.sha256(policy.read_bytes()).hexdigest()
content={name:(b/name).read_bytes() for name in ('task.md','rubric.json','fixture.txt')};content['controlled-fixture-only']=content['fixture.txt']
def resolve(ref):
 value=content.get(ref['id']);assert value is not None and hashlib.sha256(value).hexdigest()==ref['sha256'];return value
r=c.Runtime.from_policy(policy,digest,'constructor',resolve_artifact=resolve);g=c._grant(r,'witness-context-read','context.read');e=r.policy['executors']['gc03-python-host-adapter']
for source in e['dependencies']:c.read_source(r,source)
q=copy.deepcopy(json.loads((folder/'activation-request.template.json').read_bytes())['request']);a=q['arguments'];p=a['packet'];identity={'id':'urn:controlled-schema-only','sha256':'0'*64}
q['id']='controlled-only';p['activation']['id']='controlled-activation';p['frame']['id']='controlled-frame';p['subject_basis']['subject']=identity;p['subject_basis']['observations']=[];p['profile_additions']['worker']['mutation_subject']=identity
a['late_acquisition'][2]={'engine':'retained-evidence','root':'evidence','path':'controlled-fixture-only','object':None,'sha256':hashlib.sha256(content['fixture.txt']).hexdigest(),'selector':None}
c.validate_request(q);out=c.execute_read(r,q)
if out['refusal'] is not None:raise ValueError(json.dumps(out['refusal']))
contexts=[x['payload'] for x in out['artifacts'] if x['kind']=='context'];assert len(contexts)==1;ctx=contexts[0]
sources=list(c._all_source_refs(ctx['packet']))+c._context_material_sources(ctx)+list(g['authority_sources'])+[g['outcome']['source'],g['admission']['mechanism_source'],g['admission']['authority_source'],r.policy['product']['authority_binding']['owner_record']]
check=c._recheck(r,sources,ctx['packet']['subject_basis']['observations'],e['dependencies']);c._host_recheck_coverage(r,ctx,'witness-context-read','gc03-python-host-adapter',check)
fresh=c.check_preconditions(r,check);assert not fresh['changes'] and not fresh['gaps'];assert len(c._check_lookup_context(r,ctx,'witness-context-read','gc03-python-host-adapter',check,'context.read'))==3
print(json.dumps({'policyStartup':'passed','contextAssembleControlled':'passed','commonGrantExecutorCurrentnessAndCoverage':'passed','declaredLateKeys':['late/0','late/1','late/2'],'dependencyCount':len(e['dependencies']),'limits':['controlled fixture only; no native authority, observation, preflight, receipt or Result asserted','computed artifacts held only in memory; none persisted']}))
