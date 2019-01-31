# Gatsby Publish

GitHub Action to build and deploy your Gatsby site to GitHub Pages ❤️🎩

## Usage

This GitHub Action will run `gatsby build` at the root of your repository and
deploy it to GitHub Pages for you! Here's a basic workflow example:

```workflow
workflow "Gatsby to GitHub Pages" {
  on = "push"
  resolves = ["Publish"]
}

action "Publish" {
  uses = "enriikke/gatsby-gh-pages-action@master"
  secrets = ["ACCESS_TOKEN"]
}
```

It's recommended to use this Action combined with the [Filters Action](https://github.com/actions/bin/tree/c6471707d308175c57dfe91963406ef205837dbd/filter)
to specify only the branch(es) you want to trigger a build.

```workflow
workflow "Gatsby to GitHub Pages" {
  on = "push"
  resolves = ["Publish"]
}

action "On Master" {
  uses = "actions/bin/filter@master"
  args = "branch master"
}

action "Publish" {
  uses = "enriikke/gatsby-gh-pages-action@master"
  needs = ["On Master"]
  secrets = ["ACCESS_TOKEN"]
}
```

### Knobs & Handles

This Action is fairly simple but it does provide you with a couple of
configuration options:

- **DEPLOY_BRANCH**: The repository branch used for your GitHub Page and where
  the Gatsby build will be pushed. Defined as an [environment variable](https://developer.github.com/actions/creating-github-actions/accessing-the-runtime-environment/#environment-variables).
  Defaults to `gh-pages`.

- **ARGS**: Additional arguments that get passed to `gatsby build`. See the
  [Gatsby documentation](https://www.gatsbyjs.org/docs/gatsby-cli/#build) for a
  list of allowed options. Given as [workflow args](https://developer.github.com/actions/creating-github-actions/creating-a-docker-container/#cmd).
  Defaults to nothing.

### Org or User Pages

Create a repository with the format `<YOUR/ORG USERNAME>.github.io`, push your
Gatsby source code to the `master` branch,  and add this GitHub Action to your
workflow! 🚀😃

### Repository Pages

Repo pages work a little different because the URL includes a trailing path with
the repository name, like `https://username.github.io/reponame/`. You need to
tell Gatsby what the path prefix is via `gatsby-config.js`:

```js
module.exports = {
  pathPrefix: "/reponame",
}
```

Additionally, you need to tell the `gatsby build` command to use it by passing
the `--prefix-paths` as an argument. Here's an example workflow for that:

```workflow
workflow "Gatsby to GitHub Pages" {
  on = "push"
  resolves = ["Publish"]
}

action "Publish" {
  uses = "enriikke/gatsby-gh-pages-action@master"
  args = "--prefix-paths"
  secrets = ["ACCESS_TOKEN"]
}
```

🤩  Note that **NON** of this is necessary if you are using custom domains.🤩

## Requirements

A [GitHub Personal Access Token](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/)
with the `repo` scope is needed to run this Action. This is important! This is
**NOT** the same as the `GITHUB_TOKEN` that can be included as part of an Action.

Just as important is that this personal access token needs to be provided as a
[secret](https://developer.github.com/actions/creating-workflows/storing-secrets/)
with the name `ACCESS_TOKEN`, **NOT** as an environment variable. The reason
being that secrets get encrypted while environment variables do **NOT**.

Sorry for being so _negative_ just now ☝️. I just want to make sure nobody
accidentally exposes any sensitive information. Let's keep access tokens safe! 😉😇

### Assumptions

This Action assumes that your Gatsby code sits at the root of your repository
and `gatsby build` outputs to the `public` directory. As of this writing, Gatsby
doesn't provide a way to customize the build directory so this should be a safe
assumption.


## That's It

Have fun building! ❤

