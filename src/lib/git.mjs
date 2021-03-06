import { Octokit } from "@octokit/core"
import { createPullRequest } from "octokit-plugin-create-pull-request"
const MyOctokit = Octokit.plugin(createPullRequest)
export const octokit = new MyOctokit({ auth: process.env.GITHUB_TOKEN })
import simpleGit from "simple-git"

import { command } from "execa"
import { join } from "path"
import * as fs from "fs-extra"
const { mkdirp, pathExists } = fs
import { promises } from "fs"
const { readdir } = promises

export async function repos(org) {
  const data = (
    await octokit.request("GET /orgs/{org}/repos", {
      org,
      type: "public",
      per_page: 100,
    })
  ).data
  return data
}

export async function clone(org, cloneFolder, ignoreRepos = []) {
  await mkdirp(cloneFolder)
  const data = await repos(org)
  await Promise.all(
    data.map(async ({ clone_url, name, archived }) => {
      if (archived || ignoreRepos.includes(name)) {
        return
      }
      if (await pathExists(join(cloneFolder, name))) {
        await command("git pull", { cwd: join(cloneFolder, name) })
      } else {
        await command(`git clone --depth 1 --single-branch ${clone_url}`, { cwd: cloneFolder })
      }
    })
  )

  return readdir(cloneFolder)
}

export async function config(username, email) {
  await command(`git config --global user.name ${username}`)
  await command(`git config --global user.email ${email}`)
}

export async function commit(message, cloneFolder, repos) {
  await Promise.all(
    repos.map(async (repo) => {
      const repoFolder = join(cloneFolder, repo)
      const git = simpleGit(repoFolder)
      await command(`git add .`, { cwd: repoFolder })
      await git.commit(message)
    })
  )
}

export async function push(cloneFolder, repos) {
  await Promise.all(
    repos.map(async (repo) => {
      const repoFolder = join(cloneFolder, repo)
      const git = simpleGit(repoFolder)
      await git.push()
    })
  )
}

export async function closePullRequests(org, repos, branch) {
  await Promise.all(
    repos.map(async (repo) => {
      const prs = (
        await octokit.request("GET /repos/{owner}/{repo}/pulls", {
          owner: org,
          repo,
          state: "open",
          head: `${org}/${branch}`,
        })
      ).data.map((pr) => pr.number)

      await Promise.all(
        prs.map((pull_number) =>
          octokit
            .request("PATCH /repos/{owner}/{repo}/pulls/{pull_number}", {
              owner: org,
              repo: repo,
              pull_number,
              state: "closed",
            })
            .catch((e) => console.error(e))
        )
      )
    })
  )
}

export async function pullRequest(org, repos, files, branch, title, commit, body = "") {
  await Promise.all(
    repos.map((repo) =>
      octokit.createPullRequest({
        owner: org,
        repo,
        title,
        body,
        head: branch,
        changes: [
          {
            files,
            commit,
            emptyCommit: false,
          },
        ],
      })
    )
  )
}
