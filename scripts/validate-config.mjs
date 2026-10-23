import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import YAML from 'yaml'

const files = [
  'docker-compose.yml',
  'infra/shared/serverless.yml',
  'services/health/serverless.yml',
  'services/perfiles/serverless.yml',
  'services/habilidades/serverless.yml',
  'services/postulaciones/serverless.yml',
]

for (const file of files) {
  const source = readFileSync(resolve(file), 'utf8')
    .replace(/!Ref\s+/g, '')
    .replace(/!GetAtt\s+/g, '')
    .replace(/!Sub\s+/g, '')
  const document = YAML.parseDocument(source)
  if (document.errors.length) throw new Error(`${file}: ${document.errors.map((error) => error.message).join('; ')}`)
  const value = document.toJS()
  if (!value || typeof value !== 'object') throw new Error(`${file}: documento vacío`)
  console.log(`OK YAML: ${file}`)
}
