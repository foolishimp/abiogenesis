import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {constructWorksiteCommandExecutionModulePublication, WORKSITE_COMMAND_EXECUTION_CONTEXT_INVENTORY} from './stage/build_tenants/abiogenesis/typescript/build/code/src/gtl/worksite_command_execution.js';
import {renderWorksiteCommandExecutionPrompt} from './stage/build_tenants/abiogenesis/typescript/build/code/src/product/worksite_command_execution.js';
const root = new URL('./stage/build_tenants/abiogenesis/typescript/', import.meta.url);
const digest = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
const zero = 'sha256:' + '0'.repeat(64);
const publication = constructWorksiteCommandExecutionModulePublication({productId:'product://abiogenesis/typescript-tenant@5.0.0-rc.1', packageName:'@abiogenesis/typescript-tenant', packageVersion:'5.0.0-rc.1', artifactDigest:zero, productContentDigest:zero, productManifestDigest:zero});
const environment = publication.runEnvironments[0], members = [], spans = [];
for (const member of environment.contexts.flatMap(context => context.members)) {
  const bytes = await readFile(new URL(member.path, root));
  assert.equal(bytes.length, member.byteCount);
  assert.equal(digest(bytes), member.digest);
  members.push({...member, actualBytes:bytes.length, actualDigest:digest(bytes)});
  for (const role of environment.roles) for (const span of role.sourceBindings.filter(span => span.memberRef === member.memberRef)) {
    const selected = bytes.subarray(span.startByte, span.endByte);
    assert.equal(digest(selected), span.spanDigest);
    assert.equal(selected.toString('utf8'), role.policy.text);
    assert.equal(role.policy.text, renderWorksiteCommandExecutionPrompt.toString());
    spans.push({...span, actualDigest:digest(selected), rendererMatches:true});
  }
}
const inventory = await readFile(new URL(WORKSITE_COMMAND_EXECUTION_CONTEXT_INVENTORY.path, root));
assert.equal(inventory.toString('utf8'), WORKSITE_COMMAND_EXECUTION_CONTEXT_INVENTORY.content);
console.log(JSON.stringify({status:'satisfied', scope:'pure emitted GTL to Product material and renderer correspondence; no runtime', members, spans, inventory:{path:WORKSITE_COMMAND_EXECUTION_CONTEXT_INVENTORY.path, bytes:inventory.length, digest:digest(inventory)}},null,2));
