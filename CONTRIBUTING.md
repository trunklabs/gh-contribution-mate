# Contributing

## Table of contents

- [Setting Up the Environment](#setting-up-the-environment)
- [Submitting a Pull Request](#submitting-a-pull-request--pr-)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)

## Setting Up the Environment

1. Install Deno following the [official documentation][deno-install] if not
   installed.
2. Run `deno cache --reload --lock=deno.lock src/main.ts` to cache dependencies.
3. Optionally setup your editor/IDE following the
   [official documentation][deno-env]. If you don't setup automatic formatting,
   please run `deno fmt` before committing your changes.

## Submitting a Pull Request (PR)

Before you submit your Pull Request (PR) consider the following guidelines:

- Search [GitHub][github-prs] for an open or closed PR that relates to your
  submission. You don't want to duplicate effort.
- Fork repository and make your changes in a new git branch:
  ```bash
  git checkout -b feature-branch main
  ```
- Make sure your changes are following the
  [code style guidelines](#code-style-guidelines).
- Commit your changes following our
  [commit message guidelines](#commit-message-guidelines).
- Push your changes to GitHUb:
  ```bash
  git push origin feature-branch
  ```
- Create your PR on GitHub pointing to `gh-contribution-mate:main`.

## Code Style Guidelines

We follow Deno formatting and linting. You can automatically apply formatting
rules with [deno fmt][deno-fmt], and lint with [deno lint][deno-lint].

## Commit Message Guidelines

We are following [Conventional Commits][conventional-commits] convention to
format commit messages.

Following types available:

- feat: A new feature
- fix: A bug fix
- docs: Documentation only changes
- style: Changes that do not affect the meaning of the code (white-space,
  formatting, missing semi-colons, etc)
- refactor: A code change that neither fixes a bug nor adds a feature
- perf: A code change that improves performance
- test: Adding missing tests
- chore: Changes to the build process or auxiliary tools and libraries such as
  documentation generation

[deno-install]: https://deno.land/manual@v1.29.1/getting_started/installation
[deno-env]: https://deno.land/manual@v1.29.1/getting_started/setup_your_environment
[github-prs]: https://github.com/trunklabs/gh-contribution-mate/pulls
[deno-fmt]: https://deno.land/manual@v1.29.1/tools/formatter
[deno-lint]: https://deno.land/manual@v1.29.1/tools/linter
[conventional-commits]: https://www.conventionalcommits.org/en/v1.0.0/
