# GitHub Contribution Mate (gh-contribution-mate)

[![release](https://github.com/trunklabs/gh-contribution-mate/actions/workflows/release.yml/badge.svg)](https://github.com/trunklabs/gh-contribution-mate/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

`gh-contribution-mate` is a GitHub CLI extension that allows developers to
synchronize their local or non-github repository commits to GitHub. It is a
robust tool designed for developers who want to showcase their contributions
graphically in stats and on the contribution chart, irrespective of where the
commits were originally made.

Developed using 🦕 [Deno](https://deno.com/runtime) with TypeScript and compiled
to executables. The tool maintains the confidentiality of the original commits.
It only syncs the timestamp and original commit hash as the commit message,
creating empty commits to prevent code leakage.

## 🔒 Usage At Work

`gh-contribution-mate` is completely safe to use at work. However, the tool
should be used responsibly. In the case of potential company policy conflicts,
it is advised to consult with your company or IT department before use.

## 🚀 Getting Started

### Installation

Make sure you have the necessary dependencies installed on your system:

1. [GitHub CLI](https://cli.github.com/) - You'll need to be logged in. You can
   check if you're logged in by using `gh auth status`
2. [Git](https://git-scm.com/downloads)

Once the dependencies are in place, you can install the extension as follows:

```shell
gh extension install trunklabs/gh-contribution-mate
```

### Alias Setting

For a more streamlined experience, you can set an alias for
`gh contribution-mate` like `gh cm`. This is how you can do it:

```shell
gh alias set cm 'contribution-mate'
```

Now, you can use `gh cm` in place of `gh contribution-mate`.

For detailed usage and examples, refer to our [documentation](docs/USAGE.md).

## 🛡️ Credentials

`gh-contribution-mate` uses your existing GitHub credentials for operations.
Remember, any auto-generated credentials will have the same access rights as the
user they are tied to.

## 🤝 Contributing

Contributions are more than welcome! Please see our
[contributor's guide](CONTRIBUTING.md) for details.
