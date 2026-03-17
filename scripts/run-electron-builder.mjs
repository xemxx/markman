import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const electronBuilderCli = require.resolve('electron-builder/out/cli/cli.js')

const env = {
  ...process.env,
  ELECTRON_BUILDER_BINARIES_MIRROR:
    process.env.ELECTRON_BUILDER_BINARIES_MIRROR
    || 'https://github.com/electron-userland/electron-builder-binaries/releases/download/',
  npm_config_electron_mirror: '',
}

const result = spawnSync(process.execPath, [electronBuilderCli, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env,
})

if (result.error) {
  throw result.error
}

process.exit(result.status ?? 1)
