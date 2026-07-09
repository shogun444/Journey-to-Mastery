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
        "Your account needs a trustline for the Stellar Asset Contract (SAC) before you can stake XLM. Add the contract ID below as a trustline via Stellar Laboratory.",
    }
  }

  if (errStr.includes("Insufficient XLM balance") || errStr.includes("resulting balance is not within the allowed range")) {
    return {
      code: "INSUFFICIENT_BALANCE",
      friendlyMessage: "You don't have enough XLM in your wallet to complete this transaction.",
    }
  }

  if (errStr.includes("VM trap") || errStr.includes("HostError")) {
    return {
      code: "UNKNOWN",
      friendlyMessage: "Transaction simulation failed. Please try again or check your wallet balance.",
    }
  }

  return {
    code: "UNKNOWN",
    friendlyMessage: errStr,
  }
}
