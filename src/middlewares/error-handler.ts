import type { NextFunction, Request, Response } from 'express'
import { ZodError } from "zod"
import { StatusCodes } from 'http-status-codes'
import { AppError } from "../common/errors/custom-errors.js"
import { logger } from '../config/logger.js'

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
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
      message: "Error de validación",
      errors: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }
  
  logger.error('Unhandled error')  
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Internal server error',
  })
}