#![no_std]
use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype,
    token::Client as TokenClient, Address, Env,
};

mod st_xlm_token {
    soroban_sdk::contractimport!(file = "../st-xlm/target/wasm32v1-none/release/st_xlm.wasm");
}

const MAX_BPS: u32 = 10000;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum VaultError {
    AlreadyInitialized = 1,
    InsufficientAssets = 2,
    InsufficientShares = 3,
    Paused = 4,
    AlreadyPaused = 5,
    NotPaused = 6,
    Unauthorized = 7,
    InvalidAmount = 8,
    ZeroAssets = 9,
    ZeroShares = 10,
    FeeTooHigh = 11,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    StXlmToken,
    XlmToken,
    Treasury,
    DepositFeeBps,
    WithdrawFeeBps,
    Paused,
}

#[contractevent(topics = ["deposited"])]
pub struct DepositedEvent {
    pub sender: Address,
    pub assets: i128,
    pub shares: i128,
}

#[contractevent(topics = ["withdrawn"])]
pub struct WithdrawnEvent {
    pub sender: Address,
    pub shares: i128,
    pub assets: i128,
}

#[contractevent(topics = ["exchange_rate_updated"])]
pub struct ExchangeRateUpdatedEvent {
    pub old_rate_d0: i128,
    pub old_rate_d1: i128,
    pub new_rate_d0: i128,
    pub new_rate_d1: i128,
}

#[contractevent(topics = ["fee_updated"])]
pub struct FeeUpdatedEvent {
    pub deposit_fee_bps: u32,
    pub withdraw_fee_bps: u32,
}

#[contractevent(topics = ["treasury_updated"])]
pub struct TreasuryUpdatedEvent {
    pub new_treasury: Address,
}

#[contractevent(topics = ["paused"])]
pub struct PausedEvent {}

#[contractevent(topics = ["unpaused"])]
pub struct UnpausedEvent {}

#[contractevent(topics = ["yield_simulated"])]
pub struct YieldSimulatedEvent {
    pub amount: i128,
}

#[contract]
pub struct Vault;

#[contractimpl]
impl Vault {
    pub fn __constructor(
        env: Env,
        admin: Address,
        st_xlm: Address,
        xlm_token: Address,
        treasury: Address,
        deposit_fee_bps: u32,
        withdraw_fee_bps: u32,
    ) {
        if deposit_fee_bps > 1000 || withdraw_fee_bps > 1000 {
            panic!("fee too high (max 10%)");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::StXlmToken, &st_xlm);
        env.storage().instance().set(&DataKey::XlmToken, &xlm_token);
        env.storage().instance().set(&DataKey::Treasury, &treasury);
        env.storage()
            .instance()
            .set(&DataKey::DepositFeeBps, &deposit_fee_bps);
        env.storage()
            .instance()
            .set(&DataKey::WithdrawFeeBps, &withdraw_fee_bps);
        env.storage().instance().set(&DataKey::Paused, &false);
    }

    pub fn deposit(env: Env, sender: Address, assets: i128) -> i128 {
        if assets <= 0 {
            panic!("assets must be positive");
        }
        if Self::paused(env.clone()) {
            panic!("vault is paused");
        }
        sender.require_auth();

        let total_assets = Self::total_assets(env.clone());
        let total_supply = Self::total_supply(env.clone());
        let deposit_fee_bps: u32 = env
            .storage()
            .instance()
            .get(&DataKey::DepositFeeBps)
            .unwrap();

        let fee = if deposit_fee_bps > 0 {
            assets * deposit_fee_bps as i128 / MAX_BPS as i128
        } else {
            0
        };
        let net_assets = assets - fee;

        let shares = if total_supply == 0 || total_assets == 0 {
            net_assets
        } else {
            net_assets * total_supply / total_assets
        };

        if shares <= 0 {
            panic!("zero shares");
        }

        Self::_transfer_xlm_in(&env, &sender, assets);
        Self::_mint_st_xlm(&env, &sender, shares);

        if fee > 0 {
            let _treasury: Address = env.storage().instance().get(&DataKey::Treasury).unwrap();
        }

        Self::_emit_exchange_rate(&env);
        DepositedEvent {
            sender,
            assets,
            shares,
        }
        .publish(&env);
        shares
    }

    pub fn withdraw(env: Env, sender: Address, shares: i128) -> i128 {
        if shares <= 0 {
            panic!("shares must be positive");
        }
        if Self::paused(env.clone()) {
            panic!("vault is paused");
        }
        sender.require_auth();

        let total_assets = Self::total_assets(env.clone());
        let total_supply = Self::total_supply(env.clone());

        if total_supply == 0 {
            panic!("no supply");
        }

        let withdraw_fee_bps: u32 = env
            .storage()
            .instance()
            .get(&DataKey::WithdrawFeeBps)
            .unwrap();
        let gross_assets = shares * total_assets / total_supply;
        let fee = if withdraw_fee_bps > 0 {
            gross_assets * withdraw_fee_bps as i128 / MAX_BPS as i128
        } else {
            0
        };
        let net_assets = gross_assets - fee;

        if net_assets <= 0 {
            panic!("zero assets");
        }

        Self::_burn_st_xlm(&env, &sender, shares);
        Self::_transfer_xlm_out(&env, &sender, net_assets);

        if fee > 0 {
            let treasury: Address = env.storage().instance().get(&DataKey::Treasury).unwrap();
            Self::_transfer_xlm_out(&env, &treasury, fee);
        }

        Self::_emit_exchange_rate(&env);
        WithdrawnEvent {
            sender,
            shares,
            assets: net_assets,
        }
        .publish(&env);
        net_assets
    }

    pub fn preview_deposit(env: Env, assets: i128) -> i128 {
        if assets <= 0 {
            return 0;
        }
        let total_assets = Self::total_assets(env.clone());
        let total_supply = Self::total_supply(env.clone());
        let deposit_fee_bps: u32 = env
            .storage()
            .instance()
            .get(&DataKey::DepositFeeBps)
            .unwrap();
        let fee = if deposit_fee_bps > 0 {
            assets * deposit_fee_bps as i128 / MAX_BPS as i128
        } else {
            0
        };
        let net_assets = assets - fee;
        if total_supply == 0 || total_assets == 0 {
            net_assets
        } else {
            net_assets * total_supply / total_assets
        }
    }

    pub fn preview_withdraw(env: Env, shares: i128) -> i128 {
        if shares <= 0 {
            return 0;
        }
        let total_assets = Self::total_assets(env.clone());
        let total_supply = Self::total_supply(env.clone());
        if total_supply == 0 {
            return 0;
        }
        let withdraw_fee_bps: u32 = env
            .storage()
            .instance()
            .get(&DataKey::WithdrawFeeBps)
            .unwrap();
        let gross_assets = shares * total_assets / total_supply;
        let fee = if withdraw_fee_bps > 0 {
            gross_assets * withdraw_fee_bps as i128 / MAX_BPS as i128
        } else {
            0
        };
        gross_assets - fee
    }

    pub fn preview_redeem(env: Env, assets: i128) -> i128 {
        if assets <= 0 {
            return 0;
        }
        let total_assets = Self::total_assets(env.clone());
        let total_supply = Self::total_supply(env.clone());
        if total_supply == 0 || total_assets == 0 {
            return assets;
        }
        let withdraw_fee_bps: u32 = env
            .storage()
            .instance()
            .get(&DataKey::WithdrawFeeBps)
            .unwrap();
        let gross_assets = assets * MAX_BPS as i128 / (MAX_BPS as i128 - withdraw_fee_bps as i128);
        gross_assets * total_supply / total_assets
    }

    pub fn preview_mint(env: Env, shares: i128) -> i128 {
        if shares <= 0 {
            return 0;
        }
        let total_assets = Self::total_assets(env.clone());
        let total_supply = Self::total_supply(env.clone());
        if total_supply == 0 || total_assets == 0 {
            return shares;
        }
        let deposit_fee_bps: u32 = env
            .storage()
            .instance()
            .get(&DataKey::DepositFeeBps)
            .unwrap();
        let gross_assets = shares * total_assets / total_supply;
        let fee = if deposit_fee_bps > 0 {
            gross_assets * deposit_fee_bps as i128 / (MAX_BPS as i128 - deposit_fee_bps as i128)
        } else {
            0
        };
        gross_assets + fee
    }

    pub fn convert_to_shares(env: Env, assets: i128) -> i128 {
        if assets <= 0 {
            return 0;
        }
        let total_assets = Self::total_assets(env.clone());
        let total_supply = Self::total_supply(env.clone());
        if total_supply == 0 || total_assets == 0 {
            assets
        } else {
            assets * total_supply / total_assets
        }
    }

    pub fn convert_to_assets(env: Env, shares: i128) -> i128 {
        if shares <= 0 {
            return 0;
        }
        let total_assets = Self::total_assets(env.clone());
        let total_supply = Self::total_supply(env.clone());
        if total_supply == 0 {
            0
        } else {
            shares * total_assets / total_supply
        }
    }

    pub fn total_assets(env: Env) -> i128 {
        let vault = env.current_contract_address();
        let xlm_token: Address = env.storage().instance().get(&DataKey::XlmToken).unwrap();
        let xlm_client = TokenClient::new(&env, &xlm_token);
        xlm_client.balance(&vault)
    }

    pub fn total_supply(env: Env) -> i128 {
        let st_xlm: Address = env.storage().instance().get(&DataKey::StXlmToken).unwrap();
        let st_xlm_client = st_xlm_token::Client::new(&env, &st_xlm);
        st_xlm_client.total_supply()
    }

    pub fn exchange_rate(env: Env) -> (i128, i128) {
        let total_assets = Self::total_assets(env.clone());
        let total_supply = Self::total_supply(env.clone());
        if total_supply == 0 {
            (1, 1)
        } else {
            (total_assets, total_supply)
        }
    }

    pub fn simulate_yield(env: Env, amount: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        if amount <= 0 {
            panic!("amount must be positive");
        }
        let xlm_token: Address = env.storage().instance().get(&DataKey::XlmToken).unwrap();
        let xlm_client = TokenClient::new(&env, &xlm_token);
        let vault = env.current_contract_address();
        xlm_client.transfer(&admin, &vault, &amount);
        Self::_emit_exchange_rate(&env);
        YieldSimulatedEvent { amount }.publish(&env);
    }

    pub fn get_user_balance(env: Env, user: Address) -> i128 {
        let st_xlm: Address = env.storage().instance().get(&DataKey::StXlmToken).unwrap();
        let st_xlm_client = st_xlm_token::Client::new(&env, &st_xlm);
        st_xlm_client.balance(&user)
    }

    pub fn paused(env: Env) -> bool {
        env.storage()
            .instance()
            .get(&DataKey::Paused)
            .unwrap_or(false)
    }

    pub fn pause(env: Env) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        if Self::paused(env.clone()) {
            panic!("already paused");
        }
        env.storage().instance().set(&DataKey::Paused, &true);
        PausedEvent {}.publish(&env);
    }

    pub fn unpause(env: Env) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        if !Self::paused(env.clone()) {
            panic!("not paused");
        }
        env.storage().instance().set(&DataKey::Paused, &false);
        UnpausedEvent {}.publish(&env);
    }

    pub fn set_fee(env: Env, deposit_fee_bps: u32, withdraw_fee_bps: u32) {
        if deposit_fee_bps > 1000 || withdraw_fee_bps > 1000 {
            panic!("fee too high (max 10%)");
        }
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        env.storage()
            .instance()
            .set(&DataKey::DepositFeeBps, &deposit_fee_bps);
        env.storage()
            .instance()
            .set(&DataKey::WithdrawFeeBps, &withdraw_fee_bps);
        FeeUpdatedEvent {
            deposit_fee_bps,
            withdraw_fee_bps,
        }
        .publish(&env);
    }

    pub fn set_treasury(env: Env, new_treasury: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        env.storage()
            .instance()
            .set(&DataKey::Treasury, &new_treasury);
        TreasuryUpdatedEvent { new_treasury }.publish(&env);
    }

    pub fn admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }

    pub fn treasury(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Treasury).unwrap()
    }

    pub fn deposit_fee_bps(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::DepositFeeBps)
            .unwrap_or(0)
    }

    pub fn withdraw_fee_bps(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::WithdrawFeeBps)
            .unwrap_or(0)
    }

    fn _transfer_xlm_in(env: &Env, from: &Address, amount: i128) {
        let xlm_token: Address = env.storage().instance().get(&DataKey::XlmToken).unwrap();
        let xlm_client = TokenClient::new(env, &xlm_token);
        let vault = env.current_contract_address();
        xlm_client.transfer(from, &vault, &amount);
    }

    fn _transfer_xlm_out(env: &Env, to: &Address, amount: i128) {
        let xlm_token: Address = env.storage().instance().get(&DataKey::XlmToken).unwrap();
        let xlm_client = TokenClient::new(env, &xlm_token);
        let vault = env.current_contract_address();
        xlm_client.transfer(&vault, to, &amount);
    }

    fn _mint_st_xlm(env: &Env, to: &Address, amount: i128) {
        let st_xlm: Address = env.storage().instance().get(&DataKey::StXlmToken).unwrap();
        let st_xlm_client = st_xlm_token::Client::new(env, &st_xlm);
        st_xlm_client.mint(to, &amount);
    }

    fn _burn_st_xlm(env: &Env, from: &Address, amount: i128) {
        let st_xlm: Address = env.storage().instance().get(&DataKey::StXlmToken).unwrap();
        let st_xlm_client = st_xlm_token::Client::new(env, &st_xlm);
        st_xlm_client.burn(from, &amount);
    }

    fn _emit_exchange_rate(env: &Env) {
        let total_assets = Self::total_assets(env.clone());
        let total_supply = Self::total_supply(env.clone());
        if total_supply > 0 {
            ExchangeRateUpdatedEvent {
                old_rate_d0: 0,
                old_rate_d1: 0,
                new_rate_d0: total_assets,
                new_rate_d1: total_supply,
            }
            .publish(env);
        }
    }
}

#[cfg(test)]
mod test;
