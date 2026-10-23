import test from 'node:test'
import assert from 'node:assert/strict'
import { crearServicioPerfiles } from '../src/application/servicioPerfiles.js'

function dobles() {
  const perfiles = new Map()
  const configs = new Map()
  const grupos = []
  return {
    grupos,
    repositorio: {
      async crear(perfil) {
        if (perfiles.has(perfil.id)) throw Object.assign(new Error('perfil duplicado'), { statusCode: 409 })
        perfiles.set(perfil.id, perfil); return perfil
      },
      async obtener(id) { return perfiles.get(id) ?? null },
      async guardar(perfil) { perfiles.set(perfil.id, perfil); return perfil },
      async obtenerConfig(id) { return configs.get(id) ?? null },
      async guardarConfig(config) { configs.set(config.colegioId, config); return config },
    },
    identidad: { async agregarAGrupo(id, grupo) { grupos.push({ id, grupo }) } },
  }
}

test('registra perfil y asigna el grupo de identidad', async () => {
  const d = dobles()
  const servicio = crearServicioPerfiles(d.repositorio, d.identidad)
  const perfil = await servicio.registrar({ id: 'u1', email: 'U@ceibbo.cl', rol: 'estudiante' })
  assert.equal(perfil.email, 'u@ceibbo.cl')
  assert.deepEqual(d.grupos, [{ id: 'u1', grupo: 'estudiante' }])
})

test('impide editar el readiness score manualmente', async () => {
  const d = dobles()
  const servicio = crearServicioPerfiles(d.repositorio, d.identidad)
  await servicio.registrar({ id: 'u1', email: 'u@ceibbo.cl', rol: 'estudiante' })
  await assert.rejects(() => servicio.actualizar('u1', { readinessScore: 100 }), /administrados por el sistema/)
})

test('solo el colegio dueño edita su personalización', async () => {
  const d = dobles()
  const servicio = crearServicioPerfiles(d.repositorio, d.identidad)
  await assert.rejects(
    () => servicio.actualizarConfig({ id: 'otro', rol: 'colegio' }, 'c1', { colorPrincipal: '#000000' }),
    (error) => error.statusCode === 403,
  )
})
