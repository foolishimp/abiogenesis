#!/usr/bin/env python3
"""File-only packet feasibility: no Product import, build, test or provider call."""
from pathlib import Path
import copy,hashlib,json,os,stat,subprocess,sys
P=Path(__file__).resolve().parent
W=Path('/Users/jim/src/apps/abiogenesis-rc4-native-recovery')
def load(p): return json.loads(p.read_text())
def within(a,b): return a==b or a.startswith(b+'/') or b=='.'
def disjoint(w):
 writes=[p for o in w['workOrders'].values() for p in o['writeRoots']]
 overlap=[(r['path'],t) for r in w['sources'] for t in writes if within(r['path'],t) or within(t,r['path'])]
 if overlap: raise ValueError('Invariant sources overlap write roots: '+repr(overlap))
def main():
 w=load(P/'workload.json');g=load(P.parent/'attempt-005/NATIVE_GRANT.DRAFT.json');checkpoint=load(P/'CHECKPOINT.json');old=load(P.parent/'attempt-003/workload.json')
 disjoint(w)
 if sys.argv[1:]==['--negative-control']:
  bad=copy.deepcopy(w);bad['sources'].append({'path':g['Construction']['generatedOutputWriteRoots'][0]+'/deliberate-source-overlap.json','digest':'sha256:'+'0'*64})
  try:disjoint(bad)
  except ValueError:print(json.dumps({'negativeControl':'generated-output source/write overlap refused','runtimeCalls':0}));return
  raise AssertionError('overlap admitted')
 draft=False;assert not sys.argv[1:]
 rows=[];virtual={}
 assert subprocess.check_output(['git','-C',str(W),'rev-parse','HEAD'],text=True).strip()==checkpoint['sourceCommit']
 assert subprocess.check_output(['git','-C',str(W),'rev-parse','HEAD^{tree}'],text=True).strip()==checkpoint['sourceTree']
 assert not subprocess.check_output(['git','-C',str(W),'status','--short','--untracked-files=no'])
 for r in rows:
  source=Path(r['source']['path']);b=source.read_bytes();assert len(b)==r['bytes'] and hashlib.sha256(b).hexdigest()==r['sha256']
  if not draft:assert (W/r['target']).read_bytes()==b
 for source in w['sources']:
  p=Path(virtual[source['path']]['source']['path']) if draft and source['path'] in virtual else W/source['path']
  assert p.is_file() and not p.is_symlink()
  assert 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()==source['digest'],str(p)
 c=g['Construction'];assert len(c['productWritePaths'])==52 and c['productWritePaths']==load(P.parent/'attempt-003/NATIVE_GRANT.DRAFT.json')['Construction']['productWritePaths']
 assert c['generatedOutputWriteRoots']==['build_tenants/abiogenesis/typescript/contracts','build_tenants/abiogenesis/typescript/product-toolchain-manifest.json']
 assert len(c['scratchWriteRoots'])==1 and c['scratchWriteRoots']==['rc4-scratch/native-recovery-05']
 assert w['workOrders']['construction']['writeRoots']==c['productWritePaths']+c['generatedOutputWriteRoots']+c['scratchWriteRoots']
 assert all(not o['writeRoots'] for role,o in w['workOrders'].items() if role!='construction')
 assert all(any(within(path,r) for r in w['readRoots']) for path in w['workOrders']['construction']['writeRoots'])
 assert all(not any(within('rc4-scratch/native-recovery-'+n,r) for r in w['readRoots']) for n in ['01','02','03','04'])
 assert w['testing']==old['testing'],'Entire C2 testing block must equal attempt003; no canonical workspace paths in child command environment'
 assert len(w['testing']['commands'])==9 and w['maxContextBytes']==268435456 and w['maxContextFiles']==10000
 budget=sum(c['timeoutMs']+2*c['terminationGraceMs']+min(c['terminationGraceMs'],250) for c in w['testing']['commands'])+5000
 assert budget==4267250
 profile=load(P/'PROVIDER_PROFILE.json');assert profile['maxTurns']==profile['provider']['maxTurns']==480
 assert profile['inactivityTimeoutMs']==4500000 and profile['absoluteTimeoutMs']==5400000 and profile['outerTimeoutMs']==10800000
 assert budget<profile['inactivityTimeoutMs']<profile['absoluteTimeoutMs'] and profile['maxBudgetUsd'] is None
 assert profile['toolchainEnvironment']['TMPDIR']=='/private/tmp/abiogenesis-rc4-runtime-01' and 'NPM_CONFIG_CACHE' not in profile['toolchainEnvironment'] and Path(g['tooling']['offlineReadRoot']).is_dir()
 assert all(within(str(Path(v).relative_to(W)),c['scratchWriteRoots'][0]) for v in profile['providerScratch'].values())
 for r in checkpoint['preimages']:
  data=Path(r['path']).read_bytes();assert len(data)==r['bytes'] and hashlib.sha256(data).hexdigest()==r['sha256']
 seen={};issues=[]
 def visit(r):
  if r in seen:return
  if draft and r in virtual:seen[r]=('planned_file',virtual[r]['bytes']);return
  p=W/r
  try:s=p.lstat()
  except FileNotFoundError:
   seen[r]=('absent',0)
   if r not in c['scratchWriteRoots']:issues.append({'path':r,'issue':'unexpected absent root'})
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
 total=sum(v[1] for v in seen.values());assert total<=w['maxContextBytes'];assert len(seen)+1<=w['maxContextFiles'];assert not issues,issues
 generated={k:v for k,v in seen.items() if any(within(k,r) for r in c['generatedOutputWriteRoots'])}
 print(json.dumps({'status':'DRAFT_FILE_ONLY_FEASIBLE' if draft else 'OPERATOR_FILE_ONLY_CHECKED','runtimeCalls':0,'ProductTestsBuilds':0,'sourceWriteIntersection':[],'invariantSources':len(w['sources']),'manualSourcePaths':52,'generatedOutputRoots':2,'scratchRoots':1,'readRoots':len(w['readRoots']),'selectedC2Paths':len(w['testing']['selectedPaths']),'commands':9,'predicates':len(w['testing']['outcomePredicates']),'requiredExecutionBudgetMs':budget,'selectedEntriesIncludingPlannedInputsAndAbsentScratch':len(seen),'selectedRawBytesIncludingPlannedInputs':total,'generatedEntriesIncludingRoot':len(generated),'generatedRawBytes':sum(v[1] for v in generated.values()),'contextCapBytes':w['maxContextBytes'],'contextCapEntries':w['maxContextFiles'],'issues':issues,'plannedInputs':len(virtual) if draft else 0,'materialized':not draft,'priorScratchSelected':'same original005 scratch retained;01-04 excluded','limit':'Filesystem size/read-root prediction only; no admitted context or future-peak guarantee. Root installed preflight must validate actual prepared input/absence/symlink/freshness. New scratch must exist before installed observation; bounded disposable fixture teardown remains native work.'}))
if __name__=='__main__':main()
