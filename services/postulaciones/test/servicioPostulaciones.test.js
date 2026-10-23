import test from 'node:test'
import assert from 'node:assert/strict'
import { crearServicioPostulaciones } from '../src/application/servicioPostulaciones.js'

function dobles() {
  const oportunidades = new Map(); const postulaciones = new Map(); const eventosPublicados = []
  return {
    eventosPublicados,
    repo: {
      async crearOportunidad(o) { oportunidades.set(o.id, o); return o },
      async listarOportunidades() { return [...oportunidades.values()] },
      async obtenerOportunidad(id) { return oportunidades.get(id) ?? null },
      async crearPostulacion(p) {
        const key = `${p.oportunidadId}:${p.estudianteId}`
        if (postulaciones.has(key)) throw Object.assign(new Error('postulación duplicada'), { statusCode: 409 })
        postulaciones.set(key, p); return p
      },
      async listarEstudiante(id) { return [...postulaciones.values()].filter((p) => p.estudianteId === id) },
      async listarPostulantes(id) { return [...postulaciones.values()].filter((p) => p.oportunidadId === id) },
    },
    eventos: { async publicar(e) { eventosPublicados.push(e) } },
  }
}

test('empresa publica y estudiante postula una vez', async () => {
  const d = dobles(); const servicio = crearServicioPostulaciones(d.repo, d.eventos)
  const oportunidad = await servicio.publicar({ id: 'empresa1', rol: 'empresa' }, { titulo: 'Práctica TI' })
  const postulacion = await servicio.postular({ id: 'estudiante1', rol: 'estudiante' }, oportunidad.id)
  assert.equal(postulacion.estado, 'enviada')
  assert.equal(d.eventosPublicados[0].tipo, 'PostulacionCreada')
})

test('postular dos veces es idempotente y responde 409', async () => {
  const d = dobles(); const servicio = crearServicioPostulaciones(d.repo, d.eventos)
  const oportunidad = await servicio.publicar({ id: 'empresa1', rol: 'empresa' }, { titulo: 'Práctica TI' })
  const actor = { id: 'estudiante1', rol: 'estudiante' }
  await servicio.postular(actor, oportunidad.id)
  await assert.rejects(() => servicio.postular(actor, oportunidad.id), (error) => error.statusCode === 409)
  assert.equal(d.eventosPublicados.length, 1)
})

test('una empresa no ve postulantes de otra empresa', async () => {
  const d = dobles(); const servicio = crearServicioPostulaciones(d.repo, d.eventos)
  const oportunidad = await servicio.publicar({ id: 'empresa1', rol: 'empresa' }, { titulo: 'Práctica TI' })
  await assert.rejects(() => servicio.postulantes({ id: 'empresa2', rol: 'empresa' }, oportunidad.id), (error) => error.statusCode === 403)
})
