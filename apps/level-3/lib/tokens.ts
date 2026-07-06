import type { Token } from "@/types"

export const XLM: Token = {
  code: "XLM",
  name: "Stellar Lumens",
  decimals: 7,
}

export const stXLM: Token = {
  code: "stXLM",
  name: "Staked XLM",
  decimals: 7,
  contractId: process.env.NEXT_PUBLIC_STXLM_CONTRACT_ID,
}

export const tokens: Token[] = [XLM, stXLM]
