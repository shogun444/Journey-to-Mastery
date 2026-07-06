# Math

## Exchange Rate (ERC-4626)

### `convertToShares(assets)`

```
if totalSupply == 0 || totalAssets == 0:
    return assets
else:
    return assets * totalSupply / totalAssets
```

### `convertToAssets(shares)`

```
if totalSupply == 0:
    return 0
else:
    return shares * totalAssets / totalSupply
```

Both functions use integer division (floor), which is standard for ERC-4626. The rounding direction favors the vault (protects existing stakers).

## Preview Functions

### `previewDeposit(assets)`

```
depositFee = assets * depositFeeBps / 10000
netAssets = assets - depositFee
return convertToShares(netAssets)
```

Returns the exact stXLM shares a user would receive for depositing `assets` XLM, accounting for deposit fees.

### `previewWithdraw(shares)`

```
grossAssets = convertToAssets(shares)
withdrawFee = grossAssets * withdrawFeeBps / 10000
return grossAssets - withdrawFee
```

Returns the exact XLM a user would receive for burning `shares` stXLM, accounting for withdrawal fees.

### `previewRedeem(assets)`

```
withdrawFeeBpsFraction = withdrawFeeBps / 10000
grossAssets = assets * 10000 / (10000 - withdrawFeeBps)
return convertToShares(grossAssets)
```

Returns the stXLM shares needed to receive exactly `assets` XLM after fees.

### `previewMint(shares)`

```
depositFeeBpsFraction = depositFeeBps / 10000
grossAssets = convertToAssets(shares)
fee = grossAssets * depositFeeBps / (10000 - depositFeeBps)
return grossAssets + fee
```

Returns the XLM amount needed to mint exactly `shares` stXLM, accounting for deposit fees.

## Fee Math

### Deposit Fee
```
feeBps = 10000 → fee = assets (100%)
feeBps = 0     → fee = 0
feeBps = 100   → fee = assets * 0.01
```
Max feeBps is 1000 (10%).

### Withdraw Fee
```
feeBps = 10000 → fee = grossAssets (100%)
feeBps = 0     → fee = 0
feeBps = 100   → fee = grossAssets * 0.01
```

## Exchange Rate Event

On every deposit, withdraw, and yield simulation, an `ExchangeRateUpdated` event is emitted:

```
ExchangeRateUpdated {
    old_rate_d0: i128, // previous totalAssets (0 if first)
    old_rate_d1: i128, // previous totalSupply (0 if first)
    new_rate_d0: i128, // current totalAssets
    new_rate_d1: i128, // current totalSupply
}
```

## Slippage

Users can compute expected amounts via preview functions before signing. If the exchange rate changes between preview and execution (due to another transaction), the actual amounts may differ.

In production, a minimumOut/maximumIn parameter should be added for slippage protection. This enhancement is noted in the roadmap.

## Examples

### Deposit
```
totalAssets = 0, totalSupply = 0, feeBps = 0
User deposits 1000 XLM
shares = 1000 (first deposit = 1:1)
User receives 1000 stXLM
```

### Yield Accrual
```
totalAssets = 1000, totalSupply = 1000
Admin simulates 50 XLM yield
totalAssets = 1050, totalSupply = 1000
Exchange rate: 1 stXLM = 1.05 XLM
```

### Withdraw After Yield
```
totalAssets = 1050, totalSupply = 1000
User withdraws 500 stXLM
grossAssets = 500 * 1050 / 1000 = 525
User receives 525 XLM (5% yield on staked amount)
```
