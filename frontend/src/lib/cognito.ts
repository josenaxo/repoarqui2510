import { Amplify } from 'aws-amplify'
import { signIn, signOut, fetchAuthSession } from 'aws-amplify/auth'
import type { UserRole } from '@/types'

// Los ids salen de los outputs de infra/shared (UserPoolId y UserPoolClientId)
const userPoolId       = process.env.NEXT_PUBLIC_USER_POOL_ID ?? ''
const userPoolClientId = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID ?? ''

if (!userPoolId || !userPoolClientId) {
  console.error('Faltan NEXT_PUBLIC_USER_POOL_ID o NEXT_PUBLIC_USER_POOL_CLIENT_ID en frontend/.env.local')
}

Amplify.configure({ Auth: { Cognito: { userPoolId, userPoolClientId } } })

const rolPorGrupo: Record<string, UserRole> = {
  estudiante: 'STUDENT',
  empresa:    'EMPRESA',
  colegio:    'COLEGIO',
}

// el mismo mensaje en los dos, asi no se puede averiguar que correos tienen cuenta
const mensajePorError: Record<string, string> = {
  NotAuthorizedException: 'Email o contraseña incorrectos.',
  UserNotFoundException:  'Email o contraseña incorrectos.',
}

// pasos que devuelve Amplify cuando falta algo antes de entrar
const mensajePorPaso: Record<string, string> = {
  CONFIRM_SIGN_UP: 'Tienes que confirmar tu correo antes de entrar.',
  RESET_PASSWORD:  'Tienes que cambiar tu contraseña antes de entrar.',
  CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED: 'Tu contraseña es temporal y hay que cambiarla antes de entrar.',
}

const mensajeGenerico = 'No se pudo iniciar sesión. Intenta de nuevo.'

export interface SesionCognito {
  userId:      string
  role:        UserRole
  accessToken: string
}

// Lee la sesion guardada. Amplify renueva el token solo si ya vencio
export async function leerSesion(forzarRenovacion = false): Promise<SesionCognito | null> {
  const { tokens } = await fetchAuthSession({ forceRefresh: forzarRenovacion })
  if (!tokens?.accessToken) return null

  const payload = tokens.accessToken.payload
  const grupos  = (payload['cognito:groups'] as string[] | undefined) ?? []
  // sin grupo = recien registrado sin perfil, y el registro publico solo crea estudiantes
  const role = grupos.map(g => rolPorGrupo[g]).find(Boolean) ?? 'STUDENT'

  return { userId: payload.sub as string, role, accessToken: tokens.accessToken.toString() }
}

export async function iniciarSesion(email: string, password: string): Promise<SesionCognito> {
  let paso: string
  try {
    // si quedo una sesion abierta, Amplify no deja entrar de nuevo
    await signOut()
    const { nextStep } = await signIn({ username: email, password })
    paso = nextStep.signInStep
  } catch (err: any) {
    throw new Error(mensajePorError[err?.name] ?? mensajeGenerico)
  }
  if (paso !== 'DONE') throw new Error(mensajePorPaso[paso] ?? mensajeGenerico)

  const sesion = await leerSesion().catch(() => null)
  if (!sesion) throw new Error(mensajeGenerico)
  return sesion
}

export async function cerrarSesion(): Promise<void> {
  await signOut()
}
