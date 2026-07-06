"use client"

import { useState, useCallback } from "react"
import * as StellarSdk from "@stellar/stellar-sdk"
import { useStellarWallet } from "./useStellarWallet"
import { buildSwapTx, submitTransaction, buildContractLogTx, submitContractLog } from "@/lib/transactions"
import { calculateMinOut } from "@/lib/dex"
import type { Token, TxState } from "@/types"

export function useSwap() {
  const { wallet, sign } = useStellarWallet()
  const [txState, setTxState] = useState<TxState>({ status: "idle" })

  const executeSwap = useCallback(
    async (
      sourceToken: Token,
      destToken: Token,
      amount: string,
      receiveAmount: string,
      slippage: number,
      path: StellarSdk.Asset[]
    ) => {
      if (!wallet) {
        setTxState({ status: "failed", error: "Wallet not connected" })
        return
      }

      const parsedAmount = Number.parseFloat(amount)
      if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
        setTxState({ status: "failed", error: "Invalid amount" })
        return
      }

      const parsedReceive = Number.parseFloat(receiveAmount)
      if (Number.isNaN(parsedReceive) || parsedReceive <= 0) {
        setTxState({ status: "failed", error: "Invalid estimated receive amount" })
        return
      }

      const minAmountOut = calculateMinOut(receiveAmount, slippage)

      try {
        setTxState({ status: "building", message: "Building transaction..." })

        const sourceAsset =
          sourceToken.code === "XLM"
            ? StellarSdk.Asset.native()
            : new StellarSdk.Asset(sourceToken.code, sourceToken.issuer)

        const destAsset =
          destToken.code === "XLM"
            ? StellarSdk.Asset.native()
            : new StellarSdk.Asset(destToken.code, destToken.issuer)

        const xdr = await buildSwapTx(wallet.address, sourceAsset, destAsset, amount, minAmountOut, path)

        setTxState({ status: "signing", message: "Please sign in your wallet..." })

        const signedXdr = await sign(xdr)

        setTxState({ status: "submitting", message: "Submitting transaction..." })

        const result = await submitTransaction(signedXdr)

        if (result.status === "success") {
          setTxState({
            status: "success",
            hash: result.hash,
            message: "Swap executed successfully!",
          })
        } else {
          setTxState({
            status: "failed",
            hash: result.hash,
            error: "Transaction failed on the network",
          })
        }
      } catch (err: unknown) {
        const msg = (err as { message?: string })?.message ?? ""

        if (msg.includes("User rejected") || msg.includes("cancel")) {
          setTxState({ status: "failed", error: "Signing was rejected. Please try again." })
        } else if (msg.includes("insufficient") || msg.includes("balance")) {
          setTxState({ status: "failed", error: "Insufficient balance for this swap." })
        } else if (msg.includes("slippage") || msg.includes("min")) {
          setTxState({ status: "failed", error: "Price moved, slippage exceeded. Retry with higher slippage." })
        } else {
          setTxState({ status: "failed", error: msg || "Swap failed. Please try again." })
        }
      }
    },
    [wallet, sign]
  )

  const logSwapOnContract = useCallback(
    async (
      sourceToken: Token,
      destToken: Token,
      amount: string,
      receiveAmount: string
    ) => {
      if (!wallet) {
        setTxState({ status: "failed", error: "Wallet not connected" })
        return
      }

      try {
        setTxState((prev) => ({ ...prev, status: "building", message: "Building contract log tx..." }))

        const xdr = await buildContractLogTx(
          wallet.address,
          sourceToken.code,
          sourceToken.code === "XLM" ? "" : sourceToken.issuer,
          destToken.code,
          destToken.code === "XLM" ? "" : destToken.issuer,
          amount,
          receiveAmount
        )

        setTxState((prev) => ({ ...prev, status: "signing", message: "Please sign contract log in your wallet..." }))

        const signedXdr = await sign(xdr)

        setTxState((prev) => ({ ...prev, status: "submitting", message: "Submitting contract log..." }))

        const result = await submitContractLog(signedXdr)

        setTxState((prev) => ({
          ...prev,
          contractTxHash: result.hash,
          message: `Swap logged on chain!`,
        }))
      } catch (err: unknown) {
        const msg = (err as { message?: string })?.message ?? ""
        setTxState((prev) => ({ ...prev, error: msg || "Contract log failed." }))
      }
    },
    [wallet, sign]
  )

  const resetTxState = useCallback(() => {
    setTxState({ status: "idle" })
  }, [])

  return { txState, executeSwap, logSwapOnContract, resetTxState }
}
