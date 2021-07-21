import { join } from "path"
import * as fs from "fs-extra"
const { copy, remove } = fs

export async function copyTemplate(repos, cloneFolder, templatesFolder) {
  await Promise.all(
    repos.map((repo) => copy(templatesFolder, join(cloneFolder, repo), { recursive: true, overwrite: false }))
  )
}

export async function removePath(repos, cloneFolder, removePath) {
  await Promise.all(repos.map((repo) => remove(join(cloneFolder, repo, removePath))))
}
