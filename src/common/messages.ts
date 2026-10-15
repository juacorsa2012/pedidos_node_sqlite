export const commonMessages = {
  errorValidacion: "Error de validación",
  errorInternoServidor: "Error interno del servidor",
  cuerpoSolicitudInvalido: "El cuerpo de la solicitud no tiene un formato válido",
  cuerpoSolicitudDemasiadoGrande: "El cuerpo de la solicitud supera el tamaño permitido",
  solicitudInterrumpida: "La solicitud se interrumpió antes de recibir el cuerpo completo",
  tamanoSolicitudInvalido: "El tamaño declarado de la solicitud no es válido",
  demasiadosParametros: "La solicitud contiene demasiados parámetros",
  charsetNoSoportado: "La codificación del cuerpo de la solicitud no está soportada",
  encodingNoSoportado: "La codificación del contenido de la solicitud no está soportada",  
  demasiadasSolicitudes: "Demasiadas solicitudes. Inténtalo de nuevo más tarde.",
  apiFuncionando: "API funcionando correctamente",
  jwtSecretCorto: "JWT_SECRET debe tener al menos 43 caracteres"
} as const
