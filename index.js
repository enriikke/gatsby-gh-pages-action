const core = require("@actions/core")
const exec = require("@actions/exec")
const github = require("@actions/github")
const io = require("@actions/io")
const ioUtil = require("@actions/io/lib/io-util")

async function run() {
  try {
    // Skips publishing if required - used to test configuration with pull-requests/etc
    let skipPublish = core.getInput("skip-publish") || false;
    if (skipPublish === 'false') {
      skipPublish = false;
    }
    if (!!skipPublish) {
      console.log('skip-publish set to true.');
    }
    const accessToken = core.getInput("access-token");

    if (!accessToken && !skipPublish) {
      console.log('NOTICE: access-token is not set, will skip publish.');
      skipPublish = true;
    }

    let deployBranch = core.getInput("deploy-branch")
    if (!deployBranch) deployBranch = "gh-pages"

    if (github.context.ref === `refs/heads/${deployBranch}`) {
      console.log(`Triggered by branch used to deploy: ${github.context.ref}.`)
      console.log("Nothing to deploy.")
      return
    }

    const pkgManager = (await ioUtil.exists("./yarn.lock")) ? "yarn" : "npm"
    console.log(`Installing your site's dependencies using ${pkgManager}.`)
    await exec.exec(`${pkgManager} install`)
    console.log("Finished installing dependencies.")

    const gatsbyArgs = core.getInput("gatsby-args")
    console.log("Ready to build your Gatsby site!")
    console.log(`Building with: ${pkgManager} run build ${gatsbyArgs}`)
    await exec.exec(`${pkgManager} run build`, [gatsbyArgs])
    console.log("Finished building your site.")

    const cnameExists = await ioUtil.exists("./CNAME")
    if (cnameExists) {
      console.log("Copying CNAME over.")
      await io.cp("./CNAME", "./public/CNAME", { force: true })
      console.log("Finished copying CNAME.")
    }
       
    if (skipPublish) {
      console.log("Builing completed successfully - skipping publish"); 
      return;
    }
        
    const deployRepo = core.getInput("deploy-repo")
    const repo = `${github.context.repo.owner}/${deployRepo || github.context.repo.repo}`
    const repoURL = `https://${accessToken}@github.com/${repo}.git`
    console.log("Ready to deploy your new shiny site!")
    console.log(`Deploying to repo: ${repo} and branch: ${deployBranch}`)
    console.log(
      "You can configure the deploy branch by setting the `deploy-branch` input for this action."
    )
    await exec.exec(`git init`, [], { cwd: "./public" })
    await exec.exec(`git config user.name`, [github.context.actor], {
      cwd: "./public",
    })
    await exec.exec(
      `git config user.email`,
      [`${github.context.actor}@users.noreply.github.com`],
      { cwd: "./public" }
    )
    await exec.exec(`git add`, ["."], { cwd: "./public" })
    await exec.exec(
      `git commit`,
      ["-m", `deployed via Gatsby Publish Action 🎩 for ${github.context.sha}`],
      { cwd: "./public" }
    )
    await exec.exec(`git push`, ["-f", repoURL, `master:${deployBranch}`], {
      cwd: "./public",
    })
    console.log("Finished deploying your site.")

    console.log("Enjoy! ✨")
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
