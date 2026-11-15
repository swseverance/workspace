---
name: prod
description: Release to production - open a pull request from develop to main and merge it when CI passes. Use when the user runs /prod.
disable-model-invocation: true
---

# Release develop to production

Running this command is the user's go-ahead to open the release PR and merge it. Don't ask for confirmation along the way.

1. **See what would ship.** Run `git fetch origin`, then `git log origin/main..origin/develop --oneline --merges`. If `develop` has nothing that `main` lacks, say so and stop.
   - Only what is already merged into `origin/develop` ships. If there are uncommitted changes or an unmerged branch locally, say that they are not part of this release, and carry on.
2. **Open the PR** with `gh pr create --base main --head develop --title "prod release"`. In the body, list the pull requests it carries. If a release PR from `develop` to `main` is already open, use that one.
3. **Wait for CI** with `gh pr checks <number> --watch`.
   - If a check fails, do not merge. Stop and report the failing output; a fix goes through a PR to `develop` first.
4. **Merge** with `gh pr merge <number> --merge`. It must be a merge commit, so `develop` and `main` keep a shared history. Never delete `develop`.
5. **Watch the deploy.** Merging pushes to `main`, which starts the Deploy workflow. Find the run with `gh run list --branch main --workflow Deploy --limit 1` and wait for it with `gh run watch <run id> --exit-status`.
6. **Check production** where the release changed something a visitor can see: load the affected page on the live site and confirm the change is there.
7. **Report** the PR link, the merge commit, what shipped, the deploy result, and anything that was not checked.
