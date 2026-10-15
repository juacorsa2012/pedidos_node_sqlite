import type { Request, Response } from "express"
import express from "express"
import cors from "cors"
import helmet from "helmet"
import hpp from "hpp"
import { rateLimit } from "express-rate-limit"
import { StatusCodes } from "http-status-codes"
import { env } from "./config/env.js"
import { formatUptime } from "./common/utils/uptime.js"
import { sendResponse } from "./common/utils/response.js"
import { errorHandler } from "./middlewares/error-handler.js"
import { AppError } from "./common/errors/custom-errors.js"
import { commonMessages as Message } from "./common/messages.js"
import clientesRoutes from "./modules/clientes/clientes.routes.js"
import proveedoresRoutes from "./modules/proveedores/proveedores.routes.js"
import pedidosRoutes from "./modules/pedidos/pedidos.routes.js"
import authRoutes from "./modules/auth/auth.routes.js"

export const app = express()

app.use(helmet())
app.use(cors({ origin: env.CORS_ORIGIN }))

const rateLimitHandler = (_req: Request, res: Response) => {  
  return res.status(StatusCodes.TOO_MANY_REQUESTS).json({
    success: false,
    message: Message.demasiadasSolicitudes
  })
}

const normalizarRuta = (path: string) => path.replace(/\/+$/, "") || "/"

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 100,
  skip: (req) => normalizarRuta(req.path) === "/health",
  handler: rateLimitHandler,
})

const rutasAuthLimitadas = new Set([
  "/api/auth/registrar",
  "/api/auth/iniciar-sesion",
])

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skip: (req) =>
    req.method !== "POST" ||
    !rutasAuthLimitadas.has(normalizarRuta(req.path)),
  handler: rateLimitHandler,
})

app.use(apiLimiter)
app.use(authLimiter)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(hpp())

app.use("/api/clientes", clientesRoutes)
app.use("/api/proveedores", proveedoresRoutes)
app.use("/api/pedidos", pedidosRoutes)
app.use("/api/auth", authRoutes)

app.get("/health", (_req: Request, res: Response) => {
  return sendResponse({
    res,
    statusCode: StatusCodes.OK,
    message: Message.apiFuncionando,
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
