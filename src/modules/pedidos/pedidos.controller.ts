import type { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { sendResponse } from "../../common/utils/response.js"
import { logger } from "../../config/logger.js"
import pedidosService from "./pedidos.service.js"
import {
  createPedidoSchema,
  idParamSchema,
  listPedidosQuerySchema,
  updatePedidoSchema,
} from "./pedidos.schemas.js"
import { pedidoMessages as Message } from "./pedidos.messages.js"

type PedidoService = typeof pedidosService

class PedidoController {
  constructor(private pedidoService: PedidoService) {}

  async obtenerTodos(req: Request, res: Response): Promise<Response> {
    const query = listPedidosQuerySchema.parse(req.query)
    const resultado = await this.pedidoService.obtenerTodos(query)
    logger.info({ total: resultado.data.length }, "Pedidos obtenidos")

    return sendResponse({
      res,
      statusCode: StatusCodes.OK,
      data: resultado.data,
      pagination: resultado.pagination,
    })
  }

  async obtenerPorId(req: Request, res: Response): Promise<Response> {
    const { id } = idParamSchema.parse(req.params)
    const pedido = await this.pedidoService.obtenerPorId(id)
    logger.info({ pedidoId: pedido.id }, "Pedido obtenido")

    return sendResponse({ res, statusCode: StatusCodes.OK, data: pedido })
  }

  async registrar(req: Request, res: Response): Promise<Response> {
    const data = createPedidoSchema.parse(req.body)
    const pedido = await this.pedidoService.registrar(data)
    logger.info(Message.pedidoRegistrado)

    return sendResponse({
      res,
      statusCode: StatusCodes.CREATED,
      data: pedido,
      message: Message.pedidoRegistrado,
    })
  }

  async actualizar(req: Request, res: Response): Promise<Response> {
    const { id } = idParamSchema.parse(req.params)
    const data = updatePedidoSchema.parse(req.body)
    const pedido = await this.pedidoService.actualizar(id, data)
    logger.info(Message.pedidoActualizado)

    return sendResponse({
      res,
      statusCode: StatusCodes.OK,
      data: pedido,
      message: Message.pedidoActualizado,
    })
  }
}

export default new PedidoController(pedidosService)
