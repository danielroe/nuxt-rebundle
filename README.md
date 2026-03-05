# Nuxt Rebundle

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions][github-actions-src]][github-actions-href]
[![Codecov][codecov-src]][codecov-href]

> Bundler optimisations for [Nuxt](https://nuxt.com)

- [✨ &nbsp;Changelog](https://github.com/danielroe/nuxt-rebundle/blob/main/CHANGELOG.md)
<!-- - [▶️ &nbsp;Online playground](https://stackblitz.com/github/danielroe/nuxt-rebundle/tree/main/playground) -->

> [!WARNING]  
> This module is a work-in-progress laboratory for exploring bundler optimisations in Nuxt.

## Features

- ⚡️ automatically splits out `useAsyncData` fetcher functions into async chunks (for use with static site generation)

## Installation

Install and add `nuxt-rebundle` to your `nuxt.config`.

```bash
npx nuxi@latest module add nuxt-rebundle
```

```js
export default defineNuxtConfig({
  modules: ['nuxt-rebundle'],
})
```

## 💻 Development

- Clone this repository
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `pnpm install`
- Stub module with `pnpm dev:prepare`
- Run `pnpm dev` to start [playground](./playground) in development mode

## License

Made with ❤️

Published under the [MIT License](./LICENCE).

<!-- Badges -->

[npm-version-src]: https://npmx.dev/api/registry/badge/version/nuxt-rebundle
[npm-version-href]: https://npmx.dev/package/nuxt-rebundle
[npm-downloads-src]: https://npmx.dev/api/registry/badge/downloads/nuxt-rebundle
[npm-downloads-href]: https://npm.chart.dev/nuxt-rebundle
[github-actions-src]: https://img.shields.io/github/actions/workflow/status/danielroe/nuxt-rebundle/ci.yml?branch=main
[github-actions-href]: https://github.com/danielroe/nuxt-rebundle/actions?query=workflow%3Aci
[codecov-src]: https://img.shields.io/codecov/c/gh/danielroe/nuxt-rebundle/main?style=flat-square
[codecov-href]: https://codecov.io/gh/danielroe/nuxt-rebundle
