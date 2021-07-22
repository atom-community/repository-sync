import { join } from "path"
import * as git from "./lib/git.mjs"
import { copyTemplate, removePath } from "./lib/files.mjs"
import { mkdir, track } from "temp"
track()

const org = "atom-community"
const username = "aminya"
const email = "aminyahyaabadi74@gmail.com"

const ignoreRepos = ["DefinitelyTyped"]

const cloneFolder = await mkdir(org)
const templatesFolder = join(process.cwd(), "templates")

async function syncTemplates() {
  await git.config(username, email)

  console.log("Cloning...")
  const repos = await git.clone(org, cloneFolder, ignoreRepos)

  console.log("Syncing template...")
  const removePaths = [".github/workflows/bump_deps.yml", ".github/renovate.json"]
  await Promise.all(removePaths.map((pth) => removePath(repos, cloneFolder, pth)))

  await copyTemplate(repos, cloneFolder, templatesFolder)

  await git.commit("chore: sync with the repository template", cloneFolder, repos)

  await git.push(cloneFolder, repos)
}
syncTemplates()

async function closePullRequests() {
  const repos = (await git.repos(org)).map((repo) => repo.name)

  console.log("Close bot pull requests...")
  await Promise.all([
    git.closePullRequests(org, repos, "Bump_dependencies"),
    git.closePullRequests(org, repos, "Bump_devdependencies"),
  ])
}
// closePullRequests()
