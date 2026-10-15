import bcrypt from "bcrypt"
import { prisma } from "../../lib/prisma.js"
import type { LoginInput, RegisterInput } from "./auth.schemas.js"
import { generarToken } from "../../common/utils/jwt.js"
import { UsuarioYaExisteError, NoAutorizadoError } from "./auth.errors.js"

class AuthService {
  private async obtenerUsuarioPorEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email } })
  }

  async obtenerUsuarioPorId(id: number) {
    return prisma.usuario.findUnique({
      where: { id },
      select: { id: true, nombre: true, email: true }
    })
  }

  async registrar(usuario: RegisterInput) {
    const { nombre, email, password } = usuario

    const existeUsuario = await this.obtenerUsuarioPorEmail(email)

    if (existeUsuario) {
      throw new UsuarioYaExisteError()
    }

    const hashPassword = await bcrypt.hash(password, 10)

    const usuarioCreado = await prisma.usuario.create({
      data: { nombre, email, password: hashPassword },
      select: { id: true, nombre: true, email: true },
    })

    const token = generarToken(usuarioCreado.id)

    return { usuario: usuarioCreado, token }
  }

  async iniciarSesion(credenciales: LoginInput) {
    const { email, password } = credenciales
    
    const usuario = await this.obtenerUsuarioPorEmail(email)
    if (!usuario) {
      throw new NoAutorizadoError()
    }

    const passwordValido = await bcrypt.compare(password, usuario.password)
    if (!passwordValido) {
      throw new NoAutorizadoError()
    }    

    const token = generarToken(usuario.id)

    return {
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
      token,
    }
  }

}

export default new AuthService()
