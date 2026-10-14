const url = process.env.LOAD_TEST_URL ?? "http://localhost:3000/health"
const requestCount = 100
const startedAt = performance.now()

const results = await Promise.all(
  Array.from({ length: requestCount }, async (_, index) => {
    try {
      const response = await fetch(url)
      return { request: index + 1, status: response.status, ok: response.ok }
    } catch (error) {
      return { request: index + 1, ok: false, error: String(error) }
    }
  }),
)

const elapsedMs = Math.round(performance.now() - startedAt)
const succeeded = results.filter((result) => result.ok).length
const failed = requestCount - succeeded

console.log(`URL: ${url}`)
console.log(`Solicitudes: ${requestCount}`)
console.log(`Correctas: ${succeeded}`)
console.log(`Fallidas: ${failed}`)
console.log(`Duración: ${elapsedMs} ms`)

if (failed > 0) {
  console.error(results.filter((result) => !result.ok))
  process.exitCode = 1
}
