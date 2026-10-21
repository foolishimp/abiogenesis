import assert from 'node:assert/strict';
import { mkdir, readFile, realpath } from 'node:fs/promises';
import { join } from 'node:path';
import { ref } from '../fixtures/registered-selection-product/index.mjs';

export const STDO3_SOURCE = Object.freeze({
  basisRef: 'stdo://releases/v3.0.0-rc.1/',
  manifestDigest: 'sha256:069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232',
  memberPath: 'standards/EXECUTIVE_BASELINE.md',
  memberDigest: 'sha256:fcef434630e270d216f494de97ee727ad46690db89a4b73edac4b88ff921c62e',
});

const policyText = 'Under the declared bounded Executive frame, select only a permitted registered renderer satisfying the supplied task and recipient requirements, or preserve an explicit gap. Respect each declared purpose, conditions, input, result and effect contract. Supplied observations are current request facts, not independently verified workspace state. Do not generate capabilities, inspect or mutate the workspace, repair input, confer operation authority or claim wider acceptance.';

/** Current STDO3 source for the existing owners, retaining the P4 default role.
 * The caller supplies an exact source mirror; no ambient install is selected. */
export async function stdo3RunEnvironment({ gtl, product, sourceRoot, selectorRole }) {
  assert.ok(typeof sourceRoot === 'string' && sourceRoot.length > 0, 'explicit exact STDO3 sourceRoot is required');
  const root = await realpath(sourceRoot), recordPath = join(root, 'manifest.json');
  const recordBytes = await readFile(recordPath);
  assert.equal(product.sha256Bytes(recordBytes), STDO3_SOURCE.manifestDigest, 'exact STDO3 manifest');
  const members = product.runEnvironmentRecordMembers('stdo_source_manifest@1', recordBytes);
  assert.ok(members, 'manifest-owned source inventory');
  const bytes = await readFile(join(root, STDO3_SOURCE.memberPath));
  assert.equal(product.sha256Bytes(bytes), STDO3_SOURCE.memberDigest, 'exact Executive member');
  assert.ok(members.some(m => m.path === STDO3_SOURCE.memberPath && m.type === 'file' &&
    m.digest === STDO3_SOURCE.memberDigest), 'member belongs to the exact manifest');
  const contextRef = ref('context', 'stdo3-executive'), memberRef = ref('member', STDO3_SOURCE.memberPath);
  const contextMembers = [{ memberRef, path: STDO3_SOURCE.memberPath,
    byteCount: bytes.length, digest: STDO3_SOURCE.memberDigest }];
  const headings = ['Executive', 'The three duties'];
  const sourceBindings = headings.map(heading => {
    const marker = Buffer.from(`### ${heading}\n`), startByte = bytes.indexOf(marker);
    assert.ok(startByte >= 0 && bytes.indexOf(marker, startByte + marker.length) < 0, `unique ${heading} heading`);
    const next = bytes.indexOf(Buffer.from('\n### '), startByte + marker.length);
    const endByte = next < 0 ? bytes.length : next + 1;
    return { contextRef, memberRef, memberDigest: STDO3_SOURCE.memberDigest, startByte, endByte,
      spanDigest: product.sha256Bytes(bytes.subarray(startByte, endByte)) };
  });
  const dependency = { dependencyRef: ref('dependency', 'stdo3-source'), basisRef: STDO3_SOURCE.basisRef,
    recordRef: STDO3_SOURCE.basisRef + 'manifest.json', recordDigest: STDO3_SOURCE.manifestDigest,
    recordFormat: 'stdo_source_manifest@1', inventoryDigest: gtl.stdoInventoryDigest(members), members };
  // Optional data changes only this existing selector's declared source/policy;
  // omitted data keeps the frozen P4 role exactly as before.
  const role = selectorRole === undefined ? { graphFunctionRef: ref('graph-function', 'root'), programLocusRef: ref('node', 'select'), role: 'selector',
      frameRefs: headings.map(heading => STDO3_SOURCE.basisRef + STDO3_SOURCE.memberPath + '#' + heading.toLowerCase().replaceAll(' ', '-')).sort(),
      policy: { policyRef: ref('policy', 'stdo3-native-suitability'), text: policyText,
        digest: product.sha256Bytes(Buffer.from(policyText)) },
      contextPolicy: { policyRef: ref('policy', 'stdo3-native-context'), selectors: ['full_source', 'active_binding_semantics'] },
      accessRefs: [], sourceBindings } : structuredClone(selectorRole);
  assert.equal(role.role, 'selector');
  assert.equal(role.graphFunctionRef, ref('graph-function', 'root'));
  assert.equal(role.programLocusRef, ref('node', 'select'));
  const declaration = gtl.constructStdoRunEnvironmentDeclaration({
    kind: 'run_environment_declaration', schemaVersion: '5.0.0',
    declarationRef: ref('declaration', 'stdo3-native-environment'), dependencies: [dependency],
    contexts: [{ contextRef, sourceLocator: STDO3_SOURCE.basisRef,
      inventoryDigest: product.sha256Canonical(contextMembers), members: contextMembers }],
    corpusAccess: null, accesses: [],
    roles: [role],
  });
  const physicalDependencies = [{ dependencyRef: dependency.dependencyRef, root, recordPath }];
  return { declaration, physicalDependencies, pythonPath: null,
    async resources({ authority, program, workspaceBinding, product: resourceProduct = product }) {
      const path = join(workspaceBinding.roots.archiveRoot, 'stdo3-selection-context');
      await mkdir(path, { recursive: true });
      const coordinates = { dependencies: physicalDependencies, pythonPath: null, temporaryRoot: await realpath(path) };
      return resourceProduct.constructRunEnvironmentResources({ kind: 'run_environment_resources', schemaVersion: '5.0.0', ...coordinates,
        permission: { authorityRef: authority.authorityRef, authorityDigest: authority.authorityDigest, actorRef: authority.actorRef,
          programRef: program.programRef, environmentRef: declaration.declarationRef,
          environmentDigest: resourceProduct.sha256Canonical(declaration), operations: ['read_context'], ...coordinates } });
    },
  };
}
