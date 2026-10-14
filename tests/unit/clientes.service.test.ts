import { beforeEach, describe, expect, it, vi } from "vitest"
import { Prisma } from '../../generated/prisma/client.js'
import { prisma } from "../../src/lib/prisma.js"
import { ClienteNoExisteError, ClienteYaExisteError } from "../../src/modules/clientes/clientes.errors.js"
import clienteService from "../../src/modules/clientes/clientes.service.js"

const prismaError = (code: string, message = "Prisma error") =>
  new Prisma.PrismaClientKnownRequestError(message, {
    code,
    clientVersion: "7.10.0",
  })

vi.mock("../../src/lib/prisma.js", () => ({
  prisma: {
    cliente: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn()
    },
    $transaction: vi.fn(),
  },
}))

describe("ClienteService.registrar", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("debería registrar un cliente correctamente", async () => {
    const cliente = { id: 1, nombre: "CLIENTE 1", createdAt: new Date(), updatedAt: new Date() }

    vi.mocked(prisma.cliente.create).mockResolvedValue(cliente)

    const resultado = await clienteService.registrar({ nombre: "CLIENTE 1" })

    expect(resultado).toEqual(cliente)

    expect(prisma.cliente.create).toHaveBeenCalledWith({
      data: {
        nombre: "CLIENTE 1",
      },
    })
  })

  it("debería lanzar ClienteYaExisteError si el cliente ya existe", async () => {
    const error = prismaError("P2002", "Unique constraint failed")

    vi.mocked(prisma.cliente.create).mockRejectedValue(error)

    await expect(clienteService.registrar({ nombre: "CLIENTE 1" })).rejects.toBeInstanceOf(ClienteYaExisteError)
  })

  it("debería propagar errores de Prisma distintos de P2002", async () => {
    const error = prismaError("P1001", "Database unavailable")
    vi.mocked(prisma.cliente.create).mockRejectedValue(error)

    await expect(clienteService.registrar({ nombre: "CLIENTE 1" })).rejects.toBe(error)
  })
})


describe("ClienteService.obtenerPorId", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("debería devolver el cliente si existe el cliente", async () => {
    const cliente = { id: 1, nombre: "CLIENTE 1", createdAt: new Date(), updatedAt: new Date() }

    // Prisma encuentra el cliente
    vi.mocked(prisma.cliente.findUnique).mockResolvedValue(cliente)

    const resultado = await clienteService.obtenerPorId(1)

    expect(resultado).toEqual(cliente)

    expect(prisma.cliente.findUnique).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
    })
  })

  it("debería lanzar ClienteNoExisteError si no existe el cliente", async () => {
    // Configura el mock para que siempre devuelva una Promise resuelta con null
    // Equivale a hacer: Promise.resolve(null)
    vi.mocked(prisma.cliente.findUnique).mockResolvedValue(null)
    
    await expect(clienteService.obtenerPorId(999999))
      .rejects
      .toBeInstanceOf(ClienteNoExisteError)
  })
})


describe("ClienteService.obtenerTodos", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("debería devolver una página y el total de clientes", async () => {
    const clientes = [
      { id: 1, nombre: "CLIENTE 1", createdAt: new Date(), updatedAt: new Date() },
      { id: 2, nombre: "CLIENTE 2", createdAt: new Date(), updatedAt: new Date() },
    ]
    vi.mocked(prisma.$transaction).mockResolvedValue([clientes, 12] as never)

    const resultado = await clienteService.obtenerTodos({ page: 2, pageSize: 2 })

    expect(resultado).toEqual({
      data: clientes,
      pagination: {
        page: 2,
        pageSize: 2,
        total: 12,
        totalPages: 6,
      },
    })

    expect(prisma.cliente.findMany).toHaveBeenCalledWith({
      orderBy: { nombre: "asc" },
      skip: 2,
      take: 2,
    })
    expect(prisma.cliente.count).toHaveBeenCalledOnce()
  })

  it("debería devolver un array vacío si no hay clientes", async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([[], 0] as never)

    const resultado = await clienteService.obtenerTodos({ page: 1, pageSize: 10 })

    expect(resultado).toEqual({
      data: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      },
    })
  })
})

describe("ClienteService.actualizar", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("debería actualizar un cliente existente", async () => {
    const clienteActualizado = { id: 1, nombre: "CLIENTE ACTUALIZADO", createdAt: new Date(), updatedAt: new Date() }

    // Primero simulamos que Prisma actualiza correctamente:
    vi.mocked(prisma.cliente.update).mockResolvedValue(clienteActualizado)

    const resultado = await clienteService.actualizar(
      1,
      { nombre: "CLIENTE ACTUALIZADO" }
    )

    expect(resultado).toEqual(clienteActualizado)

    expect(prisma.cliente.update).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
      data: {
        nombre: "CLIENTE ACTUALIZADO",
      },
    })
  })

  it("debería lanzar ClienteNoExisteError si el cliente no existe", async () => {
    const error = prismaError("P2025", "Record not found")

    vi.mocked(prisma.cliente.update).mockRejectedValue(error)

    await expect(
      clienteService.actualizar(
        999,
        { nombre: "CLIENTE ACTUALIZADO" }
      )
    ).rejects.toBeInstanceOf(ClienteNoExisteError)
  })

  it("debería lanzar ClienteYaExisteError si se actualiza con un nombre duplicado", async () => {
    const error = prismaError("P2002", "Unique constraint failed")
    vi.mocked(prisma.cliente.update).mockRejectedValue(error)

    await expect(
      clienteService.actualizar(1, { nombre: "CLIENTE EXISTENTE" })
    ).rejects.toBeInstanceOf(ClienteYaExisteError)
  })

  it("debería propagar errores de Prisma inesperados", async () => {
    const error = prismaError("P1001", "Database unavailable")
    vi.mocked(prisma.cliente.update).mockRejectedValue(error)

    await expect(
      clienteService.actualizar(1, { nombre: "CLIENTE ACTUALIZADO" })
    ).rejects.toBe(error)
  })
})
