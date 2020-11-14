import * as github from '@actions/github'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as io from '@actions/io'
import * as path from 'path'
import run from '../index'

const originalContext = {...github.context}
const originalGitHubWorkspace = process.env['GITHUB_WORKSPACE']
const gitHubWorkspace = path.resolve('/checkout-tests/workspace')

type InputsMock = {
  [name: string]: string
}

let inputs: InputsMock = {}
let execSpy: jest.SpyInstance

beforeAll(() => {
  execSpy = jest.spyOn(exec, 'exec').mockImplementation(jest.fn())
  jest.spyOn(io, 'cp').mockImplementation(jest.fn())

  jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
    return inputs[name]
  })

  jest.spyOn(github.context, 'repo', 'get').mockImplementation(() => {
    return {
      owner: 'enriikke',
      repo: 'enriikke.github.io',
    }
  })

  github.context.ref = 'refs/heads/some-ref'
  github.context.sha = '1234567890123456789012345678901234567890'

  process.env['GITHUB_WORKSPACE'] = gitHubWorkspace
})

afterAll(() => {
  delete process.env['GITHUB_WORKSPACE']
  if (originalGitHubWorkspace) {
    process.env['GITHUB_WORKSPACE'] = originalGitHubWorkspace
  }

  github.context.ref = originalContext.ref
  github.context.sha = originalContext.sha

  jest.restoreAllMocks()
})

beforeEach(() => {
  jest.resetModules()
  inputs = {
    'access-token': 'SECRET',
    'skip-publish': 'true',
  }
})

describe('Gatsby Publish action', () => {
  it('returns an error when no access token is given', async () => {
    inputs['access-token'] = ''
    const setFailedSpy = jest.spyOn(core, 'setFailed')

    await run()

    expect(setFailedSpy).toBeCalledWith(
      'No personal access token found. Please provide one by setting the `access-token` input for this action.',
    )
  })

  it('skips if deploy branch is the same as the current git head and the repo is the same', async () => {
    inputs['deploy-branch'] = 'some-ref'
    github.context.ref = 'refs/heads/some-ref'

    await expect(run()).resolves.not.toThrowError()
  })

  it('builds if deploy branch is the same as the current git head but the repo is not the same', async () => {
    inputs['gatsby-args'] = ''
    inputs['deploy-branch'] = 'some-ref'
    inputs['deploy-repo'] = 'deploy-repo'
    github.context.ref = 'refs/heads/some-ref'

    await run()

    expect(execSpy).toBeCalledWith('yarn run build', [], {cwd: '.'})
  })

  it('calls gatsby build without args', async () => {
    inputs['gatsby-args'] = ''

    await run()

    expect(execSpy).toBeCalledWith('yarn run build', [], {cwd: '.'})
  })

  it('calls gatsby build with args', async () => {
    inputs['gatsby-args'] = '--prefix-paths --no-uglify'

    await run()

    expect(execSpy).toBeCalledWith('yarn run build', ['--', '--prefix-paths', '--no-uglify'], {cwd: '.'})
  })

  it('calls gatsby build with working-dir', async () => {
    inputs['gatsby-args'] = ''
    inputs['working-dir'] = '../gatsby-gh-pages-action'

    await run()

    expect(execSpy).toBeCalledWith('yarn run build', [], {cwd: '../gatsby-gh-pages-action'})
  })

  it('calls gatsby build with working-dir and args', async () => {
    inputs['gatsby-args'] = '--prefix-paths --no-uglify'
    inputs['working-dir'] = '../gatsby-gh-pages-action'

    await run()

    expect(execSpy).toBeCalledWith('yarn run build', ['--', '--prefix-paths', '--no-uglify'], {
      cwd: '../gatsby-gh-pages-action',
    })
  })

  it('calls gatsby build with wrong working-dir', async () => {
    inputs['gatsby-args'] = ''
    inputs['working-dir'] = './__tests__'

    await run()

    expect(execSpy).toBeCalledWith('npm run build', [], {cwd: './__tests__'})
  })
})
