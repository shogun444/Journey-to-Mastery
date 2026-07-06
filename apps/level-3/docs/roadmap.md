# Roadmap

## Phase 1: Testnet Launch (Current)

- [x] stXLM token contract (SEP-41)
- [x] Vault contract (deposit/withdraw/exchange/fees)
- [x] Mock yield simulation
- [x] Contract tests (10 passing)
- [x] Deploy to testnet
- [x] Frontend (Next.js, 5 pages)
- [x] Multi-wallet support (6 wallets)
- [x] Transaction status polling
- [ ] Demo video and screenshots

## Phase 2: Production Hardening

- [ ] Real yield adapter (Blend Protocol lending)
- [ ] Slippage protection (minimumOut for withdraw, maximumIn for deposit)
- [ ] Emergency withdraw function (bypass pause for user funds)
- [ ] Timelock on admin functions (24h delay)
- [ ] Oracle integration for non-XLM strategies
- [ ] Gas optimization pass on contracts
- [ ] Upgradeable contract pattern

## Phase 3: Multi-Asset Expansion

- [ ] stUSDC (USDC liquid staking)
- [ ] stBTC (WBTC liquid staking via LumenSwap)
- [ ] Multi-asset vault aggregator
- [ ] Auto-compounding yield
- [ ] Cross-contract yield routing

## Phase 4: Governance

- [ ] STXLM governance token (separate from stXLM)
- [ ] DAO-controlled fee settings
- [ ] Community treasury management
- [ ] Yield strategy voting
- [ ] Protocol-owned liquidity

## Phase 5: DeFi Integration

- [ ] Stellar DEX liquidity pools (stXLM/XLM)
- [ ] Soroswap integration
- [ ] Blend Protocol collateral (use stXLM as collateral)
- [ ] Lending markets on Phoenix
- [ ] Aquarius automated market making

## Phase 6: Mainnet Launch

- [ ] Security audit (least 2 independent audits)
- [ ] Bug bounty program
- [ ] Mainnet deployment
- [ ] Bridge integration (Soroswap, LumenSwap, etc.)
- [ ] Mobile app (React Native)

## Known Limitations (Testnet)

- Yield is simulated via admin-only `simulate_yield()` because testnet XLM has no real value
- The vault is designed with a yield adapter interface so production strategies can be swapped in without contract changes
- No slippage protection in current version (user must verify preview amounts)
- Contract is not upgradeable (would need proxy pattern in production)
