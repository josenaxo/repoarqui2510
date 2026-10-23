import test from 'node:test'
import assert from 'node:assert/strict'
import { verificarSalud } from '../src/application/verificarSalud.js'

test('responde ok si el repositorio está disponible', async () => {
  const resultado = await verificarSalud({ ping: async () => true })
  assert.equal(resultado.estado, 'ok')
  assert.equal(resultado.baseDatos, true)
})

test('responde degradado sin depender de AWS', async () => {
  const resultado = await verificarSalud({ ping: async () => false })
  assert.equal(resultado.estado, 'degradado')
  assert.equal(resultado.baseDatos, false)
})
