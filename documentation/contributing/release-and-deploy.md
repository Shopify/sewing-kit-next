# Creating Releases

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
