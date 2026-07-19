import test from "node:test";
import assert from "node:assert/strict";

import Ajv2020 from "ajv/dist/2020.js";
import * as v from "valibot";

import {
  projectCanonicalNativeJsonSchema
} from "../../build/semantic/code/src/shared/validation/canonical_native_schema_projector.js";
import {
  canonicalIJsonSchema
} from "../../build/semantic/code/src/shared/validation/native_contract_primitives.js";

test("canonical native projection preserves exact empty-tuple semantics", () => {
  const projected = projectCanonicalNativeJsonSchema(
    v.strictObject({
      readinessBlockers: v.tuple([])
    })
  );
  const tuple = projected.properties.readinessBlockers;

  assert.equal(Object.hasOwn(tuple, "prefixItems"), false);
  assert.equal(tuple.minItems, 0);
  assert.equal(tuple.maxItems, 0);

  const validate = new Ajv2020({ strict: false }).compile(projected);
  assert.equal(validate({ readinessBlockers: [] }), true);
  assert.equal(validate({ readinessBlockers: ["unexpected"] }), false);
});

test("canonical I-JSON definitions stay root-addressable after an owner check", () => {
  const ownerCheck = Object.freeze(v.check(() => true, "owner relation"));
  const namedCheckRegistry = Object.freeze({
    familyRef: "contract-family://abg/test/canonical-ijson",
    checks: Object.freeze([Object.freeze({
      checkId: "owner-relation",
      action: ownerCheck,
      relationRef: "relation://abg/test/canonical-ijson"
    })])
  });
  const projected = projectCanonicalNativeJsonSchema(
    v.strictObject({
      value: v.pipe(canonicalIJsonSchema, ownerCheck)
    }),
    { namedCheckRegistry }
  );

  assert.equal(projected.properties.value.$ref, "#/$defs/IJsonValue");
  assert.equal(Object.hasOwn(projected.properties.value, "$defs"), false);
  assert.ok(projected.$defs.IJsonValue);
  const validate = new Ajv2020({ strict: false }).compile(projected);
  assert.equal(validate({ value: { nested: [null, true, 1, "value"] } }), true);
});
