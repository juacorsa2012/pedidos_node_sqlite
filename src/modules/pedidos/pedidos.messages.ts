export const pedidoMessages = {
  unidadesRequeridas: "Las unidades deben ser un entero positivo",
  productoRequerido: "El producto es obligatorio",
  proveedorIdRequerido: "El ID del proveedor debe ser un entero positivo",
  clienteIdRequerido: "El ID del cliente debe ser un entero positivo",
  pageSizeExcedido: (maxPageSize: number) => `El tamaño de página no puede superar ${maxPageSize}`,
  pedidoNoExiste: "El pedido no existe",
  clienteNoExiste: "El cliente indicado no existe",
  proveedorNoExiste: "El proveedor indicado no existe",
  pedidoRegistrado: "Pedido registrado con éxito",
  pedidoActualizado: "Pedido actualizado con éxito",
} as const
