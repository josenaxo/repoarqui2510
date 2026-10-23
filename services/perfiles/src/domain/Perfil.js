const roles = new Set(['estudiante', 'empresa', 'colegio'])

export function crearPerfil(datos) {
  if (!datos.id || !datos.email) throw new Error('id y email son obligatorios')
  if (!roles.has(datos.rol)) throw new Error('rol inválido')
  if (Object.hasOwn(datos, 'readinessScore')) throw new Error('readinessScore no se edita manualmente')

  return {
    id: datos.id,
    email: datos.email.trim().toLowerCase(),
    rol: datos.rol,
    nombre: datos.nombre?.trim() ?? '',
    colegioId: datos.colegioId ?? null,
    readinessScore: 0,
    creadoEn: new Date().toISOString(),
  }
}

export function actualizarPerfil(actual, cambios) {
  if (Object.hasOwn(cambios, 'readinessScore') || Object.hasOwn(cambios, 'rol') || Object.hasOwn(cambios, 'id')) {
    throw new Error('id, rol y readinessScore son administrados por el sistema')
  }
  return { ...actual, ...cambios, actualizadoEn: new Date().toISOString() }
}

export function crearConfigColegio(colegioId, datos) {
  if (!colegioId) throw new Error('colegioId es obligatorio')
  return {
    colegioId,
    logo: datos.logo ?? null,
    colorPrincipal: datos.colorPrincipal ?? '#0056D2',
    textoBienvenida: datos.textoBienvenida ?? 'Bienvenido a Ceibbo',
  }
}
