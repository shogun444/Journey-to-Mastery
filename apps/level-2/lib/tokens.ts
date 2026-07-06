import type { Token } from "@/types"

export const STELLAR_TOKENS: Token[] = [
  {
    code: "XLM",
    issuer: "",
    name: "Stellar Lumens",
    decimals: 7,
    icon: "⟐",
  },
  {
    code: "USDC",
    issuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    contractId: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
    name: "USD Coin",
    decimals: 7,
    icon: "●",
  },
  {
    code: "AQUA",
    issuer: "GBNZILSTVQZ4R7IKQDCHYBY2LP4XDMF4D2KZ2WYBK5ADG6YAB5ER3NIF",
    name: "Aqua Network",
    decimals: 7,
    icon: "◇",
  },
]

export function getTokenByCode(code: string): Token | undefined {
  return STELLAR_TOKENS.find((t) => t.code === code)
}
