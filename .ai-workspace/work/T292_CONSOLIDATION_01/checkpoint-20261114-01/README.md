# Main checkpoint and worktree cleanup

Owner request: checkpoint everything into main and remove obsolete worktrees.
All old branch/checkout commits are already ancestors of main. Current RC13
proof source a2626fa54 and its worktree stay available for B31 diagnosis.

MAIN_OUTSTANDING.json lists the 39,225 previously untracked main files.
All are included in this local checkpoint. New files over 50 MiB use exact
Git LFS path rules; no existing history is rewritten and nothing is pushed.
Ignored dependency/build caches stay outside source control.

WORKTREES_BEFORE.json binds old HEADs, dirty changes and preserved archives.
Archives contain outstanding local files plus ignored non-cache evidence;
member manifests verify exact content. Two old generated postimages and their
patches are preserved as historical work, not applied to current RC13 outputs.
To restore an old checkout: git worktree add --detach NEW_DIRECTORY RECORDED_HEAD,
then extract its local-files.tar.gz and tracked-postimages.tar.gz there.
Git LFS objects are local and must accompany this repository for those files.

BASELINE_DEPENDENCY_CONTINUITY.json proves the old P5 dependency link was
replaced by an exact physical copy before the obsolete donor was removed.
External historical stores, current proof worktree, baseline, prepared routes
and RC11/RC12 installs are retained. This cleanup does not retry the stopped
suite or reset its elapsed six-hour campaign.

CAMPAIGN_STATUS.json and broad-04 preserve 68 completed files (530 passes,
14 skips) and file069's two F04-A failures. They are not a completed suite or
qualification. B31 triage, history, physical witnesses and local RC13 delivery
remain open. Removal and final conservation results follow in RESULT.json.
