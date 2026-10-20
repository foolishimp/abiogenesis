import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const phase=import.meta.dirname,root='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02';
const host=JSON.parse(readFileSync(root+'/operator/native-observation-presentation-successor-140/host-preparation/exacthost-identity.json'));
const load=p=>import(pathToFileURL(host.installedRoot+'/build/code/src/'+p+'.js').href);
const [profiles,failure,digests]=await Promise.all([load('abg/event_contract_profiles'),load('abg/runtime_failure'),load('shared/digests')]);
const started=new Date().toISOString(),clock=performance.now();
const diagnosticRef=profiles.undispatchedOwnerDiagnosticRef('preparation','thrown',new TypeError('bounded reviewer diagnostic correspondence'));
const decoded=failure.readRuntimeFailureDiagnosticSubject(diagnosticRef);
assert(decoded!==null);assert.equal(failure.constructRuntimeFailureDiagnosticRef(decoded),diagnosticRef);
assert.equal(decoded.diagnosticClassRef,'diagnostic://abiogenesis/implementation/undispatched/preparation/thrown@5');
assert.equal(decoded.stage,'preparation');assert.equal(decoded.reason,'thrown');assert.equal(decoded.errorClass,'TypeError');
// Only a shape discriminator; these nulls are not nominal/runtime coordinates.
const coordinateSubjectClass={stage:'child-failure',parentCCallRef:null,parentResultRef:null,parentJudgmentRef:null,parentInputDigest:null,childExecutionBasisRef:null,childTraversalScopeRef:null,childCCallRef:null,childResultRef:null,childJudgmentRef:null,childRouteEventRef:null};
const childDigest=digests.sha256Canonical(decoded),parentSubjectDigest=digests.sha256Canonical(coordinateSubjectClass);
assert.notEqual(childDigest,parentSubjectDigest);
const value={kind:'bounded_pure_diagnostic_correspondence',started,finished:new Date().toISOString(),wallMs:performance.now()-clock,installedRoot:host.installedRoot,
 owner:'event_contract_profiles.undispatchedOwnerDiagnosticRef + runtime_failure.readRuntimeFailureDiagnosticSubject/constructRuntimeFailureDiagnosticRef + shared/digests.sha256Canonical',
 nativeErrorProducesCanonicalRetainedJson:true,childSubjectDigest:childDigest,coordinateSubjectClassDigest:parentSubjectDigest,roundTripExact:true,
 guardSource:'runtime_failure.ts109-114/230-233: sha256Canonical(decoded diagnostic subject) must equal sha256Canonical(admission subject)',
 subjectClassDiscriminator:'Decoded owner subject contains diagnosticClassRef and stage preparation, while Source142 supplies stage child-failure and enclosing coordinates. Their canonical text differs independently of actual coordinate values.',
 result:'A current JSON carrier is supported; new142 argument pair violates existing owner digest relation if this live-child path is reached.',
 limits:'Pure canonical value correspondence plus source reachability, not new Run/child admission or end-to-end exception reproduction. No test retry or semantic owner mutation.'};
writeFileSync(phase+'/diagnostic-correspondence.json',JSON.stringify(value,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({roundTripExact:true,nativeErrorProducesCanonicalRetainedJson:true,childSubjectDigest:childDigest,subjectClassDigest:parentSubjectDigest,wallMs:value.wallMs}));
