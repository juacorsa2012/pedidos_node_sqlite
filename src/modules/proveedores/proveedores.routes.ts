import { Router, type Request, type Response } from "express"
import proveedoresController from "./proveedores.controller.js"

const router = Router()


router.get("/", (req: Request, res: Response) => {
  return proveedoresController.obtenerTodos(req, res)
})

router.get("/:id", (req: Request, res: Response) => {
  return proveedoresController.obtenerPorId(req, res)
})

router.post("/", (req: Request, res: Response) => {
  return proveedoresController.registrar(req, res)
})

router.put("/:id", (req: Request, res: Response) => {
  return proveedoresController.actualizar(req, res)
})

//router.get("/", proveedoresController.obtenerTodos)

export default router