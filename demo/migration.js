import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

main()

function main() {
  console.log('Migrated:')

  const todoManually = []
  getFiles().forEach((file) => {
    const suffix = '.page.server.mdx'
    if (file.endsWith(suffix)) {
      const fileMoved = file.replace(suffix, '/+Page.mdx')
      const fileAbs = addCwd(file)
      const fileMovedAbs = addCwd(fileMoved)
      console.log('-', file)
      console.log('+', fileMoved)
      fs.mkdirSync(path.dirname(fileMovedAbs), { recursive: true })
      fs.renameSync(fileAbs, fileMovedAbs)
      return
    }

    if (file.includes('.page.')) {
      todoManually.push(file)
    }
  })
  if (todoManually.length) {
    console.log(
      [
        // prettier-ignore
        '',
        'To-Do migrate manually:',
        ...todoManually.map((f) => `  ${f}`)
      ].join('\n')
    )
  }
}

function getFiles() {
  try {
    const stdout = execSync('git ls-files', { encoding: 'utf-8' })
    const files = stdout.split('\n').filter(Boolean)
    return files
  } catch (error) {
    console.error(`Error executing git ls-files: ${error}`)
    return []
  }
}

function addCwd(file) {
  const cwd = process.cwd()
  const fileAbs = path.join(cwd, file)
  return fileAbs
}
