import type { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { createClienteSchema, idParamSchema, updateClienteSchema } from "./clientes.schemas"
import { clienteMessages as Message } from "./clientes.messages"
import { logger } from "../../config/logger"
import { sendResponse } from "../../common/utils/response"
import clientesService from "./clientes.service"

type ClienteService = typeof clientesService

class ClienteController {
  constructor(private clienteService: ClienteService) {}

  async obtenerTodos(_req: Request, res: Response): Promise<Response> {
    const clientes = await this.clienteService.obtenerTodos()

    logger.info(`${clientes.length} clientes obtenidos correctamente`)
    
    return sendResponse({
      res,
      statusCode: StatusCodes.OK,
      data: clientes
    })
  }

  async obtenerPorId(req: Request, res: Response): Promise<Response> {    
    const { id } = idParamSchema.parse(req.params)

    const cliente = await this.clienteService.obtenerPorId(id)

    return sendResponse({
      res,
      statusCode: StatusCodes.OK,
      data: cliente
    })
  }

  async actualizar(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req.params)
    const data = updateClienteSchema.parse(req.body)

    const cliente = await this.clienteService.actualizar(id, data)

    logger.info(Message.clienteActualizadoConExito)

    return sendResponse({
      res,
      statusCode: StatusCodes.OK,
      data: cliente,
      message: Message.clienteActualizadoConExito
    })
  }
  
  async registrar(req: Request, res: Response) {
    const data = createClienteSchema.parse(req.body)
    const cliente = await this.clienteService.registrar(data)
    
    logger.info(Message.clienteRegistradoConExito)

    return sendResponse({
      res,
      statusCode: StatusCodes.CREATED,
      data: cliente,
      message: Message.clienteRegistradoConExito
    })
  }
}

export default new ClienteController(clientesService)