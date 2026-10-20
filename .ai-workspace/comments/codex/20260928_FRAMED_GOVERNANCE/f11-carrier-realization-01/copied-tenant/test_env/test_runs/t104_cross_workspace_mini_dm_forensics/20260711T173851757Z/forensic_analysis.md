# T-104 Cross-Workspace Mini Data-Mapper Forensics

Suite root: /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t104_cross_workspace_mini_dm_forensics/20260711T173851757Z

## Streams

| Stream | Input workspace | Output workspace | Events |
| --- | --- | --- | --- |
| stream-a | /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t104_cross_workspace_mini_dm_forensics/20260711T173851757Z/stream-a/input_workspace | /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t104_cross_workspace_mini_dm_forensics/20260711T173851757Z/stream-a/review_workspace | 41 |
| stream-b | /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t104_cross_workspace_mini_dm_forensics/20260711T173851757Z/stream-b/input_workspace | /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t104_cross_workspace_mini_dm_forensics/20260711T173851757Z/stream-b/review_workspace | 41 |

## Edge Traversals

### stream-a

| Edge | Input workspace root | Output workspace root | Artifact digest | Fulfilled | Decision |
| --- | --- | --- | --- | --- | --- |
| derive_field_spec | /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t104_cross_workspace_mini_dm_forensics/20260711T173851757Z/stream-a/input_workspace | /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t104_cross_workspace_mini_dm_forensics/20260711T173851757Z/stream-a/review_workspace | sha256:272c7650cfa02ccdf6f5ecd766b4164c70b1718886377e89df90acc364181503 | 3 | close |
| derive_implementation | /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t104_cross_workspace_mini_dm_forensics/20260711T173851757Z/stream-a/review_workspace | /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t104_cross_workspace_mini_dm_forensics/20260711T173851757Z/stream-a/review_workspace | sha256:953e1e0c186f25c58c8458ad4fddc78474f1e03902d1b0d7857f49e54686952f | 4 | close |
| derive_validation | /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t104_cross_workspace_mini_dm_forensics/20260711T173851757Z/stream-a/review_workspace | /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t104_cross_workspace_mini_dm_forensics/20260711T173851757Z/stream-a/review_workspace | sha256:4788fd1874dfb382f06ffac6491fa15f17e23571d4132f45d98a4e06ce448028 | 3 | close |

### stream-b

| Edge | Input workspace root | Output workspace root | Artifact digest | Fulfilled | Decision |
| --- | --- | --- | --- | --- | --- |
| derive_field_spec | /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t104_cross_workspace_mini_dm_forensics/20260711T173851757Z/stream-b/input_workspace | /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t104_cross_workspace_mini_dm_forensics/20260711T173851757Z/stream-b/review_workspace | sha256:272c7650cfa02ccdf6f5ecd766b4164c70b1718886377e89df90acc364181503 | 3 | close |
| derive_implementation | /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t104_cross_workspace_mini_dm_forensics/20260711T173851757Z/stream-b/review_workspace | /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t104_cross_workspace_mini_dm_forensics/20260711T173851757Z/stream-b/review_workspace | sha256:953e1e0c186f25c58c8458ad4fddc78474f1e03902d1b0d7857f49e54686952f | 4 | close |
| derive_validation | /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t104_cross_workspace_mini_dm_forensics/20260711T173851757Z/stream-b/review_workspace | /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t104_cross_workspace_mini_dm_forensics/20260711T173851757Z/stream-b/review_workspace | sha256:4788fd1874dfb382f06ffac6491fa15f17e23571d4132f45d98a4e06ce448028 | 3 | close |

## Cross-Stream Comparison

- stream-a and stream-b: semantic fingerprints match

