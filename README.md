# repository-sync

A set of scripts to keep the repositories in sync

## How to run?

This will run the `./src/main.mjs` script

```
pnpm install
pnpm start
```

## Capabilities

- Clone all the repositories under a temp folder
- Sync the content under the `templates` folder with all the repositories
- Remove certain files from the repositories
- Commit and push the changes to the repositories
- Open/Close pull requests that meet certain requirements (used for closing old bot PRs).
