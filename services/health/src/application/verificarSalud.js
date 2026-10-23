/** @param {import('../ports/RepositorioSalud.js').RepositorioSalud} repositorio */
export async function verificarSalud(repositorio) {
  const baseDatos = await repositorio.ping()
  return {
    estado: baseDatos ? 'ok' : 'degradado',
    baseDatos,
    fecha: new Date().toISOString(),
  }
}
