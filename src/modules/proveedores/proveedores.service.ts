import { Prisma } from "../../../generated/prisma/client.js"
import { prisma } from "../../lib/prisma.js"
import { ProveedorNoExisteError, ProveedorYaExisteError } from "./proveedores.errors.js"
import type { CreateProveedorInput, UpdateProveedorInput } from "./proveedores.schemas.js"


class ProveedorService {
  async obtenerTodos() {
    return prisma.proveedor.findMany({
      orderBy: {
        nombre: "asc"
      }
    })
  }

  async obtenerPorId(id: number) {
    const proveedor = await prisma.proveedor.findUnique({ where: { id } })
    if (!proveedor) throw new ProveedorNoExisteError()      
    return proveedor
  }
  
  async registrar({ nombre }: CreateProveedorInput) {
    try {
      return await prisma.proveedor.create({ data: { nombre } })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ProveedorYaExisteError()
      }
      throw error
    }
  }

 async actualizar(id: number, { nombre }: UpdateProveedorInput) {
  try {
    return await prisma.proveedor.update({
      where: { id },
      data: { nombre }
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") throw new ProveedorYaExisteError()
      if (error.code === "P2025") throw new ProveedorYaExisteError()
    }
    throw error
    }
  }  
}

export default new ProveedorService()