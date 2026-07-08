import { describe, it, expect } from "vitest"
import { cn } from "@/lib/utils"
import { isValidStellarAddress } from "@/lib/vault"

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2")
  })

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible")
  })

  it("merges tailwind classes correctly", () => {
    expect(cn("px-4", "px-6")).toBe("px-6")
  })
})

describe("isValidStellarAddress", () => {
  it("accepts valid G addresses", () => {
    expect(isValidStellarAddress("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF")).toBe(true)
  })

  it("rejects invalid addresses", () => {
    expect(isValidStellarAddress("")).toBe(false)
    expect(isValidStellarAddress("not-a-valid-address")).toBe(false)
    expect(isValidStellarAddress("CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB5")).toBe(false)
  })

  it("rejects wrong length", () => {
    expect(isValidStellarAddress("G123")).toBe(false)
  })
})
