import { verificarSalud } from '../../application/verificarSalud.js'
import { repositorioSaludDynamo } from '../out/dynamoRepositorioSalud.js'

export async function handler() {
  const resultado = await verificarSalud(repositorioSaludDynamo)
  return {
    statusCode: resultado.baseDatos ? 200 : 503,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(resultado),
  }
}
