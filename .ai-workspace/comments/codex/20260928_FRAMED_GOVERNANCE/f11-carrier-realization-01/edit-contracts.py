from pathlib import Path
p=Path('build_tenants/abiogenesis/typescript/code/src/validator/qualification_contracts.ts');s=p.read_text()
anchor='/** Slot keys predate the producing occurrence. CCall/result identity is never a slot. */'
new='''/** Closed immutable dependencies. These schemas admit data, never runtime authority. */
export const QUALIFICATION_DECLARATION_SELECTION_SCHEMA = v.strictObject({
  catalogBasisDigest: digest, readinessBasisDigest: digest, viewDigest: digest, proofDigest: digest,
});
export const QUALIFICATION_RESOURCE_ENTRY_KINDS = ["inventory", "scope", "material", "provenance", "law", "tenant_manifest", "coverage_catalog", "verification_recipe"] as const;
export const QUALIFICATION_LOCAL_ENTRY_SELECTION_SCHEMA = v.strictObject({ entryKind: v.picklist(QUALIFICATION_RESOURCE_ENTRY_KINDS), entry: QUALIFICATION_COORDINATE_SCHEMA });
export const QUALIFICATION_RESOURCE_SELECTION_SCHEMA = v.strictObject({ kind: v.literal("qualification_resource_selection"), schemaVersion: v.literal("1"),
  resource: QUALIFICATION_COORDINATE_SCHEMA, ...QUALIFICATION_LOCAL_ENTRY_SELECTION_SCHEMA.entries });
const selected = <K extends typeof QUALIFICATION_RESOURCE_ENTRY_KINDS[number]>(kind: K) => v.strictObject({
  ...QUALIFICATION_RESOURCE_SELECTION_SCHEMA.entries, entryKind: v.literal(kind) });
export const QUALIFICATION_REFERENCE_SET_SCHEMA = v.union([
  v.strictObject({ kind: v.literal("qualification_reference_set"), schemaVersion: v.literal("1"), setRef: ref, setDigest: digest,
    elementKind: v.literal("memberRefs"), encoding: v.literal("member_ordinals"), inventory: QUALIFICATION_COORDINATE_SCHEMA,
    values: v.pipe(v.array(ordinal), v.minLength(1)) }),
  v.strictObject({ kind: v.literal("qualification_reference_set"), schemaVersion: v.literal("1"), setRef: ref, setDigest: digest,
    elementKind: v.picklist(["rootRefs", "surfaceRoles", "ownerRefs", "sourceRefs"]), encoding: v.literal("refs"),
    values: v.pipe(v.array(ref), v.minLength(1)) }),
]);
const internedGroup = v.strictObject({ groupRef: ref, memberSet: QUALIFICATION_COORDINATE_SCHEMA, rootSet: QUALIFICATION_COORDINATE_SCHEMA,
  roleSet: QUALIFICATION_COORDINATE_SCHEMA, ownerSet: QUALIFICATION_COORDINATE_SCHEMA, sourceSet: QUALIFICATION_COORDINATE_SCHEMA });
const internedScopeFields = { kind: v.literal("qualification_scope_interned"), schemaVersion: v.literal("1"), scopeRef: ref, scopeDigest: digest,
  subjectBasis: QUALIFICATION_COORDINATE_SCHEMA, lawBasis: QUALIFICATION_COORDINATE_SCHEMA, catalog: QUALIFICATION_COORDINATE_SCHEMA,
  inventory: QUALIFICATION_COORDINATE_SCHEMA, ruleGroups: qualificationScopeSchema.entries.ruleGroups,
  surfaceGroups: v.pipe(v.array(internedGroup), v.minLength(1)), referenceSets: v.pipe(v.array(QUALIFICATION_REFERENCE_SET_SCHEMA), v.minLength(1)) };
export const QUALIFICATION_INTERNED_SCOPE_SCHEMA = v.union([
  v.strictObject({ ...internedScopeFields, domainMode: v.literal("global") }),
  v.strictObject({ ...internedScopeFields, domainMode: v.literal("per_rule"), applicationDomains: v.pipe(v.array(v.strictObject({
    ruleGroupRef: ref, surfaceGroups: v.pipe(v.array(internedGroup), v.minLength(1)) })), v.minLength(1)) }),
]);
export const QUALIFICATION_RESOURCE_MANIFEST_SCHEMA = v.strictObject({ kind: v.literal("qualification_resource_manifest"), schemaVersion: v.literal("1"),
  resourceRef: ref, resourceDigest: digest, subjectBasis: QUALIFICATION_COORDINATE_SCHEMA, lawBasis: QUALIFICATION_COORDINATE_SCHEMA,
  catalog: QUALIFICATION_COORDINATE_SCHEMA, inventory: QUALIFICATION_COORDINATE_SCHEMA,
  entries: v.pipe(v.array(v.strictObject({ entryKind: v.picklist(QUALIFICATION_RESOURCE_ENTRY_KINDS), coordinate: QUALIFICATION_COORDINATE_SCHEMA, value: jsonValueSchema })), v.minLength(1)),
  declarationSelections: v.array(QUALIFICATION_DECLARATION_SELECTION_SCHEMA) });
export const QUALIFICATION_RESOURCE_ASSERTION_SCHEMA = v.strictObject({ kind: v.literal("qualification_resource_assertion"), schemaVersion: v.literal("1"),
  manifests: v.pipe(v.array(QUALIFICATION_RESOURCE_MANIFEST_SCHEMA), v.minLength(1)), declarationProofs: v.array(ABG_HISTORICAL_DECLARATION_PROOF_SCHEMA) });
export const QUALIFICATION_RESOURCE_PROVENANCE_SCHEMA = v.union([
  QUALIFICATION_CONSTRUCTION_PROVENANCE_SCHEMA.options[0],
  v.strictObject({ ...QUALIFICATION_CONSTRUCTION_PROVENANCE_SCHEMA.options[1].entries,
    records: v.pipe(v.array(v.strictObject({ ...QUALIFICATION_LOCAL_ENTRY_SELECTION_SCHEMA.entries, entryKind: v.literal("material") })), v.minLength(1)) }),
]);
export type QualificationResourceAssertion = v.InferOutput<typeof QUALIFICATION_RESOURCE_ASSERTION_SCHEMA>;
export type QualificationResourceManifest = v.InferOutput<typeof QUALIFICATION_RESOURCE_MANIFEST_SCHEMA>;
export type QualificationResourceSelection = v.InferOutput<typeof QUALIFICATION_RESOURCE_SELECTION_SCHEMA>;
export type QualificationDeclarationSelection = v.InferOutput<typeof QUALIFICATION_DECLARATION_SELECTION_SCHEMA>;
export type QualificationInternedScope = v.InferOutput<typeof QUALIFICATION_INTERNED_SCOPE_SCHEMA>;
export type QualificationReferenceSet = v.InferOutput<typeof QUALIFICATION_REFERENCE_SET_SCHEMA>;
'''
s=s.replace(anchor,new+'\n'+anchor)
s=s.replace('export const QUALIFICATION_ASSESSMENT_TASK_SCHEMA = v.strictObject({','export const QUALIFICATION_EMBEDDED_TASK_SCHEMA = v.strictObject({',1)
anchor='export const QUALIFICATION_ASSESSMENT_PLAN_SCHEMA'
new='''export const QUALIFICATION_REFERENCE_TASK_SCHEMA = v.strictObject({ ...QUALIFICATION_EMBEDDED_TASK_SCHEMA.entries,
  representation: v.literal("resource_refs_v1"), resource: QUALIFICATION_COORDINATE_SCHEMA,
  scope: v.optional(selected("scope")), declarations: v.array(QUALIFICATION_DECLARATION_SELECTION_SCHEMA),
  material: v.array(selected("material")), provenance: selected("provenance") });
export const QUALIFICATION_ASSESSMENT_TASK_SCHEMA = v.union([QUALIFICATION_EMBEDDED_TASK_SCHEMA, QUALIFICATION_REFERENCE_TASK_SCHEMA]);
export type QualificationEmbeddedTask = v.InferOutput<typeof QUALIFICATION_EMBEDDED_TASK_SCHEMA>;
export type QualificationReferenceTask = v.InferOutput<typeof QUALIFICATION_REFERENCE_TASK_SCHEMA>;
'''
s=s.replace(anchor,new+anchor,1)
s=s.replace('export const QUALIFICATION_PROOF_RESOURCE_SCHEMA = v.strictObject({','export const QUALIFICATION_EMBEDDED_PROOF_RESOURCE_SCHEMA = v.strictObject({',1)
anchor='/** Coverage is source-linked claim data'
new='''export const QUALIFICATION_REFERENCE_PROOF_RESOURCE_SCHEMA = v.strictObject({ ...QUALIFICATION_EMBEDDED_PROOF_RESOURCE_SCHEMA.entries,
  representation: v.literal("resource_refs_v1"), resource: QUALIFICATION_COORDINATE_SCHEMA,
  declarations: v.array(QUALIFICATION_DECLARATION_SELECTION_SCHEMA),
  executionSources: v.optional(v.array(v.strictObject({ sourceRef: ref, basis: EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA,
    prefix: QUALIFICATION_PREFIX_SCHEMA, declarations: v.array(QUALIFICATION_DECLARATION_SELECTION_SCHEMA) }))) });
export const QUALIFICATION_PROOF_RESOURCE_SCHEMA = v.union([QUALIFICATION_EMBEDDED_PROOF_RESOURCE_SCHEMA, QUALIFICATION_REFERENCE_PROOF_RESOURCE_SCHEMA]);
export type QualificationEmbeddedProofResource = v.InferOutput<typeof QUALIFICATION_EMBEDDED_PROOF_RESOURCE_SCHEMA>;
export type QualificationReferenceProofResource = v.InferOutput<typeof QUALIFICATION_REFERENCE_PROOF_RESOURCE_SCHEMA>;
'''
s=s.replace(anchor,new+anchor,1)
p.write_text(s)
p=Path('build_tenants/abiogenesis/typescript/code/src/validator/self_conformance_contracts.ts');s=p.read_text().replace('qualificationIdentityDigest }','qualificationIdentityDigest, QUALIFICATION_RESOURCE_SELECTION_SCHEMA }')
s=s.replace('export const SELF_CONFORMANCE_INPUT_SCHEMA = v.strictObject({','export const SELF_CONFORMANCE_EMBEDDED_INPUT_SCHEMA = v.strictObject({',1)
anchor='/** @internal Runtime parser mechanics; serialized schemas and native data types are the published contract. */\nexport const QUALIFICATION_OWNER_BASIS_SCHEMA'
new='''const selection = <K extends string>(kind: K) => v.strictObject({ ...QUALIFICATION_RESOURCE_SELECTION_SCHEMA.entries, entryKind: v.literal(kind) });
export const SELF_CONFORMANCE_REFERENCE_INPUT_SCHEMA = v.strictObject({ ...SELF_CONFORMANCE_EMBEDDED_INPUT_SCHEMA.entries,
  representation: v.literal("resource_refs_v1"), resource: QUALIFICATION_COORDINATE_SCHEMA,
  law: v.nullable(selection("law")), inventory: v.nullable(selection("inventory")), tenantManifest: v.nullable(selection("tenant_manifest")),
  scope: v.optional(selection("scope")), authorityMembers: v.array(selection("material")),
  qualification: v.optional(v.strictObject({ plan: QUALIFICATION_ASSESSMENT_PLAN_SCHEMA, proof: QUALIFICATION_PROOF_RESOURCE_SCHEMA,
    sourceMembers: v.array(selection("material")), coverageCatalog: selection("coverage_catalog"),
    verification: v.optional(v.strictObject({ ...QUALIFICATION_VERIFICATION_SELECTION_SCHEMA.entries, recipe: selection("verification_recipe") })) })) });
export const SELF_CONFORMANCE_INPUT_SCHEMA = v.union([SELF_CONFORMANCE_EMBEDDED_INPUT_SCHEMA, SELF_CONFORMANCE_REFERENCE_INPUT_SCHEMA]);
export type SelfConformanceEmbeddedInput = v.InferOutput<typeof SELF_CONFORMANCE_EMBEDDED_INPUT_SCHEMA>;
export type SelfConformanceReferenceInput = v.InferOutput<typeof SELF_CONFORMANCE_REFERENCE_INPUT_SCHEMA>;
'''
s=s.replace(anchor,new+anchor,1).replace('export const SELF_CONFORMANCE_RESULT_SCHEMA = v.strictObject({','export const SELF_CONFORMANCE_EMBEDDED_RESULT_SCHEMA = v.strictObject({',1).replace('SELF_CONFORMANCE_INPUT_SCHEMA.entries.','SELF_CONFORMANCE_EMBEDDED_INPUT_SCHEMA.entries.')
anchor='// Keep data inference portable'
new='''export const SELF_CONFORMANCE_REFERENCE_RESULT_SCHEMA = v.strictObject({ ...SELF_CONFORMANCE_EMBEDDED_RESULT_SCHEMA.entries,
  representation: v.literal("resource_refs_v1"), scope: v.optional(selection("scope")) });
export const SELF_CONFORMANCE_RESULT_SCHEMA = v.union([SELF_CONFORMANCE_EMBEDDED_RESULT_SCHEMA, SELF_CONFORMANCE_REFERENCE_RESULT_SCHEMA]);
'''
s=s.replace(anchor,new+anchor,1);p.write_text(s)
