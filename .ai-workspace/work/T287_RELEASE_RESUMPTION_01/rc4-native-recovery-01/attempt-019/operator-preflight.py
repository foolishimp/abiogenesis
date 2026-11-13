#!/usr/bin/env python3
"""File-only packet feasibility: no Product import, build, test or provider call."""
from pathlib import Path
import copy,hashlib,json,os,stat,subprocess,sys
P=Path(__file__).resolve().parent
BASE=P
W=Path('/Users/jim/src/apps/abiogenesis-rc4-native-recovery')
def load(p): return json.loads(p.read_text())
def within(a,b): return a==b or a.startswith(b+'/') or b=='.'
def disjoint(w):
 writes=[p for o in w['workOrders'].values() for p in o['writeRoots']]
 overlap=[(r['path'],t) for r in w['sources'] for t in writes if within(r['path'],t) or within(t,r['path'])]
 if overlap: raise ValueError('Invariant sources overlap write roots: '+repr(overlap))
def unique_lists(w):
 for label,values in [('readRoots',w['readRoots']),('selectedPaths',w['testing']['selectedPaths'])]:
  if len(values)!=len(set(values)):raise ValueError(label+' contains duplicate caller coordinates')
def main():
 w=load(P/'workload.json');g=load(BASE/'NATIVE_GRANT.DRAFT.json')
 unique_lists(w);disjoint(w)
 if sys.argv[1:]==['--negative-control']:
  duplicate=copy.deepcopy(w);duplicate['readRoots'].append(duplicate['readRoots'][0])
  try:unique_lists(duplicate)
  except ValueError:pass
  else:raise AssertionError('duplicate read root admitted')
  duplicate=copy.deepcopy(w);duplicate['testing']['selectedPaths'].append(duplicate['testing']['selectedPaths'][0])
  try:unique_lists(duplicate)
  except ValueError:pass
  else:raise AssertionError('duplicate selected path admitted')
  bad=copy.deepcopy(w);bad['sources'].append({'path':g['Construction']['scratchWriteRoots'][3]+'/deliberate-source-overlap.json','digest':'sha256:'+'0'*64})
  try:disjoint(bad)
  except ValueError:print(json.dumps({'negativeControl':'duplicate readRoots/selectedPaths and scratch source/write overlap refused','runtimeCalls':0}));return
  raise AssertionError('overlap admitted')
 draft=sys.argv[1:]==['--draft'];assert draft or not sys.argv[1:]
 rows=load(BASE/('INPUT_MATERIALIZATION.DRAFT.json' if draft else 'INPUT_MATERIALIZATION.json'))['rows'];virtual={r['target']:r for r in rows}
 assert subprocess.check_output(['git','-C',str(W),'rev-parse','HEAD'],text=True).strip()==g['sourceCommit']
 assert subprocess.check_output(['git','-C',str(W),'rev-parse','HEAD^{tree}'],text=True).strip()==g['sourceTree']
 assert not subprocess.check_output(['git','-C',str(W),'status','--short','--untracked-files=no'])
 for r in rows:
  source=Path(r['source']['path']);b=source.read_bytes();assert len(b)==r['bytes'] and hashlib.sha256(b).hexdigest()==r['sha256']
  if not draft:assert (W/r['target']).read_bytes()==b
 for source in w['sources']:
  p=Path(virtual[source['path']]['source']['path']) if draft and source['path'] in virtual else W/source['path']
  assert p.is_file() and not p.is_symlink()
  assert 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()==source['digest'],str(p)
 c=g['Construction'];assert len(c['productWritePaths'])==3 and len(c['generatedOutputWriteRoots'])==0
 assert all(path in w['testing']['selectedPaths'] for path in c['productWritePaths'])
 assert c['scratchWriteRoots']==['rc4-scratch/native-recovery-19/'+x for x in ['return.json','readiness.json','notes.md','tmp']]
 assert w['workOrders']['construction']['writeRoots']==c['productWritePaths']+c['directoryCreationRoots']+c['scratchWriteRoots']
 assert all(not o['writeRoots'] for role,o in w['workOrders'].items() if role!='construction')
 assert all(any(within(path,r) for r in w['readRoots']) for path in w['workOrders']['construction']['writeRoots'])
 assert all(not any(within('rc4-scratch/native-recovery-'+n,r) for r in w['readRoots'] if r!='rc4-scratch/native-recovery-09/sync.sh') for n in ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17'])
 assert len(w['testing']['commands'])==7 and len(w['testing']['outcomePredicates'])==7
 assert all(p['predicateKind']=='process_exit' and p['declaration']['equals']==0 for p in w['testing']['outcomePredicates'])
 assert w['testing']['commands'][0]['args'][2:]==c['productWritePaths']
 assert w['maxContextBytes']==268435456 and w['maxContextFiles']==10000
 budget=sum(c['timeoutMs']+2*c['terminationGraceMs']+min(c['terminationGraceMs'],250) for c in w['testing']['commands'])+5000
 assert budget==load(P/'C2_BUDGET_READINESS.json')['budget']['requiredExecutionBudgetMs']
 link='build_tenants/abiogenesis/typescript/node_modules'
 assert not any(within(link,r) or within(r,link) for r in w['readRoots'])
 assert not any(within(link,r) or within(r,link) for r in w['workOrders']['construction']['writeRoots'])
 allowed_absent=set(c['nativeCreatedPaths']+c['directoryCreationRoots'])
 assert all(not (W/p).exists() for p in allowed_absent)
 profile=load(P/'PROVIDER_PROFILE.json');assert profile['maxTurns']==profile['provider']['maxTurns']==96
 assert profile['inactivityTimeoutMs']==4500000 and profile['absoluteTimeoutMs']==5400000 and profile['outerTimeoutMs']==10800000
 assert budget<profile['inactivityTimeoutMs']<profile['absoluteTimeoutMs'] and profile['maxBudgetUsd'] is None
 assert profile['providerScratch']['TMPDIR']==g['tooling']['TMPDIR'] and profile['providerScratch']['NPM_CONFIG_CACHE']==g['tooling']['NPM_CONFIG_CACHE'] and Path(g['tooling']['offlineReadRoot']).is_dir()
 seen={};issues=[]
 def visit(r):
  if r in seen:return
  if draft and r in virtual:seen[r]=('planned_file',virtual[r]['bytes']);return
  p=W/r
  try:s=p.lstat()
  except FileNotFoundError:
   seen[r]=('absent',0)
   if r not in allowed_absent and r not in c['scratchWriteRoots']:issues.append({'path':r,'issue':'unexpected absent root'})
   return
  if stat.S_ISLNK(s.st_mode):seen[r]=('symlink',0);issues.append({'path':r,'issue':'symlink'})
  elif stat.S_ISDIR(s.st_mode):
   seen[r]=('directory',0)
   for n in sorted(os.listdir(p)):visit(r+'/'+n)
  elif stat.S_ISREG(s.st_mode):
   seen[r]=('file',s.st_size)
   if s.st_nlink!=1:issues.append({'path':r,'issue':'hardlink'})
  else:seen[r]=('nonregular',0);issues.append({'path':r,'issue':'nonregular'})
  if p.resolve()!=p:issues.append({'path':r,'issue':'noncanonical path'})
 for root in w['readRoots']:visit(root)
 assert all(seen.get(p,('missing',))[0]=='file' for p in w['testing']['selectedPaths']), 'Selected C2 file not in observed read closure'
 for old in ['17','18']:
  bad=[p.replace('native-recovery-19/','native-recovery-'+old+'/') for p in w['testing']['selectedPaths']]
  assert any(seen.get(p,('missing',))[0]!='file' for p in bad), 'Stale namespace negative control admitted'
 total=sum(v[1] for v in seen.values());assert total<=w['maxContextBytes'];assert len(seen)+1<=w['maxContextFiles'];assert not issues,issues
 generated={k:v for k,v in seen.items() if any(within(k,r) for r in c['generatedOutputWriteRoots'])}
 print(json.dumps({'status':'DRAFT_FILE_ONLY_FEASIBLE' if draft else 'OPERATOR_FILE_ONLY_CHECKED','runtimeCalls':0,'ProductTestsBuilds':0,'sourceWriteIntersection':[],'expectedAbsentNativeCreatedRoots':sorted(allowed_absent),'invariantSources':len(w['sources']),'manualSourceWritePaths':3,'generatedOutputWriteRoots':0,'scratchRoots':4,'readRoots':len(w['readRoots']),'readRootUniqueCount':len(set(w['readRoots'])),'selectedPathUniqueCount':len(set(w['testing']['selectedPaths'])),'selectedC2Paths':len(w['testing']['selectedPaths']),'commands':7,'predicates':len(w['testing']['outcomePredicates']),'requiredExecutionBudgetMs':budget,'selectedEntriesIncludingPlannedInputsAndAbsentScratch':len(seen),'selectedRawBytesIncludingPlannedInputs':total,'generatedEntriesIncludingRoot':len(generated),'generatedRawBytes':sum(v[1] for v in generated.values()),'contextCapBytes':w['maxContextBytes'],'contextCapEntries':w['maxContextFiles'],'issues':issues,'plannedInputs':len(virtual) if draft else 0,'materialized':not draft,'priorScratchSelected':False,'limit':'Filesystem size/read-root prediction only; no admitted context or future-peak guarantee. Root installed preflight must validate actual prepared input/absence/symlink/freshness. New scratch must exist before installed observation; bounded disposable fixture teardown remains native work.'}))
if __name__=='__main__':main()
