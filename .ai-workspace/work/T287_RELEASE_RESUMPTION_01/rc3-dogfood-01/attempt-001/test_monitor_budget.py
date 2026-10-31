import importlib.util,json,tempfile,unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('monitor_budget',Path(__file__).with_name('monitor-budget.py'))
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class MonitorTests(unittest.TestCase):
 def test_unknown_and_stop(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp)
   self.assertTrue(m.project(root,True)['startedWithoutObservedStream'])
   (root/'fp-a-stdout.log').write_text('{"type":"assistant"}\n')
   self.assertEqual(m.project(root,True)['unresolvedProcesses'],1)
   (root/'fp-a-stdout.log').write_text(json.dumps({'type':'result','total_cost_usd':5})+'\n')
   (root/'fp-b-stdout.log').write_text(json.dumps({'type':'result','total_cost_usd':5})+'\n')
   value=m.project(root,True);self.assertEqual(value['knownReportedIncrementUsd'],'10');self.assertEqual(value['rootAction'],'STOP_FOR_TRIAGE')
   (root/'fp-b-stdout.log').write_text((json.dumps({'type':'result','total_cost_usd':5})+'\n')*2)
   value=m.project(root,True);self.assertEqual(value['knownReportedIncrementUsd'],'5');self.assertEqual(value['unresolvedProcesses'],1)
if __name__=='__main__':unittest.main()
