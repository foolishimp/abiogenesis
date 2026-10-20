# TypeScript Installer Postmortem

The public TypeScript installer populated a downstream-consumable ABG runtime.

- package: @abiogenesis/typescript-tenant@4.6.0-rc.3
- command paths: /var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-public-installer-toolchain-3QioJF/products/abiogenesis/4.6.0-rc.3/bin/abiogenesis-ts, /var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-public-installer-toolchain-3QioJF/products/abiogenesis/4.6.0-rc.3/bin/genesis-ts, /var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-public-installer-toolchain-3QioJF/products/abiogenesis/4.6.0-rc.3/bin/abg.install
- runtime: package:@abiogenesis/typescript-tenant@4.6.0-rc.3
- runtime binding: /var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-public-installer-6eKcsW/.abiogenesis/cli-runtime.mjs
- fallback config: /var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-public-installer-6eKcsW/.abiogenesis/config/abg.config.json
- standards: /var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-public-installer-toolchain-3QioJF/products/abiogenesis/4.6.0-rc.3/docs/standards
- bootstrap dependency: file:../abiogenesis-ts-public-installer-toolchain-3QioJF/products/abiogenesis/4.6.0-rc.3/package-pack/pack-ocTtPZ/abiogenesis-typescript-tenant-4.6.0-rc.3.tgz