import { beforeEach, describe, expect, it, vi } from "vitest"
import { Prisma } from '../../generated/prisma/client.js'
import { prisma } from "../../src/lib/prisma.js"
import { ClienteNoExisteError, ClienteYaExisteError } from "../../src/modules/clientes/clientes.errors.js"
import clienteService from "../../src/modules/clientes/clientes.service.js"

vi.mock("../../src/lib/prisma.js", () => ({
  prisma: {
    cliente: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn()
    },
  },
}))

describe("ClienteService.registrar", () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
    const error = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      {
        code: "P2002",
        clientVersion: "7.10.0",
      }
    )

    vi.mocked(prisma.cliente.create).mockRejectedValue(error)

    await expect(clienteService.registrar({ nombre: "CLIENTE 1" })).rejects.toBeInstanceOf(ClienteYaExisteError)
  })





})


describe("ClienteService.obtenerPorId", () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
    vi.clearAllMocks()
  })

  it("debería devolver todos los clientes ordenados por nombre", async () => {
    const clientes = [
      { id: 1, nombre: "CLIENTE 1", createdAt: new Date(), updatedAt: new Date() },
      { id: 2, nombre: "CLIENTE 2", createdAt: new Date(), updatedAt: new Date() },
    ]
    
    vi.mocked(prisma.cliente.findMany).mockResolvedValue(clientes)

    const resultado = await clienteService.obtenerTodos()

    expect(resultado).toEqual(clientes)

    expect(prisma.cliente.findMany).toHaveBeenCalledWith({
      orderBy: {
        nombre: "asc",
      },
    })
  })  

  it("debería devolver un array vacío si no hay clientes", async () => {
    vi.mocked(prisma.cliente.findMany).mockResolvedValue([])

    const resultado = await clienteService.obtenerTodos()

    expect(resultado).toEqual([])
    expect(prisma.cliente.findMany).toHaveBeenCalledWith({
      orderBy: { nombre: "asc" },
    })
  })
})

describe("ClienteService.actualizar", () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
    const error = new Prisma.PrismaClientKnownRequestError(
      "Record not found",
      {
        code: "P2025",
        clientVersion: "7.10.0",
      }
    )

    vi.mocked(prisma.cliente.update).mockRejectedValue(error)

    await expect(
      clienteService.actualizar(
        999,
        { nombre: "CLIENTE ACTUALIZADO" }
      )
    ).rejects.toBeInstanceOf(ClienteNoExisteError)
  })
})