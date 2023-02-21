# Contributing

## Table of contents

- [Contributing](#contributing)
  - [Table of contents](#table-of-contents)
  - [Setting Up the Environment](#setting-up-the-environment)
  - [Submitting a Pull Request (PR)](#submitting-a-pull-request-pr)
  - [Code Style Guidelines](#code-style-guidelines)

## Setting Up the Environment

1. Install Deno following the [official documentation][deno-install] if not
   installed.
2. Run `deno cache --reload --lock=deno.lock src/main.ts` to cache dependencies.
3. Install Velociraptor following the [official documentation][vr-install] if
   not installed.
4. Optionally setup your editor/IDE following the
   [official documentation][deno-env].

To view all available scripts:

```bash
vr
```

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
- Commit your changes.
  ```bash
  git commit -m "feat: add new feature"
  ```
- Push your changes to GitHUb:
  ```bash
  git push origin feature-branch
  ```
- Create your PR on GitHub pointing to `gh-contribution-mate:main`.

## Code Style Guidelines

We follow Deno formatting and linting. You can automatically apply formatting
rules with [deno fmt][deno-fmt], and lint with [deno lint][deno-lint]. We
encourage you to [setup your IDE/Editor][deno-env] to automatically apply
formatting.

[deno-install]: https://deno.land/manual@v1.29.1/getting_started/installation
[deno-env]: https://deno.land/manual@v1.29.1/getting_started/setup_your_environment
[github-prs]: https://github.com/trunklabs/gh-contribution-mate/pulls
[deno-fmt]: https://deno.land/manual@v1.29.1/tools/formatter
[deno-lint]: https://deno.land/manual@v1.29.1/tools/linter
[conventional-commits]: https://www.conventionalcommits.org/en/v1.0.0/
[commitlint]: https://github.com/conventional-changelog/commitlint
[commitlint-config-conventional]: https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional
[vr-install]: https://velociraptor.run/docs/installation/
