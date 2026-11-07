# Workspace

An [Nx](https://nx.dev) monorepo containing Angular apps and shared libraries.

## Apps

| App                | Environment | URL                                                                                                                                        |
| ------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| ghreactions        | dev         | [ghreactions--ghreactionsdev.us-east4.hosted.app](https://ghreactions--ghreactionsdev.us-east4.hosted.app)                                 |
| ghreactions        | prod        | [ghreactions--ghreactionsprod.us-east4.hosted.app](https://ghreactions--ghreactionsprod.us-east4.hosted.app)                               |
| weight-tracker     | prod        | [weight-tracker--weight-tracker-2592f.us-east4.hosted.app](https://weight-tracker--weight-tracker-2592f.us-east4.hosted.app)               |
| chinese-flashcards | prod        | [chinese-flashcards--chineseflashcards-4aea7.us-east4.hosted.app](https://chinese-flashcards--chineseflashcards-4aea7.us-east4.hosted.app) |

## Generate a new app

Apps live directly under `apps/<name>` (e.g. `apps/weight-tracker`, `apps/chinese-flashcards`). Pass that path as the generator's `directory` so the new app lands in the same place, and include `--ssr` since existing apps are server-rendered:

```sh
npx nx g @nx/angular:application apps/<app-name> --ssr
```

## Generate a new library

Libraries live directly under `libs/<name>` (e.g. `libs/environment`). Pass that path as the `directory`:

```sh
npx nx g @nx/angular:library libs/<lib-name>
```

Both generators pick up this workspace's defaults from `nx.json` (`generators` section) — Angular apps/libs use SCSS styles and Vitest for unit tests, and apps skip e2e scaffolding.

## Run tasks

```sh
npx nx run <project-name>:<target>
```

Targets are either [inferred automatically](https://nx.dev/docs/concepts/inferred-tasks) or defined in each project's `project.json`.

## Keep TypeScript project references up to date

Nx keeps `tsconfig.json` project references in sync with the project graph. This runs automatically for tasks like `build`/`typecheck`, or manually via:

```sh
npx nx sync
```

To enforce this in CI:

```sh
npx nx sync:check
```
