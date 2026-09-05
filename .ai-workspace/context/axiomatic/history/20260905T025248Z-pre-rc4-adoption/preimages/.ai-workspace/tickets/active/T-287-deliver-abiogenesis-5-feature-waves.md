# T-287 - Deliver ABIogenesis 5.0 Feature Waves

- id: T-287
- type: feature
- ticket_category: design_reframe
- status: active
- goal: GOAL-035
- priority: critical
- owner: abiogenesis
- pen_holder: codex
- build_tenant: typescript
- change_intent: clarify_c0_atomic_namespace_publication_and_trusted_desktop_nonclaim_while_stage_1_source_remains_frozen_on_hold
- change_class: design_reframe
- re_entry_point: specification/GOALS.md#current-selection
- retriaged_at: 2026-09-03
- migration_strategy: inside_out_hard_break
- selected_method: STDO v2.5.0-rc.4
- selected_method_tag_object: 032dac0c833111547f7dd4b290c5316ed9b70f97
- selected_method_commit: 7a25668a8fecfd26f895759af3bec4708727964a
- selected_method_manifest_sha256: 4fa2556d0127bebce8f7184cc4a3cb708a175b2e40552c55cb211f2426d5049e
- selected_method_member_set_sha256: 504db879867f60e46ed4dea60509d12056d10cdd8c3460dc94abf7bc56542656
- selected_method_adopted_at: 2026-09-02
- selected_method_adoption_change_class: product_reprice
- selected_method_adoption_re_entry_point: specification/PRODUCT.md#governance-and-release-boundary
- selected_method_adoption_authority: direct human Product-owner instruction, "everything should close on RC4, and have consumed RC4"
- selected_method_adoption_disposition: replace only the operative STDO RC3 basis with published immutable RC4; preserve historical RC2/RC3 evidence, ABIogenesis Product meaning, and the then-selected T-287 implementation/evidence increment
- selected_method_adoption_evidence: direct Product-owner RC4 coordinate instruction plus exact immutable tag, commit, installed-manifest, and standards member-set identities
- historical_rc3_adoption_plan_sha256: 015486b0caac533f0b915501f0e21ad0d53c8d142a3e492aca1b071bd0f227f8
- selected_method_toolchain: stdo-toolchain 0.1.2
- development_product: STDO Representation v0.1.0-rc.1
- development_product_tag_object: 46e9cb36ce0056cf75e9c12bcde4e6834a1d3a4f
- development_product_commit: b127ee9a0362f85d4875ae59664ecfcd13028d9c
- development_product_tree: 15f9beb360836386ce9607dd31e30d0c8b5cd830
- development_product_inventory_sha256: 316121da619af277b984a599d290e41e4740ef9f1a2bf3fd8151ac9b1d64e091
- development_product_program_identity: e325e4399560b0be5562d345005818e4f925f72ecbfd9a234207f8c77b095cc5
- development_product_map_identity: 2df34cb85bf6fbad2436e468e14cb5c26ff8d0aa721f8de10bb7e948b0d21b78
- project_reference_frame_basis: build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md
- governing_library: effect@3.22.1
- immutable_reference_product: v4.6.0-rc.5
- selected_wave: W2
- selected_feature: A5-F10
- selection_schedule_context: Wave_2
- selected_slice: W2-R3-C0-C2-I-E-WORKSITE-ROOT
- selected_work: W2-R3-C0-C2-I-E-WORKSITE-ROOT
- selected_work_class: realization_refactor
- selected_design_children: build_tenants/abiogenesis/typescript/design/T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN.md; build_tenants/abiogenesis/typescript/design/T287_W2_R3_C1_LIVE_LLM_WORKSITE_CONSTRUCTION_DESIGN.md; build_tenants/abiogenesis/typescript/design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md
- selected_design_status: c0_atomic_window_candidate_pending_independent_review_c1_c2_accepted
- selected_design_freeze: frozen_exact_2026_09_04_candidate_no_further_mutation_before_review
- accepted_design_subject_goals_sha256: 69fbc1b91cd511839308c110648a4eb4154a1aa0bc1b8d95d2819bbaf768dfa5
- accepted_design_subject_ticket_sha256: aa3863cddd4efabdd89c5bebadca307b2daa794adc1b071b32b1557574ba39f6
- accepted_c0_design_sha256: 427ced47826e95ef0262ca0d4797eaf144b07d14e30f8e4ace1de6b585864b84
- candidate_c0_atomic_window_design_sha256: 7cd8a5a905cdb02c8431b06224df5aa46cfc8f759a7dc5c1fd4712e66c652240
- accepted_c1_design_sha256: 61589c4428c6d26f7e8063d40c9d6e653897df8a5bbfaf8d0fb048ce8cce3c61
- accepted_c2_design_sha256: 8dbe22c8bcc2bcedc0e77a5f03a2fde1805d408e555e83bde342b9bb1d2a2301
- accepted_design_subject_readme_sha256: 027883ffd5b1edee36f1709b35b774735b22f88fd124f2d83b2d600fc1d83829
- prior_accepted_design_review: two_independent_go_p0_0_p1_0_p2_0_p3_1_retained_c2_trusted_desktop_nonclaim
- selected_design_review: pending_independent_review_of_frozen_c0_atomic_window_candidate
- selected_design_executive_disposition: bounded_design_reframe_selected_exact_19_path_i_e_retained_stage_1_source_frozen_on_hold
- atomic_window_reframe_preimage_goals_sha256: 08eb3cf2ffa414a7e5d60933a92ce009f116f3f8c2fd464603e27b80691d2bc0
- atomic_window_reframe_preimage_ticket_sha256: e7806a2fa3c7615081694c1291e24c65fda70d2fd9d27497bdf59fb384e51fd3
- atomic_window_reframe_preimage_c0_design_sha256: 427ced47826e95ef0262ca0d4797eaf144b07d14e30f8e4ace1de6b585864b84
- atomic_window_reframe_preimage_design_readme_sha256: f4631b62886335b789caf5af0419d55791ae5a6b0c372260b1054c0017f82bc8
- worksite_root_reframe_preimage_goals_sha256: 3fba60ab24a80130f8b6628959ccccf55887e2f666f5c5f9c5af67e6690c9a5d
- worksite_root_reframe_preimage_ticket_sha256: 362f804140791d0a734311dc57f4648bd6d3e02654644890c4847411d3234d80
- worksite_root_reframe_preimage_c0_design_sha256: ccb19745eadca757db028cf0c5ded5d92d3507f65f0ba7189958984117ed475a
- worksite_root_reframe_preimage_c1_design_sha256: 7db51dc50720bc36e729f4b17968c2e9c01d1f88ba673b10a2e165a3a31f98e1
- worksite_root_reframe_preimage_c2_design_sha256: f4eafb82961beb6ebe47fa54eb91dc7deb470c8fb106609f7d3d12ced76d074b
- worksite_root_reframe_preimage_design_readme_sha256: 14550dae8c1f9f655b3a570f6476a3e6d48e43e408887df8810f55b10802d63a
- worksite_root_reframe_dirty_overlap: all_six_authorized_paths_were_uncommitted_and_were_amended_in_place
- prior_accepted_c2_two_manifest_design_sha256: f4eafb82961beb6ebe47fa54eb91dc7deb470c8fb106609f7d3d12ced76d074b
- prior_accepted_c2_two_manifest_design_status: retained_how_except_root_semantics_superseded_by_accepted_current_design
- prior_accepted_c2_amended_design_sha256: f7075c286d33e6b95ae5a3481e5900e45052f65f8d434f6ee09039d29d7a12fe
- prior_accepted_c2_amended_design_review: go_p0_0_p1_0_p2_0
- prior_accepted_c2_amended_design_status: historical_how_superseded_by_accepted_current_design
- explicit_c2_p3: fully_recomputed_coherent_same_user_task_and_launch_and_derived_sibling_substitution_is_not_pre_effect_authenticated
- explicit_c0_atomic_window_p3: ungoverned_external_or_same_user_target_or_parent_namespace_mutation_after_final_pre_effect_validation_and_before_publication_syscall_is_not_prevented
- superseded_c2_bare_task_candidate_sha256: db85b4330b14baeedda6ee65a55cec740fe07d73dfce6086fbb74ed3fcf164e7
- superseded_c2_bare_task_candidate_review: hold_p2_bare_task_cannot_authenticate_attempt_before_effect
- superseded_c2_self_auth_envelope_candidate_sha256: 9eb7d4987587b49cc54eed763cd66e98d97078f00746e85bc9adb0dd6cfb43e7
- superseded_c2_self_auth_envelope_candidate_review: hold_p2_missing_external_pre_effect_attempt_anchor
- selected_implementation_increment: canonical_root_c0_c1_c2_stage_1_exact_9_production_paths
- selected_evidence_increment: canonical_root_c0_c1_c2_stage_2_exact_8_support_evidence_paths_plus_2_generated_outputs
- implementation_status: stage_1_exact_9_source_paths_frozen_hold_after_two_independent_reviews
- stage_1_source_mutability: frozen_untouched_by_atomic_window_design_reframe
- stage_1_hold: c0_atomic_window_design_ambiguity_clarified_candidate_and_owner_unity_realization_repair_pending
- stage_1_owner_unity_relation: one_unique_program_graph_function_and_implementation_owner_product_install_with_separate_publication_digests_not_required_equal
- c2_helper_locus_relation: retained_exact_installed_helper_beneath_workspace_binding_toolchain_root_with_existing_helper_package_locus_joins_no_product_root_rebase
- stage_2_status: blocked_pending_candidate_design_acceptance_and_stage_1_owner_unity_repair_and_independent_source_go
- selected_execution_order: stage_1_production_then_independent_source_review_then_stage_2_support_evidence_and_generated_outputs_then_independent_source_evidence_review_and_package_verification
- selected_path_count: 19_existing_paths
- selected_design_mutability: c1_c2_immutable_c0_candidate_frozen_pending_review
- selected_artifact_status: none
- selected_package_status: verification_gate_only_no_metadata_mutation_or_publication
- selected_git_status: no_git_effect_selected
- odd_live_gate: prohibited_no_accepted_artifact_or_downstream_reacquisition_selected
- prior_accepted_c2_design_sha256: 7f69c4c0c5e027f4025c0f3885042c65a668b4089eb139d278c0cdbc78e4f570
- accepted_c2_semantic_carrier_source_sha256: f7516e80684158283f2d94aba3fa074e3d9cd1cdb9f45ef84848a78c72f3f555
- accepted_c2_semantic_carrier_test_sha256: 6728d025ece92decf0b788d5ec985050dedea2afdd9bf5cbf99c88983fc13faa
- accepted_c2_semantic_carrier_artifact_sha256: 7272967ec7bed96612768b3ae7fe5e34382eca1127ce69a3e69a6fba9c119df1
- accepted_c2_semantic_carrier_manifest_file_sha256: c1dca319e995733db0debc68c7fe176433e7747ebbb6c11d9d3396d0d23fbdbd
- accepted_c2_semantic_carrier_product_content_digest: a0236266e8c9d8c6654d33b8767ac4c21b1192c42f45b9bda17d6ae58afa3076
- accepted_c2_semantic_carrier_publication_digest: f7cb3acd366932f80881c24f6628f9462f0bf127ee726c2c0fedd7490506493b
- accepted_c2_semantic_carrier_review: go_p0_0_p1_0_p2_0
- accepted_c2_semantic_carrier_status: accepted_predecessor_superseded_for_transport_relay
- c2_transport_relay_finding: p1_live_relay_defect
- c2_transport_relay_repaired_artifact_sha256: d5278229916565777e4fd3e0c61d6000825ca944998f765dbf112584f36b3726
- c2_transport_relay_repaired_manifest_file_sha256: 7f3be93f8a9c05ab60219637dcc2e9d7be073ad558dae2278f4a78410eb7c680
- c2_transport_relay_repaired_product_content_digest: 4c7c8509cb98f04a017ae79d2fe1b5500a9fc61bf8bd8c4883557a4a347bdc61
- c2_transport_relay_repaired_publication_digest: 24336ffee58eedc639df04f8a95d6c5fffbf9207737a9026b0e46dc4d8c494bd
- c2_transport_relay_repaired_review: go_p0_0_p1_0_p2_0
- c2_transport_relay_repaired_status: accepted_exact_installed_predecessor
- c2_transport_relay_gate: satisfied_exact_independently_accepted_predecessor
- c2_helper_locus_fifth_failure_evidence: repo://odd-glc/build_tenants/odd_glc/typescript/test_runs/generic-live-workflow/basic-cli/20260902T102307822Z_pid92983/
- c2_helper_locus_fifth_failure_run_id: run://abiogenesis/3ee1b3b114f8f6a5a7bb287fc7d26df69744c3afa71f089dce357251231d77b5
- c2_helper_locus_fifth_failure_result: transport_identity_mismatch_then_run_stopped_after_helper_effects
- c2_helper_locus_historical_artifact_sha256: e0bd55d90b2a2005c2021ba75f127a6a0402a7675994a757dd350b76e16cd449
- accepted_c3_design_sha256: 6da224353368e1ba9e2fc5651640ece743f6b528e98bbd9ccb58b8624a96e2a8
- accepted_c3_evidence_test_sha256: 5c04ad0bc0dc7b8caff32f5242d49040c7c2a5fd9acea88ce643265849a657c9
- accepted_c3_manifest_sha256: b7749e6d20a6c278ce5a42b4be728b86e15b5efbe56e732820cb92836f481140
- accepted_c3_product_content_digest: a0ff7fd2298698868d340146c7a739599ceda16a87ae07108112cf7493f30126
- accepted_c3_catalog_digest: d036a63e7e163246f750e94b0923305412be66f2848e4c5272f55040a8926b36
- accepted_c3_c1_c3_publication_digest: 72a5e998592913bd3142e7a6d3064190f3799d0eb58c94343f39a10cd2c6d8fe
- accepted_c3_qualified_historical_artifact_sha256: e0bd55d90b2a2005c2021ba75f127a6a0402a7675994a757dd350b76e16cd449
- accepted_c3_source_evidence_review: go_p0_0_p1_0_p2_0_data_mapper_public_9_22_1_of_1_628_09s
- accepted_c3_artifact_review: go_p0_0_p1_0_p2_0_c2_87_642s_parallel_185_376s_partial_96_683s_identity_20_20_28_28
- accepted_c3_i_e_status: completed_and_qualified_product_goal_open_pending_odd_consumption
- accepted_c0_artifact_sha256: 84ed06353e06795fcfaeb67fdc39c3b7cf98683ae8aed5fd348b88e18743de5f
- accepted_c0_evidence_test_sha256: 2cef751c286178d1d95b22684a7122e22120e839a4aa896138e934ab97303714
- accepted_c0_review: go_p0_0_p1_0_p2_0
- next_implementation_version_floor: 5.0.0-dev.288
- next_implementation_version_status: unallocated_reserved_floor_only
- accepted_predecessor_slice: ST-S01-ROOT
- accepted_predecessor_increment: S1
- accepted_predecessor_status: accepted_design_realization_stopped_on_p0
- stable_entry_tag: v5.0.0-dev.286
- stable_entry_commit: 3014f12571c12f97f85dfe54ca4da28e7dfee3ea
- stable_entry_tree: a399045de5d752b92c084b5b38b358aa2d1c63aa
- accepted_wave_2_roadmap_commit: 3ab1ee6892bb22fc60206d38edbe8b970cca1d00
- accepted_wave_2_roadmap_tree: 9ae5438410d1528614cb887cff5caebb699b708d
- accepted_wave_2_roadmap_verdict: A0_B0_C0_D0

## Frozen C0 Reframe, Accepted C1/C2, And Retained I/E

The prior six-document C0/C1/C2 worksite-root subject was independently accepted
at the exact historical hashes recorded above. Two later independent Stage 1
source reviews returned `HOLD`: the C0 post-validation wording could be read as
an unselected expected-inode CAS guarantee, and the source does not yet enforce
one unique Program/GraphFunction/implementation-owner Product installation.
The Executive selected this bounded C0 design reframe. C1 and C2 remain accepted
and byte-immutable. The C0 candidate is frozen at SHA-256
`7cd8a5a905cdb02c8431b06224df5aa46cfc8f759a7dc5c1fd4712e66c652240`
for independent review and is not yet accepted HOW.

The prior bounded `goal_reprice` continues to select only the corresponding
canonical-root C0/C1/C2 I/E as `realization_refactor` over the same exact 19
existing paths. Its nine Stage 1 source paths remain frozen on `HOLD`; no source
repair is active, and Stage 2 is blocked. Authored worksite state resolves beneath
the already-admitted `WorkspaceAuthorityBasis.canonicalRoot`, not the immutable
`WorkspaceBinding.roots.productRoot`. Product and requirements remain fixed.
Artifact acceptance, package publication, model/live use, odd_glc mutation,
version, qualification, RC, tap, release, Git effects, and Product-goal closure
remain unselected.

The exact relation is:

```text
ExactPrefixWorkspaceEnvironment E
  -> full WorkspaceAuthorityBasis A + full WorkspaceBinding W
  -> unique Program-owner ProductInstall I_owner

C0 request carries full A + exact W identity/digest
C1 task carries full A + full W and propagates A plus W coordinates to every C0 request
C2 task carries A + W and re-observes C1/C3 worksite truth
C3 retains exact nested C1 tasks and refuses mixed A/W branches

subjects + territories + original observations + cwd/source coordinates
  resolve beneath A.canonicalRoot

W.roots.productRoot == I_owner.installedRoot
  and installed Product delta == 0
```

C0 basis admission and its physical-effect owner reconstruct `E` from the exact
held prefix. C1/C2 root `admitExecutionBasis` and every C1/C0 child-basis
admission do the same before their scope, dispatch, or effect. Each requires
canonical equality of full carried `A` and `W`, their workspace/authority-basis
join, the invocation grant, selected Program/GraphFunction owner, and unique
Product install. C2's retained authority-free occurrence does not reproject
the environment; its host/helper revalidate the already-admitted closed task
and physical joins. `canonicalRoot` or a path string alone confers no authority.
This is exact-prefix admission consistency over an already admitted basis, not
external actor or manifest-origin authentication.

C0 refuses every target or parent substitution visible at the owner's final
pre-effect validation, then performs one same-directory atomic namespace
publication or replacement. Atomic means no partial successor bytes become
visible; it is not expected-inode compare-and-swap. An ungoverned external or
same-user target or parent namespace mutation after final validation and before
the publication syscall is the explicit C0 atomic-window P3/nonclaim. It is
distinct from C2's retained coherent task/launch/derived-sibling substitution
P3.

Owner unity requires the Program/GraphFunction publication and selected
implementation binding to resolve through one unique admitted Product install
at `W.roots.productRoot`. Their GraphFunction and implementation publication
digests are separate coordinates and need not be equal. C2's exact installed
helper remains beneath `W.roots.toolchainRoot` and retains its helper/package/
locus joins; it is not rebased beneath `I_owner.installedRoot`.

Every authored target must be confined beneath `A.canonicalRoot` after lexical
and no-symlink physical resolution and must not equal or descend beneath
Product, toolchain, event-log, runtime-state, projection, or archive roots. A
territory itself must not lie in one of those roots, and a broader safe
territory never overrides the concrete-target check. Alias, symlink,
hard-link, crossed-root, tampered-basis, or mixed-basis input refuses before
dispatch/effect.

C2 preserves its previously accepted public `task.json` plus private
`launch.json` design, attempt identities, helper preflight, snapshot execution,
and replay semantics. Only source-root semantics change: protected `O1` values
are re-observed beneath `A.canonicalRoot`, copied to `attemptRoot/sandbox`, and
re-observed in the original worksite after Worker return. Commands execute
against that snapshot mirror. ABI C2, through the `worker_executes`
Worker/helper and ordinary ABG admission, alone executes declared commands and
probes and admits their mechanical observations. The ABI host and odd_glc do
not execute them or synthesize observations. The installed owner Product
remains byte-exact.

The bounded design Writer may amend only the C0 design and these three projection
paths, then freezes them and returns without source or Git effects:

1. `build_tenants/abiogenesis/typescript/design/T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN.md`
2. `specification/GOALS.md`
3. `.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md`
4. `build_tenants/abiogenesis/typescript/design/README.md`

The selected realization retains two dependency-ordered stages. Stage 1 retains
exactly nine production paths, but their current bytes are frozen on `HOLD` and
may not change during this design reframe:

1. `build_tenants/abiogenesis/typescript/code/src/product/worksite_effect.ts`
2. `build_tenants/abiogenesis/typescript/code/src/product/worksite_operations.ts`
3. `build_tenants/abiogenesis/typescript/code/src/product/worksite_construction.ts`
4. `build_tenants/abiogenesis/typescript/code/src/product/worksite_command_execution.ts`
5. `build_tenants/abiogenesis/typescript/code/src/product/worksite_branch_construction.ts`
6. `build_tenants/abiogenesis/typescript/code/src/abg/execution_basis.ts`
7. `build_tenants/abiogenesis/typescript/code/src/implementation/worksite_file_replace.ts`
8. `build_tenants/abiogenesis/typescript/code/src/implementation/worksite_command_execution.ts`
9. `build_tenants/abiogenesis/typescript/code/src/implementation/worksite_command_helper.ts`

After independent acceptance of the C0 candidate, an Executive may separately
activate the bounded owner-unity repair. That repair must freeze and pass an
independent Stage 1 source review. Only after that return has no selected
blocker may Stage 2 mutate the
eight support/evidence paths and refresh the two generated outputs:

1. `build_tenants/abiogenesis/typescript/test_env/support/root-installed-environment.mjs`
2. `build_tenants/abiogenesis/typescript/test_env/support/root-cli-environment.mjs`
3. `build_tenants/abiogenesis/typescript/test_env/tests/t287-worksite-file-replace-owner.test.mjs`
4. `build_tenants/abiogenesis/typescript/test_env/tests/t287-post-binding-worksite-write.test.mjs`
5. `build_tenants/abiogenesis/typescript/test_env/tests/t287-worksite-construction.test.mjs`
6. `build_tenants/abiogenesis/typescript/test_env/tests/t287-live-worksite-construction.test.mjs`
7. `build_tenants/abiogenesis/typescript/test_env/tests/t287-worksite-command-execution.test.mjs`
8. `build_tenants/abiogenesis/typescript/test_env/tests/t287-worksite-branch-construction.test.mjs`
9. `build_tenants/abiogenesis/typescript/product-toolchain-manifest.json`
10. `build_tenants/abiogenesis/typescript/contracts/capabilities/capability-definition-graph.json`

Stage 2 freezes one exact source/evidence/generated subject and stops for
independent review and the ordinary package-verification gate. Product,
requirements, Public, event kinds, GTL, C3 topology, `package.json`, indexes,
generator source, every unspecified path, odd/live/model use, artifact
acceptance, package publication, version, qualification, RC, tap, release, and
Git state are outside the grant.

## Retained C2 Two-Manifest Outcome (Historical)

The prior selection was bounded `W2-R3-C2-I/E` as `realization_refactor` under
accepted design SHA-256
`f4eafb82961beb6ebe47fa54eb91dc7deb470c8fb106609f7d3d12ced76d074b`.
Under one exact
`attemptRoot = archiveRoot/worksite-command-execution/<taskDigest>/<attemptDigest>`,
public `taskManifestPath` remains literal `task.json`. That file is the sole
authoritative Product-task carrier and contains exactly canonical
`WorksiteCommandExecutionTask` JSON followed by one LF. The unchanged public
12-key helper plan's task-manifest digest and byte length identify those exact
bytes; no private launch field enters Product task, result, observation, Public,
or replay.

The occurrence-bound private envelope occupies distinct literal sibling
`launch.json` and is retained only in the implementation-private launch plan.
The public plan derives its exact one-argument tool command and input identity
structurally from `dirname(taskManifestPath)/launch.json`; no path is recovered
by parsing `toolCommand`. The sole Worker command remains
`node <installed ABI helper> --task <attemptRoot/launch.json>`; `--task` is a
compatibility flag. The launch-envelope body excludes its own ref/digest and
launch byte coordinates and does not duplicate the Product task value. It binds
the exact task ref/digest and bare-task-manifest coordinates, occurrence,
attempt, archive/attempt/launch loci, installed helper, implementation, and
package.

The private envelope's authority-free `LeafExecutionOccurrence` is exact
I-JSON with only `cCallRef`, `runId`, `graphCallId`, `frameId`,
`programLocusRef`, `taskOrdinal`, `attempt`, and `executionAuthority`.
The four call/frame identities are strings with non-empty trimmed forms;
`programLocusRef` is exactly
`node://abiogenesis/worksite/command-execution/fp@5`; `taskOrdinal` is `null`
or a non-negative safe integer; `attempt` is a positive safe integer; and
`executionAuthority` is `null`. `occurrenceDigest` is
`sha256Canonical(occurrence)`. The retained attempt identity is exactly
`worksite-command-attempt://abiogenesis/<lower-case digest body>`, where the
digest is `sha256Canonical({cCallRef,runId,graphCallId,frameId,taskOrdinal,attempt})`,
and `attemptDigest = sha256Canonical({ attemptRef })`. Host and helper
independently recompute those identities; crossed occurrence/attempt state
refuses before protected observation or effect.

The host publishes and reobserves canonical single-link `task.json` first, then
publishes and reobserves `launch.json` last as the readiness marker. Partial
publication fails closed with no Worker dispatch, fallback, repair, or retry.
Host, helper, and completion independently derive the literal task, launch,
result, and sandbox siblings and require their applicable paths and filesystem
nodes to remain distinct, canonical, non-symlink, single-linked, and byte-
current. The helper validates both manifests and every task/occurrence/attempt/
helper/package/locus join before protected-O1 observation or any helper
execution effect. Result publication requires non-swallowed temporary cleanup
and final canonical `result.json` with `nlink === 1`; completion revalidates it.

Current Product construction, observation admission, completion, and
`exactExchange` are current-only. They refuse the immediately preceding public
12-key one-argument plan whose command names `--task <attemptRoot/task.json>`,
even when its tool-input identity and every enclosing current observation
ref/digest are recomputed. Historical validity remains solely under the exact
immutable predecessor Product/artifact.

This is bounded `realization_refactor`, not Product or requirement change, Public,
transport, C3 semantic change, odd_glc mutation, package-manifest change, live
rerun, version allocation, qualification, Product-goal closure, or release
selection. Exact design SHA-256
`f4eafb82961beb6ebe47fa54eb91dc7deb470c8fb106609f7d3d12ced76d074b`
is accepted after two independent `GO` verdicts with P0/P1/P2 all zero and
P3=1 as the explicit trusted-desktop nonclaim. That former five-path C2 I/E
selection is now historical. The current selection is the accepted
worksite-root design's exact 19-path staged I/E stated above.

Prior accepted amended C2 design SHA-256
`f7075c286d33e6b95ae5a3481e5900e45052f65f8d434f6ee09039d29d7a12fe`,
earlier accepted design SHA-256
`7f69c4c0c5e027f4025c0f3885042c65a668b4089eb139d278c0cdbc78e4f570`,
and relay-repaired installed coordinates remain predecessor evidence; they do
not prove the current worksite-root design. The fifth retained odd_glc basic-cli failure
over historical artifact SHA-256
`e0bd55d90b2a2005c2021ba75f127a6a0402a7675994a757dd350b76e16cd449`
showed the Worker move only `--artifact` and `--sandbox`, after which the
permissive helper executed both declared commands and wrote to those paths
before Product returned `transport_identity_mismatch` and the run stopped.

`W2-R3-C3-I/E` is completed and qualified on the exact accepted design and
frozen source/evidence coordinates recorded above. It preserves direct C1 and
nested C3 closure/replay and authorizes exactly the C1-root or C3-reducer
construction result as C2 source through an owner-derived basis. This amended
C2 design must conserve that accepted truth. Downstream Product goal closure
and T-287 closure remain open pending odd consumption.

## Lawful Re-entry

```text
goal_reprice
  -> design_reframe: W2-R3-C0
  -> realization_refactor: W2-R3-C0-I
  -> evidence: W2-R3-C0-E
  -> design_reframe: W2-R3-C1-D
  -> independent design review and Executive acceptance
  -> realization_refactor: W2-R3-C1-I
  -> evidence: W2-R3-C1-E
  -> design_reframe: W2-R3-C2-D
  -> Executive acceptance
  -> realization_refactor: W2-R3-C2-I
  -> evidence: W2-R3-C2-E
  -> goal_reprice: select proposed W2-R3-C3-D
  -> design_reframe: W2-R3-C3-D
  -> independent design review: GO P0/P1/P2 0
  -> Executive acceptance
  -> goal_reprice: select W2-R3-C3-I/E
  -> realization_refactor: W2-R3-C3-I
  -> installed evidence: W2-R3-C3-E
  -> independent source/evidence and artifact review: GO P0/P1/P2 0
  -> Executive acceptance: C3 I/E completed and qualified
  -> retained odd consumption failure at C2 helper locus
  -> goal_reprice: select amended W2-R3-C2-D
  -> design_reframe: W2-R3-C2-D
  -> independent design review: GO P0/P1/P2 0
  -> Executive acceptance
  -> goal_reprice: select bounded W2-R3-C2-I/E
  -> realization_refactor: W2-R3-C2-I
  -> frozen five-path source/evidence subject: unaccepted realization evidence
  -> design_reframe: W2-R3-C2-D distinct task.json and launch.json loci
  -> two independent design reviews: GO P0/P1/P2 0; P3 1 explicit nonclaim
  -> Executive acceptance: exact design f4eafb82961beb6ebe47fa54eb91dc7deb470c8fb106609f7d3d12ced76d074b
  -> goal_reprice: select only W2-R3-C2-I/E
  -> realization_refactor: exact five design-named paths
  -> independent worksite-root findings: productRoot is installedRoot, not authored worksite
  -> goal_reprice: select only C0/C1/C2 worksite-root design question
  -> design_reframe: exact three designs plus GOALS/T-287/design index
  -> freeze candidate bytes for independent review
  -> two independent design reviews: GO P0/P1/P2 0; P3 1 retained nonclaim
  -> Executive acceptance: exact C0/C1/C2 worksite-root design
  -> goal_reprice: select bounded canonical-root C0/C1/C2 I/E
  -> realization_refactor: exact nine production paths
  -> freeze and two independent source reviews: HOLD
  -> design_reframe: C0 atomic namespace semantics and explicit C0 P3
  -> freeze and independent design review
  -> bounded owner-unity repair and independent Stage 1 source review
  -> only then exact eight support/evidence paths plus two generated outputs
  -> freeze and independent source/evidence review plus package verification
```

The active relation is only `W2-R3-C0-C2-I-E-WORKSITE-ROOT` as bounded
`realization_refactor`. Its mutation territory is exactly the 19 staged paths
in this ticket. Prior C0/C1/C2/C3 I/E, including the five-path C2 subject,
remains predecessor evidence for its exact historical bytes. Downstream use,
artifact acceptance, and Product-goal closure remain unselected.

Intent, Product meaning, requirements, Public operation families, event-kind
census, feature membership, scenarios, and release subjects remain unchanged.
A need to change any of them stops the increment and returns to the owning
re-entry.

## Accepted C3 Aggregate

The admitted aggregate task is one immutable ordered branch DAG:

```text
exact-prefix environment carrying WorkspaceAuthorityBasis A
  + existing C3 task(WorkspaceBinding W, exact run.invoke grant,
      [{ branchRef, dependsOn, exact C1 task(A, W, ...) }, ...])
  -> Product validates unique refs, known dependencies, acyclicity,
       caller-stable topological readiness, one exact A/W/grant, and globally
       disjoint target refs/subjects/relative paths
  -> planning F_D(resultBearing: false) emits one exact branch vector bind output
  -> workflow.C(branch application)
  -> C.batch([workflow.C(existing C1 root)],
             { input: branchVector, output: branchOutputVector })
       in exact serial order
  -> each entered branch independently admits and closes its C1 result
  -> complete ABG-authenticated fan-out vector
  -> workflow.C(C3 reducer: sole resultBearing terminal locus)
  -> row-major flat existing WorksiteConstructionResult
  -> ordinary closure and fresh replay
```

Each nested C1 task carries full `A` alongside `W`; aggregate admission
requires every branch to equal the exact-prefix environment and every other
branch before planning or dispatch. Mixed-basis branches refuse as a whole.
The branch order is authority and must already be topological. ABI does not
sort, infer, schedule, or repair it. The dependency graph controls readiness
and allows replay to derive dependent suppression. It does not claim parallel
execution. A first failed branch preserves the successful admitted prefix,
records the stopping row, leaves the entire suffix unstarted, and prevents
fan-in and any C2 source basis.

The exact design-review subject is
`build_tenants/abiogenesis/typescript/design/T287_W2_R3_C3_BRANCH_CONSTRUCTION_AGGREGATE_DESIGN.md`.
Implementation/evidence is completed and independently qualified under the
exact accepted design. Product goal closure remains unselected until
downstream odd consumption evidence exists.

## Retained C0 Causal Atom

The stable authority is already admitted; the effect request precedes its
execution basis:

```text
WorkspaceAuthorityBasis A + WorkspaceBinding W
  + exact run.invoke grant
  + WorksiteFileReplaceRequest(full A, W identity/digest, subject, territory, replacement, O0)
  -> basis_admitted(B, O0 current)
  -> Program / GraphFunction / C locus
  -> exact implementation owner binding
```

The selected relation is:

```text
Product observes O0
  -> basis_admitted validates the pre-basis request and makes O0 current
  -> HoG passes one closed LeafExecutionAuthority to the selected leaf
  -> GrantUse binds actor + A + W + B + effect + subject + territory
       + selected handler + O0
  -> owner performs final target/parent-locus and O0 validation
  -> one same-directory atomic namespace publication/replacement, or refusal
  -> immutable owner receipt + successor observation O1
  -> exact-prefix C-call admission:
       c_call_evidenced
       -> c_call_result_admitted
  -> Event Calculus terminates current(O0) and initiates current(O1)
  -> fresh replay reconstructs O1 as current
```

`A`, `W`, and `B` remain unchanged. Subjects and territories resolve beneath
`A.canonicalRoot`; `W.roots.productRoot` remains the Program-owner installed
Product root and must have zero delta. A change to workspace root, authority,
installed Product set, resolved lock, or binding policy requires a different
binding and is outside this increment.

The physical file commit precedes ABG admission. If the owner commits the
replacement but the exact ABG batch fails, the operation returns
`unadmitted_physical_commit` residue. Runtime admits no `O1`; the worksite must
be freshly observed before another effect. The residue is never rewritten as
success or hidden by retry.

## Predecessor Record, Current Design Candidate, And Retained I/E

| Increment | Surface | Exit | State |
|---|---|---|---|
| `W2-R3-C0-D` | Reframed C0 design child | Full `A` plus exact W identity/digest in the request, full W in leaf authority, exact-prefix admission and owner re-observation, canonical-root subject/territory, protected-root refusal, zero Product delta, atomic namespace replacement, Event Calculus, replay, and falsifiers. | Prior accepted HOW had SHA-256 `427ced47826e95ef0262ca0d4797eaf144b07d14e30f8e4ace1de6b585864b84`. Current atomic-window candidate SHA-256 `7cd8a5a905cdb02c8431b06224df5aa46cfc8f759a7dc5c1fd4712e66c652240` is frozen pending independent review. |
| `W2-R3-C0-I` | `code/src/product/worksite_effect.ts`, `code/src/product/worksite_operations.ts`, the existing implementation contract/leaf port and HoG C-call lifecycle needed to deliver one closed `LeafExecutionAuthority`, and the minimum existing ABG C-call evidence/result, Event Calculus, replay, and export joins selected by design | One owner-scoped file replacement or typed refusal crosses the causal relation without a new controller, registry, binding, grant system, Public operation, or event kind. | Accepted predecessor. |
| `W2-R3-C0-E` | `build_tenants/abiogenesis/typescript/test_env/tests/t287-worksite-file-replace-owner.test.mjs` and `build_tenants/abiogenesis/typescript/test_env/tests/t287-post-binding-worksite-write.test.mjs` plus exact affected-suite evidence | Sunny path and mandatory falsifiers reproduce on one exact worktree subject. | Accepted; P0/P1/P2 = 0. |
| `W2-R3-C1-D` | `build_tenants/abiogenesis/typescript/design/T287_W2_R3_C1_LIVE_LLM_WORKSITE_CONSTRUCTION_DESIGN.md` | Existing construction topology plus full `A`/`W` task admission, byte-exact full-A propagation, and task-derived W coordinates in every C0 request; C3 inherits exact C1 tasks and mixed bases refuse before dispatch. | Accepted exact HOW at SHA-256 `61589c4428c6d26f7e8063d40c9d6e653897df8a5bbfaf8d0fb048ce8cce3c61`. |
| `W2-R3-C1-I/E` | Exact realization and proof surfaces named by the C1 design | One- and multi-target neutral fixtures plus one live worker prove candidate retention, C0-only mutation, partial-stop truth, terminal result, and fresh replay. | Retained bounded construction predecessor; no widening. |
| `W2-R3-C2-D` | `build_tenants/abiogenesis/typescript/design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md` | Retain accepted two-manifest/helper design while carrying full `A`/`W`, re-observing canonical-root worksite truth into the snapshot, and conserving the installed Product. | Accepted exact HOW at SHA-256 `8dbe22c8bcc2bcedc0e77a5f03a2fde1805d408e555e83bde342b9bb1d2a2301`. Prior two-manifest SHA-256 `f4eafb82961beb6ebe47fa54eb91dc7deb470c8fb106609f7d3d12ced76d074b` remains historical HOW for its exact predecessor. |
| `W2-R3-C0-C2-D-WORKSITE-ROOT` | C0 candidate, immutable accepted C1/C2, plus GOALS, T-287, and design README | Frozen decision-complete design-review subject with distinct C0 atomic-window and C2 task/launch P3 nonclaims. | Pending independent review; no acceptance effect. |
| `W2-R3-C0-C2-I-E-WORKSITE-ROOT` | Exact 19 existing paths named in the retained selection | Stage nine production paths, freeze and review; then stage eight support/evidence paths plus two generated outputs, freeze and review/package-verify. | Selection retained. Stage 1 source is frozen on `HOLD` pending owner-unity repair after design acceptance; Stage 2 is blocked; no realization/evidence or artifact is accepted. |
| prior `W2-R3-C2-I/E` | Exact accepted predecessor realization/evidence surfaces | Installed public C1-to-C2 source authority, commands/reports/predicates, closed observation, fresh replay, relay repair, and mandatory predecessor falsifiers. | Relay-repaired exact installed predecessor independently accepted; P0/P1/P2 = 0. Does not prove amended helper-locus HOW. |
| `W2-R3-C3-I/E` | `build_tenants/abiogenesis/typescript/design/T287_W2_R3_C3_BRANCH_CONSTRUCTION_AGGREGATE_DESIGN.md` plus the frozen 16-path source/evidence subject | One generic aggregate validates an ordered branch DAG and disjoint C1 target allocation, carries explicit outer `C.batch` input/output vectors, marks planning `F_D` non-result-bearing, serially traverses existing C1 children under an explicit published C1 root child-closure contract, preserves partial-stop truth, authenticates complete fan-in, emits one flat existing construction result solely from the C3 reducer, and publicly joins it into C2. | Completed and independently qualified under design SHA-256 `6da224353368e1ba9e2fc5651640ece743f6b528e98bbd9ccb58b8624a96e2a8`; final evidence test SHA-256 `5c04ad0bc0dc7b8caff32f5242d49040c7c2a5fd9acea88ce643265849a657c9`; Product goal remains open pending odd consumption. |

No event kind is added or extended. The existing `basis_admitted`,
`c_call_evidenced`, C-call failure/judgment, and `c_call_result_admitted` kinds
carry the retained C0/C1/C2 relations and accepted C3 composition without
a new event family. Existing owner-effect, `CapabilityGrant`, C-call, fan-out
completion, ABG append, Event Calculus, and replay surfaces are reused. The
current selection authorizes only the 19 staged realization/evidence paths. It
grants no Product, requirement, Public, event-kind, GTL, C3-topology,
`package.json`, index, generator-source, design, unspecified-path, artifact,
package-publication, version, odd_glc, live/model, qualification, RC, tap,
release, or Git effect.

## Evidence Gates

The selected staged C0/C1/C2 evidence subject must prove all of these on the
same exact environment:

1. `O0` is content-derived, bound to exact full `A` and `W`, admitted as current
   under exact `B`, and revalidated with the target and parent locus from the
   same exact prefix by the selected owner immediately before mutation. Every
   substitution visible at that validation refuses.
2. Wrong actor, workspace authority, binding, effect, mutation subject, write
   territory, handler, or `O0` refuses before mutation.
3. The successful owner operation changes a `package.json` beneath
   `A.canonicalRoot`, uses one same-directory atomic namespace replacement, and returns an immutable
   receipt and content-derived `O1`; `O0 != O1`, while `A`, `W`, and `B` remain
   equal and the installed Product payload has zero delta. Atomic means no
   partial successor visibility, not expected-inode CAS; evidence does not
   inject an adversarial namespace race after final validation.
4. The ABG append is an exact-prefix batch over the existing C-call spine. No
   partial admitted prefix is reported as causal success.
5. Event Calculus makes only `O1` current after admission; stale `O0` cannot
   authorize another effect.
6. Fresh replay reconstructs the same current `O1`, receipt, specialized
   evidence, and admitted C-call result without caller memory.
7. Post-commit ABG failure returns `unadmitted_physical_commit`, admits no
   runtime `O1`, and requires re-observation.
8. Tampered/crossed full authority basis, binding, owner install, source,
   directory/root escape, lexical/physical alias, symlink, hard link, protected
   root, receipt, event order, and replay identity refuse before their owning
   effect.

A green happy path alone is not evidence closure.

| Root proof | Mandatory result |
|---|---|
| `canonicalRoot != installedRoot` | C0/C1 author `package.json` beneath the canonical worksite; installed Program-owner payload remains byte-exact. |
| Exact-prefix basis | C1/C2 tasks carry full `A` plus full `W`; each C0 request carries full `A` plus W identity/digest and its leaf authority carries full `W`. All join canonically to `E`; ref-only equality, tamper, cross, or stale prefix refuses before dispatch/effect. |
| Protected topology | Alias, hard-link, symlink, escape, targets beneath protected roots, and territories themselves inside Product/toolchain/event/runtime/projection/archive roots refuse. |
| C2 snapshot | Original `O1` is re-observed beneath `A.canonicalRoot` before snapshot and after Worker return; commands resolve only in the snapshot mirror. |
| C3/replay | Same-basis branches and C2 closure replay exact `A`/`W`, worksite observations, snapshot, and result; mixed-basis branches refuse before the first branch. |

The following five-path plan is retained solely to preserve the accepted C2
two-manifest history. It is not current mutation territory and does not bound
the selected 19-path worksite-root realization.

The superseded bounded `W2-R3-C2-I/E` plan named exactly five paths under accepted
design SHA-256
`f4eafb82961beb6ebe47fa54eb91dc7deb470c8fb106609f7d3d12ced76d074b`:

1. `build_tenants/abiogenesis/typescript/code/src/product/worksite_command_execution.ts`
   for the unchanged 12-key public helper plan, exact bare `task.json`
   identity, structurally derived one-argument `launch.json` command/input
   identity, current-only validation, and prompt projection;
2. `build_tenants/abiogenesis/typescript/code/src/implementation/worksite_command_execution.ts`
   only to independently derive, publish, and reobserve canonical `task.json`
   first and private `launch.json` last before Worker entry, retain private
   launch coordinates, and revalidate both plus result single-link currentness
   at completion;
3. `build_tenants/abiogenesis/typescript/code/src/implementation/worksite_command_helper.ts`
   for exact argv, both-manifest/canonical-locus validation, helper-owned
   literal-sibling derivation, mandatory pre-effect absence checks, and
   non-swallowed result cleanup plus final single-link validation;
4. `build_tenants/abiogenesis/typescript/test_env/tests/t287-worksite-command-execution.test.mjs`;
   and
5. `build_tenants/abiogenesis/typescript/test_env/tests/t287-worksite-branch-construction.test.mjs`
   only to remove its stale artifact-path prompt expectation and retain the
   complete accepted public C3-to-C2 regression.

That evidence must prove the exact public helper-plan shape and bare
LF-terminated `task.json` path/digest/length relation; private launch fields must
remain absent from Product task/result/observation and replay. It must prove
task-first/launch-last create-only publication, `launch.json` as the final
readiness marker, fail-closed partial publication, and exactly one
`--task <attemptRoot/launch.json>` invocation. Missing/value-less, duplicate,
unknown, bare positional, extra, and legacy `--artifact`/`--sandbox` argv must
refuse.

Current-era admission evidence must construct the immediately preceding public
12-key plan with one `--task <attemptRoot/task.json>` argument, recompute its
tool-input digest/length and every enclosing current observation identity and
digest, and prove current Product construction, observation admission, and
`exactExchange` refuse the otherwise self-consistent hybrid. No current legacy
reader may grant it validity; historical truth remains only in the exact
immutable predecessor Product/artifact.

Direct installed-helper falsifiers must cover bare `task.json` passed as
`--task`; missing or stale task/launch files; swapped, copied, crossed, or
same-inode manifest pairs; task and launch hard links; wrong task-/attempt-
digest segment, filename, depth, alias, symlink, or escape; malformed or
noncanonical bytes; an extra occurrence key, non-null execution authority,
wrong C2 program locus, invalid occurrence scalar, crossed recomputed
occurrence/attempt identity; and pre-existing derived `result.json` or `sandbox`. Each
pre-effect case must prove zero protected-O1 read, declared-command sentinel,
snapshot/result materialization, probe launch, and task-module import. Result
publication must prove non-swallowed temporary cleanup and final
`result.json` `nlink === 1`; a post-helper result hard link must make completion
refuse.

Completion falsifiers must separately mutate `task.json`, `launch.json`, and
protected O1 after successful helper execution but before completion and reach
their exact refusal gates. Root-exposure evidence must force repeated-separator
and dot-segment equivalents through command executable/argv/environment and
HTTP-launch executable/argv/environment before spawn. `artifactPath` and
`sandboxRoot` remain absent from Worker prompt and tool command. Altered or
composite Bash remains a later `exactExchange` refusal; the host must not parse
or normalize it, invoke a fallback helper, or retry, and no earlier arbitrary
shell effect is claimed undone. Existing public C1/C3-to-C2, predicate,
Product-delta, timeout/termination, non-zero-exit observation, residue refusal,
`run_closed`, and fresh-replay laws remain exact.

No live model call is authorized. ABG transport and exports are read-only
regression inputs. `product-toolchain-manifest.json` and
`contracts/capabilities/capability-definition-graph.json` are selected only as
generated Stage 2 outputs; their generator source and indexes are immutable.
C3 topology and semantics remain unchanged; only the selected Product carrier
and regression-test paths may carry inherited full-A/W propagation and prove
that conservation. The private launch envelope changes no Product
task/result/observation contract. Prior accepted semantic/carrier and
relay-repaired subjects remain predecessor evidence. The earlier frozen
five-path subject is historical and does not prove the selected worksite-root
I/E.

Accepted `W2-R3-C3-E` proved on one installed subject:

1. the exact `parallel-js` five-branch/six-target DAG and `data-mapper-full`
   nine-branch/22-target/21-edge/four-level DAG construct without ABI domain
   names or a host loop;
2. duplicate/unknown/self/cyclic/non-ready dependencies and crossed W/grant or
   target allocation refuse before child preparation or Product effect;
3. HoG serially enters each exact nested C1 task through the C1 root's exact
   published graph-call child-closure contract, and every successful branch
   has an independently admitted C1 result and closure;
4. a middle-branch failure preserves the exact successful prefix, stopping
   row, unstarted suffix, transitive dependent suppression, independent suffix
   classification, and no reducer/flat result;
5. complete fan-out authentication precedes deterministic row-major reduction
   to six and 22 exact existing construction-result members;
6. Public result, one `run_closed`, projection authority, and fresh replay are
   canonically equal; and
7. C2 accepts the aggregate result only through a non-null owner-derived source
   basis naming the exact C3 reducer GraphFunction.

The same realized subject must also rerun direct C1 regression: its retained
run-scoped closure, result, projection, and fresh replay must remain exact after
the required C1 root GraphFunction and containing-publication digest change.

C3 implementation/evidence is completed and independently qualified. Product
goal closure remains unselected pending downstream odd consumption evidence.

## Explicit Residual

Broad R2/R3 audit questions 12-16 are closed only for the C0 atom. Questions
1-11 remain open for the larger typed-workspace/functional-traversal program.
Nothing in C0 answers pre-binding admission, declaration application, URI-type
admission, overlay hierarchy, installed-public closure, complete carried
bindings, definition-family coverage, continuation selection, read surfaces,
generic GraphFunction inventory, or the complete negative set.

The prior C1 child addresses only the post-binding live-`F_P` to C0
composition seam. The accepted C1 worksite-root design and retained I/E change
only its authority-basis/root propagation and none of those residual
dispositions.

The prior accepted C2 sibling addresses only post-construction execution
observation inside an ABI evidence snapshot. Accepted exact design
`f4eafb82961beb6ebe47fa54eb91dc7deb470c8fb106609f7d3d12ced76d074b`
reframes only its Worker/helper manifest and path-authority seam. The accepted
design retains that two-manifest relation and changes only worksite-root
semantics. The selected bounded C2 realization/evidence paths do not widen
C1/C3, interpret downstream success, or close the remaining typed-workspace
roadmap.

Fully recomputed, internally coherent same-user replacement of the complete
bare task manifest, launch envelope, and correspondingly derived sibling coordinates is an
explicit trusted-developer-desktop P3/nonclaim. The helper validates canonical
coherence and path confinement; it does not authenticate ABI publication origin
against that same-user substitution. No new ticket is opened. Altered or
composite Worker Bash remains subject to the later exact `exactExchange` gate,
which does not prevent or undo arbitrary shell effects that precede its
observation.

Separately, an ungoverned external or same-user target or parent namespace
mutation after C0's final pre-effect validation and before the publication
syscall is the explicit C0 atomic-window P3/nonclaim. C0 proves refusal for
substitutions visible at final validation and one atomic namespace replacement;
it does not claim expected-inode CAS or hostile-filesystem containment. This C0
P3 does not replace or widen the C2 task/launch P3 above.

The accepted and qualified C3 child addresses only ordered branch-DAG admission, serial
traversal of existing C1 children, exact partial-stop truth, authenticated
fan-in, and a flat C1-result contract. It does not add concurrency, scheduling,
retry, compensation, downstream interpretation, or broad lifecycle closure.

The following remain unselected or prohibited:

- `W2-R2`, the remainder of `W2-R3` outside the bounded worksite-root I/E,
  and broad `W2-R4`;
- after this frozen four-document design-reframe candidate, every realization
  or evidence mutation outside the exact 19 selected paths;
- Product, requirement, Public, event-kind, GTL, C3-topology, `package.json`,
  index, generator-source, further design, export, transport, and unspecified-path
  mutation;
- artifact construction/acceptance, package publication, qualification,
  version, RC, tap, and release effects;
- any odd_glc or live/model use;
- Product goal closure before installed downstream odd consumption evidence;
- pre-binding workspace/Product authority, Product verification/resolution/
  installation, workspace create/open/bind, Catalog/View admission, node-type
  or overlay application, URI typing, and hierarchical overlay composition;
- a complete graph lifecycle, full odd_glc/data-mapper traversal, S1/P0,
  S2-S4, E00, qualification, RC, final tap, and release;
- `5.0.0-dev.288` allocation or burn.

Selecting this `A5-F10` repair in the Wave 2 schedule neither reopens all of
Wave 1 nor closes its remaining integrated qualification.

## Downstream Reacquisition Gate And odd_glc Boundary

No odd_glc or live/model use is authorized by this I/E selection. A future
accepted artifact could be considered only through a later Executive
selection; this ticket does not pre-authorize that work.

Only after the selected realization/evidence subject and one exact installed
artifact are independently accepted may a later Executive select this
downstream reacquisition gate:

1. rerun the unchanged `basic-cli` subject first; and
2. only after its complete admitted result and fresh replay pass, run the
   frozen `js-tenant-test` subject.

Both invocations must project full `A` and `W` from the exact-prefix
environment and admit their exact join before C1/C2 dispatch. Authored targets,
including `package.json`, resolve beneath `A.canonicalRoot`, while
`A.canonicalRoot != W.roots.productRoot == I_owner.installedRoot`. The complete
installed Product tree must be path-, topology-, and byte-exact before and
after each invocation. ABI C2, through its `worker_executes` Worker/helper and
ordinary ABG admission, is the sole executor of declared commands/probes and
the sole admission path for their mechanical observations. Neither the ABI
host nor odd_glc executes those commands/probes or synthesizes observations.
A fixture root, odd-specific shim, scenario-specific ABI branch, host
execution, or synthesized observation refuses the gate. Historical
`basic-cli` evidence earns no `1/7` scenario credit; the first possible credit
begins with this unchanged reacquisition run.

After fresh C2 replay, odd_glc owns only its types, overlays, topology,
instructions, policies, interpretation of admitted observations, Reviewer
return, and Executive disposition. Its result cannot qualify ABIogenesis,
allocate an ABI version, or become an ABI release dependency.

## Governing Order

1. `specification/GOALS.md`
2. `specification/INTENT.md`
3. `specification/PRODUCT.md`
4. applicable `specification/requirements/`
5. accepted design indexed by
   `build_tenants/abiogenesis/typescript/design/README.md`
6. `build_tenants/abiogenesis/typescript/design/ABI5_REALIZATION_CONSTITUTION.md`
7. this ticket

The current design-review subject is the frozen C0 candidate plus the exact
accepted C1/C2 set named at the top of this ticket. The retained `goal_reprice`
selects only its bounded staged I/E as `realization_refactor`, but Stage 1 source
is on `HOLD` and Stage 2 is blocked. The accepted two-manifest C2 design at
SHA-256
`f4eafb82961beb6ebe47fa54eb91dc7deb470c8fb106609f7d3d12ced76d074b`
is retained predecessor HOW except where accepted C2 worksite-root semantics
supersede it.
Prior accepted amended design SHA-256
`f7075c286d33e6b95ae5a3481e5900e45052f65f8d434f6ee09039d29d7a12fe`,
earlier accepted C2 design, relay-repaired installed coordinates, and the frozen
five-path source/evidence subject remain predecessor evidence.

The accepted and qualified C3 realization remains governed by
`build_tenants/abiogenesis/typescript/design/T287_W2_R3_C3_BRANCH_CONSTRUCTION_AGGREGATE_DESIGN.md`
at SHA-256 `6da224353368e1ba9e2fc5651640ece743f6b528e98bbd9ccb58b8624a96e2a8`.
The C1 and C0 topology remains bounded predecessor structure. C1 worksite-root
and authority-basis propagation remains accepted HOW; the C0 candidate changes
only the atomic-window claim pending review. C3 inherits the amended closed C1
task without a separate semantic change.
The broad
`build_tenants/abiogenesis/typescript/design/T287_W2_ODD_GLC_TYPED_WORKSPACE_ADMISSION_DESIGN.md`
remains proposed except for the explicitly extracted C0 child.

## Retained Historical Evidence

- Wave 1 is accepted functional substrate; integrated candidate qualification
  remains open.
- The accepted Wave 2 roadmap is commit `3ab1ee6892bb22fc60206d38edbe8b970cca1d00`,
  tree `9ae5438410d1528614cb887cff5caebb699b708d`; its `A0/B0/C0/D0`
  verdict admitted the roadmap and force rank, not the current implementation.
- Accepted S1 design commit `701f6c018257d271465860ecb097b44381d614d0`
  and carrier-amendment commit `9bb230efaa5a1db06c7932a1204a5d477ead5e0f`
  remain predecessor HOW. S1 realization remains stopped on P0 and is not part
  of C0.
- `v5.0.0-dev.287` is historically burned. The 2026-08-23 census found
  `5.0.0-dev.288` unburned. C0 implementation does not allocate it; allocation
  requires a fresh remote census and separate authority.

## Prior Accepted Design Review Record

Both independent reviews of the frozen six-document design subject used this
read-only frame and returned `GO`, P0/P1/P2 all zero, with one retained P3
trusted-desktop nonclaim:

```text
Role: independent Reviewer; read-only
Product/requirements: fixed ABIogenesis 5.0; zero delta required
Selection: W2-R3-C0-C2-D-WORKSITE-ROOT design_reframe only
Subjects: exact C0/C1/C2 design bytes plus GOALS, T-287, and design README
Authority: full WorkspaceAuthorityBasis A + full WorkspaceBinding W authenticated against the exact-prefix environment; canonicalRoot/path text alone grants nothing
Worksite: subject, territory, original observation, cwd/source coordinate under A.canonicalRoot
Product owner: W.roots.productRoot == unique Program-owner ProductInstall.installedRoot; installed payload byte-exact
Protected roots: targets beneath Product/toolchain/event/runtime-state/projection/archive roots and territories themselves inside those roots refuse, including aliases/symlinks/hard links; every target is checked independently
Propagation: C1 copies full A and exact W identity/digest into every C0 request while its child authority retains full W; C2 carries full A/W and re-observes canonical worksite before snapshot and after Worker; C3 same-basis inheritance unchanged and mixed bases refuse before dispatch
C2 conservation: accepted public task.json/private launch.json design retained except source-root semantics
Proof matrix: canonicalRoot != installedRoot, authored package.json, zero Product delta, tamper/cross/alias/symlink/protected-root refusals, C2 snapshot, C3 and fresh replay
Unselected: all I/E, code/tests/builds/model/live/manifests/package/artifact/odd/version/qualification/release
Return: severity-ranked findings and verdict to Executive; no acceptance or mutation effect
```

## Current I/E Review Frames

The exact nine-path Stage 1 source subject is frozen after two independent
reviews returned `HOLD`. The C0 atomic-window ambiguity is now addressed only in
the frozen design candidate; the source still awaits a separately activated
owner-unity repair and re-review. No Stage 1 source byte may change during this
design reframe, and Stage 2 may not begin.

If separately activated after design acceptance, owner-unity repair, and Stage
1 source `GO`, Stage 2 source/evidence review reacquires those accepted subjects,
the exact eight support/evidence paths, and two generated outputs. It
requires counterexamples for each meaningful authority, root, alias,
observation, replay, and conservation branch; verifies generated outputs
against selected source without changing generator source; then runs the
ordinary package-verification gate. It performs no repair, artifact acceptance,
package publication, downstream odd/live/model use, versioning, release, or Git
effect.

### Retained Historical Review Frames (Non-Authorizing)

Earlier C0 implementation reviews stated:

```text
Product: fixed ABIogenesis 5.0
Selection: W2-R3-C0-I; evidence W2-R3-C0-E
Claim: one owner-scoped file replacement/refusal from current O0 to replayed O1
Stable authority: W and B unchanged
Runtime truth: specialized evidence plus existing c_call_result_admitted
Failure seam: physical commit may yield unadmitted_physical_commit residue
Unselected: W2-R2, rest of R3/R4, full odd_glc, S1/P0, version, E00, release
```

Earlier C1 design reviews stated:

```text
Product: fixed ABIogenesis 5.0
Current gate: W2-R3-C0-I/E
Review subject: W2-R3-C1-D exact design bytes
Claim: one caller-authored prompt -> one admitted F_P candidate -> admitted F_D vector -> exact-input vector child -> ordered C0 children -> admitted reduction and replay
Raw boundary: raw WorksiteConstructionWorkerResult -> deterministic Product-wrapped WorksiteCandidateBundle
Pure child: 2/0/1/1 leaf-row census; abg.failure_contract with exact legacy-row agreement
Mutation authority: C0 only; worker chooses bytes only
Public boundary: existing run.invoke#invoke and project.read only
Downstream return: ABI C2 Worker/helper executes declared commands/probes and ABG admits mechanical observations; after replay odd_glc only interprets admitted observations, Reviewer returns, and Executive may issue a separate corrective invocation
Excluded: ABI prompt/validation/review/iteration engine, worker tools, new Public/event/controller, run.invoke#start, odd_glc semantics, version, qualification, release
Return: independent findings and triage to the Executive; no edits
```

The accepted C3 implementation/evidence qualification is bound by:

```text
Product: fixed ABIogenesis 5.0
Accepted relation: W2-R3-C3-I/E under accepted W2-R3-C3-D
Subject: exact bounded realized paths plus installed evidence under design SHA-256 6da224353368e1ba9e2fc5651640ece743f6b528e98bbd9ccb58b8624a96e2a8
Claim: one admitted ordered branch DAG -> serial workflow.C(C1) batch -> complete authenticated vector -> flat existing WorksiteConstructionResult
Readiness: unique known acyclic dependsOn; caller order already topological; exact W/grant; globally disjoint targets
Partial truth: successful C1 prefix retained; one stopping row; suffix unstarted; dependents derivably suppressed; no fan-in
Mutation authority: existing C1 -> C0 only
Public boundary: existing run.invoke#invoke and project.read only
C2 boundary: exact C3 reducer source GF plus existing construction-result contract
C1 closure boundary: retained direct run closure plus exact published graph-call child closure for nested C3 use; direct C1 regression and nested C3 proof required
Pre-I/E gate: exact relay-repaired C2 artifact/manifest/Product/publication independently accepted; GO P0/P1/P2 all zero
Excluded: concurrency, scheduler, host loop, new Public/event/controller, odd semantics, C2 helper-locus amendment, version, Product-goal closure, release
Disposition: independently qualified; Product goal remains open pending odd consumption
```

Earlier reviews of the former selected C2 implementation/evidence stated:

```text
Product: fixed ABIogenesis 5.0
Historical selection: W2-R3-C2-I/E realization_refactor only
Design authority: accepted exact SHA-256 f4eafb82961beb6ebe47fa54eb91dc7deb470c8fb106609f7d3d12ced76d074b; two independent GO verdicts P0/P1/P2 0; P3 1 explicit trusted-desktop nonclaim
Subject: exact five design-named source/evidence paths; earlier frozen bytes superseded pending conformance
Claim: public task.json remains the sole exact LF-terminated Product-task carrier; private sibling launch.json binds occurrence/attempt/helper/package/locus and is the sole Worker --task subject
Public boundary: unchanged 12-key helperPlan; taskManifest path/digest/length bind task.json; tool command/input identity structurally derive launch.json; no private launch field enters Product observation or replay
Occurrence: exact eight-key authority-free I-JSON; programLocusRef node://abiogenesis/worksite/command-execution/fp@5; executionAuthority null; host/helper independently recompute occurrenceDigest, attemptRef from sha256Canonical({cCallRef,runId,graphCallId,frameId,taskOrdinal,attempt}), and attemptDigest
Cross-era: current construction/admission/exactExchange refuse a fully rehashed immediately preceding 12-key --task task.json plan; historical validity exists only under the exact immutable predecessor Product/artifact
Publication: host writes task.json first and launch.json last as readiness; partial publication fails closed without dispatch or retry
Pre-effect gate: helper independently derives and validates distinct canonical single-link task/launch nodes, exact task and envelope bytes/joins, and absent result/sandbox before protected O1 or execution effects
Completion: independently revalidate both manifests, protected O1, sandbox, and canonical single-link result.json; never swallow successful publication cleanup failure
Retained source boundary: owner-derived exact C1-root or accepted C3-reducer construction result
Retained failure: fifth basic-cli run over historical artifact SHA-256 e0bd55d90b2a2005c2021ba75f127a6a0402a7675994a757dd350b76e16cd449 performed helper effects before transport_identity_mismatch/run_stopped
Historical realization status: exact five-path I/E was current; no artifact selected
Falsifiers: task/launch swap, copy, cross, same inode, hard link, wrong digest/name/depth/alias/symlink/escape, partial publication, pre-existing result/sandbox, post-helper task/launch/O1 drift, result hard link/cleanup, all command and HTTP root carriers, exact argv/exchange, and retained public closure/timeout/non-zero/residue laws
Forbidden: new public fields, embedded duplicate task authority, toolCommand parsing, Worker prompt artifact/sandbox paths, normalization, fallback, retry, Product/requirement/Public/transport/C3 semantic change, mutation outside the exact five paths, packaging, artifact, qualification, version, release, or odd/live/model use
Nonclaim: fully recomputed coherent same-user task/launch/derived-sibling substitution is P3 and not pre-effect authenticated; altered/composite Bash remains a later exactExchange refusal with no shell-confinement claim
Historical status: C2 I/E was selected; artifact/package/qualification/odd/live/version/release were unselected; no Product-goal closure
Return: exact source/evidence findings and triage to the Executive; no Reviewer edits
```

Progress reports name the exact subject, last reached causal boundary,
evidence coordinates, remaining counterexamples, and first refusing owner.
