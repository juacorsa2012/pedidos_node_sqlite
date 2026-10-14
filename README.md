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
│   ├── errors/
│   │   └── custom-errors.ts
│   ├── messages.ts
│   └── utils/
│       ├── response.ts
│       └── uptime.ts
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
│   ├── pedidos/
│   │   ├── pedidos.controller.ts
│   │   ├── pedidos.errors.ts
│   │   ├── pedidos.messages.ts
│   │   ├── pedidos.routes.ts
│   │   ├── pedidos.schemas.ts
│   │   └── pedidos.service.ts
│   │
│   └── proveedores/
│       ├── proveedores.controller.ts
│       ├── proveedores.errors.ts
│       ├── proveedores.messages.ts
│       ├── proveedores.routes.ts
│       ├── proveedores.schemas.ts
│       └── proveedores.service.ts
│
├── server.ts
└── app.ts

tests/
├── unit/
│   ├── clientes.service.test.ts
│   ├── pedidos.service.test.ts
│   └── proveedores.service.test.ts
└── integration/
    ├── clientes.routes.test.ts
    ├── pedidos.routes.test.ts
    └── proveedores.routes.test.ts
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
PAGE_SIZE_MAX=100
```

Las variables de entorno se validan mediante **Zod** al iniciar la aplicación. `PAGE_SIZE_MAX` establece el tamaño máximo de página para clientes, proveedores y pedidos.

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
  "status": "OK",
  "message": "API funcionando correctamente",
  "uptime": "12s",
  "timestamp": "2026-10-14T..."
}
```

## 📚 Endpoints

### Clientes

| Método | Endpoint | Descripción |
| ------ | -------- | ----------- |
| GET | `/api/clientes?page=1&pageSize=10` | Obtener una página de clientes |
| GET | `/api/clientes/:id` | Obtener un cliente por ID |
| POST | `/api/clientes` | Registrar un cliente |
| PUT | `/api/clientes/:id` | Actualizar un cliente |

### Proveedores

| Método | Endpoint | Descripción |
| ------ | -------- | ----------- |
| GET | `/api/proveedores?page=1&pageSize=10` | Obtener una página de proveedores |
| GET | `/api/proveedores/:id` | Obtener un proveedor por ID |
| POST | `/api/proveedores` | Registrar un proveedor |
| PUT | `/api/proveedores/:id` | Actualizar un proveedor |

### Pedidos

| Método | Endpoint | Descripción |
| ------ | -------- | ----------- |
| GET | `/api/pedidos?page=1&pageSize=10` | Obtener una página de pedidos |
| GET | `/api/pedidos?page=1&pageSize=10&clienteId=1` | Filtrar pedidos por cliente |
| GET | `/api/pedidos?page=1&pageSize=10&proveedorId=1` | Filtrar pedidos por proveedor |
| GET | `/api/pedidos/:id` | Obtener un pedido por ID |
| POST | `/api/pedidos` | Registrar un pedido |
| PUT | `/api/pedidos/:id` | Actualizar un pedido |

Los listados requieren `page` y `pageSize`. El tamaño no puede superar `PAGE_SIZE_MAX`. Las respuestas incluyen los datos y los metadatos de paginación (`page`, `pageSize`, `total` y `totalPages`).

Los cuerpos de creación y actualización de pedidos aceptan `unidades`, `producto`, `clienteId` y `proveedorId`; `oferta`, `solicitadoPor` y `observaciones` son opcionales y aceptan `null`.

No hay endpoints para eliminar proveedores ni pedidos.

## 🧪 Tests

Los tests unitarios y de integración se realizan con **Vitest**. Los tests unitarios cubren los servicios de los tres módulos; los de integración ejercitan las rutas HTTP de clientes, proveedores y pedidos con la base de datos de test.

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

Los tests unitarios de los servicios comprueban principalmente:

* Operaciones correctas con Prisma.
* Obtención de registros.
* Creación y actualización de clientes y proveedores.
* Comprobación de los parámetros enviados a Prisma.
* Conversión de errores de Prisma a errores de dominio.
* `P2002` → entidad duplicada.
* `P2025` → entidad inexistente.

Los servicios utilizan mocks de Prisma, por lo que estos tests no necesitan acceder a la base de datos real.

Los archivos de test se ejecutan en serie porque las pruebas de integración comparten la misma base de datos SQLite.

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

Los servicios se encargan de:

* realizar las operaciones de negocio de cada módulo
* consultar y modificar datos mediante Prisma
* traducir errores conocidos de persistencia a errores de dominio

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

PedidoNoExisteError
ClientePedidoNoExisteError
ProveedorPedidoNoExisteError
```

Esto evita depender directamente de errores específicos de Prisma en las capas superiores.

Los pedidos requieren que existan tanto el cliente como el proveedor asociados. La base de datos también define claves foráneas para esas relaciones.

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
  "message": "Cliente registrado con éxito",
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
  "message": "El cliente no existe"
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
* Escribir tests unitarios y de integración con Vitest.
* Mantener un código sencillo y fácil de mantener.

## 📌 Próximos pasos

Mejoras previstas:

* Tests de los controladores.
* Mejoras en la cobertura de tests.
* Posible integración con PostgreSQL.

## 📄 Licencia

Este proyecto es de carácter educativo y de aprendizaje.
