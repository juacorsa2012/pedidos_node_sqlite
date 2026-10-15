import express from "express"
import cors from "cors"
import type { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { env } from "./config/env.js"
import { formatUptime } from "./common/utils/uptime.js"
import { sendResponse } from "./common/utils/response.js"
import { errorHandler } from "./middlewares/error-handler.js"
import { AppError } from "./common/errors/custom-errors.js"
import clientesRoutes from "./modules/clientes/clientes.routes.js"
import proveedoresRoutes from "./modules/proveedores/proveedores.routes.js"
import pedidosRoutes from "./modules/pedidos/pedidos.routes.js"
import authRoutes from "./modules/auth/auth.routes.js"

export const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({ origin: env.CORS_ORIGIN }))

app.use("/api/clientes", clientesRoutes)
app.use("/api/proveedores", proveedoresRoutes)
app.use("/api/pedidos", pedidosRoutes)
app.use("/api/auth", authRoutes)

app.get("/health", (_: Request, res: Response) => {
  return sendResponse({
    res,
    statusCode: StatusCodes.OK,
    message: "API funcionando correctamente",
    data: {
      status: "OK",
      uptime: formatUptime(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  })
})

app.use((req, _res, next) => {
  next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, StatusCodes.NOT_FOUND))
})

app.use(errorHandler)
