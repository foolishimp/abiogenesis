# TypeScript Installer Postmortem

The public TypeScript installer populated a downstream-consumable ABG runtime.

- package: @abiogenesis/typescript-tenant@4.5.1
- command paths: /var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-public-installer-toolchain-tDX77N/products/abiogenesis/4.5.1/bin/abiogenesis-ts, /var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-public-installer-toolchain-tDX77N/products/abiogenesis/4.5.1/bin/genesis-ts, /var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-public-installer-toolchain-tDX77N/products/abiogenesis/4.5.1/bin/abg.install
- runtime: package:@abiogenesis/typescript-tenant@4.5.1
- runtime binding: /var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-public-installer-vwbmyj/.abiogenesis/cli-runtime.mjs
- fallback config: /var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-public-installer-vwbmyj/.abiogenesis/config/abg.config.json
- standards: /var/folders/rz/r6wxvr0n15d906k2s0jw8j2h0000gn/T/abiogenesis-ts-public-installer-toolchain-tDX77N/products/abiogenesis/4.5.1/docs/standards
- bootstrap dependency: file:../abiogenesis-ts-public-installer-toolchain-tDX77N/products/abiogenesis/4.5.1/package-pack/pack-m4Eo8H/abiogenesis-typescript-tenant-4.5.1.tgz