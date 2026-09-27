// Canonical bounded continuation. Every application selection is invocation data.
export const VERSION = "5.0.0";
export const PACKAGE_NAME = "@odd-glc/route-one-typescript";
export const PACKAGE_VERSION = "0.2.0-dev.5";
const ref = (kind, name = "") => `${kind}://odd-glc/native-continuation${name ? "/" + name : ""}@5`;
export const ids = Object.freeze({
 productId:`product://odd_glc/route-one-typescript@${PACKAGE_VERSION}`,
 descriptorRef:`descriptor://odd_glc/route-one-typescript@${PACKAGE_VERSION}`,
 contributionManifestRef:`contribution-manifest://odd_glc/route-one-typescript@${PACKAGE_VERSION}`,
 catalogRef:`catalog://odd_glc/public-contracts@${PACKAGE_VERSION}`,
 provenanceRef:`provenance://odd_glc/route-one-typescript@${PACKAGE_VERSION}`,
 moduleRef:ref("module"),programRef:ref("program"),graphFunctionRef:ref("graph-function"),
 assessmentWrapperRef:ref("graph-function","execution-assessment"),graphRef:ref("graph"),wrapperGraphRef:ref("graph","execution-assessment"),startRef:ref("start"),
 semanticsBindingRef:ref("product-semantics"),inputContractRef:ref("contract","input"),boundInputContractRef:"contract://abiogenesis/worksite/retained-graph-input@5",rawContractRef:ref("contract","criterion-verdicts"),
 evidenceContractRef:ref("contract","evidence"),failureContractRef:ref("contract","failure"),refusalContractRef:ref("contract","refusal"),
 judgmentContractRef:ref("contract","judgment"),transitionContractRef:ref("contract","transition"),closureContractRef:ref("contract","closure"),wrapperClosureContractRef:ref("contract","assessment-closure"),
 completionPredicateRef:ref("predicate","completed"),wrapperPredicateRef:ref("predicate","execution-assessed"),stepPredicateRef:ref("predicate","step"),wrapperStepPredicateRef:ref("predicate","assessment-step"),
 selectNodeRef:ref("node","select-request"),reacquisitionNodeRef:ref("node","reacquire"),executionNodeRef:ref("node","execute"),assessmentNodeRef:ref("node","assess-execution"),
 wrapperPrepareNodeRef:ref("node","prepare-assessment"),wrapperCallNodeRef:ref("node","native-assessment") });
export const inputContract = Object.freeze({contractRef:ids.inputContractRef,contractVersion:VERSION,contractKind:"input",valueKind:"native_continuation_input"});
export const rawContract = Object.freeze({contractRef:ids.rawContractRef,contractVersion:VERSION,contractKind:"output",valueKind:"native_asset_criterion_assessment"});
export const executionContract = Object.freeze({contractRef:"contract://abiogenesis/worksite/command-execution-observation@5",contractVersion:VERSION,contractKind:"output",valueKind:"worksite_command_execution_observation"});
export const stages = Object.freeze([
 ["select-request","selectRequest",ids.inputContractRef,"contract://abiogenesis/worksite/native-command-reacquisition-request@5",ids.selectNodeRef],
 ["prepare-assessment","prepareAssessment",ids.boundInputContractRef,"contract://abiogenesis/worksite/native-work/task@5",ids.wrapperPrepareNodeRef],
].map(([name,namedSymbol,inputContractRef,outputContractRef,programLocusRef]) => Object.freeze({name,namedSymbol,inputContractRef,outputContractRef,programLocusRef,
 implementationRef:ref("implementation",name),bindingRef:ref("implementation-binding",name),predicateRef:ref("predicate",name),armId:ref("arm",name)})));
export const bindingFor = stage => ({kind:"implementation_binding",bindingRef:stage.bindingRef,implementationRef:stage.implementationRef,
 packageName:PACKAGE_NAME,packageVersion:PACKAGE_VERSION,modulePath:"build/native-continuation-runtime.mjs",namedSymbol:stage.namedSymbol,computeRegime:"F_D",
 inputContractRef:stage.inputContractRef,outputContractRef:stage.outputContractRef,failureContractRef:ids.failureContractRef,refusalContractRef:ids.refusalContractRef});

export const ASSESSMENT_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "contract://odd-glc/native-continuation/criterion-verdicts@5",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "kind",
    "criteria",
    "residuals"
  ],
  "properties": {
    "kind": {
      "const": "native_asset_criterion_assessment"
    },
    "criteria": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "criterionRef",
          "disposition",
          "rationale",
          "evidence"
        ],
        "properties": {
          "criterionRef": {
            "type": "string",
            "minLength": 1
          },
          "disposition": {
            "enum": [
              "satisfied",
              "falsified",
              "indeterminate"
            ]
          },
          "rationale": {
            "type": "string",
            "minLength": 1
          },
          "evidence": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": false,
              "required": [
                "path",
                "quote"
              ],
              "properties": {
                "path": {
                  "type": "string",
                  "minLength": 1
                },
                "quote": {
                  "type": "string",
                  "minLength": 1
                }
              }
            }
          }
        }
      }
    },
    "residuals": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "scope",
          "criterionRef",
          "description"
        ],
        "properties": {
          "scope": {
            "enum": [
              "selected-assessment",
              "outside-assessment"
            ]
          },
          "criterionRef": {
            "type": [
              "string",
              "null"
            ]
          },
          "description": {
            "type": "string",
            "minLength": 1
          }
        }
      }
    }
  }
};
export const ASSESSMENT_SCHEMA_TEXT = JSON.stringify(ASSESSMENT_SCHEMA) + "\n";

export const constructBoundContract = product => product.RETAINED_GRAPH_INPUT_CONTRACT;

// One additional generic callable. Job meaning and repair territories are input.
export const correction = Object.freeze({
 graphFunctionRef:ref('graph-function','correction'),graphRef:ref('graph','correction'),startRef:ref('start','correction'),
 wrapperRef:ref('graph-function','correction-assessment'),wrapperGraphRef:ref('graph','correction-assessment'),
 inputContractRef:ref('contract','correction-input'),decisionContractRef:ref('contract','correction-decision'),
 selectionContractRef:ref('contract','correction-selection'),wrapperClosureRef:ref('contract','correction-assessment-closure'),
 stepPredicateRef:ref('predicate','correction-step'),wrapperPredicateRef:ref('predicate','correction-assessed'),
 selectorNodeRef:ref('node','select-affectedness'),authorNodeRef:ref('node','correct'),executionNodeRef:ref('node','execute-correction'),
 assessmentNodeRef:ref('node','assess-correction'),wrapperCallNodeRef:ref('node','native-correction-assessment'),
});
export const correctionInputContract=Object.freeze({contractRef:correction.inputContractRef,contractVersion:VERSION,contractKind:'input',valueKind:'native_correction_input'});
export const correctionDecisionContract=Object.freeze({contractRef:correction.decisionContractRef,contractVersion:VERSION,contractKind:'output',valueKind:'native_correction_decision'});
export const correctionSelectionContract=Object.freeze({contractRef:correction.selectionContractRef,contractVersion:VERSION,contractKind:'output',valueKind:'native_correction_selection'});
export const correctionStages=Object.freeze([
 ['prepare-correction-selection','prepareCorrectionSelection',correction.inputContractRef,'contract://abiogenesis/worksite/native-work/task@5'],
 ['select-correction','selectCorrection',ids.boundInputContractRef,correction.decisionContractRef],
 ['prepare-correction-author','prepareCorrectionAuthor',correction.decisionContractRef,'contract://abiogenesis/worksite/native-work/task@5'],
 ['prepare-correction-execution','prepareCorrectionExecution',ids.boundInputContractRef,executionContract.contractRef.replace('observation','task')],
 ['prepare-correction-assessment','prepareCorrectionAssessment',ids.boundInputContractRef,'contract://abiogenesis/worksite/native-work/task@5'],
].map(([name,namedSymbol,inputContractRef,outputContractRef])=>Object.freeze({name,namedSymbol,inputContractRef,outputContractRef,
 programLocusRef:ref('node',name),implementationRef:ref('implementation',name),bindingRef:ref('implementation-binding',name),predicateRef:ref('predicate',name),armId:ref('arm',name)})));
const nonblank={type:'string',minLength:1};
export const CORRECTION_SELECTION_SCHEMA={
 '$schema':'https://json-schema.org/draft/2020-12/schema','$id':correction.selectionContractRef,type:'object',additionalProperties:false,
 required:['kind','disposition','issues','dependencyPaths','reason'],properties:{
  kind:{const:'native_correction_selection'},disposition:{enum:['construction_repair','stage_revision_required','blocked']},reason:nonblank,
  dependencyPaths:{type:'array',uniqueItems:true,items:nonblank},
  issues:{type:'array',items:{type:'object',additionalProperties:false,required:['causeRef','writePaths','reason','evidence'],properties:{
   causeRef:nonblank,writePaths:{type:'array',uniqueItems:true,items:nonblank},reason:nonblank,
   evidence:{type:'array',minItems:1,items:{type:'object',additionalProperties:false,required:['path','quote'],properties:{path:nonblank,quote:nonblank}}},
  }}},
 }};
export const CORRECTION_SELECTION_SCHEMA_TEXT=JSON.stringify(CORRECTION_SELECTION_SCHEMA)+'\n';

// Opt-in Design re-entry. These are ordinary values, never semantic ancestry.
export const reentry=Object.freeze({
 graphFunctionRef:ref('graph-function','design-reentry'),graphRef:ref('graph','design-reentry'),startRef:ref('start','design-reentry'),
 reviewRef:ref('graph-function','design-review'),reviewGraphRef:ref('graph','design-review'),
 constructionRef:ref('graph-function','design-construction'),constructionGraphRef:ref('graph','design-construction'),
 assessmentRef:ref('graph-function','design-outcome-assessment'),assessmentGraphRef:ref('graph','design-outcome-assessment'),
 inputContractRef:ref('contract','design-reentry-input'),handoffContractRef:ref('contract','selected-design'),rawContractRef:ref('contract','design-verdict'),
 reviewClosureRef:ref('contract','design-review-closure'),constructionClosureRef:ref('contract','design-construction-closure'),assessmentClosureRef:ref('contract','design-outcome-closure'),
 stepPredicateRef:ref('predicate','design-reentry-step'),reviewPredicateRef:ref('predicate','design-reviewed'),constructionPredicateRef:ref('predicate','design-constructed'),assessmentPredicateRef:ref('predicate','design-outcome-assessed'),
 authorNodeRef:ref('node','author-design'),reviewNodeRef:ref('node','review-design'),reviewCallNodeRef:ref('node','native-design-review'),
 constructionNodeRef:ref('node','construct-selected-design'),authorCallNodeRef:ref('node','native-design-construction'),executionNodeRef:ref('node','execute-selected-design'),
 assessmentNodeRef:ref('node','assess-design-outcome'),assessmentCallNodeRef:ref('node','native-design-outcome-assessment'),
});
const reentryContract=(contractRef,contractKind,valueKind)=>Object.freeze({contractRef,contractVersion:VERSION,contractKind,valueKind});
export const reentryInputContract=reentryContract(reentry.inputContractRef,'input','native_design_reentry_input');
export const designHandoffContract=reentryContract(reentry.handoffContractRef,'output','native_selected_design');
export const designAssessmentContract=reentryContract(reentry.rawContractRef,'output','native_design_assessment');
export const reentryStages=Object.freeze([
 ['prepare-design-author','prepareDesignAuthor',reentry.inputContractRef,'contract://abiogenesis/worksite/native-work/task@5'],
 ['prepare-design-review','prepareDesignReview',ids.boundInputContractRef,'contract://abiogenesis/worksite/native-work/task@5'],
 ['select-current-design','selectCurrentDesign',ids.boundInputContractRef,reentry.handoffContractRef],
 ['prepare-design-construction','prepareDesignConstruction',reentry.handoffContractRef,'contract://abiogenesis/worksite/native-work/task@5'],
 ['prepare-design-execution','prepareDesignExecution',ids.boundInputContractRef,executionContract.contractRef.replace('observation','task')],
 ['prepare-design-outcome','prepareDesignOutcome',ids.boundInputContractRef,'contract://abiogenesis/worksite/native-work/task@5'],
].map(([name,namedSymbol,inputContractRef,outputContractRef])=>Object.freeze({name,namedSymbol,inputContractRef,outputContractRef,
 programLocusRef:ref('node',name),implementationRef:ref('implementation',name),bindingRef:ref('implementation-binding',name),predicateRef:ref('predicate',name),armId:ref('arm',name)})));
export const DESIGN_ASSESSMENT_SCHEMA={
 '$schema':'https://json-schema.org/draft/2020-12/schema','$id':reentry.rawContractRef,type:'object',additionalProperties:false,
 required:['kind','disposition','reason','evidence','causes','dependencyPaths'],properties:{kind:{const:'native_design_assessment'},
 disposition:{enum:['satisfied','falsified','indeterminate']},reason:nonblank,
 evidence:CORRECTION_SELECTION_SCHEMA.properties.issues.items.properties.evidence,
 causes:CORRECTION_SELECTION_SCHEMA.properties.issues,
 dependencyPaths:{type:'array',uniqueItems:true,items:nonblank}}};
export const DESIGN_ASSESSMENT_SCHEMA_TEXT=JSON.stringify(DESIGN_ASSESSMENT_SCHEMA)+'\n';
