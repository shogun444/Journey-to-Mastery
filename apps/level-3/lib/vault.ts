import * as StellarSdk from "@stellar/stellar-sdk"
import { getRpc, config, VAULT_CONTRACT_ID } from "./stellar"

function vaultContract() {
  return new StellarSdk.Contract(VAULT_CONTRACT_ID)
}

function defaultSourceAccount() {
  return new StellarSdk.Account(VAULT_CONTRACT_ID, "0")
}

async function simulateCall(fn: string, ...args: StellarSdk.xdr.ScVal[]): Promise<string | null> {
  try {
    const sim = await getRpc().simulateTransaction(
      new StellarSdk.TransactionBuilder(defaultSourceAccount(), {
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

export async function getVaultState(): Promise<{
  totalAssets: string
  totalSupply: string
  paused: boolean
  depositFeeBps: number
  withdrawFeeBps: number
}> {
  const [totalAssets, totalSupply, paused, depositFeeBps, withdrawFeeBps] = await Promise.all([
    simulateCall("total_assets"),
    simulateCall("total_supply"),
    simulateCall("paused"),
    simulateCall("deposit_fee_bps"),
    simulateCall("withdraw_fee_bps"),
  ])
  return {
    totalAssets: totalAssets ?? "0",
    totalSupply: totalSupply ?? "0",
    paused: paused === "true",
    depositFeeBps: Number(depositFeeBps ?? "0"),
    withdrawFeeBps: Number(withdrawFeeBps ?? "0"),
  }
}

export async function getExchangeRate(): Promise<string> {
  const result = await simulateCall("exchange_rate")
  if (!result) return "1.0000"
  try {
    const parsed = JSON.parse(result)
    if (Array.isArray(parsed) && parsed.length === 2) {
      const num = Number(parsed[0])
      const den = Number(parsed[1])
      if (den > 0) return (num / den).toFixed(7)
    }
  } catch {
    // silent
  }
  return "1.0000"
}

export async function getUserBalance(address: string): Promise<string | null> {
  try {
    const sim = await getRpc().simulateTransaction(
      new StellarSdk.TransactionBuilder(defaultSourceAccount(), {
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

export async function previewDeposit(assets: string): Promise<string> {
  try {
    const simulation = await getRpc().simulateTransaction(
      new StellarSdk.TransactionBuilder(defaultSourceAccount(), {
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

export async function previewWithdraw(shares: string): Promise<string> {
  try {
    const simulation = await getRpc().simulateTransaction(
      new StellarSdk.TransactionBuilder(defaultSourceAccount(), {
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
    const msg = simulation.error?.includes("resulting balance is not within the allowed range")
      ? "Insufficient XLM balance"
      : `Simulation failed: ${simulation.error}`
    throw new Error(msg)
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
    throw new Error(`Simulation failed: ${simulation.error}`)
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
    throw new Error(`Simulation failed: ${simulation.error}`)
  }

  const assembled = StellarSdk.rpc.assembleTransaction(tx, simulation).build()
  return assembled.toXDR()
}
