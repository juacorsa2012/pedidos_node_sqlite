import { Router, type Request, type Response } from "express"
import authController from "./auth.controller.js"
import { authenticate } from "./auth.middleware.js"

const router = Router()

router.post("/registrar", (req: Request, res: Response) => {
  return authController.registrar(req, res)
})

router.post("/iniciar-sesion", (req: Request, res: Response) => {
  return authController.iniciarSesion(req, res)
})

router.get("/me", authenticate, (req: Request, res: Response) => {
  return authController.obtenerUsuarioActual(req, res)
})

export default router