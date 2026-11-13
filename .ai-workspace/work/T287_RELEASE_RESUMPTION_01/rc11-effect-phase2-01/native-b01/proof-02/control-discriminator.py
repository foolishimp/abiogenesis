import sys
sys.dont_write_bytecode=True
import importlib.util,json
from pathlib import Path
p=Path(__file__).with_name('unit.py');spec=importlib.util.spec_from_file_location('actual_unit_controller',p);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
checks=[];raw='a'*64
assert m.validated_digest_join('sha256:'+raw,raw)['payloadEqual'];checks.append('matching typed/raw digest accepted')
for typed,bare in [('sha256:'+raw,'b'*64),(raw,raw),('sha256:sha256:'+raw,raw),('sha256:'+'A'*64,raw),('sha256:'+raw,'sha256:'+raw),('sha256:'+raw,'a'*63),(None,raw)]:
 try:m.validated_digest_join(typed,bare)
 except ValueError:checks.append('malformed/mismatching digest rejected')
 else:raise AssertionError('invalid digest relation accepted')
results=[];retained=[];next_effect=[]
def empty_failure():raise AssertionError()
try:
 m.run_required_step('unit',empty_failure,results,retained.append)
 next_effect.append('must not run')
except m.ProofStepFailure:pass
else:raise AssertionError('empty-message failure did not stop')
assert next_effect==[] and len(retained)==1 and results==retained
assert results[0]['failurePresent'] is True and results[0]['failure']['class']=='builtins.AssertionError' and results[0]['failure']['message']=='' and results[0]['failure']['repr']=='AssertionError()'
checks.append('actual failure-presence path records empty AssertionError and prevents next effect')
for bad in [[],results,[{'id':'unit','status':'FAILED_OR_INCOMPLETE','failurePresent':True,'failure':{'message':''}}],[{'id':'other','status':'PASSED','failurePresent':False,'failure':None}],[{'id':'unit','status':'PASSED','failurePresent':False,'failure':None}]*2]:
 success_effect=[]
 try:m.require_complete_success(bad,['unit']);success_effect.append('must not run')
 except m.ProofStepFailure:pass
 else:raise AssertionError('failed/missing result admitted final success')
 assert success_effect==[];checks.append('actual aggregate gate blocks failed/missing/incorrect result population')
nominal=[];m.run_required_step('unit',lambda:{'observed':'control-only nominal'},nominal,lambda x:None);assert m.require_complete_success(nominal,['unit']);checks.append('one exact explicit success admitted')
print(json.dumps({'status':'PASSED','checks':checks,'count':len(checks),'actualControllerFunctions':['validated_digest_join','run_required_step','require_complete_success'],'noProductImport':True,'noTestOrChildWorkload':True,'emptyFailureRecord':retained[0]}))
