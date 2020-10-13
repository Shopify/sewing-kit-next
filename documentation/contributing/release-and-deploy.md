# Creating Releases

## New versions

To release a new version, do the following:

1. Ensure you have the latest changes:

```
git checkout main && git pull
```

2. Create a new branch for the release:

```
git checkout -b new-release
```

3. Version the packages associated with the relase

```
yarn run version-bump
```

Follow the prompts to choose a version for each package.

**Note:** The packages adhere to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

4. Push your changes and open a PR titled "Publish release"

```
git push origin new-release --follow-tags
dev open pr
```

5. Get your PR reviewed, approved, and merged

6. After merging your release open the [Shipit stack](https://shipit.shopify.io/shopify/sewing-kit-next/production) and click "Deploy" on the previous merged "Publish release" PR.

## Next versions

To release a "next" release for a specific feature branch, do the following:

1. Ensure you have the latest changes on your feature branch:

```
git checkout my-feature && git pull
```

2. Override the `deploy.override` value of `shipit.yml` to the following:

```yaml
override:
  - yarn run lerna publish from-package --dist-tag next --yes
```

3. Version the packages associated with the relase

```
yarn run version-bump
```

Follow the prompts to choose a version for each package.

**Note:** The packages adhere to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

4. Push your changes and open a PR titled "Publish next release"

```
git push origin my-feature --follow-tags
```

5. Create a new [Shipit stack](https://shipit.shopify.io/shopify/sewing-kit-next/production) for `Shopify/sewing-kit-next` and click "Deploy" on the previous "Publish next release" commit.
