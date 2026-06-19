// Implements: REQ-F-ODDSDLC-040

export interface NodePackageIdentity {
  readonly kind: "node_package_identity";
  readonly packageName: string;
  readonly packageVersion: string;
  readonly dependencies: readonly string[];
  readonly bin: Readonly<Record<string, string>>;
}

export interface PackedNodePackage {
  readonly kind: "packed_node_package";
  readonly packageSourceRoot: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly tarballPath: string;
  readonly packRoot: string;
}

export interface NodePackageBinaryBinding {
  readonly commandName: string;
  readonly commandPath: string;
  readonly packageCommandPath: string;
}

export interface InstalledNodePackage {
  readonly kind: "installed_node_package";
  readonly targetRoot: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly packageRoot: string;
  readonly tarballPath: string;
  readonly commandBindings: readonly NodePackageBinaryBinding[];
}
