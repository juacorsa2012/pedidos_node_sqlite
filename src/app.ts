import express from "express"
import cors from "cors"
import type { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { formatUptime } from "./common/utils/uptime"
import clientesRoutes from "./modules/clientes/clientes.routes"
import { errorHandler } from "./middlewares/error-handler"

export const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.use("/api/clientes", clientesRoutes)

app.get("/health", (_: Request, res: Response) => {
  return res.status(StatusCodes.OK).json({
    status: "OK",
    message: "API funcionando correctamente",    
    uptime: formatUptime(process.uptime()),
    timestamp: new Date().toISOString(),
  })
})

app.use(errorHandler)