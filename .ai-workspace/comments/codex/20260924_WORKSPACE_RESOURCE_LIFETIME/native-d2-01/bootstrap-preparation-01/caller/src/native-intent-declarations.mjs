// Domain declaration/policy data only. No I/O, transport, runtime or admission.
const freeze = value => {
  if (value !== null && typeof value === "object") { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};

export const NATIVE_INTENT_ASSET_POLICY = freeze({
  policyRef: "policy://odd-glc/native-intent-asset@5",
  assetKind: "IntentAsset",
  role: "author",
  claim: "One constructed candidate asset; independent semantic assessment and Executive disposition remain required.",
  requiredContent: [
    "Read every complete selected source member and its source role before constructing the IntentAsset. A source inventory or synopsis does not replace the bodies.",
    "Derive intended outcomes, users, constraints and uncertainties from the entire ordinary input. Do not invent solved requirements, implementation facts, owner rulings or evidence of application completion.",
    "Preserve normative, supporting, speculative and conflicting meanings separately. Retain unresolved references, contradictions and ambiguities; do not silently promote or discard them.",
    "Ground material statements in exact quotations and the selected source member identities. A bounded construction choice must retain outstanding obligations and cannot reduce the governing input.",
    "This is the application subject's IntentAsset, not a replacement for the odd_glc builder Product Definition, its runtime substrate or its method authority.",
  ],
  requiredHeadings: ["Source basis", "Intended outcomes", "Users and context", "Constraints", "Ambiguities and conflicts", "Pending obligations"],
  outputPresentation: "Markdown headed '# IntentAsset', followed by the required level-two headings. Under Source basis, retain every selected memberRef and sha256 exactly. Use prose and exact source quotations for meaning; presentation checks do not establish semantic sufficiency.",
  assessmentCriteria: [
    { ref: "criterion://odd-glc/native-intent/source-faithfulness@5", instruction: "Compare the exact actual asset against every complete selected source body. Identify material omissions, additions and weakened meanings with exact source quotations and candidate passages." },
    { ref: "criterion://odd-glc/native-intent/modality-and-conflicts@5", instruction: "Assess preservation of normative, supporting, speculative and conflicting meanings, source roles, unresolved references and owner rulings." },
    { ref: "criterion://odd-glc/native-intent/intent-meaning@5", instruction: "Assess intended outcomes, users, constraints and uncertainties. Do not demand implementation or proof facts that the Intent stage has not established." },
    { ref: "criterion://odd-glc/native-intent/pending-scope@5", instruction: "Assess whether all outstanding input obligations remain visible and the claim stays bounded to this asset transition. No application, lifecycle or release closure follows." },
  ],
  independentAssessment: "A separate fresh read-only Reviewer inspects the full source, actual post-work asset and exact admitted observation/evidence coordinates. It returns CLOSED evidence to Executive; it neither edits the subject nor grants admission or automatic advancement.",
});

const paths = (values, label) => {
  if (!Array.isArray(values) || values.length === 0 || new Set(values).size !== values.length ||
    values.some(path => typeof path !== "string" || path.length === 0 || path.startsWith("/") ||
      path.includes("\\") || path.split("/").some(part => part === ".." || part === "")))
    throw new TypeError(label + " requires distinct relative paths");
  return [...values];
};

/** Returns ordinary work-order fields for Product.constructNativeWorkspaceWorkTask.
 * The ABI owner acquires context, validates grants/scope and renders the prompt.
 */
export function constructNativeIntentWorkDeclaration({ sourceBasisPath, sourcePaths, policyPath, assetPath,
  sourceBasisRef, readRoots, maxFiles, maxBytes }) {
  const selectedSources = paths(sourcePaths, "complete source selection");
  const readFirst = paths([sourceBasisPath, policyPath, ...selectedSources], "readFirst");
  paths([assetPath], "asset path");
  if (readFirst.includes(assetPath)) throw new TypeError("Intent output cannot replace selected source or governing policy");
  if (typeof sourceBasisRef !== "string" || !sourceBasisRef.startsWith("stdo://releases/"))
    throw new TypeError("an explicit immutable source-method basis is required");
  return freeze({
    readRoots: paths(readRoots, "read roots"), maxFiles, maxBytes,
    outcome: `Construct the application-subject IntentAsset at ${assetPath} from the complete selected ordinary source.`,
    instructions: [
      `Apply the unchanged source-project method basis ${sourceBasisRef}. Read ${policyPath} and ${sourceBasisPath}, then every listed source body in full.`,
      ...NATIVE_INTENT_ASSET_POLICY.requiredContent,
      NATIVE_INTENT_ASSET_POLICY.outputPresentation,
      `Only ${assetPath} may be created or changed. Preserve every input and policy byte; create no other durable files.`,
      "Use native reads and edits within the declared worksite. Return the candidate location and remaining gaps. A worker report or a structural check does not establish semantic completion.",
    ],
    readFirst, writeRoots: [assetPath],
    checks: ["Read the final asset and compare it with all selected source bodies and required presentation. No application build, execution, dependency installation or unrelated work is selected by this Intent-only transition."],
  });
}

/** Fresh-role evaluation policy; data for an Executive activation, not dispatch. */
export function constructNativeIntentReviewDeclaration({ sourceBasisRef, sourceBasisPath, sourcePaths, policyPath,
  assetPath, observationRef, observationDigest, assetDigest }) {
  paths([sourceBasisPath, policyPath, ...sourcePaths, assetPath], "reviewed inputs");
  if (![observationRef, observationDigest, assetDigest, sourceBasisRef].every(value => typeof value === "string" && value.length > 0))
    throw new TypeError("review requires the exact actual asset, admitted observation and immutable basis coordinates");
  return freeze({ role: "reviewer", sourceBasisRef, sourceBasisPath, sourcePaths: [...sourcePaths], policyPath, assetPath,
    subject: { observationRef, observationDigest, assetDigest }, writeRoots: [],
    criteria: NATIVE_INTENT_ASSET_POLICY.assessmentCriteria,
    instructions: [NATIVE_INTENT_ASSET_POLICY.independentAssessment,
      "Reacquire the exact subject and full source independently. Do not use the author's summary or structural pass as a semantic verdict.",
      "Return satisfied, falsified or indeterminate for each criterion with source/candidate evidence and material findings. Preserve unsupported or missing evidence as a gap. Route the CLOSED result only to Executive."],
  });
}
