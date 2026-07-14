const OPERATION_PREFIX = "abg.operation.";
const MEMBERS = Object.freeze([
  Object.freeze({ member: "request", symbolField: "requestSymbol" }),
  Object.freeze({ member: "result", symbolField: "resultSymbol" }),
  Object.freeze({ member: "refusal", symbolField: "refusalSymbol" })
]);

function nonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${label}: expected a non-empty string`);
  }
  return value;
}

export function projectPublicOperationSchemaDefinitions(operationRegister) {
  if (!Array.isArray(operationRegister)) {
    throw new TypeError("public operation schema projection: register must be an array");
  }
  const operationIds = new Set();
  const contractIds = new Set();
  const relativePaths = new Set();
  const projected = [];
  for (const operation of operationRegister) {
    const operationId = nonEmptyString(
      operation?.operationId,
      "public operation schema projection operationId"
    );
    if (!operationId.startsWith(OPERATION_PREFIX)) {
      throw new TypeError(
        `public operation schema projection: invalid identity ${operationId}`
      );
    }
    if (operationIds.has(operationId)) {
      throw new TypeError(
        `public operation schema projection: duplicate operation ${operationId}`
      );
    }
    operationIds.add(operationId);
    const slug = nonEmptyString(
      operationId.slice(OPERATION_PREFIX.length),
      `public operation schema projection slug for ${operationId}`
    );
    for (const { member, symbolField } of MEMBERS) {
      const contractId = `abg.schema.operation.${slug}.${member}`;
      const relativePath =
        `contracts/schemas/operations/${slug}/${member}.schema.json`;
      if (contractIds.has(contractId) || relativePaths.has(relativePath)) {
        throw new TypeError(
          `public operation schema projection: duplicate projection ${contractId}`
        );
      }
      contractIds.add(contractId);
      relativePaths.add(relativePath);
      projected.push(Object.freeze({
        contractId,
        relativePath,
        nativeType: nonEmptyString(
          operation?.[symbolField],
          `public operation schema projection ${symbolField} for ${operationId}`
        )
      }));
    }
  }
  return Object.freeze(projected);
}
