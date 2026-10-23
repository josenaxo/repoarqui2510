import { crearServicioPerfiles } from '../../application/servicioPerfiles.js'
import { repositorioPerfilesDynamo } from '../out/dynamoRepositorioPerfiles.js'
import { servicioIdentidadCognito } from '../out/cognitoServicioIdentidad.js'

const servicio = crearServicioPerfiles(repositorioPerfilesDynamo, servicioIdentidadCognito)

function actor(event) {
  const claims = event.requestContext?.authorizer?.jwt?.claims ?? {}
  const grupos = String(claims['cognito:groups'] ?? '').replace(/[\[\]"]/g, '').split(',').filter(Boolean)
  return { id: claims.sub, email: claims.email, rol: grupos[0] }
}

function response(statusCode, body) {
  return { statusCode, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }
}

export async function handler(event) {
  try {
    const usuario = actor(event)
    const body = event.body ? JSON.parse(event.body) : {}
    const colegioId = event.pathParameters?.id
    switch (event.routeKey) {
      case 'POST /perfiles': return response(201, await servicio.registrar({ ...body, id: usuario.id, email: usuario.email }))
      case 'GET /perfiles/me': return response(200, await servicio.obtener(usuario.id))
      case 'PUT /perfiles/me': return response(200, await servicio.actualizar(usuario.id, body))
      case 'GET /colegios/{id}/config': return response(200, await servicio.obtenerConfig(colegioId))
      case 'PUT /colegios/{id}/config': return response(200, await servicio.actualizarConfig(usuario, colegioId, body))
      default: return response(404, { mensaje: 'ruta no encontrada' })
    }
  } catch (error) {
    return response(error.statusCode ?? 400, { mensaje: error.message })
  }
}
