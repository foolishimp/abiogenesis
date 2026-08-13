import assert from "node:assert/strict";
import test from "node:test";

import * as gtl from "../../build/code/src/gtl/index.js";
import * as product from "../../build/code/src/product/index.js";
import { sha256Canonical } from "../../build/code/src/shared/digests.js";
import * as validator from "../../build/code/src/validator/index.js";

const ARTIFACT_BASIS = Object.freeze({
  productId: "product://abiogenesis/a5-f02-canonical-identity@5",
  artifactDigest: `sha256:${"1".repeat(64)}`,
  productContentDigest: `sha256:${"2".repeat(64)}`,
  productManifestDigest: `sha256:${"3".repeat(64)}`,
  packageName: "@abiogenesis/a5-f02-canonical-identity",
  packageVersion: "5.0.0",
});

function publication() {
  return gtl.constructHelloWorldModulePublication(ARTIFACT_BASIS);
}

function consensusPublication() {
  return gtl.constructConsensusModulePublication(ARTIFACT_BASIS);
}

function requireRaw(value, subjectKind) {
  const admitted = validator.rawAdmitValue(
    value,
    subjectKind,
    `contract://abiogenesis/a5-f02/raw/${subjectKind}@5`,
  );
  assert.equal(admitted.kind, "raw_admitted_value", JSON.stringify(admitted));
  return admitted;
}

function requireBy(values, predicate, label) {
  const value = values.find(predicate);
  assert.ok(value, label);
  return value;
}

function duplicateFirst(values) {
  assert.ok(values.length > 0, "duplicate witness requires one authored value");
  values.push(structuredClone(values[0]));
}

function assertDuplicateDiagnostic(result, stage, path, message) {
  assert.equal(result.kind, "static_validation_refusal", JSON.stringify(result));
  assert.equal(result.stage, stage, JSON.stringify(result));
  assert.equal(
    result.diagnostics.some((diagnostic) =>
      diagnostic.code === "duplicate_identity" &&
      diagnostic.path === path &&
      diagnostic.message === message
    ),
    true,
    JSON.stringify(result),
  );
}

function reverseInventory(carrier, field) {
  assert.ok(Array.isArray(carrier[field]), `${field} must be an inventory`);
  assert.ok(carrier[field].length > 1, `${field} requires a real permutation`);
  carrier[field].reverse();
}

function richAuthoredCarriers() {
  const modulePublication = structuredClone(publication());
  const evaluator = modulePublication.evaluators[0];
  evaluator.consumedFieldRefs.push("$.secondaryCanonicalField");
  const rule = modulePublication.rules[0];
  const program = requireBy(
    modulePublication.programs,
    (candidate) => candidate.programRef === gtl.FAN_OUT_HELLO_IDS.programRef,
    "fan-out Program",
  );
  program.starts.push({
    startRef: "start://abiogenesis/a5-f02/fan-out-secondary@5",
    graphFunctionRef: gtl.FAN_OUT_HELLO_IDS.elementGraphFunctionRef,
  });
  program.publicAssetTargets = [
    {
      kind: "program_public_asset_target",
      handle: "gtl://abiogenesis/a5-f02/public/a@5",
      assetRef: "asset://abiogenesis/a5-f02/public/a@5",
      startRef: program.starts[0].startRef,
    },
    {
      kind: "program_public_asset_target",
      handle: "gtl://abiogenesis/a5-f02/public/b@5",
      assetRef: "asset://abiogenesis/a5-f02/public/b@5",
      startRef: program.starts[1].startRef,
    },
  ];
  const graphFunction = requireBy(
    modulePublication.graphFunctions,
    (candidate) =>
      candidate.name === gtl.SUBSTITUTED_HELLO_IDS.graphFunctionRef,
    "substituted GraphFunction",
  );
  graphFunction.environment.requires.push(
    "contract://abiogenesis/a5-f02/secondary-requirement@5",
  );
  const contribution = requireBy(
    modulePublication.contributions,
    (candidate) => candidate.handle === gtl.HELLO_WORLD_IDS.graphFunctionRef,
    "Hello World contribution",
  );
  contribution.compatibilityRefs.push(
    "product://abiogenesis/a5-f02/secondary-compatibility@5",
  );
  return {
    modulePublication,
    evaluator,
    rule,
    program: structuredClone(program),
    graphFunction: structuredClone(graphFunction),
    contribution: structuredClone(contribution),
  };
}

function assertCanonicalPermutation(label, subjectKind, authored, permute) {
  const candidate = structuredClone(authored);
  permute(candidate);
  const canonicalAuthored = gtl.canonicalizeAuthoredGtlCarrier(
    authored,
    subjectKind,
  );
  const canonicalCandidate = gtl.canonicalizeAuthoredGtlCarrier(
    candidate,
    subjectKind,
  );
  assert.deepEqual(canonicalCandidate, canonicalAuthored, label);
  assert.equal(
    sha256Canonical(canonicalCandidate),
    sha256Canonical(canonicalAuthored),
    `${label} canonical digest`,
  );
  const authoredAdmission = requireRaw(authored, subjectKind);
  const candidateAdmission = requireRaw(candidate, subjectKind);
  assert.deepEqual(candidateAdmission.value, authoredAdmission.value, label);
  assert.equal(
    candidateAdmission.subjectDigest,
    authoredAdmission.subjectDigest,
    `${label} raw subject digest`,
  );
  assert.equal(
    candidateAdmission.admissionRef,
    authoredAdmission.admissionRef,
    `${label} raw admission identity`,
  );
}

function reverseGraphFunctionSets(graphFunction) {
  graphFunction.environment.requires.reverse();
  graphFunction.environment.provides.reverse();
  graphFunction.environment.carries.reverse();
  graphFunction.effects.reverse();
  graphFunction.tags.reverse();
}

function reverseContributionSets(contribution) {
  contribution.programMembershipRefs.reverse();
  contribution.readinessPrerequisiteRefs.reverse();
  contribution.compatibilityRefs.reverse();
  contribution.provenanceRefs.reverse();
}

function reverseAllSelectedModuleSets(modulePublication) {
  for (const evaluator of modulePublication.evaluators) {
    evaluator.consumedFieldRefs.reverse();
    evaluator.tags.reverse();
  }
  for (const rule of modulePublication.rules) rule.tags.reverse();
  for (const program of modulePublication.programs) {
    program.starts.reverse();
    program.callableMembership.reverse();
    program.publicAssetTargets?.reverse();
  }
  for (const graphFunction of modulePublication.graphFunctions) {
    reverseGraphFunctionSets(graphFunction);
  }
  for (const contribution of modulePublication.contributions) {
    reverseContributionSets(contribution);
  }
  modulePublication.contracts.reverse();
  modulePublication.evaluators.reverse();
  modulePublication.rules.reverse();
  modulePublication.implementationBindings.reverse();
  modulePublication.closureContracts.reverse();
  modulePublication.programs.reverse();
  modulePublication.graphFunctions.reverse();
  modulePublication.contributions.reverse();
}

function validRichPublication() {
  const modulePublication = structuredClone(publication());
  const program = requireBy(
    modulePublication.programs,
    (candidate) => candidate.programRef === gtl.FAN_OUT_HELLO_IDS.programRef,
    "fan-out Program",
  );
  program.starts.push({
    startRef: "start://abiogenesis/a5-f02/fan-out-validator-secondary@5",
    graphFunctionRef: gtl.FAN_OUT_HELLO_IDS.elementGraphFunctionRef,
  });
  modulePublication.evaluators[0].consumedFieldRefs.push(
    "$.secondaryCanonicalField",
  );
  const contribution = requireBy(
    modulePublication.contributions,
    (candidate) => candidate.handle === gtl.HELLO_WORLD_IDS.graphFunctionRef,
    "Hello World contribution",
  );
  contribution.compatibilityRefs.push(
    "product://abiogenesis/a5-f02/validator-compatibility@5",
  );
  return modulePublication;
}

function twoRowActionPublication() {
  const modulePublication = structuredClone(consensusPublication());
  const program = requireBy(
    modulePublication.programs,
    (candidate) =>
      candidate.programRef === gtl.CONSENSUS_IDS.oneSurfaceProgramRef,
    "Consensus One Surface Program",
  );
  assert.ok(program.actionCatalog, "Consensus Program action catalog");
  const first = program.actionCatalog.rows[0];
  assert.ok(first, "Consensus action row");
  first.targetObligationRefs = [
    ...first.targetObligationRefs,
    "obligation://abiogenesis/a5-f02/ordered-secondary@5",
  ];
  first.inputAssetRefs = [
    ...first.inputAssetRefs,
    "asset://abiogenesis/a5-f02/ordered-input-secondary@5",
  ];
  first.outputAssetRefs = [
    ...first.outputAssetRefs,
    "asset://abiogenesis/a5-f02/ordered-output-secondary@5",
  ];
  program.actionCatalog.rows.push({
    ...structuredClone(first),
    actionRef: "action://abiogenesis/a5-f02/secondary@5",
    expectedDeltaRef: "delta://abiogenesis/a5-f02/secondary@5",
    progressConditionRef:
      "condition://abiogenesis/a5-f02/progress-secondary@5",
    stopConditionRef: "condition://abiogenesis/a5-f02/stop-secondary@5",
  });
  return modulePublication;
}

function contributionAdmissions(publicationAdmission, permuted) {
  const rows = publicationAdmission.value.contributions.map((value) => {
    const carrier = structuredClone(value);
    if (permuted) reverseContributionSets(carrier);
    return requireRaw(carrier, "catalog_contribution");
  });
  return permuted ? rows.reverse() : rows;
}

function programValidationInput(
  publicationAdmission,
  permuted,
  programRef = gtl.FAN_OUT_HELLO_IDS.programRef,
  authoredProgram = null,
) {
  const publishedProgram = requireBy(
    publicationAdmission.value.programs,
    (candidate) => candidate.programRef === programRef,
    `published Program ${programRef}`,
  );
  const program = structuredClone(authoredProgram ?? publishedProgram);
  if (permuted) {
    program.starts.reverse();
    program.callableMembership.reverse();
  }
  const graphFunctions = publicationAdmission.value.graphFunctions
    .filter((value) => program.callableMembership.includes(value.name))
    .map((value) => {
      const carrier = structuredClone(value);
      if (permuted) reverseGraphFunctionSets(carrier);
      return requireRaw(carrier, "graph_function");
    });
  const contracts = publicationAdmission.value.contracts.map((value) =>
    requireRaw(value, "contract_declaration"));
  const implementationBindings =
    publicationAdmission.value.implementationBindings.map((value) =>
      requireRaw(value, "implementation_binding"));
  const closureContracts = publicationAdmission.value.closureContracts.map(
    (value) => requireRaw(value, "closure_contract"),
  );
  return {
    publication: publicationAdmission,
    program: requireRaw(program, "gtl_program"),
    graphFunctions: permuted ? graphFunctions.reverse() : graphFunctions,
    contracts: permuted ? contracts.reverse() : contracts,
    implementationBindings: permuted
      ? implementationBindings.reverse()
      : implementationBindings,
    closureContracts: permuted
      ? closureContracts.reverse()
      : closureContracts,
  };
}

test("A5-F02 canonicalizes every selected authored set inventory", () => {
  const rich = richAuthoredCarriers();
  const moduleCases = [
    ["contracts", (value) => reverseInventory(value, "contracts")],
    ["evaluator declarations", (value) => reverseInventory(value, "evaluators")],
    ["rule declarations", (value) => reverseInventory(value, "rules")],
    ["implementation bindings", (value) => reverseInventory(value, "implementationBindings")],
    ["closure contracts", (value) => reverseInventory(value, "closureContracts")],
    ["Programs", (value) => reverseInventory(value, "programs")],
    ["GraphFunctions", (value) => reverseInventory(value, "graphFunctions")],
    ["contributions", (value) => reverseInventory(value, "contributions")],
    [
      "Evaluator consumed fields",
      (value) => reverseInventory(value.evaluators[0], "consumedFieldRefs"),
    ],
    ["Evaluator tags", (value) => reverseInventory(value.evaluators[0], "tags")],
    ["Rule tags", (value) => reverseInventory(value.rules[0], "tags")],
  ];
  for (const [label, permute] of moduleCases) {
    assertCanonicalPermutation(
      label,
      "module_publication",
      rich.modulePublication,
      permute,
    );
  }

  for (const [label, field] of [
    ["Program starts", "starts"],
    ["Program callable membership", "callableMembership"],
    ["Program public asset targets", "publicAssetTargets"],
  ]) {
    assertCanonicalPermutation(
      label,
      "gtl_program",
      rich.program,
      (value) => reverseInventory(value, field),
    );
  }

  for (const [label, permute] of [
    ["GraphFunction requires", (value) => reverseInventory(value.environment, "requires")],
    ["GraphFunction provides", (value) => reverseInventory(value.environment, "provides")],
    ["GraphFunction carries", (value) => reverseInventory(value.environment, "carries")],
    ["GraphFunction effects", (value) => reverseInventory(value, "effects")],
    ["GraphFunction tags", (value) => reverseInventory(value, "tags")],
  ]) {
    assertCanonicalPermutation(
      label,
      "graph_function",
      rich.graphFunction,
      permute,
    );
  }

  for (const [label, field] of [
    ["contribution Program membership", "programMembershipRefs"],
    ["contribution readiness prerequisites", "readinessPrerequisiteRefs"],
    ["contribution compatibility", "compatibilityRefs"],
    ["contribution provenance", "provenanceRefs"],
  ]) {
    assertCanonicalPermutation(
      label,
      "catalog_contribution",
      rich.contribution,
      (value) => reverseInventory(value, field),
    );
  }

  const codeUnitOrdered = structuredClone(rich.graphFunction);
  codeUnitOrdered.tags = ["ä", "a", "Z"];
  assert.deepEqual(
    gtl.canonicalizeAuthoredGtlCarrier(
      codeUnitOrdered,
      "graph_function",
    ).tags,
    ["Z", "a", "ä"],
    "selected set law uses Unicode code-unit order, not host locale order",
  );
});

test("A5-F02 canonicalizes Program action candidates and rederives their catalog identity", () => {
  const authoredModule = twoRowActionPublication();
  const permutedModule = structuredClone(authoredModule);
  const programRef = gtl.CONSENSUS_IDS.oneSurfaceProgramRef;
  const authoredProgram = requireBy(
    authoredModule.programs,
    (candidate) => candidate.programRef === programRef,
    "authored Consensus Program",
  );
  const permutedProgram = requireBy(
    permutedModule.programs,
    (candidate) => candidate.programRef === programRef,
    "permuted Consensus Program",
  );
  permutedProgram.actionCatalog.rows.reverse();

  const canonicalAuthoredProgram = gtl.canonicalizeAuthoredGtlCarrier(
    authoredProgram,
    "gtl_program",
  );
  const canonicalPermutedProgram = gtl.canonicalizeAuthoredGtlCarrier(
    permutedProgram,
    "gtl_program",
  );
  assert.deepEqual(canonicalPermutedProgram, canonicalAuthoredProgram);
  assert.deepEqual(
    canonicalAuthoredProgram.actionCatalog.rows.map((row) => row.actionRef),
    [...canonicalAuthoredProgram.actionCatalog.rows]
      .map((row) => row.actionRef)
      .sort(),
  );
  const {
    catalogDigest,
    catalogRef,
    ...catalogBody
  } = canonicalAuthoredProgram.actionCatalog;
  assert.equal(catalogDigest, sha256Canonical(catalogBody));
  assert.equal(
    catalogRef,
    `action-catalog://product/${catalogDigest.slice("sha256:".length)}`,
  );

  const authoredProgramAdmission = requireRaw(authoredProgram, "gtl_program");
  const permutedProgramAdmission = requireRaw(permutedProgram, "gtl_program");
  assert.equal(
    permutedProgramAdmission.subjectDigest,
    authoredProgramAdmission.subjectDigest,
  );
  assert.equal(
    permutedProgramAdmission.admissionRef,
    authoredProgramAdmission.admissionRef,
  );
  assert.deepEqual(
    permutedProgramAdmission.value,
    authoredProgramAdmission.value,
  );

  const authoredModuleAdmission = requireRaw(
    authoredModule,
    "module_publication",
  );
  const permutedModuleAdmission = requireRaw(
    permutedModule,
    "module_publication",
  );
  assert.equal(
    permutedModuleAdmission.subjectDigest,
    authoredModuleAdmission.subjectDigest,
  );
  assert.equal(
    permutedModuleAdmission.admissionRef,
    authoredModuleAdmission.admissionRef,
  );
  assert.deepEqual(permutedModuleAdmission.value, authoredModuleAdmission.value);

  const authoredValidation = validator.validateProgram(
    programValidationInput(
      authoredModuleAdmission,
      false,
      programRef,
      authoredProgram,
    ),
  );
  const permutedValidation = validator.validateProgram(
    programValidationInput(
      permutedModuleAdmission,
      true,
      programRef,
      permutedProgram,
    ),
  );
  assert.equal(
    authoredValidation.kind,
    "program_validation",
    JSON.stringify(authoredValidation),
  );
  assert.equal(
    permutedValidation.kind,
    "program_validation",
    JSON.stringify(permutedValidation),
  );
  assert.deepEqual(permutedValidation, authoredValidation);

  for (const field of [
    "targetObligationRefs",
    "inputAssetRefs",
    "outputAssetRefs",
  ]) {
    const orderedProgram = structuredClone(authoredProgram);
    const reversedProgram = structuredClone(authoredProgram);
    reversedProgram.actionCatalog.rows[0][field].reverse();
    assert.notEqual(
      requireRaw(reversedProgram, "gtl_program").subjectDigest,
      requireRaw(orderedProgram, "gtl_program").subjectDigest,
      `${field} remains an ordered action-binding vector`,
    );
  }
});

test("A5-F02 Validator publication and Program identity ignore selected set permutations", () => {
  const authored = validRichPublication();
  const permuted = structuredClone(authored);
  reverseAllSelectedModuleSets(permuted);
  const authoredAdmission = requireRaw(authored, "module_publication");
  const permutedAdmission = requireRaw(permuted, "module_publication");
  assert.equal(permutedAdmission.subjectDigest, authoredAdmission.subjectDigest);
  assert.equal(permutedAdmission.admissionRef, authoredAdmission.admissionRef);
  assert.deepEqual(permutedAdmission.value, authoredAdmission.value);

  const authoredPublicationValidation = validator.validatePublication(
    authoredAdmission,
    contributionAdmissions(authoredAdmission, false),
  );
  const permutedPublicationValidation = validator.validatePublication(
    permutedAdmission,
    contributionAdmissions(permutedAdmission, true),
  );
  assert.equal(
    authoredPublicationValidation.kind,
    "publication_validation",
    JSON.stringify(authoredPublicationValidation),
  );
  assert.equal(
    permutedPublicationValidation.kind,
    "publication_validation",
    JSON.stringify(permutedPublicationValidation),
  );
  assert.deepEqual(
    permutedPublicationValidation,
    authoredPublicationValidation,
  );

  const authoredProgramValidation = validator.validateProgram(
    programValidationInput(authoredAdmission, false),
  );
  const permutedProgramValidation = validator.validateProgram(
    programValidationInput(permutedAdmission, true),
  );
  assert.equal(
    authoredProgramValidation.kind,
    "program_validation",
    JSON.stringify(authoredProgramValidation),
  );
  assert.equal(
    permutedProgramValidation.kind,
    "program_validation",
    JSON.stringify(permutedProgramValidation),
  );
  assert.deepEqual(permutedProgramValidation, authoredProgramValidation);
});

test("A5-F02 Product semantic and catalog identity consume the canonical authored carrier", () => {
  const authored = validRichPublication();
  const permuted = structuredClone(authored);
  reverseAllSelectedModuleSets(permuted);
  assert.equal(
    product.modulePublicationSemanticDigest(permuted),
    product.modulePublicationSemanticDigest(authored),
  );
  const authoredCatalog = product.buildGraphFunctionCatalog([authored]);
  const permutedCatalog = product.buildGraphFunctionCatalog([permuted]);
  assert.equal(
    authoredCatalog.kind,
    "graph_function_catalog",
    JSON.stringify(authoredCatalog),
  );
  assert.equal(
    permutedCatalog.kind,
    "graph_function_catalog",
    JSON.stringify(permutedCatalog),
  );
  assert.deepEqual(permutedCatalog, authoredCatalog);
});

test("A5-F02 retains decision-exact duplicate refusal for every selected set", () => {
  const moduleCases = [
    (value) => {
      const identity = value.contracts[0].contractRef;
      duplicateFirst(value.contracts);
      return {
        path: "$.contracts",
        message: `duplicate Contract declaration ${identity}`,
      };
    },
    (value) => {
      const identity = value.evaluators[0].name;
      duplicateFirst(value.evaluators);
      return {
        path: "$.evaluators",
        message: `duplicate Evaluator declaration ${identity}`,
      };
    },
    (value) => {
      const identity = value.rules[0].name;
      duplicateFirst(value.rules);
      return {
        path: "$.rules",
        message: `duplicate Rule declaration ${identity}`,
      };
    },
    (value) => {
      const identity = value.implementationBindings[0].bindingRef;
      duplicateFirst(value.implementationBindings);
      return {
        path: "$.implementationBindings",
        message: `duplicate ImplementationBinding declaration ${identity}`,
      };
    },
    (value) => {
      const identity = value.closureContracts[0].closureContractRef;
      duplicateFirst(value.closureContracts);
      return {
        path: "$.closureContracts",
        message: `duplicate ClosureContract declaration ${identity}`,
      };
    },
    (value) => {
      const identity = value.programs[0].programRef;
      duplicateFirst(value.programs);
      return {
        path: "$.programs",
        message: `duplicate Program declaration ${identity}`,
      };
    },
    (value) => {
      const identity = value.graphFunctions[0].name;
      duplicateFirst(value.graphFunctions);
      return {
        path: "$.graphFunctions",
        message: `duplicate GraphFunction declaration ${identity}`,
      };
    },
    (value) => {
      const identity = value.contributions[0].handle;
      duplicateFirst(value.contributions);
      return {
        path: "$.contributions",
        message: `duplicate contribution handle ${identity}`,
      };
    },
    (value) => {
      const evaluator = value.evaluators[0];
      const identity = evaluator.consumedFieldRefs[0];
      duplicateFirst(evaluator.consumedFieldRefs);
      return {
        path: `$.evaluators[${evaluator.name}].consumedFieldRefs`,
        message: `duplicate Evaluator consumed field ${identity}`,
      };
    },
    (value) => {
      const evaluator = value.evaluators[0];
      const identity = evaluator.tags[0];
      duplicateFirst(evaluator.tags);
      return {
        path: `$.evaluators[${evaluator.name}].tags`,
        message: `duplicate Evaluator tag ${identity}`,
      };
    },
    (value) => {
      const rule = value.rules[0];
      const identity = rule.tags[0];
      duplicateFirst(rule.tags);
      return {
        path: `$.rules[${rule.name}].tags`,
        message: `duplicate Rule tag ${identity}`,
      };
    },
    (value) => {
      const graphFunction = requireBy(
        value.graphFunctions,
        (candidate) =>
          candidate.name === gtl.SUBSTITUTED_HELLO_IDS.graphFunctionRef,
        "duplicate requires GraphFunction",
      );
      const identity = graphFunction.environment.requires[0];
      duplicateFirst(graphFunction.environment.requires);
      return {
        path: `$.graphFunctions[${graphFunction.name}].environment.requires`,
        message: `duplicate GraphFunction required environment ref ${identity}`,
      };
    },
    (value) => {
      const graphFunction = requireBy(
        value.graphFunctions,
        (candidate) =>
          candidate.name === gtl.SUBSTITUTED_HELLO_IDS.graphFunctionRef,
        "duplicate provides GraphFunction",
      );
      const identity = graphFunction.environment.provides[0];
      duplicateFirst(graphFunction.environment.provides);
      return {
        path: `$.graphFunctions[${graphFunction.name}].environment.provides`,
        message: `duplicate GraphFunction provided environment ref ${identity}`,
      };
    },
    (value) => {
      const graphFunction = requireBy(
        value.graphFunctions,
        (candidate) =>
          candidate.name === gtl.SUBSTITUTED_HELLO_IDS.graphFunctionRef,
        "duplicate carries GraphFunction",
      );
      const identity = graphFunction.environment.carries[0];
      duplicateFirst(graphFunction.environment.carries);
      return {
        path: `$.graphFunctions[${graphFunction.name}].environment.carries`,
        message: `duplicate GraphFunction carried environment ref ${identity}`,
      };
    },
    (value) => {
      const graphFunction = requireBy(
        value.graphFunctions,
        (candidate) =>
          candidate.name === gtl.SUBSTITUTED_HELLO_IDS.graphFunctionRef,
        "duplicate effects GraphFunction",
      );
      const identity = graphFunction.effects[0];
      duplicateFirst(graphFunction.effects);
      return {
        path: `$.graphFunctions[${graphFunction.name}].effects`,
        message: `duplicate GraphFunction effect ${identity}`,
      };
    },
    (value) => {
      const graphFunction = requireBy(
        value.graphFunctions,
        (candidate) =>
          candidate.name === gtl.SUBSTITUTED_HELLO_IDS.graphFunctionRef,
        "duplicate tags GraphFunction",
      );
      const identity = graphFunction.tags[0];
      duplicateFirst(graphFunction.tags);
      return {
        path: `$.graphFunctions[${graphFunction.name}].tags`,
        message: `duplicate GraphFunction tag ${identity}`,
      };
    },
    ...[
      ["programMembershipRefs", "contribution Program membership"],
      ["readinessPrerequisiteRefs", "contribution readiness prerequisite"],
      ["compatibilityRefs", "contribution compatibility ref"],
      ["provenanceRefs", "contribution provenance ref"],
    ].map(([field, label]) => (value) => {
      const contribution = requireBy(
        value.contributions,
        (candidate) => candidate.handle === gtl.HELLO_WORLD_IDS.graphFunctionRef,
        `duplicate ${field} contribution`,
      );
      const identity = contribution[field][0];
      duplicateFirst(contribution[field]);
      return {
        path: `$.contributions[${contribution.handle}].${field}`,
        message: `duplicate ${label} ${identity}`,
      };
    }),
  ];
  for (const mutate of moduleCases) {
    const candidate = structuredClone(richAuthoredCarriers().modulePublication);
    const expected = mutate(candidate);
    const admission = requireRaw(candidate, "module_publication");
    const result = validator.validatePublication(
      admission,
      contributionAdmissions(admission, false),
    );
    assertDuplicateDiagnostic(
      result,
      "publication",
      expected.path,
      expected.message,
    );
  }

  const programCases = [
    (program) => {
      const start = program.starts.at(-1);
      assert.ok(start);
      program.starts.push(structuredClone(start));
      return {
        path: "$.program.starts",
        message: `duplicate Program start ${start.startRef}`,
      };
    },
    (program) => {
      const identity = program.callableMembership[0];
      duplicateFirst(program.callableMembership);
      return {
        path: "$.program.callableMembership",
        message: `duplicate GraphFunction membership ${identity}`,
      };
    },
    (program) => {
      const target = program.publicAssetTargets[0];
      duplicateFirst(program.publicAssetTargets);
      return {
        path: "$.program.publicAssetTargets",
        message: `duplicate public asset handle ${target.handle}`,
      };
    },
  ];
  for (const mutate of programCases) {
    const candidate = structuredClone(richAuthoredCarriers().modulePublication);
    const program = requireBy(
      candidate.programs,
      (value) => value.programRef === gtl.FAN_OUT_HELLO_IDS.programRef,
      "duplicate Program inventory witness",
    );
    const expected = mutate(program);
    const admission = requireRaw(candidate, "module_publication");
    const result = validator.validateProgram(
      programValidationInput(admission, false),
    );
    assertDuplicateDiagnostic(
      result,
      "program",
      expected.path,
      expected.message,
    );
  }

  const actionCandidate = twoRowActionPublication();
  const actionProgram = requireBy(
    actionCandidate.programs,
    (candidate) =>
      candidate.programRef === gtl.CONSENSUS_IDS.oneSurfaceProgramRef,
    "duplicate action Program",
  );
  const duplicateActionRef = actionProgram.actionCatalog.rows[0].actionRef;
  duplicateFirst(actionProgram.actionCatalog.rows);
  const actionAdmission = requireRaw(actionCandidate, "module_publication");
  const actionResult = validator.validateProgram(
    programValidationInput(
      actionAdmission,
      false,
      actionProgram.programRef,
    ),
  );
  assertDuplicateDiagnostic(
    actionResult,
    "program",
    "$.program.actionCatalog.rows",
    `duplicate action membership ${duplicateActionRef}`,
  );
});

test("A5-F02 retains typed refusal for invalid selected set entries", () => {
  const invalidPublication = structuredClone(publication());
  invalidPublication.evaluators[0].tags.push("");
  const invalidAdmission = requireRaw(invalidPublication, "module_publication");
  const invalidResult = validator.validatePublication(
    invalidAdmission,
    contributionAdmissions(invalidAdmission, true),
  );
  assert.equal(invalidResult.kind, "static_validation_refusal");
  assert.equal(
    invalidResult.diagnostics.some(
      (row) => row.code === "invalid_reference" && row.path.startsWith("$.evaluators"),
    ),
    true,
    JSON.stringify(invalidResult),
  );
});

test("A5-F02 preserves ordered topology, C composition, arguments, and closure sequences", () => {
  const source = publication();
  const substituted = requireBy(
    source.graphFunctions,
    (candidate) =>
      candidate.name === gtl.SUBSTITUTED_HELLO_IDS.graphFunctionRef,
    "substituted GraphFunction",
  );
  for (const [label, permute] of [
    ["graph nodes", (value) => reverseInventory(value.template, "nodes")],
    ["graph edges", (value) => reverseInventory(value.template, "edges")],
    ["graph applications", (value) => reverseInventory(value.template, "applications")],
  ]) {
    const candidate = structuredClone(substituted);
    permute(candidate);
    const sourceCarrier = gtl.canonicalizeAuthoredGtlCarrier(
      substituted,
      "graph_function",
    );
    const candidateCarrier = gtl.canonicalizeAuthoredGtlCarrier(
      candidate,
      "graph_function",
    );
    assert.notDeepEqual(candidateCarrier, sourceCarrier, label);
    assert.notEqual(
      requireRaw(candidate, "graph_function").subjectDigest,
      requireRaw(substituted, "graph_function").subjectDigest,
      label,
    );
  }

  const composed = requireBy(
    source.graphFunctions,
    (candidate) => candidate.name === gtl.COMPOSED_HELLO_IDS.graphFunctionRef,
    "composed GraphFunction",
  );
  const reversedComposition = structuredClone(composed);
  reverseInventory(
    reversedComposition.template.nodes[0].term,
    "terms",
  );
  assert.notEqual(
    requireRaw(reversedComposition, "graph_function").subjectDigest,
    requireRaw(composed, "graph_function").subjectDigest,
    "C composition term order",
  );

  const orderedArguments = structuredClone(substituted);
  orderedArguments.inputs = [
    "contract://abiogenesis/a5-f02/argument/a@5",
    "contract://abiogenesis/a5-f02/argument/b@5",
  ];
  const reversedArguments = structuredClone(orderedArguments);
  reversedArguments.inputs.reverse();
  assert.notEqual(
    requireRaw(reversedArguments, "graph_function").subjectDigest,
    requireRaw(orderedArguments, "graph_function").subjectDigest,
    "GraphFunction argument order",
  );

  const closure = source.closureContracts[0];
  const reversedClosure = structuredClone(closure);
  reversedClosure.eventKindRefs.reverse();
  assert.notEqual(
    requireRaw(reversedClosure, "closure_contract").subjectDigest,
    requireRaw(closure, "closure_contract").subjectDigest,
    "closure event order",
  );
});
