import { copyFileSync, existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(scriptDir, '..')
const backendDir = resolve(rootDir, 'apps/backend')
const envExample = resolve(backendDir, '.env.example')
const envFile = resolve(backendDir, '.env')

if (!existsSync(envFile)) {
  copyFileSync(envExample, envFile)
  console.log('Created apps/backend/.env from .env.example')
} else {
  console.log('apps/backend/.env already exists')
}

const envContents = readFileSync(envFile, 'utf8')
const hasAppKey = /^APP_KEY=.+$/m.test(envContents)

if (!hasAppKey) {
  console.log('Generating APP_KEY for apps/backend/.env')

  const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
  const result = spawnSync(pnpmCommand, ['run', 'db:generate-key'], {
    cwd: backendDir,
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
} else {
  console.log('APP_KEY already present in apps/backend/.env')
}

console.log('Backend environment is ready.')
