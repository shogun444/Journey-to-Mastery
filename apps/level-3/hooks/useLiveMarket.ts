"use client"

import { useState, useEffect, useRef } from "react"

export interface MarketPoint {
  t: number
  rate: number
  changePct: number
}

interface LiveMarketOptions {
  baseRate?: number
  maxPoints?: number
  upMax?: number
  downMax?: number
  intervalMin?: number
  intervalMax?: number
  band?: number
}

function seed(baseRate: number, maxPoints: number): MarketPoint[] {
  const pts: MarketPoint[] = []
  let r = baseRate
  for (let i = 0; i < maxPoints; i++) {
    const noise = (Math.random() * 2 - 1) * 0.25
    r = r * (1 + noise / 100)
    pts.push({
      t: Date.now() - (maxPoints - i) * 2500,
      rate: r,
      changePct: noise,
    })
  }
  return pts
}

export function useLiveMarket(opts: LiveMarketOptions = {}) {
  const {
    baseRate = 1,
    maxPoints = 48,
    upMax = 1.5,
    downMax = 2.5,
    intervalMin = 2000,
    intervalMax = 3000,
    band = 0.05,
  } = opts

  const [points, setPoints] = useState<MarketPoint[]>(() => seed(baseRate, maxPoints))
  const [currentRate, setCurrentRate] = useState(baseRate)
  const [lastChange, setLastChange] = useState(0)
  const rateRef = useRef(baseRate)
  const targetBaseRef = useRef(baseRate)

  useEffect(() => {
    targetBaseRef.current = baseRate
  }, [baseRate])

  useEffect(() => {
    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout>

    const tick = () => {
      if (cancelled) return
      const isUp = Math.random() < 0.58
      const magnitude = isUp ? Math.random() * upMax : Math.random() * downMax
      const changePct = isUp ? magnitude : -magnitude

      let next = rateRef.current * (1 + changePct / 100)
      const base = targetBaseRef.current
      const lower = base * (1 - band)
      const upper = base * (1 + band)
      if (next < lower) next = lower + Math.random() * 0.001
      if (next > upper) next = upper - Math.random() * 0.001

      rateRef.current = next
      setCurrentRate(next)
      setLastChange(changePct)
      setPoints((prev) => [...prev, { t: Date.now(), rate: next, changePct }].slice(-maxPoints))

      const delay = intervalMin + Math.random() * (intervalMax - intervalMin)
      timeoutId = setTimeout(tick, delay)
    }

    timeoutId = setTimeout(tick, intervalMin + Math.random() * (intervalMax - intervalMin))
    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [maxPoints, upMax, downMax, intervalMin, intervalMax, band])

  return { points, currentRate, lastChange }
}
