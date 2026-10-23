/**
 * @typedef {{
 * crear(perfil: object): Promise<object>,
 * obtener(id: string): Promise<object|null>,
 * guardar(perfil: object): Promise<object>,
 * obtenerConfig(colegioId: string): Promise<object|null>,
 * guardarConfig(config: object): Promise<object>
 * }} RepositorioPerfiles
 */
export const puertoRepositorioPerfiles = Symbol('RepositorioPerfiles')
