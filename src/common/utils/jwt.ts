import jwt from "jsonwebtoken"
import { env } from "../../config/env.js"

const AUTH_TOKEN_TTL = "7d" as const

export interface AuthTokenPayload {
  usuarioId: number;  
}

export const generarToken = (usuarioId: number): string => {
  return jwt.sign({ usuarioId }, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: AUTH_TOKEN_TTL,
  })
}

export const verificarToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] }) as AuthTokenPayload
}
