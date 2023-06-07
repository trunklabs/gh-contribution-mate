# GitHub Contribution Mate (gh-contribution-mate) - Usage Guide

Welcome to the usage guide for `gh-contribution-mate`. This CLI tool allows you
to easily synchronize your local or non-github repository commits to your GitHub
profile, ensuring your contribution stats and charts are accurate. This document
will guide you through the usage of the tool.

## Global Options

- `-h, --help` - Show help information.

  Usage:

  ```shell
  gh contribution-mate --help
  ```

- `-V, --version` - Show the version number for this program.

  Usage:

  ```shell
  gh contribution-mate --version
  ```

## Commands

### `add` command

The `add` command allows you to add one or more local repositories to be
monitored for synchronization.

- `<repositories...>` - List of one or more local repositories to add for
  syncing.

  Usage:

  ```shell
  gh contribution-mate add /path/to/repo1 /path/to/repo2
  ```

### `sync` command

The `sync` command will synchronize the commits from the added local
repositories to your GitHub profile.

Usage:

```shell
gh contribution-mate sync
```

These commands provide a simple way to keep your GitHub profile updated with
your local or non-github repository commits. If you have any issues, please
refer to the main [README](../README.md) or open a new issue on the GitHub
repository.
