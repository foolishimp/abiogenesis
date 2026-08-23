import assert from "node:assert/strict";

export function installedContractCatalog(verified) {
  return Object.freeze({
    productId: verified.productId,
    productContentDigest: verified.productContentDigest,
    catalogId: verified.catalogId,
    catalogVersion: "5.0.0",
    catalogDigest: verified.catalogDigest,
  });
}

export function installedDefinitionCall({
  publicApi,
  product,
  contractCatalog,
  definitionContractCoordinates,
  operationId,
  memberKey,
  invocationRef,
  request,
  slots,
  resources,
  correlationRef,
  eventTime,
  provenanceRefs,
}) {
  const definitions = publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions
    .filter((definition) =>
      definition.definitionKey.operationId === operationId &&
      definition.definitionKey.memberKey === memberKey
    );
  assert.equal(definitions.length, 1, `${operationId}#${memberKey}`);
  const definition = definitions[0];
  const operation = definitionContractCoordinates.operations.find((row) =>
    row.operationId === operationId
  );
  const member = operation?.members.find((row) => row.memberKey === memberKey);
  assert.ok(member, `${operationId}#${memberKey} contract coordinates`);
  const requestDigest = product.sha256Canonical(request);
  const authorityDigest = product.sha256Canonical(slots);
  const definitionKey = definition.definitionKey;
  return {
    invocation: {
      kind: "public_invocation",
      schemaVersion: "5.0.0",
      invocationContract: {
        contractCatalog,
        flatRow: {
          contractId: "abg.schema.public-operation-invocation",
          contractVersion: "5.0.0",
          contractDigest:
            publicApi.PUBLIC_PROJECTION_PAYLOADS.commonSchemaAsset.contentDigest,
        },
        nestedSelector: {
          selectorKind: "schema_definition",
          definitionKey: null,
          slot: null,
          definitionRef: "#/$defs/PublicInvocation",
        },
      },
      invocationRef,
      invocationDigest: product.sha256Canonical({
        definitionKey,
        definitionDigest: definition.definitionDigest,
        invocationRef,
        requestDigest,
        authorityDigest,
      }),
      definitionRef: definition.definitionRef,
      definitionVersion: "5.0.0",
      definitionDigest: definition.definitionDigest,
      definitionKey,
      contractCatalog,
      invocationAuthority: {
        kind: "invocation_authority",
        definitionKey,
        authorityDigest,
        slots,
      },
      requestContract: member.slots.request,
      requestRef: `${invocationRef}/request`,
      requestDigest,
      request,
      expectedResultContract: member.slots.result,
      expectedRefusalContract: member.slots.refusal,
      expectedNonTerminalContract: member.slots.nonTerminal,
      correlationRef,
      eventTime,
      provenanceRefs,
    },
    resources,
  };
}

export function rehashInstalledDefinitionCall(product, call) {
  call.invocation.requestDigest = product.sha256Canonical(
    call.invocation.request,
  );
  call.invocation.invocationAuthority.authorityDigest =
    product.sha256Canonical(call.invocation.invocationAuthority.slots);
  call.invocation.invocationDigest = product.sha256Canonical({
    definitionKey: call.invocation.definitionKey,
    definitionDigest: call.invocation.definitionDigest,
    invocationRef: call.invocation.invocationRef,
    requestDigest: call.invocation.requestDigest,
    authorityDigest: call.invocation.invocationAuthority.authorityDigest,
  });
  return call;
}
