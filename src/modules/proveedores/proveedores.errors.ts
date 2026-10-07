import { StatusCodes } from "http-status-codes"
import { AppError } from "../../common/errors/custom-errors.js"
import { proveedorMessages as Message } from "./proveedores.messages.js"

export class ProveedorYaExisteError extends AppError {
  constructor() {
    super(Message.proveedorYaExiste, StatusCodes.CONFLICT)
  }
}

export class ProveedorNoExisteError extends AppError {
  constructor() {
    super(Message.proveedorNoExiste, StatusCodes.NOT_FOUND)
  }
}
