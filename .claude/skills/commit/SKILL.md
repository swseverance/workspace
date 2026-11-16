---
name: commit
description: Commit every change in the repo with a meaningful commit message, moving off develop or main to a new branch first. Use when the user runs /commit.
argument-hint: [notes for the commit message or branch name]
disable-model-invocation: true
---

# Commit all changes

Notes from the user, if any: `$ARGUMENTS`

Running this command is the user's go-ahead to create a branch if needed and commit. Don't ask for confirmation along the way. Don't push, and don't open a pull request.

## 1. Look at the changes

Run `git status --short`, `git diff` and `git diff --cached` to see everything that is staged, unstaged or untracked, and read the diffs so the message describes what actually changed. Read untracked files too; they don't appear in `git diff`.

If there is nothing to commit, say so and stop.

If a change looks like it holds a secret (a token, key or password, a `.secret.*` file), stop and tell the user rather than committing it.

## 2. Move off develop and main

Check the current branch with `git branch --show-current`.

- On `develop` or `main`: create and switch to a new branch with `git checkout -b <name>`. The changes come along. Never commit directly on `develop` or `main`.
- On any other branch: stay there.

Name the new branch after the changes, in the form the repo already uses: `<type>/<short-kebab-description>`, where the type is one of `feat`, `fix`, `docs`, `chore`, `ci`, `css`, `refactor` or `test`. For example `fix/tcpl-format-button-loading`. If the name is taken, pick another.

## 3. Commit

Stage everything with `git add -A`, then commit.

Write the message in the style of `git log --oneline -10`:

- A subject line in the imperative, capitalised, with no trailing full stop and no `type:` prefix, about 70 characters at most. For example "Keep the Format button's width while it is loading".
- Say what the change does and why, not which files it touched.
- If the commit covers several unrelated changes, give it a subject that sums them up and a body with one bullet per change.
- Take the user's notes into account.
- Don't add a `Co-Authored-By` trailer.

The pre-commit hook runs gitleaks and lint-staged. If it fails, fix what it reports and commit again; don't bypass it with `--no-verify`. If gitleaks reports a secret, stop and tell the user.

## 4. Report

Tell the user the branch (and that it is new, if it is), the commit hash and the subject line. Confirm with `git status --short` that the working tree is clean, and mention anything left behind.
