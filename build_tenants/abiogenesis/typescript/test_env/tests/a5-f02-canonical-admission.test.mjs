import assert from "node:assert/strict";
import test from "node:test";

import * as gtl from "../../build/code/src/gtl/index.js";
import * as validator from "../../build/code/src/validator/index.js";

const contractRef = "contract://test/a5-f02/canonical@5";

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
