import { Router, type Request, type Response } from "express"
import pedidosController from "./pedidos.controller.js"

const router = Router()

router.get("/", (req: Request, res: Response) => {
  return pedidosController.obtenerTodos(req, res)
})

router.get("/:id", (req: Request, res: Response) => {
  return pedidosController.obtenerPorId(req, res)
})

router.post("/", (req: Request, res: Response) => {
  return pedidosController.registrar(req, res)
})

router.put("/:id", (req: Request, res: Response) => {
  return pedidosController.actualizar(req, res)
})

export default router
