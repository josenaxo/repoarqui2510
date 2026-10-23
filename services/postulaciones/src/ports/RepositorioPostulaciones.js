/**
 * @typedef {{
 * crearOportunidad(oportunidad: object): Promise<object>, listarOportunidades(): Promise<object[]>,
 * obtenerOportunidad(id: string): Promise<object|null>, crearPostulacion(postulacion: object): Promise<object>,
 * listarEstudiante(id: string): Promise<object[]>, listarPostulantes(oportunidadId: string): Promise<object[]>
 * }} RepositorioPostulaciones
 */
export const puertoRepositorioPostulaciones = Symbol('RepositorioPostulaciones')
