# Security

## Access Controls

### Admin Functions
The following functions require `admin` authorization (`require_auth()`):
- `pause()` — pause all deposits and withdrawals
- `unpause()` — resume operations
- `set_fee(deposit_bps, withdraw_bps)` — update fee rates
- `set_treasury(new_treasury)` — change treasury address
- `simulate_yield(amount)` — simulate yield (testnet only)

### Vault Authority
The vault contract is set as the **minter** on the stXLM token contract. This means only the vault can:
- `mint(to, amount)` — create new stXLM tokens
- `burn(from, amount)` — destroy stXLM tokens
- `burn_from(spender, from, amount)` — destroy on behalf (requires allowance)

### User Authentication
All deposit and withdrawal operations require `sender.require_auth()` to ensure only the account owner can move their funds.

## State Machine

The vault has a `paused` state:
- When paused: `deposit()` and `withdraw()` revert with "vault is paused"
- Admin can `pause()` / `unpause()` at any time
- Preview functions are NOT blocked during pause (read-only)

## Fee Safety

- Fees are capped at 10% (1000 bps) max for both deposit and withdraw
- Constructor validates fee <= 1000 bps
- `set_fee()` validates fee <= 1000 bps
- Fees default to 0 bps (no fees)

## Integer Overflow Protection

All arithmetic uses Rust's overflow-checked operations (enabled in release profile):
- `checked_add` for supply increases
- `checked_sub` for balance decreases
- Division by zero is impossible (checked before each operation)

## Storage TTL

- Balance entries: extended to 518400 ledgers (~72 days on testnet)
- Allowance entries: extended to 518400 ledgers
- Instance storage: persistent (no TTL needed)

## Known Limitations

### Testnet
- Yield is simulated, not earned from real staking
- No real XLM value at stake
- Friendbot can fund accounts for testing

### Production (Future)
- Oracle integration needed for pricing if using non-XLM strategies
- Yield adapter contract needs security audit before mainnet
- Emergency withdraw function should be added for paused states
- Timelock on admin functions recommended for production

## Threat Model

| Threat | Mitigation |
|--------|------------|
| Admin compromise | Admin key should use multisig in production |
| Reentrancy | Soroban contract calls are not reentrant (host-enforced) |
| Flash loan attack | Preview functions use current state; deposit/withdraw do too |
| Balance manipulation | Exchange rate computed from actual XLM balance (not book value) |
| Slippage | User sees exact amounts via preview before signing |
