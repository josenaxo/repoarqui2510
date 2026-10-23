import { execFileSync } from 'node:child_process'

function probe(label, command, args = ['--version'], required = true) {
  try {
    const value = execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
    console.log(`OK  ${label}: ${value.split('\n')[0]}`)
    return true
  } catch {
    console.log(`${required ? 'ERR' : 'WARN'} ${label}: no disponible`)
    return !required
  }
}

const major = Number(process.versions.node.split('.')[0])
console.log(`${major === 22 ? 'OK ' : 'WARN'} Node.js: v${process.versions.node} (el ramo exige 22.x)`)
let coreOk = false
try {
  const npmCli = process.env.npm_execpath
  if (!npmCli) throw new Error('npm_execpath no definido')
  const npmVersion = execFileSync(process.execPath, [npmCli, '--version'], { encoding: 'utf8' }).trim()
  console.log(`OK  npm: ${npmVersion}`)
  coreOk = true
} catch {
  console.log('ERR npm: no disponible')
}
probe('Docker', 'docker', ['--version'], false)
probe('AWS CLI', 'aws', ['--version'], false)

console.log('\nComandos recomendados:')
console.log('  npm run dev        # interfaz con cuentas demo, sin base de datos')
console.log('  npm run local:up   # PostgreSQL + DynamoDB, requiere Docker')
console.log('  npm run dev:full   # frontend + backend')
console.log('  npm run verify:unit2')

if (!coreOk) process.exitCode = 1
