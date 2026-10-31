#!/usr/bin/env python3
"""Bind the selected preflight and completed B01 handoff, without dispatch."""
from pathlib import Path
import hashlib,json,subprocess
base=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01')
inc=base/'increment-b-02'; priorInc=base/'increment-b-01'; attempt=base/'attempt-004'; setup=base/'setup-001'
sha=lambda x:hashlib.sha256(x).hexdigest()
def row(path):
 b=path.read_bytes();return {'path':str(path),'sha256':sha(b),'bytes':len(b)}
p=json.loads((inc/'model-free-preflight.json').read_bytes());w=json.loads((inc/'workload.json').read_bytes())
prior=json.loads((base/'attempt-003/outcome-summary.json').read_bytes());assert prior['disposition']=='runtime_failed' and prior['terminal'] is None
assert p['sourceCommit']=='927b8c0b84915ea2c926115902c2ceeef6df26a3' and p['absent']==0 and p['selectedPaths']==931
assert p['controlledSelector']['promptBytes'] <= p['controlledSelector']['promptBound']==1048576
assert p['requiredExecutionBudgetMs']<1800000 and p['priorEvent']['bytes']>0
assert p['workloadSha256']==row(inc/'workload.json')['sha256']
assert subprocess.check_output(['/usr/bin/git','rev-parse','HEAD'],cwd='/Users/jim/src/apps/abiogenesis-rc3-dogfood',text=True).strip()==p['sourceCommit']
assert [r['id'] for r in json.loads((priorInc/'rubric.json').read_bytes())['criteria']]==['A1','A2','A3','A4','A5','B1','B2','B3','B4','B5']
activation={'kind':'rc3_increment_b02_executive_activation','status':'SELECTED_FOR_MODEL_FREE_CALL_PREPARATION_ONLY',
 'ownerInstruction':'review, fix, and continue on using rc2 being used to build rc3',
 'authorityInterpretation':'Root selected focused B continuation from unaccepted B01 partial effects under the original B design and grant, model-free preparation and a separate future native host witness; this is not ABG admission.',
 'executive':'/root','writer':'/root/context_capability','sourceCommit':p['sourceCommit'],
 'executingArtifactSha256':'36e02dd927066db2f64d71446334982d65b9b8b4ab1c7666d83d04c530aca528',
 'executingManifestDigest':'sha256:4cbec075adc577e9a7544167ac858e04a4d9340e4c2eb18ccb752128c4da623d',
 'methodBasis':'stdo://releases/v3.0.2/','methodManifestSha256':'f7f3f824ee1ac3e048d1b1ea86ce3aae84866e2e9d5010fe5eda2e38e12f4477',
 'workload':row(inc/'workload.json'),'preflight':row(inc/'model-free-preflight.json'),'protectedCensus':row(inc/'snapshot-census.json'),
 'grant':row(priorInc/'grant.json'),'providerCustody':row(priorInc/'provider-custody.json'),'sourceCorrespondence':row(priorInc/'A_C2_IDENTITY.json'),
 'setupResume':row(setup/'operator-resume-material.json'),'previousRunResume':row(base/'attempt-003/after-run-resume.json'),
 'previousRunOutcome':row(base/'attempt-003/outcome-summary.json'),'previousFreshReads':row(base/'attempt-003/fresh-reads.json'),
 'partialCustody':row(inc/'PARTIAL_CUSTODY.json'),'partialArchive':row(inc/'partial-source-local.tar'),
 'operatorAuthority':row(base/'OPERATOR.md'),'offlineToolchain':row(base/'increment-a-01/toolchain-census.json'),
 'initialEventLog':p['priorEvent'],'constructionWriteRoots':w['workOrders']['construction']['writeRoots'],
 'budget':{'historicalReportedNativeUsd':46.3959266,'b01ReportedUsd':6.6586394,'totalBeforeB02ReportedUsd':53.0545660,'initialBTargetUsd':20,'reviewCheckpointKnownBUsd':12,'activeProcessReserveUsd':8,
   'maxUsdPerProcess':8,'maxTurns':120,'userAllocationUsd':100,'rootAggregateStopUsd':90,'otherCharges':'unknown','automaticRetry':False},
 'runtime':{'inactivityMs':1800000,'absoluteMs':2100000,'bashDefaultMs':1800000,'bashMaximumMs':1800000,
  'note':'Configured bounds only; no worst-case-duration execution claimed.'},
 'limits':['A02 blocked with UAT indeterminate; B01 runtime failed with no completed Construction Result','C2 artifact and source are unqualified RC3 candidate','Actual GC03 native installed witness remains a later Root-controlled Run',
  'Controlled selector renderer is predictive only; genuine B admission and assembly remain native and fail closed','No provider or lifecycle call was dispatched']}
out=(json.dumps(activation,indent=2,sort_keys=True)+'\n').encode();target=attempt/'ACTIVATE_B02.json'
with target.open('xb') as f:f.write(out)
print(json.dumps({'path':str(target),'sha256':sha(out),'bytes':len(out)}))
