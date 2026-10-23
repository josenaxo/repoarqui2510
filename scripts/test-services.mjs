import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
const services = ['health', 'perfiles', 'habilidades', 'postulaciones']

for (const service of services) {
  console.log(`\n== ${service} ==`)
  const directory = fileURLToPath(new URL(`../services/${service}/`, import.meta.url))
  const check = spawnSync(process.execPath, ['../../scripts/check-service.mjs', '.'], {
    cwd: directory,
    stdio: 'inherit',
  })
  if (check.error) throw check.error
  if (check.status !== 0) process.exit(check.status ?? 1)
  const result = spawnSync(process.execPath, ['--test'], {
    cwd: directory,
    stdio: 'inherit',
  })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}
