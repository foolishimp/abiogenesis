#!/usr/bin/env python3
"""Materialize a host-only policy candidate; never admit or dispatch a Run."""
from pathlib import Path
import argparse,hashlib,json,os,sys
HERE=Path(__file__).resolve().parent
RELEASE=Path('/Users/jim/.local/share/a_c/development-supplements/gc03-adb3d8ee-1')
PYTHON=Path('/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12')
PROFILE='urn:a-c:fd-support:method:stdo-3.0.2:executive:1'
ACTOR='actor://abiogenesis/worksite/native-work@5'
GRAPH='graph-function://abiogenesis/worksite/native-work@5'
IMPL='implementation://abiogenesis/worksite/native-work-fp@5'
PRINCIPAL='constructor';GRANT='witness-context-read';EXECUTOR='gc03-python-host-adapter'
def sha(b):return hashlib.sha256(b).hexdigest()
def canonical(v):return json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
def pin(p):
 if not p.is_absolute() or p.resolve()!=p or p.is_symlink() or not p.is_file():raise ValueError('exact regular non-symlink file required: '+str(p))
 return sha(p.read_bytes())
def ref(root,path):
 base={'abg':HERE/'governed-context-sources/abg','method':HERE/'governed-context-sources/method','authority':HERE/'governed-context-sources/authority'}[root]
 return {'engine':'workspace-regular-file','root':root,'path':path,'object':None,'sha256':pin(base/path),'selector':None}
def generate(adapter,outdir,expected_adapter):
 adapter=Path(adapter);digest=pin(adapter)
 if digest!=expected_adapter:raise ValueError('selected adapter digest differs')
 if pin(PYTHON)!='a7f5b535d61d1c7326824204ac80f045a97a652abb154421e2c74fcc365a3539':raise ValueError('selected Python changed')
 custody=json.loads((HERE/'governed-context-sources/SOURCE_CUSTODY.json').read_bytes())
 for row in custody['sources']:
  if sha((HERE/'governed-context-sources'/row['copy']).read_bytes())!=row['sha256']:raise ValueError('copied basis drift: '+row['copy'])
 method=ref('method','fd-method-stdo-3.0.2.json');role=ref('method','ACTIVATION.md');definition=ref('abg','stdo_abiogenesis.json');product=ref('abg','specification/PRODUCT.md')
 authority=ref('authority','GC03_DELEGATION.md');task=ref('authority','task.md');host=ref('authority','fd-support-host-lookup.md')
 pyref={'engine':'workspace-regular-file','root':'python','path':PYTHON.name,'object':None,'sha256':pin(PYTHON),'selector':None}
 adref={'engine':'workspace-regular-file','root':'adapter','path':adapter.name,'object':None,'sha256':digest,'selector':None}
 gcpaths=['release-installation.json','contents/INVENTORY.json']+['contents/a_c/build_tenants/graphify/code/'+n+'.py' for n in ('ac_support_core','ac_support_composition','ac_graph','ac_formal_gate','ac_support_effects','ac_support','ac_context_presentation')]
 inventory=json.loads((RELEASE/'contents/INVENTORY.json').read_bytes())['files']
 if pin(RELEASE/'contents/INVENTORY.json')!='fc6befa45d62acd902665d545fc20f65dc3d435fa242a72aaa4e8986c080c003':raise ValueError('GC03 inventory changed')
 for rel in gcpaths[2:]:
  if pin(RELEASE/rel)!=inventory[rel[len('contents/'):]]['sha256']:raise ValueError('released GC03 member changed: '+rel)
 release_refs=[{'engine':'workspace-regular-file','root':'gc03','path':rel,'object':None,'sha256':pin(RELEASE/rel),'selector':None} for rel in gcpaths]
 sources={k:{'path':str(HERE/'governed-context-sources'/k),'read_scope':[{'path':p,'kind':'file'} for p in paths],'kind':'workspace','writable':False} for k,paths in {'abg':['stdo_abiogenesis.json','specification/PRODUCT.md'],'method':['fd-method-stdo-3.0.2.json','ACTIVATION.md','EVALUATION.md','AXIOMATIC_CALCULUS.md'],'authority':['OPERATOR.md','GC03_DELEGATION.md','task.md','rubric.json','fd-support-host-lookup.md']}.items()}
 sources.update({'python':{'path':str(PYTHON.parent),'read_scope':[{'path':PYTHON.name,'kind':'file'}],'kind':'workspace','writable':False},'adapter':{'path':str(adapter.parent),'read_scope':[{'path':adapter.name,'kind':'file'}],'kind':'workspace','writable':False},'gc03':{'path':str(RELEASE),'read_scope':[{'path':p,'kind':'file'} for p in gcpaths],'kind':'workspace','writable':False}})
 output=Path(outdir)
 if not output.is_absolute() or output!=HERE/'runtime-b10-003/gc03-policy' or output.name in ('','.') or output.exists():raise ValueError('new output directory directly beneath witness-001-prep required')
 evidence=HERE/'runtime-b10-003/resources/archives/gc03-host-only';mechanism={'id':'abiogenesis-native-held-store/1','source':host,'implementation_sha256':digest}
 surface={'root':str(evidence),'namespace':'prepared-lookup','consumer':'native-abg-owner'}
 policy={'schema':'a_c.fd-support.policy/1','id':'urn:abiogenesis:witness:gc03-policy:1','product':{'definition_id':'urn:stdo:product-definition:abiogenesis','definition':definition,
  'authority_binding':{'definition_locator':'/reference_frame_bases/0/authority/0','owner_record':product,'mechanism':mechanism,'result_surface':surface,'scope':'native host-owned prepared context.read; no provider preflight'}},
  'method_profile':{'id':PROFILE,'sha256':method['sha256'],'source':method},'sources':sources,
  'principals':{PRINCIPAL:{'actor_id':ACTOR,'role':'Worker','family':'abiogenesis-native-work','authorship':'native-construction','operations':['context.assemble','context.read'],'role_binding':role,'role_transition':None}},
  'grants':{GRANT:{'id':GRANT,'authority_sources':[authority],'outcome':{'id':'witness-original-task','source':task},'principals':[PRINCIPAL],'targets':[PRINCIPAL],
    'operations':['context.read'],'tools':['context.read'],'executors':[EXECUTOR],'territory':[],'preconditions':[],
    'admission':{'mechanism_id':mechanism['id'],'mechanism_source':host,'authority_source':authority,'required_predicates':[],'allowed_override_sources':[]},'notification_sink':None}},
  'predicates':{},'operators':{},'executors':{EXECUTOR:{'id':EXECUTOR,'executable':{'path':str(PYTHON),'sha256':pin(PYTHON)},
    'argv':[str(PYTHON),'-I','-S','-B',str(adapter)],'dependencies':[pyref,adref,*release_refs],'cwd':str(HERE/'runtime-b10-003/worksite'),'environment':{},'actor_id':ACTOR,
    'settings':{},'tools':['context.read'],'effect_scope':{'cooperative':True,'filesystem':'host-mediated','unknowns':['native owner controls actual publication']},
    'stdin_mode':'context-utf8','stdout_decoder':{'format':'json','pointer':None,'decode_json_string':False},'observers':[{'kind':'process-end'}]}},
  'event_sinks':{},'independence_policy':None,'evidence_root':str(evidence),'limits':{'max_message_bytes':16000000,'max_files':128,'max_bytes':8192,'max_history_records':10000,'max_wait_ms':1000},'authority_sources':[authority]}
 policyraw=canonical(policy);policypath=output/'gc03-policy.json';native={'kind':'abg_governed_context_policy','schemaVersion':'5.0.0',
 'release':{'identity':'urn:a-c:development-supplement:governed-context:gc03-adb3d8ee:1','inventorySha256':'fc6befa45d62acd902665d545fc20f65dc3d435fa242a72aaa4e8986c080c003','installedRoot':str(RELEASE),'policyPath':str(policypath),'policyDigest':'sha256:'+sha(policyraw)},
 'python':{'path':str(PYTHON),'digest':'sha256:'+pin(PYTHON),'version':'3.12.8'},'adapter':{'path':str(adapter),'digest':'sha256:'+digest},
 'invocation':{'argv':['-I','-S','-B',str(adapter)],'environment':{},'timeoutMs':30000},'principal':{'principalId':PRINCIPAL,'grantId':GRANT},
 'permission':{'role':'constructor','graphFunctionRef':GRAPH,'implementationRef':IMPL,'execution':'gc03_host_adapter'},
 'sources':{'task':'task.md','rubric':'rubric.json','worksite':[],'testing':{'purpose':'testing','fieldPath':['commandResults',0,'stdout']}}}
 output.mkdir(mode=0o700)
 for name,value in [('gc03-policy.json',policy),('abg-private-policy-member.json',native)]:
  with (output/name).open('xb') as f:f.write(canonical(value))
 return {'policyPath':str(policypath),'policySha256':sha(policyraw),'privatePolicyMember':str(output/'abg-private-policy-member.json'),
  'privateMemberSha256':sha(canonical(native)),'executorId':EXECUTOR,'principalId':PRINCIPAL,'actorId':ACTOR,'adapterSha256':digest,
  'status':'candidate only; no native admission or activated grant','limits':['No provider preflight or observation generated','Actor and executor must match actual native occurrence and verified installed artifact','Source roles and original governing criteria remain host-owned']}
if __name__=='__main__':
 try:
  p=argparse.ArgumentParser();p.add_argument('--adapter',required=True);p.add_argument('--adapter-sha256',required=True);p.add_argument('--out-dir',required=True);a=p.parse_args()
  if len(a.adapter_sha256)!=64 or any(c not in '0123456789abcdef' for c in a.adapter_sha256):raise ValueError('bare adapter SHA256 required')
  print(json.dumps(generate(a.adapter,a.out_dir,a.adapter_sha256),indent=2))
 except (OSError,ValueError,KeyError) as e:print(json.dumps({'status':'refused','reason':str(e)}),file=sys.stderr);sys.exit(2)
