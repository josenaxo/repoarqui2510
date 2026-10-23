import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const required = [
  'infra/shared/serverless.yml',
  'docker-compose.yml',
  'services/health/serverless.yml',
  'services/perfiles/serverless.yml',
  'services/habilidades/serverless.yml',
  'services/postulaciones/serverless.yml',
  'scripts/canario/deploy.ps1',
  'scripts/canario/rollback.ps1',
  'docs/arquitectura-unidades-i-ii.md',
]

const missing = required.filter((path) => !existsSync(resolve(root, path)))
if (missing.length) {
  console.error(`Faltan artefactos de Unidad I-II:\n- ${missing.join('\n- ')}`)
  process.exit(1)
}

const configuration = spawnSync(process.execPath, ['scripts/validate-config.mjs'], { cwd: root, stdio: 'inherit' })
if (configuration.error) throw configuration.error
if (configuration.status !== 0) process.exit(configuration.status ?? 1)

const tests = spawnSync(process.execPath, ['scripts/test-services.mjs'], { cwd: root, stdio: 'inherit' })
if (tests.error) throw tests.error
if (tests.status !== 0) process.exit(tests.status ?? 1)
console.log('\nOK: patrones, serverless, Docker, despliegue estándar y canario están representados y las pruebas pasan.')
