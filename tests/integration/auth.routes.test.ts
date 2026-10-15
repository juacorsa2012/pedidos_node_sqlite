import bcrypt from "bcrypt"
import { StatusCodes } from "http-status-codes"
import request from "supertest"
import { beforeEach, describe, expect, it } from "vitest"
import { app } from "../../src/app.js"
import { commonMessages } from "../../src/common/messages.js"
import { generarToken } from "../../src/common/utils/jwt.js"
import { prisma } from "../../src/lib/prisma.js"
import { authMessages as Message } from "../../src/modules/auth/auth.messages.js"

const datosRegistro = {
  nombre: "Ada Lovelace",
  email: "ada@example.com",
  password: "password123",
}

const crearUsuario = async (overrides: Partial<typeof datosRegistro> = {}) => {
  const datos = { ...datosRegistro, ...overrides }
  return prisma.usuario.create({
    data: {
      nombre: datos.nombre,
      email: datos.email,
      password: await bcrypt.hash(datos.password, 10),
    },
  })
}

beforeEach(async () => {
  await prisma.usuario.deleteMany()
})

describe("POST /api/auth/registrar", () => {
  it("registra al usuario, guarda el hash y devuelve un token", async () => {
    const response = await request(app).post("/api/auth/registrar").send({
      ...datosRegistro,
      email: "  ADA@EXAMPLE.COM  ",
    })

    expect(response.status).toBe(StatusCodes.CREATED)
    expect(response.body.success).toBe(true)
    expect(response.body.message).toBe(Message.usuarioRegistrado)
    expect(response.body.data.usuario).toMatchObject({
      nombre: datosRegistro.nombre,
      email: datosRegistro.email,
    })
    expect(response.body.data.token).toEqual(expect.any(String))
    expect(response.body.data.usuario).not.toHaveProperty("password")

    const usuario = await prisma.usuario.findUnique({ where: { email: datosRegistro.email } })
    expect(usuario?.password).not.toBe(datosRegistro.password)
    await expect(bcrypt.compare(datosRegistro.password, usuario!.password)).resolves.toBe(true)
  })

  it("devuelve 409 si el email ya está registrado", async () => {
    await crearUsuario()

    const response = await request(app).post("/api/auth/registrar").send(datosRegistro)

    expect(response.status).toBe(StatusCodes.CONFLICT)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(Message.usuarioYaExiste)
  })

  it("devuelve 400 si los datos no cumplen el esquema", async () => {
    const response = await request(app).post("/api/auth/registrar").send({
      ...datosRegistro,
      email: "email-invalido",
    })

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(commonMessages.errorValidacion)
    expect(response.body.errors).toContainEqual(expect.objectContaining({ field: "email" }))
  })
})

describe("POST /api/auth/iniciar-sesion", () => {
  it("autentica al usuario y devuelve un token y datos públicos", async () => {
    await crearUsuario()

    const response = await request(app)
      .post("/api/auth/iniciar-sesion")
      .send({ email: " ADA@EXAMPLE.COM ", password: datosRegistro.password })

    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body.success).toBe(true)
    expect(response.body.message).toBe(Message.usuarioLogueado)
    expect(response.body.data.usuario).toMatchObject({
      nombre: datosRegistro.nombre,
      email: datosRegistro.email,
    })
    expect(response.body.data.usuario).not.toHaveProperty("password")
    expect(response.body.data.token).toEqual(expect.any(String))
  })

  it("devuelve el mismo 401 para un email desconocido y una contraseña incorrecta", async () => {
    await crearUsuario()

    const emailDesconocido = await request(app)
      .post("/api/auth/iniciar-sesion")
      .send({ email: "desconocido@example.com", password: datosRegistro.password })
    const passwordIncorrecta = await request(app)
      .post("/api/auth/iniciar-sesion")
      .send({ email: datosRegistro.email, password: "incorrecta" })

    expect(emailDesconocido.status).toBe(StatusCodes.UNAUTHORIZED)
    expect(passwordIncorrecta.status).toBe(StatusCodes.UNAUTHORIZED)
    expect(emailDesconocido.body.message).toBe(Message.credencialesIncorrectas)
    expect(passwordIncorrecta.body.message).toBe(Message.credencialesIncorrectas)
  })
})

describe("GET /api/auth/me", () => {
  it("rechaza una solicitud sin token", async () => {
    const response = await request(app).get("/api/auth/me")

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED)
    expect(response.body.success).toBe(false)
  })

  it("rechaza una cabecera Bearer mal formada", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer token extra")

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED)
  })

  it("devuelve los datos públicos del usuario autenticado", async () => {
    const usuario = await crearUsuario()
    const token = generarToken(usuario.id)

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`)

    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toEqual({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
    })
  })
})
