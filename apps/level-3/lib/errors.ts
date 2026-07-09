export type ErrorCode = "TRUSTLINE_MISSING" | "INSUFFICIENT_BALANCE" | "UNKNOWN"

export interface ParsedError {
  code: ErrorCode
  friendlyMessage: string
}

export class SorobanError extends Error {
  code: ErrorCode
  constructor(code: ErrorCode, message: string) {
    super(message)
    this.code = code
    this.name = "SorobanError"
  }
}

export function parseSorobanError(error: unknown): ParsedError {
  const errStr = String(error ?? "")

  if (errStr.includes("trustline entry is missing")) {
    return {
      code: "TRUSTLINE_MISSING",
      friendlyMessage:
        "Your account needs trustlines for both the XLM SAC and stXLM contracts before you can stake. Add both contract IDs below as trustlines via Stellar Laboratory.",
    }
  }

  return {
    code: "UNKNOWN",
    friendlyMessage: errStr,
  }
}
