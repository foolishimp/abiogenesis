import assert from "node:assert/strict";
import test from "node:test";

import * as gtl from "../../build/code/src/gtl/index.js";
import * as validator from "../../build/code/src/validator/index.js";

const contractRef = "contract://test/a5-f02/canonical@5";
const ARTIFACT_DIGEST = `sha256:${"4".repeat(64)}`;
const CONTENT_DIGEST = `sha256:${"5".repeat(64)}`;
const MANIFEST_DIGEST = `sha256:${"6".repeat(64)}`;

function artifactBasis() {
  return {
    productId: "product://abiogenesis/a5-f02-canonical-proof@5",
    artifactDigest: ARTIFACT_DIGEST,
    productContentDigest: CONTENT_DIGEST,
    productManifestDigest: MANIFEST_DIGEST,
    packageName: "@abiogenesis/typescript-tenant",
    packageVersion: "5.0.0-dev.286",
  };
}

function helloPublication() {
  return gtl.constructHelloWorldModulePublication(artifactBasis());
}

function consensusPublication() {
  return gtl.constructConsensusModulePublication(artifactBasis());
}

function thrownMessage(operation) {
  try {
    operation();
  } catch (error) {
    assert.equal(error instanceof Error, true);
    return error.message;
  }
  assert.fail("expected operation to throw");
}

function identity() {
  return gtl.identityGraphFunction({
    name: "Canonical identity",
    contractRef,
  });
}

test("native, object, and text GraphFunction admission converge", () => {
  const native = identity();
  const serialized = gtl.serializeGraphFunction(native);
  const fromNative = gtl.admitGraphFunction(native);
  const fromObject = gtl.admitGraphFunction(structuredClone(serialized));
  const fromText = gtl.admitGraphFunction(JSON.stringify(serialized, null, 2));

  assert.deepEqual(fromNative, serialized);
  assert.deepEqual(fromObject, serialized);
  assert.deepEqual(fromText, serialized);
  assert.equal(Object.isFrozen(fromText), true);
  assert.equal(
    gtl.isNativeCProgramTerm(fromText.template.nodes[0].term),
    true,
    "strict GraphFunction admission must preserve lawful C constructor use",
  );
});

test("strict text admission refuses duplicate names, comments, and trailing commas", () => {
  const text = JSON.stringify(gtl.serializeGraphFunction(identity()));
  const duplicateId = `{\"\\u0069d\":\"graph-function://test/duplicate@5\",${text.slice(1)}`;

  assert.throws(() => gtl.admitGraphFunction(duplicateId), /duplicate property "id"/u);
  assert.throws(() => gtl.admitGraphFunction(`/* comment */${text}`), /expected JSON value/u);
  assert.throws(() => gtl.admitGraphFunction(`${text.slice(0, -1)},}`), /trailing comma/u);
});

test("strict object admission refuses accessors, sparse arrays, non-plain values, and lone surrogates", () => {
  const serialized = structuredClone(gtl.serializeGraphFunction(identity()));
  const accessor = structuredClone(serialized);
  Object.defineProperty(accessor, "name", {
    enumerable: true,
    get() {
      throw new Error("accessor must not run");
    },
  });
  assert.throws(
    () => gtl.admitGraphFunction(accessor),
    /accessor-backed|data property/u,
  );

  const sparse = structuredClone(serialized);
  sparse.inputs = new Array(1);
  assert.throws(() => gtl.admitGraphFunction(sparse), /sparse or accessor-backed/u);

  const nonPlain = Object.assign(Object.create({ inherited: true }), serialized);
  assert.throws(() => gtl.admitGraphFunction(nonPlain), /plain object/u);

  const invalidUnicode = structuredClone(serialized);
  invalidUnicode.name = "bad\ud800label";
  assert.throws(() => gtl.admitGraphFunction(invalidUnicode), /unpaired high surrogate/u);
});

test("every object ingress refuses symbol and invalid Unicode property keys", () => {
  const symbolKeyed = structuredClone(gtl.serializeGraphFunction(identity()));
  Object.defineProperty(symbolKeyed, Symbol("hidden-authority"), {
    enumerable: false,
    value: "must-not-disappear",
  });
  assert.throws(
    () => gtl.admitGraphFunction(symbolKeyed),
    /symbol-keyed property/u,
  );

  const invalidUnicodeKey = structuredClone(
    gtl.serializeGraphFunction(identity()),
  );
  invalidUnicodeKey.declarations["bad\ud800key"] = "value";
  assert.throws(
    () => gtl.admitGraphFunction(invalidUnicodeKey),
    /unpaired high surrogate/u,
  );
  assert.throws(
    () => gtl.admitGraphFunction(JSON.stringify(invalidUnicodeKey)),
    /unpaired high surrogate/u,
  );
});

test("raw object and text ingress share one I-JSON admission before kind checks", () => {
  const graphFunction = gtl.serializeGraphFunction(identity());
  const contract = "contract://test/a5-f02/raw-graph-function@5";
  const fromObject = validator.rawAdmitValue(
    structuredClone(graphFunction),
    "graph_function",
    contract,
  );
  const fromText = validator.rawAdmitValue(
    JSON.stringify(graphFunction),
    "graph_function",
    contract,
  );
  assert.equal(fromObject.kind, "raw_admitted_value", JSON.stringify(fromObject));
  assert.equal(fromText.kind, "raw_admitted_value", JSON.stringify(fromText));
  assert.equal(fromObject.subjectDigest, fromText.subjectDigest);
  assert.deepEqual(fromObject.value, fromText.value);

  const wrongKind = validator.rawAdmitValue(
    JSON.stringify({ kind: "gtl_program" }),
    "graph_function",
    contract,
  );
  assert.equal(wrongKind.kind, "raw_admission_refusal");
  assert.equal(wrongKind.code, "invalid_kind");
});

test("schema unique sets reject duplicates identically at every native object and text ingress", () => {
  const graphFunction = helloPublication().graphFunctions.find(
    (candidate) => candidate.id === gtl.HELLO_WORLD_IDS.graphFunctionRef,
  );
  assert.notEqual(graphFunction, undefined);
  const oneSurfaceProgram = consensusPublication().programs.find(
    (candidate) => candidate.programRef === gtl.CONSENSUS_IDS.oneSurfaceProgramRef,
  );
  assert.notEqual(oneSurfaceProgram, undefined);
  const module = helloPublication();

  const cases = [
    {
      name: "GraphFunction.effects",
      value: graphFunction,
      admit: gtl.admitGraphFunction,
      mutate(value) {
        value.effects.push(value.effects[0]);
      },
    },
    {
      name: "GraphFunction.tags",
      value: graphFunction,
      admit: gtl.admitGraphFunction,
      mutate(value) {
        value.tags.push(value.tags[0]);
      },
    },
    ...["targetObligationRefs", "inputAssetRefs", "outputAssetRefs"].map(
      (field) => ({
        name: `Program.actionCatalog.rows[0].${field}`,
        value: oneSurfaceProgram,
        admit: gtl.admitProgram,
        mutate(value) {
          const values = value.actionCatalog.rows[0][field];
          values.push(values[0]);
        },
      }),
    ),
    ...["consumedFieldRefs", "tags"].map((field) => ({
      name: `Module.evaluators[0].${field}`,
      value: module,
      admit: gtl.admitModule,
      mutate(value) {
        const values = value.evaluators[0][field];
        values.push(values[0]);
      },
    })),
    {
      name: "Module.rules[0].tags",
      value: module,
      admit: gtl.admitModule,
      mutate(value) {
        value.rules[0].tags.push(value.rules[0].tags[0]);
      },
    },
    ...[
      "programMembershipRefs",
      "readinessPrerequisiteRefs",
      "compatibilityRefs",
      "provenanceRefs",
    ].map((field) => ({
      name: `Module.contributions[0].${field}`,
      value: module,
      admit: gtl.admitModule,
      mutate(value) {
        const values = value.contributions[0][field];
        values.push(values[0]);
      },
    })),
  ];
  assert.equal(cases.length, 12);

  for (const row of cases) {
    const candidate = structuredClone(row.value);
    row.mutate(candidate);
    const objectMessage = thrownMessage(() => row.admit(candidate));
    const textMessage = thrownMessage(() => row.admit(JSON.stringify(candidate)));
    assert.equal(objectMessage, textMessage, row.name);
    assert.match(objectMessage, /contains duplicate value/u, row.name);
  }
});

test("published native declaration constructors reject duplicate unique sets", () => {
  const graphFunction = helloPublication().graphFunctions.find(
    (candidate) => candidate.id === gtl.HELLO_WORLD_IDS.graphFunctionRef,
  );
  assert.notEqual(graphFunction, undefined);
  const {
    id: _id,
    kind: _kind,
    version: _version,
    ...graphFunctionBasis
  } = structuredClone(graphFunction);
  for (const field of ["effects", "tags"]) {
    const candidate = structuredClone(graphFunctionBasis);
    candidate[field].push(candidate[field][0]);
    assert.throws(
      () => gtl.constructGraphFunction(candidate),
      /contains duplicate value/u,
      `GraphFunction.${field}`,
    );
  }

  for (const field of [
    "targetObligationRefs",
    "inputAssetRefs",
    "outputAssetRefs",
  ]) {
    const candidate = structuredClone(consensusPublication());
    const program = candidate.programs.find(
      (row) => row.programRef === gtl.CONSENSUS_IDS.oneSurfaceProgramRef,
    );
    assert.notEqual(program, undefined);
    const values = program.actionCatalog.rows[0][field];
    values.push(values[0]);
    assert.throws(
      () => gtl.modulePublication(candidate),
      /contains duplicate value/u,
      `ActionCatalog.rows[0].${field}`,
    );
  }

  const module = helloPublication();
  for (const field of ["consumedFieldRefs", "tags"]) {
    const candidate = structuredClone(module.evaluators[0]);
    candidate[field].push(candidate[field][0]);
    assert.throws(
      () => gtl.evaluatorDeclaration(candidate),
      /contains duplicate value/u,
      `Evaluator.${field}`,
    );
  }
  const rule = structuredClone(module.rules[0]);
  rule.tags.push(rule.tags[0]);
  assert.throws(
    () => gtl.ruleDeclaration(rule),
    /contains duplicate value/u,
  );
  for (const field of [
    "programMembershipRefs",
    "readinessPrerequisiteRefs",
    "compatibilityRefs",
    "provenanceRefs",
  ]) {
    const candidate = structuredClone(module.contributions[0]);
    candidate[field].push(candidate[field][0]);
    assert.throws(
      () => gtl.catalogContribution(candidate),
      /contains duplicate value/u,
      `CatalogContribution.${field}`,
    );
  }
});

test("I-JSON refuses unsafe integer values and tokens before subject identity", () => {
  const unsafe = Number.MAX_SAFE_INTEGER + 1;
  assert.equal(Number.isSafeInteger(unsafe), false);
  assert.throws(
    () => gtl.admitIJsonValue(unsafe),
    /unsafe I-JSON integer/u,
  );
  assert.throws(
    () => gtl.admitIJsonValue(JSON.parse("9007199254740993")),
    /unsafe I-JSON integer/u,
  );
  assert.throws(
    () => gtl.admitIJsonText("9007199254740993"),
    /unsafe I-JSON integer/u,
  );

  const graphFunction = structuredClone(
    helloPublication().graphFunctions.find(
      (candidate) => candidate.id === gtl.HELLO_WORLD_IDS.graphFunctionRef,
    ),
  );
  assert.notEqual(graphFunction, undefined);
  graphFunction.template.nodes[0].term.vectorIndex = unsafe;
  const objectRefusal = validator.rawAdmitValue(
    graphFunction,
    "graph_function",
    "contract://test/a5-f02/unsafe-integer@5",
  );
  const text = JSON.stringify(graphFunction).replace(
    '"vectorIndex":9007199254740992',
    '"vectorIndex":9007199254740993',
  );
  const textRefusal = validator.rawAdmitValue(
    text,
    "graph_function",
    "contract://test/a5-f02/unsafe-integer@5",
  );
  for (const refusal of [objectRefusal, textRefusal]) {
    assert.equal(refusal.kind, "raw_admission_refusal", JSON.stringify(refusal));
    assert.equal(refusal.code, "non_canonical_value");
    assert.match(refusal.message, /unsafe I-JSON integer/u);
    assert.equal("subjectDigest" in refusal, false);
  }
  assert.equal(objectRefusal.message, textRefusal.message);
});

test("canonical GraphFunction id tampering and recursive unknown fields are refused", () => {
  const serialized = structuredClone(gtl.serializeGraphFunction(identity()));
  serialized.id = `graph-function://abiogenesis/canonical/${"0".repeat(64)}`;
  assert.throws(() => gtl.admitGraphFunction(serialized), /canonical authoring identity/u);

  const widened = structuredClone(gtl.serializeGraphFunction(identity()));
  widened.template.nodes[0].term.undeclared = true;
  assert.throws(() => gtl.admitGraphFunction(widened), /undeclared is not declared/u);
});

test("C admission is exact and canonicalizes negative zero", () => {
  const term = structuredClone(
    gtl.serializeGraphFunction(identity()).template.nodes[0].term,
  );
  const native = gtl.admitCProgramSyntax(term);
  const text = gtl.admitCProgramSyntax(JSON.stringify(term));
  assert.equal(native.accepted, true);
  assert.equal(text.accepted, true);
  assert.equal(
    gtl.serializeCProgramCanonical(native.program),
    gtl.serializeCProgramCanonical(text.program),
  );
  assert.equal(gtl.isNativeCProgramTerm(native.program), true);
  assert.equal(gtl.C.retry(native.program, 2).kind, "c_retry");

  const widened = { ...term, undeclared: true };
  const refusal = gtl.admitCProgramSyntax(widened);
  assert.equal(refusal.accepted, false);
  assert.equal(refusal.diagnostics[0].diagnosticId, "gtl-c-invalid-syntax");
});
