import { actualizarPerfil, crearConfigColegio, crearPerfil } from '../domain/Perfil.js'

export function crearServicioPerfiles(repositorio, identidad) {
  return {
    async registrar(datos) {
      const perfil = crearPerfil(datos)
      await identidad.agregarAGrupo(perfil.id, perfil.rol)
      return repositorio.crear(perfil)
    },

    async obtener(id) {
      const perfil = await repositorio.obtener(id)
      if (!perfil) throw Object.assign(new Error('perfil no encontrado'), { statusCode: 404 })
      return perfil
    },

    async actualizar(id, cambios) {
      const actual = await this.obtener(id)
      return repositorio.guardar(actualizarPerfil(actual, cambios))
    },

    async obtenerConfig(colegioId) {
      return (await repositorio.obtenerConfig(colegioId)) ?? crearConfigColegio(colegioId, {})
    },

    async actualizarConfig(actor, colegioId, cambios) {
      if (actor.rol !== 'colegio' || actor.id !== colegioId) {
        throw Object.assign(new Error('solo el colegio puede editar su configuración'), { statusCode: 403 })
      }
      const actual = await this.obtenerConfig(colegioId)
      return repositorio.guardarConfig(crearConfigColegio(colegioId, { ...actual, ...cambios }))
    },
  }
}
