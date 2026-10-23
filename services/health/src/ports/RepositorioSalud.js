/**
 * Puerto de salida. Los casos de uso dependen de este contrato y no de AWS.
 * @typedef {{ ping(): Promise<boolean> }} RepositorioSalud
 */
export const puertoRepositorioSalud = Symbol('RepositorioSalud')
