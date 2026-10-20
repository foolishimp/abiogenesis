import {acquireQualificationResources,prepareQualificationAssessment,
    type QualificationResourceAssertion,type QualificationAssessmentInput,type QualificationEmbeddedTask,
    type QualificationReferenceTask,type QualificationResources,type ResolvedQualificationAssessment,
    type PreparedQualificationAssessment,type ProbabilisticWorkerRequest}
    from '@abiogenesis/typescript-tenant/qualification/m05';
declare const assertion:QualificationResourceAssertion, embedded:QualificationEmbeddedTask, reference:QualificationReferenceTask;
declare const input:QualificationAssessmentInput;
const resources:QualificationResources=acquireQualificationResources(assertion);
const preparation:PreparedQualificationAssessment=prepareQualificationAssessment(input,resources);
const view:ResolvedQualificationAssessment=preparation.view;
const request:Readonly<ProbabilisticWorkerRequest>=preparation.request;
const resolveReference=(supplied:QualificationAssessmentInput):PreparedQualificationAssessment=>prepareQualificationAssessment(supplied,resources);
const resolveEmbedded=(supplied:QualificationAssessmentInput):PreparedQualificationAssessment=>prepareQualificationAssessment(supplied);
const closedKind:QualificationAssessmentInput['kind']='qualification_assessment_input';
// @ts-expect-error the published task domain remains closed
const invented:QualificationEmbeddedTask['kind']='new_preparation_task';
// @ts-expect-error an arbitrary object cannot replace canonical acquired resources
prepareQualificationAssessment(input,{});
// @ts-expect-error reference material selections cannot substitute for embedded bodies
const crossed:QualificationEmbeddedTask=reference;
void [embedded,view,request,resolveReference,resolveEmbedded,closedKind,invented,crossed];
