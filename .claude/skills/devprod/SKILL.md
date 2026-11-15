---
name: devprod
description: Ship the current work to develop and then release it to production - /dev followed by /prod. Use when the user runs /devprod.
argument-hint: [notes for the commit or PR]
disable-model-invocation: true
---

# Ship the current work to develop, then to production

Notes from the user, if any: `$ARGUMENTS`

Running this command is the user's go-ahead for every step of both. Don't ask for confirmation along the way.

1. Do everything in `.claude/skills/dev/SKILL.md`, passing along the notes above.
2. If that ended with the PR merged into `develop`, do everything in `.claude/skills/prod/SKILL.md`.

If the first part stops for any reason (nothing to ship, a CI failure that can't be fixed), stop there; do not release. Give one report at the end covering both parts.
