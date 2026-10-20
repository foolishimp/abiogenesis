// Component regression over an explicitly selected retained resource packet.
// Lower current-owner admission is supplied; the emitted F_P dispatcher,
// borrowed-operation identity guard and actual qualification realization run.
// No actor exchange, Result/J, runtime resource or semantic pass is fabricated.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {performance} from 'node:perf_hooks';
import {invokeLeafOwnerBoundary} from '../../build/code/src/implementation/leaf_invocation_port.js';
import {realizeQualificationAssessment, QUALIFICATION_ASSESSMENT_IMPLEMENTATION_DESCRIPTOR} from '../../build/code/src/implementation/qualification.js';
import {prepareQualificationAssessment, isQualificationAssessmentInput} from '../../build/code/src/validator/qualification.js';
import {acquireQualificationResources, resolveQualificationAssessment} from '../../build/code/src/validator/qualification_resources.js';
import {qualificationHash as hash, constructQualificationIdentity as identity} from '../../build/code/src/validator/qualification_contracts.js';
import {readRuntimeFailureDiagnosticSubject} from '../../build/code/src/abg/runtime_failure.js';
import {deepFreeze} from '../../build/code/src/shared/immutable.js';
import {WORKSITE_COMMAND_EXECUTION_IDS as command} from '../../build/code/src/product/worksite_command_execution.js';
import {WORKSITE_REVISION_IDS as revision} from '../../build/code/src/product/worksite_revision.js';
import {privateOwner} from '../support/r10-private-owner-harness.mjs';

const packetPath = process.env.ABI5_F11_FP_ASSESSMENT_PACKET;
const baselineTenant = process.env.ABI5_F11_FP_BASELINE_TENANT;
const reportPath = process.env.ABI5_F11_FP_PROOF_REPORT;

test('qualification F_P proof delivery preserves the actual prepared request and exact owner arguments',
  {skip: !packetPath || !baselineTenant}, async t => {
    const started = performance.now();
    const packet = JSON.parse(fs.readFileSync(packetPath, 'utf8'));
    const manifestPath = resolve(packetPath, '..', packet.assertionManifestFile);
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const input = deepFreeze(packet.assessmentInput);
    assert.equal(input.task.representation, 'resource_refs_v1');
    assert(isQualificationAssessmentInput(input));
    const resources = acquireQualificationResources({kind: 'qualification_resource_assertion', schemaVersion: '1',
      manifests: [manifest], declarationProofs: packet.declarationProofs});
    const preparation = prepareQualificationAssessment(input, resources);
    const occurrence = deepFreeze({cCallRef: 'c-call://component/f11-fp-proof-delivery',
      runId: 'run://component/f11-fp-proof-delivery', graphCallId: 'graph-call://component/f11-fp-proof-delivery',
      frameId: 'frame://component/f11-fp-proof-delivery', programLocusRef: input.task.slotRef,
      taskOrdinal: null, attempt: 1, executionAuthority: null,
      qualificationOwnerBasis: {cCallRef: 'c-call://component/f11-fp-proof-delivery'}});
    const resolution = QUALIFICATION_ASSESSMENT_IMPLEMENTATION_DESCRIPTOR;
    const base = {resolution, value: input, inputDigest: hash(input), occurrence,
      failureValueKind: 'self_conformance_failure', verifyAuthority: () => true, validateSuccess: () => false,
      resolveWorkerContracts: () => ({instructionContractRef: preparation.request.instructionContractRef,
        resultContractRef: preparation.request.resultContractRef}),
      qualificationResources: resources, qualificationPreparation: preparation,
      loadImplementation: async () => realizeQualificationAssessment};
    const diagnostic = receipt => readRuntimeFailureDiagnosticSubject(receipt.ownerObservation.diagnosticRef);
    const refused = (receipt, message) => {
      assert.equal(receipt.kind, 'closed_leaf_owner_receipt');
      assert.equal(receipt.effectDisposition, 'not_dispatched');
      assert.equal(receipt.ownerObservation.stage, 'preparation');
      assert.equal(receipt.ownerObservation.reason, 'thrown');
      assert.equal(receipt.candidate.resultCandidate.failureClass, 'implementation_exception');
      assert.match(diagnostic(receipt).message, message);
    };

    // The old emitted owner calls the same real realization without argument5.
    const baseline = await import(pathToFileURL(join(baselineTenant,
      'build/code/src/implementation/leaf_invocation_port.js')).href);
    const old = await baseline.invokeLeafOwnerBoundary(base);
    refused(old, /qualification assessment lacks an exact current owner and admitted task/);

    let captured;
    const prepared = await invokeLeafOwnerBoundary({...base, loadImplementation: async () => (...args) => {
      captured = args;
      return realizeQualificationAssessment(...args);
    }});
    assert.equal(prepared.kind, 'prepared_probabilistic_leaf_owner_invocation');
    assert.strictEqual(prepared.workerRequest, preparation.request);
    assert.deepEqual(prepared.workerRequest, preparation.request);
    assert.strictEqual(captured[0], input);
    assert.strictEqual(captured[1], occurrence);
    assert.equal(typeof captured[2], 'function', 'argument3 remains the owner assembly operation');
    assert.equal(captured[3], undefined, 'qualification does not receive a command/revision verifier');
    assert(Object.isFrozen(captured[4]));
    assert.strictEqual(captured[4].qualificationPreparation(input, occurrence), preparation);
    assert.throws(() => captured[4].qualificationPreparation(structuredClone(input), occurrence), /exact admitted input\/occurrence/);
    assert.throws(() => captured[4].qualificationPreparation(input, {...occurrence}), /exact admitted input\/occurrence/);

    for (const [name, suppliedInput, suppliedOccurrence] of [
      ['copied input', structuredClone(input), occurrence],
      ['copied occurrence', input, {...occurrence}],
    ]) {
      const denied = await invokeLeafOwnerBoundary({...base, loadImplementation: async () => (_input, _occurrence, ...args) =>
        realizeQualificationAssessment(suppliedInput, suppliedOccurrence, ...args)});
      refused(denied, /native proof operation differs from its exact admitted input\/occurrence/);
      assert.equal(denied.ownerObservation.errorClass, 'TypeError', name);
    }
    const missingOwner = {...occurrence};
    delete missingOwner.qualificationOwnerBasis;
    refused(await invokeLeafOwnerBoundary({...base, occurrence: missingOwner}),
      /qualification assessment lacks an exact current owner and admitted task/);
    refused(await invokeLeafOwnerBoundary({...base, qualificationPreparation: undefined}),
      /qualification assessment lacks an exact current owner and admitted task/);
    assert.throws(() => prepareQualificationAssessment(input), /qualification_resource_dependency_missing/);
    const crossed = {...input, task: identity({...input.task,
      resource: {...input.task.resource, digest: hash('crossed resource')}},
      'taskRef', 'taskDigest', 'qualification-task://abiogenesis/')};
    assert.throws(() => resolveQualificationAssessment(crossed, resources), /missing_or_crossed/);

    // The native lookup premise is explicit. The emitted dispatcher and actual
    // command/revision exact-occurrence verifier execute, including their
    // coordinate comparison; no assembly or actor operation is invoked.
    const instructionBasis = Object.freeze({componentNativeAdmission: true});
    let authenticatedCall;
    const port = await privateOwner('implementation/leaf_invocation_port.js', [], {
      '../abg/execution_basis.js': {authenticateNativeInstructionAssemblyBasis: basis =>
        basis === instructionBasis ? {call: authenticatedCall} : null},
    });
    for (const implementationRef of [command.implementationRef, revision.implementationRef]) {
      const value = deepFreeze({kind: 'component_positional_input'});
      const exactOccurrence = deepFreeze({...occurrence, qualificationOwnerBasis: undefined,
        nativeInstructionAssemblyBasis: instructionBasis});
      authenticatedCall = {...exactOccurrence};
      const request = deepFreeze({...preparation.request, implementationRef, inputDigest: hash(value)});
      const result = await port.invokeLeafOwnerBoundary({resolution: {...resolution, implementationRef},
        value, inputDigest: hash(value), occurrence: exactOccurrence,
        failureValueKind: 'self_conformance_failure', verifyAuthority: () => true, validateSuccess: () => false,
        resolveWorkerContracts: base.resolveWorkerContracts, loadImplementation: async () =>
          (supplied, suppliedOccurrence, assemble, verifyOccurrence, nativeProof) => {
            assert.strictEqual(supplied, value);
            assert.strictEqual(suppliedOccurrence, exactOccurrence);
            assert.equal(typeof assemble, 'function');
            assert.equal(typeof verifyOccurrence, 'function');
            assert.equal(verifyOccurrence(exactOccurrence), true);
            assert.equal(verifyOccurrence({...exactOccurrence}), false);
            authenticatedCall = {...authenticatedCall, cCallRef: 'c-call://foreign'};
            assert.equal(verifyOccurrence(exactOccurrence), false);
            assert(Object.isFrozen(nativeProof));
            return deepFreeze({kind: 'prepared_probabilistic_leaf_invocation', schemaVersion: '5.0.0',
              workerRequest: request, complete() { throw new Error('actor completion is outside this test'); }});
          }});
      assert.equal(result.kind, 'prepared_probabilistic_leaf_owner_invocation');
      assert.strictEqual(result.workerRequest, request);
    }
    const report = {baseline: 'exact C05 preparation implementation_exception reproduced',
      repaired: 'actual F_P dispatcher and actual qualification realization return the same prepared request',
      inputRepresentation: input.task.representation, inputDigest: hash(input), resource: input.task.resource,
      requestDigest: hash(preparation.request), promptDigest: hash(preparation.request.prompt),
      promptBytes: Buffer.byteLength(preparation.request.prompt), negatives: ['copied input', 'copied occurrence',
        'missing current owner', 'missing borrowed preparation', 'missing resources', 'crossed resource coordinate'],
      positionalConservation: ['argument3 assembly callback', 'qualification argument4 undefined',
        'command/revision argument4 exact occurrence and native coordinates'],
      qualificationPreparationAcquisitions: 1, helperActorProviderCalls: 0, RuntimeAdmissions: 0,
      premise: 'current lower owner admission and command/revision native lookup explicitly supplied; no whole installed proof',
      elapsedMs: performance.now() - started, semanticQualification: 'unknown; not exercised'};
    t.diagnostic(JSON.stringify(report));
    if (reportPath) fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n', {flag: 'wx'});
  });
