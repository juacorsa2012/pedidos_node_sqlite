import type { NextFunction, Request, Response } from 'express'
import { ZodError } from "zod"
import { StatusCodes } from 'http-status-codes'
import { AppError } from "../common/errors/custom-errors.js"
import { commonMessages } from "../common/messages.js"
import { logger } from '../config/logger.js'

type RequestBodyError = Error & {
  type?: string
}

const requestBodyErrors: Record<string, { statusCode: number; message: string }> = {
  "entity.parse.failed": {
    statusCode: StatusCodes.BAD_REQUEST,
    message: commonMessages.cuerpoSolicitudInvalido,
  },
  "entity.too.large": {
    statusCode: StatusCodes.REQUEST_TOO_LONG,
    message: commonMessages.cuerpoSolicitudDemasiadoGrande,
  },
  "request.aborted": {
    statusCode: StatusCodes.BAD_REQUEST,
    message: commonMessages.solicitudInterrumpida,
  },
  "request.size.invalid": {
    statusCode: StatusCodes.BAD_REQUEST,
    message: commonMessages.tamanoSolicitudInvalido,
  },
  "parameters.too.many": {
    statusCode: StatusCodes.REQUEST_TOO_LONG,
    message: commonMessages.demasiadosParametros,
  },
  "charset.unsupported": {
    statusCode: StatusCodes.UNSUPPORTED_MEDIA_TYPE,
    message: commonMessages.charsetNoSoportado,
  },
  "encoding.unsupported": {
    statusCode: StatusCodes.UNSUPPORTED_MEDIA_TYPE,
    message: commonMessages.encodingNoSoportado,
  },
}

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // Custom application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
  }

  // Zod errors
  if (err instanceof ZodError) {
    logger.error("Error de validación")
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: commonMessages.errorValidacion,
      errors: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  // Body parsers (express.json / express.urlencoded)
  const bodyError = err as RequestBodyError
  const knownBodyError = bodyError.type ? requestBodyErrors[bodyError.type] : undefined
  if (knownBodyError) {
    logger.warn({ type: bodyError.type, statusCode: knownBodyError.statusCode }, "Solicitud rechazada por el parser del cuerpo")
    return res.status(knownBodyError.statusCode).json({
      success: false,
      message: knownBodyError.message,
    })
  }
  
  logger.error({ err }, "Error interno no controlado")
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: commonMessages.errorInternoServidor
  })
}
