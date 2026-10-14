import { StatusCodes } from "http-status-codes"
import request from "supertest"
import { beforeEach, describe, expect, it } from "vitest"
import { app } from "../../src/app.js"
import { commonMessages } from "../../src/common/messages.js"
import { env } from "../../src/config/env.js"
import { prisma } from "../../src/lib/prisma.js"
import { proveedorMessages as Message } from "../../src/modules/proveedores/proveedores.messages.js"

beforeEach(async () => {
  // Los pedidos tienen claves foráneas restrictivas hacia proveedores.
  await prisma.pedido.deleteMany()
  await prisma.proveedor.deleteMany()
})

describe("GET /api/proveedores", () => {
  it("devuelve todos los proveedores", async () => {
    await prisma.proveedor.createMany({
      data: [{ nombre: "PROVEEDOR 1" }, { nombre: "PROVEEDOR 2" }],
    })

    const response = await request(app).get("/api/proveedores?page=1&pageSize=10")

    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toHaveLength(2)
    expect(response.body.pagination).toMatchObject({
      page: 1,
      pageSize: 10,
      total: 2,
      totalPages: 1,
    })
  })

  it("devuelve los proveedores ordenados por nombre", async () => {
    await prisma.proveedor.createMany({
      data: [
        { nombre: "PROVEEDOR B" },
        { nombre: "PROVEEDOR A" },
        { nombre: "PROVEEDOR C" },
      ],
    })

    const response = await request(app).get("/api/proveedores?page=1&pageSize=10")

    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body.data.map((proveedor: { nombre: string }) => proveedor.nombre))
      .toEqual(["PROVEEDOR A", "PROVEEDOR B", "PROVEEDOR C"])
  })

  it("devuelve una lista vacía si no hay proveedores", async () => {
    const response = await request(app).get("/api/proveedores?page=1&pageSize=10")

    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toEqual([])
  })

  it("devuelve 400 si pageSize supera el máximo configurado", async () => {
    const response = await request(app)
      .get(`/api/proveedores?page=1&pageSize=${env.PAGE_SIZE_MAX + 1}`)

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(commonMessages.errorValidacion)
    expect(response.body.errors).toContainEqual(expect.objectContaining({ field: "pageSize" }))
  })
})

describe("GET /api/proveedores/:id", () => {
  it("devuelve el proveedor solicitado", async () => {
    const proveedor = await prisma.proveedor.create({ data: { nombre: "PROVEEDOR 1" } })

    const response = await request(app).get(`/api/proveedores/${proveedor.id}`)

    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body.success).toBe(true)
    expect(response.body.data.id).toBe(proveedor.id)
    expect(response.body.data.nombre).toBe(proveedor.nombre)
  })

  it("devuelve 404 si el proveedor no existe", async () => {
    const response = await request(app).get("/api/proveedores/999")

    expect(response.status).toBe(StatusCodes.NOT_FOUND)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(Message.proveedorNoExiste)
  })

  it.each(["abc", "0", "-1", "2147483648"])(
    "devuelve 400 si el ID %s es inválido",
    async (id) => {
      const response = await request(app).get(`/api/proveedores/${id}`)

      expect(response.status).toBe(StatusCodes.BAD_REQUEST)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe(commonMessages.errorValidacion)
    },
  )
})

describe("POST /api/proveedores", () => {
  it("registra un proveedor", async () => {
    const nombre = "PROVEEDOR 1"
    const response = await request(app).post("/api/proveedores").send({ nombre })

    expect(response.status).toBe(StatusCodes.CREATED)
    expect(response.body.success).toBe(true)
    expect(response.body.data.nombre).toBe(nombre)
    expect(response.body.message).toBe(Message.proveedorRegistrado)

    const proveedor = await prisma.proveedor.findUnique({ where: { nombre } })
    expect(proveedor).not.toBeNull()
  })

  it("devuelve 409 si el proveedor ya existe", async () => {
    const nombre = "PROVEEDOR 1"
    await prisma.proveedor.create({ data: { nombre } })

    const response = await request(app).post("/api/proveedores").send({ nombre })

    expect(response.status).toBe(StatusCodes.CONFLICT)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(Message.proveedorYaExiste)
  })

  it("normaliza el nombre del proveedor", async () => {
    const response = await request(app)
      .post("/api/proveedores")
      .send({ nombre: "  proveedor 2  " })

    expect(response.status).toBe(StatusCodes.CREATED)
    expect(response.body.data.nombre).toBe("PROVEEDOR 2")

    const proveedor = await prisma.proveedor.findUnique({ where: { nombre: "PROVEEDOR 2" } })
    expect(proveedor?.nombre).toBe("PROVEEDOR 2")
  })

  it("devuelve 400 si el nombre está vacío", async () => {
    const response = await request(app).post("/api/proveedores").send({ nombre: "   " })

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(commonMessages.errorValidacion)
    expect(response.body.errors).toContainEqual({
      field: "nombre",
      message: Message.nombreRequerido,
    })
  })

  it.each([
    ["no se proporciona", {}],
    ["no es una cadena", { nombre: 123 }],
  ])("devuelve 400 si el nombre %s", async (_caso, body) => {
    const response = await request(app).post("/api/proveedores").send(body)

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(commonMessages.errorValidacion)
    expect(response.body.errors[0].field).toBe("nombre")
  })
})

describe("PUT /api/proveedores/:id", () => {
  it("actualiza un proveedor", async () => {
    const proveedor = await prisma.proveedor.create({ data: { nombre: "PROVEEDOR 1" } })

    const response = await request(app)
      .put(`/api/proveedores/${proveedor.id}`)
      .send({ nombre: "PROVEEDOR ACTUALIZADO" })

    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body.success).toBe(true)
    expect(response.body.data.id).toBe(proveedor.id)
    expect(response.body.data.nombre).toBe("PROVEEDOR ACTUALIZADO")
    expect(response.body.message).toBe(Message.proveedorActualizado)
  })

  it("devuelve 404 si se intenta actualizar un proveedor inexistente", async () => {
    const response = await request(app)
      .put("/api/proveedores/999")
      .send({ nombre: "PROVEEDOR ACTUALIZADO" })

    expect(response.status).toBe(StatusCodes.NOT_FOUND)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(Message.proveedorNoExiste)
  })

  it("devuelve 409 si se actualiza con un nombre que ya existe", async () => {
    const proveedor = await prisma.proveedor.create({ data: { nombre: "PROVEEDOR 1" } })
    await prisma.proveedor.create({ data: { nombre: "PROVEEDOR 2" } })

    const response = await request(app)
      .put(`/api/proveedores/${proveedor.id}`)
      .send({ nombre: "PROVEEDOR 2" })

    expect(response.status).toBe(StatusCodes.CONFLICT)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(Message.proveedorYaExiste)
  })

  it("normaliza el nombre al actualizar un proveedor", async () => {
    const proveedor = await prisma.proveedor.create({ data: { nombre: "PROVEEDOR 1" } })

    const response = await request(app)
      .put(`/api/proveedores/${proveedor.id}`)
      .send({ nombre: "  proveedor actualizado  " })

    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body.data.nombre).toBe("PROVEEDOR ACTUALIZADO")

    const actualizado = await prisma.proveedor.findUnique({ where: { id: proveedor.id } })
    expect(actualizado?.nombre).toBe("PROVEEDOR ACTUALIZADO")
  })

  it("devuelve 400 si el nombre está vacío", async () => {
    const proveedor = await prisma.proveedor.create({ data: { nombre: "PROVEEDOR 1" } })
    const response = await request(app)
      .put(`/api/proveedores/${proveedor.id}`)
      .send({ nombre: "" })

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(commonMessages.errorValidacion)
    expect(response.body.errors).toContainEqual({
      field: "nombre",
      message: Message.nombreRequerido,
    })
  })

  it("devuelve 400 si no se proporciona el nombre", async () => {
    const proveedor = await prisma.proveedor.create({ data: { nombre: "PROVEEDOR 1" } })
    const response = await request(app).put(`/api/proveedores/${proveedor.id}`).send({})

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(commonMessages.errorValidacion)
    expect(response.body.errors[0].field).toBe("nombre")
  })

  it("devuelve 400 si el ID es inválido", async () => {
    const response = await request(app)
      .put("/api/proveedores/abc")
      .send({ nombre: "PROVEEDOR ACTUALIZADO" })

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(commonMessages.errorValidacion)
  })
})
