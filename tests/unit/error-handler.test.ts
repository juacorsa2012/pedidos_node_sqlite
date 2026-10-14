import type { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AppError } from "../../src/common/errors/custom-errors.js"
import { commonMessages } from "../../src/common/messages.js"
import { errorHandler } from "../../src/middlewares/error-handler.js"
import { z } from "zod"

const createResponse = () => {
  const response = {
    status: vi.fn(),
    json: vi.fn(),
  }
  response.status.mockReturnValue(response)
  response.json.mockReturnValue(response)
  return response
}

describe("errorHandler", () => {
  beforeEach(() => vi.clearAllMocks())

  it("devuelve el status y mensaje de un AppError", () => {
    const response = createResponse()

    errorHandler(
      new AppError("Recurso no encontrado", StatusCodes.NOT_FOUND),
      {} as Request,
      response as unknown as Response,
      vi.fn(),
    )

    expect(response.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND)
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: "Recurso no encontrado",
    })
  })

  it("devuelve los detalles de un error de Zod", () => {
    const result = z.object({ nombre: z.string() }).safeParse({ nombre: 123 })
    if (result.success) throw new Error("Se esperaba que la validación fallara")
    const response = createResponse()

    errorHandler(result.error, {} as Request, response as unknown as Response, vi.fn())

    expect(response.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST)
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: commonMessages.errorValidacion,
      errors: [expect.objectContaining({ field: "nombre" })],
    })
  })

  it.each([
    ["entity.parse.failed", StatusCodes.BAD_REQUEST, commonMessages.cuerpoSolicitudInvalido],
    ["entity.too.large", StatusCodes.REQUEST_TOO_LONG, commonMessages.cuerpoSolicitudDemasiadoGrande],
    ["request.aborted", StatusCodes.BAD_REQUEST, commonMessages.solicitudInterrumpida],
    ["request.size.invalid", StatusCodes.BAD_REQUEST, commonMessages.tamanoSolicitudInvalido],
    ["parameters.too.many", StatusCodes.REQUEST_TOO_LONG, commonMessages.demasiadosParametros],
    ["charset.unsupported", StatusCodes.UNSUPPORTED_MEDIA_TYPE, commonMessages.charsetNoSoportado],
    ["encoding.unsupported", StatusCodes.UNSUPPORTED_MEDIA_TYPE, commonMessages.encodingNoSoportado],
  ])("mapea el error del parser %s a su respuesta HTTP", (type, status, message) => {
    const response = createResponse()
    const error = Object.assign(new Error("Body parser error"), { type })

    errorHandler(error, {} as Request, response as unknown as Response, vi.fn())

    expect(response.status).toHaveBeenCalledWith(status)
    expect(response.json).toHaveBeenCalledWith({ success: false, message })
  })

  it("devuelve 500 para un error no reconocido", () => {
    const response = createResponse()

    errorHandler(new Error("Unexpected error"), {} as Request, response as unknown as Response, vi.fn())

    expect(response.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR)
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: commonMessages.errorInternoServidor,
    })
  })
})
