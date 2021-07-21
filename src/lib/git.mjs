import { Octokit } from "@octokit/core"
export const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
import { command } from "execa"
import fs from "fs-extra"
const { mkdirp, readdir }  = fs

export async function clone(org, cloneFolder) {
  await mkdirp(cloneFolder)

  const data = (
    await octokit.request("GET /orgs/{org}/repos", {
      org,
      type: "public",
    })
  ).data
  const gitURLs = data.map((repo) => repo.git_url)

  await Promise.all(gitURLs.map(repo => command(`git clone --depth 1 --single-branch ${repo}`, { cwd: cloneFolder })))

  return readdir(cloneFolder)
}

export async function config(username, email) {
  await command(`git config --global user.name ${username}`)
  await command(`git config --global user.email ${email}`)
}

export async function commit(message, cloneFolder, repos) {
  await Promise.all(repos.map((repo) => command(`git add . && git commit -m "${message}"`, { cwd: cloneFolder })))
}
