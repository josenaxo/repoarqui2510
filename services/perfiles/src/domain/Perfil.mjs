// Reglas del perfil, no depende de aws ni de http (ver docs/datos/perfiles.md)
import { ErrorDominio, CODIGOS } from "./errores.mjs";
import { esTextoNoVacio, validarTexto, validarEnlace } from "./validaciones.mjs";

export const TIPOS = ["estudiante", "empresa", "colegio"];

// Campos que puede editar cada tipo y su largo maximo (los mismos del contrato)
// readinessScore, profileViews, tipo y userId no van porque el usuario no los edita
const CAMPOS_EDITABLES = {
  estudiante: {
    nombre: 60, apellido: 60, titular: 120, bio: 1000, especialidad: 80,
    anio: null, telefono: 20, ubicacion: 80, colegioId: 40,
  },
  empresa: {
    nombre: 60, descripcion: 1000, industria: 80, tamanio: 40, ubicacion: 80, sitioWeb: 200,
  },
  colegio: {},
};

// Si vienen en el body no pueden quedar vacios
const OBLIGATORIOS = { estudiante: ["nombre", "apellido"], empresa: ["nombre"], colegio: [] };

function validarAnio(valor) {
  if (!Number.isInteger(valor) || valor < 1 || valor > 7) {
    throw new ErrorDominio(CODIGOS.VALIDACION, "El campo anio debe ser un entero entre 1 y 7");
  }
  return valor;
}

function validarCampo(campo, valor, largoMaximo) {
  if (campo === "anio") return validarAnio(valor);
  if (campo === "sitioWeb") return validarEnlace(campo, valor, largoMaximo);
  return validarTexto(campo, valor, largoMaximo);
}

// Registro publico: solo crea estudiantes (no hay rol admin)
export function crearPerfilEstudiante({ userId, email, datos }) {
  if (!esTextoNoVacio(datos?.nombre) || !esTextoNoVacio(datos?.apellido)) {
    throw new ErrorDominio(CODIGOS.VALIDACION, "nombre y apellido son obligatorios");
  }
  const perfil = {
    userId,
    // el access token de cognito no trae el email, se guarda solo si viene
    ...(email ? { email } : {}),
    tipo: "estudiante",
    readinessScore: 0,
    profileViews: 0,
  };
  return aplicarCambios(perfil, datos);
}

// Retorna solo los campos permitidos para ese tipo, ya validados
// los que no se pueden editar (ej. readinessScore) se ignoran
export function validarCambios(tipo, cambios) {
  if (cambios === null || cambios === undefined) return {};
  if (typeof cambios !== "object" || Array.isArray(cambios)) {
    throw new ErrorDominio(CODIGOS.VALIDACION, "Los datos deben ser un objeto JSON");
  }
  const permitidos = CAMPOS_EDITABLES[tipo] ?? {};
  const obligatorios = OBLIGATORIOS[tipo] ?? [];
  const validados = {};
  for (const [campo, valor] of Object.entries(cambios)) {
    // hasOwn y no "in", porque "in" deja pasar claves heredadas como constructor o toString
    if (!Object.hasOwn(permitidos, campo)) continue;
    const validado = validarCampo(campo, valor, permitidos[campo]);
    if (obligatorios.includes(campo) && validado === "") {
      throw new ErrorDominio(CODIGOS.VALIDACION, `El campo ${campo} no puede quedar vacío`);
    }
    validados[campo] = validado;
  }
  return validados;
}

// Retorna el perfil con los cambios aplicados
export function aplicarCambios(perfil, cambios) {
  return { ...perfil, ...validarCambios(perfil.tipo, cambios) };
}
