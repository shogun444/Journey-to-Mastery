import * as StellarSdk from "@stellar/stellar-sdk"
import { getRpc, config, VAULT_CONTRACT_ID } from "./stellar"
import { SorobanError, parseSorobanError } from "./errors"

function vaultContract() {
  return new StellarSdk.Contract(VAULT_CONTRACT_ID)
}

function simSource(address: string) {
  return new StellarSdk.Account(address, "0")
}

export function isValidStellarAddress(addr: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(addr)
}

async function simulateCall(fn: string, source: string, ...args: StellarSdk.xdr.ScVal[]): Promise<string | null> {
  if (!isValidStellarAddress(source)) return null
  try {
    const sim = await getRpc().simulateTransaction(
      new StellarSdk.TransactionBuilder(simSource(source), {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: config.networkPassphrase,
      })
        .addOperation(vaultContract().call(fn, ...args))
        .setTimeout(30)
        .build()
    )
    if (StellarSdk.rpc.Api.isSimulationSuccess(sim) && sim.result) {
      return String(StellarSdk.scValToNative(sim.result.retval))
    }
  } catch {
    // silent
  }
  return null
}

export async function getVaultState(source: string): Promise<{
  totalAssets: string
  totalSupply: string
  paused: boolean
  depositFeeBps: number
  withdrawFeeBps: number
}> {
  if (!isValidStellarAddress(source)) {
    return { totalAssets: "0", totalSupply: "0", paused: false, depositFeeBps: 0, withdrawFeeBps: 0 }
  }
  const [totalAssets, totalSupply, paused, depositFeeBps, withdrawFeeBps] = await Promise.all([
    simulateCall("total_assets", source),
    simulateCall("total_supply", source),
    simulateCall("paused", source),
    simulateCall("deposit_fee_bps", source),
    simulateCall("withdraw_fee_bps", source),
  ])
  return {
    totalAssets: totalAssets ?? "0",
    totalSupply: totalSupply ?? "0",
    paused: paused === "true",
    depositFeeBps: Number(depositFeeBps ?? "0"),
    withdrawFeeBps: Number(withdrawFeeBps ?? "0"),
  }
}

export async function getExchangeRate(source: string): Promise<string> {
  if (!isValidStellarAddress(source)) return "1.0000"
  try {
    const sim = await getRpc().simulateTransaction(
      new StellarSdk.TransactionBuilder(simSource(source), {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: config.networkPassphrase,
      })
        .addOperation(vaultContract().call("exchange_rate"))
        .setTimeout(30)
        .build()
    )
    if (StellarSdk.rpc.Api.isSimulationSuccess(sim) && sim.result) {
      const native = StellarSdk.scValToNative(sim.result.retval)
      if (Array.isArray(native) && native.length === 2) {
        const num = Number(native[0])
        const den = Number(native[1])
        if (den > 0) return (num / den).toFixed(7)
      }
    }
  } catch {
    // silent
  }
  return "1.0000"
}

export async function getUserBalance(address: string): Promise<string | null> {
  if (!isValidStellarAddress(address)) return null
  try {
    const sim = await getRpc().simulateTransaction(
      new StellarSdk.TransactionBuilder(simSource(address), {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: config.networkPassphrase,
      })
        .addOperation(
          vaultContract().call(
            "get_user_balance",
            StellarSdk.Address.fromString(address).toScVal()
          )
        )
        .setTimeout(30)
        .build()
    )
    if (StellarSdk.rpc.Api.isSimulationSuccess(sim) && sim.result) {
      const raw = StellarSdk.scValToNative(sim.result.retval)
      return (Number(raw) / 10_000_000).toFixed(7)
    }
  } catch {
    // silent
  }
  return null
}

export async function previewDeposit(assets: string, source: string): Promise<string> {
  if (!isValidStellarAddress(source)) return "0"
  try {
    const simulation = await getRpc().simulateTransaction(
      new StellarSdk.TransactionBuilder(simSource(source), {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: config.networkPassphrase,
      })
        .addOperation(
          vaultContract().call("preview_deposit", StellarSdk.nativeToScVal(assets, { type: "i128" }))
        )
        .setTimeout(30)
        .build()
    )
    if (StellarSdk.rpc.Api.isSimulationSuccess(simulation) && simulation.result) {
      return String(StellarSdk.scValToNative(simulation.result.retval))
    }
    return "0"
  } catch {
    return "0"
  }
}

export async function previewWithdraw(shares: string, source: string): Promise<string> {
  if (!isValidStellarAddress(source)) return "0"
  try {
    const simulation = await getRpc().simulateTransaction(
      new StellarSdk.TransactionBuilder(simSource(source), {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: config.networkPassphrase,
      })
        .addOperation(
          vaultContract().call("preview_withdraw", StellarSdk.nativeToScVal(shares, { type: "i128" }))
        )
        .setTimeout(30)
        .build()
    )
    if (StellarSdk.rpc.Api.isSimulationSuccess(simulation) && simulation.result) {
      return String(StellarSdk.scValToNative(simulation.result.retval))
    }
    return "0"
  } catch {
    return "0"
  }
}

export async function buildDepositTx(source: string, assets: string): Promise<string> {
  const account = await getRpc().getAccount(source)
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      vaultContract().call(
        "deposit",
        StellarSdk.Address.fromString(source).toScVal(),
        StellarSdk.nativeToScVal(assets, { type: "i128" })
      )
    )
    .setTimeout(180)
    .build()

  const simulation = await getRpc().simulateTransaction(tx)
  if (StellarSdk.rpc.Api.isSimulationError(simulation)) {
    if (simulation.error?.includes("resulting balance is not within the allowed range")) {
      throw new SorobanError("INSUFFICIENT_BALANCE", "Insufficient XLM balance")
    }
    const parsed = parseSorobanError(simulation.error)
    throw new SorobanError(parsed.code, parsed.friendlyMessage)
  }

  const assembled = StellarSdk.rpc.assembleTransaction(tx, simulation).build()
  return assembled.toXDR()
}

export async function buildWithdrawTx(source: string, shares: string): Promise<string> {
  const account = await getRpc().getAccount(source)
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      vaultContract().call(
        "withdraw",
        StellarSdk.Address.fromString(source).toScVal(),
        StellarSdk.nativeToScVal(shares, { type: "i128" })
      )
    )
    .setTimeout(180)
    .build()

  const simulation = await getRpc().simulateTransaction(tx)
  if (StellarSdk.rpc.Api.isSimulationError(simulation)) {
    const parsed = parseSorobanError(simulation.error)
    throw new SorobanError(parsed.code, parsed.friendlyMessage)
  }

  const assembled = StellarSdk.rpc.assembleTransaction(tx, simulation).build()
  return assembled.toXDR()
}

export async function buildSimulateYieldTx(source: string, amount: string): Promise<string> {
  const account = await getRpc().getAccount(source)
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(vaultContract().call("simulate_yield", StellarSdk.nativeToScVal(amount, { type: "i128" })))
    .setTimeout(180)
    .build()

  const simulation = await getRpc().simulateTransaction(tx)
  if (StellarSdk.rpc.Api.isSimulationError(simulation)) {
    const parsed = parseSorobanError(simulation.error)
    throw new SorobanError(parsed.code, parsed.friendlyMessage)
  }

  const assembled = StellarSdk.rpc.assembleTransaction(tx, simulation).build()
  return assembled.toXDR()
}
