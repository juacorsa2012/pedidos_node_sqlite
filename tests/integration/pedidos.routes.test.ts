import { StatusCodes } from "http-status-codes"
import request from "supertest"
import { beforeEach, describe, expect, it } from "vitest"
import { app } from "../../src/app.js"
import { commonMessages } from "../../src/common/messages.js"
import { env } from "../../src/config/env.js"
import { prisma } from "../../src/lib/prisma.js"
import { pedidoMessages as Message } from "../../src/modules/pedidos/pedidos.messages.js"

const createCliente = (nombre = "CLIENTE 1") => prisma.cliente.create({ data: { nombre } })
const createProveedor = (nombre = "PROVEEDOR 1") => prisma.proveedor.create({ data: { nombre } })

const pedidoData = (clienteId: number, proveedorId: number) => ({
  unidades: 3,
  producto: "Producto de prueba",
  clienteId,
  proveedorId,
})

beforeEach(async () => {
  await prisma.pedido.deleteMany()
  await prisma.cliente.deleteMany()
  await prisma.proveedor.deleteMany()
})

describe("POST /api/pedidos", () => {
  it("registra un pedido con sus relaciones", async () => {
    const cliente = await createCliente()
    const proveedor = await createProveedor()
    const body = { ...pedidoData(cliente.id, proveedor.id), solicitadoPor: "Ana" }

    const response = await request(app).post("/api/pedidos").send(body)

    expect(response.status).toBe(StatusCodes.CREATED)
    expect(response.body.success).toBe(true)
    expect(response.body.message).toBe(Message.pedidoRegistrado)
    expect(response.body.data).toMatchObject(body)
    expect(await prisma.pedido.count()).toBe(1)
  })

  it.each([
    ["unidades", { unidades: 0 }],
    ["producto", { producto: " " }],
  ])("devuelve 400 si %s no es válido", async (_field, override) => {
    const cliente = await createCliente()
    const proveedor = await createProveedor()
    const response = await request(app)
      .post("/api/pedidos")
      .send({ ...pedidoData(cliente.id, proveedor.id), ...override })

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(commonMessages.errorValidacion)
  })

  it("devuelve 404 si el cliente no existe", async () => {
    const proveedor = await createProveedor()
    const response = await request(app).post("/api/pedidos").send(pedidoData(999, proveedor.id))

    expect(response.status).toBe(StatusCodes.NOT_FOUND)
    expect(response.body.message).toBe(Message.clienteNoExiste)
  })

  it("devuelve 404 si el proveedor no existe", async () => {
    const cliente = await createCliente()
    const response = await request(app).post("/api/pedidos").send(pedidoData(cliente.id, 999))

    expect(response.status).toBe(StatusCodes.NOT_FOUND)
    expect(response.body.message).toBe(Message.proveedorNoExiste)
  })
})

describe("GET /api/pedidos", () => {
  it("devuelve la página de pedidos y filtra por cliente y proveedor", async () => {
    const cliente = await createCliente()
    const otroCliente = await createCliente("CLIENTE 2")
    const proveedor = await createProveedor()
    await prisma.pedido.create({ data: pedidoData(cliente.id, proveedor.id) })
    await prisma.pedido.create({ data: pedidoData(otroCliente.id, proveedor.id) })

    const response = await request(app)
      .get(`/api/pedidos?page=1&pageSize=10&clienteId=${cliente.id}&proveedorId=${proveedor.id}`)

    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0]).toMatchObject({ clienteId: cliente.id, proveedorId: proveedor.id })
    expect(response.body.pagination).toMatchObject({
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    })
  })

  it("devuelve 400 si pageSize supera el máximo configurado", async () => {
    const response = await request(app)
      .get(`/api/pedidos?page=1&pageSize=${env.PAGE_SIZE_MAX + 1}`)

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body.message).toBe(commonMessages.errorValidacion)
    expect(response.body.errors).toContainEqual(expect.objectContaining({ field: "pageSize" }))
  })
})

describe("GET /api/pedidos/:id", () => {
  it("devuelve el pedido solicitado", async () => {
    const cliente = await createCliente()
    const proveedor = await createProveedor()
    const pedido = await prisma.pedido.create({ data: pedidoData(cliente.id, proveedor.id) })

    const response = await request(app).get(`/api/pedidos/${pedido.id}`)

    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body.data.id).toBe(pedido.id)
    expect(response.body.data.clienteId).toBe(cliente.id)
  })

  it("devuelve 404 si el pedido no existe", async () => {
    const response = await request(app).get("/api/pedidos/999")

    expect(response.status).toBe(StatusCodes.NOT_FOUND)
    expect(response.body.message).toBe(Message.pedidoNoExiste)
  })

  it("devuelve 400 si el ID no es válido", async () => {
    const response = await request(app).get("/api/pedidos/abc")

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body.message).toBe(commonMessages.errorValidacion)
  })
})

describe("PUT /api/pedidos/:id", () => {
  it("actualiza el pedido", async () => {
    const cliente = await createCliente()
    const proveedor = await createProveedor()
    const pedido = await prisma.pedido.create({ data: pedidoData(cliente.id, proveedor.id) })
    const body = { ...pedidoData(cliente.id, proveedor.id), unidades: 8 }

    const response = await request(app).put(`/api/pedidos/${pedido.id}`).send(body)

    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body.data).toMatchObject(body)
    expect(response.body.message).toBe(Message.pedidoActualizado)
  })

  it("devuelve 404 si el pedido no existe", async () => {
    const cliente = await createCliente()
    const proveedor = await createProveedor()

    const response = await request(app)
      .put("/api/pedidos/999")
      .send(pedidoData(cliente.id, proveedor.id))

    expect(response.status).toBe(StatusCodes.NOT_FOUND)
    expect(response.body.message).toBe(Message.pedidoNoExiste)
  })
})
