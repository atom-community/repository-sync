import fs from "fs-extra"
const { copy } = fs

export async function copyTemplate(repos, templatesFolder) {
  await Promise.all(repos.map((repo) => copy(templatesFolder, repo, { recursive: true, overwrite: false })))
}
