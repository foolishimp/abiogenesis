# TypeScript Installer Postmortem

The public TypeScript installer populated a downstream-consumable ABG runtime.

- package: @abiogenesis/typescript-tenant@4.6.0-rc.2
- command paths: /var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-public-installer-toolchain-f3H5NS/products/abiogenesis/4.6.0-rc.2/bin/abiogenesis-ts, /var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-public-installer-toolchain-f3H5NS/products/abiogenesis/4.6.0-rc.2/bin/genesis-ts, /var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-public-installer-toolchain-f3H5NS/products/abiogenesis/4.6.0-rc.2/bin/abg.install
- runtime: package:@abiogenesis/typescript-tenant@4.6.0-rc.2
- runtime binding: /var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-public-installer-JGHaSQ/.abiogenesis/cli-runtime.mjs
- fallback config: /var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-public-installer-JGHaSQ/.abiogenesis/config/abg.config.json
- standards: /var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-public-installer-toolchain-f3H5NS/products/abiogenesis/4.6.0-rc.2/docs/standards
- bootstrap dependency: file:../abiogenesis-ts-public-installer-toolchain-f3H5NS/products/abiogenesis/4.6.0-rc.2/package-pack/pack-YHw5W2/abiogenesis-typescript-tenant-4.6.0-rc.2.tgz