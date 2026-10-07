import { StatusCodes } from "http-status-codes"
import { AppError } from "../../common/errors/custom-errors.js"
import { clienteMessages as Message } from "./clientes.messages.js"

export class ClienteYaExisteError extends AppError {
  constructor() {
    super(Message.clienteYaExiste, StatusCodes.CONFLICT)
  }
}

export class ClienteNoExisteError extends AppError {
  constructor() {
    super(Message.clienteNoExiste, StatusCodes.NOT_FOUND)
  }
}
