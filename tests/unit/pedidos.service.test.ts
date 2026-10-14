import { beforeEach, describe, expect, it, vi } from "vitest"
import { Prisma } from "../../generated/prisma/client.js"
import { prisma } from "../../src/lib/prisma.js"
import {
  ClientePedidoNoExisteError,
  PedidoNoExisteError,
  ProveedorPedidoNoExisteError,
} from "../../src/modules/pedidos/pedidos.errors.js"
import pedidosService from "../../src/modules/pedidos/pedidos.service.js"

vi.mock("../../src/lib/prisma.js", () => ({
  prisma: {
    cliente: { findUnique: vi.fn() },
    proveedor: { findUnique: vi.fn() },
    pedido: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

const pedidoInput = {
  unidades: 4,
  producto: "Producto",
  proveedorId: 2,
  clienteId: 1,
}

const pedido = {
  id: 5,
  ...pedidoInput,
  oferta: null,
  solicitadoPor: null,
  observaciones: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const prismaError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError("Prisma error", {
    code,
    clientVersion: "7.10.0",
  })

describe("PedidoService.obtenerTodos", () => {
  beforeEach(() => vi.resetAllMocks())

  it("devuelve una página con filtros y total correspondiente", async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([[pedido], 1] as never)

    const resultado = await pedidosService.obtenerTodos({
      page: 2,
      pageSize: 10,
      clienteId: 1,
      proveedorId: 2,
    })

    expect(resultado).toEqual({
      data: [pedido],
      pagination: { page: 2, pageSize: 10, total: 1, totalPages: 1 },
    })
    expect(prisma.pedido.findMany).toHaveBeenCalledWith({
      where: { clienteId: 1, proveedorId: 2 },
      orderBy: { createdAt: "desc" },
      skip: 10,
      take: 10,
    })
    expect(prisma.pedido.count).toHaveBeenCalledWith({
      where: { clienteId: 1, proveedorId: 2 },
    })
  })
})

describe("PedidoService.obtenerPorId", () => {
  beforeEach(() => vi.resetAllMocks())

  it("devuelve el pedido cuando existe", async () => {
    vi.mocked(prisma.pedido.findUnique).mockResolvedValue(pedido)

    await expect(pedidosService.obtenerPorId(pedido.id)).resolves.toEqual(pedido)
    expect(prisma.pedido.findUnique).toHaveBeenCalledWith({ where: { id: pedido.id } })
  })

  it("lanza PedidoNoExisteError cuando no existe", async () => {
    vi.mocked(prisma.pedido.findUnique).mockResolvedValue(null)

    await expect(pedidosService.obtenerPorId(999)).rejects.toBeInstanceOf(PedidoNoExisteError)
  })
})

describe("PedidoService.registrar", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(prisma.cliente.findUnique).mockResolvedValue({ id: 1 } as never)
    vi.mocked(prisma.proveedor.findUnique).mockResolvedValue({ id: 2 } as never)
  })

  it("valida las relaciones y crea el pedido", async () => {
    vi.mocked(prisma.pedido.create).mockResolvedValue(pedido)

    await expect(pedidosService.registrar(pedidoInput)).resolves.toEqual(pedido)
    expect(prisma.pedido.create).toHaveBeenCalledWith({ data: pedidoInput })
  })

  it("lanza ClientePedidoNoExisteError si el cliente no existe", async () => {
    vi.mocked(prisma.cliente.findUnique).mockResolvedValue(null)

    await expect(pedidosService.registrar(pedidoInput)).rejects.toBeInstanceOf(ClientePedidoNoExisteError)
    expect(prisma.pedido.create).not.toHaveBeenCalled()
  })

  it("lanza ProveedorPedidoNoExisteError si el proveedor no existe", async () => {
    vi.mocked(prisma.proveedor.findUnique).mockResolvedValue(null)

    await expect(pedidosService.registrar(pedidoInput)).rejects.toBeInstanceOf(ProveedorPedidoNoExisteError)
    expect(prisma.pedido.create).not.toHaveBeenCalled()
  })
})

describe("PedidoService.actualizar", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(prisma.cliente.findUnique).mockResolvedValue({ id: 1 } as never)
    vi.mocked(prisma.proveedor.findUnique).mockResolvedValue({ id: 2 } as never)
  })

  it("valida las relaciones y actualiza el pedido", async () => {
    vi.mocked(prisma.pedido.update).mockResolvedValue(pedido)

    await expect(pedidosService.actualizar(pedido.id, pedidoInput)).resolves.toEqual(pedido)
    expect(prisma.pedido.update).toHaveBeenCalledWith({
      where: { id: pedido.id },
      data: pedidoInput,
    })
  })

  it("lanza PedidoNoExisteError si Prisma no encuentra el pedido", async () => {
    vi.mocked(prisma.pedido.update).mockRejectedValue(prismaError("P2025"))

    await expect(pedidosService.actualizar(999, pedidoInput)).rejects.toBeInstanceOf(PedidoNoExisteError)
  })

  it("propaga errores de Prisma no reconocidos", async () => {
    const error = prismaError("P1001")
    vi.mocked(prisma.pedido.update).mockRejectedValue(error)

    await expect(pedidosService.actualizar(pedido.id, pedidoInput)).rejects.toBe(error)
  })
})
