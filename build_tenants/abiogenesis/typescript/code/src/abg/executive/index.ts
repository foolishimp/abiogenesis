// Implements: T-160 downstream-facing ABG executive observer projection facade.

export {
  projectExecutiveContinuationInput,
  projectExecutiveObservationView,
  projectExecutivePressureFacts
} from "../m03/contracts/executive_observer.js";

export type {
  ExecutiveContinuationInputProjection,
  ExecutiveObservationView,
  ExecutivePressureAttenuation,
  ExecutivePressureDisposition,
  ExecutivePressureFactProjection,
  ProjectExecutiveObservationViewInput,
  ProjectExecutivePressureFactsInput
} from "../m03/contracts/executive_observer.js";
