# @defichain/salmon

Mono-repo for DeFi Blockchain price oracle service with e2e setup. Includes infrastructure, scripts and serverless
functions for the Price Oracle service.

> 🚧 Work in progress.

### Publishing

`"version": "0.0.0"` is used because publishing will be done automatically
by [GitHub releases](https://github.com/DeFiCh/salmon/releases) with connected workflows. On
release `types: [ published, prereleased ]`, GitHub Action will automatically build all packages in this repo and
publish it into npm.

* release are tagged as `@latest`
* prerelease are tagged as `@next` (please use this cautiously)

### IntelliJ IDEA

IntelliJ IDEA is the IDE of choice for writing and maintaining this library. IntelliJ's files are included for
convenience with basic toolchain setup but use of IntelliJ is totally optional.

### Security issues

If you discover a security vulnerability in
`@defichain/salmon`, [please see submit it privately](https://github.com/DeFiCh/.github/blob/main/SECURITY.md).

## License & Disclaimer

By using `@defichain/salmon` (this repo), you (the user) agree to be bound by [the terms of this license](LICENSE).

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FDeFiCh%2Fsalmon.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FDeFiCh%2Fsalmon?ref=badge_large)
