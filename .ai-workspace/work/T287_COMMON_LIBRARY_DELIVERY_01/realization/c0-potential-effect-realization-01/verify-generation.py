import json,traceback
from common import ROOT,WORK,TENANT,digest,inventory,row,verify,write
try:
 assert not (WORK/'STOP.json').exists()
 old=WORK.parent/'combined-final-02';stage=WORK/'stage'
 source=json.loads((WORK/'source-inputs.json').read_text())['files'];deps=json.loads((WORK/'dependency-inputs.json').read_text())['files']
 generated=json.loads((old/'generated-inventory.json').read_text())['files'];owned=json.loads((WORK/'activation.json').read_text())['source_paths'][:9]
 allowed_code={p.replace('/code/src/','/build/code/src/').removesuffix('.ts')+ext for p in owned for ext in ['.js','.d.ts','.js.map']}
 derived=[]
 allowed_generated={str(TENANT/p) for p in ['product-toolchain-manifest.json','contracts/capabilities/capability-definition-graph.json','contracts/worksite/command-execution-context.inventory.json']}
 for x in source:
  verify(WORK/'source'/x['path'],x);a=row(stage/x['path'],x['path'])
  if a!=x:assert x['path'] in allowed_generated,x['path'];derived.append({'before':x,'after':a})
 for x in deps:verify(stage/TENANT/'node_modules'/x['path'],x)
 now=[row(stage/x['path'],x['path']) for x in generated];changes=[{'before':a,'after':b} for a,b in zip(generated,now) if a!=b]
 assert all(x['after']['path'] in allowed_code|allowed_generated for x in changes),[x['after']['path'] for x in changes]
 actual=inventory(stage);expected={x['path'] for x in source}|{str(TENANT/'node_modules'/x['path']) for x in deps}|{x['path'] for x in generated}
 assert {x['path'] for x in actual}==expected,({'extra':list({x['path'] for x in actual}-expected),'missing':list(expected-{x['path'] for x in actual})})
 write('generated-inventory.json',{'files':now});write('stage-post-generation-inventory.json',{'files':actual})
 write('emitted-correspondence.json',{'baseline':'combined-final-02','sourceRows':len(source),'dependencyRows':len(deps),'stageRows':len(actual),'generatedRows':len(now),'changes':changes,'sourceDerivedChanges':derived,'allOtherEmittedBytesExact':True,'compileCount':1,'generatorCount':1})
 print(json.dumps({'stageRows':len(actual),'generatedRows':len(now),'changedGenerated':len(changes),'sourceDerived':len(derived)}))
except BaseException:
 write('STOP.json',{'kind':'generation correspondence failure','traceback':traceback.format_exc(),'disposition':'stopped before repair/retry'});raise
