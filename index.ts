import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as github from '@actions/github'
import * as io from '@actions/io'
import * as ioUtil from '@actions/io/lib/io-util'

const DEFAULT_DEPLOY_BRANCH = 'master'

async function run(): Promise<void> {
  try {
    const skipPublish = (core.getInput('skip-publish') || 'false').toUpperCase()

    const accessToken = core.getInput('access-token')
    if (!accessToken && skipPublish !== 'TRUE') {
      core.setFailed(
        'No personal access token found. Please provide one by setting the `access-token` input for this action, or disable publishing by setting `skip-publish`.',
      )
      return
    }

    let deployBranch = core.getInput('deploy-branch')
    if (!deployBranch) deployBranch = DEFAULT_DEPLOY_BRANCH

    const deployRepo = core.getInput('deploy-repo')
    const isSameRepo = !deployRepo || deployRepo === github.context.repo.repo

    if (isSameRepo && github.context.ref === `refs/heads/${deployBranch}`) {
      console.log(`Triggered by branch used to deploy: ${github.context.ref}.`)
      console.log('Nothing to deploy.')
      return
    }

    const workingDir = core.getInput('working-dir') || '.'
    const pkgManager = (await ioUtil.exists(`${workingDir}/yarn.lock`)) ? 'yarn' : 'npm'
    console.log(`Installing your site's dependencies using ${pkgManager}.`)
    await exec.exec(`${pkgManager} install`, [], {cwd: workingDir})
    console.log('Finished installing dependencies.')

    let gatsbyArgs = core.getInput('gatsby-args').split(/\s+/).filter(Boolean)
    if (gatsbyArgs.length > 0) {
      gatsbyArgs = ['--', ...gatsbyArgs]
    }

    console.log('Ready to build your Gatsby site!')
    console.log(`Building with: ${pkgManager} run build ${gatsbyArgs.join(' ')}`)
    await exec.exec(`${pkgManager} run build`, gatsbyArgs, {cwd: workingDir})
    console.log('Finished building your site.')

    const cnameExists = await ioUtil.exists(`${workingDir}/CNAME`)
    if (cnameExists) {
      console.log('Copying CNAME over.')
      await io.cp(`${workingDir}/CNAME`, `${workingDir}/public/CNAME`, {force: true})
      console.log('Finished copying CNAME.')
    }

    if (skipPublish === 'TRUE') {
      console.log('Building completed successfully - skipping publish')
      return
    }

    const repo = `${github.context.repo.owner}/${deployRepo || github.context.repo.repo}`
    const repoURL = `https://${accessToken}@github.com/${repo}.git`
    console.log('Ready to deploy your new shiny site!')
    console.log(`Deploying to repo: ${repo} and branch: ${deployBranch}`)
    console.log('You can configure the deploy branch by setting the `deploy-branch` input for this action.')

    await exec.exec(`git init`, [], {cwd: `${workingDir}/public`})

    const gitUserName = core.getInput('git-config-name') || github.context.actor
    const gitEmail = core.getInput('git-config-email') || `${github.context.actor}@users.noreply.github.com`

    await exec.exec(`git config user.name`, [gitUserName], {
      cwd: `${workingDir}/public`,
    })
    await exec.exec(`git config user.email`, [gitEmail], {
      cwd: `${workingDir}/public`,
    })

    await exec.exec(`git add`, ['.'], {cwd: `${workingDir}/public`})

    const commitMessageInput =
      core.getInput('commit-message') || `deployed via Gatsby Publish Action 🎩 for ${github.context.sha}`
    await exec.exec(`git commit`, ['-m', commitMessageInput], {
      cwd: `${workingDir}/public`,
    })

    await exec.exec(`git push`, ['-f', repoURL, `master:${deployBranch}`], {
      cwd: `${workingDir}/public`,
    })
    console.log('Finished deploying your site.')

    console.log('Enjoy! ✨')
  } catch (err) {
    core.setFailed((err as Error).message)
  }
}

// Don't auto-execute in the test environment
if (process.env['NODE_ENV'] !== 'test') {
  run()
}

export default run
