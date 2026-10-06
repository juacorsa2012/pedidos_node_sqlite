import { Router, type Request, type Response } from "express"
import clienteController from "./clientes.controller"

const router = Router()

router.post("/", (req: Request, res: Response) => {
  return clienteController.registrar(req, res)
})

router.get("/", (req: Request, res: Response) => {
  return clienteController.obtenerTodos(req, res)
})

router.get("/:id", (req: Request, res: Response) => {
  return clienteController.obtenerPorId(req, res)
})

router.put("/:id", (req: Request, res: Response) => {
  return clienteController.actualizar(req, res)
})

export default router