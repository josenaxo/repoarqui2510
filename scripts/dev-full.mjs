import { spawn } from 'node:child_process'

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const children = [
  spawn(npm, ['--prefix', 'backend', 'run', 'start:dev'], { stdio: 'inherit' }),
  spawn(npm, ['--prefix', 'frontend', 'run', 'dev'], { stdio: 'inherit' }),
]

let stopping = false
function stop(exitCode = 0) {
  if (stopping) return
  stopping = true
  for (const child of children) child.kill('SIGTERM')
  process.exitCode = exitCode
}

for (const child of children) {
  child.on('exit', (code) => {
    if (!stopping && code !== 0) stop(code ?? 1)
  })
}

process.on('SIGINT', () => stop(0))
process.on('SIGTERM', () => stop(0))
