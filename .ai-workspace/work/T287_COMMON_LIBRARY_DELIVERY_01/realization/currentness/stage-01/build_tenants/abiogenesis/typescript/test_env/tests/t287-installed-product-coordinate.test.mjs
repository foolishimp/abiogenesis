// T-287 sandbox UAT A04-01: InstalledProduct coordinates survive the native
// Run/read/release joins. These are model-free component discriminators, not
// installed execution or release qualification. Lower owner facts below are
// explicit lookup premises; no event, Run, file effect or provider is invoked.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as Effect from 'effect/Effect';
import { productInstallCoordinate } from '../../build/code/src/product/environment.js';
import { sha256Canonical as hash } from '../../build/code/src/shared/digests.js';
import { constructExactOperationInvocationCoordinate } from '../../build/code/src/shared/operation_definition_coordinate.js';
import { runOperationAuthorityMatches, } from '../../build/code/src/product/run_invocation_operation.js';
import { RUN_OPERATION_CONTRACTS } from '../../build/code/src/product/run_operation_contracts.js';
import { ABG_PROJECT_READ_CONTRACTS } from '../../build/code/src/abg/project_read_operation_contracts.js';
import { releaseArtifactCoordinate } from '../../build/code/src/product/release_snapshot_operations.js';
import { privateOwner } from '../support/r10-private-owner-harness.mjs';

const coordinate = ref => ({ ref, digest: hash({ ref }) });
// Two same-content metadata carriers deliberately have distinct install roots.
// Their admission is a lower-owner premise, not established by these tests.
const contentDigest = hash({ payload: 'same immutable Product content' });
const installs = ['first', 'second'].map(name => ({
  kind: 'product_install', schemaVersion: '5.0.0', disposition: 'admitted',
  installId: `fixture://install/${name}`, installedRoot: `/fixture/${name}`,
  productContentDigest: contentDigest, admissionEventRef: `fixture://admitted/${name}`,
}));
const canonicalProducts = () => installs.map(productInstallCoordinate);
const contentProducts = () => installs.map(install => ({
  ref: install.installId, digest: install.productContentDigest,
}));
const alteredProducts = products => ({
  content: contentProducts(),
  digest: [{ ...products[0], digest: hash('foreign install metadata') }, products[1]],
  reference: [{ ...products[0], ref: 'fixture://foreign-install' }, products[1]],
  missing: products.slice(0, 1),
  duplicate: [products[0], products[0]],
});

function runFixture(memberKey) {
  const continuing = ['current_intent', 'selected_action'].includes(memberKey);
  const packet = continuing ? RUN_OPERATION_CONTRACTS.continue[memberKey]
    : RUN_OPERATION_CONTRACTS.invoke[memberKey];
  const binding = { bindingId: 'fixture://binding', bindingDigest: hash('binding'),
    lockId: 'fixture://lock', lockDigest: hash('lock'), authorizedActorRef: 'fixture://actor' };
  const catalog = { basisDigest: hash('catalog') };
  const catalogView = { viewDigest: hash('view'), allowlist: ['fixture://graph'] };
  const resolution = { resolution: { programRef: 'fixture://program', programDigest: hash('program'),
    graphFunctionRef: 'fixture://graph', graphFunctionDigest: hash('graph'),
    programGraphFunctionMembership: coordinate('fixture://membership') } };
  const input = { contract: coordinate('fixture://input-contract'), valueRef: 'fixture://value',
    value: { answer: 42 }, valueDigest: hash({ answer: 42 }) };
  const request = memberKey === 'start' ? { input, target: { kind: 'next' } }
    : continuing ? { continuationInput: { digest: input.valueDigest } }
    : { input: input.value, inputContract: input.contract };
  const policy = { policyRef: 'fixture://policy', policyDigest: hash('policy') };
  const grants = packet.metadata.capabilityRefs.map(ref => ({ grantRef: `fixture://grant/${ref}`, grantDigest: hash(ref) }));
  const authority = { authorityRef: 'fixture://attribution', authorityDigest: hash('attribution') };
  const resource = { kind: 'fixture lower-owner event resource' }, steering = hash(resource);
  const slots = { workspace_binding: { ref: binding.bindingId, digest: binding.bindingDigest },
    dependency_lock: { ref: binding.lockId, digest: binding.lockDigest }, product_set: canonicalProducts(),
    catalog_scope: { catalog: { ref: `graph-function-catalog://abiogenesis/${catalog.basisDigest.slice(7)}`, digest: catalog.basisDigest },
      view: { ref: `graph-function-catalog-view://abiogenesis/${catalogView.viewDigest.slice(7)}`, digest: catalogView.viewDigest },
      allowlist: catalogView.allowlist }, execution_program: { ref: resolution.resolution.programRef, digest: resolution.resolution.programDigest },
    graph_function: memberKey === 'start' ? null : { graphFunction: { ref: resolution.resolution.graphFunctionRef,
      digest: resolution.resolution.graphFunctionDigest }, membership: resolution.resolution.programGraphFunctionMembership },
    input_contract: input, session_policy: { ref: policy.policyRef, digest: policy.policyDigest },
    capability_grants: { requiredCapabilityRefs: packet.metadata.capabilityRefs,
      grants: grants.map(g => ({ ref: g.grantRef, digest: g.grantDigest })) },
    actor: { actor: { ref: binding.authorizedActorRef, digest: hash({ actorRef: binding.authorizedActorRef }) },
      attribution: { ref: authority.authorityRef, digest: authority.authorityDigest } },
    transport_steering: { ref: `transport-steering://abiogenesis/${steering.slice(7)}`, digest: steering } };
  const invocation = { definitionKey: packet.definitionKey, request, invocationAuthority: { slots } };
  const matches = products => runOperationAuthorityMatches(
    { ...invocation, invocationAuthority: { slots: { ...slots, product_set: products } } },
    { catalog, catalogView }, resolution, binding, installs, policy, grants, authority, resource,
  );
  return { matches };
}

for (const memberKey of ['start', 'invoke', 'current_intent', 'selected_action']) {
  test(`${memberKey} accepts canonical installs and rejects content hashes, tampering and lost population`, () => {
    const { matches } = runFixture(memberKey), products = canonicalProducts();
    assert.notEqual(products[0].digest, contentDigest);
    assert.notEqual(products[0].digest, products[1].digest);
    assert.equal(matches(products), true);
    assert.equal(matches([...products].reverse()), true, 'existing Run set order remains immaterial');
    for (const [name, candidate] of Object.entries(alteredProducts(products))) {
      assert.equal(matches(candidate), false, name);
    }
    assert.equal(matches(null), false);
    assert.equal(matches([]), false);
  });
}

const prefix = { eventLogRef: 'fixture://prefix', coordinateDigest: hash('prefix') };
const environment = { kind: 'exact_prefix_workspace_environment', productInstalls: installs,
  workspaceBinding: { bindingId: 'fixture://binding', bindingDigest: hash('binding'),
    admissionEventRef: 'fixture://binding-event', authorizedActorRef: 'fixture://actor' },
  resolvedProductLock: { lockId: 'fixture://lock', lockDigest: hash('lock') },
  workspaceAuthorityBasis: { authorizedActorRef: 'fixture://actor' } };

for (const memberKey of ['run_status', 'run_result', 'run_replay', 'run_gaps', 'graph_call_result', 'graph_call_replay']) {
  test(`${memberKey} preserves canonical InstalledProduct authority before source lookup`, async () => {
    const packet = ABG_PROJECT_READ_CONTRACTS[memberKey];
    const grants = packet.metadata.capabilityRefs.map(ref => ({ grantRef: `fixture://read-grant/${ref}`, grantDigest: hash(ref) }));
    const contractCatalog = coordinate('fixture://current-reader-catalog'), flatRow = { fixture: 'current-reader-row' };
    let sourceLookups = 0, closes = 0;
    const owner = await privateOwner('abg/project_read_definition_bindings.js', ['runReadKernel'], {
      './definition_event_resource.js': {
        acquireAbgEventResource: () => ({ kind: 'acquired_abg_event_resource', resource: { entryPrefix: prefix } }),
        closeAbgEventResource: () => { closes += 1; return { acquisitionKind: 'reopen' }; },
      },
      './environment_admission.js': { projectExactPrefixWorkspaceEnvironment: () => environment },
      '../product/invocation.js': {
        constructCapabilityGrant: (_authority, _actor, _operation, capabilityRef) => grants[packet.metadata.capabilityRefs.indexOf(capabilityRef)],
        validateCapabilityGrantForProductBasis: () => true,
      },
      '../product/verify_product.js': { projectProductManifestOperationCoordinate: () => ({ contractCatalog, flatRow }) },
      './project_read_ports.js': { prepareRunReadAtDurablePrefix: () => { sourceLookups += 1; return null; } },
    });
    const slots = { workspace_binding: { ref: environment.workspaceBinding.bindingId, digest: environment.workspaceBinding.bindingDigest },
      product_set: canonicalProducts(), dependency_lock: { ref: environment.resolvedProductLock.lockId, digest: environment.resolvedProductLock.lockDigest },
      capability_grants: { requiredCapabilityRefs: packet.metadata.capabilityRefs, grants: grants.map(g => ({ ref: g.grantRef, digest: g.grantDigest })) }, actor: null };
    const call = products => ({ invocation: { definitionKey: packet.definitionKey, contractCatalog, requestContract: { flatRow },
      invocationAuthority: { slots: { ...slots, product_set: products } }, request: { source: { sourceRef: 'fixture://absent-source', sourceDigest: hash('absent') },
        projectionBasis: { projectionBasisRef: prefix.eventLogRef, projectionBasisDigest: prefix.coordinateDigest } } }, resources: { eventResource: {} } });
    const invoke = products => Effect.runPromise(owner.runReadKernel(packet)(call(products)));
    const acceptedAuthority = await invoke(canonicalProducts());
    assert.equal(acceptedAuthority.ownerOutput.value.code, 'unknown_source', 'canonical authority reaches actual source-owner lookup');
    assert.equal(sourceLookups, 1);
    for (const [name, products] of Object.entries(alteredProducts(canonicalProducts()))) {
      const refused = await invoke(products);
      assert.equal(refused.ownerOutput.value.code, 'projection_basis_mismatch', name);
      assert.deepEqual(refused.ownerOutput.value.issuePaths, ['/invocationAuthority'], name);
    }
    assert.equal(sourceLookups, 1, 'refused coordinates never reach the source owner');
    assert.equal(closes, 6, 'every supplied read resource is closed');
  });
}

test('release artifact fold consumes the unchanged canonical productSet and refuses other coordinate domains', async () => {
  const owner = await privateOwner('abg/artifact_truth.js', ['RuntimeArtifactFacts'], {
    './environment_admission.js': { projectExactPrefixWorkspaceEnvironment: () => environment },
    '../implementation/release_publication.js': {
      isReleaseOperationArtifact: () => true,
      projectReleaseQualification: () => ({ fixture: 'explicit lower qualification premise' }),
    },
  });
  // Exact invocation, artifact hash, event basis and causal binding are actual
  // owner checks. Release adequacy/schema/environment are labelled premises.
  const invocation = constructExactOperationInvocationCoordinate({ operationId: 'abg.operation.release.snapshot',
    memberKey: 'published_rc', definitionDigest: hash('release-definition') }, 'fixture://release-invocation', hash('release-request'));
  const scope = coordinate('fixture://release-scope');
  const prepare = products => {
    const artifact = { memberKey: 'published_rc', invocation, scope, request: {}, proof: {}, selection: {},
      entryPrefix: prefix, workspaceBinding: coordinate('fixture://binding'), actorRef: 'fixture://actor', productSet: products,
      dependencyLock: { ref: environment.resolvedProductLock.lockId, digest: environment.resolvedProductLock.lockDigest } };
    const artifactCoordinate = releaseArtifactCoordinate(artifact);
    const causes = [environment.workspaceBinding.admissionEventRef];
    const payload = { ...invocation, authorityScopeRef: scope.ref, authorityScopeDigest: scope.digest,
      artifactRef: artifactCoordinate.ref, artifactDigest: artifactCoordinate.digest,
      ownerAdmittedDisposition: 'admitted', artifact, correlationId: 'fixture://correlation', causationEventRefs: causes };
    const sourceEvent = { aggregateType: 'workspace', aggregateId: scope.ref, parentAggregateId: null,
      workflowVersion: '5.0.0', scopeClass: 'workspace', basisId: scope.ref, correlationId: payload.correlationId,
      causationEventRefs: causes, payload, eventId: 'fixture://release-event', payloadDigest: hash(payload) };
    const facts = new owner.RuntimeArtifactFacts();
    const result = facts.prepare({ sourceEvent, initiates: [{ name: 'public_operation_artifact_available', identity: scope.ref }] });
    assert.equal(facts.artifacts.length, 0, 'preparation preserves its accepted predecessor');
    return result;
  };
  const products = canonicalProducts();
  assert.deepEqual(prepare(products).artifact.artifact.productSet, products);
  for (const [name, candidate] of Object.entries(alteredProducts(products))) {
    assert.throws(() => prepare(candidate), /release artifact actor\/environment differs/, name);
  }
});
