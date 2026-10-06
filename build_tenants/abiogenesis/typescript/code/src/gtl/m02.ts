/** Current immutable module/publication contracts and canonical constructors. */
export type * from "./contracts.js";
export type * from "../product/contracts.js";
export * from "./declarations.js";
export { admitModule, serializeModule, GTL_MODULE_SERIALIZATION_API } from "./serialization.js";
export { modulePublicationSemanticDigest } from "../product/publication.js";
