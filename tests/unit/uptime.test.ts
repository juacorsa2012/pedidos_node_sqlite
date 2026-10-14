import { describe, expect, it } from "vitest"
import { formatUptime } from "../../src/common/utils/uptime.js"

describe("formatUptime", () => {
  it.each([
    [0, "0s"],
    [12, "12s"],
    [60, "1m 0s"],
    [3_661, "1h 1m 1s"],
    [90_061, "1d 1h 1m 1s"],
  ])("formatea %i segundos como %s", (seconds, expected) => {
    expect(formatUptime(seconds)).toBe(expected)
  })
})
