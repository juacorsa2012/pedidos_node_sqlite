import type { Response } from "express"

type SendResponseOptions<T> = {
  res: Response
  statusCode: number
  data?: T | null
  message?: string | null
}

export function sendResponse<T>({
  res,
  statusCode,
  data = null,
  message = null
}: SendResponseOptions<T>): Response {
  return res
    .status(statusCode)
    .json({
      success: true,
      message,
      data
    })
}