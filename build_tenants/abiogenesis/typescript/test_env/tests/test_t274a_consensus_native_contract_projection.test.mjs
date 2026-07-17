import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import test from "node:test";
import { promisify } from "node:util";

import { Ajv2020 } from "ajv/dist/2020.js";
import * as v from "valibot";

import {
  CONSENSUS_NATIVE_CHECK_REGISTRY,
  CONSENSUS_PUBLIC_CONTRACT_FAMILY,
  CONSENSUS_PUBLIC_CONTRACT_SOURCES,
  admitConsensusPublicContract
} from "../../build/semantic/code/src/abg/m03/contracts/consensus_contract_family.js";
import {
  absolutePosixPathSchema,
  canonicalIJsonSchema,
  defineNativeContract,
  nonEmptyTextSchema,
  projectNativeJsonSchema,
  refSchema,
  safePositiveIntegerSchema,
  semanticVersionSchema,
  uniqueByIdentityArray
} from "../../build/semantic/code/src/app/m04/public_contracts/native_contract_phase_a.js";
import {
  stableJson,
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";
import {
  CANONICAL_NATIVE_SCHEMA_PROJECTOR_DEPENDENCY_VERSIONS,
  resolveSemanticBuildNativeSchemaSource
} from "../../build/semantic/code/src/shared/validation/canonical_native_schema_projector.js";

const EXISTING_PROJECTION_DIGESTS = Object.freeze({
  absolute: "sha256:4189db4d6d4ff8bf19637217ae28e25d0e42cab91aac4b2f389afbc512a4c563",
  ijson: "sha256:3ca5714ea15cce5e71bf79e5411b0cebc73785bc2a07a5e7f5dcef3ef20bc806",
  nonempty: "sha256:c8d3fae39123000867798ba29c2ad8b3aac60d6ecc1902543f84402cc88646a2",
  positive: "sha256:90cab4980074d3d13512bc43e38392d94ddc8945280475df9af108af5eb341d4",
  ref: "sha256:16dcda30759a9b74eacb54b6dd989974d8f521f501c8fe73eea476911b80ceb3",
  request: "sha256:2c713239dee279a27961f322a34abd821a5e9861f0724e442c2af8b2a7c02275",
  semver: "sha256:99094b180b187e1972e2e8a96ae4b42757815bce9905601a671876e251803300",
  unique: "sha256:78236bbb3a7a69b81bd13354534517967b33a6550f34c4bee86b777fb7dffc02"
});

const execFileAsync = promisify(execFile);

const OPPOSITE_PREDICATE_MODULE_URL = new URL(
  "../../build/semantic/code/src/shared/validation/test_fixtures/opposite_predicate_source.js",
  import.meta.url
);

function oppositePredicateModule(predicateResult) {
  return `import * as v from "valibot";
import { freezeNativeValue } from "../immutable_native_value.js";

const ACTION = Object.freeze(v.check(
  () => ${predicateResult},
  "opposite predicate fixture"
));

export const OPPOSITE_PREDICATE_REGISTRY = Object.freeze({
  familyRef: "contract-family://example/checks@5",
  checks: Object.freeze([Object.freeze({
    checkId: "opposite_semantics",
    action: ACTION,
    relationRef: "REQ-EXAMPLE-001"
  })])
});

export const OPPOSITE_PREDICATE_SOURCE = freezeNativeValue({
  sourceLocator: {
    kind: "private_source_module",
    sourceRoot: "semantic_build",
    modulePath: "code/src/shared/validation/test_fixtures/opposite_predicate_source.js",
    exportName: "OPPOSITE_PREDICATE_SOURCE",
    memberPath: ["schema"]
  },
  namedChecks: {
    kind: "family_registry",
    exportName: "OPPOSITE_PREDICATE_REGISTRY",
    memberPath: []
  },
  schema: v.pipe(v.string(), ACTION)
});
`;
}

async function deriveOppositePredicateWitness() {
  const projectorUrl = new URL(
    "../../build/semantic/code/src/shared/validation/canonical_native_schema_projector.js",
    import.meta.url
  ).href;
  const script = `
import * as v from "valibot";
import { appendFile } from "node:fs/promises";
import {
  deriveCanonicalNativeSchemaProjection,
  resolveSemanticBuildNativeSchemaSource
} from ${JSON.stringify(projectorUrl)};
import {
  OPPOSITE_PREDICATE_SOURCE
} from ${JSON.stringify(OPPOSITE_PREDICATE_MODULE_URL.href)};

const source = await resolveSemanticBuildNativeSchemaSource(
  OPPOSITE_PREDICATE_SOURCE
);
const projection = deriveCanonicalNativeSchemaProjection({
  source,
  schemaRef: "abg.schema.test.opposite-predicate",
  schemaVersion: "5.0.0"
});
await appendFile(
  new URL(${JSON.stringify(OPPOSITE_PREDICATE_MODULE_URL.href)}),
  "\\n// changed after first resolution\\n",
  "utf8"
);
let cacheRefusal = null;
try {
  await resolveSemanticBuildNativeSchemaSource(
    OPPOSITE_PREDICATE_SOURCE
  );
} catch (error) {
  cacheRefusal = error instanceof Error ? error.message : String(error);
}
process.stdout.write(JSON.stringify({
  admitted: v.safeParse(OPPOSITE_PREDICATE_SOURCE.schema, "value").success,
  projectionDigest: projection.witness.projectionDigest,
  sourceBasisDigest: projection.witness.sourceBasisDigest,
  witnessDigest: projection.witness.witnessDigest,
  namedChecks: projection.witness.namedChecks,
  cacheRefusal
}));
`;
  const { stdout } = await execFileAsync(
    process.execPath,
    ["--input-type=module", "--eval", script],
    { cwd: process.cwd() }
  );
  return JSON.parse(stdout);
}

function collectNamedChecks(input, output = new Map()) {
  if (Array.isArray(input)) {
    for (const value of input) {
      collectNamedChecks(value, output);
    }
    return output;
  }
  if (typeof input !== "object" || input === null) {
    return output;
  }
  const check = input["x-abg-native-check"];
  if (typeof check === "string" && check.includes("#")) {
    output.set(check, {
      registrationDigest:
        input["x-abg-native-check-registration-digest"],
      relationRef: input["x-abg-native-relation-ref"] ?? null
    });
  }
  for (const value of Object.values(input)) {
    collectNamedChecks(value, output);
  }
  return output;
}

function compareCheckEntries([left], [right]) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function consensusContractIdentity(kind, definition) {
  return {
    contractId: definition.contractId,
    contractVersion: "5.0.0",
    schemaId: definition.contractId,
    schemaVersion: "5.0.0"
  };
}

test("T-274A projector basis versions equal the locked toolchain", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../../package.json", import.meta.url), "utf8")
  );
  const packageLock = JSON.parse(
    await readFile(new URL("../../package-lock.json", import.meta.url), "utf8")
  );
  const rootLock = packageLock.packages[""];
  assert.deepEqual(CANONICAL_NATIVE_SCHEMA_PROJECTOR_DEPENDENCY_VERSIONS, {
    valibot: packageJson.dependencies.valibot,
    valibotJsonSchema:
      packageJson.dependencies["@valibot/to-json-schema"]
  });
  assert.equal(
    rootLock.dependencies.valibot,
    CANONICAL_NATIVE_SCHEMA_PROJECTOR_DEPENDENCY_VERSIONS.valibot
  );
  assert.equal(
    rootLock.dependencies["@valibot/to-json-schema"],
    CANONICAL_NATIVE_SCHEMA_PROJECTOR_DEPENDENCY_VERSIONS.valibotJsonSchema
  );
  assert.equal(
    packageLock.packages["node_modules/valibot"].version,
    CANONICAL_NATIVE_SCHEMA_PROJECTOR_DEPENDENCY_VERSIONS.valibot
  );
  assert.equal(
    packageLock.packages["node_modules/@valibot/to-json-schema"].version,
    CANONICAL_NATIVE_SCHEMA_PROJECTOR_DEPENDENCY_VERSIONS.valibotJsonSchema
  );
});

test("T-274A preserves prior Phase A bytes and admits standard structural actions", () => {
  const existingSchemas = {
    absolute: absolutePosixPathSchema,
    ijson: canonicalIJsonSchema,
    nonempty: nonEmptyTextSchema,
    positive: safePositiveIntegerSchema,
    ref: refSchema,
    request: v.strictObject({
      targetRoot: absolutePosixPathSchema,
      createPolicy: v.literal("clean")
    }),
    semver: semanticVersionSchema,
    unique: uniqueByIdentityArray(
      v.strictObject({ ref: refSchema, value: v.string() })
    )
  };
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(existingSchemas).map(([kind, schema]) => [
        kind,
        stableSha256Digest(projectNativeJsonSchema(schema))
      ])
    ),
    EXISTING_PROJECTION_DIGESTS
  );

  const standardProjection = projectNativeJsonSchema(
    v.pipe(
      v.array(v.pipe(v.string(), v.minLength(1))),
      v.minLength(1),
      v.readonly()
    )
  );
  assert.equal(standardProjection.minItems, 1);
  assert.equal(standardProjection.items.minLength, 1);
  assert.equal(
    projectNativeJsonSchema(
      v.pipe(v.number(), v.integer(), v.minValue(1))
    ).minimum,
    1
  );
  for (const malformedMinimum of [
    Number.NaN,
    Number.POSITIVE_INFINITY,
    "1"
  ]) {
    assert.throws(
      () =>
        projectNativeJsonSchema(
          v.pipe(v.number(), v.minValue(malformedMinimum))
        ),
      /min_value requires a finite number/u
    );
  }
  for (const malformedLength of [-1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(
      () =>
        projectNativeJsonSchema(
          v.pipe(v.array(v.string()), v.minLength(malformedLength))
        ),
      /min_length requires a non-negative safe integer/u
    );
  }
});

test("T-274A structurally projects nine schemas and registration digests", async () => {
  const checks = new Map();
  const ajv = new Ajv2020({ strict: false });
  for (const [kind, definition] of Object.entries(
    CONSENSUS_PUBLIC_CONTRACT_FAMILY
  )) {
    const projected = projectNativeJsonSchema(definition.schema, {
      namedCheckRegistry: CONSENSUS_NATIVE_CHECK_REGISTRY
    });
    const repeated = projectNativeJsonSchema(definition.schema, {
      namedCheckRegistry: CONSENSUS_NATIVE_CHECK_REGISTRY
    });
    assert.equal(stableJson(projected), stableJson(repeated));
    assert.doesNotMatch(stableJson(projected), /function|=>/u);
    ajv.compile(projected);
    for (const [checkRef, digest] of collectNamedChecks(projected)) {
      checks.set(checkRef, digest);
    }

    const identity = consensusContractIdentity(kind, definition);
    const source = await resolveSemanticBuildNativeSchemaSource(
      CONSENSUS_PUBLIC_CONTRACT_SOURCES[kind]
    );
    const nativeDefinition = defineNativeContract({
      identity,
      source
    });
    assert.equal(nativeDefinition.schema, definition.schema);
    assert.equal(
      nativeDefinition.schemaCoordinate.schemaDigest,
      stableSha256Digest(nativeDefinition.projectedSchema)
    );
    assert.equal(nativeDefinition.projectedSchema.$id, definition.contractId);
    assert.equal(
      nativeDefinition.projectionWitness.projectionDigest,
      nativeDefinition.schemaCoordinate.schemaDigest
    );
    assert.equal(
      nativeDefinition.projectedSchema["x-abg-native-projector-ref"],
      nativeDefinition.projectionWitness.projectorRef
    );
    assert.equal(
      nativeDefinition.projectedSchema["x-abg-native-projector-version"],
      nativeDefinition.projectionWitness.projectorVersion
    );
    assert.equal(
      nativeDefinition.projectedSchema[
        "x-abg-native-projector-basis-digest"
      ],
      nativeDefinition.projectionWitness.projectorBasisDigest
    );
    const { witnessDigest, ...witnessBasis } =
      nativeDefinition.projectionWitness;
    assert.equal(witnessDigest, stableSha256Digest(witnessBasis));
    assert.deepEqual(
      nativeDefinition.projectionWitness.namedChecks.map(
        ({ checkRef }) => checkRef
      ),
      [...collectNamedChecks(projected).keys()].sort()
    );
    assert.equal(
      Object.isFrozen(nativeDefinition.projectionWitness.namedChecks),
      true
    );
    assert.deepEqual(nativeDefinition.projectionWitness.namedCheckSource, {
      kind: "family_registry",
      exportName: "CONSENSUS_NATIVE_CHECK_REGISTRY",
      memberPath: []
    });
  }

  assert.equal(Object.keys(CONSENSUS_PUBLIC_CONTRACT_FAMILY).length, 9);
  assert.deepEqual(
    Object.fromEntries([...checks].sort(compareCheckEntries)),
    Object.fromEntries(
      CONSENSUS_NATIVE_CHECK_REGISTRY.checks
        .map(({ checkId, relationRef }) => [
          `${CONSENSUS_NATIVE_CHECK_REGISTRY.familyRef}#${checkId}`,
          {
            registrationDigest: stableSha256Digest({
              familyRef: CONSENSUS_NATIVE_CHECK_REGISTRY.familyRef,
              checkId,
              actionKind: "validation",
              actionType: "check",
              actionReference: "valibot.check",
              relationRef
            }),
            relationRef
          }
        ])
        .sort(compareCheckEntries)
    )
  );
});

test("T-274A executes the native predicate separately from schema projection", () => {
  const subjectSchema =
    CONSENSUS_PUBLIC_CONTRACT_FAMILY.consensus_subject.schema;
  const subjectProjection = projectNativeJsonSchema(subjectSchema, {
    namedCheckRegistry: CONSENSUS_NATIVE_CHECK_REGISTRY
  });
  assert.equal(
    subjectProjection["x-abg-native-check"],
    `${CONSENSUS_NATIVE_CHECK_REGISTRY.familyRef}#joint_ticket_identity`
  );
  const structurallyValidRelationallyInvalidSubject = {
    kind: "consensus_subject",
    subjectContractRef: "contract:ticket",
    subjectRef: "ticket:T-274A",
    subjectDigest: `sha256:${"a".repeat(64)}`,
    submittingActorRef: "actor:builder",
    panelRef: "panel:review",
    roundPolicyRef: "policy:bounded",
    workspaceRef: "workspace:fixture",
    ticketRef: "ticket:T-274A",
    ticketDigest: null
  };
  assert.equal(
    new Ajv2020({ strict: false }).compile(subjectProjection)(
      structurallyValidRelationallyInvalidSubject
    ),
    true
  );
  assert.throws(
    () =>
      admitConsensusPublicContract(
        structurallyValidRelationallyInvalidSubject,
        "consensus_subject"
      ),
    /jointly present or absent/u
  );

  const sameMessageDifferentFunction = v.pipe(
    v.string(),
    v.check(
      () => true,
      "ticketRef and ticketDigest must be jointly present or absent"
    )
  );
  assert.throws(
    () =>
      projectNativeJsonSchema(sameMessageDifferentFunction, {
        namedCheckRegistry: CONSENSUS_NATIVE_CHECK_REGISTRY
      }),
    /unsupported action check/u
  );
});

test("T-274A witness binds opposite predicate semantics outside JSON Schema", async () => {
  await mkdir(new URL(".", OPPOSITE_PREDICATE_MODULE_URL), {
    recursive: true
  });
  try {
    await writeFile(
      OPPOSITE_PREDICATE_MODULE_URL,
      oppositePredicateModule("true"),
      "utf8"
    );
    const accepting = await deriveOppositePredicateWitness();
    await writeFile(
      OPPOSITE_PREDICATE_MODULE_URL,
      oppositePredicateModule("false"),
      "utf8"
    );
    const rejecting = await deriveOppositePredicateWitness();

    assert.equal(accepting.admitted, true);
    assert.equal(rejecting.admitted, false);
    assert.equal(accepting.projectionDigest, rejecting.projectionDigest);
    assert.deepEqual(accepting.namedChecks, rejecting.namedChecks);
    assert.match(
      accepting.cacheRefusal,
      /module bytes changed after first resolution/u
    );
    assert.match(
      rejecting.cacheRefusal,
      /module bytes changed after first resolution/u
    );
    assert.notEqual(accepting.sourceBasisDigest, rejecting.sourceBasisDigest);
    assert.notEqual(accepting.witnessDigest, rejecting.witnessDigest);
  } finally {
    await rm(new URL(".", OPPOSITE_PREDICATE_MODULE_URL), {
      force: true,
      recursive: true
    });
  }
});

test("T-274A rejects malformed, duplicate, and unknown named-check registrations", () => {
  const known = CONSENSUS_NATIVE_CHECK_REGISTRY.checks[0];
  const immutableRegistry = (checks) =>
    Object.freeze({
      familyRef: CONSENSUS_NATIVE_CHECK_REGISTRY.familyRef,
      checks: Object.freeze(checks.map((row) => Object.freeze(row)))
    });
  const project = (registry) =>
    projectNativeJsonSchema(v.pipe(v.array(v.string()), known.action), {
      namedCheckRegistry: registry
    });

  assert.throws(
    () =>
      project({
        familyRef: CONSENSUS_NATIVE_CHECK_REGISTRY.familyRef,
        checks: [known]
      }),
    /expected an immutable value/u
  );
  assert.throws(
    () =>
      project(
        immutableRegistry([
          known,
          {
            checkId: known.checkId,
            action: v.check(() => true),
            relationRef: null
          }
        ])
      ),
    /duplicate check identity/u
  );
  assert.throws(
    () =>
      project(
        immutableRegistry([
          known,
          {
            checkId: "other_check",
            action: known.action,
            relationRef: null
          }
        ])
      ),
    /duplicate check action/u
  );
  assert.throws(
    () =>
      project(
        immutableRegistry([
          {
            checkId: "mutable_check",
            action: v.check(() => true),
            relationRef: null
          }
        ])
      ),
    /expected an immutable value/u
  );
  assert.throws(
    () =>
      project(
        immutableRegistry([
          {
            checkId: "not_a_check",
            action: v.minLength(1),
            relationRef: null
          }
        ])
      ),
    /expected a Valibot check action/u
  );
  assert.throws(
    () =>
      project(
        immutableRegistry([
          {
            ...known,
            relationRef: "not a ref"
          }
        ])
      ),
    /invalid relation ref/u
  );
  assert.throws(
    () =>
      project(
        immutableRegistry([
          {
            ...known,
            invented: true
          }
        ])
      ),
    /invented: unknown field/u
  );
  assert.throws(
    () => projectNativeJsonSchema(v.pipe(v.string(), v.check(() => true))),
    /unsupported action check/u
  );
});

test("T-274A rejects lookalike native schemas and actions", () => {
  const forgedStringSchema = Object.freeze({
    ...v.string(),
    reference: () => undefined
  });
  const forgedRegexAction = Object.freeze({
    ...v.regex(/^allowed$/u),
    reference: () => undefined
  });
  const forgedBrandAction = Object.freeze({
    ...v.brand("Forged"),
    reference: () => undefined
  });

  assert.throws(
    () => projectNativeJsonSchema(forgedStringSchema),
    /unsupported schema string reference/u
  );
  assert.throws(
    () => projectNativeJsonSchema(v.pipe(v.string(), forgedRegexAction)),
    /unsupported action regex reference/u
  );
  assert.throws(
    () => projectNativeJsonSchema(v.pipe(v.string(), forgedBrandAction)),
    /unsupported action brand reference/u
  );
});
