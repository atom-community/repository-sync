import { Octokit } from "@octokit/core"
import { createPullRequest } from "octokit-plugin-create-pull-request"
const MyOctokit = Octokit.plugin(createPullRequest)
export const octokit = new MyOctokit({ auth: process.env.GITHUB_TOKEN })

import { command } from "execa"
import { join } from "path"
import * as fs from "fs-extra"
const { mkdirp, pathExists } = fs
import { promises } from "fs"
const { readdir } = promises

export async function clone(org, cloneFolder) {
  await mkdirp(cloneFolder)

  const data = (
    await octokit.request("GET /orgs/{org}/repos", {
      org,
      type: "public",
    })
  ).data

  await Promise.all(
    data.map(async ({ git_url, name }) => {
      if (await pathExists(join(cloneFolder, name))) {
        await command("git pull", { cwd: join(cloneFolder, name) })
      } else {
        await command(`git clone --depth 1 --single-branch ${git_url}`, { cwd: cloneFolder })
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
  await Promise.all(repos.map((repo) => command(`git add . && git commit -m "${message}"`, { cwd: cloneFolder })))
}

export async function pullrequest(org, repos, branch, title, body = "") {
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
            commit: "automatic PR",
            emptyCommit: true,
          },
        ],
      })
    )
  )
}
