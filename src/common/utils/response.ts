import type { Response } from "express"

type SendResponseOptions<T> = {
  res: Response
  statusCode: number
  data?: T | null
  message?: string | null
  pagination?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export function sendResponse<T>({
  res,
  statusCode,
  data = null,
  message = null,
  pagination
}: SendResponseOptions<T>): Response {
  return res
    .status(statusCode)
    .json({
      success: true,
      message,
      data,
      pagination
    })
}
