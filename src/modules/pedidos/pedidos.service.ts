import { prisma } from "../../lib/prisma.js"
import { Prisma } from "../../../generated/prisma/client.js"
import type { CreatePedidoInput, ListPedidosQuery, UpdatePedidoInput } from "./pedidos.schemas.js"
import {
  ClientePedidoNoExisteError,
  PedidoNoExisteError,
  ProveedorPedidoNoExisteError,
} from "./pedidos.errors.js"

class PedidoService {
  async obtenerTodos({ page, pageSize, clienteId, proveedorId }: ListPedidosQuery) {
    const where = {
      ...(clienteId === undefined ? {} : { clienteId }),
      ...(proveedorId === undefined ? {} : { proveedorId }),
    }

    const [pedidos, total] = await prisma.$transaction([
      prisma.pedido.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.pedido.count({ where }),
    ])

    return {
      data: pedidos,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  }

  async obtenerPorId(id: number) {
    const pedido = await prisma.pedido.findUnique({ where: { id } })
    if (!pedido) throw new PedidoNoExisteError()
    return pedido
  }

  async registrar(input: CreatePedidoInput) {
    await this.validarRelaciones(input)
    return prisma.pedido.create({ data: input })
  }

  async actualizar(id: number, input: UpdatePedidoInput) {
    await this.validarRelaciones(input)

    try {
      return await prisma.pedido.update({
        where: { id },
        data: input,
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw new PedidoNoExisteError()
      }
      throw error
    }
  }

  private async validarRelaciones(input: Pick<CreatePedidoInput, "clienteId" | "proveedorId">) {
    const [cliente, proveedor] = await Promise.all([
      prisma.cliente.findUnique({ where: { id: input.clienteId }, select: { id: true } }),
      prisma.proveedor.findUnique({ where: { id: input.proveedorId }, select: { id: true } }),
    ])

    if (!cliente) throw new ClientePedidoNoExisteError()
    if (!proveedor) throw new ProveedorPedidoNoExisteError()
  }
}

export default new PedidoService()
