import { beforeEach, describe, expect, it, vi } from "vitest"

import { Prisma } from "../../generated/prisma/client.js"
import proveedorService from "../../src/modules/proveedores/proveedores.service.js"
import {
  ProveedorNoExisteError,
  ProveedorYaExisteError,
} from "../../src/modules/proveedores/proveedores.errors.js"

import { prisma } from "../../src/lib/prisma.js"

vi.mock("../../src/lib/prisma.js", () => ({
  prisma: {
    proveedor: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}))


describe("ProveedorService.obtenerTodos", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("debería devolver todos los proveedores ordenados por nombre", async () => {
    const proveedores = [
      {
        id: 1,
        nombre: "PROVEEDOR 1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        nombre: "PROVEEDOR 2",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    vi.mocked(prisma.proveedor.findMany).mockResolvedValue(proveedores)

    const resultado = await proveedorService.obtenerTodos()

    expect(resultado).toEqual(proveedores)

    expect(prisma.proveedor.findMany).toHaveBeenCalledWith({
      orderBy: {
        nombre: "asc",
      },
    })
  })
})


describe("ProveedorService.obtenerPorId", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("debería devolver el proveedor si existe", async () => {
    const proveedor = {
      id: 1,
      nombre: "PROVEEDOR 1",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(prisma.proveedor.findUnique).mockResolvedValue(proveedor)

    const resultado = await proveedorService.obtenerPorId(1)

    expect(resultado).toEqual(proveedor)

    expect(prisma.proveedor.findUnique).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
    })
  })

  it("debería lanzar ProveedorNoExisteError si no existe", async () => {
    vi.mocked(prisma.proveedor.findUnique).mockResolvedValue(null)

    await expect(
      proveedorService.obtenerPorId(999)
    ).rejects.toBeInstanceOf(ProveedorNoExisteError)
  })
})


describe("ProveedorService.registrar", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("debería registrar un proveedor correctamente", async () => {
    const proveedor = {
      id: 1,
      nombre: "PROVEEDOR 1",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(prisma.proveedor.create).mockResolvedValue(proveedor)

    const resultado = await proveedorService.registrar({
      nombre: "PROVEEDOR 1",
    })

    expect(resultado).toEqual(proveedor)

    expect(prisma.proveedor.create).toHaveBeenCalledWith({
      data: {
        nombre: "PROVEEDOR 1",
      },
    })
  })

  it("debería lanzar ProveedorYaExisteError si el proveedor ya existe", async () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      {
        code: "P2002",
        clientVersion: "7.10.0",
      }
    )

    vi.mocked(prisma.proveedor.create).mockRejectedValue(error)

    await expect(
      proveedorService.registrar({
        nombre: "PROVEEDOR 1",
      })
    ).rejects.toBeInstanceOf(ProveedorYaExisteError)
  })
})


describe("ProveedorService.actualizar", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("debería actualizar un proveedor existente", async () => {
    const proveedorActualizado = {
      id: 1,
      nombre: "PROVEEDOR ACTUALIZADO",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(prisma.proveedor.update).mockResolvedValue(
      proveedorActualizado
    )

    const resultado = await proveedorService.actualizar(
      1,
      {
        nombre: "PROVEEDOR ACTUALIZADO",
      }
    )

    expect(resultado).toEqual(proveedorActualizado)

    expect(prisma.proveedor.update).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
      data: {
        nombre: "PROVEEDOR ACTUALIZADO",
      },
    })
  })

  it("debería lanzar ProveedorYaExisteError si el nuevo nombre ya existe", async () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      {
        code: "P2002",
        clientVersion: "7.10.0",
      }
    )

    vi.mocked(prisma.proveedor.update).mockRejectedValue(error)

    await expect(
      proveedorService.actualizar(
        1,
        {
          nombre: "PROVEEDOR EXISTENTE",
        }
      )
    ).rejects.toBeInstanceOf(ProveedorYaExisteError)
  })

  it("debería lanzar ProveedorNoExisteError si el proveedor no existe", async () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      "Record not found",
      {
        code: "P2025",
        clientVersion: "7.10.0",
      }
    )

    vi.mocked(prisma.proveedor.update).mockRejectedValue(error)

    await expect(
      proveedorService.actualizar(
        999,
        {
          nombre: "PROVEEDOR ACTUALIZADO",
        }
      )
    ).rejects.toBeInstanceOf(ProveedorNoExisteError)
  })
})