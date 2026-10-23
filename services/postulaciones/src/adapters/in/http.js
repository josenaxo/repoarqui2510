import { crearServicioPostulaciones } from '../../application/servicioPostulaciones.js'
import { repositorioPostulacionesDynamo } from '../out/dynamoRepositorioPostulaciones.js'
import { publicadorEventosSqs } from '../out/sqsPublicadorEventos.js'

const servicio = crearServicioPostulaciones(repositorioPostulacionesDynamo, publicadorEventosSqs)
function actor(event) {
  const claims = event.requestContext?.authorizer?.jwt?.claims ?? {}
  const grupos = String(claims['cognito:groups'] ?? '').replace(/[\[\]"]/g, '').split(',').filter(Boolean)
  return { id: claims.sub, rol: grupos[0] }
}
const response = (statusCode, body) => ({ statusCode, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })

export async function handler(event) {
  try {
    const usuario = actor(event)
    const body = event.body ? JSON.parse(event.body) : {}
    const oportunidadId = event.pathParameters?.id
    switch (event.routeKey) {
      case 'POST /oportunidades': return response(201, await servicio.publicar(usuario, body))
      case 'GET /oportunidades': return response(200, await servicio.listar())
      case 'POST /oportunidades/{id}/postulaciones': return response(201, await servicio.postular(usuario, oportunidadId))
      case 'GET /postulaciones/me': return response(200, await servicio.mias(usuario))
      case 'GET /oportunidades/{id}/postulantes': return response(200, await servicio.postulantes(usuario, oportunidadId))
      default: return response(404, { mensaje: 'ruta no encontrada' })
    }
  } catch (error) {
    return response(error.statusCode ?? 400, { mensaje: error.message })
  }
}
