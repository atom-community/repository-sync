import { join } from "path"
import fs from "fs-extra"
const { copy } = fs

export async function copyTemplate(repos, cloneFolder, templatesFolder) {
  await Promise.all(repos.map((repo) => copy(templatesFolder, join(cloneFolder, repo), { recursive: true, overwrite: false })))
}
