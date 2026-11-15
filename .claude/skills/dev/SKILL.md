---
name: dev
description: Open a pull request to develop for the current work and merge it when CI passes. Use when the user runs /dev.
argument-hint: [notes for the commit or PR]
disable-model-invocation: true
---

# Ship the current work to develop

Notes from the user, if any: `$ARGUMENTS`

Running this command is the user's go-ahead to commit, push, open the PR and merge it. Don't ask for confirmation along the way.

1. **Find the work.** Run `git status` and `git log origin/develop..HEAD --oneline`. If there are no uncommitted changes and no commits ahead of `origin/develop`, say there is nothing to ship and stop.
2. **Get on a branch.** If the current branch is `develop` or `main`, create a branch named for the change, in the style of the existing ones (`feat/…`, `fix/…`, `test/…`, `docs/…`).
3. **Commit** any uncommitted changes. Review the diff first, match the style of `git log --oneline -5`, and write a message that says why. Never commit secrets or gitignored local config.
4. **Push** the branch and open the PR with `gh pr create --base develop`. The base is always `develop`, never `main`. Give it a title like the recent merged PRs and a short body saying what changed and how it was checked.
5. **Wait for CI** with `gh pr checks <number> --watch`.
   - If a check fails, do not merge. Read the failing log (`gh run view <run id> --log-failed`), fix the cause, push, and wait again. If the failure isn't something this change caused or you can't fix it, stop and report it with the output.
6. **Merge** with `gh pr merge <number> --merge` (a merge commit, as in the repo's history; not squash or rebase).
7. **Tidy up.** Switch to `develop` and `git pull`.
8. **Report** the PR link, the merge commit, and anything that was not checked.
