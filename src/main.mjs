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

  await copyTemplate(repos, cloneFolder, templatesFolder)

  const removePaths = [".github/workflows/bump_deps.yml"]
  await Promise.all(removePaths.map((pth) => removePath(repos, cloneFolder, pth)))

  await git.commit("chore: sync with the repository template", cloneFolder, repos)
}
main()
