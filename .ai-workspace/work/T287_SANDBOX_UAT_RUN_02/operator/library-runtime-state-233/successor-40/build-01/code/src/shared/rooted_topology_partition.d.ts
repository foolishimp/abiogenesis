import { type Sha256Digest } from "./digests.js";
export interface CanonicalRootedTopologySegment {
    readonly segmentRef: string;
    readonly parentRef: string;
}
export interface CanonicalRootedTopologyWitness {
    readonly kind: "canonical_rooted_topology_witness";
    readonly schemaVersion: "5.0.0";
    readonly topologyRef: string;
    readonly basisRef: string;
    readonly basisDigest: Sha256Digest;
    readonly rootRef: string;
    readonly segments: readonly CanonicalRootedTopologySegment[];
}
export interface CanonicalRootedTopologyPartition {
    readonly kind: "canonical_rooted_topology_partition";
    readonly schemaVersion: "5.0.0";
    readonly topologyRef: string;
    readonly basisRef: string;
    readonly basisDigest: Sha256Digest;
    readonly rootRef: string;
    readonly preserved: readonly string[];
    readonly exited: readonly string[];
    readonly entered: readonly string[];
}
export type CanonicalRootedTopologyPartitionRefusalCode = "invalid_witness" | "topology_mismatch" | "basis_mismatch" | "root_mismatch" | "adjacency_mismatch";
export interface CanonicalRootedTopologyPartitionRefusal {
    readonly kind: "canonical_rooted_topology_partition_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: CanonicalRootedTopologyPartitionRefusalCode;
    readonly message: string;
}
export declare function deriveCanonicalRootedTopologyPartition(source: CanonicalRootedTopologyWitness, target: CanonicalRootedTopologyWitness): CanonicalRootedTopologyPartition | CanonicalRootedTopologyPartitionRefusal;
