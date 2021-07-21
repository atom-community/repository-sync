import { join } from "path"
import * as git from "./lib/git.mjs"
import { copyTemplate, removePath } from "./lib/files.mjs"
import { mkdir, track } from "temp"
track()

const org = "atom-community"
const username = "aminya"
const email = "aminyahyaabadi74@gmail.com"

const cloneFolder = await mkdir(org)
const templatesFolder = join(process.cwd(), "templates")

async function main() {
  await git.config(username, email)

  const repos = await git.clone(org, cloneFolder)

  const removePaths = [".github/workflows/bump_deps.yml", ".github/renovate.json"]
  await Promise.all(removePaths.map((pth) => removePath(repos, cloneFolder, pth)))

  await copyTemplate(repos, cloneFolder, templatesFolder)

  await git.commit("chore: sync with the repository template", cloneFolder, repos)

  await git.push(cloneFolder, repos)
}
main()
