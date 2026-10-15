import type { Request } from "express"

export interface AuthUsuario {
  id: number;
  email: string;
  name: string;
}

export interface AuthRequest extends Request {
  usuario?: AuthUsuario
}