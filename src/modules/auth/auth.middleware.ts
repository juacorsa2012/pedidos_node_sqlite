import type { NextFunction, Response } from "express"
import type { AuthRequest } from "./auth.types.js"
import { NoAutorizadoError } from "./auth.errors.js"
import { verificarToken, type AuthTokenPayload } from "../../common/utils/jwt.js"
import authService from "./auth.service.js"

const obtenerBearerToken = (authorizationHeader: string | undefined) => {
  if (!authorizationHeader) {
    return
  }

  const [schema, token, ...extraParts] = authorizationHeader.trim().split(/\s+/)

  if (schema?.toLowerCase() !== "bearer" || !token || extraParts.length > 0) {
    return
  }

  return token
}

export const authenticate = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const token = obtenerBearerToken(req.headers.authorization)
  if (!token) {
    throw new NoAutorizadoError()
  }

  let payload: AuthTokenPayload

  try {
    payload = verificarToken(token)
  } catch {
    throw new NoAutorizadoError()
  }

  if (!Number.isInteger(payload.usuarioId) || payload.usuarioId <= 0) {
    throw new NoAutorizadoError()
  }

  const usuarioId = payload.usuarioId
  const usuario = await authService.obtenerUsuarioPorId(usuarioId)

  if (!usuario) {
    throw new NoAutorizadoError()
  }

  req.usuario = {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
  }
  next()
}
