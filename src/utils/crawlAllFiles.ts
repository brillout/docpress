export { crawlAllFiles }

import path from 'path'
import { promises as fsp } from 'fs'
import { toPosixPath } from './filesystemPathHandling'

// Adapted from https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search/45130990#45130990
async function crawlAllFiles(dir: string): Promise<string[]> {
  const dirFiles = await fsp.readdir(dir, { withFileTypes: true })
  const allFiles = await Promise.all(
    dirFiles.map((file) => {
      const filePath = path.resolve(dir, file.name)
      return file.isDirectory() ? crawlAllFiles(filePath) : filePath
    })
  )
  return allFiles.flat().map(toPosixPath)
}
