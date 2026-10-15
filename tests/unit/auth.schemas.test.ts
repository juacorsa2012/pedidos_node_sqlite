import { describe, expect, it } from "vitest"
import { loginSchema, registerSchema } from "../../src/modules/auth/auth.schemas.js"
import { authMessages as Message } from "../../src/modules/auth/auth.messages.js"

describe("registerSchema", () => {
  it("recorta el nombre y normaliza el email", () => {
    const result = registerSchema.parse({
      nombre: "  Ada Lovelace  ",
      email: "  ADA@EXAMPLE.COM  ",
      password: "password123",
    })

    expect(result).toEqual({
      nombre: "Ada Lovelace",
      email: "ada@example.com",
      password: "password123",
    })
  })

  it("acepta una contraseña que ocupa exactamente 72 bytes UTF-8", () => {
    const password = "a".repeat(72)

    expect(registerSchema.safeParse({
      nombre: "Ada",
      email: "ada@example.com",
      password,
    }).success).toBe(true)
  })

  it("rechaza contraseñas que superan 72 bytes UTF-8", () => {
    const result = registerSchema.safeParse({
      nombre: "Ada",
      email: "ada@example.com",
      password: "ñ".repeat(37),
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({
        message: Message.passwordLargo,
      }))
    }
  })
})

describe("loginSchema", () => {
  it("normaliza el email antes de iniciar sesión", () => {
    expect(loginSchema.parse({
      email: "  ADA@EXAMPLE.COM  ",
      password: "password123",
    }).email).toBe("ada@example.com")
  })

  it("rechaza un email inválido y una contraseña vacía", () => {
    const result = loginSchema.safeParse({ email: "no-es-un-email", password: "" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toEqual(expect.arrayContaining([
        Message.emailIncorrecto,
        Message.passwordRequerido,
      ]))
    }
  })
})
