# API de Gestión de Pedidos

API REST desarrollada con **Node.js, TypeScript, Express y Prisma**, orientada a la gestión de clientes, proveedores y pedidos.

El proyecto está planteado siguiendo una estructura modular y separando responsabilidades entre configuración, utilidades, middlewares y módulos de negocio.

## 🚀 Tecnologías

* **Node.js**
* **TypeScript**
* **Express 5**
* **Prisma 7**
* **SQLite**
* **Zod**
* **Vitest**
* **Pino**
* **HTTP Status Codes**

## 📁 Estructura del proyecto

```text
src/
├── common/
│   └── utils/
│       ├── response.ts
│       └── ...
│
├── config/
│   ├── env.ts
│   └── logger.ts
│
├── lib/
│   └── prisma.ts
│
├── middlewares/
│   └── error-handler.ts
│
├── modules/
│   ├── clientes/
│   │   ├── clientes.controller.ts
│   │   ├── clientes.errors.ts
│   │   ├── clientes.messages.ts
│   │   ├── clientes.routes.ts
│   │   ├── clientes.schemas.ts
│   │   └── clientes.service.ts
│   │
│   └── proveedores/
│       ├── proveedores.controller.ts
│       ├── proveedores.errors.ts
│       ├── proveedores.messages.ts
│       ├── proveedores.routes.ts
│       ├── proveedores.schemas.ts
│       └── proveedores.service.ts
│
├── app.ts
└── index.ts

tests/
├── unit/
│   ├── clientes.service.test.ts
│   └── proveedores.service.test.ts
```

La organización por módulos permite mantener juntas las funcionalidades relacionadas con cada entidad de negocio.

## ⚙️ Requisitos

Necesitas tener instalado:

* Node.js
* npm

Puedes comprobar las versiones con:

```bash
node --version
npm --version
```

## 📦 Instalación

Clona el repositorio:

```bash
git clone https://github.com/juacorsa2012/pedidos_node_sqlite.git
```

Accede al proyecto:

```bash
cd pedidos_node_sqlite
```

Instala las dependencias:

```bash
npm install
```

## 🔐 Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
PORT=3000
DATABASE_URL="file:./dev.db"
NODE_ENV=development
```

Las variables de entorno se validan mediante **Zod** al iniciar la aplicación.

## 🗄️ Base de datos

El proyecto utiliza **Prisma ORM** con SQLite.

Para generar el cliente de Prisma:

```bash
npm run db:generate
```

Para ejecutar las migraciones:

```bash
npm run db:migrate
```

## ▶️ Ejecutar el proyecto

Modo desarrollo:

```bash
npm run dev
```

La API estará disponible en:

```text
http://localhost:3000
```

También puedes comprobar el estado de la API mediante:

```text
GET /health
```

Respuesta aproximada:

```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "data": {
    "uptime": 12.34,
    "timestamp": "2026-10-07T..."
  }
}
```

## 📚 Endpoints

### Clientes

| Método | Endpoint            | Descripción                |
| ------ | ------------------- | -------------------------- |
| GET    | `/api/clientes`     | Obtener todos los clientes |
| GET    | `/api/clientes/:id` | Obtener un cliente por ID  |
| POST   | `/api/clientes`     | Registrar un cliente       |
| PATCH  | `/api/clientes/:id` | Actualizar un cliente      |

### Proveedores

| Método | Endpoint               | Descripción                   |
| ------ | ---------------------- | ----------------------------- |
| GET    | `/api/proveedores`     | Obtener todos los proveedores |
| GET    | `/api/proveedores/:id` | Obtener un proveedor por ID   |
| POST   | `/api/proveedores`     | Registrar un proveedor        |
| PATCH  | `/api/proveedores/:id` | Actualizar un proveedor       |

## 🧪 Tests

Los tests unitarios se realizan con **Vitest**.

Para ejecutar todos los tests:

```bash
npm test
```

Para ejecutar Vitest en modo watch:

```bash
npm run test:watch
```

Para comprobar los tipos de TypeScript:

```bash
npm run typecheck
```

### ¿Qué se está probando?

Los tests de los servicios comprueban principalmente:

* Operaciones correctas con Prisma.
* Obtención de registros.
* Creación de clientes y proveedores.
* Actualización de registros.
* Comprobación de los parámetros enviados a Prisma.
* Conversión de errores de Prisma a errores de dominio.
* `P2002` → entidad duplicada.
* `P2025` → entidad inexistente.

Los servicios utilizan mocks de Prisma, por lo que estos tests no necesitan acceder a la base de datos real.

## 🧱 Arquitectura

El proyecto utiliza una separación sencilla de responsabilidades:

```text
HTTP Request
     │
     ▼
  Routes
     │
     ▼
Controller
     │
     ▼
  Service
     │
     ▼
   Prisma
     │
     ▼
  SQLite
```

### Routes

Definen los endpoints disponibles y conectan cada ruta con su controlador.

### Controllers

Gestionan la comunicación HTTP:

* reciben `Request`
* validan los datos
* llaman al servicio
* generan la respuesta HTTP

### Services

Contienen la lógica de negocio.

Por ejemplo, `ClienteService` se encarga de:

* obtener clientes
* buscar un cliente por ID
* registrar clientes
* actualizar clientes
* traducir determinados errores de Prisma a errores de dominio

### Schemas

Los schemas de **Zod** se utilizan para validar y normalizar los datos recibidos.

Por ejemplo:

```text
" cliente 1 "
      ↓
   Zod
      ↓
"CLIENTE 1"
```

### Errors

Cada módulo mantiene sus propios errores de dominio.

Por ejemplo:

```text
ClienteYaExisteError
ClienteNoExisteError

ProveedorYaExisteError
ProveedorNoExisteError
```

Esto evita depender directamente de errores específicos de Prisma en las capas superiores.

## 🛡️ Gestión de errores

Los errores de negocio se convierten en respuestas HTTP apropiadas mediante el middleware global de errores.

Por ejemplo:

```text
Prisma P2002
     ↓
ClienteYaExisteError
     ↓
HTTP 409 Conflict
```

Y:

```text
Prisma P2025
     ↓
ClienteNoExisteError
     ↓
HTTP 404 Not Found
```

## 📝 Respuestas de la API

Las respuestas utilizan un formato común:

```json
{
  "success": true,
  "message": "Cliente registrado correctamente",
  "data": {
    "id": 1,
    "nombre": "CLIENTE 1"
  }
}
```

En caso de error:

```json
{
  "success": false,
  "message": "El cliente no existe",
  "data": null
}
```

## 📜 Scripts disponibles

```bash
npm run dev
```

Inicia el servidor en modo desarrollo.

```bash
npm run build
```

Compila el proyecto TypeScript.

```bash
npm start
```

Inicia la aplicación compilada.

```bash
npm test
```

Ejecuta los tests.

```bash
npm run test:watch
```

Ejecuta Vitest en modo watch.

```bash
npm run typecheck
```

Comprueba los tipos de TypeScript sin generar archivos JavaScript.

```bash
npm run db:migrate
```

Ejecuta las migraciones de Prisma.

```bash
npm run db:generate
```

Genera el cliente de Prisma.

## 🎯 Objetivo del proyecto

Este proyecto está desarrollado como una aplicación práctica para aprender y aplicar buenas prácticas en el desarrollo de APIs REST con TypeScript.

Los principales objetivos son:

* Aplicar una arquitectura modular.
* Separar responsabilidades.
* Utilizar TypeScript con tipado estricto.
* Validar entradas con Zod.
* Utilizar Prisma como ORM.
* Gestionar errores de forma centralizada.
* Escribir tests unitarios con Vitest.
* Mantener un código sencillo y fácil de mantener.

## 📌 Próximos pasos

Entre las funcionalidades previstas se encuentran:

* Gestión de pedidos.
* Tests de integración con Supertest.
* Tests de los controladores.
* Mejoras en la cobertura de tests.
* Documentación de la API.
* Posible integración con PostgreSQL.

## 📄 Licencia

Este proyecto es de carácter educativo y de aprendizaje.
