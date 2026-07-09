# Deployment

## Prerequisites

- Rust 1.96+ with `wasm32v1-none` target
- `stellar` CLI v27.0.0+
- Testnet-funded deployer key

## Build Contracts

```bash
# Build stXLM token
cd contracts/st-xlm
cargo build --target wasm32v1-none --release

# Build vault (after stXLM WASM exists for contractimport!)
cd ../vault
cargo build --target wasm32v1-none --release
```

## Deploy Contracts

```bash
# Deploy stXLM token
stellar contract deploy \
  --wasm contracts/st-xlm/target/wasm32v1-none/release/st_xlm.wasm \
  --alias st_xlm \
  --source deployer-key \
  --network testnet \
  -- \
  --admin <DEPLOYER_ADDRESS> \
  --name "Staked XLM" \
  --symbol "stXLM" \
  --decimals 7

# Deploy vault
stellar contract deploy \
  --wasm contracts/vault/target/wasm32v1-none/release/vault.wasm \
  --alias vault \
  --source deployer-key \
  --network testnet \
  -- \
  --admin <DEPLOYER_ADDRESS> \
  --st_xlm <STXLM_CONTRACT_ID> \
  --treasury <DEPLOYER_ADDRESS> \
  --deposit_fee_bps 0 \
  --withdraw_fee_bps 0

# Set vault as minter on stXLM
stellar contract invoke \
  --id <STXLM_CONTRACT_ID> \
  --source deployer-key \
  --network testnet \
  -- \
  set_minter \
  --new_minter <VAULT_CONTRACT_ID>
```

## Verify Deployment

```bash
# Check vault state
stellar contract invoke \
  --id <VAULT_CONTRACT_ID> \
  --source deployer-key \
  --network testnet \
  -- \
  total_assets

stellar contract invoke \
  --id <VAULT_CONTRACT_ID> \
  --source deployer-key \
  --network testnet \
  -- \
  total_supply

stellar contract invoke \
  --id <VAULT_CONTRACT_ID> \
  --source deployer-key \
  --network testnet \
  -- \
  exchange_rate
```

## Run Tests

```bash
# Run stXLM tests
cd contracts/st-xlm
cargo test

# Run vault tests
cd contracts/vault
cargo test
```

## Frontend

### Setup
```bash
cd apps/level-3
npm install
cp .env.example .env.local
# Edit .env.local with your values
```

### Environment Variables
| Variable | Value | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` or `pubnet` | No (default: testnet) |
| `NEXT_PUBLIC_STXLM_CONTRACT_ID` | stXLM contract address | No (has default) |
| `NEXT_PUBLIC_VAULT_CONTRACT_ID` | Vault contract address | No (has default) |

### Run
```bash
npm run dev
# Available at http://localhost:3002
```

## Simulate Yield (Testnet Only)

```bash
stellar contract invoke \
  --id <VAULT_CONTRACT_ID> \
  --source deployer-key \
  --network testnet \
  -- \
  simulate_yield \
  --amount <AMOUNT_IN_STROOPS>
```

## XLM SAC Addresses

| Network | Address |
|---------|---------|
| Testnet | `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA` |
| Mainnet | `CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75` |

## Current Deployments (Testnet)

| Contract | Address |
|----------|---------|
| stXLM | `CDRE2N4LUYSRG77MB3K47XGI2MIV5OHX6CGXEYUEOKG3ALK25I2RZT2S` |
| Vault | `CAAVEIWGXQDBORNWDSNYMEB42L4A6Z6P3WC4QA3PLJ3U5IUXLYFQWQM5` |

## Build and Deploy Frontend

```bash
npm run build
# Deploy output to Vercel, Cloudflare Pages, or similar
```
