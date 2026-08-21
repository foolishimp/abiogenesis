function exact(values, predicate, label) {
  const matches = values.filter(predicate);
  if (matches.length !== 1) {
    throw new TypeError(`${label} must select one exact installed value`);
  }
  return matches[0];
}

function sameJson(product, left, right) {
  return product.canonicalJson(left) === product.canonicalJson(right);
}

function requireSlot({
  product,
  coordinate,
  contractCatalog,
  definition,
  slot,
  definitionRef,
}) {
  if (
    coordinate === null ||
    !sameJson(product, coordinate.contractCatalog, contractCatalog) ||
    coordinate.flatRow.contractId !== definition.definitionKey.operationId ||
    coordinate.flatRow.contractVersion !== "5.0.0" ||
    coordinate.nestedSelector.selectorKind !== "operation_definition_slot" ||
    !sameJson(
      product,
      coordinate.nestedSelector.definitionKey,
      definition.definitionKey,
    ) ||
    coordinate.nestedSelector.slot !== slot ||
    coordinate.nestedSelector.definitionRef !== definitionRef
  ) {
    throw new TypeError(
      `${definition.definitionKey.operationId}#${definition.definitionKey.memberKey} ${slot} lacks its exact owner-issued coordinate`,
    );
  }
  return coordinate;
}

export function constructInstalledPublicDefinitionCall({
  product,
  installedPublic,
  definitionContractCoordinates,
  contractCatalog,
  operationId,
  memberKey,
  request,
  slots,
  resources,
  requestRef,
  correlationRef,
  eventTime,
  provenanceRefs,
}) {
  if (definitionContractCoordinates === null) {
    throw new TypeError(
      "installed Public DefinitionCall requires verified definition coordinates",
    );
  }
  const definition = exact(
    installedPublic.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions,
    (candidate) =>
      candidate.definitionKey.operationId === operationId &&
      candidate.definitionKey.memberKey === memberKey,
    "installed Public definition",
  );
  const operation = exact(
    definitionContractCoordinates.operations,
    (candidate) => candidate.operationId === operationId,
    "verified operation coordinates",
  );
  const member = exact(
    operation.members,
    (candidate) => candidate.memberKey === memberKey,
    "verified member coordinates",
  );
  const installedOperation = exact(
    installedPublic.PUBLIC_OPERATION_CONTRACT_PROJECTIONS,
    (candidate) => candidate.operationId === operationId,
    "installed operation projection",
  );
  const installedMember = exact(
    installedOperation.definitions,
    (candidate) => candidate.definitionKey.memberKey === memberKey,
    "installed member projection",
  );
  const requestCoordinate = requireSlot({
    product,
    coordinate: member.slots.request,
    contractCatalog,
    definition,
    slot: "request",
    definitionRef: installedMember.requestContract.definitionRef,
  });
  const resultCoordinate = requireSlot({
    product,
    coordinate: member.slots.result,
    contractCatalog,
    definition,
    slot: "result",
    definitionRef: installedMember.resultContract.definitionRef,
  });
  const refusalCoordinate = requireSlot({
    product,
    coordinate: member.slots.refusal,
    contractCatalog,
    definition,
    slot: "refusal",
    definitionRef: installedMember.refusalContract.definitionRef,
  });
  const nonTerminalCoordinate = installedMember.nonTerminalContract === null
    ? member.slots.nonTerminal === null
      ? null
      : (() => {
          throw new TypeError("installed terminal definition has an extra coordinate");
        })()
    : requireSlot({
        product,
        coordinate: member.slots.nonTerminal,
        contractCatalog,
        definition,
        slot: "non_terminal",
        definitionRef: installedMember.nonTerminalContract.definitionRef,
      });
  const invocationAuthorityBody = Object.freeze({
    kind: "invocation_authority",
    definitionKey: definition.definitionKey,
    slots,
  });
  const invocationAuthority = Object.freeze({
    ...invocationAuthorityBody,
    authorityDigest: product.sha256Canonical(invocationAuthorityBody),
  });
  const requestDigest = product.sha256Canonical(request);
  const invocationBody = Object.freeze({
    kind: "public_invocation",
    schemaVersion: "5.0.0",
    invocationContract: Object.freeze({
      contractCatalog,
      flatRow: Object.freeze({
        contractId: "abg.schema.public-operation-invocation",
        contractVersion: "5.0.0",
        contractDigest:
          installedPublic.PUBLIC_PROJECTION_PAYLOADS.commonSchemaAsset
            .contentDigest,
      }),
      nestedSelector: Object.freeze({
        selectorKind: "schema_definition",
        definitionKey: null,
        slot: null,
        definitionRef: "#/$defs/PublicInvocation",
      }),
    }),
    definitionRef: definition.definitionRef,
    definitionVersion: "5.0.0",
    definitionDigest: definition.definitionDigest,
    definitionKey: definition.definitionKey,
    contractCatalog,
    invocationAuthority,
    requestContract: requestCoordinate,
    requestRef,
    requestDigest,
    request,
    expectedResultContract: resultCoordinate,
    expectedRefusalContract: refusalCoordinate,
    expectedNonTerminalContract: nonTerminalCoordinate,
    correlationRef,
    eventTime,
    provenanceRefs: Object.freeze([...provenanceRefs]),
  });
  const invocationDigest = product.sha256Canonical(invocationBody);
  return Object.freeze({
    invocation: Object.freeze({
      ...invocationBody,
      invocationRef:
        `invocation://abiogenesis/${invocationDigest.slice("sha256:".length)}`,
      invocationDigest,
    }),
    resources,
  });
}
