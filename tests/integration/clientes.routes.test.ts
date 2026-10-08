import { StatusCodes } from "http-status-codes"
import request from "supertest"
import { beforeEach, describe, expect, it } from "vitest"
import { app } from "../../src/app.js"
import { prisma } from "../../src/lib/prisma.js"
import { clienteMessages as Message } from "../../src/modules/clientes/clientes.messages.js"
import { commonMessages } from "../../src/common/messages.js"

describe("POST /api/clientes", () => {
  beforeEach(async () => {
    await prisma.cliente.deleteMany()
  })

  it("debería registrar un cliente correctamente", async () => {
    const nombreCliente = "CLIENTE 1"
    const response = await request(app).post("/api/clientes").send({nombre: nombreCliente })

    expect(response.status).toBe(StatusCodes.CREATED)
    expect(response.body.success).toBe(true)
    expect(response.body.data.nombre).toBe(nombreCliente)
    expect(response.body.message).toBe(Message.clienteRegistrado)
    
    const cliente = await prisma.cliente.findUnique({
      where: {
        nombre: nombreCliente
      },
    })
    
    expect(cliente).not.toBeNull()
    expect(cliente?.nombre).toBe(nombreCliente)
  })

  it("debería devolver 409 si el cliente ya existe", async () => { 
    const nombreCliente = "CLIENTE 1"

    await prisma.cliente.create({ data: { nombre: nombreCliente } }) 
    
    const response = await request(app) .post("/api/clientes") .send({ nombre: nombreCliente }) 
    
    expect(response.status).toBe(StatusCodes.CONFLICT) 
    expect(response.body.success).toBe(false) 
  })

  it("debería normalizar el nombre del cliente", async () => {
    const nombreCliente = "  cliente 2  "

    const response = await request(app).post("/api/clientes").send({ nombre: nombreCliente })

    expect(response.status).toBe(StatusCodes.CREATED)
    expect(response.body.success).toBe(true)
    expect(response.body.data.nombre).toBe("CLIENTE 2")

    const cliente = await prisma.cliente.findUnique({
      where: {
        nombre: "CLIENTE 2"
      }
    })

    expect(cliente).not.toBeNull()
    expect(cliente?.nombre).toBe("CLIENTE 2")
  })

  it("debería devolver 400 si el nombre está vacío", async () => {
    const response = await request(app).post("/api/clientes").send({ nombre: "" })

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(commonMessages.errorValidacion)    
    expect(response.body.errors[0].field).toBe("nombre")
    expect(response.body.errors[0].message).toBe(Message.nombreRequerido)  
  })  

  it("debería devolver 400 si no se proporciona el nombre", async () => {
    const response = await request(app).post("/api/clientes").send({})

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(commonMessages.errorValidacion)
  })

  it("debería devolver 400 si el nombre no es una cadena", async () => {
    const response = await request(app).post("/api/clientes").send({ nombre: 123 })

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body.success).toBe(false)  
    expect(response.body.message).toBe(commonMessages.errorValidacion)
  })

  it("debería devolver todos los clientes", async () => {
    await prisma.cliente.createMany({
      data: [
        { nombre: "CLIENTE 1" },
        { nombre: "CLIENTE 2" },
      ],
    })

    const response = await request(app).get("/api/clientes")

    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toHaveLength(2)
  })

  it("debería devolver los clientes ordenados por nombre", async () => {
    await prisma.cliente.createMany({
      data: [
        { nombre: "CLIENTE B" },
        { nombre: "CLIENTE A" },
        { nombre: "CLIENTE C" },
      ],
    })

    const response = await request(app).get("/api/clientes")

    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body.success).toBe(true)
    expect(response.body.data[0].nombre).toBe("CLIENTE A")
    expect(response.body.data[1].nombre).toBe("CLIENTE B")
    expect(response.body.data[2].nombre).toBe("CLIENTE C")
  })

  it("debería devolver una lista vacía si no existen clientes", async () => {
    const response = await request(app).get("/api/clientes")

    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toEqual([])
  })

  it("debería devolver un cliente por su id", async () => {
    const nombreCliente = "CLIENTE 1"

    const cliente = await prisma.cliente.create({
      data: {
        nombre: nombreCliente
      },
    })

    const response = await request(app).get(`/api/clientes/${cliente.id}`)

    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body.success).toBe(true)
    expect(response.body.data.id).toBe(cliente.id)
    expect(response.body.data.nombre).toBe(nombreCliente)
  })

  it("debería devolver 404 si el cliente no existe", async () => {
    const response = await request(app).get("/api/clientes/999")

    expect(response.status).toBe(StatusCodes.NOT_FOUND)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(Message.clienteNoExiste)
  })

  it("debería actualizar un cliente correctamente", async () => {
    const cliente = await prisma.cliente.create({
      data: {
        nombre: "CLIENTE 1",
      },
    })

    const response = await request(app).put(`/api/clientes/${cliente.id}`).send({ nombre: "CLIENTE ACTUALIZADO" })

    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body.success).toBe(true)
    expect(response.body.data.id).toBe(cliente.id)
    expect(response.body.data.nombre).toBe("CLIENTE ACTUALIZADO")
  })

  it("debería devolver 404 si se intenta actualizar un cliente inexistente", async () => {
    const response = await request(app).put("/api/clientes/999").send({nombre: "CLIENTE ACTUALIZADO" })

    expect(response.status).toBe(StatusCodes.NOT_FOUND)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(Message.clienteNoExiste)
  })

  it("debería devolver 409 si se actualiza con un nombre que ya existe", async () => {
    const cliente1 = await prisma.cliente.create({ data: { nombre: "CLIENTE 1" } })

    await prisma.cliente.create({ data: { nombre: "CLIENTE 2" } })

    const response = await request(app).put(`/api/clientes/${cliente1.id}`).send({ nombre: "CLIENTE 2" })

    expect(response.status).toBe(StatusCodes.CONFLICT)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(Message.clienteYaExiste)
  })

  it("debería normalizar el nombre al actualizar un cliente", async () => {
    const cliente = await prisma.cliente.create({ data: { nombre: "CLIENTE 1" } })

    const response = await request(app).put(`/api/clientes/${cliente.id}`).send({ nombre: "  cliente actualizado  " })

    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body.success).toBe(true)
    expect(response.body.data.nombre).toBe("CLIENTE ACTUALIZADO")

    const clienteActualizado = await prisma.cliente.findUnique({
      where: {
        id: cliente.id,
      },
    })

    expect(clienteActualizado?.nombre).toBe("CLIENTE ACTUALIZADO")
  })

  it("debería devolver 400 si el nombre está vacío al actualizar", async () => {
    const cliente = await prisma.cliente.create({ data: { nombre: "CLIENTE 1" } })

    const response = await request(app).put(`/api/clientes/${cliente.id}`).send({ nombre: "" })

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(commonMessages.errorValidacion)
    expect(response.body.errors[0].field).toBe("nombre")
    expect(response.body.errors[0].message).toBe(Message.nombreRequerido)
  })

  it("debería devolver 400 si no se proporciona el nombre al actualizar", async () => {
    const cliente = await prisma.cliente.create({ data: { nombre: "CLIENTE 1" } })

    const response = await request(app).put(`/api/clientes/${cliente.id}`).send({})

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(commonMessages.errorValidacion)
    expect(response.body.errors[0].field).toBe("nombre")
    expect(response.body.errors[0].message).toBe(Message.nombreRequerido)
  })
})