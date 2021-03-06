# 🧵 Loom

> An opinionated orchestrator of web development tools

[Unicorn](https://vault.shopify.io/projects/14357) | [Project Brief](https://docs.google.com/document/d/11C4POvYkPk6xKG-HsAH3dP-Yx-W4atxXW5cCv9BzO5s/edit#) | [Technical Design Doc](https://docs.google.com/document/d/1pYIpE4vLtVcqsYKr4w50F1EmEl7fZdVL40v_5C5ZFJw/edit#)

**🚧 Currently under active development 🚧**

Loom (previously sewing-kit-next) is a front-end toolchain that aims to facilitate common front-end tasks that are shared across various front-end projects. This repository is home to the next generation of loom related packages, whereas the previous generation lives in [Shopify/sewing-kit](https://github.com/shopify/sewing-kit).

### ✨ Features

- 🎉 Make the remaining 20% possible using the Plugin APIs
- 📦 1st class support for building packages
- 🛠️ Support for Multi-project repositories
- 🧰 Organizational scale and shared knowledge through preconfigured plugins

## 💻 Installation

To get started, add the Loom CLI package to your app's `devDependencies`:

```sh
yarn add @shopify/loom-cli --dev
```

Depending on your project's needs, you'll want to install additional plugins as needed.

## 👩🏻‍💻 Usage

Please see the following directories for usage instructions:

- [`@shopify/loom-cli`](./packages/cli) provides the commands you'll use to interact with loom.
- [`@shopify/loom/config`](./packages/core/src/config) provides the configuration interface you'll use to configure loom and associated development tools.
- [`@shopify/loom/plugins`](./packages/core/src/plugins) is the starting point for loom plugin development.

## 📝 Documentation

- Not sure why this project exists? Checkout the [Project Brief](https://docs.google.com/document/d/11C4POvYkPk6xKG-HsAH3dP-Yx-W4atxXW5cCv9BzO5s/edit#).
- Curious about the implementation? Here's our [Architecture docs](./documentation/architecture.md).
- Running a release? Give the [release and deploy](./documentation/contributing/release-and-deploy.md) docs a read.

## 🙌🏽 Contribution docs

- [Running a release](./documentation/contributing/release-and-deploy.md)
- [Creating a new package](./documentation/contributing/creating-a-new-package.md)
