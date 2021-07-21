import { join } from "path"
import * as git from "./lib/git.mjs"
import { copyTemplate, removePath } from "./lib/files.mjs"

const org = "atom-community"
const username = "aminya"
const email = "aminyahyaabadi74@gmail.com"

const cloneFolder = join(process.cwd(), org)
const templatesFolder = join(process.cwd(), "templates")

async function main() {
  await git.config(username, email)

  const repos = await git.clone(org, cloneFolder)

  await copyTemplate(repos, cloneFolder, templatesFolder)

  const removePaths = [".github/workflows/bump_deps.yml"]

  await Promise.all(removePaths.map((pth) => removePath(repos, cloneFolder, pth)))
}
main()
