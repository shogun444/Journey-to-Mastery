# Tokenomics

## stXLM Token

| Property | Value |
|----------|-------|
| Name | Staked XLM |
| Symbol | stXLM |
| Standard | SEP-41 (Soroban Fungible Token) |
| Decimals | 7 |
| Total Supply | Variable (minted on deposit, burned on withdraw) |
| Initial Supply | 0 |

## Exchange Rate Model

stXLM follows the ERC-4626 exchange rate model:

```
shares = (assets * totalSupply) / totalAssets
assets = (shares * totalAssets) / totalSupply
```

Where:
- `totalAssets` = vault's XLM balance (deposits + accrued yield - fees)
- `totalSupply` = total stXLM tokens in circulation

At genesis (no deposits): 1 stXLM = 1 XLM
After yield accrual: 1 stXLM > 1 XLM

## Fee Model

Fees are expressed in basis points (bps), where 1 bps = 0.01%.

### Deposit Fee
```
depositFee = assets * depositFeeBps / 10000
netAssets = assets - depositFee
shares = (netAssets * totalSupply) / totalAssets
```

The deposit fee reduces the amount of stXLM minted. The fee remains in the vault as XLM, increasing totalAssets for all stakers.

### Withdraw Fee
```
withdrawFee = grossAssets * withdrawFeeBps / 10000
netAssets = grossAssets - withdrawFee
```

The withdraw fee is deducted from the user's XLM payout and sent to the treasury.

### Fee Configuration
- Default: 0 bps deposit, 0 bps withdraw
- Maximum: 1000 bps (10%) for each
- Configurable by admin via `set_fee(deposit_bps, withdraw_bps)`

## Treasury

- Initially set to the admin address
- Configurable via `set_treasury(new_treasury)`
- Receives all protocol fees
- Treasury address is publicly queryable via `treasury()`

## Value Accrual

stXLM holders benefit from yield through exchange rate appreciation:

1. Yield (simulated or real) adds XLM to the vault
2. totalAssets increases while totalSupply stays constant
3. Exchange rate increases: 1 stXLM is worth more XLM
4. Users can withdraw more XLM than they deposited (for the same stXLM balance)

## Inflation Protection

The exchange rate mechanism inherently protects against inflation:
- If more stXLM is minted (via deposit), totalSupply increases proportionally to totalAssets
- Exchange rate remains stable unless yield accrues
- No dilution: new depositors receive shares proportional to their contribution
