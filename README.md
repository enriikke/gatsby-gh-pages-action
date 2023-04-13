# Gatsby Publish

GitHub Action to build and deploy your Gatsby site to GitHub Pages ❤️🎩

## Usage

This GitHub Action will run `gatsby build` at the root of your repository and
deploy it to GitHub Pages for you! Here's a basic workflow example:

```yml
name: Gatsby Publish

on:
  push:
    branches:
      - dev

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: enriikke/gatsby-gh-pages-action@v2
        with:
          access-token: ${{ secrets.ACCESS_TOKEN }}
```

> **NOTE:** In order to support `npm` and `yarn`, this Action relies on having a
> `build` script defined in your `package.json` file. Gatsby automatically defines
> this script whenever you start a new project via `gatsby new`, which in turn calls
> `gatsby build`.

### Knobs & Handles

This Action is fairly simple but it does provide you with a couple of
configuration options:

- **access-token**: A [GitHub Personal Access Token][github-access-token] with
  the `repo` scope. This is **required** to push the site to your repo after
  Gatsby finish building it. You should store this as a [secret][github-repo-secret]
  in your repository. Provided as an [input][github-action-input].

- **deploy-branch**: The branch expected by GitHub to have the static files
  needed for your site. For org and user pages it should always be `master`.
  This is where the output of `gatsby build` will be pushed to. Provided as an
  [input][github-action-input].
  Defaults to `master`.

- **deploy-repo**: The repository expected by GitHub to have the static files
  needed for your site.
  Provided as an [input][github-action-input].
  Defaults to the same repository that runs this action.

- **gatsby-args**: Additional arguments that get passed to `gatsby build`. See the
  [Gatsby documentation][gatsby-build-docs] for a list of allowed options.
  Provided as an [input][github-action-input].
  Defaults to nothing.

- **skip-publish**: Builds your Gatsby site but skips publishing by setting it to `true`,
  effectively performing a test of the build process using the live configuration.
  Provided as an [input][github-action-input].
  Defaults to **false**

- **working-dir**: The directory where your Gatsby source files are at. `gatsby build`
  will run from this directory.
  Provided as an [input][github-action-input].
  Defaults to the project's root.
  
- **git-config-name**: Provide a custom name that is used to author the git commit, which
  is pushed to the deploy branch.
  Provided as an [input][github-action-input].
  Defaults to the GitHub username of the action actor.

- **git-config-email**: Provide a custom email that is used to author the git commit, which
  is pushed to the deploy branch.
  Provided as an [input][github-action-input].
  Defaults to `{actor}@users.noreply.github.com`, where `{actor}` is the GitHub username 
  of the action actor.

- **pkg-manager**: Provide a custom package manager other than npm.
  Provided as an [input][github-action-input].
  
### Org or User Pages

Create a repository with the format `<YOUR/ORG USERNAME>.github.io`, push your
Gatsby source code to a branch other than `master` and add this GitHub Action to
your workflow! 🚀😃

### Repository Pages

Repo pages give you the option to push your static site to either `master` or
`gh-pages` branches. They also work a little different because the URL includes
a trailing path with the repository name, like
`https://username.github.io/reponame/`. You need to tell Gatsby what the path
prefix is via `gatsby-config.js`:

```js
module.exports = {
  pathPrefix: "/reponame",
}
```

Additionally, you need to tell the `gatsby build` command to use it by passing
the `--prefix-paths` as an argument. Here's an example workflow for that:

```yml
name: Gatsby Publish

on:
  push:
    branches:
      - dev

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: enriikke/gatsby-gh-pages-action@v2
        with:
          access-token: ${{ secrets.ACCESS_TOKEN }}
          deploy-branch: gh-pages
          gatsby-args: --prefix-paths
```

Provides build validation on `pull request` if required:

```yml
name: Gatsby Publish

on:
  pull_request:
    branches:
      - dev

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: enriikke/gatsby-gh-pages-action@v2
        with:
          access-token: ${{ secrets.ACCESS_TOKEN }}
          deploy-branch: gh-pages
          gatsby-args: --prefix-paths
          skip-publish: true
```

### CNAME

You have a custom domain you would like to use? Fancy! 😎 This Action's got you
covered! Assuming you have already set up your DNS provider as defined in the
[GitHub Pages docs][github-pages-domain-docs], all we need next is a `CNAME`
file at the root of your project with the domain you would like to use. For
example:

```CNAME
imenrique.com
```

> Notice that it's **all capitals CNAME** 😊.

This is how GitHub keeps track of the domain you want to use. This action will
copy the file to the `public` directory generated by Gatsby before pushing your
site so that the domain is persisted between deploys.

### Assumptions

This Action assumes that your Gatsby code sits at the root of your repository
and `gatsby build` outputs to the `public` directory. As of this writing, Gatsby
doesn't provide a way to customize the build directory so this should be a safe
assumption.

Additionally, a `build` script on `package.json` is expected for this Action to
to work (as mentioned at the beginning). Ultimately, this is what calls `gatsby build`.

## That's It

Have fun building! ✨

[gatsby-build-docs]: https://www.gatsbyjs.org/docs/gatsby-cli/#build
[github-access-token]: https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token
[github-action-input]: https://docs.github.com/en/free-pro-team@latest/actions/creating-actions/metadata-syntax-for-github-actions#inputs
[github-pages-domain-docs]: https://docs.github.com/en/free-pro-team@latest/github/working-with-github-pages/configuring-a-custom-domain-for-your-github-pages-site
[github-repo-secret]: https://docs.github.com/en/free-pro-team@latest/actions/reference/encrypted-secrets#creating-encrypted-secrets
