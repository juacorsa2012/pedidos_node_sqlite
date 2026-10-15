import type { Request, Response } from "express"
import authService from "./auth.service.js"
import { loginSchema, registerSchema } from "./auth.schemas.js"
import { sendResponse } from "../../common/utils/response.js"
import { StatusCodes } from "http-status-codes"
import { authMessages as Message } from "./auth.messages.js"

type AuthServiceType = typeof authService

class AuthController {
  constructor(private authService: AuthServiceType) {}

  async registrar(req: Request, res: Response): Promise<Response> {
    const data = registerSchema.parse(req.body)
    const { usuario, token } = await this.authService.registrar(data)

    return sendResponse({
      res,
      message: Message.usuarioRegistrado,
      statusCode: StatusCodes.CREATED,
      data: { usuario, token }
    })   
  }

  async iniciarSesion(req: Request, res: Response): Promise<Response> {
    const credenciales = loginSchema.parse(req.body)
    const { usuario, token } = await this.authService.iniciarSesion(credenciales)

    return sendResponse({
      res,
      message: Message.usuarioLogueado,
      statusCode: StatusCodes.OK,
      data: { usuario, token }
    })   
  }


}

export default new AuthController(authService)
