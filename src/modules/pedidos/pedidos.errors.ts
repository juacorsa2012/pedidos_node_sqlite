import { StatusCodes } from "http-status-codes"
import { AppError } from "../../common/errors/custom-errors.js"
import { pedidoMessages } from "./pedidos.messages.js"

export class ClientePedidoNoExisteError extends AppError {
  constructor() {
    super(pedidoMessages.clienteNoExiste, StatusCodes.NOT_FOUND)
  }
}

export class ProveedorPedidoNoExisteError extends AppError {
  constructor() {
    super(pedidoMessages.proveedorNoExiste, StatusCodes.NOT_FOUND)
  }
}

export class PedidoNoExisteError extends AppError {
  constructor() {
    super(pedidoMessages.pedidoNoExiste, StatusCodes.NOT_FOUND)
  }
}
