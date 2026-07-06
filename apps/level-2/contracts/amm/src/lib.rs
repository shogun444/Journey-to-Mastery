#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype,
    Address, Env, String, symbol_short, Vec,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Swap {
    pub sender: Address,
    pub source_asset: String,
    pub source_issuer: String,
    pub dest_asset: String,
    pub dest_issuer: String,
    pub amount_in: i128,
    pub amount_out: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SwapResult {
    pub amount_in: i128,
    pub amount_out: i128,
    pub ledger: u32,
    pub success: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Pair {
    pub source_asset: String,
    pub source_issuer: String,
    pub dest_asset: String,
    pub dest_issuer: String,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum SwapError {
    UnsupportedPair = 1,
    InvalidAmount = 2,
    SlippageExceeded = 3,
    SwapFailed = 4,
}

#[contract]
pub struct AmmContract;

#[contractimpl]
impl AmmContract {
    #[allow(deprecated)]
    pub fn swap(env: Env, swap: Swap) -> Result<SwapResult, SwapError> {
        swap.sender.require_auth();

        if swap.amount_in <= 0 || swap.amount_out <= 0 {
            return Err(SwapError::InvalidAmount);
        }

        let ledger = env.ledger().sequence();

        env.events().publish(
            (symbol_short!("swap_exec"), swap.sender.clone()),
            (
                swap.source_asset.clone(),
                swap.source_issuer.clone(),
                swap.dest_asset.clone(),
                swap.dest_issuer.clone(),
                swap.amount_in,
                swap.amount_out,
                ledger,
            ),
        );

        Ok(SwapResult {
            amount_in: swap.amount_in,
            amount_out: swap.amount_out,
            ledger,
            success: true,
        })
    }

    pub fn get_supported_pairs(env: Env) -> Vec<Pair> {
        let mut pairs: Vec<Pair> = Vec::new(&env);

        pairs.push_back(Pair {
            source_asset: String::from_str(&env, "XLM"),
            source_issuer: String::from_str(&env, ""),
            dest_asset: String::from_str(&env, "USDC"),
            dest_issuer: String::from_str(
                &env,
                "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
            ),
        });

        pairs.push_back(Pair {
            source_asset: String::from_str(&env, "USDC"),
            source_issuer: String::from_str(
                &env,
                "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
            ),
            dest_asset: String::from_str(&env, "XLM"),
            dest_issuer: String::from_str(&env, ""),
        });

        pairs
    }

    pub fn get_swap_preview(env: Env, swap: Swap) -> Result<SwapResult, SwapError> {
        if swap.amount_in <= 0 || swap.amount_out <= 0 {
            return Err(SwapError::InvalidAmount);
        }

        Ok(SwapResult {
            amount_in: swap.amount_in,
            amount_out: swap.amount_out,
            ledger: env.ledger().sequence(),
            success: true,
        })
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env, String};

    #[test]
    fn test_swap_basic() {
        let env = Env::default();
        env.mock_all_auths();
        let sender = Address::generate(&env);
        let contract_id = env.register(AmmContract, ());
        let client = AmmContractClient::new(&env, &contract_id);

        let swap = Swap {
            sender: sender.clone(),
            source_asset: String::from_str(&env, "XLM"),
            source_issuer: String::from_str(&env, ""),
            dest_asset: String::from_str(&env, "USDC"),
            dest_issuer: String::from_str(
                &env,
                "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
            ),
            amount_in: 100_000_0000,
            amount_out: 225_000_0000,
        };

        let result = client.swap(&swap);
        assert!(result.is_ok());
        let swap_result = result.unwrap();
        assert_eq!(swap_result.amount_in, 100_000_0000);
        assert_eq!(swap_result.amount_out, 225_000_0000);
        assert_eq!(swap_result.success, true);
    }

    #[test]
    fn test_invalid_amount() {
        let env = Env::default();
        env.mock_all_auths();
        let sender = Address::generate(&env);
        let contract_id = env.register(AmmContract, ());
        let client = AmmContractClient::new(&env, &contract_id);

        let swap = Swap {
            sender: sender.clone(),
            source_asset: String::from_str(&env, "XLM"),
            source_issuer: String::from_str(&env, ""),
            dest_asset: String::from_str(&env, "USDC"),
            dest_issuer: String::from_str(&env, ""),
            amount_in: 0,
            amount_out: 0,
        };

        let result = client.try_swap(&swap);
        assert_eq!(result, Err(Ok(SwapError::InvalidAmount)));
    }
}
