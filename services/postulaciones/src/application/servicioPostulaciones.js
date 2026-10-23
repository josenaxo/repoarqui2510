import { randomUUID } from 'node:crypto'
import { crearOportunidad, crearPostulacion } from '../domain/Oportunidad.js'

export function crearServicioPostulaciones(repositorio, eventos) {
  return {
    async publicar(actor, datos) {
      if (actor.rol !== 'empresa') throw Object.assign(new Error('solo una empresa puede publicar'), { statusCode: 403 })
      return repositorio.crearOportunidad(crearOportunidad({ ...datos, id: randomUUID(), empresaId: actor.id }))
    },
    async listar() { return repositorio.listarOportunidades() },
    async postular(actor, oportunidadId) {
      if (actor.rol !== 'estudiante') throw Object.assign(new Error('solo un estudiante puede postular'), { statusCode: 403 })
      const oportunidad = await repositorio.obtenerOportunidad(oportunidadId)
      if (!oportunidad || oportunidad.estado !== 'abierta') throw Object.assign(new Error('oportunidad no disponible'), { statusCode: 404 })
      const postulacion = await repositorio.crearPostulacion(crearPostulacion({
        oportunidadId, estudianteId: actor.id, empresaId: oportunidad.empresaId,
      }))
      await eventos.publicar({
        tipo: 'PostulacionCreada', version: 1, id: randomUUID(), fecha: new Date().toISOString(),
        destinatarioId: oportunidad.empresaId,
        datos: { oportunidadId, estudianteId: actor.id, titulo: oportunidad.titulo },
      })
      return postulacion
    },
    async mias(actor) {
      if (actor.rol !== 'estudiante') throw Object.assign(new Error('acceso denegado'), { statusCode: 403 })
      return repositorio.listarEstudiante(actor.id)
    },
    async postulantes(actor, oportunidadId) {
      if (actor.rol !== 'empresa') throw Object.assign(new Error('acceso denegado'), { statusCode: 403 })
      const oportunidad = await repositorio.obtenerOportunidad(oportunidadId)
      if (!oportunidad) throw Object.assign(new Error('oportunidad no encontrada'), { statusCode: 404 })
      if (oportunidad.empresaId !== actor.id) throw Object.assign(new Error('la oferta pertenece a otra empresa'), { statusCode: 403 })
      return repositorio.listarPostulantes(oportunidadId)
    },
  }
}
