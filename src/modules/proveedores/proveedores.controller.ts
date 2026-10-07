import type { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { sendResponse } from "../../common/utils/response.js"
import { logger } from "../../config/logger.js"
import proveedoresService from "./proveedores.service.js"
import { createProveedorSchema, idParamSchema, updateProveedorSchema } from "./proveedores.schemas.js"
import { proveedorMessages as Message  } from "./proveedores.messages.js"


type ProveedorService = typeof proveedoresService

class ProveedorController {
  constructor(private proveedorService: ProveedorService) {}

  async obtenerTodos(_req: Request, res: Response): Promise<Response> {
    const proveedores = await this.proveedorService.obtenerTodos()
    logger.info({ total: proveedores.length }, "Proveedores obtenidos")
    
    return sendResponse({ res, statusCode: StatusCodes.OK, data: proveedores })
  }

  obtenerPorId = async (req: Request, res: Response): Promise<Response> => {
    const { id } = idParamSchema.parse(req.params)
    const proveedor = await this.proveedorService.obtenerPorId(id)
    logger.info({ proveedorId: proveedor.id }, "Proveedor obtenido")

    return sendResponse({ res, statusCode: StatusCodes.OK, data: proveedor })
  }

  async registrar(req: Request, res: Response) {
    const data = createProveedorSchema.parse(req.body)
    const proveedor = await this.proveedorService.registrar(data)
    
    logger.info(Message.proveedorRegistrado)

    return sendResponse({
      res,
      statusCode: StatusCodes.CREATED,
      data: proveedor,
      message: Message.proveedorRegistrado
    })
  }

  async actualizar(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req.params)
    const data = updateProveedorSchema.parse(req.body)

    const proveedor = await this.proveedorService.actualizar(id, data)

    logger.info(Message.proveedorActualizado)

    return sendResponse({
      res,
      statusCode: StatusCodes.OK,
      data: proveedor,
      message: Message.proveedorActualizado
    })
  }
}

export default new ProveedorController(proveedoresService)

