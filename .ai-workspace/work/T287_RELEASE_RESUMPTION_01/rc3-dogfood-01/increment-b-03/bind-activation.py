#!/usr/bin/env python3
"""Bind selected B03 preparation after B02's actual final handoff; no dispatch."""
from pathlib import Path
import hashlib,json,subprocess
base=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01')
inc=base/'increment-b-03';priorInc=base/'increment-b-01';attempt=base/'attempt-005';setup=base/'setup-001'
sha=lambda b:hashlib.sha256(b).hexdigest()
def row(p):
 b=p.read_bytes();return {'path':str(p),'sha256':sha(b),'bytes':len(b)}
p=json.loads((inc/'model-free-preflight.json').read_bytes());w=json.loads((inc/'workload.json').read_bytes())
prior=json.loads((base/'attempt-004/execution.json').read_bytes())['receipt']['ownerOutput'];assert prior['outcomeKind']=='result'
budget=json.loads((attempt/'B03_BUDGET_BASELINE.json').read_bytes());assert budget['unresolvedProcesses']==0
assert float(budget['historicalPlusKnownUsd'])<76 and float(budget['knownReportedIncrementUsd'])<32
assert p['sourceCommit']=='927b8c0b84915ea2c926115902c2ceeef6df26a3' and p['absent']==0
assert p['controlledSelector']['promptBytes']<=p['controlledSelector']['promptBound']==1048576
assert p['requiredExecutionBudgetMs']<1800000 and p['priorEvent']['bytes']>0
assert p['workloadSha256']==row(inc/'workload.json')['sha256']
assert subprocess.check_output(['/usr/bin/git','rev-parse','HEAD'],cwd='/Users/jim/src/apps/abiogenesis-rc3-dogfood',text=True).strip()==p['sourceCommit']
assert [r['id'] for r in json.loads((priorInc/'rubric.json').read_bytes())['criteria']]==['A1','A2','A3','A4','A5','B1','B2','B3','B4','B5']
activation={'kind':'rc3_increment_b03_executive_activation','status':'SELECTED_FOR_MODEL_FREE_CALL_PREPARATION_ONLY',
 'ownerInstruction':'review, fix, and continue on using rc2 being used to build rc3',
 'authorityInterpretation':'Root selected focused B03 continuation from B02 admitted partial Construction under original B design and 23-path grant; this is not native B03 admission.',
 'executive':'/root','writer':'/root/context_capability','sourceCommit':p['sourceCommit'],
 'executingArtifactSha256':'36e02dd927066db2f64d71446334982d65b9b8b4ab1c7666d83d04c530aca528',
 'executingManifestDigest':'sha256:4cbec075adc577e9a7544167ac858e04a4d9340e4c2eb18ccb752128c4da623d',
 'methodBasis':'stdo://releases/v3.0.2/','methodManifestSha256':'f7f3f824ee1ac3e048d1b1ea86ce3aae84866e2e9d5010fe5eda2e38e12f4477',
 'workload':row(inc/'workload.json'),'preflight':row(inc/'model-free-preflight.json'),'protectedCensus':row(inc/'snapshot-census.json'),
 'retainedPreflightAuthority':row(inc/'RETAINED_PREFLIGHT_AUTHORITY.json'),'physicalBoundary':row(inc/'PHYSICAL_BOUNDARY.json'),
 'grant':row(priorInc/'grant.json'),'providerCustody':row(priorInc/'provider-custody.json'),'b02SourceCustody':row(inc/'B02_SOURCE_CUSTODY.json'),
 'b02StructuredReturn':row(inc/'B02_STRUCTURED_RETURN.json'),'b02SourceArchive':row(inc/'b02-source-local.tar'),
 'setupResume':row(setup/'operator-resume-material.json'),'previousRunResume':row(base/'attempt-004/after-run-resume.json'),
 'previousRunExecution':row(base/'attempt-004/execution.json'),'previousFreshReads':'pending Root read-only projection at preparation time',
 'operatorAuthority':row(base/'OPERATOR.md'),'offlineToolchain':row(base/'increment-a-01/toolchain-census.json'),
 'initialEventLog':p['priorEvent'],'constructionWriteRoots':w['workOrders']['construction']['writeRoots'],
 'budget':{'baselineObservation':row(attempt/'B03_BUDGET_BASELINE.json'),'historicalPreBReportedUsd':46.3959266,
 'bFamilyReportedUsd':budget['knownReportedIncrementUsd'],'totalReportedUsd':budget['historicalPlusKnownUsd'],
 'bFamilyTargetUsd':32,'reviewCheckpointAggregateUsd':76,'maxUsdPerProcess':8,'maxTurns':120,'reservedLaterWitnessUsd':6,
 'userAllocationUsd':100,'rootAggregateStopUsd':90,'otherCharges':'unknown','automaticRetry':False},
 'runtime':{'inactivityMs':1800000,'absoluteMs':2100000,'bashDefaultMs':1800000,'bashMaximumMs':1800000,'retainedInputCheckTimeoutMs':300000,
 'note':'Configured bounds only; no worst-case-duration execution claimed.'},
 'limits':['B02 Construction was an admitted partial Result, not accepted B implementation','Actual GC03 native installed witness remains a later Root-controlled Run',
 'Dispatch re-observes installed Product Context and validates retained actual preflight against unchanged inputs; this is not a preflight rerun or current admission',
 'Controlled selector renderer is predictive only; genuine B03 admission and assembly remain native and fail closed','No provider or lifecycle call was dispatched']}
out=(json.dumps(activation,indent=2,sort_keys=True)+'\n').encode();target=attempt/'ACTIVATE_B03.json'
with target.open('xb') as f:f.write(out)
print(json.dumps({'path':str(target),'sha256':sha(out),'bytes':len(out)}))
