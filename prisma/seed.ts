import { env } from "../src/config/env.js"
import { prisma } from "../src/lib/prisma.js"

const NUM_CLIENTES = 100
const NUM_PROVEEDORES = 10
const NUM_PEDIDOS = 2000

const clienteNombres = Array.from(
  { length: NUM_CLIENTES },
  (_, index) => `CLIENTE ${String(index + 1).padStart(3, "0")}`,
)

const proveedorNombres = Array.from(
  { length: NUM_PROVEEDORES },
  (_, index) => `PROVEEDOR ${String(index + 1).padStart(2, "0")}`,
)

async function main() {
  if (env.NODE_ENV === "production") {
    throw new Error("El seed de datos de demostración no se puede ejecutar en producción")
  }

  const clientes = []
  for (const nombre of clienteNombres) {
    clientes.push(await prisma.cliente.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    }))
  }

  const proveedores = []
  for (const nombre of proveedorNombres) {
    proveedores.push(await prisma.proveedor.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    }))
  }

  for (let index = 0; index < NUM_PEDIDOS; index += 1) {
    const marker = `[SEED] Pedido de demostración ${String(index + 1).padStart(2, "0")}`
    const data = {
      unidades: (index % 10) + 1,
      producto: `Producto ${String((index % 8) + 1).padStart(2, "0")}`,
      oferta: index % 3 === 0 ? "Oferta de demostración" : null,
      solicitadoPor: `Usuario ${String((index % 5) + 1).padStart(2, "0")}`,
      observaciones: marker,
      clienteId: clientes[index % clientes.length]!.id,
      proveedorId: proveedores[index % proveedores.length]!.id,
    }

    const pedidoExistente = await prisma.pedido.findFirst({
      where: { observaciones: marker },
      select: { id: true },
    })

    if (pedidoExistente) {
      await prisma.pedido.update({ where: { id: pedidoExistente.id }, data })
    } else {
      await prisma.pedido.create({ data })
    }
  }

  console.log(
    `${clienteNombres.length} clientes, ${proveedorNombres.length} proveedores y ${NUM_PEDIDOS} pedidos preparados`,
  )
}

main()
  .catch((error) => {
    console.error("Error al preparar los datos de demostración:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
