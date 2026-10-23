export function crearOportunidad(datos) {
  if (!datos.id || !datos.empresaId || !datos.titulo?.trim()) throw new Error('id, empresaId y título son obligatorios')
  return {
    id: datos.id,
    empresaId: datos.empresaId,
    titulo: datos.titulo.trim(),
    descripcion: datos.descripcion?.trim() ?? '',
    especialidad: datos.especialidad?.trim() ?? '',
    estado: 'abierta',
    creadaEn: new Date().toISOString(),
  }
}

export function crearPostulacion(datos) {
  if (!datos.oportunidadId || !datos.estudianteId) throw new Error('oportunidadId y estudianteId son obligatorios')
  return {
    oportunidadId: datos.oportunidadId,
    estudianteId: datos.estudianteId,
    empresaId: datos.empresaId,
    estado: 'enviada',
    creadaEn: new Date().toISOString(),
  }
}
