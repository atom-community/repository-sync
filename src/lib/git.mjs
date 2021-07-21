import { Octokit } from "@octokit/core"
export const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
import { command } from "execa"
import fs from "fs-extra"
const { mkdir, readdir }  = fs

export async function clone(org, cloneFolder) {
  await mkdir(cloneFolder)

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

