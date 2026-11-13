#!/usr/bin/env python3
"""File-only operator contract checks; no ABI import, build or provider."""
from pathlib import Path
import hashlib,json,subprocess,sys,copy
P=Path(__file__).resolve().parent; W=Path('/Users/jim/src/apps/abiogenesis-rc4-native-recovery')
def load(p): return json.loads(p.read_text())
def within(a,b): return a==b or a.startswith(b+'/') or b=='.'
def disjoint(w):
 sources=[r['path'] for r in w['sources']]
 writes=[p for o in w['workOrders'].values() for p in o['writeRoots']]
 overlap=[(s,t) for s in sources for t in writes if within(s,t) or within(t,s)]
 if overlap: raise ValueError('Invariant sources overlap write roots: '+repr(overlap))
def main():
 w=load(P/'workload.json'); g=load(P/'NATIVE_GRANT.DRAFT.json')
 disjoint(w)
 if sys.argv[1:]==['--negative-control']:
  bad=copy.deepcopy(w);bad['sources'].append({'path':g['Construction']['productWritePaths'][0],'digest':'sha256:'+'0'*64})
  try:disjoint(bad)
  except ValueError:print(json.dumps({'negativeControl':'source-write overlap refused'}));return
  raise AssertionError('overlap was admitted')
 assert not sys.argv[1:]
 assert subprocess.check_output(['git','-C',str(W),'rev-parse','HEAD'],text=True).strip()==g['sourceCommit']
 subprocess.run(['git','-C',str(W),'diff','--quiet'],check=True);subprocess.run(['git','-C',str(W),'diff','--cached','--quiet'],check=True)
 for source in w['sources']:
  p=W/source['path'];assert p.is_file() and not p.is_symlink(),str(p)
  assert 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()==source['digest'],str(p)
 for row in load(P/'INPUT_MATERIALIZATION.json')['rows']:
  p=W/row['target'];assert len(p.read_bytes())==row['bytes'] and hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256']
 assert w['workOrders']['construction']['writeRoots']==g['Construction']['writePaths']
 assert len(g['Construction']['productWritePaths'])==51 and len(g['Construction']['scratchWriteRoots'])==1
 assert all(not o['writeRoots'] for role,o in w['workOrders'].items() if role!='construction')
 old=load(P.parent/'workload.json')
 assert w['testing']==old['testing'],'nine C2 commands, purposes and predicates must survive unchanged'
 assert len(w['testing']['commands'])==9
 budget=sum(c['timeoutMs']+2*c['terminationGraceMs']+min(c['terminationGraceMs'],250) for c in w['testing']['commands'])+5000
 assert budget==4267250
 profile=load(P/'PROVIDER_PROFILE.json');assert budget<profile['inactivityTimeoutMs']<profile['absoluteTimeoutMs'];assert profile['maxBudgetUsd'] is None
 assert profile['toolchainEnvironment']['TMPDIR']==g['tooling']['TMPDIR']
 assert Path(g['tooling']['offlineReadRoot']).is_dir()
 print(json.dumps({'status':'operator_contract_checked_no_runtime','sourceWriteIntersection':[],'invariantSources':len(w['sources']),'productWritePaths':51,'scratchWriteRoots':1,'commands':9,'requiredExecutionBudgetMs':budget,'method':'current Git checkpoint and live files; no workspace snapshot machinery'}))
if __name__=='__main__': main()
