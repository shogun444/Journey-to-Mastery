import * as StellarSdk from "@stellar/stellar-sdk"
import { getRpc, config, VAULT_CONTRACT_ID } from "./stellar"

function vaultContract() {
  return new StellarSdk.Contract(VAULT_CONTRACT_ID)
}

export async function getVaultState(): Promise<{
  totalAssets: string
  totalSupply: string
  paused: boolean
  depositFeeBps: number
  withdrawFeeBps: number
}> {
  try {
    const contract = vaultContract()
    const sim = await getRpc().simulateTransaction(
      new StellarSdk.TransactionBuilder(await getRpc().getAccount(VAULT_CONTRACT_ID), {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: config.networkPassphrase,
      })
        .addOperation(contract.call("total_assets"))
        .setTimeout(30)
        .build()
    )
    if (StellarSdk.rpc.Api.isSimulationSuccess(sim) && sim.result) {
      return {
        totalAssets: String(StellarSdk.scValToNative(sim.result.retval)),
        totalSupply: "0",
        paused: false,
        depositFeeBps: 0,
        withdrawFeeBps: 0,
      }
    }
    return { totalAssets: "0", totalSupply: "0", paused: false, depositFeeBps: 0, withdrawFeeBps: 0 }
  } catch {
    return { totalAssets: "0", totalSupply: "0", paused: false, depositFeeBps: 0, withdrawFeeBps: 0 }
  }
}

export async function previewDeposit(assets: string): Promise<string> {
  try {
    const simulation = await getRpc().simulateTransaction(
      new StellarSdk.TransactionBuilder(await getRpc().getAccount(VAULT_CONTRACT_ID), {
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
      new StellarSdk.TransactionBuilder(await getRpc().getAccount(VAULT_CONTRACT_ID), {
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
    throw new Error(`Simulation failed: ${simulation.error}`)
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
