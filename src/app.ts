import express from "express"
import cors from "cors"
import type { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { formatUptime } from "./common/utils/uptime.js"
import { errorHandler } from "./middlewares/error-handler.js"
import { AppError } from "./common/errors/custom-errors.js"
import clientesRoutes from "./modules/clientes/clientes.routes.js"
import proveedoresRoutes from "./modules/proveedores/proveedores.routes.js"

export const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.use("/api/clientes", clientesRoutes)
app.use("/api/proveedores", proveedoresRoutes)

app.get("/health", (_: Request, res: Response) => {
  return res.status(StatusCodes.OK).json({
    status: "OK",
    message: "API funcionando correctamente",    
    uptime: formatUptime(process.uptime()),
    timestamp: new Date().toISOString(),
  })
})

app.use((req, _res, next) => {
  next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, StatusCodes.NOT_FOUND))
})

app.use(errorHandler)