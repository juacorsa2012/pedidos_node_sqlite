import { StatusCodes } from "http-status-codes"
import { AppError } from "../../common/errors/custom-errors.js"
import { authMessages as Message } from "./auth.messages.js"

export class UsuarioYaExisteError extends AppError {
  constructor() {
    super(Message.usuarioYaExiste, StatusCodes.CONFLICT)
  }
}

export class NoAutorizadoError extends AppError {
  constructor() {
    super(Message.credencialesIncorrectas, 401)
  }
}

