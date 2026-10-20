import type { FanOutMaterialization, GraphFunction, GraphMaterializationBasis, GraphTemplate, GtlGraph } from "./contracts.js";
export declare function isMaterializedGtlGraph(value: object): boolean;
export declare function rehydrateMaterializedGtlGraph(value: unknown): Readonly<GtlGraph> | null;
export interface MaterializedGraphShape {
    readonly template: GraphTemplate;
    readonly fanOutMaterializations: readonly FanOutMaterialization[];
}
export declare function deriveMaterializedGraphShape(graphFunction: Readonly<GraphFunction>, basis: GraphMaterializationBasis): MaterializedGraphShape;
export declare function materializeGraph(graphFunction: Readonly<GraphFunction>, basis: GraphMaterializationBasis): Readonly<GtlGraph>;
