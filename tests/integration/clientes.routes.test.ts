import { StatusCodes } from "http-status-codes"
import request from "supertest"
import { beforeEach, describe, expect, it } from "vitest"
import { app } from "../../src/app.js"
import { prisma } from "../../src/lib/prisma.js"
import { env } from "../../src/config/env.js"
import { commonMessages } from "../../src/common/messages.js"
import { clienteMessages as Message } from "../../src/modules/clientes/clientes.messages.js"

beforeEach(async () => {
  // Los pedidos tienen claves foráneas restrictivas hacia clientes.
  await prisma.pedido.deleteMany()
  await prisma.cliente.deleteMany()
})

describe("POST /api/clientes", () => {
  it("registra un cliente", async () => {
    const nombre = "CLIENTE 1"
    const response = await request(app).post("/api/clientes").send({ nombre })

    expect(response.status).toBe(StatusCodes.CREATED)
    expect(response.body.success).toBe(true)
    expect(response.body.data.nombre).toBe(nombre)
    expect(response.body.message).toBe(Message.clienteRegistrado)

    const cliente = await prisma.cliente.findUnique({ where: { nombre } })
    expect(cliente).not.toBeNull()
    expect(cliente?.nombre).toBe(nombre)
  })

  it("devuelve 409 y el mensaje correspondiente si el cliente ya existe", async () => {
    const nombre = "CLIENTE 1"
    await prisma.cliente.create({ data: { nombre } })

    const response = await request(app).post("/api/clientes").send({ nombre })

    expect(response.status).toBe(StatusCodes.CONFLICT)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(Message.clienteYaExiste)
  })

  it("normaliza el nombre del cliente", async () => {
    const response = await request(app)
      .post("/api/clientes")
      .send({ nombre: "  cliente 2  " })

    expect(response.status).toBe(StatusCodes.CREATED)
    expect(response.body.success).toBe(true)
    expect(response.body.data.nombre).toBe("CLIENTE 2")

    const cliente = await prisma.cliente.findUnique({ where: { nombre: "CLIENTE 2" } })
    expect(cliente?.nombre).toBe("CLIENTE 2")
  })

  it("devuelve 400 si el nombre está vacío", async () => {
    const response = await request(app).post("/api/clientes").send({ nombre: "" })

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
    const response = await request(app).post("/api/clientes").send(body)

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(commonMessages.errorValidacion)
    expect(response.body.errors).toContainEqual({
      field: "nombre",
      message: Message.nombreRequerido,
    })
  })
})

describe("GET /api/clientes", () => {
  it("devuelve todos los clientes", async () => {
    await prisma.cliente.createMany({
      data: [{ nombre: "CLIENTE 1" }, { nombre: "CLIENTE 2" }],
    })

    const response = await request(app).get("/api/clientes?page=1&pageSize=10")

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

  it("devuelve los clientes ordenados por nombre", async () => {
    await prisma.cliente.createMany({
      data: [
        { nombre: "CLIENTE B" },
        { nombre: "CLIENTE A" },
        { nombre: "CLIENTE C" },
      ],
    })

    const response = await request(app).get("/api/clientes?page=1&pageSize=10")

    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body.success).toBe(true)
    expect(response.body.data.map((cliente: { nombre: string }) => cliente.nombre))
      .toEqual(["CLIENTE A", "CLIENTE B", "CLIENTE C"])
  })

  it("devuelve una lista vacía si no hay clientes", async () => {
    const response = await request(app).get("/api/clientes?page=1&pageSize=10")

    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toEqual([])
  })

  it("devuelve 400 si pageSize supera el máximo configurado", async () => {
    const response = await request(app)
      .get(`/api/clientes?page=1&pageSize=${env.PAGE_SIZE_MAX + 1}`)

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(commonMessages.errorValidacion)
    expect(response.body.errors).toContainEqual(expect.objectContaining({ field: "pageSize" }))
  })
})

describe("GET /api/clientes/:id", () => {
  it("devuelve el cliente solicitado", async () => {
    const cliente = await prisma.cliente.create({ data: { nombre: "CLIENTE 1" } })

    const response = await request(app).get(`/api/clientes/${cliente.id}`)

    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body.success).toBe(true)
    expect(response.body.data.id).toBe(cliente.id)
    expect(response.body.data.nombre).toBe(cliente.nombre)
  })

  it("devuelve 404 si el cliente no existe", async () => {
    const response = await request(app).get("/api/clientes/999")

    expect(response.status).toBe(StatusCodes.NOT_FOUND)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(Message.clienteNoExiste)
  })

  it.each(["abc", "0", "-1", "2147483648"])(
    "devuelve 400 si el ID %s es inválido",
    async (id) => {
      const response = await request(app).get(`/api/clientes/${id}`)

      expect(response.status).toBe(StatusCodes.BAD_REQUEST)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe(commonMessages.errorValidacion)
    },
  )
})

describe("PUT /api/clientes/:id", () => {
  it("actualiza un cliente", async () => {
    const cliente = await prisma.cliente.create({ data: { nombre: "CLIENTE 1" } })

    const response = await request(app)
      .put(`/api/clientes/${cliente.id}`)
      .send({ nombre: "CLIENTE ACTUALIZADO" })

    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body.success).toBe(true)
    expect(response.body.data.id).toBe(cliente.id)
    expect(response.body.data.nombre).toBe("CLIENTE ACTUALIZADO")
  })

  it("devuelve 404 si se intenta actualizar un cliente inexistente", async () => {
    const response = await request(app)
      .put("/api/clientes/999")
      .send({ nombre: "CLIENTE ACTUALIZADO" })

    expect(response.status).toBe(StatusCodes.NOT_FOUND)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(Message.clienteNoExiste)
  })

  it("devuelve 409 si se actualiza con un nombre que ya existe", async () => {
    const cliente = await prisma.cliente.create({ data: { nombre: "CLIENTE 1" } })
    await prisma.cliente.create({ data: { nombre: "CLIENTE 2" } })

    const response = await request(app)
      .put(`/api/clientes/${cliente.id}`)
      .send({ nombre: "CLIENTE 2" })

    expect(response.status).toBe(StatusCodes.CONFLICT)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(Message.clienteYaExiste)
  })

  it("normaliza el nombre al actualizar un cliente", async () => {
    const cliente = await prisma.cliente.create({ data: { nombre: "CLIENTE 1" } })

    const response = await request(app)
      .put(`/api/clientes/${cliente.id}`)
      .send({ nombre: "  cliente actualizado  " })

    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body.success).toBe(true)
    expect(response.body.data.nombre).toBe("CLIENTE ACTUALIZADO")

    const actualizado = await prisma.cliente.findUnique({ where: { id: cliente.id } })
    expect(actualizado?.nombre).toBe("CLIENTE ACTUALIZADO")
  })

  it("devuelve 400 si el nombre está vacío", async () => {
    const cliente = await prisma.cliente.create({ data: { nombre: "CLIENTE 1" } })
    const response = await request(app)
      .put(`/api/clientes/${cliente.id}`)
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
    const cliente = await prisma.cliente.create({ data: { nombre: "CLIENTE 1" } })
    const response = await request(app).put(`/api/clientes/${cliente.id}`).send({})

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(commonMessages.errorValidacion)
    expect(response.body.errors).toContainEqual({
      field: "nombre",
      message: Message.nombreRequerido,
    })
  })

  it("devuelve 400 si el ID es inválido", async () => {
    const response = await request(app)
      .put("/api/clientes/abc")
      .send({ nombre: "CLIENTE ACTUALIZADO" })

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(commonMessages.errorValidacion)
  })
})
