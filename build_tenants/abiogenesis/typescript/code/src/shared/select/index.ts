// The `select` family (design §4.2).
export {
  exactMatchCardinality,
  exactMatchOutcome,
  onlyExactMatch,
  resolveExactMatch,
  type ExactMatch,
  type ExactMatchSource,
} from "./exact_match.js";
export {
  checkExactRecord,
  type CheckedRecord,
  type RecordCheck,
} from "./exact_record.js";
