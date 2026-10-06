import { prisma } from "../../lib/prisma"
import type { CreateClienteInput, UpdateClienteInput } from "./clientes.schemas"
import { ClienteNoExisteError, ClienteYaExisteError } from "./clientes.errors"
import { Prisma } from "../../../generated/prisma/client"

class ClienteService {
  async obtenerTodos() {
    return prisma.cliente.findMany({
      orderBy: {
        nombre: "asc"
      }
    })
  }

  async obtenerPorId(id: number) {
    const cliente = await prisma.cliente.findUnique({ where: { id } })
    if (!cliente) throw new ClienteNoExisteError()
    return cliente
  }

 async actualizar(id: number, { nombre }: UpdateClienteInput) {
  try {
    return await prisma.cliente.update({
      where: { id },
      data: { nombre }
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") throw new ClienteYaExisteError()
      if (error.code === "P2025") throw new ClienteNoExisteError()
    }
    throw error
  }
}

async registrar({ nombre }: CreateClienteInput) {
  try {
    return await prisma.cliente.create({ data: { nombre } })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ClienteYaExisteError()
    }
    throw error
  }
  }
}

export default new ClienteService()