# TypeScript Installer Postmortem

The public TypeScript installer populated a downstream-consumable ABG runtime.

- package: @abiogenesis/typescript-tenant@5.0.0-dev.0
- command paths: /var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-public-installer-toolchain-oVNjQn/products/abiogenesis/5.0.0-dev.0/bin/abiogenesis-ts, /var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-public-installer-toolchain-oVNjQn/products/abiogenesis/5.0.0-dev.0/bin/genesis-ts, /var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-public-installer-toolchain-oVNjQn/products/abiogenesis/5.0.0-dev.0/bin/abg.install
- runtime: package:@abiogenesis/typescript-tenant@5.0.0-dev.0
- runtime binding: /var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-public-installer-IqCSMl/.abiogenesis/cli-runtime.mjs
- fallback config: /var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-public-installer-IqCSMl/.abiogenesis/config/abg.config.json
- standards: /var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-public-installer-toolchain-oVNjQn/products/abiogenesis/5.0.0-dev.0/docs/standards
- bootstrap dependency: file:../abiogenesis-ts-public-installer-toolchain-oVNjQn/products/abiogenesis/5.0.0-dev.0/package-pack/pack-EneczF/abiogenesis-typescript-tenant-5.0.0-dev.0.tgz