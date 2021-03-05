# Creating Releases

1. Ensure you have the latest changes:

```
git checkout main && git pull
```

2. Create a new branch for the release:

```
git checkout -b new-release
```

3. Version the packages associated with the release

```
yarn run version-bump
```

Follow the prompts to choose a version for each package.

This command will also lint all the CHANGELOGs to ensure their most recent releases are documented. If a package is changed and includes no source changes (due to a transitive dependency update by lerna), please note this in the changelog as well.

**Note:** The packages adhere to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

4. Push your changes and open a PR titled "Publish release"

```
git push origin new-release --follow-tags
dev open pr
```

5. Get your PR reviewed, approved, and merged

6. After merging your release open the [Shipit stack](https://shipit.shopify.io/shopify/sewing-kit-next/production) and click "Deploy" on the previous merged "Publish release" PR.

## Running a beta release for 🎩ing

**Step 1 - publish a beta(s):**

- In your branch run `yarn run version-bump`. Lerna will launch it's CLI to select a version for the changed packages. Select the Custom option and enter a version with an appended -beta.X (eg. 0.0.10-my-feature-beta.1)
- Push your branch to Github with the newly created tags using `git push origin <branch> --follow-tags`
- Create a temporary stack in ShipIt that points to your beta branch. Set the `Environment` to `beta` which tells ShipIt to run with the `shipit.beta.yml` config
- Hit the deploy button in Shipit to publish your beta to npm

**Step 2 - consume the beta:**

- Consume your package with `yarn add --dev @sewing-kit/{cli,core,<any-other-relevant-packages>}@0.0.10-my-feature-beta.1`
- Run through commands that exercise your feature

**Step 3 - delete your beta stack once you're done tophatting**
